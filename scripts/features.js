/* global hexo */
'use strict';

var ADMONITION_TITLES = {
  note: '说明',
  tip: '提示',
  info: '信息',
  success: '完成',
  warning: '注意',
  danger: '危险'
};

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderMarkdown(text) {
  return hexo.render.renderSync({ text: text, engine: 'md' }).trim();
}

function renderAdmonitions(content) {
  var lines = String(content || '').split(/\r?\n/);
  var output = [];
  var fence = null;

  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];
    var fenceMatch = line.match(/^\s*(```+|~~~+)/);

    if (fenceMatch) {
      var mark = fenceMatch[1].slice(0, 3);
      fence = fence === mark ? null : (fence || mark);
      output.push(line);
      continue;
    }

    var start = !fence && line.match(/^\s*:::(note|tip|info|success|warning|danger)(?:\s+(.+?))?\s*$/i);
    if (!start) {
      output.push(line);
      continue;
    }

    var type = start[1].toLowerCase();
    var title = start[2] || ADMONITION_TITLES[type] || ADMONITION_TITLES.note;
    var body = [];
    var innerFence = null;
    var closed = false;

    for (var j = i + 1; j < lines.length; j++) {
      var current = lines[j];
      var innerFenceMatch = current.match(/^\s*(```+|~~~+)/);

      if (innerFenceMatch) {
        var innerMark = innerFenceMatch[1].slice(0, 3);
        innerFence = innerFence === innerMark ? null : (innerFence || innerMark);
        body.push(current);
        continue;
      }

      if (!innerFence && /^\s*:::\s*$/.test(current)) {
        closed = true;
        i = j;
        break;
      }

      body.push(current);
    }

    if (!closed) {
      output.push(line);
      output = output.concat(body);
      continue;
    }

    output.push(
      '<div class="admonition admonition-' + type + '">' +
        '<div class="admonition-title">' + escapeHtml(title) + '</div>' +
        '<div class="admonition-content">' + renderMarkdown(body.join('\n')) + '</div>' +
      '</div>'
    );
  }

  return output.join('\n');
}

function getSeriesName(post) {
  if (!post || !post.series) return '';
  if (Array.isArray(post.series)) return String(post.series[0] || '');
  if (typeof post.series === 'object') return String(post.series.name || '');
  return String(post.series);
}

function getSeriesOrder(post) {
  var value = post.series_order;
  if (value === undefined && post.series && typeof post.series === 'object') value = post.series.order;
  if (value === undefined) value = post.series_index;
  if (value === undefined) value = post.order;
  value = Number(value);
  return Number.isFinite(value) ? value : Number.MAX_SAFE_INTEGER;
}

hexo.extend.filter.register('before_post_render', function pureAdmonitionFilter(data) {
  if (!data || !data.content) return data;
  data.content = renderAdmonitions(data.content);
  return data;
}, 1);

hexo.extend.helper.register('pure_series', function pureSeries(page) {
  var config = (((hexo.theme || {}).config || {}).post || {}).series || {};
  if (config.enable === false) return null;

  var name = getSeriesName(page);
  if (!name) return null;

  var posts = hexo.locals.get('posts').toArray().filter(function (post) {
    return getSeriesName(post) === name;
  }).sort(function (a, b) {
    var order = getSeriesOrder(a) - getSeriesOrder(b);
    if (order !== 0) return order;
    return (a.date ? a.date.valueOf() : 0) - (b.date ? b.date.valueOf() : 0);
  });

  if (posts.length < 2) return null;

  var index = posts.findIndex(function (post) {
    return post.path === page.path;
  });

  if (index < 0) return null;

  return {
    name: name,
    posts: posts,
    index: index,
    total: posts.length,
    prev: posts[index - 1] || null,
    next: posts[index + 1] || null
  };
});

hexo.extend.helper.register('pure_last_updated', function pureLastUpdated() {
  var posts = hexo.locals.get('posts');
  var pages = hexo.locals.get('pages');
  var latest = null;

  function check(data) {
    if (!data || !data.length) return;
    data.each(function (item) {
      var d = item.updated || item.date;
      if (d && d.valueOf) {
        if (!latest || d.valueOf() > latest.valueOf()) {
          latest = d;
        }
      }
    });
  }

  check(posts);
  check(pages);

  return latest;
});

hexo.extend.helper.register('pure_outdated', function pureOutdated(page) {
  var config = (((hexo.theme || {}).config || {}).post || {}).outdated || {};
  if (config.enable === false || !page || page.layout !== 'post') return null;
  if (page.outdated === false) return null;

  var threshold = Number(page.outdated_days || config.days || 365);
  var basis = config.basis === 'date' ? 'date' : 'updated';
  var date = basis === 'date' ? page.date : (page.updated || page.date);
  if (!date || !date.valueOf) return null;

  var days = Math.floor((Date.now() - date.valueOf()) / 86400000);
  if (page.outdated !== true && days < threshold) return null;

  return {
    basis: basis,
    date: date,
    days: days,
    threshold: threshold,
    message: config.message || ''
  };
});
