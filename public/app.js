"use strict";
/* ---------------- settings ---------------- */
const DEFAULTS = {
  layout:'badge', aspect:'16:9', kit:['yt','ig','story','square','cover','banner','wide','canvas'], kitMoment:'big',
  poseMode:'auto', peakCount:2, poseLow:0.40, poseHigh:0.93, poseHold:8, poseFade:3, eyeFade:0, blinks:0, snapKick:true, nod:0.4, nodEvery:'2', nodGate:0.3, bpm:'', manualCues:'',
  badgeSize:0.80, portraitY:0, breathe:0.5, kick:0.45, sway:0.3,
  rings:0.45, misprint:0.3, spectrum:0.4,
  dashes:0.55, dashSpeed:0.45, clouds:0.6, cloudSpeed:0.35, light:0.35,
  grain:0.5, vignette:0.35, fadeIn:2.5, fadeOut:4,
  title:'glad you came', artist:'the skixO service', credit:'', textPos:'bottom-left', textScale:1, textY:{}, headGap:1, font:'Libre Franklin', fontCustom:'', showTitle:true, showArtist:true, stillText:'same', stillHeadline:'', stillArtist:false, useWordmark:false, lowercase:true,
  styleQ:'colour', styleL:'colour', styleP:'colour', headMove:'shrug',
  introAnim:true, clipIn:0, clipOut:1.6, clipBars:'2',
  subject:'mascot', frameShape:'circle', fSticker:0, fShadow:0.35, fOffset:0, logoTint:'original', lineQuiet:false, phonesPeak:false, echoLine:false, patch:null,
  bgDrift:0.5, bgColour:'', glitch:0, gSort:0, gMosh:0, gMirror:0, echo:0, glitchQuiet:0.45, glitchLift:1, glitchPeak:1.6, captions:'', lyrics:'', capPos:'bottom', capStyle:'outline', capColour:'ink', capWeight:'500', capCase:'typed', capAnim:'fade', capSpacing:0, capIn:0.25, capOut:0.3, capHold:6, capSize:1, glitchTear:0.7, glitchSplit:0.7, glitchBlocks:0.5, glitchRoll:0.4, bgOpacity:1, bgBlur:0, bgId:'', bgSec:{q:'',l:'',p:''}, bgAdj:{q:null,l:null,p:null}, mAdj:{q:{},l:{},p:{}}, bgMatch:true, ink:'#1d2023', blue:'#3d6884', paperCol:'#f8f2e4', look:'paper', artTint:'', edge:'auto'
};
const SLIDERS = {
  'autoPose':[['poseLow','Side light at',0,1,0.01],['peakCount','Peak moments',0,4,1],['poseHold','Hold (s)',1,30,0.5]],
  'g-posefx':[['poseFade','Light change (s)',0.2,8,0.1]],
  'g-fades':[['fadeIn','Fade in (s)',0,10,0.1],['fadeOut','Fade out (s)',0,10,0.1]],
  'g-layout':[['badgeSize','Portrait size',0.4,1.0,0.01],['portraitY','Vertical position',-0.3,0.3,0.01]],
  'g-bg':[['bgOpacity','Background opacity',0,1,0.01],['bgBlur','Background blur',0,1,0.01],['bgDrift','Background drift',0,1,0.01]],
  'g-motion':[['breathe','Breathing',0,1,0.01],['kick','Kick pulse',0,1,0.01],['sway','Sway',0,1,0.01],['rings','Kick rings',0,1,0.01],
    ['spectrum','Spectrum ticks',0,1,0.01],['misprint','Misprint',0,1,0.01]],
  'g-nod':[['nod','Nod depth',0,1,0.01],['nodGate','Nod from energy',0,1,0.01]],
  'g-clip':[['clipIn','Clip starts (s)',0,4,0.05],['clipOut','Clip ends (s)',0.3,4,0.05]],
  'g-finish':[['fSticker','Sticker edge',0,1,0.01],['fShadow','Shadow',0,1,0.01],['fOffset','Riso offset',0,1,0.01]],
  'g-typeS':[['textScale','Text size',0.5,2.5,0.05],['headGap','Artist gap',0.4,2.5,0.05]],
  'g-caps':[['capSize','Size',0.5,2.5,0.05],['capSpacing','Letter spacing',-0.05,0.3,0.01],['capIn','Fade in (s)',0,1.5,0.05],['capOut','Fade out (s)',0,1.5,0.05],['capHold','Max hold (s)',1,15,0.5]],
  'g-glitch':[['glitch','Glitch amount',0,1,0.01],
    ['glitchTear','Tearing',0,1,0.01],['glitchSplit','Colour split',0,1,0.01],['glitchBlocks','Block shifts',0,1,0.01],['glitchRoll','VHS roll',0,1,0.01],
    ['gSort','Pixel sort',0,1,0.01],['gMosh','Datamosh at changes',0,1,0.01],['gMirror','Mirror world',0,1,0.01],['echo','Floating echoes',0,1,0.01]],
  'g-atmos':[['dashes','Glitch dashes',0,1,0.01],['dashSpeed','Dash speed',0,1,0.01],['clouds','Clouds',0,1,0.01],['cloudSpeed','Cloud drift',0,1,0.01],
    ['light','Window light',0,1,0.01],['grain','Print grain',0,1,0.01],['vignette','Vignette',0,1,0.01]]
};
let S = Object.assign({}, DEFAULTS);
try{ const saved = JSON.parse(localStorage.getItem('skixo-vis-settings')||'null'); if(saved) S = Object.assign({}, DEFAULTS, saved); }catch(e){}
function persist(){ try{ localStorage.setItem('skixo-vis-settings', JSON.stringify(S)); }catch(e){} if(typeof saveLib==='function') saveLib(); }

const $ = id => document.getElementById(id);
const KNOB_GROUPS = ['g-motion','g-nod','g-glitch','g-atmos','g-finish'];
const KNOB_SMALL = ['dashSpeed','cloudSpeed'];   // speed knobs sit beside their amount   // amounts you play by feel become knobs
function buildSliders(){
  for(const [gid, list] of Object.entries(SLIDERS)){
    const g = $(gid);
    let kg=null;
    if(KNOB_GROUPS.includes(gid)){ kg=document.createElement('div'); kg.className='kgrid'+(gid==='g-atmos'?' k4':''); g.appendChild(kg); }
    for(const [k,label,min,max,step] of list){
      const row = document.createElement('div'); row.className='row';
      if(kg){ row.className='row kcell'+(KNOB_SMALL.includes(k)?' ksm':'');
        row.innerHTML = `<div class="knob" role="slider" tabindex="0" aria-labelledby="${k}-l" data-k="${k}"><svg viewBox="0 0 48 48" aria-hidden="true"><path class="kt"/><path class="kv"/><path class="kl"/></svg><i class="cap"></i></div><label id="${k}-l">${label}</label><input type="range" class="vh" id="${k}" min="${min}" max="${max}" step="any" tabindex="-1" aria-hidden="true"><output id="${k}-o"></output>`;
        kg.appendChild(row); continue; }
      row.innerHTML = `<label for="${k}">${label}</label><input type="range" id="${k}" min="${min}" max="${max}" step="${step}"><output id="${k}-o"></output>`;
      g.appendChild(row);
    }
  }
}
buildSliders();
const fmtVal = v => (Math.abs(v)>=10? v.toFixed(0) : (+v).toFixed(2).replace(/0$/,''));
function syncUI(){
  if(typeof syncBgColour==='function') setTimeout(syncBgColour);
  if(typeof syncSeg==='function') setTimeout(syncSeg);
  for(const list of Object.values(SLIDERS)) for(const [k] of list){ $(k).value = S[k]; $(k+'-o').textContent = fmtVal(+S[k]); }
  for(const k of ['layout','aspect','poseMode','title','artist','credit','textPos','ink','blue','paperCol','manualCues','nodEvery','bpm','edge','stillText','stillHeadline','kitMoment','font','fontCustom','captions','capPos','lyrics','capStyle','capColour','capWeight','capCase','capAnim','subject','frameShape','logoTint','clipBars','styleQ','styleL','styleP','headMove']) $(k).value = S[k];
  $('useWordmark').checked = S.useWordmark; $('lineQuiet').checked=!!S.lineQuiet; $('introAnim').checked=S.introAnim!==false; $('phonesPeak').checked=!!S.phonesPeak; $('echoLine').checked=!!S.echoLine; $('showTitle').checked = S.showTitle!==false; $('showArtist').checked = S.showArtist!==false; $('stillArtist').checked = !!S.stillArtist; $('bgMatch').checked = S.bgMatch!==false; $('lowercase').checked = S.lowercase; $('snapKick').checked = S.snapKick;
  $('autoPose').hidden = S.poseMode!=='auto'; $('manualPose').hidden = S.poseMode!=='manual';
  if(window.KIT_READY) kitSync();
}
function bindUI(){
  for(const list of Object.values(SLIDERS)) for(const [k] of list){
    $(k).addEventListener('input', e=>{
      const v=+e.target.value, slot=$('bgTarget') && $('bgTarget').value;
      const ms=$('mslot') ? $('mslot').dataset.v : 'all';
      if(MKEYS.includes(k) && ms!=='all'){ S.mAdj=Object.assign({q:{},l:{},p:{}},S.mAdj); S.mAdj[ms]=Object.assign({},S.mAdj[ms],{[k]:v}); showMotionSec(); }
      else if(BGK[k] && slot && slot!=='all'){ S.bgAdj=Object.assign({q:null,l:null,p:null},S.bgAdj); S.bgAdj[slot]=Object.assign({},S.bgAdj[slot],{[BGK[k]]:v}); showAdj(); }
      else S[k] = v;
      $(k+'-o').textContent = fmtVal(v); onChange(k);
    });
  }
  for(const k of ['layout','aspect','poseMode','title','artist','credit','textPos','ink','blue','paperCol','manualCues','nodEvery','bpm','edge','stillText','stillHeadline','kitMoment','font','fontCustom','captions','capPos','lyrics','capStyle','capColour','capWeight','capCase','capAnim','subject','frameShape','logoTint','clipBars','styleQ','styleL','styleP','headMove']){
    $(k).addEventListener('input', e=>{ S[k] = e.target.value; onChange(k); });
  }
  for(const k of ['useWordmark','lowercase','snapKick','showTitle','showArtist','stillArtist','lineQuiet','phonesPeak','echoLine','introAnim']) $(k).addEventListener('change', e=>{ S[k]=e.target.checked; onChange(k); });
}
function onChange(k){
  if(k==='poseMode'){
    $('autoPose').hidden = S.poseMode!=='auto'; $('manualPose').hidden = S.poseMode!=='manual';
    if(S.poseMode==='manual' && !S.manualCues.trim() && A){ S.manualCues = cuesToText(autoCues()); $('manualCues').value = S.manualCues; }
  }
  if(k==='aspect') setAspect();
  if(k==='kitMoment' && window.KIT_READY) kitSync();
  if(k==='captions' && A) drawTimeline();
  if(BGK[k] && A) drawTimeline();
  if(k==='font' || k==='fontCustom'){ $('fontCustomRow').hidden = S.font!=='custom'; ensureFont(); }
  if(k==='edge' || k==='frameShape' || (k==='paperCol' && (S.edge||'auto')==='auto')) refreshArt();
  if(['subject','frameShape'].includes(k) && typeof syncSubjectUI==='function') syncSubjectUI();
  if(k==='clipIn' || k==='clipOut'){ clearTimeout(CLIP_T); CLIP_T=setTimeout(()=>CLIP.src && loadClip(CLIP.src, CLIP.name), 350); }
  if(k==='bpm' && A){ A.grid = beatGrid(); showGrid(); }
  if(k==='ink') wordmarkImg = null, loadWordmark();
  if(['ink','blue','paperCol'].includes(k)){ S.look='custom'; markLook(); }
  if(k==='blue') makeClouds(S.blue);
  if(['poseMode','poseLow','poseHigh','peakCount','poseHold','manualCues','poseFade','eyeFade','blinks','snapKick'].includes(k)) rebuildCues();
  if(k==='paperCol' || k==='vignette') overlayCache = {};
  persist(); requestDraw();
}

/* ---------------- assets ---------------- */
const IMGS = { a:null, b:null, c:null, h:null, w:null, n1c:null, n2c:null, n1f:null, n2f:null, n1p:null, n2p:null, cut:null, cutn:null, phones:null, line:null, logo:null, cpeak:null, cn1:null, cn2:null, cwear:null, sketch:null, halftone:null, cpn1:null, cpn2:null, cwn1:null, cwn2:null };
const CUT_SLOTS = ['cut','cutn','phones','line','logo','cpeak','cn1','cn2','cwear','sketch','halftone','cpn1','cpn2','cwn1','cwn2'];   // transparent art: kept whole, never cropped to the disc
const NOD_SLOTS = ['n1c','n2c','n1f','n2f','n1p','n2p'], RAW = {};   // masked canvases for poses, raw bitmap for wide scene
let wordmarkSrc = null, wordmarkImg = null;
/* file slots: hide the native input, show a button and what's loaded */
function setNote(slot, text){ const el=document.getElementById('note-'+slot); if(!el) return; const mine=text!=='Starter' && text!=='Empty';
  el.classList.toggle('mine', mine);
  if(el.classList.contains('fbadge')){ el.textContent = mine ? 'Yours' : text; el.title = text; if(text==='Empty' && typeof drawTile==='function') drawTile(slot,null); }
  else el.textContent=text; }
document.querySelectorAll('.file input[type=file]').forEach(inp=>{
  const slot = inp.id.slice(2); inp.classList.add('vh');
  const wrap = document.createElement('div'); wrap.className='pick';
  const btn = document.createElement('button'); btn.type='button'; btn.textContent='Choose'; btn.setAttribute('aria-label', 'Choose file for '+inp.previousElementSibling.textContent);
  btn.addEventListener('click', ()=>inp.click());
  const note = document.createElement('span'); note.id='note-'+slot; note.className='note'; note.textContent = slot==='audio' ? 'None yet' : 'Empty';
  wrap.append(btn, note); inp.after(wrap);
});

/* Looks: a palette for paper, ink and accent, plus an optional recolour of the artwork's blue.
   The recolour keeps each pixel's lightness, so grain and shading survive. */
const LOOKS = [
  {id:'paper', name:'Paper blue', paperCol:'#f8f2e4', ink:'#1d2023', blue:'#3d6884', artTint:''},
  {id:'dusk',  name:'Dusk',       paperCol:'#f4e4d6', ink:'#2a1f2b', blue:'#8a4f6e', artTint:'#8a4f6e'},
  {id:'sage',  name:'Sage',       paperCol:'#eef0e4', ink:'#1f2620', blue:'#5e7a5a', artTint:'#5e7a5a'},
  {id:'riso',  name:'Riso red',   paperCol:'#f6efe6', ink:'#1f1b1b', blue:'#c4473a', artTint:'#c4473a'},
  {id:'night', name:'Night',      paperCol:'#1b2230', ink:'#ece4d2', blue:'#7f9fc6', artTint:''}
];
const TINTED = new WeakMap();
function tintCanvas(bmp){
  const key = S.artTint; if(!key) return bmp;
  const hit = TINTED.get(bmp); if(hit && hit.key===key) return hit.c;
  const c=document.createElement('canvas'); c.width=bmp.width; c.height=bmp.height;
  const x=c.getContext('2d',{willReadFrequently:true}); x.drawImage(bmp,0,0);
  const id=x.getImageData(0,0,c.width,c.height), d=id.data;
  const tr=parseInt(key.slice(1,3),16), tg=parseInt(key.slice(3,5),16), tb=parseInt(key.slice(5,7),16);
  const k = 1/94;   // luminance of the original blue
  for(let i=0;i<d.length;i+=4){
    const r=d[i], g=d[i+1], b=d[i+2], w=Math.min(1,Math.max(0,((b-r)-18)/34));
    if(w<=0) continue;
    const L=(0.3*r+0.59*g+0.11*b)*k;
    d[i]=r+(Math.min(255,tr*L)-r)*w; d[i+1]=g+(Math.min(255,tg*L)-g)*w; d[i+2]=b+(Math.min(255,tb*L)-b)*w;
  }
  x.putImageData(id,0,0); TINTED.set(bmp,{key,c}); return c;
}
/* Match look to background: paper from the lightest tones, ink from the darkest,
   accent from the most saturated mid-tones. Sets a custom look and recolours the art to suit. */
/* background library: bg/index.json lists set, palette and name for each bundled scene */
let BGLIB=[];
const SECBG = {};   // section key -> bitmap
/* ---------------- procedural scenes: drawn every frame from time, palette and the track ---------------- */
const PROCS = [{id:'proc-sky',name:'time of day sky'},{id:'proc-rays',name:'halftone rays'},{id:'proc-grooves',name:'record grooves'},{id:'proc-rain',name:'falling dashes'}];
const hex2rgb = h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
const mixc = (a,b,p)=>`rgb(${a.map((v,i)=>Math.round(v+(b[i]-v)*p)).join(',')})`;
function drawProc(ctx,W,H,t,kind,drift){
  const U=Math.min(W,H), paper=hex2rgb(S.paperCol), acc=hex2rgb(S.blue), ink=hex2rgb(S.ink), dur=A?A.dur:180, k=hitEnv(A&&A.kicks,t,0.25), e=energyAt(t);
  if(kind==='proc-sky'){
    // dawn -> day -> dusk -> night across the track
    const K=[[[243,201,165],[248,239,224]],[[156,195,221],[238,243,239]],[[240,138,93],[61,44,79]],[[15,22,48],[38,52,90]]];
    const p=Math.min(0.999,Math.max(0,t/dur))*3, i=Math.floor(p), f=p-i, a=K[i], b=K[Math.min(3,i+1)];
    const top=mixc(a[0],b[0],f), bot=mixc(a[1],b[1],f), g=ctx.createLinearGradient(0,0,0,H); g.addColorStop(0,top); g.addColorStop(1,bot);
    ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
    const arc=Math.min(1,t/dur), sx=W*(0.1+0.8*arc), sy=H*(0.75-0.55*Math.sin(Math.PI*arc));
    ctx.fillStyle = p>2.3 ? 'rgba(240,236,220,0.9)' : 'rgba(255,236,190,0.85)'; ctx.beginPath(); ctx.arc(sx,sy,U*0.06,0,7); ctx.fill();
    const night=Math.max(0,p-2.2)/0.8; if(night>0){ for(let s2=0;s2<140;s2++){ ctx.globalAlpha=night*(0.4+0.6*hash(s2*7))*(0.7+0.3*Math.sin(t*2+s2)); ctx.fillStyle='#f3efe2'; ctx.fillRect(hash(s2)*W, hash(s2*3)*H*0.7, U*0.003, U*0.003); } ctx.globalAlpha=1; }
  } else if(kind==='proc-rays'){
    ctx.fillStyle=S.paperCol; ctx.fillRect(0,0,W,H);
    const n=24, rot=t*0.04*(0.3+drift*1.4), R=Math.hypot(W,H);
    ctx.save(); ctx.translate(W/2,H/2); ctx.rotate(rot); ctx.fillStyle=mixc(paper,acc,0.35+k*0.25);
    for(let i=0;i<n;i+=2){ const a0=i/n*Math.PI*2, a1=(i+1)/n*Math.PI*2; ctx.beginPath(); ctx.moveTo(0,0); ctx.arc(0,0,R,a0,a1); ctx.closePath(); ctx.fill(); }
    ctx.restore();
    // halftone fade towards the centre
    const g=ctx.createRadialGradient(W/2,H/2,0,W/2,H/2,U*0.75); g.addColorStop(0,S.paperCol); g.addColorStop(1,'rgba(0,0,0,0)'); ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
  } else if(kind==='proc-grooves'){
    const dark = isDark(S.paperCol) ? paper : ink, light = isDark(S.paperCol) ? ink : paper;   // vinyl is always the darker tone
    ctx.fillStyle=mixc(dark,acc,0.12); ctx.fillRect(0,0,W,H);
    const cx=W/2, cy=H/2, R=Math.hypot(W,H)*0.55, spin=t*(0.5+drift*1.5);
    ctx.strokeStyle=mixc(dark,light,0.16); ctx.lineWidth=Math.max(1,U*0.0018);
    for(let r=U*0.2; r<R; r+=U*0.011){ ctx.globalAlpha=0.5+0.5*hash(Math.round(r)); ctx.beginPath(); ctx.arc(cx,cy,r,0,7); ctx.stroke(); }
    ctx.globalAlpha=1;
    // the sheen turns with the record
    for(const off of [0,Math.PI]){ const g=ctx.createConicGradient ? ctx.createConicGradient(spin+off,cx,cy) : null; if(!g) break;
      g.addColorStop(0,'rgba(255,255,255,0.16)'); g.addColorStop(0.06,'rgba(255,255,255,0)'); g.addColorStop(0.94,'rgba(255,255,255,0)'); g.addColorStop(1,'rgba(255,255,255,0.16)');
      ctx.fillStyle=g; ctx.fillRect(0,0,W,H); }
    ctx.fillStyle=S.blue; ctx.beginPath(); ctx.arc(cx,cy,U*0.2,0,7); ctx.fill();
  } else if(kind==='proc-rain'){
    ctx.fillStyle=S.paperCol; ctx.fillRect(0,0,W,H);
    ctx.fillStyle=S.blue; const n=110, sp=(0.15+e*0.6)*(0.4+drift*1.2);
    for(let i=0;i<n;i++){ const x=hash(i*13)*W, len=(0.03+hash(i*7)*0.09)*H, y=((hash(i*3)+t*sp*(0.6+hash(i)))%1.2)*H*1.1-len;
      ctx.globalAlpha=0.25+0.55*hash(i*5); ctx.fillRect(x,y,Math.max(1,U*0.003),len); }
    ctx.globalAlpha=1;
  }
}
const PROC_THUMB={};
function procThumb(id){ if(PROC_THUMB[id]) return PROC_THUMB[id]; const c=document.createElement('canvas'); c.width=320; c.height=180; drawProc(c.getContext('2d'),320,180,A?A.dur*0.62:110,id,0.5); PROC_THUMB[id]=c; return c; }
function bgThumb(id){ return id.startsWith('proc-') ? procThumb(id).toDataURL('image/jpeg',0.8) : `bg/thumbs/${id}.jpg`; }
async function loadBgSrc(id){ if(id.startsWith('proc-')){ const th=procThumb(id); return {proc:id, thumb:th, width:th.width, height:th.height}; } return loadImage(`bg/${id}.jpg`); }

/* each section can override opacity, blur and drift; unset values use the whole-track settings */
const BGK = {bgOpacity:'opacity', bgBlur:'blur', bgDrift:'drift'};
function adjFor(k){ const o=(S.bgAdj&&S.bgAdj[k])||{}; return {opacity: o.opacity ?? S.bgOpacity, blur: o.blur ?? S.bgBlur, drift: o.drift ?? S.bgDrift}; }
function bgFor(pose){ const k=['q','l','p'][Math.min(pose,2)]; const img=(S.bgSec && S.bgSec[k] && SECBG[k]) || IMGS.bg; return img ? {img, adj:adjFor(k)} : null; }
const sameBg = (a,b)=> a && b && a.img===b.img && a.adj.opacity===b.adj.opacity && a.adj.blur===b.adj.blur && a.adj.drift===b.adj.drift;
function drawBg(ctx,W,H,t,bg,mix){
  const alpha = bg.adj.opacity*mix; if(alpha<=0.002) return;
  if(bg.img.proc){
    ctx.save(); ctx.globalAlpha=alpha; if(bg.adj.blur>0) ctx.filter=`blur(${Math.min(W,H)*0.02*bg.adj.blur}px)`;
    drawProc(ctx,W,H,t,bg.img.proc,bg.adj.drift); ctx.restore(); return;
  }
  const im=blurredBg(bg.img, bg.adj.blur), d=bg.adj.drift, z=(1.08 + Math.sin(t*2*Math.PI/47)*0.03*d) * (1 + hitEnv(A&&A.kicks,t,0.2)*S.kick*0.006);
  const sc=Math.max(W/im.width, H/im.height)*z, px=Math.sin(t*2*Math.PI/71)*W*0.025*d, py=Math.cos(t*2*Math.PI/59)*H*0.015*d;
  ctx.globalAlpha=alpha; ctx.drawImage(im, W/2+px-im.width*sc/2, H/2+py-im.height*sc/2, im.width*sc, im.height*sc); ctx.globalAlpha=1;
}
const blurCache = new Map();
function blurredBg(im, blur){
  if(im && im.proc) return im.thumb;
  if(!blur) return im;
  let per=blurCache.get(im); if(!per){ per=new Map(); blurCache.set(im,per); }
  const key=Math.round(blur*100); if(per.has(key)) return per.get(key);
  const pad=Math.round(Math.min(im.width,im.height)*0.04*blur)*2;
  const c=document.createElement('canvas'); c.width=im.width; c.height=im.height; const x=c.getContext('2d');
  x.filter=`blur(${pad/2}px)`; x.drawImage(im,-pad,-pad,im.width+pad*2,im.height+pad*2);
  if(per.size>6) per.clear(); per.set(key,c); return c;
}
async function loadSecBgs(){
  for(const k of ['q','l','p']){ const id=S.bgSec&&S.bgSec[k]; SECBG[k] = id ? await loadBgSrc(id) : null; }
  showSecBgs(); requestDraw();
}
function showSecBgs(){ renderSlots(); }
/* scene slots: whole track, quiet, lifted, peak. The selected slot receives the next background click. */
function slotThumb(k){
  if(k==='all'){ if(S.bgId) return bgThumb(S.bgId); if(IMGS.bg){ const c=document.createElement('canvas'); c.width=160; c.height=90; const x=c.getContext('2d'); const im=IMGS.bg, sc=Math.max(160/im.width,90/im.height); x.drawImage(im,80-im.width*sc/2,45-im.height*sc/2,im.width*sc,im.height*sc); return c.toDataURL('image/jpeg',0.7); } return ''; }
  const id=S.bgSec&&S.bgSec[k]; return id ? bgThumb(id) : '';
}
function showAdj(){
  const slot=$('bgTarget').value, a = slot==='all' ? {opacity:S.bgOpacity,blur:S.bgBlur,drift:S.bgDrift} : adjFor(slot);
  for(const [k,f] of Object.entries(BGK)){ $(k).value=a[f]; $(k+'-o').textContent=fmtVal(+a[f]); }
  const own = slot!=='all' && S.bgAdj && S.bgAdj[slot];
  const names={all:'the whole track',q:'quiet sections',l:'lifted sections',p:'peak moments'};
  $('adjNote').innerHTML = slot==='all' ? 'Adjusting <b>the whole track</b> (the default for every slot).' :
    `Adjusting <b>${names[slot]}</b> only.` + (own ? ' <button type="button" class="linkbtn" id="adjReset">Use whole-track settings</button>' : ' Currently using the whole-track settings.');
  const r=$('adjReset'); if(r) r.onclick=()=>{ S.bgAdj[slot]=null; persist(); showAdj(); requestDraw(); if(A) drawTimeline(); };
}
function renderSlots(){
  if($('adjNote')) showAdj();
  if(typeof drawTimeline==='function' && A) drawTimeline();
  const cur=$('bgTarget').value;
  document.querySelectorAll('.slot').forEach(b=>{
    const k=b.dataset.slot, url=slotThumb(k), th=b.querySelector('.sthumb');
    th.style.backgroundImage = url ? `url("${url}")` : ''; th.classList.toggle('set', !!url);
    b.setAttribute('aria-pressed', k===cur);
    let x=b.querySelector('.x'); if(url && !x){ x=document.createElement('i'); x.className='x'; x.textContent='×'; x.title='Clear'; b.appendChild(x); } if(!url && x) x.remove();
  });
}
document.querySelectorAll('.slot').forEach(b=>b.addEventListener('click', e=>{
  const k=b.dataset.slot;
  if(e.target.classList.contains('x')){
    if(k==='all') $('clearBg').click();
    else { S.bgSec=Object.assign({q:'',l:'',p:''},S.bgSec,{[k]:''}); SECBG[k]=null; persist(); requestDraw(); }
    renderSlots(); return;
  }
  $('bgTarget').value=k; markBg();
}));
async function pickBg(id, fromUser){
  const it=BGLIB.find(b=>b.id===id); if(!it) return;
  const target = fromUser ? $('bgTarget').value : 'all';
  if(target!=='all'){ S.bgSec = Object.assign({q:'',l:'',p:''}, S.bgSec, {[target]:id}); SECBG[target] = await loadBgSrc(id); markBg(); persist(); requestDraw(); return; }
  IMGS.bg = await loadBgSrc(id); S.bgId=id; setNote('bg', `${it.set} · ${it.palette} · ${it.name}`);
  if(fromUser && S.bgMatch) matchBackground(); else persist();
  markBg(); requestDraw();
}
function markBg(){ const k=$('bgTarget').value, cur = k==='all' ? S.bgId : (S.bgSec&&S.bgSec[k]); document.querySelectorAll('.bgthumb').forEach(b=>b.setAttribute('aria-pressed', b.dataset.id===cur)); renderSlots(); }
function renderBgGrid(){
  const st=$('bgSet').value, pal=$('bgPal').value, g=$('bgGrid');
  g.innerHTML=''; BGLIB.filter(b=>(st==='all'||b.set===st)&&(pal==='all'||b.palette===pal)).forEach(b=>{
    const el=document.createElement('button'); el.type='button'; el.className='bgthumb'; el.dataset.id=b.id; el.title=`${b.set} · ${b.palette} · ${b.name}`;
    el.innerHTML=`<img src="${bgThumb(b.id)}" alt="${b.name}" loading="lazy">`; el.addEventListener('click',()=>pickBg(b.id,true)); g.appendChild(el); });
  markBg();
}
fetch('bg/index.json').then(r=>r.json()).then(list=>{ BGLIB=PROCS.map(p=>({id:p.id,set:'animated',palette:'any',name:p.name})).concat(list); renderBgGrid(); if(S.bgId) pickBg(S.bgId,false); loadSecBgs(); }).catch(()=>{});
$('clearSecBgs').addEventListener('click', ()=>{ S.bgSec={q:'',l:'',p:''}; loadSecBgs(); persist(); });
$('bgSet').addEventListener('change', renderBgGrid); $('bgPal').addEventListener('change', renderBgGrid);
$('bgMatch').addEventListener('change', e=>{ S.bgMatch=e.target.checked; persist(); });

