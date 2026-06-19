(function () {
  function setupPlayer(video) {
    var src = video.getAttribute('data-src');

    if (!src) {
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false
      });

      hls.loadSource(src);
      hls.attachMedia(video);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
    }

    var wrap = video.closest('.video-wrap');

    if (wrap) {
      wrap.addEventListener('click', function () {
        video.play().catch(function () {});
      });
    }
  }

  document.querySelectorAll('video[data-src]').forEach(setupPlayer);
})();
