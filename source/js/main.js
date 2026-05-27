/* Pure Theme — main.js */
(function () {
  'use strict';

  /* ── Dark mode ─────────────────────────────────────────────── */
  var themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var current = document.documentElement.getAttribute('data-theme');
      var next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('pure-theme', next);
    });
  }

  /* ── Mobile menu ────────────────────────────────────────────── */
  var menuToggle = document.getElementById('menuToggle');
  var siteNav    = document.getElementById('siteNav');
  if (menuToggle && siteNav) {
    menuToggle.addEventListener('click', function () {
      var open = siteNav.classList.toggle('open');
      menuToggle.classList.toggle('open', open);
      menuToggle.setAttribute('aria-expanded', String(open));
    });
    // Close on outside click
    document.addEventListener('click', function (e) {
      if (!siteNav.contains(e.target) && !menuToggle.contains(e.target)) {
        siteNav.classList.remove('open');
        menuToggle.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ── Back to top ────────────────────────────────────────────── */
  var backToTop = document.getElementById('backToTop');
  if (backToTop) {
    window.addEventListener('scroll', function () {
      backToTop.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });
    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ── Sticky header shadow ───────────────────────────────────── */
  var header = document.getElementById('siteHeader');
  if (header) {
    window.addEventListener('scroll', function () {
      header.style.boxShadow = window.scrollY > 10
        ? '0 2px 12px rgba(0,0,0,.08)'
        : '';
    }, { passive: true });
  }

  /* ── Copy code button ───────────────────────────────────────── */
  // Hexo generates: figure.highlight > table > tr > td.code > pre
  document.querySelectorAll('figure.highlight').forEach(function (fig) {
    var toolbar = document.createElement('div');
    toolbar.className = 'code-toolbar';

    var wrapBtn = document.createElement('button');
    wrapBtn.className = 'code-wrap-btn';
    wrapBtn.type = 'button';
    wrapBtn.textContent = '换行';
    wrapBtn.setAttribute('aria-label', '切换代码自动换行');

    var btn = document.createElement('button');
    btn.className = 'code-copy-btn';
    btn.type = 'button';
    btn.textContent = '复制';
    btn.setAttribute('aria-label', '复制代码');
    fig.style.position = 'relative';

    toolbar.appendChild(wrapBtn);
    toolbar.appendChild(btn);
    fig.appendChild(toolbar);

    wrapBtn.addEventListener('click', function () {
      var wrapped = fig.classList.toggle('code-wrap');
      wrapBtn.textContent = wrapped ? '不换行' : '换行';
    });

    btn.addEventListener('click', function () {
      var lines = fig.querySelectorAll('td.code .line');
      var text;
      if (lines.length) {
        text = Array.from(lines).map(function (l) { return l.innerText; }).join('\n');
      } else {
        var pre = fig.querySelector('td.code pre');
        text = pre ? pre.innerText : '';
      }
      navigator.clipboard.writeText(text).then(function () {
        btn.textContent = '已复制';
        setTimeout(function () { btn.textContent = '复制'; }, 2000);
      }).catch(function () {
        btn.textContent = '失败';
        setTimeout(function () { btn.textContent = '复制'; }, 2000);
      });
    });
  });

  /* ── Image lazy load + lightbox ─────────────────────────────── */
  var postContent = document.querySelector('.post-content');
  if (postContent) {
    var imgs = postContent.querySelectorAll('img');
    imgs.forEach(function (img) {
      img.setAttribute('loading', 'lazy');
    });

    // Lightbox
    var overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';
    overlay.innerHTML =
      '<button class="lightbox-close" aria-label="关闭">' +
        '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
      '</button>' +
      '<img class="lightbox-img" src="" alt="">';
    document.body.appendChild(overlay);

    var lbImg = overlay.querySelector('.lightbox-img');
    var lbClose = overlay.querySelector('.lightbox-close');

    function openLightbox(src, alt) {
      lbImg.src = src;
      lbImg.alt = alt || '';
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
    function closeLightbox() {
      overlay.classList.remove('open');
      document.body.style.overflow = '';
    }

    imgs.forEach(function (img) {
      img.addEventListener('click', function () {
        openLightbox(img.src, img.alt);
      });
    });
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeLightbox();
    });
    lbClose.addEventListener('click', closeLightbox);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeLightbox();
    });
  }

  /* ── TOC generation ─────────────────────────────────────────── */
  var tocNav = document.getElementById('tocNav');
  var article = document.querySelector('.post-content');
  if (tocNav && article) {
    var maxDepth = parseInt(document.documentElement.dataset.tocDepth || '3', 10);
    var selector = [];
    for (var d = 1; d <= maxDepth; d++) selector.push('h' + d);
    var headings = article.querySelectorAll(selector.join(','));

    if (headings.length < 2) {
      var wrap = document.getElementById('tocWrap');
      if (wrap) wrap.style.display = 'none';
    } else {
      var ol = document.createElement('ol');
      headings.forEach(function (h, i) {
        if (!h.id) h.id = 'heading-' + i;
        var li = document.createElement('li');
        var a  = document.createElement('a');
        a.href = '#' + h.id;
        a.textContent = h.textContent;
        a.dataset.id = h.id;
        li.appendChild(a);
        ol.appendChild(li);
      });
      tocNav.appendChild(ol);

      // Scroll spy
      var tocLinks = tocNav.querySelectorAll('a');
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            tocLinks.forEach(function (a) { a.classList.remove('active'); });
            var active = tocNav.querySelector('a[data-id="' + entry.target.id + '"]');
            if (active) active.classList.add('active');
          }
        });
      }, { rootMargin: '-' + (64 + 16) + 'px 0px -70% 0px' });

      headings.forEach(function (h) { observer.observe(h); });
    }
  }

  /* ── TOC toggle ─────────────────────────────────────────────── */
  var tocToggle = document.getElementById('tocToggle');
  if (tocToggle && tocNav) {
    tocToggle.addEventListener('click', function () {
      var collapsed = tocNav.classList.toggle('hidden');
      tocToggle.classList.toggle('collapsed', collapsed);
    });
  }

  /* ── Search modal ───────────────────────────────────────────── */
  var searchBtn     = document.getElementById('searchBtn');
  var searchOverlay = document.getElementById('searchOverlay');
  var searchClose   = document.getElementById('searchClose');
  var searchInput   = document.getElementById('searchInput');

  function openSearch() {
    if (!searchOverlay) return;
    searchOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(function () { if (searchInput) searchInput.focus(); }, 50);
  }
  function closeSearch() {
    if (!searchOverlay) return;
    searchOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (searchBtn)   searchBtn.addEventListener('click', openSearch);
  if (searchClose) searchClose.addEventListener('click', closeSearch);
  if (searchOverlay) {
    searchOverlay.addEventListener('click', function (e) {
      if (e.target === searchOverlay) closeSearch();
    });
  }
  document.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      searchOverlay && searchOverlay.classList.contains('open') ? closeSearch() : openSearch();
    }
    if (e.key === 'Escape' && searchOverlay && searchOverlay.classList.contains('open')) {
      closeSearch();
    }
  });

  /* ── Smooth anchor scroll ───────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href').slice(1);
      var target = document.getElementById(id);
      if (target) {
        e.preventDefault();
        var offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height'), 10) || 64;
        var top = target.getBoundingClientRect().top + window.scrollY - offset - 16;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
  });

  /* ── Giscus dark mode sync ──────────────────────────────────── */
  function syncGiscus(theme) {
    var frame = document.querySelector('iframe.giscus-frame');
    if (!frame) return;
    frame.contentWindow.postMessage(
      { giscus: { setConfig: { theme: theme === 'dark' ? 'dark' : 'light' } } },
      'https://giscus.app'
    );
  }
  var mo = new MutationObserver(function () {
    syncGiscus(document.documentElement.getAttribute('data-theme'));
  });
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

})();
