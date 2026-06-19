import Hls from './hls.min.js';

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initSearch();
  initHeroCarousel();
  initPlayer();
});

function initNav() {
  const toggle = document.querySelector('[data-nav-toggle]');
  const panel = document.querySelector('[data-nav-panel]');
  if (!toggle || !panel) return;
  toggle.addEventListener('click', () => panel.classList.toggle('is-open'));
}

function initSearch() {
  document.querySelectorAll('[data-search-form]').forEach(form => {
    form.addEventListener('submit', e => e.preventDefault());
  });

  document.querySelectorAll('.page-shell').forEach(shell => {
    const input = shell.querySelector('[data-search-input]');
    const grid = shell.querySelector('[data-filter-grid]');
    if (!input || !grid) return;

    const cards = Array.from(grid.querySelectorAll('.movie-card'));
    const filter = () => {
      const q = input.value.trim().toLowerCase();
      cards.forEach(card => {
        const text = card.textContent.toLowerCase();
        const hit = !q || text.includes(q);
        card.classList.toggle('is-hidden', !hit);
      });
    };

    input.addEventListener('input', filter);
  });
}

function initHeroCarousel() {
  const carousel = document.querySelector('[data-hero-carousel]');
  const rail = document.querySelector('[data-hero-rail]');
  const slides = rail ? Array.from(rail.querySelectorAll('[data-hero-slide]')) : [];
  if (!carousel || !rail || slides.length < 2) return;

  let index = 0;
  const render = () => {
    rail.style.transform = `translateX(${-index * 100}%)`;
    slides.forEach((slide, i) => slide.classList.toggle('is-active', i === index));
  };

  const next = () => {
    index = (index + 1) % slides.length;
    render();
  };
  const prev = () => {
    index = (index - 1 + slides.length) % slides.length;
    render();
  };

  const nextBtn = carousel.querySelector('[data-hero-next]');
  const prevBtn = carousel.querySelector('[data-hero-prev]');
  nextBtn && nextBtn.addEventListener('click', next);
  prevBtn && prevBtn.addEventListener('click', prev);
  render();
  let timer = setInterval(next, 5000);
  carousel.addEventListener('mouseenter', () => clearInterval(timer));
  carousel.addEventListener('mouseleave', () => { timer = setInterval(next, 5000); });
}

function initPlayer() {
  document.querySelectorAll('[data-player-shell]').forEach(shell => {
    const video = shell.querySelector('[data-player]');
    const playBtn = shell.querySelector('[data-play-trigger]');
    const srcBtns = Array.from(shell.querySelectorAll('[data-source]'));
    if (!video) return;

    const mp4 = video.dataset.mp4;
    const m3u8 = video.dataset.m3u8;
    let hlsInstance = null;

    const setActive = active => {
      srcBtns.forEach(btn => btn.classList.toggle('is-active', btn.dataset.source === active));
    };

    const loadMp4 = () => {
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }
      video.src = mp4;
      setActive('mp4');
    };

    const loadHls = () => {
      if (location.protocol === 'file:') {
        loadMp4();
        return;
      }
      if (window.Hls && Hls.isSupported()) {
        if (hlsInstance) hlsInstance.destroy();
        hlsInstance = new Hls();
        hlsInstance.loadSource(m3u8);
        hlsInstance.attachMedia(video);
        setActive('hls');
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = m3u8;
        setActive('hls');
        return;
      }
      loadMp4();
    };

    srcBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.dataset.source === 'hls') loadHls();
        else loadMp4();
      });
    });

    playBtn && playBtn.addEventListener('click', async () => {
      if (!video.src) loadHls();
      try {
        await video.play();
      } catch (err) {
        loadMp4();
        try { await video.play(); } catch (e) {}
      }
    });

    loadHls();
  });
}
