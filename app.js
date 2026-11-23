// app.js が読み込めたときだけ、表示演出やスマホメニューを有効にする（読み込み失敗時は内容をそのまま見せる）
document.documentElement.classList.add('app');

// 末尾の index.html を省いて比べる（/ と /index.html を同じページとして扱う）
function samePage(a, b) {
  var norm = function (p) { return p.replace(/index.html$/, ''); };
  return norm(a) === norm(b);
}

(function () {
  var head = document.querySelector('.site-head');
  var pagetop = document.querySelector('.pagetop');

  function onScroll() {
    var y = window.scrollY;
    if (head) head.classList.toggle('is-stuck', y > 8);
    if (pagetop) pagetop.classList.toggle('is-on', y > 480);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
})();

(function () {
  var items = document.querySelectorAll('.reveal');
  if (!items.length) return;

  function showAll() {
    items.forEach(function (el) { el.classList.add('is-in'); });
  }

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) {
    showAll();
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      io.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

  items.forEach(function (el) { io.observe(el); });

  // 監視が動かなかった場合の保険：画面内に見えているのに表示されていない要素だけ出す
  setTimeout(function () {
    items.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) el.classList.add('is-in');
    });
  }, 2000);
})();

(function () {
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('gnav');
  if (!toggle || !nav) return;

  function setOpen(open) {
    nav.classList.toggle('is-open', open);
    toggle.classList.toggle('is-open', open);
    document.body.classList.toggle('nav-open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
    document.querySelectorAll('main, .site-foot, .pagetop').forEach(function (el) { el.inert = open; });
  }

  toggle.addEventListener('click', function () {
    setOpen(!nav.classList.contains('is-open'));
  });
  // 「戻る」で戻ってきたときにメニューが開いたまま残らないようにする
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) setOpen(false);
  });

  // 同じページ内へのリンクのときだけ閉じる（別ページへはメニューを開いたまま移動する）
  nav.addEventListener('click', function (e) {
    var a = e.target.closest('a');
    if (!a) return;
    var url = new URL(a.href, location.href);
    if (samePage(url.pathname, location.pathname)) setOpen(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) {
      setOpen(false);
      toggle.focus();
    }
  });
  var wide = window.matchMedia('(min-width: 601px)');
  function onWide() { if (wide.matches) setOpen(false); }
  if (wide.addEventListener) wide.addEventListener('change', onWide);
  else if (wide.addListener) wide.addListener(onWide);
})();

(function () {
  var form = document.getElementById('contact-form');
  if (!form) return;

  var to = (form.getAttribute('action') || '').replace(/^mailto:/, '');

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!form.reportValidity()) return;

    function val(name) {
      var el = form.elements[name];
      return el ? el.value.trim() : '';
    }

    var body = [
      'お問い合わせ種別：' + val('type'),
      '学校・団体・企業名：' + val('org'),
      'お名前：' + val('name'),
      'メールアドレス：' + val('email'),
      '電話番号：' + val('tel'),
      'ご希望の実施時期：' + val('when'),
      '',
      '【ご相談内容】',
      val('body')
    ].join('\r\n');

    var href = 'mailto:' + to +
      '?subject=' + encodeURIComponent('【HPお問い合わせ】' + val('type')) +
      '&body=' + encodeURIComponent(body);

    var msg = document.getElementById('form-msg');
    if (msg) {
      msg.textContent = href.length > 8000
        ? '内容が長いため、メールアプリが開かない場合があります。その際は ' + to + ' まで直接お送りください。'
        : 'メールアプリを開きました。内容を確認して、そのまま送信してください。開かない場合は ' + to + ' まで直接お送りください。';
    }
    location.href = href;
  });
})();

(function () {
  var blocks = document.querySelectorAll('details.biz-more');
  if (!blocks.length) return;
  var wide = window.matchMedia('(min-width: 601px)');

  function sync() {
    blocks.forEach(function (d) { d.open = wide.matches; });
  }
  sync();

  // スマホで #event などに直接来たときは、閉じたあとの位置に合わせ直す
  if (location.hash && !wide.matches) {
    var target = document.getElementById(location.hash.slice(1));
    if (target) requestAnimationFrame(function () { target.scrollIntoView(); });
  }
  // 最初に閉じる動きはアニメーションさせない
  requestAnimationFrame(function () {
    blocks.forEach(function (d) { d.classList.add('is-ready'); });
  });

  // PC幅に広がったときだけ開く（スマホの回転などで、開いた内容を勝手に閉じない）
  function onChange() { if (wide.matches) sync(); }
  if (wide.addEventListener) wide.addEventListener('change', onChange);
  else if (wide.addListener) wide.addListener(onChange);
})();

