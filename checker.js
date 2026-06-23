/* WoofScore — dog food ingredient quality engine + database.
   tier: g=great, k=good, n=neutral, w=watch (controversial), b=bad (avoid).
   p:1 = named animal protein (counts for the "first ingredient" bonus).
   Ratings are general guidance compiled from public pet-food references; not veterinary advice. */
const DB = [
  // ---- Named animal proteins (great) ----
  {n:"Chicken",t:"g",p:1,c:"Protein",a:["chicken","deboned chicken","fresh chicken"],r:"Named whole protein — excellent first ingredient."},
  {n:"Chicken Meal",t:"g",p:1,c:"Protein",a:["chicken meal"],r:"Named meat meal — concentrated, high-quality protein."},
  {n:"Beef",t:"g",p:1,c:"Protein",a:["beef","deboned beef"],r:"Named whole protein."},
  {n:"Beef Meal",t:"g",p:1,c:"Protein",a:["beef meal"],r:"Named meat meal — good protein source."},
  {n:"Lamb",t:"g",p:1,c:"Protein",a:["lamb","deboned lamb"],r:"Named whole protein, good for sensitivities."},
  {n:"Lamb Meal",t:"g",p:1,c:"Protein",a:["lamb meal"],r:"Named meat meal."},
  {n:"Turkey",t:"g",p:1,c:"Protein",a:["turkey","deboned turkey"],r:"Named lean protein."},
  {n:"Turkey Meal",t:"g",p:1,c:"Protein",a:["turkey meal"],r:"Named meat meal."},
  {n:"Salmon",t:"g",p:1,c:"Protein",a:["salmon","deboned salmon"],r:"Named fish — rich in omega-3s."},
  {n:"Salmon Meal",t:"g",p:1,c:"Protein",a:["salmon meal"],r:"Named fish meal — protein + omega-3s."},
  {n:"Whitefish",t:"g",p:1,c:"Protein",a:["whitefish","ocean fish","menhaden fish meal","herring meal"],r:"Named fish protein."},
  {n:"Duck",t:"g",p:1,c:"Protein",a:["duck","duck meal"],r:"Named novel protein."},
  {n:"Venison",t:"g",p:1,c:"Protein",a:["venison","venison meal"],r:"Named novel protein."},
  {n:"Bison",t:"g",p:1,c:"Protein",a:["bison","buffalo"],r:"Named novel protein."},
  {n:"Pork",t:"g",p:1,c:"Protein",a:["pork","pork meal"],r:"Named protein."},
  {n:"Rabbit",t:"g",p:1,c:"Protein",a:["rabbit"],r:"Named novel protein."},
  {n:"Eggs",t:"g",p:1,c:"Protein",a:["egg","eggs","dried egg","whole eggs","egg product"],r:"Highly digestible complete protein."},
  {n:"Liver",t:"g",p:1,c:"Protein",a:["chicken liver","beef liver","liver"],r:"Named organ meat — nutrient dense."},
  {n:"Sardine",t:"g",p:1,c:"Protein",a:["sardine","mackerel","anchovy"],r:"Named oily fish — omega-3s."},

  // ---- Unnamed / low-quality proteins (watch/bad) ----
  {n:"Meat Meal (unnamed)",t:"w",c:"Protein",a:["meat meal","meat and bone meal","animal meal"],r:"Unnamed source — you can't tell what animal it's from."},
  {n:"Meat By-Product Meal",t:"w",c:"Protein",a:["meat by-product meal","poultry by-product meal","chicken by-product meal","by-product meal","by product meal"],r:"Unnamed by-products — variable, low-transparency protein."},
  {n:"Animal By-Products",t:"w",c:"Protein",a:["animal by-products","by-products","by products"],r:"Vague, unnamed parts."},
  {n:"Animal Digest",t:"b",c:"Additive",a:["animal digest","digest"],r:"Vague flavour spray from unspecified tissue."},
  {n:"Animal Fat (unnamed)",t:"w",c:"Fat",a:["animal fat","poultry fat"],r:"Unnamed fat source — quality varies."},

  // ---- Healthy carbs & whole grains (good) ----
  {n:"Brown Rice",t:"k",c:"Carb",a:["brown rice"],r:"Digestible whole-grain carb."},
  {n:"Oatmeal",t:"k",c:"Carb",a:["oatmeal","oats","whole oats","ground oats"],r:"Gentle whole-grain fibre source."},
  {n:"Barley",t:"k",c:"Carb",a:["barley","pearled barley"],r:"Whole grain, good fibre."},
  {n:"Sweet Potato",t:"g",c:"Veg",a:["sweet potato","sweet potatoes","dried sweet potato"],r:"Nutritious complex carb with fibre."},
  {n:"Potato",t:"n",c:"Carb",a:["potato","potatoes","dried potato"],r:"Fine carb in moderation."},
  {n:"Quinoa",t:"k",c:"Carb",a:["quinoa"],r:"Whole-grain complete protein source."},
  {n:"Millet",t:"k",c:"Carb",a:["millet"],r:"Gentle whole grain."},
  {n:"Sorghum",t:"k",c:"Carb",a:["sorghum","milo"],r:"Whole grain, lower glycemic."},
  {n:"White Rice",t:"n",c:"Carb",a:["white rice","rice"],r:"Digestible but lower fibre than brown rice."},
  {n:"Brewers Rice",t:"w",c:"Filler",a:["brewers rice","brewer's rice"],r:"Milling fragment — cheaper filler, low nutrition."},
  {n:"Tapioca",t:"n",c:"Carb",a:["tapioca","tapioca starch"],r:"Grain-free starch binder; mostly calories."},

  // ---- Controversial fillers / grains (watch) ----
  {n:"Corn",t:"w",c:"Carb",a:["corn","ground corn","whole corn","yellow corn"],r:"Cheap carb; fine for many dogs but often a filler."},
  {n:"Corn Gluten Meal",t:"w",c:"Filler",a:["corn gluten meal"],r:"Plant protein booster that inflates protein numbers."},
  {n:"Wheat",t:"w",c:"Carb",a:["wheat","ground wheat","wheat flour"],r:"Common cheap carb and allergen for some dogs."},
  {n:"Wheat Gluten",t:"w",c:"Filler",a:["wheat gluten"],r:"Plant protein filler."},
  {n:"Wheat Middlings",t:"w",c:"Filler",a:["wheat middlings","wheat mill run"],r:"Low-cost milling by-product filler."},
  {n:"Soy",t:"w",c:"Filler",a:["soy","soybean meal","soybean","soy flour"],r:"Cheap plant protein; common allergen."},
  {n:"Cellulose",t:"w",c:"Filler",a:["cellulose","powdered cellulose"],r:"Often wood pulp — calorie-free bulk fibre."},
  {n:"Beet Pulp",t:"n",c:"Fiber",a:["beet pulp","dried beet pulp"],r:"Fibre source; debated but generally fine."},
  {n:"Pea Protein",t:"w",c:"Filler",a:["pea protein"],r:"Inflates protein %; part of the grain-free/DCM discussion."},
  {n:"Peas",t:"n",c:"Veg",a:["peas","pea","field peas","green peas"],r:"Fine in moderation; heavy legume use is debated (DCM)."},
  {n:"Lentils",t:"n",c:"Veg",a:["lentils","red lentils"],r:"Legume; fine in moderation, watch heavy use."},
  {n:"Chickpeas",t:"n",c:"Veg",a:["chickpeas","garbanzo beans"],r:"Legume; moderate is fine."},

  // ---- Healthy fats & omega sources (great/good) ----
  {n:"Salmon Oil",t:"g",c:"Fat",a:["salmon oil","fish oil"],r:"Excellent omega-3 (EPA/DHA) source."},
  {n:"Flaxseed",t:"g",c:"Fat",a:["flaxseed","flax","ground flaxseed","linseed"],r:"Plant omega-3 and fibre."},
  {n:"Chicken Fat",t:"k",c:"Fat",a:["chicken fat"],r:"Named fat — palatable energy and omega-6."},
  {n:"Sunflower Oil",t:"k",c:"Fat",a:["sunflower oil"],r:"Named oil, omega-6 source."},
  {n:"Coconut Oil",t:"k",c:"Fat",a:["coconut oil"],r:"Named fat (MCTs)."},
  {n:"Canola Oil",t:"n",c:"Fat",a:["canola oil"],r:"Acceptable named oil."},

  // ---- Fruits, veg & superfoods (great/good) ----
  {n:"Blueberries",t:"g",c:"Fruit",a:["blueberries","blueberry"],r:"Antioxidant-rich superfruit."},
  {n:"Cranberries",t:"g",c:"Fruit",a:["cranberries","cranberry"],r:"Antioxidants; urinary support."},
  {n:"Carrots",t:"g",c:"Veg",a:["carrots","carrot","dried carrots"],r:"Beta-carotene and fibre."},
  {n:"Pumpkin",t:"g",c:"Veg",a:["pumpkin","dried pumpkin"],r:"Gentle fibre, good for digestion."},
  {n:"Spinach",t:"k",c:"Veg",a:["spinach"],r:"Leafy greens, vitamins."},
  {n:"Apples",t:"k",c:"Fruit",a:["apples","apple","dried apples"],r:"Fibre and vitamins."},
  {n:"Cranberry/Blueberry Mix",t:"k",c:"Fruit",a:["mixed berries"],r:"Antioxidant blend."},
  {n:"Kelp",t:"k",c:"Supplement",a:["kelp","dried kelp"],r:"Natural source of minerals and iodine."},
  {n:"Parsley",t:"k",c:"Veg",a:["parsley"],r:"Herb, breath/antioxidant support."},
  {n:"Tomato Pomace",t:"n",c:"Fiber",a:["tomato pomace"],r:"Fibre by-product; neutral filler."},
  {n:"Alfalfa",t:"n",c:"Fiber",a:["alfalfa","alfalfa meal"],r:"Plant fibre/protein; neutral."},

  // ---- Beneficial supplements (great/good) ----
  {n:"Glucosamine",t:"g",c:"Supplement",a:["glucosamine","glucosamine hydrochloride"],r:"Supports joint health."},
  {n:"Chondroitin",t:"g",c:"Supplement",a:["chondroitin","chondroitin sulfate"],r:"Joint support."},
  {n:"Probiotics",t:"g",c:"Supplement",a:["probiotics","dried lactobacillus","bacillus coagulans","enterococcus faecium","dried fermentation products"],r:"Supports gut and digestion."},
  {n:"Prebiotics (FOS)",t:"k",c:"Supplement",a:["fructooligosaccharides","fos","chicory root","inulin"],r:"Feeds healthy gut bacteria."},
  {n:"Taurine",t:"g",c:"Supplement",a:["taurine"],r:"Important amino acid for heart health."},
  {n:"L-Carnitine",t:"k",c:"Supplement",a:["l-carnitine","carnitine"],r:"Supports metabolism/lean mass."},
  {n:"Vitamin E",t:"k",c:"Supplement",a:["vitamin e","mixed tocopherols","tocopherols"],r:"Natural antioxidant and preservative."},
  {n:"Vitamin C",t:"k",c:"Supplement",a:["vitamin c","ascorbic acid"],r:"Antioxidant."},
  {n:"Rosemary Extract",t:"k",c:"Preservative",a:["rosemary extract","rosemary"],r:"Natural antioxidant preservative."},
  {n:"Yucca Schidigera",t:"n",c:"Supplement",a:["yucca schidigera","yucca"],r:"May reduce stool odour; neutral."},

  // ---- Controversial additives (watch) ----
  {n:"Menadione (Vitamin K3)",t:"w",c:"Additive",a:["menadione","menadione sodium bisulfite","vitamin k3","menadione sodium bisulfite complex"],r:"Synthetic vitamin K banned in some human uses; debated in pet food."},
  {n:"Carrageenan",t:"w",c:"Additive",a:["carrageenan"],r:"Thickener linked to gut inflammation in some studies (mostly wet food)."},
  {n:"Natural Flavor",t:"n",c:"Additive",a:["natural flavor","natural flavour","flavor"],r:"Vague but usually harmless palatant."},
  {n:"Salt",t:"n",c:"Additive",a:["salt","sodium chloride"],r:"Needed in small amounts; fine unless very high."},
  {n:"Garlic",t:"w",c:"Additive",a:["garlic","garlic powder"],r:"Tiny amounts are debated; larger amounts are toxic to dogs."},
  {n:"Onion",t:"b",c:"Additive",a:["onion","onion powder"],r:"Toxic to dogs — should not be in dog food."},
  {n:"Sodium Tripolyphosphate",t:"w",c:"Additive",a:["sodium tripolyphosphate"],r:"Processing additive; better avoided."},
  {n:"Guar Gum",t:"n",c:"Additive",a:["guar gum"],r:"Thickener; generally fine in moderation."},
  {n:"Xanthan Gum",t:"n",c:"Additive",a:["xanthan gum"],r:"Thickener; generally fine."},
  {n:"Glycerin",t:"n",c:"Additive",a:["glycerin","vegetable glycerin"],r:"Humectant; fine unless from low-quality source."},

  // ---- Artificial preservatives & sweeteners (bad) ----
  {n:"BHA",t:"b",c:"Preservative",a:["bha","butylated hydroxyanisole"],r:"Artificial preservative; flagged as a possible carcinogen — avoid."},
  {n:"BHT",t:"b",c:"Preservative",a:["bht","butylated hydroxytoluene"],r:"Artificial preservative — avoid."},
  {n:"Ethoxyquin",t:"b",c:"Preservative",a:["ethoxyquin"],r:"Controversial chemical preservative (often hidden in fish meal) — avoid."},
  {n:"Propyl Gallate",t:"b",c:"Preservative",a:["propyl gallate"],r:"Artificial preservative — avoid."},
  {n:"Propylene Glycol",t:"b",c:"Additive",a:["propylene glycol"],r:"Moisture/antifreeze-related additive — avoid in dog food."},
  {n:"Corn Syrup",t:"b",c:"Sweetener",a:["corn syrup","high fructose corn syrup"],r:"Added sugar — no place in dog food."},
  {n:"Sugar",t:"b",c:"Sweetener",a:["sugar","sucrose","cane molasses","molasses"],r:"Added sugar — empty calories, dental issues."},
  {n:"Sorbitol",t:"w",c:"Sweetener",a:["sorbitol"],r:"Sugar alcohol; better avoided."},
  {n:"MSG",t:"b",c:"Additive",a:["msg","monosodium glutamate"],r:"Flavour enhancer with no nutritional value."},
  {n:"Titanium Dioxide",t:"b",c:"Additive",a:["titanium dioxide"],r:"Whitening agent under safety scrutiny — avoid."},

  // ---- Artificial colors (bad) ----
  {n:"Red 40",t:"b",c:"Color",a:["red 40","red dye 40","fd&c red no. 40","allura red"],r:"Artificial dye — purely cosmetic, best avoided."},
  {n:"Yellow 5",t:"b",c:"Color",a:["yellow 5","yellow dye 5","tartrazine","fd&c yellow no. 5"],r:"Artificial dye — cosmetic only."},
  {n:"Yellow 6",t:"b",c:"Color",a:["yellow 6","fd&c yellow no. 6","sunset yellow"],r:"Artificial dye — cosmetic only."},
  {n:"Blue 2",t:"b",c:"Color",a:["blue 2","fd&c blue no. 2","indigotine"],r:"Artificial dye — cosmetic only."},
  {n:"Caramel Color",t:"w",c:"Color",a:["caramel color","caramel colour"],r:"Cosmetic colouring; unnecessary."},
  {n:"Artificial Color",t:"b",c:"Color",a:["artificial color","artificial colors","artificial coloring","added color"],r:"Dyes serve the human buyer, not the dog."},
  {n:"Titanium Dioxide Color",t:"b",c:"Color",a:["color added"],r:"Cosmetic colouring."},

  // ---- Common neutral binders/minerals ----
  {n:"Dicalcium Phosphate",t:"n",c:"Mineral",a:["dicalcium phosphate"],r:"Calcium/phosphorus source; standard."},
  {n:"Calcium Carbonate",t:"n",c:"Mineral",a:["calcium carbonate"],r:"Calcium source; standard."},
  {n:"Potassium Chloride",t:"n",c:"Mineral",a:["potassium chloride"],r:"Standard mineral."},
  {n:"Choline Chloride",t:"n",c:"Supplement",a:["choline chloride"],r:"Standard nutrient."},
  {n:"Zinc Proteinate",t:"k",c:"Mineral",a:["zinc proteinate","zinc amino acid chelate","chelated minerals","proteinated minerals"],r:"Chelated minerals — more bioavailable form."},
  {n:"Zinc Sulfate",t:"n",c:"Mineral",a:["zinc sulfate","iron sulfate","copper sulfate","manganese sulfate"],r:"Standard mineral form."},
  {n:"Water",t:"n",c:"Other",a:["water","water sufficient for processing"],r:"Common in wet food; neutral."},
  {n:"Dried Plain Beet",t:"n",c:"Fiber",a:["dried beet"],r:"Fibre source."}
];