function matchBackground(){
  const im=IMGS.bg; if(!im || im.proc) return false;   // animated scenes already use the look's colours
  const c=document.createElement('canvas'); c.width=160; c.height=90; const x=c.getContext('2d',{willReadFrequently:true});
  x.drawImage(im,0,0,160,90); const d=x.getImageData(0,0,160,90).data, px=[];
  for(let i=0;i<d.length;i+=4){ const r=d[i],g=d[i+1],b=d[i+2], mx=Math.max(r,g,b), mn=Math.min(r,g,b);
    px.push({r,g,b,l:0.3*r+0.59*g+0.11*b, s: mx ? (mx-mn)/mx : 0}); }
  const avg=a=>'#'+['r','g','b'].map(k=>Math.round(a.reduce((t,p)=>t+p[k],0)/a.length).toString(16).padStart(2,'0')).join('');
  const byL=[...px].sort((a,b)=>a.l-b.l), n=px.length;
  const ink=avg(byL.slice(0, n*0.06|0)), paper=avg(byL.slice(n*0.9|0));
  const mid=px.filter(p=>p.l>60 && p.l<170).sort((a,b)=>b.s-a.s); const acc=avg(mid.slice(0, Math.max(10, mid.length*0.1|0)));
  // deepen the accent a touch so the disc holds against the background
  const deep='#'+[1,3,5].map(i=>Math.round(parseInt(acc.slice(i,i+2),16)*0.82).toString(16).padStart(2,'0')).join('');
  Object.assign(S,{paperCol:paper, ink, blue:deep, artTint:deep, look:'custom'});
  syncUI(); refreshArt(); persist(); return true;
}

function applyLook(id){
  const L = LOOKS.find(l=>l.id===id); if(!L) return;
  Object.assign(S, {paperCol:L.paperCol, ink:L.ink, blue:L.blue, artTint:L.artTint, look:L.id});
  syncUI(); refreshArt(); persist();
}
function markLook(){ document.querySelectorAll('.look').forEach(b=>b.setAttribute('aria-pressed', b.dataset.id===S.look)); }
(function buildLooks(){
  const box=document.getElementById('looks'); if(!box) return;
  for(const L of LOOKS){
    const b=document.createElement('button'); b.type='button'; b.className='look'; b.dataset.id=L.id;
    b.innerHTML=`<span class="sw" style="background:${L.paperCol}"><i style="background:${L.blue}"></i><i style="background:${L.ink}"></i></span>${L.name}`;
    b.addEventListener('click', ()=>applyLook(L.id)); box.appendChild(b);
  }
})();

function isDark(hex){ const v=parseInt(hex.slice(1),16); return (0.3*(v>>16&255)+0.59*(v>>8&255)+0.11*(v&255)) < 110; }
// disc edge in the artwork sits at r 0.472, its cream rim runs to 0.492
function edgeRadii(){ let m=S.edge||'auto'; if(m==='auto') m = isDark(S.paperCol) ? 'ring' : 'soft';
  return m==='ring' ? [0.4905,0.4925] : m==='trim' ? [0.4695,0.4715] : [0.47,0.5]; }
function refreshArt(){
  overlayCache={}; makeClouds(S.blue); wordmarkImg=null; loadWordmark();
  for(const k of ['a','b','c','h']) if(IMGS[k]) IMGS[k]=maskPose(IMGS[k]._src);
  for(const k of ['cut','cutn','phones','cpeak','cn1','cn2','cwear','sketch','halftone','cpn1','cpn2','cwn1','cwn2']) if(IMGS[k] && IMGS[k]._src){ const src=IMGS[k]._src; IMGS[k]=tintWhole(src); IMGS[k]._src=src; }
  FIN = new WeakMap(); LOGO_C=null; LINE_C=null; if(typeof processClip==='function') processClip();
  NOD_SLOTS.forEach(buildNod); markLook(); requestDraw();
}

function maskPose(bmp){
  const n = Math.max(bmp.width, bmp.height);
  const c = document.createElement('canvas'); c.width = c.height = n;
  const x = c.getContext('2d');
  x.drawImage(tintCanvas(bmp), (n-bmp.width)/2, (n-bmp.height)/2);
  x.globalCompositeOperation = 'destination-in';
  if(S.frameShape==='rounded'){   // a rounded print card instead of the disc
    x.filter=`blur(${n*0.004}px)`; x.fillStyle='#000'; x.beginPath(); x.roundRect(n*0.045,n*0.045,n*0.91,n*0.91,n*0.12); x.fill(); x.filter='none';
  } else {
    const [r0,r1] = edgeRadii();
    const g = x.createRadialGradient(n/2,n/2,n*r0,n/2,n/2,n*r1);
    g.addColorStop(0,'rgba(0,0,0,1)'); g.addColorStop(1,'rgba(0,0,0,0)');
    x.fillStyle = g; x.fillRect(0,0,n,n);
  }
  c._src = bmp; return c;
}
async function loadImage(src){
  const blob = src instanceof Blob ? src : await (await fetch(src)).blob();
  if(/svg/.test(blob.type) || (blob.name && /\.svg$/i.test(blob.name))){   // SVG: rasterise large so it stays crisp at 1440p
    const url=URL.createObjectURL(blob.type?blob:new Blob([blob],{type:'image/svg+xml'}));
    try{ const im=new Image(); im.src=url; await im.decode(); const w=im.naturalWidth||1000, h=im.naturalHeight||1000, k=2048/Math.max(w,h);
      const c=document.createElement('canvas'); c.width=Math.round(w*k); c.height=Math.round(h*k); c.getContext('2d').drawImage(im,0,0,c.width,c.height); return await createImageBitmap(c); }
    finally{ URL.revokeObjectURL(url); }
  }
  return await createImageBitmap(blob);
}
async function setPose(slot, src, name){
  if(slot==='clip') return loadClip(src, name);
  const bmp = await loadImage(src); if(typeof drawTile==='function') drawTile(slot,bmp);
  setNote(slot, name || (typeof src==='string' ? 'Starter' : (src.name || 'Your file')));
  if(slot==='w' || slot==='bg') IMGS[slot] = bmp;
  else if(CUT_SLOTS.includes(slot)){ let src=bmp; if(slot==='logo'){ const k=await knockOut(bmp); if(k){ src=k; setNote(slot,'Background removed'); drawTile(slot,k); } }
    IMGS[slot] = (slot==='line'||slot==='logo') ? src : tintWhole(src); IMGS[slot]._src = src; FIN = new WeakMap(); }
  else if(NOD_SLOTS.includes(slot)){ RAW[slot] = bmp; buildNod(slot); }
  else { IMGS[slot] = maskPose(bmp); if(slot==='a'||slot==='b'||slot==='c') NOD_SLOTS.forEach(buildNod); if(slot==='c'||slot==='h') rebuildCues(); }
  requestDraw();
}
function sampleCorner(bmp){
  const c = document.createElement('canvas'); c.width=c.height=8; const x=c.getContext('2d');
  x.drawImage(bmp, 0,0,40,40, 0,0,8,8);
  const d = x.getImageData(0,0,8,8).data; let r=0,g=0,b=0;
  for(let i=0;i<d.length;i+=4){r+=d[i];g+=d[i+1];b+=d[i+2];}
  const n=d.length/4, h=v=>Math.round(v/n).toString(16).padStart(2,'0');
  return '#'+h(r)+h(g)+h(b);
}
/* Nod frames: aligned to the base on the lower body, then everything above the collar is taken from the
   nod frame and blended into the base low in the hoodie, so generator drift below can't make the body jitter. */
function grey(img, n){
  const c=document.createElement('canvas'); c.width=c.height=n; const x=c.getContext('2d',{willReadFrequently:true});
  x.drawImage(img,0,0,n,n); const d=x.getImageData(0,0,n,n).data, g=new Float32Array(n*n);
  for(let i=0;i<n*n;i++) g[i]=d[i*4]*0.3+d[i*4+1]*0.59+d[i*4+2]*0.11; return g;
}
function alignOffset(baseImg, img){
  const n=160, A1=grey(baseImg,n), B1=grey(img,n); let best=[0,0], bestE=1e18;
  for(let dy=-8;dy<=8;dy++) for(let dx=-8;dx<=8;dx++){
    let e=0; for(let y=Math.floor(n*0.70);y<Math.floor(n*0.93);y+=2) for(let x=Math.floor(n*0.12);x<Math.floor(n*0.88);x+=2){
      const yy=y-dy, xx=x-dx; e+=Math.abs(A1[y*n+x]-B1[yy*n+xx]); }
    if(e<bestE){ bestE=e; best=[dx/n,dy/n]; } }
  return best;
}
/* ---------------- animated intro: a short clip of the mascot swaying, eased back and forth in time ----------------
   Frames are pulled into one sheet once (720px cells), recoloured and masked like the stills; drawing is a pure function of t. */
const CLIP = {src:null, name:'', raw:null, proc:null, n:0, cols:0, cell:720}; let CLIP_T=null, CLIP_JOB=0;
async function loadClip(src, name){
  const job=++CLIP_JOB, blob = src instanceof Blob ? src : await (await fetch(src)).blob();
  CLIP.failed=false; CLIP.src=blob; CLIP.name=name || (typeof src==='string' ? 'Starter' : (src.name||'Your clip'));
  const url=URL.createObjectURL(blob), v=document.createElement('video'); v.muted=true; v.playsInline=true; v.preload='auto'; v.src=url;
  try{
    await new Promise((res,rej)=>{ v.onloadeddata=res; v.onerror=()=>rej(new Error('video')); });
    const t0=Math.max(0,Math.min(S.clipIn||0, v.duration-0.1)), t1=Math.max(t0+0.2, Math.min(S.clipOut||1.6, v.duration)), n=Math.min(90, Math.round((t1-t0)*30)+1);
    const cols=Math.ceil(Math.sqrt(n)), C=CLIP.cell, sheet=document.createElement('canvas'); sheet.width=sheet.height=cols*C; const x=sheet.getContext('2d');
    for(let i=0;i<n;i++){
      if(job!==CLIP_JOB) return;
      await new Promise(r=>{ v.onseeked=r; v.currentTime = t0 + i/30 + 0.001; });
      const s=Math.min(v.videoWidth,v.videoHeight), sx=(v.videoWidth-s)/2, sy=(v.videoHeight-s)/2;
      x.drawImage(v, sx, sy, s, s, (i%cols)*C, Math.floor(i/cols)*C, C, C);
      if(i===0) drawTile('clip', sheet);
    }
    Object.assign(CLIP,{raw:sheet,n,cols}); processClip(); setNote('clip', CLIP.name);
    const tc=document.querySelector('.ftile[data-slot="clip"] canvas'); if(tc){ const tx=tc.getContext('2d'); tx.clearRect(0,0,tc.width,tc.height); tx.drawImage(sheet,0,0,C,C,0,0,tc.width,tc.height); }
  }catch(e){ CLIP.failed=true; setNote('clip','Could not read'); }
  finally{ URL.revokeObjectURL(url); }
  requestDraw();
}
function processClip(){   // same recolour and edge mask as the still frames
  if(!CLIP.raw) return; const C=CLIP.cell, sheet=tintCanvas(CLIP.raw), out=document.createElement('canvas'); out.width=out.height=CLIP.raw.width;
  const o=out.getContext('2d'); o.drawImage(sheet,0,0);
  const m=document.createElement('canvas'); m.width=m.height=C; const mx=m.getContext('2d');
  if(S.frameShape==='rounded'){ mx.filter=`blur(${C*0.004}px)`; mx.fillStyle='#000'; mx.beginPath(); mx.roundRect(C*0.045,C*0.045,C*0.91,C*0.91,C*0.12); mx.fill(); }
  else { const [r0,r1]=edgeRadii(), g=mx.createRadialGradient(C/2,C/2,C*r0,C/2,C/2,C*r1); g.addColorStop(0,'#000'); g.addColorStop(1,'rgba(0,0,0,0)'); mx.fillStyle=g; mx.fillRect(0,0,C,C); }
  const tiled=document.createElement('canvas'); tiled.width=tiled.height=out.width; const tx=tiled.getContext('2d');
  for(let i=0;i<CLIP.cols*CLIP.cols;i++) tx.drawImage(m,(i%CLIP.cols)*C,Math.floor(i/CLIP.cols)*C);
  o.globalCompositeOperation='destination-in'; o.drawImage(tiled,0,0);   // one pass: every cell keeps its own disc
  CLIP.proc=out; requestDraw();
}
let INTRO_C=null;
function introStatus(){
  if(S.introAnim===false) return ['off','Off.'];
  if(!CLIP.proc) return ['wait', CLIP.failed ? 'The clip could not be loaded. Drop an MP4 or WebM on the Animated intro tile.' : 'Loading the clip…'];
  if(S.subject!=='mascot') return ['off','Not playing: the subject is set to '+(S.subject==='image'?'Logo':'Title')+' (Subject section).'];
  if(S.frameShape==='cutout') return ['off','Not playing: the frame is set to Cut-out, and the clip has the disc built in. Switch the frame to Circle or Rounded.'];
  if(!A) return ['wait','Plays once a track is loaded.'];
  const end=introEnd(); if(end<1) return ['off','Not playing: this track starts straight in side light, so there is no intro.'];
  const beat=A.grid?A.grid.beat:60/128, P0=beat*4*(+S.clipBars||2), n=Math.max(1,Math.round(end/P0));
  return ['on',`Playing: the first ${fmtTime(end)}, until the first change to side light (${n} sway${n>1?'s':''}).`];
}
function syncIntroNote(){ const el=$('introNote'); if(!el) return; const [k,txt]=introStatus(); el.textContent=txt; el.dataset.k=k; }
setInterval(syncIntroNote, 1000);
function introEnd(){ for(const c of CUES) if(c.p!==0) return c.t; return A ? A.dur : Infinity; }
function introFrame(t){
  if(S.introAnim===false || !CLIP.proc || S.subject!=='mascot' || S.frameShape==='cutout') return null;
  if(t > introEnd() + (+S.poseFade||3)) return null;
  const beat = A && A.grid ? A.grid.beat : 60/128, P0 = beat*4*(+S.clipBars||2), end=introEnd();
  // stretch the sway a touch so whole cycles fit the intro: it ends on the starting pose, which matches the still
  const P = isFinite(end) && end>P0*0.5 ? end/Math.max(1,Math.round(end/P0)) : P0, ph = t>=end ? 0 : ((t%P)+P)%P/P;
  const u=(1-Math.cos(2*Math.PI*ph))/2, xf=u*(CLIP.n-1), i=Math.floor(xf), f=xf-i, C=CLIP.cell, cols=CLIP.cols;
  if(!INTRO_C){ INTRO_C=document.createElement('canvas'); INTRO_C.width=INTRO_C.height=C; }
  const x=INTRO_C.getContext('2d'); x.clearRect(0,0,C,C);
  const cell=k=>[(k%cols)*C, Math.floor(k/cols)*C];
  const [ax,ay]=cell(i); x.globalAlpha=1; x.drawImage(CLIP.proc,ax,ay,C,C,0,0,C,C);
  if(f>0.01 && i+1<CLIP.n){ const [bx,by]=cell(i+1); x.globalAlpha=f; x.drawImage(CLIP.proc,bx,by,C,C,0,0,C,C); x.globalAlpha=1; }   // blend neighbours so the slow ends stay smooth
  return INTRO_C;
}

/* ---------------- subject art: cut-outs, logo plates, line art and print finishes ---------------- */
// a logo saved without transparency: if the corners share one plain colour, flood it away from the edges (inner whites stay)
async function knockOut(bmp){
  const n=Math.min(1,1600/Math.max(bmp.width,bmp.height)), W=Math.round(bmp.width*n), H=Math.round(bmp.height*n);
  const c=document.createElement('canvas'); c.width=W; c.height=H; const x=c.getContext('2d',{willReadFrequently:true}); x.drawImage(bmp,0,0,W,H);
  const id=x.getImageData(0,0,W,H), d=id.data, px=(i)=>[d[i],d[i+1],d[i+2],d[i+3]];
  const cs=[0,(W-1)*4,(H-1)*W*4,((H-1)*W+W-1)*4].map(px);
  if(cs.some(q=>q[3]<250)) return null;   // already transparent
  const ref=cs[0]; if(cs.some(q=>Math.abs(q[0]-ref[0])+Math.abs(q[1]-ref[1])+Math.abs(q[2]-ref[2])>36)) return null;
  const dist=i=>Math.abs(d[i]-ref[0])+Math.abs(d[i+1]-ref[1])+Math.abs(d[i+2]-ref[2]);
  const seen=new Uint8Array(W*H), st=[]; for(let i=0;i<W;i++){ st.push(i, (H-1)*W+i); } for(let j=0;j<H;j++){ st.push(j*W, j*W+W-1); }
  while(st.length){ const p=st.pop(); if(seen[p]) continue; seen[p]=1; const dd=dist(p*4); if(dd>60) continue;
    d[p*4+3] = dd<24 ? 0 : Math.round(255*(dd-24)/36); if(dd>=24) continue;
    const xx=p%W; if(xx>0) st.push(p-1); if(xx<W-1) st.push(p+1); if(p>=W) st.push(p-W); if(p<W*(H-1)) st.push(p+W); }
  x.putImageData(id,0,0); return await createImageBitmap(c);
}
let FIN = new WeakMap(), LOGO_C = null, LINE_C = null;
const tintWhole = b => tintCanvas(b);
function silhouette(img, colour, pad=0){ const c=document.createElement('canvas'); c.width=img.width+pad*2; c.height=img.height+pad*2; const x=c.getContext('2d');
  x.drawImage(img,pad,pad); x.globalCompositeOperation='source-in'; x.fillStyle=colour; x.fillRect(0,0,c.width,c.height); return c; }
function finishFor(img){   // cached once per image and settings: sticker edge, pre-blurred shadow, accent copy for the riso offset
  const key=[S.paperCol,S.blue,Math.round((S.fSticker||0)*20)].join();
  let f=FIN.get(img); if(f && f.key===key) return f;
  const pad=Math.round(img.width*0.06), sh=silhouette(img,'#000',pad), W=sh.width, H=sh.height;
  let st=null;
  if(S.fSticker>0){ const r=img.width*0.03*S.fSticker; st=document.createElement('canvas'); st.width=W; st.height=H; const x=st.getContext('2d');
    for(let i=0;i<24;i++){ const a=i/24*Math.PI*2; x.drawImage(sh,Math.cos(a)*r,Math.sin(a)*r); }
    x.drawImage(sh,0,0); x.globalCompositeOperation='source-in'; x.fillStyle=S.paperCol; x.fillRect(0,0,W,H); }
  const shadow=document.createElement('canvas'); shadow.width=W; shadow.height=H; const sx=shadow.getContext('2d'); sx.filter=`blur(${img.width*0.016}px)`; sx.drawImage(st||sh,0,0);
  const acc=silhouette(st||sh, S.blue);
  f={key,pad,st,shadow,acc}; FIN.set(img,f); return f;
}
function drawFinish(ctx, img, x, y, w, h, t){
  if(!img || !(S.fShadow>0 || S.fOffset>0 || S.fSticker>0)) return;
  const f=finishFor(img), px=f.pad*w/img.width, py=f.pad*h/img.height, X=x-px, Y=y-py, WW=w+px*2, HH=h+py*2;
  ctx.save();
  if(S.fShadow>0){ ctx.globalAlpha=0.32*S.fShadow; ctx.drawImage(f.shadow, X+w*0.008, Y+w*0.016, WW, HH); }
  if(S.fOffset>0){ const d=w*0.012*S.fOffset*(1+hitEnv(A&&A.kicks,t,0.2)*1.2); ctx.globalAlpha=0.9; ctx.globalCompositeOperation='multiply'; ctx.drawImage(f.acc, X+d, Y+d*0.6, WW, HH); ctx.globalCompositeOperation='source-over'; }
  if(f.st){ ctx.globalAlpha=1; ctx.drawImage(f.st, X, Y, WW, HH); }
  ctx.restore();
}
// line art: ink lines over a soft paper and accent wash inside the figure, so it reads as a print, not a hollow outline
let LINE_MASK=null;
function lineMask(img){
  if(LINE_MASK && LINE_MASK._src===img) return LINE_MASK;
  const W=img.width, H=img.height, c=document.createElement('canvas'); c.width=W; c.height=H; const x=c.getContext('2d',{willReadFrequently:true}); x.drawImage(img,0,0);
  const d=x.getImageData(0,0,W,H), a=d.data, out=new Uint8Array(W*H), st=[];
  for(let i=0;i<W;i++) st.push(i,(H-1)*W+i); for(let j=0;j<H;j++) st.push(j*W,j*W+W-1);
  while(st.length){ const p=st.pop(); if(out[p] || a[p*4+3]>40) continue; out[p]=1; const xx=p%W; if(xx>0) st.push(p-1); if(xx<W-1) st.push(p+1); if(p>=W) st.push(p-W); if(p<W*(H-1)) st.push(p+W); }
  for(let p=0;p<W*H;p++){ a[p*4]=a[p*4+1]=a[p*4+2]=0; a[p*4+3]=out[p]?0:255; }   // everything the outside can't reach is the figure
  x.putImageData(d,0,0); c._src=img; LINE_MASK=c; return c;
}
function lineArt(){ if(!IMGS.line) return null; const key=S.ink+S.paperCol+S.blue; if(LINE_C && LINE_C._k===key && LINE_C._src===IMGS.line) return LINE_C;
  const m=lineMask(IMGS.line), c=document.createElement('canvas'); c.width=m.width; c.height=m.height; const x=c.getContext('2d');
  const pr=hex2rgb(S.paperCol), ar=hex2rgb(S.blue); x.drawImage(m,0,0); x.globalCompositeOperation='source-in'; x.fillStyle=mixc(pr,ar,0.16); x.fillRect(0,0,c.width,c.height);
  x.globalCompositeOperation='source-over'; x.drawImage(silhouette(IMGS.line, S.ink),0,0);
  c._k=key; c._src=IMGS.line; LINE_C=c; return c; }
