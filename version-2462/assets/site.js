(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-button]");
    var menuPanel = document.querySelector("[data-menu-panel]");
    if (menuButton && menuPanel) {
      menuButton.addEventListener("click", function () {
        menuPanel.classList.toggle("is-open");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    if (slides.length > 0) {
      var current = 0;
      var changeSlide = function (index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === current);
        });
      };
      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener("click", function () {
          changeSlide(dotIndex);
        });
      });
      changeSlide(0);
      setInterval(function () {
        changeSlide(current + 1);
      }, 5200);
    }

    var searchInput = document.querySelector("[data-library-search]");
    var searchTrigger = document.querySelector("[data-search-trigger]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-title]"));
    var filterButtons = Array.prototype.slice.call(document.querySelectorAll("[data-filter]"));
    var noResults = document.querySelector("[data-no-results]");
    var activeFilter = "all";

    var getQuery = function () {
      var params = new URLSearchParams(window.location.search);
      return params.get("q") || "";
    };

    var applySearch = function () {
      if (!searchInput || cards.length === 0) {
        return;
      }
      var text = searchInput.value.trim().toLowerCase();
      var shown = 0;
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-year"),
          card.getAttribute("data-tags")
        ].join(" ").toLowerCase();
        var type = (card.getAttribute("data-type") || "").toLowerCase();
        var region = (card.getAttribute("data-region") || "").toLowerCase();
        var matchedText = !text || haystack.indexOf(text) !== -1;
        var matchedFilter = activeFilter === "all" || type.indexOf(activeFilter) !== -1 || region.indexOf(activeFilter) !== -1 || haystack.indexOf(activeFilter) !== -1;
        var visible = matchedText && matchedFilter;
        card.style.display = visible ? "" : "none";
        if (visible) {
          shown += 1;
        }
      });
      if (noResults) {
        noResults.classList.toggle("is-visible", shown === 0);
      }
    };

    if (searchInput) {
      searchInput.value = getQuery();
      searchInput.addEventListener("input", applySearch);
      applySearch();
    }

    if (searchTrigger) {
      searchTrigger.addEventListener("click", applySearch);
    }

    filterButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        activeFilter = button.getAttribute("data-filter") || "all";
        filterButtons.forEach(function (item) {
          item.classList.toggle("is-active", item === button);
        });
        applySearch();
      });
    });
  });

  window.initPlayer = function (streamUrl) {
    var box = document.querySelector("[data-player]");
    if (!box) {
      return;
    }
    var video = box.querySelector("video");
    var overlay = box.querySelector(".player-overlay");
    var hlsInstance = null;
    var started = false;

    var attach = function () {
      if (started || !video) {
        return;
      }
      started = true;
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
    };

    var play = function () {
      attach();
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      video.setAttribute("controls", "controls");
      var result = video.play();
      if (result && typeof result.catch === "function") {
        result.catch(function () {});
      }
    };

    if (overlay) {
      overlay.addEventListener("click", play);
      overlay.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          play();
        }
      });
    }
    if (video) {
      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        }
      });
    }
    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };
})();