const lookup = {};
DB.forEach(it => it.a.forEach(al => lookup[al] = it));
const TIERVAL = {g:4, k:2, n:0, w:-3, b:-7};
const TIERLABEL = {g:"Great", k:"Good", n:"Neutral", w:"Watch", b:"Avoid"};

function normalize(s){return s.toLowerCase().replace(/\([^)]*\)/g,' ').replace(/[^a-z0-9&/\-\s]/g,' ').replace(/\s+/g,' ').trim();}
function parseList(raw){return raw.split(/[,;\n•·]+/).map(x=>x.trim()).filter(Boolean);}
function match(token){
  const n = normalize(token);
  if(lookup[n]) return lookup[n];
  for(const al in lookup){ if(n === al) return lookup[al]; }
  for(const al in lookup){ if(al.length>4 && n.includes(al)) return lookup[al]; }
  return null;
}
function gradeFor(score){
  if(score>=90)return["A","#13A06B"]; if(score>=83)return["A-","#13A06B"];
  if(score>=76)return["B+","#3FA15B"]; if(score>=68)return["B","#5FA53A"];
  if(score>=60)return["C+","#C9912A"]; if(score>=52)return["C","#E0A21F"];
  if(score>=44)return["D","#E07B36"]; return["F","#E0503C"];
}