function logoArt(){
  const L=IMGS.logo; if(!L) return IMGS.a;
  const key=[S.logoTint,S.frameShape,S.ink,S.blue,S.paperCol].join(); if(LOGO_C && LOGO_C._k===key && LOGO_C._src===L) return LOGO_C;
  const n=1100, c=document.createElement('canvas'); c.width=c.height=n; const x=c.getContext('2d'), plate=S.frameShape!=='cutout';
  if(plate){ x.fillStyle = S.logoTint==='accent' ? S.ink : S.blue; x.beginPath(); if(S.frameShape==='rounded') x.roundRect(n*0.045,n*0.045,n*0.91,n*0.91,n*0.12); else x.arc(n/2,n/2,n*0.47,0,Math.PI*2); x.fill(); }
  const box = plate ? n*0.58 : n, k=box/Math.max(L.width,L.height), w=L.width*k, h=L.height*k;
  const src = S.logoTint==='original' ? L : silhouette(L, {ink:S.ink,accent:S.blue,paper:S.paperCol}[S.logoTint]||S.ink);
  x.drawImage(src,(n-w)/2,(n-h)/2,w,h); c._k=key; c._src=L; LOGO_C=c; return c;
}
// cut-out mascot: line art when quiet (optional), headphones go on at the peaks (optional)
function cutFor(p){
  const sec=Math.min(p===3?1:p,2), st=[S.styleQ, S.styleL, S.styleP][sec]||'colour';
  if(st==='line' && IMGS.line) return 'line';
  if((st==='sketch' || st==='halftone') && IMGS[st]) return st;
  if(sec===2){ if(S.phonesPeak && IMGS.cwear) return 'wear'; if(S.phonesPeak && IMGS.cutn && IMGS.phones) return 'phones'; if(IMGS.cpeak) return 'cpeak'; }
  return 'cut';
}
// nod level for the cut-out (0 none, 1 slight, 2 deep), same shape as the framed nod
function nodLevel(t){
  if(!A || !A.grid || S.nod<=0 || energyAt(t) < S.nodGate) return 0;
  const P=A.grid.beat*(+S.nodEvery||1), lead=0.12*P, hold=(0.14+0.16*S.nod)*P, tail=0.14*P, ph=(((t-A.grid.phase+lead)%P)+P)%P;
  const deep = S.nod>0.65 ? 2 : 1;
  return ph<lead ? 1 : ph<lead+hold ? deep : ph<lead+hold+tail ? 1 : 0;
}
let CUT_T=0;
function cutImg(kind){
  if(kind==='line') return nodded(lineArt()); if(kind==='phones') return IMGS.cutn;
  if(kind==='wear') return drawnNod(IMGS.cwear, IMGS.cwn1, IMGS.cwn2);
  if(kind==='cpeak') return drawnNod(IMGS.cpeak, IMGS.cpn1, IMGS.cpn2); if(kind==='sketch' || kind==='halftone') return nodded(IMGS[kind]);
  if(!IMGS.cn1 && !IMGS.cn2) return nodded(IMGS.cut);
  const n=nodLevel(CUT_T); return (n===2 && (IMGS.cn2||IMGS.cn1)) || (n>=1 && (IMGS.cn1||IMGS.cn2)) || IMGS.cut;
}
/* drawings without their own nod frames (peak smile, wearing, sketch, line, halftone) get a made nod:
   the head above the collar dips and tips forward by the same amount as the drawn nod frames, blended into the hoodie */
const SYN_NOD = new WeakMap();
// move: 'd1'/'d2' dip (shrug), 'l1'/'l2'/'r1'/'r2' tilt left or right, pivoting at the neck
function synthMove(img, move){
  if(!img || !move) return img;
  let cache = SYN_NOD.get(img); if(!cache){ cache={}; SYN_NOD.set(img,cache); }
  if(cache[move]) return cache[move];
  const W=img.width, H=img.height, s0=0.58*H, s1=0.67*H, mk=()=>{ const c=document.createElement('canvas'); c.width=W; c.height=H; return c; };
  // body: everything from the top of the blend zone down stays fully solid, so nothing behind can show through the join
  const body=mk(), bx=body.getContext('2d'); bx.drawImage(img,0,0); bx.clearRect(0,0,W,s0);
  // head: solid above the blend zone, fading out through it, drawn over the solid body
  const head=mk(), hx=head.getContext('2d'); hx.drawImage(img,0,0); hx.globalCompositeOperation='destination-in';
  const gr=hx.createLinearGradient(0,s0,0,s1); gr.addColorStop(0,'#000'); gr.addColorStop(1,'rgba(0,0,0,0)'); hx.fillStyle=gr; hx.fillRect(0,0,W,s1);
  const out=mk(), o=out.getContext('2d'), lv=+move[1], px=0.5*W, py=0.64*H;
  o.drawImage(body,0,0);
  if(move[0]==='d'){ const dy=[0,0.008,0.013][lv]*H, sq=[0,0.004,0.007][lv]; o.translate(0,py+dy); o.scale(1,1-sq); o.translate(0,-py); }
  else { const ang=(move[0]==='l'?-1:1)*[0,2.6,4][lv]*Math.PI/180; o.translate(px,py); o.rotate(ang); o.translate(-px,-py); }
  o.drawImage(head,0,0);
  cache[move]=out; return out;
}
function madeMove(t){
  const lv=nodLevel(t); if(!lv || !A || !A.grid) return null;
  const P=A.grid.beat*(+S.nodEvery||1), i=Math.floor((t-A.grid.phase+0.12*P)/P), m=S.headMove||'shrug';
  if(m==='shrug') return 'd'+lv;
  if(m==='tilt') return (i%2?'r':'l')+lv;
  return i%2===0 ? 'd'+lv : (Math.floor(i/2)%2 ? 'r' : 'l')+lv;   // both: shrug, tilt left, shrug, tilt right
}
function nodded(img){ return synthMove(img, madeMove(CUT_T)); }
// drawn nod frames when this drawing has them, otherwise the made head move
function drawnNod(img, n1, n2){ if(!img) return img; if(!n1 && !n2) return nodded(img); const n=nodLevel(CUT_T); return (n===2 && (n2||n1)) || (n>=1 && (n1||n2)) || img; }
/* headphones worn on the head: the art's cups sit too close together for this head, so it is drawn in three pieces.
   Source boxes are shares of the headphones image; targets are shares of the cut-out canvas (ears at about y 0.39, x 0.205 and 0.795). */
const PHONES_FIT = { band:{src:[0.15,0,0.85,0.4], dst:[0.15,0.005,0.85,0.31]},
  cupL:{src:[0.12,0.42,0.42,0.92], c:[0.205,0.39]}, cupR:{src:[0.58,0.42,0.88,0.92], c:[0.795,0.39]}, cupW:0.17 };
function drawCut(ctx, kind, sz, t, alpha){
  const img=cutImg(kind); if(!img) return;
  ctx.save(); ctx.globalAlpha=alpha; ctx.drawImage(img,-sz/2,-sz/2,sz,sz);
  if(kind==='phones'){ const P=IMGS.phones, F=PHONES_FIT, kk=hitEnv(A&&A.kicks,t,0.18), pw=P.width, ph=P.height;
    ctx.translate(0, -kk*sz*0.008); const g=1+kk*0.03, X=v=>(-0.5+v)*sz, Y=v=>(-0.5+v)*sz;
    const piece=(src,dx0,dy0,dx1,dy1)=>ctx.drawImage(P, src[0]*pw, src[1]*ph, (src[2]-src[0])*pw, (src[3]-src[1])*ph, X(dx0), Y(dy0), (dx1-dx0)*sz, (dy1-dy0)*sz);
    const b=F.band.dst, bw=(b[2]-b[0])*g, bc=(b[0]+b[2])/2; piece(F.band.src, bc-bw/2, b[1]-(g-1)*0.04, bc+bw/2, b[3]);
    for(const cup of [F.cupL,F.cupR]){ const s=cup.src, cw=F.cupW*g, ch=cw*((s[3]-s[1])*ph)/((s[2]-s[0])*pw); piece(s, cup.c[0]-cw/2, cup.c[1]-ch/2, cup.c[0]+cw/2, cup.c[1]+ch/2); } }
  ctx.restore();
}
function drawSubjectText(ctx,W,H,U,cx,cy,size,scale,rot,t){
  const lc = s => S.lowercase ? s.toLowerCase().replace(/skixo/g,'skixO') : s;
  const title = lc(S.title||''); if(!title) return;
  const words=title.split(/\s+/), lines=[]; let cur='';
  for(const w of words){ if(cur && (cur+' '+w).length>12){ lines.push(cur); cur=w; } else cur = cur ? cur+' '+w : w; } if(cur) lines.push(cur);
  let fs = size*0.2*(S.textScale||1); ctx.font=`600 ${fs}px ${FONT()}`;
  const widest=Math.max(...lines.map(l=>ctx.measureText(l).width)); if(widest>W*0.86) fs*=W*0.86/widest;
  ctx.save(); ctx.translate(cx,cy); ctx.rotate(rot); ctx.scale(scale,scale);
  ctx.font=`600 ${fs}px ${FONT()}`; ctx.letterSpacing=`${fs*-0.02}px`; ctx.textAlign='center'; ctx.textBaseline='middle';
  const lh=fs*1.02, y0=-(lines.length-1)*lh/2 - fs*0.12;
  const pass=(fn)=>lines.forEach((l,i)=>fn(l,0,y0+i*lh));
  if(S.fShadow>0){ ctx.save(); ctx.shadowColor=`rgba(40,28,16,${0.35*S.fShadow})`; ctx.shadowBlur=fs*0.12; ctx.shadowOffsetY=fs*0.04; ctx.fillStyle=S.ink; pass((l,x,y)=>ctx.fillText(l,x,y)); ctx.restore(); }
  if(S.fSticker>0){ ctx.lineJoin='round'; ctx.lineWidth=fs*0.16*S.fSticker; ctx.strokeStyle=S.paperCol; pass((l,x,y)=>ctx.strokeText(l,x,y)); }
  if(S.fOffset>0){ const d=fs*0.04*S.fOffset*(1+hitEnv(A&&A.kicks,t,0.2)*1.2); ctx.save(); ctx.globalCompositeOperation='multiply'; ctx.fillStyle=S.blue; pass((l,x,y)=>ctx.fillText(l,x+d,y+d*0.6)); ctx.restore(); }
  ctx.fillStyle=S.ink; pass((l,x,y)=>ctx.fillText(l,x,y));
  if(S.showArtist!==false && S.artist){ const as=fs*0.2; ctx.font=`500 ${as}px ${FONT()}`; ctx.letterSpacing=`${as*0.14}px`; ctx.fillStyle=S.blue; ctx.fillText(S.artist, 0, y0+(lines.length-1)*lh+fs*0.62+as); }
  ctx.restore(); ctx.letterSpacing='0px';
}
function buildNod(slot){
  const raw = RAW[slot]; if(!raw) return;
  const base = slot.endsWith('c') ? IMGS.b : slot.endsWith('p') ? IMGS.c : IMGS.a; if(!base) return;
  const n = base.width, [ox,oy] = alignOffset(base._src, raw);
  const head = document.createElement('canvas'); head.width=head.height=n; const hx=head.getContext('2d');
  hx.drawImage(tintCanvas(raw), ox*n, oy*n, n, n);
  hx.globalCompositeOperation='destination-in'; hx.filter=`blur(${n*0.025}px)`; hx.fillStyle='#000';
  // everything above the collar comes from the nod frame; the seam sits low in the hoodie, where both frames match
  hx.fillRect(-n*0.1, -n*0.1, n*1.2, n*(0.1+0.76));
  const out = document.createElement('canvas'); out.width=out.height=n; const o=out.getContext('2d');
  o.drawImage(base,0,0); o.drawImage(head,0,0);
  o.globalCompositeOperation='destination-in'; o.drawImage(base,0,0);   // keep the disc's soft edge
  out._src = raw; IMGS[slot] = out; requestDraw();
}

async function loadWordmark(){
  try{
    if(!wordmarkSrc) wordmarkSrc = await (await fetch('assets/wordmark.svg')).text();
    let svg = wordmarkSrc.replace(/fill="#[0-9a-fA-F]{3,6}"/, `fill="${S.ink}"`);
    // give the SVG an explicit size from its viewBox so every browser rasterises the whole mark
    const vb = (svg.match(/viewBox="([^"]+)"/)||[])[1];
    if(vb){ const [,,vw,vh] = vb.trim().split(/[\s,]+/).map(Number); svg = svg.replace(/<svg\b(?![^>]*\bwidth=)/, `<svg width="${Math.round(vw*4)}" height="${Math.round(vh*4)}"`); }
    const img = new Image(); img.src = URL.createObjectURL(new Blob([svg],{type:'image/svg+xml'}));
    await img.decode(); wordmarkImg = img; requestDraw();
  }catch(e){ wordmarkImg = null; }
}

/* ---------------- audio + analysis ---------------- */
let actx = null, buffer = null, A = null, CUES = [];
const HOP = 0.01; // analysis frame = 10 ms
function getCtx(){ if(!actx) actx = new (window.AudioContext||window.webkitAudioContext)({sampleRate:48000}); return actx; }
async function bandRender(buf, type, freq){
  const oc = new OfflineAudioContext(1, buf.length, buf.sampleRate);
  const src = oc.createBufferSource(); src.buffer = buf;
  const f1 = oc.createBiquadFilter(); f1.type=type; f1.frequency.value=freq; f1.Q.value=0.7;
  const f2 = oc.createBiquadFilter(); f2.type=type; f2.frequency.value=freq; f2.Q.value=0.7;
  src.connect(f1).connect(f2).connect(oc.destination); src.start();
  return (await oc.startRendering()).getChannelData(0);
}
function envelope(x, sr){
  const hop = Math.round(sr*HOP), n = Math.floor(x.length/hop), e = new Float32Array(n);
  for(let i=0;i<n;i++){ let s=0; const o=i*hop; for(let j=0;j<hop;j++){ const v=x[o+j]; s+=v*v; } e[i]=Math.sqrt(s/hop); }
  return e;
}
function pct(arr, p){ const a = Float32Array.from(arr).sort(); return a[Math.min(a.length-1, Math.floor(p*a.length))]; }
function onsets(env, gapFrames, thr){
  const l = env.map(v=>Math.log1p(v*60));
  const on = new Float32Array(l.length);
  for(let i=2;i<l.length;i++) on[i] = Math.max(0, l[i]-Math.max(l[i-1],l[i-2]));
  const nz = Array.from(on).filter(v=>v>0.002); const ref = nz.length? pct(nz,0.985) : 1;
  const hits=[]; let last=-1e9;
  for(let i=3;i<on.length-3;i++){
    const v = on[i]/ref; if(v<thr) continue;
    let peak = true; for(let k=-3;k<=3;k++) if(on[i+k]>on[i]) {peak=false;break;}
    if(!peak) continue;
    if(i-last < gapFrames){ if(hits.length && v>hits[hits.length-1].s){ hits[hits.length-1]={t:i*HOP,s:Math.min(1,v)}; last=i; } continue; }
    hits.push({t:i*HOP, s:Math.min(1,v)}); last=i;
  }
  return hits;
}
async function analyse(buf){
  setStatus('Analysing track…', true);
  const sr = buf.sampleRate, n = buf.length;
  const mono = new Float32Array(n);
  for(let c=0;c<buf.numberOfChannels;c++){ const d=buf.getChannelData(c); for(let i=0;i<n;i++) mono[i]+=d[i]/buf.numberOfChannels; }
  const lo = await bandRender(buf,'lowpass',140);
  const hi = await bandRender(buf,'highpass',5000);
  const E = envelope(mono,sr), L = envelope(lo,sr), H = envelope(hi,sr);
  // smoothed energy (3 s box) normalised 5th..97th percentile
  const w = 300, cs = new Float64Array(E.length+1); for(let i=0;i<E.length;i++) cs[i+1]=cs[i]+E[i];
  const sm = new Float32Array(E.length);
  for(let i=0;i<E.length;i++){ const a=Math.max(0,i-w/2|0), b=Math.min(E.length,i+w/2|0); sm[i]=(cs[b]-cs[a])/(b-a); }
  const p5 = pct(sm,0.05), p97 = pct(sm,0.97);
  const energy = sm.map(v=>Math.max(0,Math.min(1,(v-p5)/(p97-p5||1))));
  const kicks = onsets(L, 18, 0.32), hats = onsets(H, 7, 0.3);
  A = { sr, mono, dur: buf.duration, energy, kicks, hats };
  A.grid = beatGrid(); showGrid();
  $('kickcount').textContent = `${kicks.length} kicks · ${hats.length} hats detected`;
  rebuildCues(); drawTimeline(); setStatus('Ready');
}
/* Tempo and downbeat from the kicks: autocorrelation for a rough period, then a fine search
   that maximises how well kicks line up with a bar grid (also gives the downbeat phase). */
function beatGrid(){
  if(!A) return null;
  const ks = A.kicks.filter(k=>k.s>=0.35); if(ks.length<8) return null;
  const barScore = (beat)=>{ let re=0, im=0; const P=beat*4; for(const k of ks){ const a=2*Math.PI*k.t/P; re+=k.s*Math.cos(a); im+=k.s*Math.sin(a); } return {mag:Math.hypot(re,im), phase:((Math.atan2(im,re)/(2*Math.PI))*P + P) % P}; };
  let beat;
  const manual = parseFloat(S.bpm);
  if(manual>40 && manual<300) beat = 60/manual;
  else {
    const n = Math.ceil(A.dur/HOP)+2, tr = new Float32Array(n);
    for(const k of ks) tr[Math.round(k.t/HOP)] += k.s;
    let bestLag=0, best=-1;
    for(let lag=Math.round(0.3/HOP); lag<=Math.round(0.9/HOP); lag++){
      let sc=0; for(let i=1;i<n-lag-1;i++) if(tr[i]) sc += tr[i]*(tr[i+lag] + 0.5*(tr[i+lag-1]+tr[i+lag+1]));
      if(sc>best){ best=sc; bestLag=lag; } }
    let bpm = 60/(bestLag*HOP); while(bpm<90) bpm*=2; while(bpm>190) bpm/=2;
    let b0 = 60/bpm, bestB=b0, bestM=-1;
    for(let f=0.985; f<=1.015; f+=0.00025){ const m=barScore(b0*f).mag; if(m>bestM){ bestM=m; bestB=b0*f; } }
    beat = bestB;
  }
  return { beat, phase: barScore(beat).phase, bpm: 60/beat };
}
function showGrid(){ const el=$('bpmFound'); if(el) el.textContent = A && A.grid ? `${A.grid.bpm.toFixed(1)} BPM` : '–'; }
function nodFrame(t, img){
  if(!A || !A.grid || S.nod<=0 || img>2) return null;
  const e = ['f','c','p'][img], f1 = IMGS['n1'+e], f2 = IMGS['n2'+e];
  if(!f1 && !f2) return null;
  if(energyAt(t) < S.nodGate) return null;
  const P = A.grid.beat * (+S.nodEvery || 1);
  // shape scales with the nod length: ease down before the beat, lowest on it, linger, ease back up
  const lead = 0.12*P, hold = (0.14 + 0.16*S.nod)*P, tail = 0.14*P;
  const ph = (((t - A.grid.phase + lead) % P) + P) % P;
  const shallow = f1 || f2, deep = (S.nod > 0.65 && f2) ? f2 : shallow;
  if(ph < lead) return shallow;
  if(ph < lead + hold) return deep;
  if(ph < lead + hold + tail) return shallow;
  return null;
}

function setStatus(t, busy){ const s=$('status'); s.textContent=t; s.classList.toggle('busy',!!busy); }
async function loadAudio(src){
  setStatus('Decoding audio…', true);
  const ab = src instanceof Blob ? await src.arrayBuffer() : await (await fetch(src)).arrayBuffer();
  stop();
  buffer = await getCtx().decodeAudioData(ab);
  playhead = Math.min(playhead, buffer.duration-0.1);
  await analyse(buffer);
  $('play').disabled = false; $('export').disabled = false; $('canvasLoop').disabled = false; if(typeof recProgress==='function') recProgress(null); if(window.KIT_READY) kitSync();
  requestDraw();
}
/* envelope from discrete hits, evaluated statelessly at t */
function hitEnv(list, t, decay, minS=0){
  if(!list || !list.length) return 0;
  let lo=0, hi=list.length-1, idx=-1;
  while(lo<=hi){ const m=(lo+hi)>>1; if(list[m].t<=t){ idx=m; lo=m+1; } else hi=m-1; }
  let v=0;
  for(let i=idx;i>=0;i--){ const a=t-list[i].t; if(a>decay*6) break; if(list[i].s<minS) continue; v += list[i].s*Math.exp(-a/decay)*Math.min(1,a/0.012+0.2); }
  return Math.min(1,v);
}
function recentHits(list, t, span, minS){
  const out=[]; if(!list) return out;
  let lo=0, hi=list.length-1, idx=-1;
  while(lo<=hi){ const m=(lo+hi)>>1; if(list[m].t<=t){ idx=m; lo=m+1; } else hi=m-1; }
  for(let i=idx;i>=0;i--){ const a=t-list[i].t; if(a>span) break; if(list[i].s>=minS) out.push({a, s:list[i].s}); }
  return out;
}
function energyAt(t){ if(!A) return 0; const i=Math.max(0,Math.min(A.energy.length-1, Math.round(t/HOP))); return A.energy[i]; }

/* ---------------- poses / cues ---------------- */
const POSE_NAMES = ['closed','light','open'];
/* Light follows the energy (flat / side). The peak face goes to the N biggest moments of the track:
   the highest points of the smoothed energy, at least 20 s apart, each widened to the surrounding plateau. */
function lightCues(){
  const cues=[{t:0,p:0}]; let cur=0, lastT=-1e9; const hy=0.04;
  for(let i=0;i<A.energy.length;i+=5){
    const e=A.energy[i], t=i*HOP, want = e >= S.poseLow+(cur<1?hy:-hy) ? 1 : 0;
    if(want!==cur && t-lastT>=S.poseHold){ cur=want; lastT=t; cues.push({t,p:cur}); }
  }
  return cues;
}
function biggestMoments(n){
  const B=50, bins=[];   // 0.5 s bins
  for(let i=0;i<A.energy.length;i+=B){ let m=0,c=0; for(let j=i;j<Math.min(i+B,A.energy.length);j++){ m+=A.energy[j]; c++; } bins.push(m/c); }
  const out=[]; const sep=40;
  for(let k=0;k<n;k++){
    let bi=-1, bv=0.5;
    bins.forEach((v,i)=>{ if(v>bv && out.every(o=>Math.abs(i-o.c)>=sep && (i<o.a-sep/2 || i>o.b+sep/2))){ bv=v; bi=i; } });
    if(bi<0) break;
    let a=bi, b=bi; const floor=Math.max(0.5, bv-0.09);
    while(a>0 && bins[a-1]>=floor && (bi-a)<18) a--;
    while(b<bins.length-1 && bins[b+1]>=floor && (b-bi)<18) b++;
    while(b-a<12){ if(a>0) a--; if(b<bins.length-1) b++; if(a===0&&b===bins.length-1) break; }
    out.push({c:bi,a,b});
  }
  return out.map(o=>({t0:o.a*B*HOP, t1:(o.b+1)*B*HOP})).sort((x,y)=>x.t0-y.t0);
}
function autoCues(){
  if(!A) return [{t:0,p:0}];
  const light = lightCues();
  const lightAt = t => { let p=0; for(const c of light){ if(c.t<=t) p=c.p; else break; } return p; };
  const peaks = (+S.peakCount>0) ? biggestMoments(+S.peakCount) : [];
  let cues = light.filter(c=>!peaks.some(pk=>c.t>=pk.t0 && c.t<pk.t1));
  for(const pk of peaks){ cues.push({t:pk.t0,p:2}); cues.push({t:pk.t1,p:lightAt(pk.t1)}); }
  cues.sort((a,b)=>a.t-b.t);
  return cues.filter((c,i)=> i===0 || c.p!==cues[i-1].p);
}
function parseCues(txt){
  const out=[];
  for(const line of txt.split(/\n/)){
    const m = line.trim().match(/^(\d+):(\d{1,2}(?:\.\d+)?)\s+(\w+)/) || line.trim().match(/^(\d+(?:\.\d+)?)()\s+(\w+)/);
    if(!m) continue;
    const t = m[2]!=='' ? (+m[1])*60 + (+m[2]) : +m[1];
    const w = m[3].toLowerCase();
    const p = w.startsWith('o')||w==='c3'||w==='eyes' ? 2 : w.startsWith('l')||w.startsWith('s') ? 1 : 0;
    out.push({t,p});
  }
  out.sort((a,b)=>a.t-b.t);
  if(!out.length || out[0].t>0) out.unshift({t:0,p:0});
  return out;
}
function cuesToText(c){ return c.map(q=>`${fmtTime(q.t,true)} ${POSE_NAMES[q.p]}`).join('\n'); }
function rebuildCues(){ CUES = S.poseMode==='manual' ? parseCues(S.manualCues) : autoCues(); KEYS = compileKeys(CUES); drawTimeline(); requestDraw(); }

/* Cues say what each section should look like; keys say exactly which frame shows when.
   Frames: 0 eyes closed (flat light), 1 eyes closed (side light), 2 eyes open (side light), 3 optional half-open in-between.
   Light changes fade slowly; eye changes are near-instant swaps, snapped to a kick, like a drawn animation frame. */
let KEYS = [];
function nextKick(t){
  if(!A) return t;
  for(const k of A.kicks){ if(k.t < t-0.05) continue; if(k.t > t+1.2) break; if(k.s>=0.5) return k.t; }
  return t;
}
function compileKeys(cues){
  if(!IMGS.c) cues = cues.map(q=>({t:q.t, p:Math.min(q.p,1)})).filter((q,i,arr)=> i===0 || q.p!==arr[i-1].p);
  const K=[]; const dur = A ? A.dur : 600;
  const add=(t,img,fade)=>{ if(K.length){ const L=K[K.length-1]; if(L.img===img) return; t=Math.max(t, L.t+L.fade); } K.push({t,img,fade}); };
  const half = !!IMGS.h, ef = S.eyeFade;
  const eyesTo=(t,img)=>{ if(half){ add(t,3,0); add(t+0.07,img,ef); } else add(t,img,ef); };
  const blink=(t)=>{ if(half){ add(t,3,0); add(t+0.04,1,0); add(t+0.12,3,0); add(t+0.17,2,0); } else { add(t,1,0); add(t+0.13,2,0); } };
  const r = rng(321);
  add(0, cues[0].p, 0);
  for(let i=1;i<=cues.length;i++){
    const prev = cues[i-1].p, endT = i<cues.length ? cues[i].t : dur;
    // blinks while the eyes are open
    if(prev===2 && S.blinks>0){
      const gap = 10 - S.blinks*7.5;
      let bt = cues[i-1].t + 2.5 + r()*gap;
      while(bt < endT-1.5){ blink(bt); bt += gap*(0.6+r()*0.8); }
    }
    if(i===cues.length) break;
    const p = cues[i].p; let t = cues[i].t;
    const eyes = (prev===2)!==(p===2);
    if(!eyes){ add(t, p, S.poseFade); continue; }
    if(S.snapKick) t = nextKick(t);
    if(p===2){ if(prev===0) add(t-S.poseFade, 1, S.poseFade); eyesTo(t, 2); }
    else { eyesTo(t, 1); if(p===0) add(t+0.5, 0, S.poseFade); }
  }
  return K;
}
function poseState(t){
  if(!KEYS.length) return {from:0,to:0,mix:1};
  let lo=0, hi=KEYS.length-1, i=0;
  while(lo<=hi){ const m=(lo+hi)>>1; if(KEYS[m].t<=t){ i=m; lo=m+1; } else hi=m-1; }
  const k=KEYS[i], from = i>0 ? KEYS[i-1].img : k.img;
  const p = k.fade>0 ? Math.min(1, Math.max(0, (t-k.t)/k.fade)) : 1;
  return { from, to:k.img, mix: p*p*(3-2*p) };
}

