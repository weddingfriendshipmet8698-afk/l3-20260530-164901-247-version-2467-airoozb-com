(function () {
  var input = document.querySelector('[data-search-input]');
  var yearSelect = document.querySelector('[data-year-filter]');
  var typeSelect = document.querySelector('[data-type-filter]');
  var regionSelect = document.querySelector('[data-region-filter]');
  var resultBox = document.querySelector('[data-search-results]');

  if (!input || !resultBox || !Array.isArray(window.MOVIE_SEARCH_INDEX)) {
    return;
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function optionValue(select) {
    return select ? select.value : '';
  }

  function render(items) {
    if (!items.length) {
      resultBox.innerHTML = '<div class="empty-state">没有找到匹配影片，可以换一个片名、类型、地区或年份继续搜索。</div>';
      return;
    }

    resultBox.innerHTML = items.slice(0, 80).map(function (item) {
      return [
        '<article class="search-result-card">',
        '  <a href="' + item.url + '"><img src="' + item.cover + '" alt="' + item.title + '" loading="lazy"></a>',
        '  <div>',
        '    <h2><a href="' + item.url + '">' + item.title + '</a></h2>',
        '    <div class="card-meta">' + item.year + ' · ' + item.region + ' · ' + item.type + '</div>',
        '    <p>' + item.oneLine + '</p>',
        '  </div>',
        '</article>'
      ].join('');
    }).join('');
  }

  function runSearch() {
    var query = normalize(input.value);
    var year = optionValue(yearSelect);
    var type = optionValue(typeSelect);
    var region = optionValue(regionSelect);

    var items = window.MOVIE_SEARCH_INDEX.filter(function (item) {
      var text = normalize([
        item.title,
        item.region,
        item.type,
        item.year,
        item.genre,
        item.tags,
        item.oneLine
      ].join(' '));

      return (!query || text.indexOf(query) !== -1) &&
        (!year || String(item.year) === year) &&
        (!type || item.type === type) &&
        (!region || item.region.indexOf(region) !== -1);
    });

    render(items);
  }

  [input, yearSelect, typeSelect, regionSelect].forEach(function (item) {
    if (item) {
      item.addEventListener('input', runSearch);
      item.addEventListener('change', runSearch);
    }
  });

  var params = new URLSearchParams(window.location.search);
  var query = params.get('q');

  if (query) {
    input.value = query;
  }

  runSearch();
})();