// "Can dogs eat X" foods — used to route single-food queries to the right page.
const FOODS_CDE=[["Chocolate","chocolate"],["Grapes","grapes"],["Raisins","raisins"],["Onion","onion"],["Garlic","garlic"],["Xylitol","xylitol"],["Macadamia nuts","macadamia-nuts"],["Alcohol","alcohol"],["Caffeine","caffeine"],["Cherries","cherries"],["Avocado","avocado"],["Nutmeg","nutmeg"],["Strawberries","strawberries"],["Bananas","bananas"],["Blueberries","blueberries"],["Watermelon","watermelon"],["Apples","apples"],["Carrots","carrots"],["Cucumber","cucumber"],["Green beans","green-beans"],["Pumpkin","pumpkin"],["Sweet potato","sweet-potato"],["Peanut butter","peanut-butter"],["Cheese","cheese"],["Yogurt","yogurt"],["Eggs","eggs"],["Chicken","chicken"],["Salmon","salmon"],["Broccoli","broccoli"],["Celery","celery"],["Peas","peas"],["Mango","mango"],["Pineapple","pineapple"],["Oranges","oranges"],["Peaches","peaches"],["Pears","pears"],["Raspberries","raspberries"],["Blackberries","blackberries"],["Cantaloupe","cantaloupe"],["Potatoes","potatoes"],["Rice","rice"],["Oatmeal","oatmeal"],["Popcorn","popcorn"],["Coconut","coconut"],["Spinach","spinach"],["Corn","corn"],["Turkey","turkey"],["Shrimp","shrimp"],["Bread","bread"],["Honey","honey"],["Almonds","almonds"],["Tomatoes","tomatoes"],["Mushrooms","mushrooms"],["Pork","pork"],["Ice cream","ice-cream"]];
const foodLookup={};
FOODS_CDE.forEach(([n,s])=>{const k=n.toLowerCase();[k,k.replace(/s$/,''),k+'s'].forEach(a=>{if(!(a in foodLookup))foodLookup[a]=[n,s];});});
function findFood(raw){const k=normalize(raw).trim();return foodLookup[k]||foodLookup[k.replace(/s$/,'')]||foodLookup[k+'s']||null;}

