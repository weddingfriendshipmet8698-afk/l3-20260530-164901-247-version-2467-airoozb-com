(function () {
  function initMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');

    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
      document.body.classList.toggle('menu-open', nav.classList.contains('is-open'));
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');

    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var thumbs = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-thumb]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function setSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });

      thumbs.forEach(function (thumb, thumbIndex) {
        thumb.classList.toggle('is-active', thumbIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        setSlide(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        setSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    thumbs.forEach(function (thumb) {
      thumb.addEventListener('mouseenter', function () {
        setSlide(Number(thumb.getAttribute('data-hero-thumb')) || 0);
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        setSlide(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        setSlide(current + 1);
        start();
      });
    }

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    setSlide(0);
    start();
  }

  function initFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll('.filter-panel'));

    panels.forEach(function (panel) {
      var root = panel.parentElement || document;
      var textInput = panel.querySelector('[data-filter-text]');
      var regionSelect = panel.querySelector('[data-filter-region]');
      var genreSelect = panel.querySelector('[data-filter-genre]');
      var yearSelect = panel.querySelector('[data-filter-year]');
      var cards = Array.prototype.slice.call(root.querySelectorAll('[data-card]'));
      var emptyState = root.querySelector('[data-empty-state]');

      function valueOf(element) {
        return element ? String(element.value || '').trim().toLowerCase() : '';
      }

      function applyFilters() {
        var query = valueOf(textInput);
        var region = valueOf(regionSelect);
        var genre = valueOf(genreSelect);
        var year = valueOf(yearSelect);
        var visible = 0;

        cards.forEach(function (card) {
          var search = String(card.getAttribute('data-search') || '').toLowerCase();
          var cardRegion = String(card.getAttribute('data-region') || '').toLowerCase();
          var cardGenre = String(card.getAttribute('data-genre') || '').toLowerCase();
          var cardYear = String(card.getAttribute('data-year') || '').toLowerCase();
          var matched = true;

          if (query && search.indexOf(query) === -1) {
            matched = false;
          }

          if (region && cardRegion !== region) {
            matched = false;
          }

          if (genre && cardGenre.split(/\s+/).indexOf(genre) === -1) {
            matched = false;
          }

          if (year && cardYear !== year) {
            matched = false;
          }

          card.classList.toggle('is-hidden', !matched);

          if (matched) {
            visible += 1;
          }
        });

        if (emptyState) {
          emptyState.classList.toggle('is-visible', visible === 0);
        }
      }

      [textInput, regionSelect, genreSelect, yearSelect].forEach(function (element) {
        if (element) {
          element.addEventListener('input', applyFilters);
          element.addEventListener('change', applyFilters);
        }
      });
    });
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

    players.forEach(function (player) {
      var video = player.querySelector('video');
      var cover = player.querySelector('.player-cover');

      if (!video || !cover) {
        return;
      }

      var source = video.getAttribute('data-hls');
      var started = false;
      var hls = null;

      function playVideo() {
        var promise = video.play();

        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {});
        }
      }

      function startPlayer() {
        if (started || !source) {
          return;
        }

        started = true;
        cover.classList.add('is-hidden');

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          playVideo();
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            playVideo();
          });
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              try {
                hls.destroy();
              } catch (error) {}
              video.src = source;
              playVideo();
            }
          });
          return;
        }

        video.src = source;
        playVideo();
      }

      cover.addEventListener('click', startPlayer);
      video.addEventListener('click', function () {
        if (!started) {
          startPlayer();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initFilters();
    initPlayers();
  });
})();
