// WoofScore barcode lookup + contribution.
// GET  /api/petfood?barcode=123  -> { found, source, name, brand, ingredients, hasIngredients }
// POST /api/petfood  {barcode,name,brand,ingredients} -> { ok }  (saves to our crowd DB)
// Lookup order: our Supabase store -> Open Pet Food Facts. Anon key is RLS-protected (public-safe).

const SUPA_URL = process.env.SUPABASE_URL || "https://frywbckyqmdixbemmwje.supabase.co";
const SUPA_KEY = process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyeXdiY2t5cW1kaXhiZW1td2plIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzNTUwOTcsImV4cCI6MjA4OTkzMTA5N30.ZMx4nJlNgDjEFe46YXkeGeqEXpjROBq9u3S-0Xb_Swg";
const TABLE = "woofscore_barcodes";

function clean(bc){ return String(bc || "").replace(/[^0-9]/g, "").slice(0, 20); }

async function upsert(row){
  try{
    await fetch(`${SUPA_URL}/rest/v1/${TABLE}`, {
      method:"POST",
      headers:{ apikey:SUPA_KEY, Authorization:"Bearer "+SUPA_KEY, "Content-Type":"application/json", Prefer:"resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify(row)
    });
  }catch{}
}

async function fromSupabase(code){
  const u = `${SUPA_URL}/rest/v1/${TABLE}?barcode=eq.${code}&select=barcode,product_name,brand,ingredients,source&limit=1`;
  const r = await fetch(u, { headers: { apikey: SUPA_KEY, Authorization: "Bearer " + SUPA_KEY } });
  if(!r.ok) return null;
  const rows = await r.json().catch(()=>[]);
  return rows && rows[0] ? rows[0] : null;
}
async function fromOPFF(code){
  const u = `https://world.openpetfoodfacts.org/api/v2/product/${code}.json?fields=product_name,brands,ingredients_text,ingredients_text_en`;
  const ctrl = new AbortController(); const t = setTimeout(()=>ctrl.abort(), 9000);
  try{
    const r = await fetch(u, { headers: { "User-Agent": "WoofScore/1.0 (https://woofscore.com)" }, signal: ctrl.signal });
    if(!r.ok) return null;
    const d = await r.json().catch(()=>null);
    if(!d || d.status !== 1 || !d.product) return null;
    const p = d.product;
    return { name: p.product_name || "", brand: p.brands || "", ingredients: (p.ingredients_text || p.ingredients_text_en || "").trim() };
  } catch { return null; } finally { clearTimeout(t); }
}

module.exports = async function handler(req, res){
  try{
    if(req.method === "GET"){
      const code = clean(req.query && req.query.barcode);
      if(code.length < 6){ res.status(400).json({ found:false, error:"Invalid barcode" }); return; }
      const mine = await fromSupabase(code);
      if(mine && mine.ingredients){
        res.status(200).json({ found:true, source:"woofscore", name:mine.product_name||"", brand:mine.brand||"", ingredients:mine.ingredients, hasIngredients:true });
        return;
      }
      const off = await fromOPFF(code);
      if(off){
        if(off.ingredients && off.ingredients.length >= 10){
          await upsert({ barcode:code, product_name:(off.name||"").slice(0,200), brand:(off.brand||"").slice(0,120), ingredients:off.ingredients, source:"openpetfoodfacts" });
        }
        res.status(200).json({ found:true, source:"openpetfoodfacts", name:off.name, brand:off.brand, ingredients:off.ingredients, hasIngredients: !!off.ingredients });
        return;
      }
      res.status(200).json({ found:false, hasIngredients:false });
      return;
    }
    if(req.method === "POST"){
      let body = req.body; if(typeof body === "string"){ try{ body = JSON.parse(body); }catch{ body = {}; } }
      body = body || {};
      const code = clean(body.barcode);
      const ingredients = String(body.ingredients || "").trim();
      if(code.length < 6){ res.status(400).json({ ok:false, error:"Invalid barcode" }); return; }
      if(ingredients.length < 10){ res.status(400).json({ ok:false, error:"Ingredients too short" }); return; }
      if(ingredients.length > 8000){ res.status(400).json({ ok:false, error:"Ingredients too long" }); return; }
      const r = await fetch(`${SUPA_URL}/rest/v1/${TABLE}`, {
        method:"POST",
        headers:{ apikey:SUPA_KEY, Authorization:"Bearer "+SUPA_KEY, "Content-Type":"application/json", Prefer:"resolution=merge-duplicates,return=minimal" },
        body: JSON.stringify({ barcode:code, product_name:String(body.name||"").slice(0,200), brand:String(body.brand||"").slice(0,120), ingredients, source:"user" })
      });
      if(!r.ok){ const txt = await r.text().catch(()=> ""); res.status(502).json({ ok:false, error:"Save failed", detail:txt.slice(0,200) }); return; }
      res.status(200).json({ ok:true });
      return;
    }
    res.status(405).json({ error:"Method not allowed" });
  } catch(e){
    res.status(500).json({ error: "Server error: " + (e && e.message || String(e)) });
  }
};
