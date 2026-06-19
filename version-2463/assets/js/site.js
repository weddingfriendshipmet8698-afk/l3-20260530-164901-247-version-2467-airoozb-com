(function() {
  var mobileToggle = document.querySelector("[data-mobile-toggle]");
  var mobileNav = document.querySelector("[data-mobile-nav]");

  if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener("click", function() {
      mobileNav.classList.toggle("open");
    });
  }

  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var index = 0;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });

      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    dots.forEach(function(dot) {
      dot.addEventListener("click", function() {
        var nextIndex = Number(dot.getAttribute("data-hero-dot"));
        showSlide(nextIndex);
      });
    });

    setInterval(function() {
      showSlide(index + 1);
    }, 5200);
  }

  function normalizeText(value) {
    return String(value || "").toLowerCase().trim();
  }

  function setupFiltering(scope) {
    var searchInput = scope.querySelector("[data-search-input]");
    var yearFilter = scope.querySelector("[data-year-filter]");
    var genreFilter = scope.querySelector("[data-genre-filter]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));

    if (!searchInput && !yearFilter && !genreFilter) {
      return;
    }

    var emptyState = document.createElement("div");
    emptyState.className = "empty-state";
    emptyState.textContent = "没有找到匹配影片";
    emptyState.hidden = true;

    var list = document.querySelector("[data-card-list]");
    if (list) {
      list.appendChild(emptyState);
    }

    function applyFilters() {
      var keyword = normalizeText(searchInput ? searchInput.value : "");
      var year = yearFilter ? yearFilter.value : "";
      var genre = genreFilter ? normalizeText(genreFilter.value) : "";
      var visibleCount = 0;

      cards.forEach(function(card) {
        var haystack = normalizeText([
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-category"),
          card.getAttribute("data-tags"),
          card.getAttribute("data-year")
        ].join(" "));

        var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchesYear = !year || card.getAttribute("data-year") === year;
        var matchesGenre = !genre || normalizeText(card.getAttribute("data-genre")).indexOf(genre) !== -1;
        var visible = matchesKeyword && matchesYear && matchesGenre;

        card.hidden = !visible;

        if (visible) {
          visibleCount += 1;
        }
      });

      emptyState.hidden = visibleCount !== 0;
    }

    [searchInput, yearFilter, genreFilter].forEach(function(control) {
      if (control) {
        control.addEventListener("input", applyFilters);
        control.addEventListener("change", applyFilters);
      }
    });
  }

  setupFiltering(document);

  function attachPlayer(panel) {
    var video = panel.querySelector("video");
    var trigger = panel.querySelector("[data-play-trigger]");
    var src = panel.getAttribute("data-src");
    var hasLoaded = false;
    var hlsInstance = null;

    if (!video || !src) {
      return;
    }

    function loadSource() {
      if (hasLoaded) {
        return Promise.resolve();
      }

      hasLoaded = true;

      if (window.Hls && window.Hls.isSupported && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(src);
        hlsInstance.attachMedia(video);
        return Promise.resolve();
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
        return Promise.resolve();
      }

      video.src = src;
      return Promise.resolve();
    }

    function startPlayback() {
      loadSource().then(function() {
        if (trigger) {
          trigger.classList.add("hidden");
        }

        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function() {
            if (trigger) {
              trigger.classList.remove("hidden");
            }
          });
        }
      });
    }

    if (trigger) {
      trigger.addEventListener("click", startPlayback);
    }

    video.addEventListener("click", function() {
      if (video.paused) {
        startPlayback();
      }
    });

    video.addEventListener("play", function() {
      if (trigger) {
        trigger.classList.add("hidden");
      }
    });

    video.addEventListener("pause", function() {
      if (video.currentTime === 0 && trigger) {
        trigger.classList.remove("hidden");
      }
    });

    window.addEventListener("beforeunload", function() {
      if (hlsInstance && hlsInstance.destroy) {
        hlsInstance.destroy();
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll("[data-player]")).forEach(attachPlayer);
})();
