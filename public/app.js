"use strict";
/* ---------------- settings ---------------- */
const DEFAULTS = {
  layout:'badge', aspect:'16:9',
  poseMode:'auto', poseLow:0.40, poseHigh:0.74, poseHold:8, poseFade:3, eyeFade:0, blinks:0.35, snapKick:true, nod:0.6, nodEvery:'1', nodGate:0.45, bpm:'', manualCues:'',
  badgeSize:0.80, breathe:0.5, kick:0.45, sway:0.3,
  rings:0.45, misprint:0.3, spectrum:0.4,
  dashes:0.55, dashSpeed:0.45, clouds:0.6, cloudSpeed:0.35, light:0.35,
  grain:0.5, vignette:0.35, fadeIn:2.5, fadeOut:4,
  title:'glad you came', artist:'the skixO service', credit:'', textPos:'bottom-left', useWordmark:false, lowercase:true,
  ink:'#1d2023', blue:'#3d6884', paperCol:'#f8f2e4'
};
const SLIDERS = {
  'autoPose':[
    ['poseLow','Side light at',0,1,0.01],['poseHigh','Eyes open at',0,1,0.01],
    ['poseHold','Hold (s)',1,30,0.5]],
  'g-posefx':[
    ['poseFade','Light change (s)',0.2,8,0.1],['eyeFade','Eye blend (s)',0,0.5,0.01],['blinks','Blinks',0,1,0.01]],
  'g-nod':[
    ['nod','Nod depth',0,1,0.01],['nodGate','Nod from energy',0,1,0.01]],
  'g-motion':[
    ['badgeSize','Portrait size',0.4,1.0,0.01],['breathe','Breathing',0,1,0.01],['kick','Kick pulse',0,1,0.01],
    ['sway','Sway',0,1,0.01],['rings','Kick rings',0,1,0.01],['misprint','Misprint',0,1,0.01],['spectrum','Spectrum ticks',0,1,0.01],
    ['fadeIn','Fade in (s)',0,10,0.1],['fadeOut','Fade out (s)',0,10,0.1]],
  'g-atmos':[
    ['dashes','Glitch dashes',0,1,0.01],['dashSpeed','Dash speed',0,1,0.01],['clouds','Clouds',0,1,0.01],
    ['cloudSpeed','Cloud drift',0,1,0.01],['light','Window light',0,1,0.01],['grain','Print grain',0,1,0.01],['vignette','Vignette',0,1,0.01]]
};
let S = Object.assign({}, DEFAULTS);
try{ const saved = JSON.parse(localStorage.getItem('skixo-vis-settings')||'null'); if(saved) S = Object.assign({}, DEFAULTS, saved); }catch(e){}
function persist(){ try{ localStorage.setItem('skixo-vis-settings', JSON.stringify(S)); }catch(e){} }

const $ = id => document.getElementById(id);
function buildSliders(){
  for(const [gid, list] of Object.entries(SLIDERS)){
    const g = $(gid);
    for(const [k,label,min,max,step] of list){
      const row = document.createElement('div'); row.className='row';
      row.innerHTML = `<label for="${k}">${label}</label><input type="range" id="${k}" min="${min}" max="${max}" step="${step}"><output id="${k}-o"></output>`;
      g.appendChild(row);
    }
  }
}
buildSliders();
const fmtVal = v => (Math.abs(v)>=10? v.toFixed(0) : (+v).toFixed(2).replace(/0$/,''));
function syncUI(){
  for(const list of Object.values(SLIDERS)) for(const [k] of list){ $(k).value = S[k]; $(k+'-o').textContent = fmtVal(+S[k]); }
  for(const k of ['layout','aspect','poseMode','title','artist','credit','textPos','ink','blue','paperCol','manualCues','nodEvery','bpm']) $(k).value = S[k];
  $('useWordmark').checked = S.useWordmark; $('lowercase').checked = S.lowercase; $('snapKick').checked = S.snapKick;
  $('autoPose').hidden = S.poseMode!=='auto'; $('manualPose').hidden = S.poseMode!=='manual';
}
function bindUI(){
  for(const list of Object.values(SLIDERS)) for(const [k] of list){
    $(k).addEventListener('input', e=>{ S[k] = +e.target.value; $(k+'-o').textContent = fmtVal(S[k]); onChange(k); });
  }
  for(const k of ['layout','aspect','poseMode','title','artist','credit','textPos','ink','blue','paperCol','manualCues','nodEvery','bpm']){
    $(k).addEventListener('input', e=>{ S[k] = e.target.value; onChange(k); });
  }
  for(const k of ['useWordmark','lowercase','snapKick']) $(k).addEventListener('change', e=>{ S[k]=e.target.checked; onChange(k); });
}
function onChange(k){
  if(k==='poseMode'){
    $('autoPose').hidden = S.poseMode!=='auto'; $('manualPose').hidden = S.poseMode!=='manual';
    if(S.poseMode==='manual' && !S.manualCues.trim() && A){ S.manualCues = cuesToText(autoCues()); $('manualCues').value = S.manualCues; }
  }
  if(k==='aspect') setAspect();
  if(k==='bpm' && A){ A.grid = beatGrid(); showGrid(); }
  if(k==='ink') wordmarkImg = null, loadWordmark();
  if(k==='blue') makeClouds(S.blue);
  if(['poseMode','poseLow','poseHigh','poseHold','manualCues','poseFade','eyeFade','blinks','snapKick'].includes(k)) rebuildCues();
  if(k==='paperCol' || k==='vignette') overlayCache = {};
  persist(); requestDraw();
}