/* ---------------- procedural textures (seeded) ---------------- */
function rng(seed){ let s = seed>>>0 || 1; return ()=>{ s^=s<<13; s>>>=0; s^=s>>>17; s^=s<<5; s>>>=0; return s/4294967296; }; }
function hash(n){ n = Math.imul(n ^ 0x9e3779b9, 0x85ebca6b); n ^= n>>>13; n = Math.imul(n, 0xc2b2ae35); n ^= n>>>16; return (n>>>0)/4294967296; }
const GRAIN = [];
for(let k=0;k<4;k++){
  const c=document.createElement('canvas'); c.width=c.height=256; const x=c.getContext('2d'); const id=x.createImageData(256,256); const r=rng(77+k*13);
  for(let i=0;i<id.data.length;i+=4){ const v = 128 + (r()+r()+r()-1.5)*110; id.data[i]=id.data[i+1]=id.data[i+2]=v; id.data[i+3]=255; }
  x.putImageData(id,0,0); GRAIN.push(c);
}
let CLOUDS = [];
function makeClouds(blue){
  CLOUDS = [];
  for(let k=0;k<4;k++){
    const W=700,H=260, c=document.createElement('canvas'); c.width=W; c.height=H; const x=c.getContext('2d'); const r=rng(1000+k*31);
    const blobs=[]; const nb=4+Math.floor(r()*3);
    for(let b=0;b<nb;b++) blobs.push({x:W*(0.18+0.64*b/(nb-1)) + (r()-0.5)*60, y:H*(0.55 - 0.25*Math.sin(Math.PI*b/(nb-1))*r()), sx:60+r()*70, sy:28+r()*30});
    x.fillStyle = blue;
    for(let i=0;i<26000;i++){
      const px=r()*W, py=r()*H; let d=0;
      for(const b of blobs){ const dx=(px-b.x)/b.sx, dy=(py-b.y)/b.sy; d += Math.exp(-(dx*dx+dy*dy)/2); }
      d = Math.min(1,d) * (py>H*0.72 ? Math.max(0,1-(py-H*0.72)/(H*0.2)) : 1);
      if(r() < d*d*0.9){ const s=0.6+r()*1.3; x.globalAlpha = 0.35+r()*0.6; x.fillRect(px,py,s,s); }
    }
    CLOUDS.push(c);
  }
}
const DASH_LANES = (()=>{ const r=rng(4242), lanes=[]; for(let i=0;i<12;i++){ const segs=[]; let off=0; const n=2+Math.floor(r()*4); for(let j=0;j<n;j++){ const len=0.012+r()*0.07; segs.push([off,len, r()<0.3?0.5:1]); off+=len+0.006+r()*0.02; } lanes.push({y:0.08+r()*0.84, speed:0.25+r()*0.9, phase:r(), segs, total:off, thick:0.0035+r()*0.004, dir: r()<0.5?-1:1}); } return lanes; })();
const CLOUD_SLOTS = (()=>{ const r=rng(99), o=[]; for(let i=0;i<6;i++) o.push({y:0.08+r()*0.8, s:0.55+r()*0.8, speed:0.3+r()*0.7, phase:r(), sprite:i%4, flip:r()<0.5}); return o; })();

let overlayCache = {};
function overlay(W,H){
  const key = W+'x'+H+S.paperCol+S.vignette;
  if(overlayCache[key]) return overlayCache[key];
  const c=document.createElement('canvas'); c.width=W; c.height=H; const x=c.getContext('2d');
  // paper mottle
  const sm=document.createElement('canvas'); sm.width=160; sm.height=90; const sx=sm.getContext('2d'); const r=rng(5);
  const id=sx.createImageData(160,90); for(let i=0;i<id.data.length;i+=4){ const v=r(); id.data[i]=120; id.data[i+1]=96; id.data[i+2]=70; id.data[i+3]=v*10; } sx.putImageData(id,0,0);
  x.imageSmoothingQuality='high'; x.drawImage(sm,0,0,W,H);
  // vignette
  const g=x.createRadialGradient(W/2,H/2,Math.min(W,H)*0.35,W/2,H/2,Math.hypot(W,H)*0.6);
  g.addColorStop(0,'rgba(70,50,30,0)'); g.addColorStop(1,`rgba(70,50,30,${0.38*S.vignette})`);
  x.fillStyle=g; x.fillRect(0,0,W,H);
  overlayCache = {[key]:c}; return c;
}

/* ---------------- spectrum (stateless FFT at t) ---------------- */
const FFT_N = 2048, HANN = new Float32Array(FFT_N).map((_,i)=>0.5-0.5*Math.cos(2*Math.PI*i/(FFT_N-1)));
const re = new Float32Array(FFT_N), im = new Float32Array(FFT_N);
function fft(){
  const n=FFT_N;
  for(let i=1,j=0;i<n;i++){ let bit=n>>1; for(;j&bit;bit>>=1) j^=bit; j^=bit; if(i<j){ [re[i],re[j]]=[re[j],re[i]]; [im[i],im[j]]=[im[j],im[i]]; } }
  for(let len=2;len<=n;len<<=1){ const ang=-2*Math.PI/len, wr=Math.cos(ang), wi=Math.sin(ang);
    for(let i=0;i<n;i+=len){ let cr=1,ci=0; for(let j=0;j<len/2;j++){ const a=i+j,b=a+len/2; const tr=re[b]*cr-im[b]*ci, ti=re[b]*ci+im[b]*cr; re[b]=re[a]-tr; im[b]=im[a]-ti; re[a]+=tr; im[a]+=ti; const nr=cr*wr-ci*wi; ci=cr*wi+ci*wr; cr=nr; } } }
}
const BANDS = 40;
function spectrumAt(t){
  const out = new Float32Array(BANDS); if(!A) return out;
  for(const dt of [0, 1/50]){
    const c = Math.round((t-dt)*A.sr) - FFT_N/2;
    for(let i=0;i<FFT_N;i++){ const k=c+i; re[i] = (k>=0&&k<A.mono.length? A.mono[k]:0)*HANN[i]; im[i]=0; }
    fft();
    for(let b=0;b<BANDS;b++){
      const f0 = 45*Math.pow(12000/45, b/BANDS), f1 = 45*Math.pow(12000/45,(b+1)/BANDS);
      const i0 = Math.max(1,Math.floor(f0/A.sr*FFT_N)), i1 = Math.max(i0+1,Math.ceil(f1/A.sr*FFT_N));
      let m=0; for(let i=i0;i<i1;i++) m=Math.max(m, Math.hypot(re[i],im[i]));
      const db = 20*Math.log10(m/ (FFT_N/4) + 1e-9) + b*0.35; // gentle tilt so highs register
      out[b] += Math.pow(Math.max(0, Math.min(1, (db+38)/32)), 1.6) * 0.5;
    }
  }
  return out;
}

/* ---------------- the frame ---------------- */
/* Motion settings can differ per section (quiet / lifted / peak). For each frame the effective
   settings are the defaults with that section's overrides, blended across section changes. */
const MKEYS = ['breathe','kick','sway','rings','spectrum','misprint','nod','glitch','glitchTear','glitchSplit','glitchBlocks','glitchRoll','gSort','gMosh','gMirror','echo'];
const SECK = ['q','l','p'];
function motionAt(t){
  const m=S.mAdj; if(!m || !(Object.keys(m.q||{}).length||Object.keys(m.l||{}).length||Object.keys(m.p||{}).length)) return S;
  const ps=poseState(t), a=SECK[Math.min(ps.from,2)], b=SECK[Math.min(ps.to,2)], out=Object.assign({},S);
  for(const k of MKEYS){ const va=(m[a]&&m[a][k])??S[k], vb=(m[b]&&m[b][k])??S[k]; out[k]=va+(vb-va)*ps.mix; }
  return out;
}
function frame(ctx, W, H, t){
  const S0=S; S=motionAt(t);
  try{ frameInner(ctx,W,H,t); } finally { S=S0; }
}
function frameInner(ctx, W, H, t){
  const U = Math.min(W,H);             // unit: short side
  const tall = H > W;
  const dur = A ? A.dur : 200;
  const k = hitEnv(A&&A.kicks, t, 0.16) * S.kick;
  const hat = hitEnv(A&&A.hats, t, 0.09);
  const en = energyAt(t);

  ctx.save();
  ctx.globalCompositeOperation='source-over'; ctx.globalAlpha=1;
  ctx.fillStyle = S.bgColour || S.paperCol; ctx.fillRect(0,0,W,H);
  if(S.layout!=='wallpaper'){
    // background scenes: one for the whole track, or one each for quiet, lifted and peak sections
    const ps0 = poseState(t), a = bgFor(ps0.from), b = bgFor(ps0.to);
    if(sameBg(a,b)) drawBg(ctx,W,H,t,a,1);
    else { if(a) drawBg(ctx,W,H,t,a,1-ps0.mix); if(b) drawBg(ctx,W,H,t,b,ps0.mix); }
  }

  // badge geometry
  let size, cx, cy;
  if(S.layout==='close'){
    // close-up: the badge fills the frame and the shoulders run off the bottom edge
    if(tall){ size = W*1.22*(S.badgeSize/0.8); cx=W/2; cy=H*0.39; }
    else { size = H*1.16*(S.badgeSize/0.8); cx=W/2; cy=H*0.64; }
  }
  else if(tall){ size = W*Math.min(1.05, S.badgeSize*1.12); cx=W/2; cy=H*0.41; }
  else { size = H*S.badgeSize; cx=W/2; cy=H*0.5; }
  cy += (S.portraitY||0)*H;   // positive moves down
  const breathe = 1 + Math.sin(t*2*Math.PI/7.5)*0.008*S.breathe;
  const scale = breathe * (1 + k*0.022);
  const rot = (Math.sin(t*2*Math.PI/13)*0.6 + Math.sin(t*2*Math.PI/5.3)*0.15) * S.sway * Math.PI/180;
  const discR = size*0.472*scale;

  if(S.layout==='wallpaper' && IMGS.w){
    const img = IMGS.w;
    const z = (1.06 + Math.sin(t*2*Math.PI/40)*0.015*S.breathe) * (1+k*0.012);
    const s = Math.max(W/img.width, H/img.height)*z;
    const px = Math.sin(t*2*Math.PI/61)*W*0.012*S.sway;
    ctx.save(); ctx.translate(W/2+px, H/2); ctx.rotate(rot*0.5);
    ctx.drawImage(img, -img.width*s/2, -img.height*s/2, img.width*s, img.height*s);
    if(S.misprint>0 && hat>0.05){ ctx.globalCompositeOperation='multiply'; ctx.globalAlpha=Math.min(.5,hat*S.misprint*0.6); ctx.drawImage(img, -img.width*s/2 + hat*S.misprint*U*0.006, -img.height*s/2, img.width*s, img.height*s); }
    ctx.restore();
    // disc in the supplied wide scene: centre (0.499w, 0.479h), radius 0.258w
    cx = W/2+px + (0.499-0.5)*img.width*s; cy = H/2 + (0.479-0.5)*img.height*s;
    const wdisc = 0.258*img.width*s;
    drawAtmos(ctx,W,H,U,t,hat,0.6);
    drawRings(ctx,cx,cy,wdisc,U,t);
  } else {
    drawAtmos(ctx,W,H,U,t,hat,1);
    // window light: a slow warm wash
    if(S.light>0){
      const lx = W*(0.25+0.5*(0.5+0.5*Math.sin(t*2*Math.PI/53))), ly = H*0.15;
      const g = ctx.createRadialGradient(lx,ly,0,lx,ly,U*0.9);
      g.addColorStop(0,`rgba(255,226,170,${0.22*S.light})`); g.addColorStop(1,'rgba(255,226,170,0)');
      ctx.globalCompositeOperation='multiply'; ctx.fillStyle=g; ctx.fillRect(0,0,W,H); ctx.globalCompositeOperation='source-over';
    }
    drawRings(ctx,cx,cy,discR,U,t);
    drawSpectrum(ctx,cx,cy,size*0.5*scale+U*0.012,U,t);
    // subject: mascot frames, a cut-out, a logo or the title itself
    const ps = poseState(t), sub = S.subject||'mascot', cutout = S.frameShape==='cutout';
    if(sub==='text'){ drawSubjectText(ctx,W,H,U,cx,cy,size,scale,rot,t); }
    else {
      let base, top, mix = ps.mix, cutKinds = null;
      if(sub==='image'){ base = top = logoArt(); mix = 1; }
      else if(cutout && IMGS.cut){ CUT_T = t; cutKinds = [cutFor(ps.from), cutFor(ps.to)];
        if(cutKinds[0]!==cutKinds[1]){ cutKinds = mix<0.5 ? [cutKinds[0],cutKinds[0]] : [cutKinds[1],cutKinds[1]]; mix = 1; }   // different drawings cut cleanly, never ghost
        base = cutImg(cutKinds[0]); top = cutImg(cutKinds[1]); }
      else {
        const intro = introFrame(t), imgs=[intro||IMGS.a,IMGS.b,IMGS.c,IMGS.h||IMGS.b];
        base = imgs[ps.from]||IMGS.a; top = imgs[ps.to]||IMGS.a;
        if(ps.mix>=1 && !intro){ const nf = nodFrame(t, ps.to); if(nf){ base = nf; top = nf; } }
      }
      const echoImg = (S.echoLine && lineArt()) || top;
      if(S.echo>0.01 && echoImg){   // floating echoes of the subject, drifting outwards and fading
        const n=Math.round(3+S.echo*7), kk=hitEnv(A&&A.kicks,t,0.25);
        for(let i=0;i<n;i++){
          const life=9, ph=((t/life + hash(i*17+3)) % 1), ang=hash(i*29+5)*Math.PI*2 + t*0.05*(hash(i)-0.5);
          const dist=size*(0.45+ph*0.9), es=size*(0.16+hash(i*7)*0.16)*(1+kk*0.1);
          ctx.globalAlpha=S.echo*0.55*Math.sin(ph*Math.PI);
          ctx.drawImage(echoImg, cx+Math.cos(ang)*dist*(W>H?1.4:0.8)-es/2, cy+Math.sin(ang)*dist*0.8-es/2, es, es);
        }
        ctx.globalAlpha=1;
      }
      // a cut-out has no nod frames, so the whole figure dips gently on the beat instead
      let dip = 0;
      if(cutout && sub==='mascot' && cutKinds && cutKinds.includes('phones') && A && A.grid && S.nod>0 && energyAt(t)>=S.nodGate){ const P=A.grid.beat*(+S.nodEvery||1), ph=(((t-A.grid.phase+0.12*P)%P)+P)%P; dip = (ph<0.45*P ? Math.sin(Math.PI*ph/(0.45*P)) : 0)*S.nod*size*0.012; }
      ctx.save(); ctx.translate(cx,cy+dip); ctx.rotate(rot); ctx.scale(scale,scale);
      if(base){
        const sz = cutout||sub==='image' ? size*0.96 : size;
        drawFinish(ctx, mix>0.5?top:base, -sz/2,-sz/2,sz,sz, t);
        if(cutKinds) drawCut(ctx, cutKinds[0], sz, t, 1); else ctx.drawImage(base, -sz/2,-sz/2,sz,sz);
        if(top!==base && mix>0){ if(cutKinds) drawCut(ctx, cutKinds[1], sz, t, mix); else { ctx.globalAlpha=mix; ctx.drawImage(top,-sz/2,-sz/2,sz,sz); ctx.globalAlpha=1; } }
        else if(cutKinds && cutKinds[1]!==cutKinds[0] && mix>=1) drawCut(ctx, cutKinds[1], sz, t, 1);
        // misprint: offset ghost on hats
        const mp = hat*S.misprint;
        if(mp>0.03){
          ctx.globalCompositeOperation='multiply'; ctx.globalAlpha=Math.min(0.45, mp*0.7);
          const dx = U*0.007*mp*(hash(Math.floor(t*24))>0.5?1:-1);
          ctx.drawImage(mix>0.5?top:base, -sz/2+dx, -sz/2 - dx*0.3, sz, sz);
          ctx.globalCompositeOperation='source-over'; ctx.globalAlpha=1;
        }
      }
      ctx.restore();
    }
  }

  if(S.subject!=='text')   drawText(ctx,W,H,U,tall,t);
  if(!RENDER_STILL) drawCaption(ctx,W,H,U,t);
  if(S.glitch>0 || S.gMosh>0) glitchFX(ctx,W,H,U,t);

  // texture
  ctx.globalCompositeOperation='multiply'; ctx.globalAlpha=1; ctx.drawImage(overlay(W,H),0,0);
  if(S.grain>0){
    const tile = GRAIN[Math.floor(t*12)%4];
    const pat = ctx.createPattern(tile,'repeat'); const o = hash(Math.floor(t*12)+3)*256;
    pat.setTransform(new DOMMatrix().translate(o, o*0.7).scale(Math.max(1,U/900)));
    ctx.globalCompositeOperation='overlay'; ctx.globalAlpha=0.32*S.grain; ctx.fillStyle=pat; ctx.fillRect(0,0,W,H);
  }
  // fades
  ctx.globalCompositeOperation='source-over';
  let f = 1;
  if(S.fadeIn>0) f = Math.min(f, t/S.fadeIn);
  if(S.fadeOut>0) f = Math.min(f, (dur-t)/S.fadeOut);
  f = Math.max(0,Math.min(1,f));
  if(f<1){ ctx.globalAlpha=1-f; ctx.fillStyle=S.paperCol; ctx.fillRect(0,0,W,H); }
  ctx.restore();
}
/* ---------------- glitch post-effects (stateless: driven by t, hits and sections) ---------------- */
const GL = {};
function glScratch(k,W,H){ let c=GL[k]; if(!c || c.width!==W || c.height!==H){ c=GL[k]=document.createElement('canvas'); c.width=W; c.height=H; } return c; }
function glitchLevel(t){
  if(!A) return 0;
  const hat=hitEnv(A.hats,t,0.07), kick=hitEnv(A.kicks,t,0.1,0.6);
  let g = Math.max(hat*0.7, kick);
  const ps = poseState(t); g *= ps.to===2 ? S.glitchPeak : ps.to===1 ? S.glitchLift : S.glitchQuiet;
  for(const c of CUES){ const a=t-c.t; if(a>=0 && a<0.45) g=Math.max(g, 1.4*(1-a/0.45)); }   // burst at section changes
  return Math.min(1.6, g*S.glitch);
}
let MOSH_BUSY=false; const moshCache={};
function moshFX(ctx,W,H,U,t){
  if(MOSH_BUSY || !(S.gMosh>0) || !CUES.length) return;
  let c=null; for(const q of CUES){ const a=t-q.t; if(q.t>0 && a>=0 && a<0.9) c=q; }
  if(!c) return;
  const age=(t-c.t)/0.9, key=c.t+'|'+W+'x'+H;
  if(!moshCache[key]){   // the last frame before the change, rendered once
    const pc=document.createElement('canvas'); pc.width=W; pc.height=H; MOSH_BUSY=true;
    try{ frame(pc.getContext('2d'),W,H,Math.max(0,c.t-0.05)); } finally { MOSH_BUSY=false; }
    for(const k in moshCache) if(k.endsWith('|'+W+'x'+H)) delete moshCache[k];
    moshCache[key]=pc;
  }
  const prev=moshCache[key], bw=Math.ceil(W/24), bh=Math.ceil(H/14), f=Math.floor(t*24);
  ctx.save(); ctx.globalCompositeOperation='source-over';
  for(let by=0;by<14;by++) for(let bx=0;bx<24;bx++){
    const r=hash(bx*131+by*977+Math.floor(c.t*10));
    if(r > S.gMosh*(1-age)*0.9) continue;      // fewer old blocks survive as the change settles
    const dx=(hash(bx*7+by*3+f)-0.5)*U*0.02*age*8, dy=(hash(bx*5+by*11)-0.4)*U*0.03*age*6;
    ctx.drawImage(prev, bx*bw, by*bh, bw, bh, bx*bw+dx, by*bh+dy, bw, bh);
  }
  ctx.restore();
}
function glitchFX(ctx,W,H,U,t){
  moshFX(ctx,W,H,U,t);
  const g = glitchLevel(t); if(g<0.06) return;
  const f = Math.floor(t*24), R = k=>hash(f*131+k);
  const src = glScratch('src',W,H), sx=src.getContext('2d'); sx.globalCompositeOperation='copy'; sx.drawImage(ctx.canvas,0,0);
  ctx.save(); ctx.globalAlpha=1;
  if(S.glitchRoll>0 && g>0.7 && R(1) < 0.35*S.glitchRoll){   // VHS roll with a tracking band
    const dy = Math.round((R(2)*0.25+0.05)*H*Math.min(1,g));
    ctx.globalCompositeOperation='copy'; ctx.drawImage(src,0,dy); ctx.drawImage(src,0,dy-H);
    ctx.globalCompositeOperation='source-over'; ctx.fillStyle='rgba(255,255,255,0.18)'; ctx.fillRect(0,dy-U*0.012,W,U*0.02);
    sx.drawImage(ctx.canvas,0,0);
  }
  if(S.glitchTear>0){   // horizontal bands shifted sideways
    const n = Math.round(2 + 10*g*S.glitchTear);
    for(let i=0;i<n;i++){ const y=R(10+i)*H, h=(0.004+R(40+i)*0.05)*H, dx=(R(70+i)-0.5)*U*0.12*g*S.glitchTear; ctx.drawImage(src, 0,y,W,h, dx,y,W,h); }
  }
  if(S.glitchBlocks>0){   // rectangles copied out of place
    const n = Math.round(6*g*S.glitchBlocks);
    for(let i=0;i<n;i++){ const w=(0.04+R(100+i)*0.18)*W, h=(0.02+R(130+i)*0.08)*H, x=R(160+i)*(W-w), y=R(190+i)*(H-h);
      ctx.drawImage(src, x,y,w,h, x+(R(220+i)-0.5)*U*0.15, y+(R(250+i)-0.5)*U*0.03, w,h); }
  }
  if(S.glitchSplit>0){   // red and cyan copies pulled apart
    const d = U*0.012*g*S.glitchSplit; const base = glScratch('base',W,H), bx=base.getContext('2d');
    bx.globalCompositeOperation='copy'; bx.drawImage(ctx.canvas,0,0);
    for(const [col,sign] of [['#ff0000',1],['#00ffff',-1]]){
      const c = glScratch('ch'+sign,W,H), x=c.getContext('2d');
      x.globalCompositeOperation='copy'; x.drawImage(base,0,0); x.globalCompositeOperation='multiply'; x.fillStyle=col; x.fillRect(0,0,W,H);
      if(sign>0){ ctx.globalCompositeOperation='copy'; ctx.drawImage(c, d,0); } else { ctx.globalCompositeOperation='lighter'; ctx.drawImage(c, -d, d*0.3); }
    }
  }
  if(S.gSort>0){   // pixel-sort streaks: thin slices dragged downwards
    const n=Math.round(60*g*S.gSort);
    for(let i=0;i<n;i++){ const x=R(300+i)*W, w=Math.max(1,(0.002+R(330+i)*0.008)*W), y0=R(360+i)*H*0.8, len=(0.05+R(390+i)*0.35)*H*g;
      ctx.globalCompositeOperation='source-over'; ctx.globalAlpha=0.85; ctx.drawImage(src, x,y0,w,1, x,y0,w,len); }
    ctx.globalAlpha=1;
  }
  if(S.gMirror>0 && A && A.grid){   // mirror world: the frame folds into symmetry for a beat at a time
    const beat=Math.floor((t-A.grid.phase)/A.grid.beat);
    if(g>0.5 && hash(beat*97+11) < S.gMirror*0.6){
      const sx2=src.getContext('2d'); sx2.globalCompositeOperation='copy'; sx2.drawImage(ctx.canvas,0,0);
      ctx.globalCompositeOperation='source-over'; ctx.save();
      if(hash(beat*13)<0.65){ ctx.translate(W,0); ctx.scale(-1,1); ctx.drawImage(src, 0,0,W/2,H, 0,0,W/2,H); }
      else { ctx.translate(0,H); ctx.scale(1,-1); ctx.drawImage(src, 0,0,W,H/2, 0,0,W,H/2); }
      ctx.restore(); ctx.globalCompositeOperation='source-over';
    }
  }
  ctx.globalCompositeOperation='multiply'; ctx.globalAlpha=Math.min(0.5,0.35*g);   // scanlines
  ctx.fillStyle='#777'; const step=Math.max(2,Math.round(U/270));
  for(let y=(f%2);y<H;y+=step*2) ctx.fillRect(0,y,W,step*0.5);
  ctx.restore();
}