function checkFood(){
  const ta=document.getElementById('ingredients'), res=document.getElementById('results');
  if(!ta||!res)return; const raw=ta.value; if(!raw.trim()){res.classList.add('hidden');return;}
  const tokens=parseList(raw);
  let posScore=0, firstBonus=0, watchPen=0, badPen=0, matched=[], bad=[], watch=[], great=[], unknown=[]; const seen=new Set();
  tokens.forEach((t,i)=>{
    const m=match(t);
    if(m){
      if(seen.has(m.n))return; seen.add(m.n);
      if(m.t==="g"||m.t==="k"){ const pos=Math.max(0.4, 1 - i*0.05); posScore += TIERVAL[m.t]*pos; }
      else if(m.t==="w"){ watchPen += 3; }
      else if(m.t==="b"){ badPen += 9; }
      if(i===0 && m.t==="g" && m.p) firstBonus=12;
      if(i===0 && (m.t==="w"||m.t==="b")) firstBonus=-12;
      matched.push({m,i});
      if(m.t==="b")bad.push(m); else if(m.t==="w")watch.push(m); else if(m.t==="g")great.push(m);
    } else { const k=normalize(t); if(k && !seen.has(k)){seen.add(k); unknown.push(t.trim());} }
  });
  if(matched.length===0){
    const f=findFood(raw);
    let h;
    if(f){
      const fn=escapeHtml(f[0].toLowerCase());
      h='<div class="rh-grade">Did you mean: can dogs eat '+fn+'?</div>'+
        '<p class="muted" style="margin-top:6px">This tool grades a dog food\'s full <b>ingredient list</b>. For a single food like this, here\'s the safe-or-not answer:</p>'+
        '<p style="margin-top:12px"><a class="btn btn-primary" style="text-decoration:none" href="/can-dogs-eat/'+f[1]+'.html">Can dogs eat '+fn+'? →</a></p>';
    } else {
      h='<div class="rh-grade">We couldn\'t recognise any ingredients</div>'+
        '<p class="muted" style="margin-top:6px">Paste a dog food\'s full ingredient list straight off the bag — for example:<br><em>Chicken, Brown Rice, Chicken Meal, Chicken Fat, Sweet Potato, Flaxseed…</em></p>'+
        '<p class="muted small" style="margin-top:10px">Or browse the <a href="/dog-food-ingredients.html">ingredient database</a>, or check <a href="/can-dogs-eat.html">can dogs eat…</a> for a single food.</p>';
    }
    res.innerHTML='<div class="result-head" style="align-items:flex-start"><div>'+h+'</div></div>';
    res.classList.remove('hidden'); res.scrollIntoView({behavior:'smooth',block:'start'});
    return;
  }
  let score = 58 + posScore + firstBonus - watchPen - badPen;
  if(bad.length>=1) score=Math.min(score,73);   // any avoid-tier ingredient caps the grade
  if(bad.length>=2) score=Math.min(score,55);
  if(bad.length>=3) score=Math.min(score,42);
  score=Math.round(Math.max(5,Math.min(98,score)));
  const [grade,color]=gradeFor(score);
  const pct=Math.max(5,Math.min(96, Math.round(score*0.95)));
  const dash=314, off=Math.round(dash*(1-score/100));

  let html='<div class="result-head">'+
    '<svg class="ring" viewBox="0 0 120 120"><circle cx="60" cy="60" r="50" fill="none" stroke="#EFEFE9" stroke-width="12"/>'+
    '<circle cx="60" cy="60" r="50" fill="none" stroke="'+color+'" stroke-width="12" stroke-linecap="round" stroke-dasharray="'+dash+'" stroke-dashoffset="'+off+'" transform="rotate(-90 60 60)"/>'+
    '<text x="60" y="68" text-anchor="middle" font-size="34" font-weight="800" fill="'+color+'">'+grade+'</text></svg>'+
    '<div><div class="rh-grade">WoofScore: '+grade+' <span class="muted">('+score+'/100)</span></div>'+
    '<div class="muted">'+verdictText(score, bad.length, watch.length)+'</div>'+
    '<div class="rh-stats"><span class="stat good">'+great.length+' great</span><span class="stat warn">'+watch.length+' to watch</span><span class="stat bad">'+bad.length+' to avoid</span></div></div></div>';

  if(bad.length) html+=section('🔴 Ingredients to avoid', bad);
  if(watch.length) html+=section('🟡 Controversial — worth watching', watch);
  if(great.length) html+=section('🟢 Great ingredients', great.slice(0,8));
  if(unknown.length){
    html+='<h4 class="rsec">⚪ Not in our database ('+unknown.length+')</h4><p class="muted small">'+unknown.map(escapeHtml).join(', ')+'</p>';
  }
  if(tokens.length===1){ const f=findFood(raw); if(f) html+='<p class="muted small" style="margin-top:10px">Wondering if dogs can eat '+escapeHtml(f[0].toLowerCase())+' as a treat? See <a href="/can-dogs-eat/'+f[1]+'.html">can dogs eat '+escapeHtml(f[0].toLowerCase())+'</a>.</p>'; }
  html+='<p class="muted small" style="margin-top:14px">WoofScore is an ingredient-level analysis against AAFCO, FDA &amp; veterinary-nutrition criteria — informational only, not veterinary advice. Always consult your vet about your dog\'s diet.</p>';
  res.innerHTML=html; res.classList.remove('hidden'); res.scrollIntoView({behavior:'smooth',block:'start'});
}
function verdictText(s,b,w){
  if(s>=83) return "Excellent — one of the better foods you can feed.";
  if(s>=68) return b?("Good overall, but "+b+" ingredient"+(b>1?"s":"")+" to avoid."):"Good quality with mostly solid ingredients.";
  if(s>=52) return "Average — some fillers or additives drag it down.";
  return "Poor — multiple low-quality or controversial ingredients.";
}
function pill(t){return '<span class="pill '+(t==='b'?'bad':t==='w'?'warn':'good')+'">'+TIERLABEL[t]+'</span>';}
function section(title,arr){
  let s='<h4 class="rsec">'+title+'</h4>';
  arr.forEach(m=>{ s+='<div class="flag"><div><div class="fname">'+m.n+'</div><div class="muted small">'+m.r+'</div></div>'+pill(m.t)+'</div>'; });
  return s;
}
function escapeHtml(s){return s.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}
function clearFood(){const ta=document.getElementById('ingredients');if(ta)ta.value='';const r=document.getElementById('results');if(r)r.classList.add('hidden');}
function loadSample(){const ta=document.getElementById('ingredients');if(!ta)return;
  ta.value="Chicken, Brown Rice, Chicken Meal, Oatmeal, Chicken Fat, Sweet Potato, Flaxseed, Salmon Oil, Blueberries, Carrots, Menadione Sodium Bisulfite, Caramel Color, BHA, Glucosamine";
  checkFood();}
