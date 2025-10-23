// animatek.js
// সম্পূর্ণ রেডি মিডিয়া প্লেয়ার — বাংলায় কমেন্ট সহ

const videoData = {
  status: true,
  operator: "CYBER ULLASH",
  prompt: "All animet video",
  // আপনি ইচ্ছে করলে এখানে নতুন ভিডিও URL বসাতে পারবেন
  video: "https://sora.aritek.app/generated/t2vSt508216ev5fz7099rma0crskbs4v6bx8-fq8-a02.mp4"
};

function initializeVideoPlayer() {
  const videoContainer = document.getElementById('video-container');
  if (!videoContainer) {
    console.error('Video container not found! Please add a <div id="video-container"> in your HTML.');
    return;
  }

  // --- ভিডিও এলিমেন্ট তৈরি ---
  const videoElement = document.createElement('video');
  videoElement.src = videoData.video;
  videoElement.controls = false;
  videoElement.loop = true;
  videoElement.autoplay = true;
  videoElement.muted = true; // autoplay এর জন্য শুরুতে muted
  videoElement.playsInline = true;
  videoElement.setAttribute('playsinline', ''); // iOS/অন্যান্য ডিভাইসের জন্য
  videoElement.preload = 'metadata';
  videoContainer.appendChild(videoElement);

  // মেটাডেটা ডিসপ্লে
  const metaDiv = document.getElementById('video-meta');
  metaDiv.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;width:100%;gap:12px;">
      <div class="meta">
        <strong style="color:#fff;">Operator:</strong> ${videoData.operator} &nbsp;•&nbsp;
        <strong style="color:#fff;">Prompt:</strong> ${videoData.prompt}
      </div>
    </div>
  `;

  // সোর্স দেখানোর জন্য
  const srcSpan = document.getElementById('video-src');
  if (srcSpan) srcSpan.textContent = videoData.video;

  // কাস্টম কন্ট্রোল DOM
  const controls = document.createElement('div');
  controls.className = 'controls';
  controls.innerHTML = `
    <div class="row">
      <div class="left">
        <button class="btn" id="play-pause">Pause</button>
        <button class="btn" id="mute-toggle">Unmute</button>
        <div style="width:8px"></div>
        <span class="time" id="current-time">0:00</span>
        <span class="time"> / </span>
        <span class="time" id="duration">0:00</span>
      </div>
      <div class="center" style="padding:0 12px">
        <input type="range" id="progress" class="progress" min="0" max="100" step="0.1" value="0" />
      </div>
      <div class="right">
        <input type="range" id="volume" class="vol-range" min="0" max="1" step="0.01" value="1" />
        <button class="btn" id="fs-btn">Fullscreen</button>
        <a id="download-btn" class="btn" download="animetek_video.mp4" title="Download video">Download</a>
      </div>
    </div>
  `;
  videoContainer.appendChild(controls);

  // রেফারেন্স
  const playBtn = document.getElementById('play-pause');
  const muteBtn = document.getElementById('mute-toggle');
  const progress = document.getElementById('progress');
  const volume = document.getElementById('volume');
  const fsBtn = document.getElementById('fs-btn');
  const currentTimeEl = document.getElementById('current-time');
  const durationEl = document.getElementById('duration');
  const downloadBtn = document.getElementById('download-btn');

  // ডাউনলোড বাটন সোর্স
  downloadBtn.href = videoData.video;

  // ফেড-ইন
  videoElement.style.opacity = '0';
  let op = 0;
  const fade = setInterval(() => {
    op += 0.06;
    videoElement.style.opacity = String(Math.min(op, 1));
    if (op >= 1) clearInterval(fade);
  }, 35);

  // মেট্রিক ফাংশন
  function formatTime(sec) {
    if (!isFinite(sec)) return '0:00';
    sec = Math.floor(sec);
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2,'0')}`;
  }

  // যখন মেটাডেটা লোড হয়
  videoElement.addEventListener('loadedmetadata', () => {
    durationEl.textContent = formatTime(videoElement.duration);
  });

  // আপডেট সময় + প্রোগ্রেস
  videoElement.addEventListener('timeupdate', () => {
    const cur = videoElement.currentTime;
    const dur = videoElement.duration || 1;
    currentTimeEl.textContent = formatTime(cur);
    progress.value = (cur / dur) * 100;
  });

  // প্লে/পজ
  playBtn.addEventListener('click', () => {
    if (videoElement.paused) {
      videoElement.play().catch(err => console.warn('Play prevented:', err));
      playBtn.textContent = 'Pause';
    } else {
      videoElement.pause();
      playBtn.textContent = 'Play';
    }
  });

  // মিউট টগল
  muteBtn.addEventListener('click', () => {
    videoElement.muted = !videoElement.muted;
    muteBtn.textContent = videoElement.muted ? 'Unmute' : 'Mute';
    // ভলিউম স্লাইডার আপডেট
    if (videoElement.muted) {
      volume.value = 0;
    } else {
      if (Number(volume.value) === 0) volume.value = 0.8;
      videoElement.volume = Number(volume.value);
    }
  });

  // ভলিউম কন্ট্রোল
  volume.addEventListener('input', (e) => {
    const v = Number(e.target.value);
    videoElement.volume = v;
    videoElement.muted = v === 0;
    muteBtn.textContent = videoElement.muted ? 'Unmute' : 'Mute';
  });

  // প্রোগ্রেস বার ক্লিক/ড্র্যাগ
  let seeking = false;
  progress.addEventListener('input', (e) => {
    seeking = true;
    const pct = Number(e.target.value);
    const dur = videoElement.duration || 1;
    currentTimeEl.textContent = formatTime((pct / 100) * dur);
  });
  progress.addEventListener('change', (e) => {
    const pct = Number(e.target.value);
    const dur = videoElement.duration || 1;
    videoElement.currentTime = (pct / 100) * dur;
    seeking = false;
  });

  // ফুলস্ক্রিন
  fsBtn.addEventListener('click', async () => {
    try {
      if (!document.fullscreenElement) {
        await videoContainer.requestFullscreen();
        videoContainer.classList.add('fullscreen-active');
      } else {
        await document.exitFullscreen();
        videoContainer.classList.remove('fullscreen-active');
      }
    } catch (err) {
      console.warn('Fullscreen error:', err);
    }
  });

  // এনহ্যান্সড: কীবোর্ড শর্টকাটস (স্পেস প্লে/পজ, Arrows seek)
  window.addEventListener('keydown', (e) => {
    const activeTag = document.activeElement && document.activeElement.tagName.toLowerCase();
    if (activeTag === 'input') return; // ইনপুটে টাইপিং বাধা দিব না
    if (e.code === 'Space') {
      e.preventDefault();
      playBtn.click();
    } else if (e.key === 'ArrowRight') {
      videoElement.currentTime = Math.min(videoElement.duration || Infinity, videoElement.currentTime + 5);
    } else if (e.key === 'ArrowLeft') {
      videoElement.currentTime = Math.max(0, videoElement.currentTime - 5);
    } else if (e.key === 'f' || e.key === 'F') {
      fsBtn.click();
    } else if (e.key === 'm' || e.key === 'M') {
      muteBtn.click();
    }
  });

  // এরর হ্যান্ডলিং
  videoElement.addEventListener('error', (ev) => {
    console.error('Failed to load video:', ev);
    const err = document.createElement('p');
    err.style.color = '#ff6b6b';
    err.style.fontFamily = 'Arial, sans-serif';
    err.style.marginTop = '10px';
    err.textContent = 'Error: ভিডিও লোড করা যায়নি — URL চেক করুন বা ব্রাউজার কনসোল দেখুন।';
    videoContainer.appendChild(err);
  });

  // অটোপ্লে নিয়মবিধি: যদি ব্রাউজার প্লে না দেয়, ইউজার ইন্টার‍্যাকশনের জন্য প্লে বোতাম দেখাবে
  videoElement.play().then(() => {
    playBtn.textContent = 'Pause';
    // autoplay succeeded; keep muted toggle label consistent
    muteBtn.textContent = videoElement.muted ? 'Unmute' : 'Mute';
  }).catch((err) => {
    // autoplay blocked — প্লে বাটনে Play দেখাবে
    console.warn('Autoplay blocked:', err);
    videoElement.muted = true;
    playBtn.textContent = 'Play';
  });

  // ভিডিও স্টার্ট লগ
  videoElement.addEventListener('play', () => {
    console.log(`Video started playing. Operator: ${videoData.operator}, Prompt: ${videoData.prompt}`);
  });

  // টাচ ডিভাইসে ট্যাপ করলে আনমিউট করার সহজ উৎসাহ
  videoElement.addEventListener('click', () => {
    // যদি মিউট থাকে, ট্যাপ করলে আনমিউট হবে (এটা ইউজার-ফ্রেন্ডলি)
    if (videoElement.muted) {
      videoElement.muted = false;
      muteBtn.textContent = 'Mute';
      volume.value = videoElement.volume || 0.8;
    }
  });
}

// ডম লোড হলে ইনিশিয়ালাইজ
document.addEventListener('DOMContentLoaded', initializeVideoPlayer);