function drawAtmos(ctx,W,H,U,t,hat,amt){
  // clouds
  if(S.clouds>0 && CLOUDS.length){
    ctx.globalAlpha = 0.55*S.clouds*amt;
    for(const c of CLOUD_SLOTS){
      const spr = CLOUDS[c.sprite]; const w = U*0.75*c.s, h = w*spr.height/spr.width;
      const span = W + w*2; const x = ((c.phase*span + t*U*0.012*c.speed*(0.2+S.cloudSpeed*2)) % span) - w;
      ctx.save(); ctx.translate(x + (c.flip?w:0), H*c.y - h/2); if(c.flip) ctx.scale(-1,1);
      ctx.drawImage(spr,0,0,w,h); ctx.restore();
    }
    ctx.globalAlpha=1;
  }
  // glitch dashes
  if(S.dashes>0){
    ctx.fillStyle = S.blue;
    DASH_LANES.forEach((L,i)=>{
      const len = L.total*U*1.4, span = W+len*2;
      let x = ((L.phase*span + t*U*0.05*L.speed*(0.15+S.dashSpeed*2)) % span) - len;
      if(L.dir<0) x = W - x - len;
      const jit = hat>0.45 && hash(Math.floor(t*30)*31+i)<0.35 ? (hash(i*7+Math.floor(t*30))-0.5)*U*0.05 : 0;
      const a = Math.min(1,(0.28 + hat*0.55)*S.dashes*amt*1.2);
      for(const [off,l,o] of L.segs){ ctx.globalAlpha=a*o; ctx.fillRect(x+jit+off*U*1.4, H*L.y, l*U*1.4, L.thick*U); }
    });
    ctx.globalAlpha=1;
  }
}
function drawRings(ctx,cx,cy,r,U,t){
  if(S.rings<=0 || !A) return;
  const hits = recentHits(A.kicks, t, 2.4, 0.45);
  ctx.strokeStyle = S.blue; ctx.lineWidth = Math.max(1, U*0.0022);
  for(const h of hits){
    const p = h.a/2.4; const rr = r*(1.02 + p*0.55);
    ctx.globalAlpha = S.rings*h.s*Math.pow(1-p,2)*0.6;
    ctx.beginPath(); ctx.arc(cx,cy,rr,0,Math.PI*2); ctx.stroke();
  }
  ctx.globalAlpha=1;
}
function drawSpectrum(ctx,cx,cy,r,U,t){
  if(S.spectrum<=0 || !A) return;
  const sp = spectrumAt(t);
  ctx.strokeStyle = S.blue; ctx.lineCap='round'; ctx.lineWidth = Math.max(1,U*0.0035);
  ctx.globalAlpha = 0.75;
  const n = BANDS;
  for(let side of [-1,1]){
    for(let b=0;b<n;b++){
      const ang = Math.PI/2 + side*(b+0.5)/n*Math.PI; // from bottom, up each side
      const v = sp[b]*S.spectrum;
      if(v<0.02) continue;
      const l = U*0.075*v;
      const c=Math.cos(ang), s=Math.sin(ang);
      ctx.beginPath(); ctx.moveTo(cx+c*r, cy+s*r); ctx.lineTo(cx+c*(r+l), cy+s*(r+l)); ctx.stroke();
    }
  }
  ctx.globalAlpha=1;
}
let RENDER_STILL = false;
/* Captions: lines of "m:ss text" in the release; each shows until the next cue. A time with no text clears. */
let CAPS = [], capsSrc = null;
function parseCaptions(){
  if(capsSrc===S.captions) return CAPS; capsSrc=S.captions; CAPS=[];
  for(const line of (S.captions||'').split('\n')){
    const m=line.match(/^\s*(\d+):(\d{1,2}(?:\.\d+)?)\s*(.*)$/); if(!m) continue;
    CAPS.push({t:(+m[1])*60+(+m[2]), text:m[3].trim()});
  }
  CAPS.sort((a,b)=>a.t-b.t); return CAPS;
}
function drawCaption(ctx,W,H,U,t){
  const caps=parseCaptions(); if(!caps.length) return;
  let i=-1; for(let k=0;k<caps.length;k++){ if(caps[k].t<=t) i=k; else break; }
  if(i<0 || !caps[i].text) return;
  const c0=caps[i].t, end=Math.min(i+1<caps.length ? caps[i+1].t : Infinity, c0+S.capHold, A?A.dur:Infinity);
  const fi=Math.max(0.001,S.capIn), fo=Math.max(0.001,S.capOut), pin=Math.min(1,(t-c0)/fi), pout=Math.min(1,(end-t)/fo);
  if(pin<=0 || pout<=0) return;
  let txt=caps[i].text;
  if(S.capCase==='lower') txt=txt.toLowerCase(); else if(S.capCase==='upper') txt=txt.toUpperCase();
  txt=txt.replace(/skixo/gi,'skixO');
  const ease=p=>1-Math.pow(1-p,3);
  let alpha = S.capAnim==='type' ? pout : S.capAnim==='words' ? Math.min(pout, Math.min(1,pin*2)) : Math.min(pin,pout);
  if(S.capAnim==='type') txt = txt.slice(0, Math.ceil(txt.length*Math.min(1,(t-c0)/Math.max(0.3,fi*2))));
  const col = S.capColour==='accent' ? S.blue : S.capColour==='paper' ? S.paperCol : S.ink;
  const edge = S.capColour==='paper' ? S.ink : S.paperCol;
  let fs=U*0.052*(S.capSize||1); const setFont=()=>{ ctx.font=`${S.capWeight||500} ${fs}px ${FONT()}`; ctx.letterSpacing=`${fs*(S.capSpacing||0)}px`; };
  ctx.save(); setFont();
  // wrap to two lines when long, then shrink only if still too wide
  let lines=[txt]; const maxW=W*0.86;
  if(ctx.measureText(txt).width>maxW){ const mid=txt.length/2; let cut=-1; for(let d=0; d<txt.length/2; d++){ if(txt[Math.floor(mid+d)]===' '){cut=Math.floor(mid+d);break;} if(txt[Math.floor(mid-d)]===' '){cut=Math.floor(mid-d);break;} }
    if(cut>0) lines=[txt.slice(0,cut), txt.slice(cut+1)]; }
  while(fs>U*0.02 && Math.max(...lines.map(l=>ctx.measureText(l).width))>maxW){ fs*=0.93; setFont(); }
  const lh=fs*1.22, block=lh*lines.length;
  let y = S.capPos==='top' ? H*0.1 : S.capPos==='centre' ? H*0.5 : H*(H>W?0.88:0.79);
  y -= (lines.length-1)*lh/2;
  if(S.capAnim==='rise') y += (1-ease(pin))*fs*0.5;
  ctx.globalAlpha=alpha; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.lineJoin='round';
  if(S.capStyle==='box'){
    const w=Math.max(...lines.map(l=>ctx.measureText(l).width))+fs*0.9, h=block+fs*0.35;
    ctx.fillStyle=edge; ctx.globalAlpha=alpha*0.88; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(W/2-w/2, y-lh/2-fs*0.17, w, h, fs*0.18) : ctx.rect(W/2-w/2, y-lh/2-fs*0.17, w, h); ctx.fill(); ctx.globalAlpha=alpha;
  }
  if(S.capAnim==='words'){
    // karaoke: the whole line shows faintly, words light up in turn across the line's time
    const words=lines.flatMap((l,k)=>l.split(' ').map(w=>({w,k}))), span=Math.max(0.6,Math.min((end===Infinity?6:end-c0)*0.8, words.length*0.45));
    const lit=Math.min(words.length, Math.floor(words.length*(t-c0)/span)+1);
    let n=0; ctx.textAlign='left';
    lines.forEach((l,k)=>{ const yy=y+k*lh, ws=l.split(' '), sp=ctx.measureText(' ').width; let x=W/2-ctx.measureText(l).width/2;
      for(const w of ws){ const on=n<lit, ww=ctx.measureText(w).width;
        ctx.globalAlpha=alpha*(on?1:0.28);
        if(S.capStyle==='outline'){ ctx.strokeStyle=edge; ctx.lineWidth=fs*0.22; ctx.strokeText(w,x,yy); }
        ctx.fillStyle=col; ctx.fillText(w,x,yy); x+=ww+sp; n++; } });
  } else lines.forEach((l,k)=>{ const yy=y+k*lh;
    if(S.capStyle==='outline'){ ctx.strokeStyle=edge; ctx.lineWidth=fs*0.22; ctx.strokeText(l,W/2,yy); }
    ctx.fillStyle=col; ctx.fillText(l,W/2,yy); });
  ctx.restore(); ctx.letterSpacing='0px';
}
/* Fonts: a curated Google set loads on demand; "Installed font" uses any font on this computer by name. */
const GFONTS = ['Libre Franklin','Archivo Black','Bebas Neue','Anton','Syne','Unbounded','Space Grotesk','DM Serif Display','Fraunces','Instrument Serif','Space Mono','Rubik Mono One'];
const FONT = ()=> { const f = S.font==='custom' ? (S.fontCustom||'Arial') : S.font; return `"${f}", "Libre Franklin", "Helvetica Neue", Arial, sans-serif`; };
const loadedFonts = new Set(['Libre Franklin']);
async function ensureFont(){
  const f = S.font==='custom' ? S.fontCustom : S.font; if(!f) return;
  if(S.font!=='custom' && !loadedFonts.has(f)){
    const l=document.createElement('link'); l.rel='stylesheet';
    l.href=`https://fonts.googleapis.com/css2?family=${encodeURIComponent(f).replace(/%20/g,'+')}:wght@400;500;600;700&display=swap`;
    document.head.appendChild(l); loadedFonts.add(f); await new Promise(r=>{ l.onload=r; l.onerror=r; });
  }
  try{ await document.fonts.load(`600 40px "${f}"`); await document.fonts.load(`400 40px "${f}"`); }catch(e){}
  requestDraw();
}
const FMT_NAMES = {v16:'Video 16:9', v9:'Video 9:16 and Canvas', 'still-yt':'YouTube thumbnail', 'still-ig':'Post 4:5', 'still-story':'Story cover', 'still-square':'Square', 'still-cover':'Cover art', 'still-banner':'SoundCloud banner'};
function fmtKey(W,H){ if(RENDER_STILL) return 'still-'+$('stillSize').value; return H>W ? 'v9' : 'v16'; }
const HEAD_PRESET = {'headline-top':0.16, headline:0.5, 'headline-bottom':0.82};
let HEAD_BOX = null, TEXT_GUIDE = null;   // HEAD_BOX: stage-only hit box of the headline, in canvas pixels
function drawHeadline(ctx,W,H,U,mode){
  const lc = s => S.lowercase ? s.toLowerCase().replace(/skixo/g,'skixO') : s;
  const typed = RENDER_STILL && S.stillHeadline;   // a typed headline keeps its own case
  const title = S.showTitle===false && !typed ? '' : (typed ? S.stillHeadline : lc(S.title || ''));
  const sc = S.textScale||1; let ts = U*0.17*sc;
  ctx.save(); ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.lineJoin='round';
  const font = px => `600 ${px}px ${FONT()}`;
  ctx.font=font(ts); ctx.letterSpacing=`${-ts*0.02}px`;
  while(ts>U*0.04 && ctx.measureText(title).width > W*0.9){ ts*=0.92; ctx.font=font(ts); ctx.letterSpacing=`${-ts*0.02}px`; }
  const ov = S.textY && S.textY[fmtKey(W,H)], y = H*(typeof ov==='number' ? Math.max(0.04,Math.min(0.96,ov)) : (HEAD_PRESET[mode]||0.5));
  const as = ts*0.3, showA = RENDER_STILL ? !!S.stillArtist : S.showArtist!==false;
  const stroke=(txt,x,yy,w)=>{ ctx.strokeStyle=S.paperCol; ctx.lineWidth=w; ctx.strokeText(txt,x,yy); ctx.fillText(txt,x,yy); };
  ctx.fillStyle=S.ink;
  const tw = title ? ctx.measureText(title).width : 0; let aw = 0, ay = y;
  if(title) stroke(title, W/2, y, ts*0.16);
  if(showA){
    ay = y + (ts*0.62 + as*0.6)*(S.headGap==null ? 1 : S.headGap);
    if(S.useWordmark && wordmarkImg){
      const h=as*1.4, w=h*wordmarkImg.naturalWidth/wordmarkImg.naturalHeight;
      aw=w; ctx.shadowColor=S.paperCol; ctx.shadowBlur=as*0.5; ctx.drawImage(wordmarkImg, W/2-w/2, ay-h/2, w, h); ctx.shadowBlur=0;
    } else { ctx.font=`500 ${as}px ${FONT()}`; ctx.letterSpacing=`${as*0.14}px`; ctx.fillStyle=S.blue; aw=ctx.measureText(S.artist||'').width; stroke(S.artist||'', W/2, ay, as*0.3); }
  }
  if(ctx===sctx){ const bw=Math.max(tw,aw,U*0.1), top=title ? y-ts*0.6 : ay-as*0.8, bot=showA ? ay+as*0.8 : y+ts*0.6; HEAD_BOX={x:W/2-bw/2, y:top, w:bw, h:Math.max(bot-top,as), W, H}; }
  ctx.restore(); ctx.letterSpacing='0px';
}
function drawText(ctx,W,H,U,tall,t){
  if(W>H*3) U = Math.max(U, W*0.3);   // extreme banners: keep the corner text legible
  const mode = (RENDER_STILL && S.stillText!=='same') ? S.stillText : S.textPos;
  if(mode==='off' || mode==='none') return;
  if(mode.startsWith('headline')) return drawHeadline(ctx,W,H,U,mode);
  const lc = s => S.lowercase ? s.toLowerCase().replace(/skixo/g,'skixO') : s;
  const showA = RENDER_STILL ? !!S.stillArtist : S.showArtist!==false;
  const title = S.showTitle===false ? '' : lc(S.title||''), artist = showA ? (S.artist||'') : '', credit = S.credit||'';
  const m = U*0.065;
  let x, y, align;
  const tp = S.textPos||'bottom-left', isTop = tp.startsWith('top-') && !tall, hpos = tall ? 'centre' : tp.split('-')[1];
  align = hpos==='centre' ? 'center' : hpos==='right' ? 'right' : 'left';
  x = align==='center' ? W/2 : align==='right' ? W-m : m;
  y = tall ? H*0.78 : isTop ? m+U*0.04 : H-m*1.05;
  ctx.textAlign=align; ctx.textBaseline='alphabetic';
  const ts = U*(tall?0.05:0.044)*(S.textScale||1), as = U*(tall?0.028:0.024)*(S.textScale||1);
  const topLeft = isTop;
  const titleY = topLeft ? y : y - as*1.7;
  const artY = topLeft ? y + as*1.7 : y;
  // soft paper backing so dashes, clouds or a busy scene never cut through the type
  ctx.font = `500 ${ts}px ${FONT()}`; ctx.letterSpacing = `${ts*-0.01}px`;
  const artW = !showA ? 0 : (S.useWordmark && wordmarkImg) ? as*1.25*wordmarkImg.naturalWidth/wordmarkImg.naturalHeight : (S.artist||'').length*as*0.72;
  const bw = Math.max(ctx.measureText(title).width, artW) + U*0.06;
  const top = titleY - ts*1.05, bottom = artY + as*(credit?1.9:0.75);
  const bx = align==='center' ? x-bw/2 : align==='right' ? x-bw+U*0.03 : x-U*0.03;
  ctx.save(); ctx.fillStyle=S.paperCol; ctx.shadowColor=S.paperCol; ctx.shadowBlur=U*0.035;
  ctx.globalAlpha = S.layout==='wallpaper' ? 0.9 : 0.8;
  ctx.fillRect(bx, top, bw, bottom-top); ctx.restore();
  ctx.fillStyle=S.ink; ctx.globalAlpha=0.92;
  ctx.fillText(title, x, titleY);
  if(!showA){}
  else if(S.useWordmark && wordmarkImg){
    const h = as*1.25, w = h*wordmarkImg.naturalWidth/wordmarkImg.naturalHeight;
    const wx = align==='center' ? x-w/2 : align==='right' ? x-w : x;
    ctx.drawImage(wordmarkImg, wx, artY-h*0.85, w, h);
  } else {
    ctx.font = `400 ${as}px ${FONT()}`; ctx.letterSpacing = `${as*0.12}px`;
    ctx.fillStyle=S.blue; ctx.fillText(artist, x, artY);
  }
  if(credit){
    ctx.font = `300 ${as*0.72}px ${FONT()}`; ctx.letterSpacing = `${as*0.06}px`;
    ctx.fillStyle=S.ink; ctx.globalAlpha=0.6; ctx.fillText(credit, x, artY + as*1.45);
  }
  ctx.globalAlpha=1; ctx.letterSpacing='0px';
}

/* ---------------- preview loop ---------------- */
const stage = $('stage'), sctx = stage.getContext('2d');
let playing=false, playhead=12, srcNode=null, startedAt=0, drawPending=false;
const STILL_DIMS = {yt:[1920,1080], ig:[1080,1350], story:[1080,1920], square:[1080,1080], cover:[3000,3000], banner:[2480,520]};
function setAspect(){
  const tall = S.aspect==='9:16';
  stage.width = tall?720:1280; stage.height = tall?1280:720;
  if($('stillPreview') && $('stillPreview').checked){ const [w,h]=STILL_DIMS[$('stillSize').value]; const k=Math.min(1280/w,1280/h); stage.width=Math.round(w*k); stage.height=Math.round(h*k); }
  $('stagewrap').classList.toggle('tall', tall);
  $('stagewrap').classList.toggle('wide', !!($('stillPreview') && $('stillPreview').checked) && stage.width/stage.height>2.5);
  if(window.LOOKUI_READY) syncHeightUI();
  if(window.KIT_READY) kitSync();
  requestDraw();
}
function now(){ return playing ? Math.min(buffer.duration, actx.currentTime - startedAt) : playhead; }
function requestDraw(){ if(!drawPending && !playing){ drawPending=true; requestAnimationFrame(()=>{ drawPending=false; render(); }); } }
function drawOverlays(c,W,H){   // preview-only guides, never part of an export
  if(TEXT_GUIDE!=null){ c.save(); c.strokeStyle='#ff3d8b'; c.lineWidth=1; c.setLineDash([6,4]); c.beginPath(); c.moveTo(0,Math.round(H*TEXT_GUIDE)+0.5); c.lineTo(W,Math.round(H*TEXT_GUIDE)+0.5); c.stroke(); c.restore(); }
  if(!$('safeZones') || !$('safeZones').checked) return;
  const still = !!$('stillPreview').checked, sz = $('stillSize').value, nine = still ? sz==='story' : H>W;
  c.save(); c.fillStyle='rgba(0,0,0,0.28)'; c.strokeStyle='rgba(255,255,255,0.7)'; c.lineWidth=1; c.setLineDash([5,4]);
  const zone=(x,y,w,h)=>{ c.fillRect(x,y,w,h); c.strokeRect(Math.round(x)+0.5,Math.round(y)+0.5,Math.round(w)-1,Math.round(h)-1); };
  if(nine){ zone(0,0,W,H*0.14); zone(0,H*0.78,W,H*0.22); zone(W*0.88,H*0.55,W*0.12,H*0.23); }
  else if(still && sz==='ig'){ const cw=H*0.75, x=(W-cw)/2; c.fillRect(0,0,x,H); c.fillRect(W-x,0,x,H); c.beginPath(); c.moveTo(Math.round(x)+0.5,0); c.lineTo(Math.round(x)+0.5,H); c.moveTo(Math.round(W-x)+0.5,0); c.lineTo(Math.round(W-x)+0.5,H); c.stroke(); }
  c.restore();
}
function render(){
  const t = now();
  RENDER_STILL = !!($('stillPreview') && $('stillPreview').checked); HEAD_BOX = null;
  try{ frame(sctx, stage.width, stage.height, t); } finally { RENDER_STILL=false; }
  drawOverlays(sctx, stage.width, stage.height);
  $('time').textContent = `${fmtTime(t)} / ${fmtTime(buffer?buffer.duration:0)}`;
  if(window.KIT_READY && S.kitMoment==='play') kitTimeLine();
  drawPlayhead(t);
}
function loop(){ if(!playing) return; render(); if(now()>=buffer.duration-0.01){ stop(); playhead=0; requestDraw(); return; } requestAnimationFrame(loop); }
function play(){
  if(!buffer) return; const c=getCtx(); c.resume();
  srcNode = c.createBufferSource(); srcNode.buffer=buffer; srcNode.connect(monitorGain()); srcNode.connect(meterIn());
  if(playhead>=buffer.duration-0.05) playhead=0;
  startedAt = c.currentTime - playhead; srcNode.start(0, playhead); playing=true; setIcon(); loop();
}
// preview volume only; renders read the decoded track directly, so this never affects exports
let gainNode=null;
function monitorGain(){ const c=getCtx(); if(!gainNode){ gainNode=c.createGain(); gainNode.connect(c.destination); } gainNode.gain.value=Math.pow(+$('vol').value,2); return gainNode; }
$('vol').addEventListener('input', ()=>{ try{ localStorage.setItem('skixo-vis-vol', $('vol').value); }catch(e){} if(gainNode) monitorGain(); });
try{ const v=localStorage.getItem('skixo-vis-vol'); if(v!==null) $('vol').value=v; }catch(e){}
function stop(){ if(srcNode){ try{srcNode.stop();}catch(e){} srcNode.disconnect(); srcNode=null; } if(playing){ playhead = now(); playing=false; setIcon(); } }
function setIcon(){ $('playicon').innerHTML = playing ? '<path d="M3 2h3.5v12H3zM9.5 2H13v12H9.5z"/>' : '<path d="M3 1.5v13l11-6.5z"/>'; $('play').setAttribute('aria-label', playing?'Pause':'Play'); }
function seek(t){ const was=playing; stop(); playhead=Math.max(0,Math.min(buffer?buffer.duration:0,t)); if(was) play(); else requestDraw(); }
$('play').addEventListener('click', ()=> playing ? (stop(), requestDraw()) : play());
document.addEventListener('keydown', e=>{ if(e.code==='Space' && !/INPUT|TEXTAREA|SELECT|BUTTON/.test(e.target.tagName)){ e.preventDefault(); $('play').click(); } });
function fmtTime(t, frac){ t=Math.max(0,t); const m=Math.floor(t/60), s=t-m*60; return frac ? `${m}:${s.toFixed(1).padStart(4,'0')}` : `${m}:${String(Math.floor(s)).padStart(2,'0')}`; }

/* ---------------- timeline ---------------- */
const tl = $('timeline'), tctx = tl.getContext('2d'); let tlBase=null;
const POSE_COLS = ['#cfc6b2','#8e9aa0','#3d6884'];
/* Timeline lanes: Scene (backgrounds per section), Mood (light / peak), Captions, Audio (energy and kicks). */
const TL_G = 64;   // label gutter, css px
const LANES = [['Scene',26],['Mood',8],['Captions',20],['Audio',46]];
function drawTimeline(){
  const dpr = window.devicePixelRatio||1, w = tl.clientWidth, h = tl.clientHeight;
  if(!w) return;
  tl.width = w*dpr; tl.height = h*dpr;
  const c = document.createElement('canvas'); c.width=tl.width; c.height=tl.height; const x=c.getContext('2d'); x.scale(dpr,dpr);
  const gap=6, tw=w-TL_G; let y=4;
  x.font='11px "Libre Franklin", sans-serif'; x.textBaseline='middle';
  if(!A){ x.fillStyle='#8e938f'; x.fillText('Drop a track anywhere on the page to see its sections, scenes, captions and kicks here', 14, h/2); tlBase=c; drawPlayhead(now()); return; }
  const dur=A.dur, X=t=>TL_G + t/dur*tw;
  for(const [name,lh] of LANES){
    x.fillStyle='#8e938f'; x.fillText(name, 4, y+lh/2);
    if(name==='Scene'){
      for(let i=0;i<CUES.length;i++){
        const a=X(CUES[i].t), b=X(i+1<CUES.length?CUES[i+1].t:dur), bgx=bgFor(CUES[i].p), im=bgx&&blurredBg(bgx.img,bgx.adj.blur);
        x.save(); x.beginPath(); x.rect(a+0.5,y,b-a-1,lh); x.clip();
        if(im){ const sc=Math.max((b-a)/im.width, lh/im.height); x.drawImage(im, (a+b)/2-im.width*sc/2, y+lh/2-im.height*sc/2, im.width*sc, im.height*sc); }
        else { x.fillStyle=S.paperCol; x.fillRect(a,y,b-a,lh); }
        x.restore();
      }
    } else if(name==='Mood'){
      for(let i=0;i<CUES.length;i++){ const a=X(CUES[i].t), b=X(i+1<CUES.length?CUES[i+1].t:dur); x.fillStyle=POSE_COLS[CUES[i].p]; x.fillRect(a,y,b-a,lh); }
    } else if(name==='Captions'){
      const caps=parseCaptions(); x.fillStyle='rgba(255,255,255,0.04)'; x.fillRect(TL_G,y,tw,lh);
      caps.forEach((cp,i)=>{ if(!cp.text) return; const a=X(cp.t), b=X(i+1<caps.length?caps[i+1].t:Math.min(dur,cp.t+6));
        x.fillStyle='#3a4249'; x.fillRect(a+0.5,y+1,Math.max(2,b-a-1),lh-2);
        x.save(); x.beginPath(); x.rect(a+3,y,b-a-6,lh); x.clip(); x.fillStyle='#ebe5d8'; x.fillText(cp.text, a+4, y+lh/2); x.restore(); });
      if(!caps.length){ x.fillStyle='#5d6266'; x.fillText('No captions yet (Track tab)', TL_G+6, y+lh/2); }
    } else {
      x.fillStyle='#4b535a'; const cols=Math.floor(tw/2);
      for(let i=0;i<cols;i++){ const e=energyAt(i/cols*dur), bh=Math.max(1,e*(lh-6)); x.fillRect(TL_G+i*2, y+lh-bh, 1.4, bh); }
      x.fillStyle='rgba(141,178,203,.6)'; for(const kk of A.kicks){ if(kk.s<0.45) continue; x.fillRect(X(kk.t), y, 1, 4); }
    }
    y += lh + gap;
  }
  tlBase = c; drawPlayhead(now());
}
function drawPlayhead(t){
  if(!tlBase) return; const dpr=window.devicePixelRatio||1;
  tctx.setTransform(1,0,0,1,0,0); tctx.clearRect(0,0,tl.width,tl.height); tctx.drawImage(tlBase,0,0);
  if(!buffer) return; const x = (TL_G + t/buffer.duration*(tl.width/dpr-TL_G))*dpr;
  tctx.fillStyle='#ebe5d8'; tctx.fillRect(x-dpr*0.75,0,dpr*1.5,tl.height);
}
let dragging=false;
function tlSeek(e){ if(!buffer) return; const r=tl.getBoundingClientRect(); seek(Math.max(0,(e.clientX-r.left-TL_G)/(r.width-TL_G))*buffer.duration); }
/* lanes are clickable: Scene opens that section's slot, Mood opens Sections, Captions selects the line */
function laneAt(e){ const r=tl.getBoundingClientRect(); let y=4, py=e.clientY-r.top; for(const [name,lh] of LANES){ if(py>=y-3 && py<=y+lh+3) return name; y+=lh+6; } return 'Audio'; }
function tAt(e){ const r=tl.getBoundingClientRect(); return Math.max(0,(e.clientX-r.left-TL_G)/(r.width-TL_G))*(A?A.dur:0); }
function openSection(tab,name){ document.querySelector(`[data-go="${tab}"]`).click(); const d=[...document.querySelectorAll('details[data-tab]')].find(x=>x.querySelector('summary').textContent===name); if(d){ d.open=true; d.scrollIntoView({block:'start',behavior:'smooth'}); } return d; }
function editLane(lane,t){
  if(!A) return;
  if(lane==='Scene'){ const p=poseState(t).to; $('bgTarget').value=['q','l','p'][Math.min(p,2)]; markBg(); openSection('look','Scene'); }
  else if(lane==='Mood'){ openSection('track','Sections'); }
  else if(lane==='Captions'){
    openSection('track','Captions'); const caps=parseCaptions(); let i=-1; caps.forEach((c,k)=>{ if(c.t<=t) i=k; });
    if(i<0) return; const ta=$('captions'), lines=ta.value.split('\n');
    // find the textarea line that holds this cue
    let pos=0; for(const l of lines){ const m=l.match(/^\s*(\d+):(\d{1,2}(?:\.\d+)?)/); if(m && Math.abs((+m[1])*60+(+m[2])-caps[i].t)<0.001){ ta.focus(); ta.setSelectionRange(pos, pos+l.length); break; } pos+=l.length+1; }
  }
}
const LANE_TIPS={Scene:'Click to choose the background for this section, or drag an edge to move it', Mood:'Click to adjust how the track is split into sections, or drag an edge to move it', Captions:'Click a caption to edit it', Audio:'Click or drag to move the playhead'};
tl.addEventListener('pointerdown', e=>{ const ei=edgeAt(e); if(ei>0){ tl._edge=ei; tl.setPointerCapture(e.pointerId); return; } const lane=laneAt(e); dragging = lane==='Audio' || lane==='Mood' || true; tl.setPointerCapture(e.pointerId); tlSeek(e); tl._lane=lane; tl._t=tAt(e); });
tl.addEventListener('pointerup', e=>{ if(tl._edge){ tl._edge=0; persist(); return; } if(tl._lane && Math.abs(tAt(e)-tl._t) < (A?A.dur:1)*0.005 && tl._lane!=='Audio') editLane(tl._lane, tl._t); tl._lane=null; });
tl.addEventListener('pointermove', e=>{ if(tl._edge){ moveEdge(e); return; } if(dragging) tlSeek(e); else tl.title=LANE_TIPS[laneAt(e)]||''; tl.style.cursor = edgeAt(e)>0 ? 'col-resize' : laneAt(e)==='Audio' ? 'ew-resize' : 'pointer'; });
/* section edges in the Scene and Mood lanes can be dragged; the first drag turns the auto split into your own cue list */
function edgeAt(e){ if(!A || dragging) return -1; const lane=laneAt(e); if(lane!=='Scene' && lane!=='Mood') return -1;
  const r=tl.getBoundingClientRect(), px=e.clientX-r.left, X=t=>TL_G+t/A.dur*(r.width-TL_G);
  for(let i=1;i<CUES.length;i++) if(Math.abs(X(CUES[i].t)-px)<5) return i; return -1; }
