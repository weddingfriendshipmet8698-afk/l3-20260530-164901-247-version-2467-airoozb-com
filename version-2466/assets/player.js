
import { H as Hls } from './video-player-bbsaiqh1.js';

function setStatus(message) {
  var status = document.querySelector('[data-player-status]');
  if (status) {
    status.textContent = message;
  }
}

function hideOverlay() {
  var overlay = document.querySelector('[data-play-button]');
  if (overlay) {
    overlay.classList.add('is-hidden');
  }
}

function attachHls(video, source) {
  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = source;
    setStatus('已使用浏览器原生 HLS 能力加载播放源。');
    return Promise.resolve();
  }

  if (Hls && Hls.isSupported && Hls.isSupported()) {
    var hls = new Hls({
      enableWorker: true,
      lowLatencyMode: false,
      backBufferLength: 90
    });

    hls.loadSource(source);
    hls.attachMedia(video);
    window.__movieHlsPlayer = hls;

    hls.on(Hls.Events.MANIFEST_PARSED, function () {
      setStatus('播放源加载完成，可以开始观看。');
    });

    hls.on(Hls.Events.ERROR, function (_, data) {
      if (data && data.fatal) {
        setStatus('播放源加载异常，请刷新页面或稍后重试。');
      }
    });

    return Promise.resolve();
  }

  setStatus('当前浏览器不支持 HLS 播放。');
  return Promise.reject(new Error('HLS is not supported'));
}

function initPlayer() {
  var video = document.querySelector('video[data-hls]');
  var button = document.querySelector('[data-play-button]');
  if (!video || !button) {
    return;
  }

  var initialized = false;
  var source = video.getAttribute('data-hls');

  function play() {
    if (!source) {
      setStatus('未找到播放源。');
      return;
    }

    var attachPromise = initialized ? Promise.resolve() : attachHls(video, source);
    initialized = true;

    attachPromise.then(function () {
      hideOverlay();
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          setStatus('浏览器阻止了自动播放，请再次点击视频播放。');
        });
      }
    }).catch(function () {
      setStatus('播放器初始化失败。');
    });
  }

  button.addEventListener('click', play);
  video.addEventListener('play', hideOverlay);
  video.addEventListener('waiting', function () {
    setStatus('正在缓冲，请稍候。');
  });
  video.addEventListener('playing', function () {
    setStatus('正在播放。');
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPlayer);
} else {
  initPlayer();
}
