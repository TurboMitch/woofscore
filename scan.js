/* WoofScore scan & OCR — camera barcode scan (ZXing) + photo OCR + Open Pet Food Facts lookup
   + crowd contribution. Degrades gracefully: missing camera -> manual entry; miss -> paste + save. */
(function(){
  let controls=null, pendingBarcode="", pendingName="";
  const $=s=>document.querySelector(s);

  // ---------- styles ----------
  const css=`
  .ws-toast{position:fixed;left:50%;bottom:24px;transform:translateX(-50%);background:#1B2A24;color:#fff;padding:11px 16px;border-radius:12px;font:14px/1.4 system-ui;z-index:90;max-width:90%;box-shadow:0 8px 24px rgba(0,0,0,.2)}
  .ws-modal{position:fixed;inset:0;background:rgba(15,23,20,.86);z-index:80;display:none;align-items:center;justify-content:center}
  .ws-modal.on{display:flex}
  .ws-box{background:#fff;border-radius:18px;padding:14px;width:94%;max-width:460px}
  .ws-box h3{margin:4px 0 8px;font:700 17px system-ui;color:#1B2A24}
  .ws-vidwrap{position:relative;background:#000;border-radius:12px;overflow:hidden;aspect-ratio:4/3}
  .ws-vidwrap video{width:100%;height:100%;object-fit:cover}
  .ws-reticle{position:absolute;inset:18% 10%;border:3px solid rgba(255,255,255,.85);border-radius:12px;box-shadow:0 0 0 100vmax rgba(0,0,0,.15)}
  .ws-row{display:flex;gap:8px;margin-top:10px}
  .ws-row input{flex:1;border:1px solid #D9D9D0;border-radius:10px;padding:10px 12px;font:15px system-ui}
  .ws-btn{font:700 14px system-ui;border:1px solid #D9D9D0;background:#fff;border-radius:10px;padding:9px 14px;cursor:pointer}
  .ws-btn.p{background:#13A06B;color:#fff;border-color:#13A06B}
  .ws-tools{display:flex;gap:10px;flex-wrap:wrap;margin-top:10px}
  .ws-tools .ws-btn{display:inline-flex;align-items:center;gap:7px}
  .ws-contrib{margin-top:12px;background:#FFF7E6;border:1px solid #E9D8A6;border-radius:12px;padding:12px 14px;display:none}
  .ws-contrib.on{display:block}
  .ws-busy{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#fff;font:600 14px system-ui;background:rgba(0,0,0,.45)}
  `;
  const st=document.createElement('style'); st.textContent=css; document.head.appendChild(st);

  // ---------- toast ----------
  let toastEl;
  function toast(msg,ms=2800){ if(toastEl)toastEl.remove(); toastEl=document.createElement('div'); toastEl.className='ws-toast'; toastEl.textContent=msg; document.body.appendChild(toastEl); setTimeout(()=>{toastEl&&toastEl.remove();},ms); }

  // ---------- modal ----------
  const modal=document.createElement('div'); modal.className='ws-modal';
  modal.innerHTML=`<div class="ws-box">
    <h3>Scan the barcode</h3>
    <div class="ws-vidwrap"><video id="ws-video" playsinline muted></video><div class="ws-reticle"></div><div class="ws-busy" id="ws-busy" style="display:none">Starting camera…</div></div>
    <div class="ws-row"><input id="ws-manual" inputmode="numeric" placeholder="…or type the barcode number"><button class="ws-btn p" id="ws-manualgo">Look up</button></div>
    <div class="ws-row" style="justify-content:flex-end"><button class="ws-btn" id="ws-close">Cancel</button></div>
  </div>`;
  document.body.appendChild(modal);
  $('#ws-close').onclick=closeScanner;
  $('#ws-manualgo').onclick=()=>{ const v=($('#ws-manual').value||'').replace(/[^0-9]/g,''); if(v.length>=6){ closeScanner(); lookup(v); } else toast('Enter a valid barcode number.'); };

  // ---------- contribution bar (under the checker card) ----------
  const contrib=document.createElement('div'); contrib.className='ws-contrib';
  contrib.innerHTML=`<b>🆕 New product</b> <span id="ws-cb-code" class="muted"></span><div style="margin:6px 0 10px;font-size:13.5px">We don't have this one's ingredients yet. Paste them into the box above, then save it so the next owner gets an instant score.</div><button class="ws-btn p" id="ws-save">Save to WoofScore</button> <span id="ws-saved" style="margin-left:8px;color:#0E7C53;font-weight:700"></span>`;
  function mountContrib(){
    const card=document.querySelector('.checkcard');
    if(card && !document.body.contains(contrib)) card.parentNode.insertBefore(contrib, card.nextSibling);
  }
  document.addEventListener('DOMContentLoaded',mountContrib); mountContrib();
  contrib.querySelector('#ws-save').onclick=contribute;

  // ---------- camera + ZXing ----------
  async function openScanner(){
    $('#ws-manual').value=''; modal.classList.add('on');
    const busy=$('#ws-busy'); busy.style.display='flex'; busy.textContent='Starting camera…';
    if(typeof ZXing==='undefined' || !ZXing.BrowserMultiFormatReader){ busy.textContent='Scanner unavailable — type the barcode below.'; return; }
    try{
      const reader=new ZXing.BrowserMultiFormatReader();
      const video=$('#ws-video');
      controls=await reader.decodeFromConstraints({video:{facingMode:{ideal:'environment'}}}, video, (result,err,ctrl)=>{
        if(ctrl && !controls) controls=ctrl;
        if(result){ const code=(result.getText?result.getText():''+result).replace(/[^0-9]/g,''); if(code.length>=6){ closeScanner(); lookup(code); } }
      });
      busy.style.display='none';
    }catch(e){ busy.textContent='Camera blocked — type the barcode below instead.'; }
  }
  function closeScanner(){ try{ controls&&controls.stop(); }catch(e){} controls=null; modal.classList.remove('on'); }

  // ---------- lookup ----------
  function fillAndScore(text){ const ta=$('#ingredients'); if(!ta)return; ta.value=text; if(window.checkFood) window.checkFood(); ta.scrollIntoView({behavior:'smooth',block:'center'}); }
  async function lookup(code){
    contrib.classList.remove('on'); $('#ws-saved').textContent='';
    toast('Looking up barcode '+code+'…',4000);
    try{
      const r=await fetch('/api/petfood?barcode='+encodeURIComponent(code));
      const d=await r.json();
      if(d.found && d.hasIngredients && d.ingredients){
        fillAndScore(d.ingredients);
        toast('Found'+(d.name?': '+d.name:'')+' — scored ✓');
      } else if(d.found){
        pendingBarcode=code; pendingName=d.name||'';
        $('#ws-cb-code').textContent='(barcode '+code+(d.name?' · '+d.name:'')+')';
        contrib.classList.add('on'); contrib.scrollIntoView({behavior:'smooth',block:'center'});
        toast('Found'+(d.name?': '+d.name:'')+', but no ingredient list yet — paste it to help others.',5000);
      } else {
        pendingBarcode=code; pendingName='';
        $('#ws-cb-code').textContent='(barcode '+code+')';
        contrib.classList.add('on'); contrib.scrollIntoView({behavior:'smooth',block:'center'});
        toast("We don't have this barcode yet — paste the ingredients to add it.",5000);
      }
    }catch(e){ toast('Lookup failed — check your connection.'); }
  }

  async function contribute(){
    const ta=$('#ingredients'); const ing=(ta&&ta.value||'').trim();
    if(!pendingBarcode){ toast('Scan a product first.'); return; }
    if(ing.length<10){ toast('Paste the ingredient list above first.'); return; }
    const btn=contrib.querySelector('#ws-save'); btn.disabled=true; btn.textContent='Saving…';
    try{
      const r=await fetch('/api/petfood',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({barcode:pendingBarcode,name:pendingName,ingredients:ing})});
      const d=await r.json();
      if(d.ok){ $('#ws-saved').textContent='Saved — thank you! 🐾'; toast('Saved to WoofScore — thanks for helping other dog owners!'); }
      else toast('Could not save: '+(d.error||'try again'));
    }catch(e){ toast('Save failed — try again.'); }
    btn.disabled=false; btn.textContent='Save to WoofScore';
  }

  // ---------- photo OCR ----------
  function photoOCR(){
    const inp=document.createElement('input'); inp.type='file'; inp.accept='image/*'; inp.capture='environment';
    inp.onchange=async()=>{ const f=inp.files&&inp.files[0]; if(!f)return; toast('Reading the label…',6000);
      try{ const img=await downscale(f); const r=await fetch('/api/ocr',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({image:img})});
        const d=await r.json();
        if(d.ok && d.text){ fillAndScore(d.text); toast('Read the label ✓ — check it looks right, then score.'); }
        else if(d.ok && d.none){ toast('Couldn’t find an ingredient list — try a sharper photo of the ingredients panel.',5000); }
        else toast(d.error||'Could not read that photo.',5000);
      }catch(e){ toast('Photo read failed — try again.'); }
    };
    inp.click();
  }
  function downscale(file){ return new Promise((res,rej)=>{ const img=new Image(); const url=URL.createObjectURL(file);
    img.onload=()=>{ const max=1600; let{width:w,height:h}=img; const s=Math.min(1,max/Math.max(w,h)); w=Math.round(w*s); h=Math.round(h*s);
      const c=document.createElement('canvas'); c.width=w; c.height=h; c.getContext('2d').drawImage(img,0,0,w,h); URL.revokeObjectURL(url);
      res(c.toDataURL('image/jpeg',0.82)); };
    img.onerror=()=>{URL.revokeObjectURL(url);rej(new Error('bad image'));}; img.src=url; }); }

  window.WS={ openScanner, photoOCR, lookup };
})();
