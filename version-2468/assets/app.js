(function () {
  function selectAll(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function setupMenu() {
    var header = document.querySelector('.site-header');
    var button = document.querySelector('.menu-toggle');
    if (!header || !button) {
      return;
    }
    button.addEventListener('click', function () {
      var opened = header.classList.toggle('open');
      document.body.classList.toggle('menu-open', opened);
      button.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
  }

  function setupHero() {
    var hero = document.querySelector('.js-hero');
    if (!hero) {
      return;
    }
    var slides = selectAll('.hero-slide', hero);
    var dots = selectAll('.hero-dot', hero);
    var prev = hero.querySelector('.hero-prev');
    var next = hero.querySelector('.hero-next');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function play() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
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
        show(Number(dot.getAttribute('data-target') || 0));
        play();
      });
    });
    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        play();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        play();
      });
    }
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', play);
    show(0);
    play();
  }

  function setupSearch() {
    var panel = document.querySelector('.js-search-panel');
    var results = document.querySelector('.js-search-results');
    if (!panel || !results) {
      return;
    }
    var input = panel.querySelector('.js-search-input');
    var category = panel.querySelector('.js-category-filter');
    var year = panel.querySelector('.js-year-filter');
    var cards = selectAll('.movie-card', results);
    var empty = document.querySelector('.js-empty-state');
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    if (input) {
      input.value = initial;
    }

    function apply() {
      var query = (input && input.value ? input.value : '').trim().toLowerCase();
      var categoryValue = category && category.value ? category.value : '';
      var yearValue = year && year.value ? year.value : '';
      var shown = 0;
      cards.forEach(function (card) {
        var haystack = (card.getAttribute('data-search') || '').toLowerCase();
        var matchQuery = !query || haystack.indexOf(query) !== -1;
        var matchCategory = !categoryValue || card.getAttribute('data-category') === categoryValue;
        var matchYear = !yearValue || card.getAttribute('data-year') === yearValue;
        var visible = matchQuery && matchCategory && matchYear;
        card.hidden = !visible;
        if (visible) {
          shown += 1;
        }
      });
      if (empty) {
        empty.hidden = shown !== 0;
      }
    }

    ['input', 'change'].forEach(function (eventName) {
      if (input) {
        input.addEventListener(eventName, apply);
      }
      if (category) {
        category.addEventListener(eventName, apply);
      }
      if (year) {
        year.addEventListener(eventName, apply);
      }
    });
    panel.addEventListener('submit', function (event) {
      event.preventDefault();
      apply();
    });
    apply();
  }

  function setupPlayers() {
    selectAll('.js-player').forEach(function (player) {
      var video = player.querySelector('video');
      var cover = player.querySelector('.player-cover');
      var source = player.getAttribute('data-play');
      var hlsInstance = null;
      if (!video || !source) {
        return;
      }

      function attachSource() {
        if (video.getAttribute('data-ready') === '1') {
          return;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false,
            backBufferLength: 60
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
        } else {
          video.src = source;
        }
        video.setAttribute('data-ready', '1');
      }

      function start() {
        attachSource();
        if (cover) {
          cover.classList.add('is-hidden');
        }
        var attempt = video.play();
        if (attempt && typeof attempt.catch === 'function') {
          attempt.catch(function () {});
        }
      }

      if (cover) {
        cover.addEventListener('click', start);
      }
      video.addEventListener('click', function () {
        if (video.paused) {
          start();
        }
      });
      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
          hlsInstance = null;
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupSearch();
    setupPlayers();
  });
})();
