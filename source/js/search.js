/* Pure Theme — search.js
   Requires hexo-generator-search plugin → generates /search.xml
   Install: npm install hexo-generator-search --save
   Config in _config.yml:
     search:
       path: search.xml
       field: post
       content: true
*/
(function () {
  'use strict';

  var searchInput   = document.getElementById('searchInput');
  var searchResults = document.getElementById('searchResults');
  if (!searchInput || !searchResults) return;

  var searchData = null;
  var loading    = false;

  function escHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  function escRe(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
  function highlight(text, keywords) {
    var escaped = escHtml(text);
    keywords.forEach(function (kw) {
      if (!kw) return;
      var re = new RegExp('(' + escRe(escHtml(kw)) + ')', 'gi');
      escaped = escaped.replace(re, '<mark>$1</mark>');
    });
    return escaped;
  }

  function loadSearchData(cb) {
    if (searchData) { cb(null, searchData); return; }
    if (loading) return;
    loading = true;
    searchResults.innerHTML = '<p class="search-hint">加载搜索数据…</p>';

    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/search.xml', true);
    xhr.timeout = 10000;
    xhr.onload = function () {
      loading = false;
      if (xhr.status !== 200) {
        cb('HTTP ' + xhr.status);
        return;
      }
      try {
        var parser  = new DOMParser();
        var xmlDoc  = parser.parseFromString(xhr.responseText, 'text/xml');
        var parseErr = xmlDoc.querySelector('parsererror');
        if (parseErr) { cb('XML parse error'); return; }

        var entries = xmlDoc.querySelectorAll('entry');
        searchData  = [];
        entries.forEach(function (entry) {
          var titleEl   = entry.querySelector('title');
          var urlEl     = entry.querySelector('url');
          var contentEl = entry.querySelector('content');
          searchData.push({
            title:   titleEl   ? (titleEl.textContent   || '') : '',
            url:     urlEl     ? (urlEl.textContent     || '') : '',
            content: contentEl ? (contentEl.textContent || '') : '',
          });
        });
        cb(null, searchData);
      } catch (e) {
        cb(String(e));
      }
    };
    xhr.onerror = xhr.ontimeout = function () {
      loading = false;
      cb('网络错误或超时');
    };
    xhr.send();
  }

  function doSearch(query) {
    query = query.trim();
    if (!query) {
      searchResults.innerHTML = '<p class="search-hint">输入关键词开始搜索</p>';
      return;
    }

    loadSearchData(function (err, data) {
      if (err) {
        searchResults.innerHTML =
          '<p class="search-no-result">搜索数据加载失败：' + escHtml(err) +
          '<br><small>请确认已安装 hexo-generator-search 并重新生成站点</small></p>';
        return;
      }

      var keywords = query.toLowerCase().split(/\s+/).filter(Boolean);
      var results  = [];

      data.forEach(function (item) {
        var titleLow   = item.title.toLowerCase();
        var contentLow = item.content.toLowerCase();
        var score = 0;
        keywords.forEach(function (kw) {
          if (titleLow.indexOf(kw)   !== -1) score += 10;
          if (contentLow.indexOf(kw) !== -1) score += 1;
        });
        if (score === 0) return;

        // Build excerpt around first keyword hit
        var idx     = contentLow.indexOf(keywords[0]);
        var start   = Math.max(0, idx - 60);
        var excerpt = item.content.substring(start, start + 180).replace(/<[^>]+>/g, '');
        if (start > 0) excerpt = '…' + excerpt;
        if (excerpt.length === 180) excerpt += '…';

        results.push({ item: item, score: score, excerpt: excerpt });
      });

      results.sort(function (a, b) { return b.score - a.score; });

      if (results.length === 0) {
        searchResults.innerHTML =
          '<p class="search-no-result">没有找到与 "' + escHtml(query) + '" 相关的文章</p>';
        return;
      }

      var html = results.slice(0, 20).map(function (r) {
        return '<a href="' + escHtml(r.item.url) + '" class="search-result-item">' +
          '<div class="search-result-title">' + highlight(r.item.title, keywords) + '</div>' +
          '<div class="search-result-excerpt">' + highlight(r.excerpt, keywords) + '</div>' +
          '</a>';
      }).join('');

      searchResults.innerHTML = html;
    });
  }

  var timer;
  searchInput.addEventListener('input', function () {
    clearTimeout(timer);
    timer = setTimeout(function () { doSearch(searchInput.value); }, 250);
  });

  // Trigger search if input already has value (e.g. after browser back)
  if (searchInput.value) doSearch(searchInput.value);

})();
