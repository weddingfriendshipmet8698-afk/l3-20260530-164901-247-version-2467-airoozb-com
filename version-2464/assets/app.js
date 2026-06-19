
(function(){
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

  function toggleNav(){
    const btn = $('.nav-toggle');
    const nav = $('.nav-links');
    if(!btn || !nav) return;
    btn.addEventListener('click', () => nav.classList.toggle('open'));
  }

  function initSearchQuickLink(){
    const form = document.querySelector('[data-home-search]');
    if(!form) return;
    const input = form.querySelector('input');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const q = encodeURIComponent((input.value || '').trim());
      location.href = 'search.html' + (q ? '?q=' + q : '');
    });
  }

  function movieCardHTML(movie, basePath=''){
    const poster = `
      <div class="poster" style="${movie.posterStyle}">
        <div class="poster-content">
          <div class="tagline">${movie.type} · ${movie.region}</div>
          <div>
            <div class="title">${movie.title}</div>
            <div class="sub">
              <span class="badge">${movie.year}</span>
              <span class="badge">${movie.genre0}</span>
            </div>
          </div>
        </div>
      </div>`;
    return `
      <a class="movie-card" href="${basePath}${movie.path}">
        ${poster}
        <div class="movie-content">
          <div class="title-line">
            <h3>${movie.title}</h3>
            <span class="year">${movie.year}</span>
          </div>
          <p class="desc">${movie.one_line}</p>
          <div class="meta-row">
            <span>${movie.region}</span>
            <span>${movie.type}</span>
            <span>${movie.genre0}</span>
          </div>
        </div>
      </a>`;
  }

  function initSearchPage(){
    const root = document.querySelector('[data-search-page]');
    if(!root || !window.MOVIES) return;
    const input = $('#searchInput', root);
    const genre = $('#searchGenre', root);
    const year = $('#searchYear', root);
    const results = $('#searchResults', root);
    const counter = $('#searchCount', root);
    const params = new URLSearchParams(location.search);
    const q0 = (params.get('q') || '').trim();
    if(input && q0) input.value = q0;

    function doSearch(){
      const q = (input?.value || '').trim().toLowerCase();
      const g = (genre?.value || '').trim();
      const y = (year?.value || '').trim();

      const matched = window.MOVIES.filter(m => {
        const hay = [m.title, m.summary, m.one_line, m.genre, m.tags, m.region, m.type, String(m.year)].join(' ').toLowerCase();
        if(q && !hay.includes(q)) return false;
        if(g && !hay.includes(g.toLowerCase())) return false;
        if(y && String(m.year) !== y) return false;
        return true;
      });

      counter.textContent = `${matched.length} 条结果`;
      results.innerHTML = matched.map(movieCardHTML).join('') || `
        <div class="section-shell">
          <p class="muted">没有匹配到结果，换一个关键词试试。</p>
        </div>`;
    }

    [input, genre, year].filter(Boolean).forEach(el => el.addEventListener('input', doSearch));
    doSearch();
  }

  function initHomeFilters(){
    const section = document.querySelector('[data-home-filter]');
    if(!section || !window.MOVIES) return;
    const chips = $$('[data-filter-chip]', section);
    const grid = $('[data-filter-grid]', section);
    if(!grid || !chips.length) return;

    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chips.forEach(x => x.classList.remove('btn-primary'));
        chip.classList.add('btn-primary');
        const mode = chip.dataset.filterChip;
        const filtered = window.MOVIES.filter(m => {
          if(mode === 'latest') return true;
          if(mode === 'hot') return true;
          if(mode === 'movie') return m.type.includes('电影');
          if(mode === 'series') return m.type.includes('剧') || m.type.includes('电视剧');
          return true;
        }).slice(0, 12);
        grid.innerHTML = filtered.map(movieCardHTML).join('');
      });
    });
  }

  function initMoviePlayers(){
    const videos = $$('[data-m3u8]');
    videos.forEach(video => {
      const m3u8 = video.dataset.m3u8;
      const mp4 = video.dataset.mp4;
      const poster = video.dataset.poster;
      const playBtn = video.closest('.player-wrap')?.querySelector('[data-play-btn]');
      const status = video.closest('.player-wrap')?.querySelector('[data-player-status]');
      if (poster) video.setAttribute('poster', poster);

      const setup = () => {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = m3u8;
          status && (status.textContent = '已启用原生 HLS 播放');
          return;
        }
        if (window.Hls && window.Hls.isSupported && window.Hls.isSupported()) {
          const hls = new window.Hls({ enableWorker: true, lowLatencyMode: false });
          hls.loadSource(m3u8);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.ERROR, function(event, data) {
            if (data && data.fatal) {
              try { hls.destroy(); } catch(e){}
              video.src = mp4;
              status && (status.textContent = 'HLS 失败，已切换本地 MP4 预览');
            }
          });
          status && (status.textContent = '已启用 HLS.js 播放');
          return;
        }
        video.src = mp4;
        status && (status.textContent = '浏览器未启用 HLS，已使用本地 MP4 预览');
      };

      if (playBtn) {
        playBtn.addEventListener('click', async () => {
          try {
            if (!video.src) setup();
            await video.play();
            playBtn.textContent = '正在播放';
            playBtn.disabled = true;
            status && (status.textContent = status.textContent || '播放中');
          } catch (e) {
            setup();
            try { await video.play(); } catch(err){}
          }
        });
      }
      setup();
    });
  }

  function enhanceRelated(){
    const rel = document.querySelector('[data-related-ids]');
    if(!rel || !window.MOVIES) return;
    const ids = (rel.dataset.relatedIds || '').split(',').map(s=>s.trim()).filter(Boolean);
    const map = new Map(window.MOVIES.map(m => [m.id, m]));
    const list = ids.map(id => map.get(id)).filter(Boolean).slice(0, 6);
    rel.innerHTML = list.map(movieCardHTML).join('');
  }

  toggleNav();
  initSearchQuickLink();
  initSearchPage();
  initHomeFilters();
  initMoviePlayers();
  enhanceRelated();

})();
