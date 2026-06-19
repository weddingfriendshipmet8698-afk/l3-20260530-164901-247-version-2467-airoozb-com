
(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function initNavigation() {
    var toggle = document.querySelector('[data-nav-toggle]');
    var nav = document.querySelector('[data-site-nav]');
    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
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
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initLibraryFilters() {
    var form = document.querySelector('[data-filter-form]');
    var grid = document.querySelector('[data-filter-grid]');
    if (!form || !grid) {
      return;
    }

    var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
    var searchInput = form.querySelector('[data-filter-search]');
    var typeSelect = form.querySelector('[data-filter-type]');
    var regionSelect = form.querySelector('[data-filter-region]');
    var genreSelect = form.querySelector('[data-filter-genre]');
    var yearSelect = form.querySelector('[data-filter-year]');
    var sortSelect = form.querySelector('[data-sort-select]');
    var resetButton = form.querySelector('[data-filter-reset]');
    var summary = document.querySelector('[data-result-summary]');

    var params = new URLSearchParams(window.location.search);
    var queryFromUrl = params.get('q');
    if (queryFromUrl && searchInput) {
      searchInput.value = queryFromUrl;
    }

    function cardText(card) {
      return normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-year'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-tags'),
        card.textContent
      ].join(' '));
    }

    function matches(card) {
      var keyword = normalize(searchInput && searchInput.value);
      var type = normalize(typeSelect && typeSelect.value);
      var region = normalize(regionSelect && regionSelect.value);
      var genre = normalize(genreSelect && genreSelect.value);
      var year = normalize(yearSelect && yearSelect.value);
      var text = cardText(card);

      if (keyword && text.indexOf(keyword) === -1) {
        return false;
      }
      if (type && normalize(card.getAttribute('data-type')) !== type) {
        return false;
      }
      if (region && normalize(card.getAttribute('data-region')) !== region) {
        return false;
      }
      if (genre && normalize(card.getAttribute('data-genre')).indexOf(genre) === -1) {
        return false;
      }
      if (year && normalize(card.getAttribute('data-year')) !== year) {
        return false;
      }
      return true;
    }

    function sortCards() {
      var mode = sortSelect ? sortSelect.value : 'default';
      var sorted = cards.slice();
      if (mode === 'year-desc') {
        sorted.sort(function (a, b) {
          return Number(b.getAttribute('data-year') || 0) - Number(a.getAttribute('data-year') || 0);
        });
      }
      if (mode === 'title-asc') {
        sorted.sort(function (a, b) {
          return String(a.getAttribute('data-title')).localeCompare(String(b.getAttribute('data-title')), 'zh-Hans-CN');
        });
      }
      sorted.forEach(function (card) {
        grid.appendChild(card);
      });
    }

    function applyFilters() {
      var count = 0;
      sortCards();
      cards.forEach(function (card) {
        var visible = matches(card);
        card.classList.toggle('is-hidden-by-filter', !visible);
        if (visible) {
          count += 1;
        }
      });
      if (summary) {
        summary.textContent = '当前显示 ' + count + ' 部作品';
      }
    }

    form.addEventListener('input', applyFilters);
    form.addEventListener('change', applyFilters);
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      applyFilters();
    });

    if (resetButton) {
      resetButton.addEventListener('click', function () {
        form.reset();
        if (searchInput) {
          searchInput.value = '';
        }
        applyFilters();
      });
    }

    applyFilters();
  }

  ready(function () {
    initNavigation();
    initHero();
    initLibraryFilters();
  });
})();
