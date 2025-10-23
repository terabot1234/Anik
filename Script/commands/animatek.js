<!doctype html>
<html lang="bn">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Animetek - Create Neon Duo Video</title>
<style>
  :root{--bg:#0b0710;--card:#0f1720;--accent:#00d4ff;--accent2:#ff5ca8}
  html,body{height:100%;margin:0;background:linear-gradient(180deg,#12061a,#0b0710);color:#fff;font-family:Inter,Arial,Helvetica,sans-serif}
  .wrap{max-width:980px;margin:18px auto;padding:16px}
  h1{font-size:18px;margin:6px 0 12px}
  .row{display:flex;gap:12px;flex-wrap:wrap}
  .canvas-box{background:#071018;border-radius:12px;padding:12px;box-shadow:0 10px 30px rgba(0,0,0,0.6)}
  canvas{display:block;border-radius:8px;background:#000;max-width:100%}
  .controls{margin-top:10px;display:flex;gap:8px;flex-wrap:wrap}
  .btn{background:linear-gradient(90deg,var(--accent),var(--accent2));border:none;color:#08121a;padding:8px 12px;border-radius:8px;cursor:pointer;font-weight:700}
  .muted{background:#333;color:#fff}
  label{font-size:13px;color:#b9c2cc}
  input[type="file"]{display:none}
  .file-btn{background:#16202b;border:1px solid rgba(255,255,255,0.04);color:#cfe8ff;padding:8px 10px;border-radius:8px;cursor:pointer}
  .small{font-size:13px;color:#9fb0c8}
  .panel{margin-top:12px;display:flex;gap:12px;flex-wrap:wrap;align-items:center}
  select,input[type="range"]{background:transparent;border:1px solid rgba(255,255,255,0.06);padding:6px;border-radius:8px;color:#fff}
  .preview-meta{font-size:13px;color:#9fb0c8;margin-left:6px}
  footer{margin-top:14px;color:#8f9aa8;font-size:13px}
</style>
</head>
<body>
<div class="wrap">
  <h1>Animetek — Neon Duo Video Creator (Screenshot 스타일)</h1>

  <div class="row">
    <div class="canvas-box" style="flex:1">
      <canvas id="stage" width="1280" height="720"></canvas>

      <div class="controls">
        <button class="btn" id="startPreview">Play Preview</button>
        <button class="btn muted" id="stopPreview">Stop</button>
        <button class="btn" id="recordBtn">Record & Download (WebM)</button>
        <button class="file-btn" id="downloadMp4Btn" title="Use ffmpeg to convert WebM to MP4 locally">MP4 (via ffmpeg)</button>

        <div style="margin-left:auto;display:flex;gap:8px;align-items:center">
          <label class="small">Duration:</label>
          <select id="durationSelect">
            <option value="6">6s</option>
            <option value="8" selected>8s</option>
            <option value="10">10s</option>
            <option value="12">12s</option>
          </select>
        </div>
      </div>

      <div class="panel">
        <label class="small">Left Avatar:</label>
        <label class="file-btn"><input id="avatarLeft" type="file" accept="image/*"> Choose</label>
        <span class="preview-meta" id="leftName">default</span>

        <label class="small">Right Avatar:</label>
        <label class="file-btn"><input id="avatarRight" type="file" accept="image/*"> Choose</label>
        <span class="preview-meta" id="rightName">default</span>

        <label class="small">Theme:</label>
        <select id="themeSelect">
          <option value="neon" selected>Neon</option>
          <option value="gold">Gold</option>
          <option value="pink">Pink</option>
        </select>

        <label class="small">Add Emoji Overlay:</label>
        <select id="emojiSelect">
          <option value="❤️">❤️</option>
          <option value="🔥">🔥</option>
          <option value="😂">😂</option>
          <option value="😍">😍</option>
          <option value="💋">💋</option>
        </select>
      </div>
    </div>
  </div>

  <footer>
    টিপস: Record হলে ব্রাউজার WebM তৈরি করবে — দ্রুত MP4 চাইলে ডাউনলোডকৃত WebM ফাইলটি কম্পিউটারে ffmpeg দিয়ে কনভার্ট করো:<br>
    <code>ffmpeg -i recording.webm -c:v libx264 -crf 20 -preset veryfast output.mp4</code>
  </footer>
</div>

<script>
/*
  Animetek Canvas Creator
  - draw two circular avatars with animated neon rings
  - emoji overlays, sparkles, flashes
  - preview play and MediaRecorder capture to WebM
*/

/* ---------- Config & State ---------- */
const canvas = document.getElementById('stage');
const ctx = canvas.getContext('2d', { alpha: false });
const W = canvas.width, H = canvas.height;

let state = {
  leftImg: null,
  rightImg: null,
  theme: 'neon',
  emoji: '❤️',
  duration: 8,
  playing: false,
  t0: 0
};

/* ---------- UI refs ---------- */
const avatarLeftInput = document.getElementById('avatarLeft');
const avatarRightInput = document.getElementById('avatarRight');
const leftName = document.getElementById('leftName');
const rightName = document.getElementById('rightName');
const themeSelect = document.getElementById('themeSelect');
const emojiSelect = document.getElementById('emojiSelect');
const durationSelect = document.getElementById('durationSelect');

document.getElementById('startPreview').addEventListener('click', startPreview);
document.getElementById('stopPreview').addEventListener('click', stopPreview);
document.getElementById('recordBtn').addEventListener('click', startRecording);
document.getElementById('downloadMp4Btn').addEventListener('click', () => {
  alert('WebM → MP4 করতে আপনার কম্পিউটারে ffmpeg ব্যবহার করুন। টিউটোরিয়াল নীচে আছে।');
});

avatarLeftInput.addEventListener('change', loadLeft);
avatarRightInput.addEventListener('change', loadRight);
themeSelect.addEventListener('change', ()=> state.theme = themeSelect.value);
emojiSelect.addEventListener('change', ()=> state.emoji = emojiSelect.value);
durationSelect.addEventListener('change', ()=> state.duration = Number(durationSelect.value));

/* ---------- Helpers ---------- */
function loadImageFromFile(file, cb){
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.onload = () => {
    URL.revokeObjectURL(url);
    cb(img);
  };
  img.onerror = ()=> cb(null);
  img.src = url;
}

/* ---------- Load handlers ---------- */
function loadLeft(e){
  const f = e.target.files[0];
  if(!f) return;
  loadImageFromFile(f, (img)=>{
    if(img){ state.leftImg = img; leftName.textContent = f.name; }
    else leftName.textContent = 'invalid';
  });
}
function loadRight(e){
  const f = e.target.files[0];
  if(!f) return;
  loadImageFromFile(f, (img)=>{
    if(img){ state.rightImg = img; rightName.textContent = f.name; }
    else rightName.textContent = 'invalid';
  });
}

/* ---------- Drawing utilities ---------- */
function drawBackground(){
  // patterned background similar to screenshot
  ctx.fillStyle = (state.theme === 'gold') ? '#1e140a' : (state.theme === 'pink' ? '#22011a' : '#0b0710');
  ctx.fillRect(0,0,W,H);
  // subtle vignette
  const g = ctx.createRadialGradient(W/2,H/2, W*0.1, W/2,H/2, W*0.9);
  g.addColorStop(0, 'rgba(255,255,255,0.02)');
  g.addColorStop(1, 'rgba(0,0,0,0.45)');
  ctx.fillStyle = g;
  ctx.fillRect(0,0,W,H);
}

function drawNeonRing(cx, cy, radius, t, color1, color2){
  // animated rotating ring made of radial gradient + rotating spikes
  for(let i=0;i<3;i++){
    const r = radius + i*6 + Math.sin(t*2 + i)*3;
    ctx.save();
    ctx.globalAlpha = 0.18 + i*0.08;
    ctx.beginPath();
    ctx.lineWidth = 10 - i*3;
    const grad = ctx.createRadialGradient(cx,cy,r-20,cx,cy,r+30);
    grad.addColorStop(0, color1);
    grad.addColorStop(1, color2);
    ctx.strokeStyle = grad;
    ctx.arc(cx,cy,r,0,Math.PI*2);
    ctx.stroke();
    ctx.restore();
  }
  // decorative rotating spikes
  ctx.save();
  ctx.translate(cx,cy);
  ctx.rotate(t*0.8);
  for(let a=0;a<12;a++){
    const ang = a*(Math.PI*2/12);
    const x = Math.cos(ang)*(radius+28);
    const y = Math.sin(ang)*(radius+28);
    ctx.beginPath();
    ctx.globalAlpha = 0.9 - Math.abs(Math.sin(t*2 + a))*0.6;
    ctx.fillStyle = color2;
    ctx.arc(x,y,6,0,Math.PI*2);
    ctx.fill();
  }
  ctx.restore();
}

function drawCircularImage(img, cx, cy, r){
  // mask and draw
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx,cy,r,0,Math.PI*2);
  ctx.closePath();
  ctx.clip();
  // cover area with image fitted center-crop
  const ar = img.width / img.height;
  const targetW = r*2, targetH = r*2;
  let dw = targetW, dh = targetH, sx=0, sy=0, sw=img.width, sh=img.height;
  if(ar > 1){
    // wide image => crop left/right
    sh = img.height;
    sw = sh * (targetW/targetH);
    sx = (img.width - sw)/2;
  } else {
    // tall image => crop top/bottom
    sw = img.width;
    sh = sw * (targetH/targetW);
    sy = (img.height - sh)/2;
  }
  ctx.drawImage(img, sx, sy, sw, sh, cx - r, cy - r, targetW, targetH);
  ctx.restore();

  // inner shine
  const grad = ctx.createRadialGradient(cx - r*0.4, cy - r*0.4, r*0.1, cx, cy, r);
  grad.addColorStop(0, 'rgba(255,255,255,0.35)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.beginPath();
  ctx.arc(cx,cy,r,0,Math.PI*2);
  ctx.fillStyle = grad;
  ctx.fill();
}

/* ---------- Effects ---------- */
function drawEmoji(cx, cy, t, emoji){
  ctx.save();
  ctx.font = `${48 + Math.sin(t*2)*6}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(emoji, cx, cy);
  ctx.restore();
}

function drawSparkles(t){
  // random moving sparkles across center
  for(let i=0;i<18;i++){
    const phase = (i*37) % 100;
    const x = W*0.5 + Math.cos(t*1.2 + i)* (120 + (i%3)*40);
    const y = H*0.42 + Math.sin(t*1.6 + i*0.7)*(30 + (i%4)*30);
    ctx.save();
    ctx.globalAlpha = 0.7*Math.max(0, Math.sin(t*3 + i));
    ctx.beginPath();
    ctx.fillStyle = (i%2===0) ? '#fff' : '#ffd77a';
    ctx.arc(x,y,2 + (Math.abs(Math.sin(t*2+i))*3),0,Math.PI*2);
    ctx.fill();
    ctx.restore();
  }
}

/* ---------- Render Loop ---------- */
function renderFrame(time){
  // time in ms
  const t = time * 0.001; // seconds
  drawBackground();

  // layout: left and right circles
  const cy = H*0.48;
  const cx1 = W*0.32, cx2 = W*0.68;
  const r = Math.min(160, H*0.18);

  // theme colors
  let colorA = '#00d4ff', colorB = '#7b2cff';
  if(state.theme === 'gold'){ colorA = '#ffd86b'; colorB = '#ff8a00'; }
  if(state.theme === 'pink'){ colorA = '#ff7bd5'; colorB = '#ffcf6b'; }

  // rings
  drawNeonRing(cx1, cy, r, t, colorA, colorB);
  drawNeonRing(cx2, cy, r, t+1.2, colorB, colorA);

  // avatars (use defaults if not provided)
  if(state.leftImg){
    drawCircularImage(state.leftImg, cx1, cy, r-8);
  } else {
    // placeholder
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx1,cy,r-8,0,Math.PI*2);
    ctx.fillStyle = '#111827';
    ctx.fill();
    ctx.fillStyle = '#9fb0c8';
    ctx.font = '28px sans-serif';
    ctx.textAlign='center';
    ctx.fillText('Left', cx1, cy);
    ctx.restore();
  }

  if(state.rightImg){
    drawCircularImage(state.rightImg, cx2, cy, r-8);
  } else {
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx2,cy,r-8,0,Math.PI*2);
    ctx.fillStyle = '#111827';
    ctx.fill();
    ctx.fillStyle = '#9fb0c8';
    ctx.font = '28px sans-serif';
    ctx.textAlign='center';
    ctx.fillText('Right', cx2, cy);
    ctx.restore();
  }

  // center decorations & emoji
  drawSparkles(t);
  drawEmoji(W*0.5, H*0.28 + Math.sin(t*2)*6, t, state.emoji);

  // bottom frame & decorative border like screenshot
  ctx.save();
  ctx.globalAlpha = 0.12;
  ctx.fillStyle = (state.theme === 'gold') ? '#ffd86b' : (state.theme === 'pink' ? '#ff7bd5' : '#00d4ff');
  ctx.fillRect(10,H-90,W-20,70);
  ctx.restore();

  // caption text at bottom-left
  ctx.save();
  ctx.fillStyle = '#fff';
  ctx.font = '28px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('✅ সম্পন্ন!   Prompt: lip kiss', 28, H-42);
  ctx.restore();
}

/* ---------- Animation control ---------- */
let rafId = null;
function tick(ts){
  if(!state.playing) return;
  const elapsed = (ts - state.t0)/1000;
  // determine progress (0..1)
  const prog = Math.min(1, elapsed / state.duration);
  renderFrame(ts);
  if(prog >= 1){
    // stop automatically when reached duration
    stopPreview();
  } else {
    rafId = requestAnimationFrame(tick);
  }
}

function startPreview(){
  if(state.playing) return;
  state.playing = true;
  state.t0 = performance.now();
  // ensure duration value updated
  state.duration = Number(durationSelect.value);
  rafId = requestAnimationFrame(tick);
}

function stopPreview(){
  if(!state.playing) return;
  state.playing = false;
  if(rafId) cancelAnimationFrame(rafId);
}

/* ---------- Recording (MediaRecorder) ---------- */
async function startRecording(){
  // ensure one preview run length
  state.duration = Number(durationSelect.value);
  const stream = canvas.captureStream(30); // 30 FPS
  const rec = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' });
  const chunks = [];
  rec.ondataavailable = (e)=> { if(e.data && e.data.size) chunks.push(e.data); };
  rec.onstop = ()=> {
    const blob = new Blob(chunks, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'animetek_recording.webm';
    a.click();
    setTimeout(()=> URL.revokeObjectURL(url), 2000);
  };

  // start rendering and recording simultaneously
  state.playing = true;
  state.t0 = performance.now();
  rec.start();
  rafId = requestAnimationFrame(function frame(ts){
    const elapsed = (ts - state.t0)/1000;
    renderFrame(ts);
    if(elapsed >= state.duration){
      // stop
      state.playing = false;
      rec.stop();
      if(rafId) cancelAnimationFrame(rafId);
    } else {
      rafId = requestAnimationFrame(frame);
    }
  });
}

/* ---------- Initial draw ---------- */
renderFrame(0);
</script>
</body>
</html>
