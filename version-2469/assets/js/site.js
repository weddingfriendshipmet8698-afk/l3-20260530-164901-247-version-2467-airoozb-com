(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');

  if (menuButton) {
    menuButton.addEventListener('click', function () {
      document.body.classList.toggle('menu-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var currentSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    currentSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === currentSlide);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === currentSlide);
    });
  }

  dots.forEach(function (dot, dotIndex) {
    dot.addEventListener('click', function () {
      showSlide(dotIndex);
    });
  });

  if (slides.length) {
    showSlide(0);
    window.setInterval(function () {
      showSlide(currentSlide + 1);
    }, 5200);
  }

  var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-value]'));
  var filterCards = Array.prototype.slice.call(document.querySelectorAll('[data-title][data-year]'));

  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      var value = button.getAttribute('data-filter-value');

      filterButtons.forEach(function (item) {
        item.classList.toggle('active', item === button);
      });

      filterCards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-genre')
        ].join(' ');

        card.style.display = value === 'all' || text.indexOf(value) !== -1 ? '' : 'none';
      });
    });
  });

  var homeSearch = document.querySelector('[data-home-search]');

  if (homeSearch) {
    homeSearch.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = homeSearch.querySelector('input');
      var value = input ? input.value.trim() : '';
      window.location.href = 'search.html?q=' + encodeURIComponent(value);
    });
  }
})();
