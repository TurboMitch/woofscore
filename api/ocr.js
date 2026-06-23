// WoofScore OCR — extract a dog-food ingredient list from a photo using a cheap vision model.
// POST /api/ocr  { image: "data:image/jpeg;base64,..." }  -> { ok, text, none }
// Requires Vercel env: OPENROUTER_API_KEY. Optional: OCR_MODEL (default google/gemini-2.5-flash).

const PROMPT = "You are an OCR tool for dog-food packaging. Read the photo and output ONLY the product's INGREDIENTS list as a single comma-separated line, in the original order. Do not include the word 'Ingredients', guaranteed analysis, nutrition facts, feeding directions, marketing text, or any commentary. Keep ingredient names exactly as printed. If there is no ingredients list visible, output exactly: NONE";

module.exports = async function handler(req, res){
  if(req.method !== "POST"){ res.status(405).json({ ok:false, error:"Method not allowed" }); return; }
  const KEY = process.env.OPENROUTER_API_KEY;
  if(!KEY){ res.status(500).json({ ok:false, error:"OCR not configured (set OPENROUTER_API_KEY in Vercel)" }); return; }
  let body = req.body; if(typeof body === "string"){ try{ body = JSON.parse(body); }catch{ body = {}; } }
  body = body || {};
  const image = body.image || "";
  if(!/^data:image\/(jpeg|jpg|png|webp);base64,/.test(image)){ res.status(400).json({ ok:false, error:"Invalid image" }); return; }
  if(image.length > 8_000_000){ res.status(413).json({ ok:false, error:"Image too large — try again" }); return; }
  const model = process.env.OCR_MODEL || "google/gemini-2.5-flash";
  try{
    const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method:"POST",
      headers:{ Authorization:"Bearer "+KEY, "Content-Type":"application/json", "HTTP-Referer":"https://woofscore.com", "X-Title":"WoofScore" },
      body: JSON.stringify({
        model,
        messages:[{ role:"user", content:[ { type:"text", text:PROMPT }, { type:"image_url", image_url:{ url:image } } ] }],
        max_tokens: 1200, temperature: 0
      })
    });
    const data = await r.json().catch(()=> ({}));
    if(!r.ok){ res.status(502).json({ ok:false, error:(data && data.error && data.error.message) || ("OCR error " + r.status) }); return; }
    let text = ((data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || "").trim();
    text = text.replace(/^ingredients?\s*[:\-]\s*/i, "").trim();
    if(!text || /^none$/i.test(text)){ res.status(200).json({ ok:true, text:"", none:true }); return; }
    res.status(200).json({ ok:true, text });
  } catch(e){
    res.status(500).json({ ok:false, error:"OCR failed: " + (e && e.message || String(e)) });
  }
};
