(function () {
  function queryAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  document.addEventListener("DOMContentLoaded", function () {
    var toggle = document.querySelector("[data-nav-toggle]");
    var menu = document.querySelector("[data-nav-menu]");

    if (toggle && menu) {
      toggle.addEventListener("click", function () {
        menu.classList.toggle("is-open");
      });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = queryAll("[data-hero-slide]", hero);
      var dots = queryAll("[data-hero-dot]", hero);
      var active = 0;
      var timer = null;

      function showSlide(index) {
        if (!slides.length) {
          return;
        }
        active = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === active);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === active);
        });
      }

      function playHero() {
        timer = window.setInterval(function () {
          showSlide(active + 1);
        }, 5200);
      }

      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
          window.clearInterval(timer);
          showSlide(i);
          playHero();
        });
      });

      showSlide(0);
      playHero();
    }

    var searchInput = document.querySelector("[data-search-input]");
    var cards = queryAll("[data-card]");
    var filters = queryAll("[data-filter]");
    var filterValue = "";

    function normalize(value) {
      return String(value || "").toLowerCase().trim();
    }

    function applySearch() {
      if (!searchInput && !filters.length) {
        return;
      }
      var keyword = normalize(searchInput ? searchInput.value : "");
      cards.forEach(function (card) {
        var text = normalize(card.getAttribute("data-search"));
        var keywordMatched = !keyword || text.indexOf(keyword) !== -1;
        var filterMatched = !filterValue || text.indexOf(normalize(filterValue)) !== -1;
        card.classList.toggle("is-hidden", !(keywordMatched && filterMatched));
      });
    }

    if (searchInput) {
      searchInput.addEventListener("input", applySearch);
    }

    filters.forEach(function (button) {
      button.addEventListener("click", function () {
        filterValue = button.getAttribute("data-filter") || "";
        filters.forEach(function (item) {
          item.classList.toggle("is-active", item === button);
        });
        applySearch();
      });
    });
  });

  window.bindStreamPlayer = function (streamUrl) {
    var video = document.getElementById("movie-player");
    var poster = document.querySelector("[data-player-poster]");
    var playButton = document.querySelector("[data-play-button]");
    var loaded = false;
    var hlsInstance = null;

    if (!video || !streamUrl) {
      return;
    }

    function loadStream() {
      if (loaded) {
        return;
      }
      loaded = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }

    function beginPlay() {
      loadStream();
      if (poster) {
        poster.classList.add("is-hidden");
      }
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }

    if (poster) {
      poster.addEventListener("click", beginPlay);
    }

    if (playButton) {
      playButton.addEventListener("click", function (event) {
        event.stopPropagation();
        beginPlay();
      });
    }

    video.addEventListener("play", function () {
      if (poster) {
        poster.classList.add("is-hidden");
      }
    });

    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };
})();