/* ---------------- assets ---------------- */
const IMGS = { a:null, b:null, c:null, h:null, w:null, n1c:null, n2c:null, n1o:null, n2o:null };
const NOD_SLOTS = ['n1c','n2c','n1o','n2o'], RAW = {};   // masked canvases for poses, raw bitmap for wide scene
let wordmarkSrc = null, wordmarkImg = null;
function maskPose(bmp){
  const n = Math.max(bmp.width, bmp.height);
  const c = document.createElement('canvas'); c.width = c.height = n;
  const x = c.getContext('2d');
  x.drawImage(bmp, (n-bmp.width)/2, (n-bmp.height)/2);
  x.globalCompositeOperation = 'destination-in';
  const g = x.createRadialGradient(n/2,n/2,n*0.47,n/2,n/2,n*0.5);
  g.addColorStop(0,'rgba(0,0,0,1)'); g.addColorStop(1,'rgba(0,0,0,0)');
  x.fillStyle = g; x.fillRect(0,0,n,n);
  c._src = bmp; return c;
}
async function loadImage(src){
  const blob = src instanceof Blob ? src : await (await fetch(src)).blob();
  return await createImageBitmap(blob);
}
async function setPose(slot, src){
  const bmp = await loadImage(src);
  if(slot==='w') IMGS.w = bmp;
  else if(NOD_SLOTS.includes(slot)){ RAW[slot] = bmp; buildNod(slot); }
  else { IMGS[slot] = maskPose(bmp); if(slot==='b'||slot==='c') NOD_SLOTS.forEach(buildNod); }
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
/* Nod frames: only the head is taken from the nod frame and laid over the base body,
   after aligning the two on the lower body, so generator drift can't make the body jitter. */
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
function buildNod(slot){
  const raw = RAW[slot]; if(!raw) return;
  const base = slot.endsWith('c') ? IMGS.b : IMGS.c; if(!base) return;
  const n = base.width, [ox,oy] = alignOffset(base._src, raw);
  const head = document.createElement('canvas'); head.width=head.height=n; const hx=head.getContext('2d');
  hx.drawImage(raw, ox*n, oy*n, n, n);
  hx.globalCompositeOperation='destination-in'; hx.filter=`blur(${n*0.025}px)`; hx.fillStyle='#000';
  hx.beginPath(); hx.ellipse(n*0.5, n*0.34, n*0.27, n*0.31, 0, 0, Math.PI*2); hx.fill();
  const out = document.createElement('canvas'); out.width=out.height=n; const o=out.getContext('2d');
  o.drawImage(base,0,0); o.drawImage(head,0,0);
  o.globalCompositeOperation='destination-in'; o.drawImage(base,0,0);   // keep the disc's soft edge
  out._src = raw; IMGS[slot] = out; requestDraw();
}

async function loadWordmark(){
  try{
    if(!wordmarkSrc) wordmarkSrc = await (await fetch('assets/wordmark.svg')).text();
    const svg = wordmarkSrc.replace(/fill="#[0-9a-fA-F]{3,6}"/, `fill="${S.ink}"`);
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
  if(!A || !A.grid || S.nod<=0 || (img!==1 && img!==2)) return null;
  const e = img===1 ? 'c' : 'o', f1 = IMGS['n1'+e], f2 = IMGS['n2'+e];
  if(!f1 && !f2) return null;
  if(energyAt(t) < S.nodGate) return null;
  const P = A.grid.beat * (+S.nodEvery || 1);
  const ph = (((t - A.grid.phase + 0.05) % P) + P) % P;   // head is lowest right on the beat
  const shallow = f1 || f2, deep = (S.nod > 0.45 && f2) ? f2 : shallow;
  const hold = 0.05 + 0.1*S.nod;
  if(ph < 0.05) return shallow;
  if(ph < 0.05 + hold) return deep;
  if(ph < 0.05 + hold + 0.06) return shallow;
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
  $('play').disabled = false; $('export').disabled = false;
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
function autoCues(){
  if(!A) return [{t:0,p:0}];
  const cues=[{t:0,p:0}]; let cur=0, lastT=-1e9; const hy=0.04;
  for(let i=0;i<A.energy.length;i+=5){
    const e=A.energy[i], t=i*HOP;
    let want = cur;
    const up1=S.poseLow+(cur<1?hy:-hy), up2=S.poseHigh+(cur<2?hy:-hy);
    want = e>=up2 ? 2 : e>=up1 ? 1 : 0;
    if(want!==cur && t-lastT>=S.poseHold){ cur=want; lastT=t; cues.push({t,p:cur}); }
  }
  return cues;
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
function frame(ctx, W, H, t){
  const U = Math.min(W,H);             // unit: short side
  const tall = H > W;
  const dur = A ? A.dur : 200;
  const k = hitEnv(A&&A.kicks, t, 0.16) * S.kick;
  const hat = hitEnv(A&&A.hats, t, 0.09);
  const en = energyAt(t);

  ctx.save();
  ctx.globalCompositeOperation='source-over'; ctx.globalAlpha=1;
  ctx.fillStyle = S.paperCol; ctx.fillRect(0,0,W,H);

  // badge geometry
  let size, cx, cy;
  if(tall){ size = W*Math.min(1.05, S.badgeSize*1.12); cx=W/2; cy=H*0.41; }
  else { size = H*S.badgeSize; cx=W/2; cy=H*0.5; }
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
    // portrait
    const ps = poseState(t), imgs=[IMGS.a,IMGS.b,IMGS.c,IMGS.h||IMGS.b];
    let base = imgs[ps.from]||IMGS.a, top = imgs[ps.to]||IMGS.a;
    if(ps.mix>=1){ const nf = nodFrame(t, ps.to); if(nf){ base = nf; top = nf; } }
    ctx.save(); ctx.translate(cx,cy); ctx.rotate(rot); ctx.scale(scale,scale);
    if(base){
      // soft shadow on the paper
      ctx.save(); ctx.globalAlpha=0.10; ctx.fillStyle='#3a2a18'; ctx.filter=`blur(${U*0.012}px)`; ctx.beginPath(); ctx.arc(U*0.004,U*0.008,size*0.47,0,Math.PI*2); ctx.fill(); ctx.restore();
      ctx.drawImage(base, -size/2,-size/2,size,size);
      if(top!==base && ps.mix>0){ ctx.globalAlpha=ps.mix; ctx.drawImage(top,-size/2,-size/2,size,size); ctx.globalAlpha=1; }
      // misprint: offset ghost on hats
      const mp = hat*S.misprint;
      if(mp>0.03){
        ctx.globalCompositeOperation='multiply'; ctx.globalAlpha=Math.min(0.45, mp*0.7);
        const dx = U*0.007*mp*(hash(Math.floor(t*24))>0.5?1:-1);
        ctx.drawImage(ps.mix>0.5?top:base, -size/2+dx, -size/2 - dx*0.3, size, size);
        ctx.globalCompositeOperation='source-over'; ctx.globalAlpha=1;
      }
    }
    ctx.restore();
  }

  drawText(ctx,W,H,U,tall,t);

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
function drawText(ctx,W,H,U,tall,t){
  if(S.textPos==='off') return;
  const lc = s => S.lowercase ? s.toLowerCase() : s;
  const title = lc(S.title||''), artist = S.artist||'', credit = S.credit||'';
  const m = U*0.065;
  let x, y, align;
  if(tall || S.textPos==='bottom-centre'){ align='center'; x=W/2; y= tall ? H*0.78 : H - m*1.05; }
  else if(S.textPos==='top-left'){ align='left'; x=m; y=m+U*0.04; }
  else { align='left'; x=m; y=H-m*1.05; }
  ctx.textAlign=align; ctx.textBaseline='alphabetic';
  const ts = U*(tall?0.05:0.044), as = U*(tall?0.028:0.024);
  const topLeft = S.textPos==='top-left' && !tall;
  const titleY = topLeft ? y : y - as*1.7;
  const artY = topLeft ? y + as*1.7 : y;
  // soft paper backing so dashes, clouds or a busy scene never cut through the type
  ctx.font = `500 ${ts}px "Libre Franklin", "Helvetica Neue", Arial, sans-serif`; ctx.letterSpacing = `${ts*-0.01}px`;
  const bw = Math.max(ctx.measureText(title).width, (S.artist||'').length*as*0.72) + U*0.06;
  const top = titleY - ts*1.05, bottom = artY + as*(credit?1.9:0.75);
  const bx = align==='center' ? x-bw/2 : x-U*0.03;
  ctx.save(); ctx.fillStyle=S.paperCol; ctx.shadowColor=S.paperCol; ctx.shadowBlur=U*0.035;
  ctx.globalAlpha = S.layout==='wallpaper' ? 0.9 : 0.8;
  ctx.fillRect(bx, top, bw, bottom-top); ctx.restore();
  ctx.fillStyle=S.ink; ctx.globalAlpha=0.92;
  ctx.fillText(title, x, titleY);
  if(S.useWordmark && wordmarkImg){
    const h = as*1.25, w = h*wordmarkImg.naturalWidth/wordmarkImg.naturalHeight;
    const wx = align==='center' ? x-w/2 : x;
    ctx.drawImage(wordmarkImg, wx, artY-h*0.85, w, h);
  } else {
    ctx.font = `400 ${as}px "Libre Franklin", "Helvetica Neue", Arial, sans-serif`; ctx.letterSpacing = `${as*0.12}px`;
    ctx.fillStyle=S.blue; ctx.fillText(artist, x, artY);
  }
  if(credit){
    ctx.font = `300 ${as*0.72}px "Libre Franklin", "Helvetica Neue", Arial, sans-serif`; ctx.letterSpacing = `${as*0.06}px`;
    ctx.fillStyle=S.ink; ctx.globalAlpha=0.6; ctx.fillText(credit, x, artY + as*1.45);
  }
  ctx.globalAlpha=1; ctx.letterSpacing='0px';
}

/* ---------------- preview loop ---------------- */
const stage = $('stage'), sctx = stage.getContext('2d');
let playing=false, playhead=12, srcNode=null, startedAt=0, drawPending=false;
function setAspect(){
  const tall = S.aspect==='9:16';
  stage.width = tall?720:1280; stage.height = tall?1280:720;
  $('stagewrap').classList.toggle('tall', tall);
  requestDraw();
}
function now(){ return playing ? Math.min(buffer.duration, actx.currentTime - startedAt) : playhead; }
function requestDraw(){ if(!drawPending && !playing){ drawPending=true; requestAnimationFrame(()=>{ drawPending=false; render(); }); } }
function render(){
  const t = now();
  frame(sctx, stage.width, stage.height, t);
  $('time').textContent = `${fmtTime(t)} / ${fmtTime(buffer?buffer.duration:0)}`;
  drawPlayhead(t);
}
function loop(){ if(!playing) return; render(); if(now()>=buffer.duration-0.01){ stop(); playhead=0; requestDraw(); return; } requestAnimationFrame(loop); }
function play(){
  if(!buffer) return; const c=getCtx(); c.resume();
  srcNode = c.createBufferSource(); srcNode.buffer=buffer; srcNode.connect(c.destination);
  if(playhead>=buffer.duration-0.05) playhead=0;
  startedAt = c.currentTime - playhead; srcNode.start(0, playhead); playing=true; setIcon(); loop();
}
function stop(){ if(srcNode){ try{srcNode.stop();}catch(e){} srcNode.disconnect(); srcNode=null; } if(playing){ playhead = now(); playing=false; setIcon(); } }
function setIcon(){ $('playicon').innerHTML = playing ? '<path d="M3 2h3.5v12H3zM9.5 2H13v12H9.5z"/>' : '<path d="M3 1.5v13l11-6.5z"/>'; $('play').setAttribute('aria-label', playing?'Pause':'Play'); }
function seek(t){ const was=playing; stop(); playhead=Math.max(0,Math.min(buffer?buffer.duration:0,t)); if(was) play(); else requestDraw(); }
$('play').addEventListener('click', ()=> playing ? (stop(), requestDraw()) : play());
document.addEventListener('keydown', e=>{ if(e.code==='Space' && !/INPUT|TEXTAREA|SELECT|BUTTON/.test(e.target.tagName)){ e.preventDefault(); $('play').click(); } });
function fmtTime(t, frac){ t=Math.max(0,t); const m=Math.floor(t/60), s=t-m*60; return frac ? `${m}:${s.toFixed(1).padStart(4,'0')}` : `${m}:${String(Math.floor(s)).padStart(2,'0')}`; }

/* ---------------- timeline ---------------- */
const tl = $('timeline'), tctx = tl.getContext('2d'); let tlBase=null;
const POSE_COLS = ['#cfc6b2','#8e9aa0','#3d6884'];
function drawTimeline(){
  const dpr = window.devicePixelRatio||1, w = tl.clientWidth, h = tl.clientHeight;
  if(!w) return;
  tl.width = w*dpr; tl.height = h*dpr;
  const c = document.createElement('canvas'); c.width=tl.width; c.height=tl.height; const x=c.getContext('2d'); x.scale(dpr,dpr);
  if(A){
    const dur=A.dur;
    for(let i=0;i<CUES.length;i++){ const a=CUES[i].t/dur*w, b=(i+1<CUES.length?CUES[i+1].t:dur)/dur*w; x.fillStyle=POSE_COLS[CUES[i].p]; x.globalAlpha=0.9; x.fillRect(a,h-6,b-a,6); }
    x.globalAlpha=1; x.fillStyle='#4b535a';
    const cols = Math.floor(w/2);
    for(let i=0;i<cols;i++){ const t=i/cols*dur; const e=energyAt(t); const bh=Math.max(1,e*(h-14)); x.fillRect(i*2, h-8-bh, 1.4, bh); }
    x.fillStyle='rgba(141,178,203,.55)';
    for(const kk of A.kicks){ if(kk.s<0.45) continue; x.fillRect(kk.t/dur*w, 2, 1, 4); }
  }
  tlBase = c; drawPlayhead(now());
}
function drawPlayhead(t){
  if(!tlBase) return; const dpr=window.devicePixelRatio||1;
  tctx.setTransform(1,0,0,1,0,0); tctx.clearRect(0,0,tl.width,tl.height); tctx.drawImage(tlBase,0,0);
  if(!buffer) return; const x = t/buffer.duration*tl.width;
  tctx.fillStyle='#ebe5d8'; tctx.fillRect(x-dpr*0.75,0,dpr*1.5,tl.height);
}
let dragging=false;
function tlSeek(e){ if(!buffer) return; const r=tl.getBoundingClientRect(); seek((e.clientX-r.left)/r.width*buffer.duration); }
tl.addEventListener('pointerdown', e=>{ dragging=true; tl.setPointerCapture(e.pointerId); tlSeek(e); });
tl.addEventListener('pointermove', e=>{ if(dragging) tlSeek(e); });
tl.addEventListener('pointerup', ()=>{ dragging=false; });
new ResizeObserver(()=>drawTimeline()).observe(tl);

/* ---------------- files in ---------------- */
async function takeFile(file, slot){
  try{
    if(file.type.startsWith('audio') || /\.(wav|mp3|flac|ogg|m4a|aiff?)$/i.test(file.name)){ await loadAudio(file); store.put('audio', file, file.name); $('trackName').textContent = file.name; return; }
    if(file.type.startsWith('image')){
      const nm = file.name.match(/nod[-_ ]?(closed|open)[-_ ]?([12])/i);
      const s = slot || (nm ? 'n'+nm[2]+(nm[1].toLowerCase()==='open'?'o':'c') : /wide|wall|banner/i.test(file.name) ? 'w' : /half|mid|between/i.test(file.name) ? 'h' : /open|cute|eyes/i.test(file.name) ? 'c' : /shadow|light/i.test(file.name) ? 'b' : 'a');
      await setPose(s, file); store.put('img-'+s, file, file.name); if(s==='h') rebuildCues(); setStatus(`Loaded ${file.name}`);
    }
  }catch(err){ setStatus(`Couldn't read ${file.name}. Try a WAV, MP3, PNG or JPG.`, true); }
}
$('f-audio').addEventListener('change', e=> e.target.files[0] && takeFile(e.target.files[0]));
for(const s of ['a','b','c','h','w','n1c','n2c','n1o','n2o']) $('f-'+s).addEventListener('change', e=> e.target.files[0] && takeFile(e.target.files[0], s));
const app = $('app');
app.addEventListener('dragover', e=>{ e.preventDefault(); app.classList.add('drop'); });
app.addEventListener('dragleave', e=>{ if(e.target===app) app.classList.remove('drop'); });
app.addEventListener('drop', e=>{ e.preventDefault(); app.classList.remove('drop'); for(const f of e.dataTransfer.files) takeFile(f); });

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
$('saveAgain').addEventListener('click', ()=> lastBlob && saveBlob(lastBlob, lastName));
$('cancel').addEventListener('click', ()=>{ cancelExport=true; });
$('export').addEventListener('click', async ()=>{
  if(!buffer) return;
  if(!('VideoEncoder' in window)){ $('exportNote').textContent = 'This browser cannot encode video. Open the page in Chrome or Edge to render.'; return; }
  stop();
  const tall = S.aspect==='9:16', r = $('res').value;
  const dims = {1080:[1920,1080], 1440:[2560,1440], 720:[1280,720]}[r];
  const W = tall?dims[1]:dims[0], H = tall?dims[0]:dims[1];
  const fps = +$('fps').value;
  const t0 = $('range').value==='test' ? playhead : 0;
  const t1 = $('range').value==='test' ? Math.min(buffer.duration, playhead+15) : buffer.duration;
  const vbit = ({1080:12e6, 1440:20e6, 720:6e6})[r] * (fps===60?1.4:1);
  // pick codecs
  let vcfg=null, vmux=null;
  for(const [codec,mux] of [[r==='1440'?'avc1.640033':'avc1.640028','avc'],['avc1.4d0033','avc'],['vp09.00.41.08','vp9']]){
    const cfg={codec, width:W, height:H, bitrate:vbit, framerate:fps, ...(mux==='avc'?{avc:{format:'avc'}}:{})};
    try{ if((await VideoEncoder.isConfigSupported(cfg)).supported){ vcfg=cfg; vmux=mux; break; } }catch(e){}
  }
  if(!vcfg){ $('exportNote').textContent='No supported video encoder found in this browser.'; return; }
  const sr = buffer.sampleRate, ch = 2;
  let acfg=null, amux=null;
  for(const [codec,mux] of [['mp4a.40.2','aac'],['opus','opus']]){
    const cfg={codec, sampleRate:sr, numberOfChannels:ch, bitrate:192000};
    try{ if((await AudioEncoder.isConfigSupported(cfg)).supported){ acfg=cfg; amux=mux; break; } }catch(e){}
  }
  await document.fonts.ready;
  const target = new Mp4Muxer.ArrayBufferTarget();
  const muxer = new Mp4Muxer.Muxer({ target, fastStart:'in-memory', firstTimestampBehavior:'offset',
    video:{codec:vmux, width:W, height:H, frameRate:fps}, ...(acfg?{audio:{codec:amux, sampleRate:sr, numberOfChannels:ch}}:{}) });
  let failed=null;
  const venc = new VideoEncoder({ output:(c,m)=>muxer.addVideoChunk(c,m), error:e=>failed=e });
  venc.configure(vcfg);
  $('export').disabled=true; $('cancel').hidden=false; $('saveAgain').hidden=true; cancelExport=false;
  setStatus('Rendering…', true);
  // audio
  if(acfg){
    const aenc = new AudioEncoder({ output:(c,m)=>muxer.addAudioChunk(c,m), error:e=>failed=e });
    aenc.configure(acfg);
    const L = buffer.getChannelData(0), R = buffer.numberOfChannels>1? buffer.getChannelData(1) : L;
    const s0 = Math.floor(t0*sr), s1 = Math.floor(t1*sr), CH=4800;
    for(let s=s0;s<s1;s+=CH){
      const n=Math.min(CH,s1-s), d=new Float32Array(n*2);
      // gentle 50 ms fades at range edges so test clips don't click
      for(let i=0;i<n;i++){ const g = Math.min(1,(s+i-s0)/(0.05*sr),(s1-s-i)/(0.05*sr)); d[i]=L[s+i]*g; d[n+i]=R[s+i]*g; }
      const ad = new AudioData({format:'f32-planar', sampleRate:sr, numberOfFrames:n, numberOfChannels:2, timestamp:Math.round((s-s0)/sr*1e6), data:d});
      aenc.encode(ad); ad.close();
    }
    await aenc.flush(); aenc.close();
  }
  // video
  const cv = document.createElement('canvas'); cv.width=W; cv.height=H; const cx=cv.getContext('2d');
  const total = Math.round((t1-t0)*fps); const startClock = performance.now();
  for(let i=0;i<total;i++){
    if(cancelExport || failed) break;
    const t = t0 + i/fps;
    frame(cx, W, H, t);
    const vf = new VideoFrame(cv, {timestamp: Math.round(i*1e6/fps), duration: Math.round(1e6/fps)});
    venc.encode(vf, {keyFrame: i % (fps*2) === 0}); vf.close();
    while(venc.encodeQueueSize > 4) await new Promise(r=>setTimeout(r,1));
    if(i%10===0){
      $('bar').style.width = (i/total*100).toFixed(1)+'%';
      const el=(performance.now()-startClock)/1000, eta = el/(i+1)*(total-i);
      setStatus(`Rendering ${Math.round(i/total*100)}% · about ${fmtTime(eta)} left`, true);
      frame(sctx, stage.width, stage.height, t); drawPlayhead(t);
      await new Promise(r=>setTimeout(r,0));
    }
  }
  try{ await venc.flush(); }catch(e){} venc.close();
  $('cancel').hidden=true; $('export').disabled=false; $('bar').style.width='0';
  if(failed){ setStatus('Render failed: '+(failed.message||failed), true); return; }
  if(cancelExport){ setStatus('Render cancelled'); requestDraw(); return; }
  muxer.finalize();
  const blob = new Blob([target.buffer], {type:'video/mp4'});
  const slug = (S.title||'visualiser').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  lastName = `${slug}-${tall?'vertical':'wide'}-${H>W?W:H}p${fps}${$('range').value==='test'?'-test':''}.mp4`; lastBlob = blob;
  $('saveAgain').hidden=false;
  setStatus(`Rendered ${(blob.size/1e6).toFixed(0)} MB`);
  requestDraw();
  saveBlob(blob, lastName);
});

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
$('forgetFiles').addEventListener('click', async ()=>{ await store.clear(); setStatus('Saved files forgotten. Reload to return to the starter artwork.'); });

/* ---------------- boot ---------------- */
syncUI(); bindUI(); setAspect();
(async ()=>{
  try{
    const starter = { a:'assets/wistful.jpg', b:'assets/wistful-shadow.jpg', c:'assets/cute.jpg', w:'assets/wallpaper.jpg' };
    await Promise.all(['a','b','c','h','w','n1c','n2c','n1o','n2o'].map(async k=>{
      const saved = await store.get('img-'+k);
      if(saved && saved.blob) return setPose(k, saved.blob);
      if(starter[k]) return setPose(k, starter[k]);
    }).concat([document.fonts.load('500 20px "Libre Franklin"').catch(()=>{}), loadWordmark()]));
    makeClouds(S.blue); requestDraw();
    const track = await store.get('audio');
    if(track && track.blob){ $('trackName').textContent = track.name; await loadAudio(track.blob); }
    else setStatus('Drop a track anywhere to start');
  }catch(e){ setStatus('Could not load the starter files. Drop in a track and artwork to begin.', true); }
})();