function moveEdge(e){
  const i=tl._edge; if(!CUES[i]) return; const lo=CUES[i-1].t+0.5, hi=i+1<CUES.length ? CUES[i+1].t-0.5 : A.dur-0.5, t=Math.max(lo,Math.min(hi,tAt(e)));
  if(S.poseMode!=='manual'){ S.poseMode='manual'; $('poseMode').value='manual'; $('autoPose').hidden=true; $('manualPose').hidden=false; syncSeg(); setStatus('Switched to your own cue list so the change sticks. Switch back on the Track tab any time.'); }
  const c=CUES.map(q=>Object.assign({},q)); c[i].t=t; S.manualCues=cuesToText(c); $('manualCues').value=S.manualCues; rebuildCues();
  if(!playing){ playhead=t; requestDraw(); }
}
tl.addEventListener('pointerup', ()=>{ dragging=false; });
new ResizeObserver(()=>drawTimeline()).observe(tl);

/* ---------------- files in ---------------- */
async function takeFile(file, slot){
  try{
    if(file.type.startsWith('video') && slot!=='audio'){ await setPose('clip', file); store.put(artKey('clip'), file, file.name); setStatus(`Loaded ${file.name} as the animated intro`); return; }
    if(file.type.startsWith('audio') || /\.(wav|mp3|flac|ogg|m4a|aiff?)$/i.test(file.name)){ await loadAudio(file); store.put('audio-'+(LIB?LIB.current:'x'), file, file.name); $('trackName').textContent = file.name; setNote('audio', file.name); return; }
    if(file.type.startsWith('image')){
      const nm = file.name.match(/nod[-_ ]?(side|flat|peak)[-_ ]?([12])/i);
      const s = slot || (/wearing[-_ ]?nod[-_ ]?1/i.test(file.name) ? 'cwn1' : /wearing[-_ ]?nod[-_ ]?2/i.test(file.name) ? 'cwn2' : /peak[-_ ]?nod[-_ ]?1/i.test(file.name) ? 'cpn1' : /peak[-_ ]?nod[-_ ]?2/i.test(file.name) ? 'cpn2' : /wearing/i.test(file.name) ? 'cwear' : /cut[-_ ]?nod[-_ ]?1/i.test(file.name) ? 'cn1' : /cut[-_ ]?nod[-_ ]?2/i.test(file.name) ? 'cn2' : /cut[-_ ]?peak/i.test(file.name) ? 'cpeak' : /sketch/i.test(file.name) ? 'sketch' : /halftone/i.test(file.name) ? 'halftone' : /line[-_ ]?art/i.test(file.name) ? 'line' : /no[-_ ]?head|no[-_ ]?phones/i.test(file.name) ? 'cutn' : /^head ?phones/i.test(file.name) ? 'phones' : /transparent|cut[-_ ]?out/i.test(file.name) ? 'cut' : /logo|emblem|\.svg$/i.test(file.name) ? 'logo' : nm ? 'n'+nm[2]+({flat:'f',side:'c',peak:'p'})[nm[1].toLowerCase()] : /wide|wall|banner/i.test(file.name) ? 'w' : /^(bg|scene|background)/i.test(file.name) ? 'bg' : /half|mid|between/i.test(file.name) ? 'h' : /peak|peek|smile|open|eyes/i.test(file.name) ? 'c' : /shadow|light/i.test(file.name) ? 'b' : 'a');
      await setPose(s, file); store.put(artKey(s), file, file.name); if(s==='bg'){ S.bgId=''; markBg(); persist(); } if(s==='h') rebuildCues(); setStatus(`Loaded ${file.name}`);
    }
  }catch(err){ setStatus(`Couldn't read ${file.name}. Try a WAV, MP3, PNG or JPG.`, true); }
}
$('f-audio').addEventListener('change', e=> e.target.files[0] && takeFile(e.target.files[0]));
for(const s of ['a','b','c','h','w','bg','n1c','n2c','n1f','n2f','n1p','n2p','cut','cutn','phones','line','logo','clip','cpeak','cn1','cn2','cwear','sketch','halftone','cpn1','cpn2','cwn1','cwn2']) $('f-'+s).addEventListener('change', e=> e.target.files[0] && takeFile(e.target.files[0], s));
const app = $('app');
app.addEventListener('dragover', e=>{ e.preventDefault(); app.classList.add('drop'); });
app.addEventListener('dragleave', e=>{ if(e.target===app) app.classList.remove('drop'); });
app.addEventListener('drop', e=>{ e.preventDefault(); app.classList.remove('drop'); for(const f of e.dataTransfer.files) takeFile(f); });

$('capNow').addEventListener('click', ()=>{ const ta=$('captions'); const stamp=fmtTime(now(),true)+' '; const pos=ta.selectionStart; const v=ta.value; const nl=(pos>0 && v[pos-1]!=='\n')?'\n':''; ta.value=v.slice(0,pos)+nl+stamp+v.slice(pos); ta.focus(); ta.selectionStart=ta.selectionEnd=pos+nl.length+stamp.length; S.captions=ta.value; onChange('captions'); });
$('fillCues').addEventListener('click', ()=>{ S.manualCues = cuesToText(autoCues()); $('manualCues').value=S.manualCues; onChange('manualCues'); });
$('paperAuto').addEventListener('click', ()=>{ const src = IMGS.a && IMGS.a._src; if(src){ S.paperCol = sampleCorner(src); $('paperCol').value=S.paperCol; onChange('paperCol'); } });
$('copySettings').addEventListener('click', async ()=>{
  const txt = JSON.stringify(S, null, 1);
  try{ await navigator.clipboard.writeText(txt); setStatus('Settings copied'); }
  catch(e){ $('pasteSettings').value = txt; $('pasteSettings').select(); setStatus('Settings selected below; copy them with Ctrl+C'); }
});
$('applySettings').addEventListener('click', ()=>{
  try{ const o = JSON.parse($('pasteSettings').value); S = Object.assign({}, DEFAULTS, o); syncUI(); setAspect(); overlayCache={}; loadWordmark(); rebuildCues(); persist(); setStatus('Settings applied'); }
  catch(e){ setStatus('Those settings could not be read. Paste the full copied text.', true); }
});
$('resetSettings').addEventListener('click', ()=>{ S = Object.assign({}, DEFAULTS); syncUI(); setAspect(); overlayCache={}; loadWordmark(); rebuildCues(); persist(); setStatus('Defaults restored'); });

/* ---------------- export ---------------- */
let cancelExport=false, lastBlob=null, lastName='';
async function saveBlob(blob, name){
  let dl = null;
  try{ dl = window.claude && window.claude.use ? await window.claude.use('downloads') : null; }catch(e){ dl=null; }
  if(dl){
    try{ await dl.save({filename:name, data:blob}); setStatus('Saved '+name); return; }
    catch(e){ if(e && e.code==='declined'){ setStatus('Save cancelled. Use Save again when ready.'); return; } if(e && e.code==='rate_limited'){ setStatus('A save prompt is already open.'); return; } }
  }
  const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=name; document.body.appendChild(a); a.click(); a.remove();
  setStatus('Saved '+name);
}
['stillPreview','stillSize'].forEach(id=>$(id).addEventListener('change', ()=>setAspect()));
try{ $('safeZones').checked = localStorage.getItem('skixo-vis-safe')==='1'; }catch(e){}
$('safeZones').addEventListener('change',()=>{ try{ localStorage.setItem('skixo-vis-safe', $('safeZones').checked?'1':'0'); }catch(e){} requestDraw(); });
['stillText','stillHeadline'].forEach(id=>$(id).addEventListener('input', ()=>requestDraw()));
// one still, drawn exactly as the preview would: #stillSize is borrowed for the per-format headline logic (fmtKey) and put back
function stillCanvas(size,t){
  const [W,H] = STILL_DIMS[size], keep = $('stillSize').value;
  const c=document.createElement('canvas'); c.width=W; c.height=H;
  $('stillSize').value = size; RENDER_STILL=true;
  try{ frame(c.getContext('2d'),W,H,t); } finally { RENDER_STILL=false; $('stillSize').value = keep; }
  return c;
}
$('saveStill').addEventListener('click', async ()=>{
  await ensureFont();
  const c = stillCanvas($('stillSize').value, now());
  const slug=(S.title||'still').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  c.toBlob(b=>saveBlob(b, `${slug}-${$('stillSize').value}-${fmtTime(now()).replace(':','m')}s.png`), 'image/png');
});
$('saveAgain').addEventListener('click', ()=> lastBlob && saveBlob(lastBlob, lastName));
$('cancel').addEventListener('click', ()=>{ cancelExport=true; });
async function renderVideo({W,H,fps,t0,t1,audio=true,loop=0,label=''}){
  const r = Math.max(W,H)>=2560 ? '1440' : Math.max(W,H)>=1920 ? '1080' : '720';
  const vbit = ({1080:12e6, 1440:20e6, 720:6e6})[r] * (fps===60?1.4:1);
  let vcfg=null, vmux=null;
  for(const [codec,mux] of [[r==='1440'?'avc1.640033':'avc1.640028','avc'],['avc1.4d0033','avc'],['vp09.00.41.08','vp9']]){
    const cfg={codec, width:W, height:H, bitrate:vbit, framerate:fps, ...(mux==='avc'?{avc:{format:'avc'}}:{})};
    try{ if((await VideoEncoder.isConfigSupported(cfg)).supported){ vcfg=cfg; vmux=mux; break; } }catch(e){}
  }
  if(!vcfg){ $('exportNote').textContent='No supported video encoder found in this browser.'; return null; }
  const sr = buffer.sampleRate, ch = 2;
  let acfg=null, amux=null;
  if(audio) for(const [codec,mux] of [['mp4a.40.2','aac'],['opus','opus']]){
    const cfg={codec, sampleRate:sr, numberOfChannels:ch, bitrate:192000};
    try{ if((await AudioEncoder.isConfigSupported(cfg)).supported){ acfg=cfg; amux=mux; break; } }catch(e){}
  }
  await ensureFont(); await document.fonts.ready;
  const target = new Mp4Muxer.ArrayBufferTarget();
  const muxer = new Mp4Muxer.Muxer({ target, fastStart:'in-memory', firstTimestampBehavior:'offset',
    video:{codec:vmux, width:W, height:H, frameRate:fps}, ...(acfg?{audio:{codec:amux, sampleRate:sr, numberOfChannels:ch}}:{}) });
  let failed=null;
  const venc = new VideoEncoder({ output:(c,m)=>muxer.addVideoChunk(c,m), error:e=>failed=e });
  venc.configure(vcfg);
  if(acfg){
    const aenc = new AudioEncoder({ output:(c,m)=>muxer.addAudioChunk(c,m), error:e=>failed=e });
    aenc.configure(acfg);
    const L = buffer.getChannelData(0), R = buffer.numberOfChannels>1? buffer.getChannelData(1) : L;
    const s0 = Math.floor(t0*sr), s1 = Math.floor(t1*sr), CH=4800;
    for(let s=s0;s<s1;s+=CH){
      const n=Math.min(CH,s1-s), d=new Float32Array(n*2);
      for(let i=0;i<n;i++){ const g = Math.min(1,(s+i-s0)/(0.05*sr),(s1-s-i)/(0.05*sr)); d[i]=L[s+i]*g; d[n+i]=R[s+i]*g; }
      const ad = new AudioData({format:'f32-planar', sampleRate:sr, numberOfFrames:n, numberOfChannels:2, timestamp:Math.round((s-s0)/sr*1e6), data:d});
      aenc.encode(ad); ad.close();
    }
    await aenc.flush(); aenc.close();
  }
  const cv = document.createElement('canvas'); cv.width=W; cv.height=H; const cx=cv.getContext('2d');
  const lb = loop ? document.createElement('canvas') : null; if(lb){ lb.width=W; lb.height=H; }
  const total = Math.round((t1-t0)*fps); const startClock = performance.now();
  for(let i=0;i<total;i++){
    if(cancelExport || failed) break;
    const t = t0 + i/fps;
    frame(cx, W, H, t);
    if(lb && t > t1-loop){   // blend the tail into the head so the clip loops seamlessly
      frame(lb.getContext('2d'), W, H, t-(t1-t0)); cx.globalAlpha=(t-(t1-loop))/loop; cx.drawImage(lb,0,0); cx.globalAlpha=1;
    }
    const vf = new VideoFrame(cv, {timestamp: Math.round(i*1e6/fps), duration: Math.round(1e6/fps)});
    venc.encode(vf, {keyFrame: i % (fps*2) === 0}); vf.close();
    while(venc.encodeQueueSize > 4) await new Promise(r=>setTimeout(r,1));
    if(i%10===0){
      $('bar').style.width = (i/total*100).toFixed(1)+'%'; recProgress(i/total);
      const el=(performance.now()-startClock)/1000, eta = el/(i+1)*(total-i);
      setStatus(`Rendering ${label}${Math.round(i/total*100)}% · about ${fmtTime(eta)} left`, true);
      frame(sctx, stage.width, stage.height, t); drawPlayhead(t);
      await new Promise(r=>setTimeout(r,0));
    }
  }
  try{ await venc.flush(); }catch(e){} venc.close();
  if(failed){ setStatus('Render failed: '+(failed.message||failed), true); return null; }
  if(cancelExport) return null;
  muxer.finalize();
  return new Blob([target.buffer], {type:'video/mp4'});
}
const resDims = ()=> ({1080:[1920,1080],1440:[2560,1440],720:[1280,720]})[$('res').value];
const canvasRender = (t0,label)=> renderVideo({W:1080,H:1920,fps:30,t0,t1:t0+8,audio:false,loop:0.75,label});   // Spotify Canvas: 8 silent seconds, tail blended into the head
const slugT = ()=> (S.title||'visualiser').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
function busy(on){ $('export').disabled=on; $('canvasLoop').disabled=on; $('kitMake').disabled=on; $('kitStills').disabled=on; $('cancel').hidden=!on; $('recdeck').classList.toggle('on',on); if(on){ $('saveAgain').hidden=true; cancelExport=false; recProgress(0); } else { $('bar').style.width='0'; recProgress(null); } }
function recProgress(f){ const d=$('recdeck'); d.style.setProperty('--p', f==null?0:f); $('recPct').textContent = f==null ? (buffer?'Renders the range set above':'Ready when the track is') : `Rendering · ${Math.round(f*100)}%`; }
$('export').addEventListener('click', async ()=>{
  if(!buffer) return;
  if(!('VideoEncoder' in window)){ $('exportNote').textContent = 'This browser cannot encode video. Open the page in Chrome or Edge to render.'; return; }
  stop(); busy(true);
  const dims=resDims(), fps=+$('fps').value;
  const t0 = $('range').value==='test' ? playhead : 0, t1 = $('range').value==='test' ? Math.min(buffer.duration, playhead+15) : buffer.duration;
  const aspects = $('formats').value==='both' ? ['16:9','9:16'] : [S.aspect];
  for(const [i,a] of aspects.entries()){
    const tall=a==='9:16', W=tall?dims[1]:dims[0], H=tall?dims[0]:dims[1];
    const blob = await renderVideo({W,H,fps,t0,t1,label: aspects.length>1 ? `${a} (${i+1}/${aspects.length}) ` : ''});
    if(!blob) break;
    lastBlob=blob; lastName=`${slugT()}-${tall?'vertical':'wide'}-${Math.min(W,H)}p${fps}${$('range').value==='test'?'-test':''}.mp4`;
    setStatus(`Rendered ${(blob.size/1e6).toFixed(0)} MB`); $('saveAgain').hidden=false; await saveBlob(blob, lastName);
  }
  busy(false); if(cancelExport) setStatus('Render cancelled'); requestDraw();
});
$('canvasLoop').addEventListener('click', async ()=>{
  if(!buffer) return;
  if(!('VideoEncoder' in window)){ $('exportNote').textContent = 'This browser cannot encode video. Open the page in Chrome or Edge to render.'; return; }
  stop(); busy(true);
  const t0=Math.min(playhead, Math.max(0,buffer.duration-8)), blob = await canvasRender(t0,'Canvas ');
  busy(false);
  if(blob){ lastBlob=blob; lastName=`${slugT()}-spotify-canvas-${fmtTime(t0).replace(':','m')}s.mp4`; setStatus('Canvas ready'); $('saveAgain').hidden=false; await saveBlob(blob,lastName); }
  else if(cancelExport) setStatus('Render cancelled');
  requestDraw();
});

/* ---------------- release kit: every output for a release, in one go ---------------- */
const KIT = [
  {id:'yt', name:'YouTube thumbnail', kind:'still', size:'yt', key:'still-yt'},
  {id:'ig', name:'Post 4:5', kind:'still', size:'ig', key:'still-ig'},
  {id:'story', name:'Story cover', kind:'still', size:'story', key:'still-story'},
  {id:'square', name:'Square', kind:'still', size:'square', key:'still-square'},
  {id:'cover', name:'Cover art', kind:'still', size:'cover', key:'still-cover'},
  {id:'banner', name:'SoundCloud banner', kind:'still', size:'banner', key:'still-banner'},
  {id:'wide', name:'Video 16:9', kind:'video', key:'v16'},
  {id:'tall', name:'Video 9:16', kind:'video', key:'v9'},
  {id:'canvas', name:'Spotify Canvas', kind:'video', key:'v9', dims:[1080,1920], note:'8 s loop'}
];
const kitSel = ()=> Array.isArray(S.kit) ? S.kit : DEFAULTS.kit;
function kitDims(o){
  if(o.kind==='still') return STILL_DIMS[o.size];
  if(o.dims) return o.dims;
  const [w,h] = resDims(); return o.id==='tall' ? [h,w] : [w,h];
}
// the moment the stills (and the Canvas loop) come from: the biggest section of the analysed track, or wherever the playhead is
let kitBig = null;
function kitTime(){
  if(S.kitMoment==='play') return {t:now()};
  if(!A) return {t:now(), note:'no track yet, using the playhead'};
  if(!kitBig || kitBig.A!==A) kitBig = {A, m:biggestMoments(1)[0]||null};
  return kitBig.m ? {t:(kitBig.m.t0+kitBig.m.t1)/2} : {t:now(), note:'no standout moment, using the playhead'};
}
const kitCanvasT0 = t => buffer ? Math.max(0, Math.min(t, buffer.duration-8)) : t;
function kitTimeLine(){
  const m = kitTime(), el = $('kitTime'); if(!el) return m;
  let txt = `Stills at ${fmtTime(m.t)}` + (m.note ? ` (${m.note})` : '');
  if(kitSel().includes('canvas') && buffer) txt += ` · Canvas from ${fmtTime(kitCanvasT0(m.t))}`;
  if(el.textContent!==txt) el.textContent = txt;
  return m;
}
function kitBuild(){
  const box = $('kitList'); let kind = '';
  for(const o of KIT){
    if(o.kind!==kind){ kind=o.kind; const h=document.createElement('h4'); h.textContent = kind==='still' ? 'Stills' : 'Video'; box.appendChild(h); }
    const r = document.createElement('div'); r.className='kitrow'; r.dataset.id=o.id;
    r.innerHTML = `<input type="checkbox" id="kit-${o.id}" aria-label="${o.name}"><label for="kit-${o.id}"><span>${o.name}</span><span class="ks"></span><i class="kdot" hidden title="Custom headline height"></i></label><button type="button" aria-label="Edit ${o.name}">Edit</button>`;
    r.querySelector('input').addEventListener('change', e=>{ const on=new Set(kitSel()); e.target.checked ? on.add(o.id) : on.delete(o.id); S.kit = KIT.map(k=>k.id).filter(id=>on.has(id)); persist(); kitTimeLine(); });
    r.querySelector('button').addEventListener('click', ()=>kitEdit(o));
    box.appendChild(r);
  }
}
function kitSync(){
  const on = kitSel(), ty = S.textY||{};
  for(const o of KIT){
    const r = document.querySelector(`.kitrow[data-id="${o.id}"]`); if(!r) continue;
    r.querySelector('input').checked = on.includes(o.id);
    const [w,h] = kitDims(o); r.querySelector('.ks').textContent = `${w}×${h}` + (o.note ? ` · ${o.note}` : '');
    r.querySelector('.kdot').hidden = typeof ty[o.key]!=='number';
  }
  kitTimeLine();
}
// Edit: put the stage on that format so its headline height can be tuned
function kitEdit(o){
  if(o.kind==='still'){ $('stillSize').value = o.size; $('stillPreview').checked = true; }
  else { $('stillPreview').checked = false; $('aspect').value = o.key==='v9' ? '9:16' : '16:9'; $('aspect').dispatchEvent(new Event('input',{bubbles:true})); }
  setAspect(); syncSeg(); setStatus(`Editing ${o.name}. Drag the headline on the stage to set its height for this format.`);
}
async function kitStillsZip(list,t){
  await ensureFont();
  const files = {};
  for(const [i,o] of list.entries()){
    if(cancelExport) return null;
    setStatus(`Kit · Still ${i+1}/${list.length} · ${o.name}`, true); recProgress(i/list.length);
    await new Promise(r=>setTimeout(r,0));
    const c = stillCanvas(o.size, t);
    const b = await new Promise(r=>c.toBlob(r,'image/png'));
    files[`${slugT()}-${o.id}.png`] = new Uint8Array(await b.arrayBuffer());
  }
  return new Blob([fflate.zipSync(files,{level:0})], {type:'application/zip'});
}
async function kitVideo(o,t,label){
  const fps = +$('fps').value;
  if(o.id==='canvas'){ const t0 = kitCanvasT0(t); return {blob: await canvasRender(t0,label), name:`${slugT()}-spotify-canvas-${fmtTime(t0).replace(':','m')}s.mp4`}; }
  const [W,H] = kitDims(o);
  return {blob: await renderVideo({W,H,fps,t0:0,t1:buffer.duration,label}), name:`${slugT()}-${o.id==='tall'?'vertical':'wide'}-${Math.min(W,H)}p${fps}.mp4`};
}
async function makeKit(withVideos){
  const on = kitSel(), stills = KIT.filter(o=>o.kind==='still' && on.includes(o.id)), vids = withVideos ? KIT.filter(o=>o.kind==='video' && on.includes(o.id)) : [];
  const note = $('kitNote'); note.textContent = '';
  if(!(withVideos ? stills.length+vids.length : stills.length)){ note.textContent = withVideos ? 'Nothing ticked. Choose at least one output.' : 'No stills ticked. Choose at least one still.'; return; }
  const m = kitTimeLine(); if(m.note) setStatus(`Stills: ${m.note}`);
  stop(); busy(true);
  try{
    if(stills.length){
      const zip = await kitStillsZip(stills, m.t);
      if(zip){ const name=`${slugT()}-kit.zip`; setStatus(`Zipped ${stills.length} stills`); await saveBlob(zip, name); }
    }
    if(vids.length && !cancelExport){
      if(!buffer) note.textContent = 'Videos skipped: load a track first.';
      else if(!('VideoEncoder' in window)) note.textContent = 'Videos skipped: this browser cannot encode video. Open the page in Chrome or Edge.';
      else for(const [i,o] of vids.entries()){
        if(cancelExport) break;
        const r = await kitVideo(o, m.t, `Kit ${i+1}/${vids.length} · ${o.name} · `);
        if(!r.blob) break;
        lastBlob=r.blob; lastName=r.name; $('saveAgain').hidden=false; setStatus(`Rendered ${(r.blob.size/1e6).toFixed(0)} MB`); await saveBlob(r.blob, r.name);
      }
    }
  } catch(e){ note.textContent = 'Kit stopped: '+(e && e.message || e); }
  finally { busy(false); if(cancelExport) setStatus('Kit cancelled'); requestDraw(); }
}
$('kitMake').addEventListener('click', ()=>makeKit(true));
$('kitStills').addEventListener('click', ()=>makeKit(false));
['res','fps'].forEach(id=>$(id).addEventListener('change', kitSync));
kitBuild(); window.KIT_READY = true; kitSync();

