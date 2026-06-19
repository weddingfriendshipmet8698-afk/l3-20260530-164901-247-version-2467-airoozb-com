(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
      return;
    }
    document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');
    if (menuButton && mobileMenu) {
      menuButton.addEventListener('click', function () {
        mobileMenu.classList.toggle('is-open');
      });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
      var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
      var index = 0;
      var change = function (next) {
        if (!slides.length) {
          return;
        }
        index = (next + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle('active', i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle('active', i === index);
        });
      };
      dots.forEach(function (dot, i) {
        dot.addEventListener('click', function () {
          change(i);
        });
      });
      setInterval(function () {
        change(index + 1);
      }, 5200);
    }

    document.querySelectorAll('[data-search-panel]').forEach(function (panel) {
      var input = panel.querySelector('[data-search-input]');
      var scope = panel.closest('main') || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
      var empty = scope.querySelector('[data-empty-state]');
      var activeChip = '';
      var apply = function () {
        var term = input ? input.value.trim().toLowerCase() : '';
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = (card.getAttribute('data-title') || '').toLowerCase();
          var matchText = !term || haystack.indexOf(term) !== -1;
          var matchChip = !activeChip || activeChip === '全部' || haystack.indexOf(activeChip.toLowerCase()) !== -1;
          var show = matchText && matchChip;
          card.style.display = show ? '' : 'none';
          if (show) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      };
      if (input) {
        input.addEventListener('input', apply);
      }
      panel.querySelectorAll('[data-filter-chip]').forEach(function (chip) {
        chip.addEventListener('click', function () {
          panel.querySelectorAll('[data-filter-chip]').forEach(function (item) {
            item.classList.remove('active');
          });
          chip.classList.add('active');
          activeChip = chip.getAttribute('data-filter-chip') || '';
          apply();
        });
      });
    });

    document.querySelectorAll('.js-player').forEach(function (shell) {
      var video = shell.querySelector('video');
      var button = shell.querySelector('.play-cover');
      if (!video || !button) {
        return;
      }
      var source = video.getAttribute('data-url');
      var loaded = false;
      var load = function () {
        if (loaded || !source) {
          return;
        }
        loaded = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({ enableWorker: true });
          hls.loadSource(source);
          hls.attachMedia(video);
          return;
        }
        video.src = source;
      };
      var start = function () {
        load();
        shell.classList.add('is-playing');
        video.controls = true;
        var result = video.play();
        if (result && typeof result.catch === 'function') {
          result.catch(function () {});
        }
      };
      button.addEventListener('click', start);
      video.addEventListener('click', function () {
        if (video.paused) {
          start();
        }
      });
    });
  });
})();
