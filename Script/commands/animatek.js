// animatek.js

// JSON ডেটা
const videoData = {
  status: true,
  operator: "CYBER ULLASH",
  prompt: "All animet video",
  video: "https://sora.aritek.app/generated/t2vSt508216ev5fz7099rma0crskbs4v6bx8-fq8-a02.mp4"
};

// ভিডিও প্লেয়ার ইনিশিয়ালাইজ করা
function initializeVideoPlayer() {
  // HTML কনটেইনার চেক
  const videoContainer = document.getElementById('video-container');
  if (!videoContainer) {
    console.error('Video container not found! Please add a <div id="video-container"> in your HTML.');
    return;
  }

  // কনটেইনারের জন্য বেসিক স্টাইল
  videoContainer.style.display = 'flex';
  videoContainer.style.flexDirection = 'column';
  videoContainer.style.alignItems = 'center';
  videoContainer.style.padding = '20px';
  videoContainer.style.maxWidth = '900px';
  videoContainer.style.margin = '0 auto';

  // ভিডিও এলিমেন্ট তৈরি
  const videoElement = document.createElement('video');
  videoElement.src = videoData.video;
  videoElement.controls = false; // কাস্টম কন্ট্রোলের জন্য ডিফল্ট কন্ট্রোল বন্ধ
  videoElement.loop = true;
  videoElement.autoplay = true;
  videoElement.muted = true; // অটোপ্লের জন্য মিউট
  videoElement.style.width = '100%';
  videoElement.style.maxWidth = '800px';
  videoElement.style.borderRadius = '8px';
  videoElement.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
  videoElement.style.opacity = '0'; // ফেড-ইনের জন্য
  videoContainer.appendChild(videoElement);

  // মেটাডেটা ডিসপ্লে
  const metadataDiv = document.createElement('div');
  metadataDiv.innerHTML = `
    <p><strong>Operator:</strong> ${videoData.operator}</p>
    <p><strong>Prompt:</strong> ${videoData.prompt}</p>
  `;
  metadataDiv.style.marginTop = '15px';
  metadataDiv.style.fontFamily = 'Arial, sans-serif';
  metadataDiv.style.fontSize = '16px';
  metadataDiv.style.color = '#333';
  videoContainer.appendChild(metadataDiv);

  // কন্ট্রোল প্যানেল
  const controlPanel = document.createElement('div');
  controlPanel.style.marginTop = '10px';
  controlPanel.style.display = 'flex';
  controlPanel.style.gap = '10px';
  videoContainer.appendChild(controlPanel);

  // প্লে/পজ বোতাম
  const playPauseButton = document.createElement('button');
  playPauseButton.textContent = 'Pause';
  playPauseButton.style.padding = '10px 20px';
  playPauseButton.style.cursor = 'pointer';
  playPauseButton.style.backgroundColor = '#007bff';
  playPauseButton.style.color = '#fff';
  playPauseButton.style.border = 'none';
  playPauseButton.style.borderRadius = '5px';
  controlPanel.appendChild(playPauseButton);

  // ফুলস্ক্রিন বোতাম
  const fullscreenButton = document.createElement('button');
  fullscreenButton.textContent = 'Fullscreen';
  fullscreenButton.style.padding = '10px 20px';
  fullscreenButton.style.cursor = 'pointer';
  fullscreenButton.style.backgroundColor = '#28a745';
  fullscreenButton.style.color = '#fff';
  fullscreenButton.style.border = 'none';
  fullscreenButton.style.borderRadius = '5px';
  controlPanel.appendChild(fullscreenButton);

  // ভলিউম স্লাইডার
  const volumeSlider = document.createElement('input');
  volumeSlider.type = 'range';
  volumeSlider.min = '0';
  volumeSlider.max = '1';
  volumeSlider.step = '0.1';
  volumeSlider.value = '1';
  volumeSlider.style.width = '100px';
  controlPanel.appendChild(volumeSlider);

  // ফেড-ইন অ্যানিমেশন
  let opacity = 0;
  const fadeIn = setInterval(() => {
    if (opacity >= 1) {
      clearInterval(fadeIn);
    }
    videoElement.style.opacity = opacity;
    opacity += 0.05;
  }, 50);

  // প্লে/পজ টগল
  playPauseButton.addEventListener('click', () => {
    if (videoElement.paused) {
      videoElement.play();
      playPauseButton.textContent = 'Pause';
    } else {
      videoElement.pause();
      playPauseButton.textContent = 'Play';
    }
  });

  // ফুলস্ক্রিন টগল
  fullscreenButton.addEventListener('click', () => {
    if (videoElement.requestFullscreen) {
      videoElement.requestFullscreen();
    } else if (videoElement.mozRequestFullScreen) { // Firefox
      videoElement.mozRequestFullScreen();
    } else if (videoElement.webkitRequestFullscreen) { // Chrome, Safari
      videoElement.webkitRequestFullscreen();
    } else if (videoElement.msRequestFullscreen) { // IE/Edge
      videoElement.msRequestFullscreen();
    }
  });

  // ভলিউম কন্ট্রোল
  volumeSlider.addEventListener('input', () => {
    videoElement.muted = false; // মিউট বন্ধ
    videoElement.volume = volumeSlider.value;
  });

  // এরর হ্যান্ডলিং
  videoElement.addEventListener('error', () => {
    console.error('Failed to load video from URL: ' + videoData.video);
    videoContainer.innerHTML += `
      <p style="color: red; font-family: Arial, sans-serif; margin-top: 10px;">
        Error: Could not load video. Please check the URL or try again later.
      </p>`;
  });

  // ভিডিও প্লে শুরু হলে লগ
  videoElement.addEventListener('play', () => {
    console.log(`Video started playing. Operator: ${videoData.operator}, Prompt: ${videoData.prompt}`);
  });
}

// ডকুমেন্ট লোড হলে ফাংশন কল
document.addEventListener('DOMContentLoaded', initializeVideoPlayer);