/* ---------------- remembered files (IndexedDB, this browser only) ---------------- */
const store = (()=>{
  let dbp = null;
  const open = ()=> dbp || (dbp = new Promise((res,rej)=>{ const r = indexedDB.open('skixo-visualiser',1); r.onupgradeneeded=()=>r.result.createObjectStore('files'); r.onsuccess=()=>res(r.result); r.onerror=()=>rej(r.error); }));
  const tx = async (mode, fn)=>{ const db = await open(); return new Promise((res,rej)=>{ const t=db.transaction('files',mode); const q=fn(t.objectStore('files')); t.oncomplete=()=>res(q&&q.result); t.onerror=()=>rej(t.error); }); };
  return {
    put:(k,blob,name)=> tx('readwrite', o=>o.put({blob,name},k)).catch(()=>{}),
    get:(k)=> tx('readonly', o=>o.get(k)).catch(()=>null),
    clear:()=> tx('readwrite', o=>o.clear()).catch(()=>{})
  };
})();
$('matchBg').addEventListener('click', ()=>{ if(!matchBackground()) setStatus('Load a background first, then match.'); });
$('clearBg').addEventListener('click', async ()=>{ IMGS.bg=null; S.bgId=''; markBg(); persist(); await store.put('img-bg', null, ''); setNote('bg','Empty'); requestDraw(); });
$('forgetFiles').addEventListener('click', async ()=>{ await store.clear(); setStatus('Saved files forgotten. Reload to return to the starter artwork.'); });

/* ---------------- releases and groups ----------------
   A group (album, series, playlist) holds the shared look; each release holds its own track, titles and cues. */
const SHARED_KEYS = ['headMove','styleQ','styleL','styleP','introAnim','clipIn','clipOut','clipBars','subject','frameShape','fSticker','fShadow','fOffset','logoTint','lineQuiet','phonesPeak','echoLine','look','artTint','paperCol','ink','blue','edge','layout','badgeSize','portraitY','breathe','kick','sway','rings','misprint',
  'spectrum','dashes','dashSpeed','clouds','cloudSpeed','glitch','glitchQuiet','glitchLift','glitchPeak','glitchTear','glitchSplit','glitchBlocks','glitchRoll','gSort','gMosh','gMirror','echo','bgDrift','bgOpacity','bgBlur','bgId','bgSec','bgAdj','mAdj','bgColour','light','grain','vignette','artist','textPos','textScale','textY','kit','headGap','font','fontCustom','showTitle','showArtist','useWordmark','lowercase','nod','nodEvery','nodGate','poseFade'];