(function () {
  var tabs = document.querySelectorAll('.svc-tabs a');
  if (!tabs.length) return;

  var byId = {};
  tabs.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
  var sections = Object.keys(byId)
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);
  if (!sections.length) return;
  var current = null;

  function setCurrent(id) {
    if (id === current) return;
    current = id;
    tabs.forEach(function (a) { a.removeAttribute('aria-current'); });
    var a = byId[id];
    a.setAttribute('aria-current', 'true');
    var bar = a.parentElement;
    if (bar.scrollWidth <= bar.clientWidth) return;
    var left = Math.max(0, a.offsetLeft - (bar.clientWidth - a.offsetWidth) / 2);
    bar.scrollTo({ left: left, behavior: 'smooth' });
  }

  // ヘッダーとタブの下を越えた最後の事業を「いま読んでいる事業」とする（最初は先頭）
  var ticking = false;
  function update() {
    ticking = false;
    var id = sections[0].id;
    sections.forEach(function (s) {
      if (s.getBoundingClientRect().top < 150) id = s.id;
    });
    setCurrent(id);
  }
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }, { passive: true });
  update();
})();

(function () {
  // サイト内のページ移動：本文を静かに消してから次のページへ
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var prefetched = {};

  function pageLink(a) {
    if (!a || a.target === '_blank' || a.hasAttribute('download')) return null;
    var url = new URL(a.href, location.href);
    if (url.origin !== location.origin) return null;
    if (samePage(url.pathname, location.pathname)) return null;
    if (!/\.html$|\/$/.test(url.pathname)) return null;
    return url;
  }

  // 指が触れた時点で次のページを先読みし、切り替えを速くする
  function prefetch(e) {
    var url = pageLink(e.target.closest('a[href]'));
    if (!url || prefetched[url.pathname]) return;
    prefetched[url.pathname] = true;
    var l = document.createElement('link');
    l.rel = 'prefetch';
    l.href = url.pathname;
    document.head.appendChild(l);
  }
  document.addEventListener('pointerdown', prefetch, { passive: true });
  document.addEventListener('mouseover', prefetch, { passive: true });

  if (reduce) return;

  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest('a[href]');
    var url = pageLink(a);
    if (!url) return;

    e.preventDefault();
    // メニューから選んだときは、メニューが画面を覆っているのですぐに移動する
    if (a.closest('.site-nav.is-open')) {
      location.href = url.href;
      return;
    }
    document.documentElement.classList.add('is-leaving');
    setTimeout(function () { location.href = url.href; }, 220);
  });

  // 「戻る」でページが復元されたときは元に戻す
  window.addEventListener('pageshow', function (e) {
    document.documentElement.classList.remove('is-leaving');
  });
})();

(function () {
  // トップの最初の画面：ロゴをマウスとスクロールに合わせて少し動かし、奥行きを出す
  var panel = document.querySelector('.h-kv__panel');
  if (!panel || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var mx = 0, my = 0, sy = 0, ticking = false;

  function apply() {
    ticking = false;
    panel.style.setProperty('--kx', (mx * -22).toFixed(1));
    panel.style.setProperty('--ky', (my * -16 + sy * 0.18).toFixed(1));
  }
  function request() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(apply);
  }

  if (window.matchMedia('(hover: hover)').matches) {
    panel.addEventListener('pointermove', function (e) {
      var r = panel.getBoundingClientRect();
      mx = (e.clientX - r.left) / r.width - 0.5;
      my = (e.clientY - r.top) / r.height - 0.5;
      request();
    });
    panel.addEventListener('pointerleave', function () { mx = 0; my = 0; request(); });
  }
  window.addEventListener('scroll', function () {
    sy = Math.min(window.scrollY, window.innerHeight);
    request();
  }, { passive: true });
})();

(function () {
  // 事業内容ページ：見出しや中身をスクロールに合わせて順に出す
  if (!document.body.classList.contains('theme-service')) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!('IntersectionObserver' in window)) return;

  var targets = document.querySelectorAll(
    'main section[id] .sec-head > *, main section[id] article, main section[id] li, ' +
    'main section[id] figure, main section[id] .sub-h, main section[id] summary, ' +
    'main section[id] .wrap > p, main section[id] .wrap > div:not(.sec-head):not(.svc)'
  );
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      io.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -6% 0px', threshold: 0.01 });

  var heads = [];
  targets.forEach(function (el) {
    // 兄弟の中での順番で、少しずつ遅らせる
    var i = Array.prototype.indexOf.call(el.parentElement.children, el);
    el.style.setProperty('--d', Math.min(i, 6) * 0.08 + 's');
    el.classList.add('mv');
    // 見出しまわりは隠した状態だと検知できないので、まとまり（.sec-head）ごと見る
    if (el.parentElement.classList.contains('sec-head')) {
      if (heads.indexOf(el.parentElement) < 0) heads.push(el.parentElement);
    } else {
      io.observe(el);
    }
  });
  var headIo = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      Array.prototype.forEach.call(entry.target.children, function (c) { c.classList.add('is-in'); });
      headIo.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -6% 0px' });
  heads.forEach(function (h) { headIo.observe(h); });

  // 番号をスクロールに合わせて少し遅れて動かす
  var nums = document.querySelectorAll('.theme-service .sec-no');
  var ticking = false;
  function update() {
    ticking = false;
    var vh = window.innerHeight;
    nums.forEach(function (n) {
      var r = n.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      var v = (r.top + r.height / 2 - vh / 2) * -0.04;
      n.style.setProperty('--py', Math.max(-10, Math.min(10, v)).toFixed(1));
    });
  }
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }, { passive: true });
  update();
})();