let LIB = null, libTimer = null;
const uid = ()=> Math.random().toString(36).slice(2,9);
const grp = ()=> LIB.groups.find(g=>g.id===rel().groupId);
const rel = ()=> LIB.releases.find(r=>r.id===LIB.current);
function splitS(){ const sh={}, own={}; for(const k in S) (SHARED_KEYS.includes(k)?sh:own)[k]=S[k]; return {sh,own}; }
function saveLib(){
  if(!LIB) return; const {sh,own}=splitS(); const g=grp();
  if(S.patch && g.patches && g.patches[S.patch]) g.patches[S.patch]=sh; else g.shared=sh;   // edits go to the patch in use
  rel().own=own;
  clearTimeout(libTimer); libTimer=setTimeout(()=>store.put('library', JSON.stringify(LIB), 'library'), 300);
}
function fillPickers(){
  $('projGroup').textContent = grp().name; $('projRel').textContent = rel().name;
  const g=$('groupSel'), r=$('releaseSel'), cur=rel();
  g.innerHTML = LIB.groups.map(x=>`<option value="${x.id}">${esc(x.name)}</option>`).join(''); g.value = cur.groupId;
  r.innerHTML = LIB.releases.filter(x=>x.groupId===cur.groupId).map(x=>`<option value="${x.id}">${esc(x.name)}</option>`).join(''); r.value = cur.id;
}
const esc = t => String(t).replace(/[&<>"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
async function openRelease(id){
  saveLib(); stop(); LIB.current = id;
  const pp = rel().own && rel().own.patch, pg = grp().patches||{};
  S = Object.assign({}, DEFAULTS, grp().shared, (pp && pg[pp]) || {}, rel().own); if(pp && !pg[pp]) S.patch=null;
  if(typeof markPatches==='function') markPatches();
  if(grp().id!==artGroup) await loadArtwork();
  syncUI(); setAspect(); refreshArt(); fillPickers(); persist(); if($('mslot')) showMotionSec(); if(S.bgId) pickBg(S.bgId,false); if(BGLIB.length) loadSecBgs();
  const a = await store.get('audio-'+id);
  if(a && a.blob){ setNote('audio', a.name); await loadAudio(a.blob); }
  else { buffer=null; A=null; CUES=[]; KEYS=[]; playhead=12; $('play').disabled=true; $('export').disabled=true; setNote('audio','None yet'); drawTimeline(); setStatus('Drop a track for this release'); requestDraw(); }
}
function ownDefaults(name){ const own={}; for(const k in DEFAULTS) if(!SHARED_KEYS.includes(k)) own[k]=DEFAULTS[k]; own.title = name.toLowerCase(); own.aspect = S.aspect; return own; }
function newRelease(groupId, name){ const r={id:uid(), groupId, name, own:ownDefaults(name)}; LIB.releases.push(r); return r; }
$('groupSel').addEventListener('change', e=>{ const first = LIB.releases.find(r=>r.groupId===e.target.value); openRelease(first ? first.id : newRelease(e.target.value,'Untitled').id); });
$('releaseSel').addEventListener('change', e=> openRelease(e.target.value));
$('newRelease').addEventListener('click', ()=>{ const n = prompt('Name the new release'); if(n) { saveLib(); openRelease(newRelease(rel().groupId, n.trim()).id); } });
$('newGroup').addEventListener('click', ()=>{ const n = prompt('Name the new group (album, series or playlist). It starts with the current look.'); if(!n) return;
  saveLib(); const g={id:uid(), name:n.trim(), shared:{...grp().shared}}; LIB.groups.push(g); openRelease(newRelease(g.id,'Untitled').id); });
$('renameRelease').addEventListener('click', ()=>{ const n = prompt('Rename this release', rel().name); if(n){ rel().name=n.trim(); fillPickers(); saveLib(); } });
$('renameGroup').addEventListener('click', ()=>{ const n = prompt('Rename this group', grp().name); if(n){ grp().name=n.trim(); fillPickers(); saveLib(); } });
async function loadLibrary(){
  const saved = await store.get('library');
  if(saved && saved.blob){ try{ LIB = JSON.parse(saved.blob); }catch(e){ LIB=null; } }
  if(!LIB || !LIB.releases || !LIB.releases.length){
    const {sh,own}=splitS(); const g={id:uid(), name:'The skixO Service', shared:sh};
    const r={id:uid(), groupId:g.id, name:S.title ? S.title.replace(/\b\w/g,c=>c.toUpperCase()) : 'Untitled', own};
    LIB = {groups:[g], releases:[r], current:r.id};
    const old = await store.get('audio'); if(old && old.blob) await store.put('audio-'+r.id, old.blob, old.name);
  }
  { const pp=rel().own&&rel().own.patch, pg=grp().patches||{}; S = Object.assign({}, DEFAULTS, grp().shared, (pp&&pg[pp])||{}, rel().own); if(pp&&!pg[pp]) S.patch=null; } syncUI(); setAspect(); fillPickers(); if(typeof markPatches==='function') setTimeout(markPatches);
}

/* ---------------- segmented controls: selects marked data-seg become button groups (the select stays the source of truth) ---------------- */
const SHORT = {'720':'720p test','1080':'1080p','1440':'1440p','16:9':'16:9','9:16':'9:16','badge':'Badge','close':'Close-up','wallpaper':'Wide','auto':'Auto','manual':'Cue list','bottom-left':'Bottom left','bottom-centre':'Bottom centre','top-left':'Top left','headline':'Headline','headline-top':'Headline top','headline-bottom':'Headline bottom','off':'None','none':'None','same':'As video','one':'Current shape','both':'Both shapes','full':'Whole track','test':'15 s test','yt':'YouTube','ig':'Post 4:5','story':'Story','square':'Square','cover':'Cover art','banner':'Banner','play':'Playhead','big':'Biggest moment','soft':'Soft','ring':'Ring','trim':'Trim'};
function segLabel(o){ if(SHORT[o.value]) return SHORT[o.value]; return o.textContent.replace(/\s*\(.*\)/,'').replace(/ fps$/,' fps'); }
document.querySelectorAll('select[data-seg]').forEach(sel=>{
  const seg=document.createElement('div'); seg.className='seg'; seg.setAttribute('role','group'); seg.setAttribute('aria-label', (sel.closest('.row')?.querySelector('label')?.textContent)||sel.id);
  [...sel.options].forEach(o=>{ const b=document.createElement('button'); b.type='button'; b.textContent=segLabel(o); b.title=o.textContent; b.dataset.v=o.value;
    b.addEventListener('click',()=>{ sel.value=o.value; sel.dispatchEvent(new Event('input',{bubbles:true})); sel.dispatchEvent(new Event('change',{bubbles:true})); syncSeg(); }); seg.appendChild(b); });
  sel.hidden=true; sel.after(seg);
  if(sel.options.length>3) sel.closest('.row')?.classList.add('stack');
});
function syncTop(){ document.querySelectorAll('#frameTop button').forEach(b=>b.setAttribute('aria-pressed', b.dataset.v===S.aspect)); }
function syncSeg(){ syncTop(); if(window.LOOKUI_READY) syncLookUI(); document.querySelectorAll('select[data-seg]').forEach(sel=>sel.nextElementSibling.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed', b.dataset.v===sel.value))); }
syncSeg();

document.querySelectorAll('#frameTop button').forEach(b=>b.addEventListener('click',()=>{ const sel=$('aspect'); sel.value=b.dataset.v; sel.dispatchEvent(new Event('input',{bubbles:true})); syncSeg(); }));
$('exportTop').addEventListener('click', ()=>document.querySelector('[data-go="export"]').click());

/* ---------------- section switch for Motion ---------------- */
function showMotionSec(){
  const ms=$('mslot').dataset.v, m=S.mAdj||{};
  for(const k of MKEYS){ const el=$(k); if(!el) continue; const own = ms!=='all' && m[ms] && m[ms][k]!==undefined;
    const v = own ? m[ms][k] : S[k]; el.value=v; $(k+'-o').textContent=fmtVal(+v); el.closest('.row').classList.toggle('ovr', !!own); }
  for(const id of ['nodGate','nodEvery']){ const row=$(id) && $(id).closest('.row'); if(row){ row.classList.toggle('dim', ms!=='all'); row.title = ms!=='all' ? 'Same for every section' : ''; } }
  document.querySelectorAll('#mslotSeg button').forEach(b=>{ b.setAttribute('aria-pressed', b.dataset.v===ms); b.classList.toggle('has', b.dataset.v!=='all' && !!(m[b.dataset.v] && Object.keys(m[b.dataset.v]).length)); });
  const names={all:'every section (the defaults)',q:'quiet sections',l:'lifted sections',p:'peak moments'};
  const has = ms!=='all' && m[ms] && Object.keys(m[ms]).length;
  $('mslotNote').innerHTML = `Movement, nod and glitch knobs now change <b>${names[ms]}</b>.` + (ms!=='all' ? (has ? ' Changed knobs are marked. <button type="button" class="linkbtn" id="mReset">Use defaults for this section</button>' : ' Nothing changed yet; it uses the defaults.') : '');
  const r=$('mReset'); if(r) r.onclick=()=>{ S.mAdj[ms]={}; persist(); showMotionSec(); requestDraw(); };
}
document.querySelectorAll('#mslotSeg button').forEach(b=>b.addEventListener('click',()=>{ $('mslot').dataset.v=b.dataset.v; showMotionSec(); }));
showMotionSec();

/* ---------------- tactile controls: knobs with live rings, section pads, LCD, beat light, meters ----------------
   Knobs drive the hidden range inputs, so saving, sections and override dots work exactly as the sliders did.
   While the track plays, the bright ring shows what each setting is doing right now; at rest it shows the value. */
const K_A0=-135, K_A1=135;
function kPolar(r,a){ const q=(a-90)*Math.PI/180; return [24+r*Math.cos(q), 24+r*Math.sin(q)]; }
function kArc(a0,a1){ if(a1-a0<0.6) a1=a0+0.6; const r=21, [x0,y0]=kPolar(r,a0), [x1,y1]=kPolar(r,a1); return `M${x0.toFixed(2)} ${y0.toFixed(2)}A${r} ${r} 0 ${a1-a0>180?1:0} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`; }
function uiTone(hex){   // lift a look colour so it reads on the dark studio
  let m=/^#?([0-9a-f]{6})$/i.exec(hex||''); if(!m) return '#8db2cb';
  const n=parseInt(m[1],16); let r=(n>>16)/255, g=(n>>8&255)/255, b=(n&255)/255;
  const mx=Math.max(r,g,b), mn=Math.min(r,g,b); let h=0, sat=0, l=(mx+mn)/2;
  if(mx!==mn){ const d=mx-mn; sat=l>0.5?d/(2-mx-mn):d/(mx+mn); h = mx===r?((g-b)/d+(g<b?6:0)) : mx===g?((b-r)/d+2) : ((r-g)/d+4); h/=6; }
  l=Math.max(l,0.64); sat=Math.min(sat,0.6);
  const f=(p,q,t)=>{ t=(t+1)%1; return t<1/6?p+(q-p)*6*t : t<1/2?q : t<2/3?p+(q-p)*(2/3-t)*6 : p; };
  const q=l<0.5?l*(1+sat):l+sat-l*sat, p2=2*l-q, hx=v=>Math.round(v*255).toString(16).padStart(2,'0');
  return '#'+hx(f(p2,q,h+1/3))+hx(f(p2,q,h))+hx(f(p2,q,h-1/3));
}
const KN=[];
document.querySelectorAll('.knob').forEach(kn=>{
  const k=kn.dataset.k, inp=$(k), min=+inp.min, max=+inp.max, span=max-min, cell=kn.closest('.row');
  const [tr,va,li]=kn.querySelectorAll('path'), cap=kn.querySelector('.cap');
  tr.setAttribute('d', kArc(K_A0,K_A1));
  kn.setAttribute('aria-valuemin',min); kn.setAttribute('aria-valuemax',max);
  const set=v=>{ v=Math.round(Math.max(min,Math.min(max,v))*1000)/1000; if(v===+inp.value) return; inp.value=v; inp.dispatchEvent(new Event('input')); };
  let lastY=null;
  kn.addEventListener('pointerdown',e=>{ if(e.button) return; e.preventDefault(); kn.focus(); kn.setPointerCapture(e.pointerId); lastY=e.clientY; cell.classList.add('drag'); });
  kn.addEventListener('pointermove',e=>{ if(lastY===null) return; const d=lastY-e.clientY; lastY=e.clientY; set(+inp.value + d*span/(e.shiftKey?1600:160)); });
  const up=()=>{ lastY=null; cell.classList.remove('drag'); };
  kn.addEventListener('pointerup',up); kn.addEventListener('pointercancel',up);
  kn.addEventListener('dblclick',()=>set(DEFAULTS[k]));
  kn.addEventListener('wheel',e=>{ if(document.activeElement!==kn) return; e.preventDefault(); set(+inp.value - Math.sign(e.deltaY)*span*(e.shiftKey?0.002:0.02)); },{passive:false});   // only once selected, so scrolling the panel never turns a knob
  kn.addEventListener('keydown',e=>{
    const st=span*(e.shiftKey?0.002:0.01), m={ArrowUp:st,ArrowRight:st,ArrowDown:-st,ArrowLeft:-st,PageUp:span*0.1,PageDown:-span*0.1}[e.key];
    if(m!==undefined){ e.preventDefault(); set(+inp.value+m); } else if(e.key==='Home'){ e.preventDefault(); set(DEFAULTS[k]); }
  });
  KN.push({k,inp,min,span,kn,va,li,cap,last:''});
});
function kEnv(k,t,st){   // 0..1: how much of this setting is landing at time t
  const kick=d=>hitEnv(A.kicks,t,d), hat=d=>hitEnv(A.hats,t,d);
  switch(k){
    case 'breathe': return 0.5+0.5*Math.sin(t*2*Math.PI/7.5);
    case 'sway': return Math.min(1,Math.abs(Math.sin(t*2*Math.PI/13)*0.8+Math.sin(t*2*Math.PI/5.3)*0.2));
    case 'kick': case 'misprint': return kick(0.16);
    case 'rings': case 'echo': return kick(0.25);
    case 'spectrum': return hat(0.09);
    case 'nod': { if(!A.grid || energyAt(t)<st.nodGate) return 0; const P=A.grid.beat*(+S.nodEvery||1), ph=(((t-A.grid.phase+0.12*P)%P)+P)%P; return ph<0.45*P ? 1-ph/(0.45*P) : 0; }
    case 'gMirror': { if(!A.grid) return 0; const ph=(((t-A.grid.phase)%A.grid.beat)+A.grid.beat)%A.grid.beat; return Math.exp(-ph*4/A.grid.beat); }
    case 'gMosh': { let g=0; for(const c of CUES){ const a=t-c.t; if(a>=0&&a<0.8) g=Math.max(g,1-a/0.8); } return g; }
    case 'dashes': return 0.35+0.65*hat(0.12);
    case 'fOffset': return 0.35+0.65*kick(0.2);
    case 'fSticker': case 'fShadow': case 'dashSpeed': case 'clouds': case 'cloudSpeed': case 'light': case 'grain': case 'vignette': return 1;
    default: return Math.min(1, glitchLevel(t)/Math.max(0.05,S.glitch));
  }
}
const PAD_COL={all:null,q:POSE_COLS[0],l:POSE_COLS[1],p:POSE_COLS[2]};
let uiBlue='', meterL=0, meterR=0, anL=null, anR=null, anBuf=null;
function meterIn(){   // taps the track before the preview volume
  const c=getCtx();
  if(!anL){ const sp=c.createChannelSplitter(2), sink=c.createGain(); sink.gain.value=0; anL=c.createAnalyser(); anR=c.createAnalyser(); anL.fftSize=anR.fftSize=1024;
    sp.connect(anL,0); sp.connect(anR,1); anL.connect(sink); anR.connect(sink); sink.connect(c.destination); anL.inp=sp; anBuf=new Float32Array(1024); }
  return anL.inp;
}
function rms(an){ an.getFloatTimeDomainData(anBuf); let p=0; for(let i=0;i<anBuf.length;i++){ const v=Math.abs(anBuf[i]); if(v>p) p=v; } return p; }
function uiTick(){
  if(S.blue!==uiBlue){ uiBlue=S.blue; const c=uiTone(S.blue); document.documentElement.style.setProperty('--kacc',c);
    PAD_COL.all=c; document.querySelectorAll('#mslotSeg button').forEach(b=>b.style.setProperty('--pc', uiTone(PAD_COL[b.dataset.v]||c))); }
  const t=now(), live=playing && !!A, shown=KN.filter(o=>o.kn.offsetParent);   // each knob checks itself: knobs live on several tabs
  if(shown.length){
    const st=live?motionAt(t):S;
    for(const o of shown){
      const v=+o.inp.value, f=(v-o.min)/o.span;
      let lf=f; if(live){ const e=kEnv(o.k,t,st); lf = o.k==='nodGate' ? energyAt(t) : ((st[o.k]-o.min)/o.span)*e; }
      const key=(f*500|0)+'/'+(live?(lf*500|0):'-');
      if(key===o.last) continue; o.last=key;
      const a=K_A0+(K_A1-K_A0)*f;
      o.cap.style.transform=`rotate(${a.toFixed(1)}deg)`; o.va.setAttribute('d',kArc(K_A0,a));
      o.kn.classList.toggle('live',live);
      if(live) o.li.setAttribute('d',kArc(K_A0,K_A0+(K_A1-K_A0)*Math.max(0,Math.min(1,lf))));
      o.kn.setAttribute('aria-valuenow',v); o.kn.setAttribute('aria-valuetext',fmtVal(v));
    }
    const sec=live?SECK[Math.min(poseState(t).to,2)]:null;
    document.querySelectorAll('#mslotSeg button').forEach(b=>b.classList.toggle('live', b.dataset.v===sec));
  }
  // LCD: bar.beat from the beat grid, light on every beat (brighter on the one)
  const g=A&&A.grid, led=$('beatled');
  if(g){ const bi=Math.floor((t-g.phase)/g.beat), ph=(((t-g.phase)%g.beat)+g.beat)%g.beat;
    $('lbar').textContent = bi>=0 ? `${Math.floor(bi/4)+1}.${bi%4+1}` : '–.–'; $('lbpm').textContent=`${g.bpm.toFixed(1)} BPM`;
    const on=live && ph<Math.min(0.11,g.beat*0.22); led.classList.toggle('hit',on && bi%4!==0); led.classList.toggle('one',on && bi%4===0);
  } else { $('lbar').textContent='–.–'; $('lbpm').textContent='– BPM'; led.className='led'; }
  // meters: peak level in dB, quick attack, slow fall
  let l=0, r=0; if(live && anL){ l=rms(anL); r=buffer.numberOfChannels>1?rms(anR):l; }
  const db=x=>Math.max(0,Math.min(1,(20*Math.log10(x+1e-6)+48)/48));
  meterL=Math.max(db(l),meterL*0.9); meterR=Math.max(db(r),meterR*0.9);
  const bars=$('meter').querySelectorAll('b'); bars[0].style.clipPath=`inset(${(100-meterL*100).toFixed(1)}% 0 0 0)`; bars[1].style.clipPath=`inset(${(100-meterR*100).toFixed(1)}% 0 0 0)`;
  requestAnimationFrame(uiTick);
}
requestAnimationFrame(uiTick);

/* ---------------- draft captions with Whisper (beta) ----------------
   Runs in a Web Worker using transformers.js; the model downloads on first use and is then cached. */
let WH=null;
const WH_MODELS={fast:'Xenova/whisper-tiny.en', better:'Xenova/whisper-base.en', best:'Xenova/whisper-small.en'};
function whisperWorker(){
  const code=`import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.0.2';
  env.allowLocalModels=false; let asr=null, loaded='';
  self.onmessage=async e=>{ const {model,audio}=e.data;
    try{
      if(!asr || loaded!==model){ asr=await pipeline('automatic-speech-recognition', model, { progress_callback:p=>{ if(p.status==='progress') self.postMessage({type:'load', file:p.file, progress:p.progress}); } }); loaded=model; }
      self.postMessage({type:'status', text:'Listening…'});
      const out=await asr(audio,{ chunk_length_s:30, stride_length_s:5, return_timestamps:true });
      self.postMessage({type:'done', chunks: out.chunks||[], text: out.text||''});
    }catch(err){ self.postMessage({type:'error', text:String(err && err.message || err)}); }
  };`;
  return new Worker(URL.createObjectURL(new Blob([code],{type:'text/javascript'})),{type:'module'});
}
async function to16k(buf){ const oc=new OfflineAudioContext(1, Math.ceil(buf.duration*16000), 16000); const src=oc.createBufferSource(); src.buffer=buf; src.connect(oc.destination); src.start(); return (await oc.startRendering()).getChannelData(0); }
$('f-stem').addEventListener('change', e=>{ const f=e.target.files[0]; if(f) setNote('stem', f.name); });
$('whisperGo').addEventListener('click', async ()=>{
  if(WH) return;
  let buf=buffer; const stem=$('f-stem').files[0];
  try{ if(stem) buf=await getCtx().decodeAudioData(await stem.arrayBuffer()); }catch(e){ return setStatus("Couldn't read that vocal stem", true); }
  if(!buf) return setStatus('Load a track (or a vocal stem) first', true);
  $('whisperGo').disabled=true; setStatus('Preparing audio…', true);
  const audio=await to16k(buf); WH=whisperWorker();
  WH.onmessage=e=>{ const m=e.data;
    if(m.type==='load') setStatus(`Downloading model ${Math.round(m.progress||0)}% (first time only)`, true);
    else if(m.type==='status') setStatus(m.text+' This can take a few minutes.', true);
    else if(m.type==='done'){
      const lines=m.chunks.filter(c=>c.text && c.text.trim()).map(c=>`${fmtTime(c.timestamp[0]||0,true)} ${c.text.trim()}`);
      S.captions=lines.join('\n'); $('captions').value=S.captions; S.lyrics=m.chunks.map(c=>c.text.trim()).filter(Boolean).join('\n'); $('lyrics').value=S.lyrics; onChange('captions'); persist();
      setStatus(`Draft ready: ${lines.length} lines. Check the words; re-tap with the lyrics box if timings drift.`); WH.terminate(); WH=null; $('whisperGo').disabled=false; }
    else if(m.type==='error'){ setStatus('Transcription failed: '+m.text, true); WH.terminate(); WH=null; $('whisperGo').disabled=false; }
  };
  WH.postMessage({model:WH_MODELS[$('whisperModel').value], audio},[audio.buffer]);
});

/* ---------------- tap to time: paste lyrics, play, press Enter (or Tap) as each line starts ---------------- */
let TAP=null;
function tapShow(){ if(!TAP) return; const l=TAP.lines[TAP.i]; $('tapLine').textContent = l ? `Next: ${l}` : 'Done'; setStatus(l ? `Tap at: "${l}" (${TAP.i+1}/${TAP.lines.length}) · Enter to tap, Esc to stop` : 'Done'); $('tapNext').disabled=!l; }
function tapEnd(msg){ TAP=null; $('tapLine').textContent='Press Start, then tap here or press Enter as each line begins'; $('tapNext').disabled=true; $('tapStart').textContent='Start tapping'; setStatus(msg||'Captions timed'); }
function tapStamp(){
  if(!TAP) return; const l=TAP.lines[TAP.i]; if(!l) return;
  const pad=$('tapNext'); pad.classList.remove('hit'); void pad.offsetWidth; pad.classList.add('hit');
  TAP.out.push(`${fmtTime(now(),true)} ${l}`); TAP.i++;
  S.captions=TAP.out.join('\n'); $('captions').value=S.captions; onChange('captions');
  if(TAP.i>=TAP.lines.length) tapEnd(`All ${TAP.lines.length} lines timed. Fix any in the caption list.`); else tapShow();
}
$('tapStart').addEventListener('click', ()=>{
  if(TAP) return tapEnd('Stopped');
  const lines=($('lyrics').value||'').split('\n').map(x=>x.trim()).filter(Boolean);
  if(!buffer || !lines.length) return setStatus('Load a track and paste the lyrics first', true);
  TAP={lines, i:0, out:[]}; $('lyrics').blur(); $('tapStart').textContent='Stop';
  if(!playing) play(); tapShow();
});
$('tapNext').addEventListener('click', tapStamp);
document.addEventListener('keydown', e=>{ if(!TAP) return; if(e.key==='Enter'){ e.preventDefault(); tapStamp(); } else if(e.key==='Escape'){ tapEnd('Stopped'); } });

$('bgColour').addEventListener('input', e=>{ S.bgColour=e.target.value; $('bgColourReset').hidden=false; persist(); requestDraw(); });
$('bgColourReset').addEventListener('click', ()=>{ S.bgColour=''; $('bgColour').value=S.paperCol; $('bgColourReset').hidden=true; persist(); requestDraw(); });
function syncBgColour(){ $('bgColour').value = S.bgColour || S.paperCol; $('bgColourReset').hidden = !S.bgColour; if(S.bgColour) $('bgColourRow').hidden=false; $('bgColourShow').hidden = !$('bgColourRow').hidden; }
$('bgColourShow').addEventListener('click',()=>{ $('bgColourRow').hidden=false; $('bgColourShow').hidden=true; });
syncBgColour();

/* ---------------- tabs ---------------- */
(function(){
  const rail=$('rail'), order=[];
  const secs=[...rail.querySelectorAll('details[data-tab]')];
  order.forEach(n=>{ const d=secs.find(x=>x.querySelector('summary').textContent===n); if(d) rail.appendChild(d); });
  const show=name=>{ secs.forEach(d=>d.hidden = d.dataset.tab!==name); rail.querySelectorAll('[data-go]').forEach(b=>b.setAttribute('aria-selected', b.dataset.go===name)); rail.scrollTop=0; try{ localStorage.setItem('skixo-vis-tab',name); }catch(e){} };
  rail.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>show(b.dataset.go)));
  let start='track'; try{ start=localStorage.getItem('skixo-vis-tab')||'track'; }catch(e){} show(start);
})();

/* ---------------- group backup ---------------- */
$('exportGroup').addEventListener('click', ()=>{
  saveLib(); const g=grp(); const data={kind:'skixo-visualiser-group', version:1, group:g, releases:LIB.releases.filter(r=>r.groupId===g.id)};
  const name=g.name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'group';
  saveBlob(new Blob([JSON.stringify(data,null,1)],{type:'application/json'}), `${name}.skixo-group.json`);
});
$('importGroup').addEventListener('click', ()=>$('importFile').click());
$('importFile').addEventListener('change', async e=>{
  const f=e.target.files[0]; if(!f) return;
  try{
    const d=JSON.parse(await f.text()); if(d.kind!=='skixo-visualiser-group') throw 0;
    const gid=uid(); LIB.groups.push({id:gid, name:d.group.name+(LIB.groups.some(g=>g.name===d.group.name)?' (imported)':''), shared:d.group.shared});
    let first=null; for(const r of d.releases){ const nr={id:uid(), groupId:gid, name:r.name, own:r.own}; LIB.releases.push(nr); first=first||nr; }
    if(!first) first=newRelease(gid,'Untitled');
    await openRelease(first.id); setStatus(`Loaded "${d.group.name}". Tracks aren't saved in the file, so drop them in again.`);
  }catch(err){ setStatus('That file is not a skixO group file.', true); }
  e.target.value='';
});

/* ---------------- artwork per release group ----------------
   Mascot frames you drop in are saved for the current group; groups without their own use the starter set. */
const STARTER = { a:'assets/wistful.jpg', b:'assets/wistful-shadow.jpg', c:'assets/peak-face.jpg', w:'assets/wallpaper.jpg',
  clip:'assets/intro-sway.mp4', cut:'assets/cut.webp', cpeak:'assets/cut-peak.webp', cn1:'assets/cut-nod-1.webp', cn2:'assets/cut-nod-2.webp', cwear:'assets/cut-wearing.webp', cpn1:'assets/cut-peak-nod-1.webp', cpn2:'assets/cut-peak-nod-2.webp', cwn1:'assets/cut-wearing-nod-1.webp', cwn2:'assets/cut-wearing-nod-2.webp', sketch:'assets/cut-sketch.webp', halftone:'assets/cut-halftone.webp', cutn:'assets/cut-nophones.webp', phones:'assets/phones.webp', line:'assets/line.webp',
  n1f:'assets/nod-flat-1.jpg', n2f:'assets/nod-flat-2.jpg', n1c:'assets/nod-side-1.jpg', n2c:'assets/nod-side-2.jpg', n1p:'assets/nod-peak-1.jpg', n2p:'assets/nod-peak-2.jpg' };
const ART_SLOTS = ['a','b','c','h','w','bg','n1c','n2c','n1f','n2f','n1p','n2p','cut','cutn','phones','line','logo','clip','cpeak','cn1','cn2','cwear','sketch','halftone','cpn1','cpn2','cwn1','cwn2'];
const artKey = s => s==='bg' ? 'img-bg' : `img-${LIB ? grp().id : 'x'}-${s}`;
let artGroup = null;
async function loadArtwork(){
  artGroup = LIB ? grp().id : null; const isFirst = LIB && LIB.groups[0].id===artGroup;
  // a/b first so nod frames can align to them
  for(const k of ['a','b','c', ...ART_SLOTS.filter(x=>!['a','b','c'].includes(x))]){
    let saved = await store.get(artKey(k));
    if((!saved || !saved.blob) && isFirst) saved = await store.get('img-'+k);   // files saved before groups had artwork
    if(saved && saved.blob) await setPose(k, saved.blob, saved.name);
    else if(STARTER[k]) await setPose(k, STARTER[k]);
    else { if(k==='bg') continue; IMGS[k]=null; if(NOD_SLOTS.includes(k)) delete RAW[k]; setNote(k,'Empty'); }
  }
  rebuildCues();
}

/* ---------------- boot ---------------- */
$('font').innerHTML = GFONTS.map(f=>`<option value="${f}">${f}</option>`).join('') + '<option value="custom">Installed font…</option>';
syncUI(); bindUI(); setAspect(); markLook();
(async ()=>{
  try{
    await Promise.all([document.fonts.load('500 20px "Libre Franklin"').catch(()=>{}), loadWordmark()]);
    makeClouds(S.blue); requestDraw();
    await loadLibrary(); await loadArtwork(); refreshArt(); $('fontCustomRow').hidden = S.font!=='custom'; ensureFont(); if(S.bgId && BGLIB.length) pickBg(S.bgId,false);
    const track = await store.get('audio-'+LIB.current);
    if(track && track.blob){ $('trackName').textContent = track.name; setNote('audio', track.name); await loadAudio(track.blob); }
    else setStatus('Drop a track anywhere to start');
  }catch(e){ setStatus('Could not load the starter files. Drop in a track and artwork to begin.', true); }
})();

/* ---------------- Look tab inputs: ink chips, text anchor, font specimens, frame grid, stage handles; tap tempo ---------------- */
function setInput(id,v){ const i=$(id); i.value=v; i.dispatchEvent(new Event('input')); }
// ink chips: hex fields and a screen eyedropper (Chrome and Edge)
document.querySelectorAll('.hex').forEach(h=>{
  const src=$(h.dataset.for);
  h.addEventListener('change',()=>{ let v=h.value.trim(); if(/^[0-9a-f]{6}$/i.test(v)) v='#'+v; if(/^#[0-9a-f]{6}$/i.test(v)) setInput(src.id, v.toLowerCase()); syncLookUI(); });
  h.addEventListener('keydown',e=>{ if(e.key==='Enter') h.blur(); });
  src.addEventListener('input',()=>{ if(document.activeElement!==h) h.value=src.value.toUpperCase(); });
});
if('EyeDropper' in window) document.querySelectorAll('.inkchip .drop').forEach(b=>{ b.hidden=false;
  b.addEventListener('click', async ()=>{ try{ const r=await new EyeDropper().open(); setInput(b.dataset.for, r.sRGBHex.slice(0,7)); syncLookUI(); }catch(e){} }); });
$('bgColourReset').addEventListener('click',()=>{ $('bgColourRow').hidden=true; $('bgColourShow').hidden=false; });
// text: style (label, headline, none) plus a 3x3 anchor
const ANCHOR=[['top-left','top-centre','top-right'],[null,null,null],['bottom-left','bottom-centre','bottom-right']];
const HEAD=['headline-top','headline','headline-bottom'];
const ANCHOR_NAMES=['Top','Middle','Bottom'], COL_NAMES=['left','centre','right'];
(function(){ const g=$('anchor'); for(let r=0;r<3;r++) for(let c=0;c<3;c++){ const b=document.createElement('button'); b.type='button'; b.dataset.r=r; b.dataset.c=c; b.setAttribute('aria-label',`${ANCHOR_NAMES[r]} ${COL_NAMES[c]}`); g.appendChild(b);
  b.addEventListener('click',()=>{ const st=textStyle(); const v = st==='headline' ? (c===1 ? HEAD[r] : null) : ANCHOR[r][c]; if(v){ if(st==='headline') setTextY(uiKey(),null,true); setInput('textPos',v); syncLookUI(); } }); } })();
// per-format headline height: the override lives in S.textY[format]; the preset applies until one is set
const uiStill = ()=> !!$('stillPreview').checked;
const uiKey = ()=> uiStill() ? 'still-'+$('stillSize').value : (S.aspect==='9:16' ? 'v9' : 'v16');
const uiMode = ()=> (uiStill() && S.stillText!=='same') ? S.stillText : (S.textPos||'');
const uiHeadline = ()=> uiMode().startsWith('headline');
const headY = ()=>{ const o=(S.textY||{})[uiKey()]; return typeof o==='number' ? Math.max(0.04,Math.min(0.96,o)) : (HEAD_PRESET[uiMode()]||0.5); };
function setTextY(key,v,quiet){ const o=Object.assign({},S.textY); if(v==null){ if(!(key in o)) return; delete o[key]; } else o[key]=Math.round(v*1000)/1000; S.textY=o; persist(); syncHeightUI(); if(!quiet) requestDraw(); }
function syncHeightUI(){ if(window.KIT_READY) kitSync(); const row=$('heightRow'); if(!row) return; const on=uiHeadline(); row.hidden=!on; if(!on) return;
  const k=uiKey(), v=headY(), set=typeof (S.textY||{})[k]==='number';
  $('heightFmt').textContent=' · '+FMT_NAMES[k]; $('textYr').value=v; $('textYr-o').textContent=(v*100).toFixed(1)+'%'; $('textYReset').disabled=!set; }
$('textYr').addEventListener('input',e=>{ setTextY(uiKey(),+e.target.value); });
$('textYReset').addEventListener('click',()=>setTextY(uiKey(),null));
function textStyle(){ const v=S.textPos||'bottom-left'; return v==='off' ? 'off' : v.startsWith('headline') ? 'headline' : 'label'; }
document.querySelectorAll('#textStyle button').forEach(b=>b.addEventListener('click',()=>{ const want=b.dataset.v, cur=textStyle(); if(want===cur) return;
  const v=S.textPos||'', top=v.includes('top'), bottom=v.includes('bottom')||v==='off';
  setInput('textPos', want==='off' ? 'off' : want==='headline' ? (top?'headline-top':v==='headline'||!bottom?'headline':'headline-bottom') : (top?'top-left':'bottom-left')); syncLookUI(); }));
// font specimens: each font shown in its own face with your title
const FONT_PREVIEW_CHARS='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 .,!?&\'-';
(function(){ const l=document.createElement('link'); l.rel='stylesheet';
  l.href='https://fonts.googleapis.com/css2?'+GFONTS.filter(f=>f!=='Libre Franklin').map(f=>'family='+encodeURIComponent(f).replace(/%20/g,'+')).join('&')+'&text='+encodeURIComponent(FONT_PREVIEW_CHARS)+'&display=swap';
  document.head.appendChild(l); })();
const fontSampleText=()=>{ const t=S.title||'glad you came'; return S.lowercase ? t.toLowerCase().replace(/skixo/g,'skixO') : t; };
(function(){ const list=$('fontList');
  list.innerHTML=[...GFONTS,'custom'].map(f=>`<button type="button" role="option" data-f="${f}"><span class="fsample" style="font-family:${f==='custom'?'var(--ui)':`'${f}', var(--ui)`}"></span><span class="fname">${f==='custom'?'An installed font':f}</span></button>`).join('');
  const close=()=>{ list.hidden=true; $('fontBtn').setAttribute('aria-expanded','false'); };
  $('fontBtn').addEventListener('click',()=>{ list.hidden=!list.hidden; $('fontBtn').setAttribute('aria-expanded',String(!list.hidden)); if(!list.hidden){ syncLookUI(); (list.querySelector('[aria-selected="true"]')||list.firstElementChild).focus(); } });
  list.addEventListener('click',e=>{ const b=e.target.closest('[data-f]'); if(!b) return; setInput('font',b.dataset.f); close(); syncLookUI(); $('fontBtn').focus(); if(b.dataset.f==='custom') $('fontCustom').focus(); });
  list.addEventListener('keydown',e=>{ const items=[...list.children], i=items.indexOf(document.activeElement);
    if(e.key==='ArrowDown'||e.key==='ArrowUp'){ e.preventDefault(); items[(i+(e.key==='ArrowDown'?1:-1)+items.length)%items.length].focus(); }
    else if(e.key==='Escape'){ close(); $('fontBtn').focus(); } });
})();
// mascot frame grid: thumbnails, click to choose, drop onto a frame
function drawTile(slot,bmp){ const c=document.querySelector(`.ftile[data-slot="${slot}"] canvas`); if(!c) return; const x=c.getContext('2d'); x.clearRect(0,0,c.width,c.height); if(!bmp) return;
  const sc=(CUT_SLOTS.includes(slot)?Math.min:Math.max)(c.width/bmp.width, c.height/bmp.height)*(CUT_SLOTS.includes(slot)?0.92:1), w=bmp.width*sc, h=bmp.height*sc; x.drawImage(bmp,(c.width-w)/2,(c.height-h)/2,w,h); }
document.querySelectorAll('.ftile').forEach(t=>{ const slot=t.dataset.slot;
  t.addEventListener('click',()=>$('f-'+slot).click());
  t.addEventListener('dragover',e=>{ e.preventDefault(); e.stopPropagation(); t.classList.add('over'); });
  t.addEventListener('dragleave',()=>t.classList.remove('over'));
  t.addEventListener('drop',e=>{ e.preventDefault(); e.stopPropagation(); t.classList.remove('over'); $('app').classList.remove('drop'); const f=e.dataTransfer.files[0]; if(f) takeFile(f,slot); });
});
for(const k of Object.keys(IMGS)){ const src = RAW[k] || (IMGS[k] && (IMGS[k]._src||IMGS[k])); if(src && src.width) drawTile(k, src); }
// stage handles: drag the portrait to move it, scroll to resize, double-click to reset; over the headline they set its height and size instead
(function(){ const st=$('stage'), wrap=$('stagewrap'); let sd=null, td=null;
  const hint=document.createElement('div'); hint.className='stagehint'; hint.textContent='Drag to move · drag the headline to set its height · scroll to resize · double-click to reset'; wrap.appendChild(hint);
  const on=()=>S.layout!=='wallpaper';
  const setR=(k,v)=>{ const i=$(k); setInput(k, Math.round(Math.max(+i.min,Math.min(+i.max,v))*1000)/1000); };
  const onHead=e=>{ const b=HEAD_BOX; if(!b || !uiHeadline()) return false; const r=st.getBoundingClientRect(), x=(e.clientX-r.left)*st.width/r.width, y=(e.clientY-r.top)*st.height/r.height, p=b.H*0.02;
    return x>=b.x-p && x<=b.x+b.w+p && y>=b.y-p && y<=b.y+b.h+p; };
  st.addEventListener('pointerdown',e=>{ if(e.button) return;
    if(onHead(e)){ e.preventDefault(); td={y:e.clientY,v:headY()}; st.setPointerCapture(e.pointerId); wrap.classList.add('grab'); st.style.cursor='ns-resize'; return; }
    if(!on()) return; e.preventDefault(); sd={y:e.clientY,v:+S.portraitY||0}; st.setPointerCapture(e.pointerId); wrap.classList.add('grab'); });
  st.addEventListener('pointermove',e=>{
    if(td){ let v=Math.max(0.04,Math.min(0.96,td.v+(e.clientY-td.y)/st.getBoundingClientRect().height)); TEXT_GUIDE=null;
      if(!e.altKey) for(const s of [0.16,0.5,0.82]) if(Math.abs(v-s)<0.012){ v=s; TEXT_GUIDE=s; break; }
      setTextY(uiKey(),v); return; }
    if(sd){ setR('portraitY', sd.v + (e.clientY-sd.y)/st.getBoundingClientRect().height); return; }
    st.style.cursor = onHead(e) ? 'ns-resize' : ''; });
  const up=()=>{ const had=td; sd=null; td=null; TEXT_GUIDE=null; wrap.classList.remove('grab'); if(had) requestDraw(); }; st.addEventListener('pointerup',up); st.addEventListener('pointercancel',up);
  st.addEventListener('wheel',e=>{ if(onHead(e)){ e.preventDefault(); setR('textScale', (S.textScale||1) - Math.sign(e.deltaY)*(e.shiftKey?0.01:0.05)); return; } if(!on()) return; e.preventDefault(); setR('badgeSize', S.badgeSize - Math.sign(e.deltaY)*(e.shiftKey?0.0025:0.01)); },{passive:false});
  st.addEventListener('dblclick',e=>{ if(onHead(e)){ setTextY(uiKey(),null); return; } if(!on()) return; setR('portraitY',0); setR('badgeSize',DEFAULTS.badgeSize); });
  wrap.classList.add('handles');
})();
// tap tempo
(function(){ let taps=[]; const b=$('tapBpm');
  b.addEventListener('click',()=>{ const n=performance.now(); if(taps.length && n-taps[taps.length-1]>2000) taps=[]; taps.push(n); taps=taps.slice(-9);
    b.classList.remove('hit'); void b.offsetWidth; b.classList.add('hit');
    if(taps.length<4){ b.textContent=`Tap ${taps.length}…`; return; }
    const iv=(taps[taps.length-1]-taps[0])/(taps.length-1), bpm=Math.round(600000/iv)/10; b.textContent=`${bpm} BPM`; setInput('bpm', String(bpm));
    clearTimeout(b._t); b._t=setTimeout(()=>{ b.textContent='Tap tempo'; taps=[]; },2500); });
})();
function syncLookUI(){
  document.querySelectorAll('.hex').forEach(h=>{ if(document.activeElement!==h) h.value=$(h.dataset.for).value.toUpperCase(); });
  const st=textStyle(), v=S.textPos||'bottom-left';
  document.querySelectorAll('#textStyle button').forEach(b=>b.setAttribute('aria-pressed', b.dataset.v===st));
  document.querySelectorAll('#anchor button').forEach(b=>{ const r=+b.dataset.r, c=+b.dataset.c, val = st==='headline' ? (c===1?HEAD[r]:null) : st==='label' ? ANCHOR[r][c] : null;
    b.disabled=!val; b.setAttribute('aria-pressed', !!val && val===v); });
  syncHeightUI();
  const f=S.font==='custom' ? (S.fontCustom||'') : S.font;
  $('fontSample').textContent=fontSampleText(); $('fontSample').style.fontFamily = f ? `'${f}', var(--ui)` : 'var(--ui)'; $('fontName').textContent = S.font==='custom' ? (S.fontCustom||'Installed font') : S.font;
  document.querySelectorAll('#fontList [data-f]').forEach(b=>{ b.setAttribute('aria-selected', b.dataset.f===S.font); b.querySelector('.fsample').textContent = b.dataset.f==='custom' ? 'Installed font…' : fontSampleText(); });
}
for(const k of ['title','lowercase','fontCustom']) $(k).addEventListener(k==='lowercase'?'change':'input', ()=>syncLookUI());
window.LOOKUI_READY=true; syncLookUI(); recProgress(null);

/* ---------------- subject panel ---------------- */
function syncSubjectUI(){
  if(S.lineQuiet){ S.styleQ='line'; S.lineQuiet=false; if(typeof syncSeg==='function') setTimeout(syncSeg); persist(); }   // older switch becomes the quiet style
  const sub=S.subject||'mascot', cut=S.frameShape==='cutout';
  $('frameRow').hidden = sub==='text'; $('logoRow').hidden = sub!=='image';
  $('styleRows').hidden = $('phonesRow').hidden = !(sub==='mascot' && cut);
  const notes = { mascot: cut ? 'The cut-out uses your transparent mascot files: it nods with the cut-out nod frames and smiles at the peaks. Each section can have its own drawing style.' : 'Your mascot frames, cropped to the frame shape.',
    image: 'Any PNG or SVG. All the motion, scenes and glitch still apply. Circle and Rounded put it on an accent plate; Cut-out keeps its own shape.',
    text: 'The title becomes the subject, set in your font. The label is hidden, since the title is already the centrepiece.' };
  $('subjectNote').textContent = notes[sub];
}
syncSubjectUI();
/* ---------------- patches: up to four variations per group, each release picks one ---------------- */
const PATCHES=['A','B','C','D'];
function sharedSnap(){ return JSON.parse(JSON.stringify(splitS().sh)); }
function markPatches(){
  if(!LIB) return; const g=grp(), pg=g.patches||{}, store=$('patchStore').getAttribute('aria-pressed')==='true';
  document.querySelectorAll('#patches button').forEach(b=>{ const p=b.dataset.p, d = p ? pg[p] : g.shared, filled=!!d;
    b.setAttribute('aria-pressed', (S.patch||'')===p); b.classList.toggle('empty', !filled); b.classList.toggle('arm', store && p!=='');
    const i=b.querySelector('i'); i.style.background = d ? `linear-gradient(90deg, ${d.paperCol||S.paperCol} 0 34%, ${d.blue||S.blue} 34% 67%, ${d.ink||S.ink} 67%)` : '';
    b.title = p ? (filled ? `Patch ${p}${store?': click to overwrite with the current look':''}` : `Empty: click to save the current look as patch ${p}`) : 'The group\'s main look'; });
  const used = LIB.releases.filter(r=>r.groupId===g.id && r.own && r.own.patch).length;
  $('patchNote').textContent = store ? 'Pick a pad to save the current look into it.' : S.patch ? `This release uses patch ${S.patch}. Changes to the look now save into ${S.patch}, so other releases on ${S.patch} follow.` : `Patches are variations of this group's look. Each release can use one${used?`; ${used} release${used>1?'s':''} here already do`:''}.`;
}
function applySnap(snap){
  Object.assign(S, JSON.parse(JSON.stringify(snap)));
  syncUI(); refreshArt(); if(S.bgId) pickBg(S.bgId,false); if(BGLIB.length) loadSecBgs(); showMotionSec(); syncSubjectUI(); persist(); requestDraw();
}
function usePatch(p){
  saveLib(); const g=grp(); S.patch = p || null;
  applySnap(Object.assign({}, DEFAULTS_SHARED(), g.shared, p ? g.patches[p] : {})); markPatches();
  setStatus(p ? `Patch ${p}` : 'Main look');
}
function DEFAULTS_SHARED(){ const o={}; for(const k of SHARED_KEYS) if(k in DEFAULTS) o[k]=DEFAULTS[k]; return o; }
function storePatch(p){ const g=grp(); g.patches=g.patches||{}; g.patches[p]=sharedSnap(); S.patch=p; $('patchStore').setAttribute('aria-pressed','false'); saveLib(); persist(); markPatches(); setStatus(`Saved the current look as patch ${p}`); }
document.querySelectorAll('#patches button').forEach(b=>b.addEventListener('click',()=>{
  const p=b.dataset.p, pg=grp().patches||{}, store=$('patchStore').getAttribute('aria-pressed')==='true';
  if(p && (store || !pg[p])) storePatch(p); else usePatch(p);
}));
$('patchStore').addEventListener('click',()=>{ const b=$('patchStore'); b.setAttribute('aria-pressed', b.getAttribute('aria-pressed')!=='true'); markPatches(); });
/* ---------------- shuffle: a new look, scene, texture and glitch mix within taste ---------------- */
let SHUF_PREV=null;
$('shuffle').addEventListener('click',()=>{
  if(!SHUF_PREV) SHUF_PREV = sharedSnap();
  const r=(a,b)=>Math.round((a+Math.random()*(b-a))*100)/100, pick=a=>a[Math.floor(Math.random()*a.length)];
  const L=pick(LOOKS), pal={paper:'any',dusk:'dusk',sage:'sage',riso:'riso',night:'night'}[L.id];
  const scenes=BGLIB.filter(b=>b.palette===pal || (pal==='any' && b.set==='animated'));
  const sc = scenes.length ? pick(scenes).id : S.bgId;
  const glitchy = Math.random()<0.5;
  applySnap({ look:L.id, paperCol:L.paperCol, ink:L.ink, blue:L.blue, artTint:L.artTint, bgId:sc, bgSec:{q:'',l:'',p:''},
    dashes:r(0.15,0.7), dashSpeed:r(0.2,0.7), clouds:r(0.1,0.8), cloudSpeed:r(0.2,0.6), light:r(0,0.5), grain:r(0.3,0.7), vignette:r(0.15,0.5),
    misprint:r(0.1,0.5), rings:r(0.2,0.7), spectrum:r(0.1,0.6), echo: Math.random()<0.3 ? r(0.2,0.5) : 0,
    glitch: glitchy ? r(0.2,0.6) : 0, glitchTear:r(0,0.8), glitchSplit:r(0,0.8), glitchBlocks:r(0,0.6), glitchRoll:r(0,0.5), gSort:Math.random()<0.3?r(0.2,0.6):0, gMirror:Math.random()<0.2?0.5:0,
    fOffset: Math.random()<0.4 ? r(0.2,0.7) : 0, fSticker: S.frameShape==='cutout' ? r(0,0.7) : S.fSticker, bgBlur: Math.random()<0.3 ? r(0.2,0.6) : 0, bgDrift:r(0.2,0.8) });
  markLook(); markPatches(); $('unshuffle').hidden=false; setStatus(`Shuffled: ${L.name}${sc?', new scene':''}`);
});
$('unshuffle').addEventListener('click',()=>{ if(!SHUF_PREV) return; applySnap(SHUF_PREV); SHUF_PREV=null; $('unshuffle').hidden=true; markLook(); markPatches(); setStatus('Back to the look before shuffling'); });
setTimeout(markPatches, 400);
