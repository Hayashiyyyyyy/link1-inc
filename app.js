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
  }

  toggle.addEventListener('click', function () {
    setOpen(!nav.classList.contains('is-open'));
  });
  nav.addEventListener('click', function (e) {
    if (e.target.closest('a')) setOpen(false);
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

    location.href = 'mailto:' + to +
      '?subject=' + encodeURIComponent('【HPお問い合わせ】' + val('type')) +
      '&body=' + encodeURIComponent(body);

    var msg = document.getElementById('form-msg');
    if (msg) {
      msg.textContent = 'メールアプリを開きました。内容を確認して、そのまま送信してください。開かない場合は ' + to + ' まで直接お送りください。';
    }
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
  if (wide.addEventListener) wide.addEventListener('change', sync);
  else if (wide.addListener) wide.addListener(sync);
})();

(function () {
  var tabs = document.querySelectorAll('.svc-tabs a');
  if (!tabs.length || !('IntersectionObserver' in window)) return;

  var byId = {};
  tabs.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });

  function setCurrent(id) {
    tabs.forEach(function (a) { a.removeAttribute('aria-current'); });
    var a = byId[id];
    if (!a) return;
    a.setAttribute('aria-current', 'true');
    var bar = a.parentElement;
    var left = a.offsetLeft - (bar.clientWidth - a.offsetWidth) / 2;
    bar.scrollTo({ left: left, behavior: 'smooth' });
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) setCurrent(e.target.id); });
  }, { rootMargin: '-130px 0px -60% 0px' });

  Object.keys(byId).forEach(function (id) {
    var sec = document.getElementById(id);
    if (sec) io.observe(sec);
  });
})();

(function () {
  // サイト内のページ移動で、紺の幕を上げてから切り替える
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var veil = document.createElement('div');
  veil.className = 'page-veil';
  veil.setAttribute('aria-hidden', 'true');
  document.body.appendChild(veil);

  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href]');
    if (!a || e.defaultPrevented || e.button !== 0) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (a.target === '_blank' || a.hasAttribute('download')) return;

    var url = new URL(a.href, location.href);
    if (url.origin !== location.origin) return;
    if (url.pathname === location.pathname && url.hash) return;
    if (!/\.html$|\/$/.test(url.pathname)) return;

    e.preventDefault();
    document.documentElement.classList.add('is-leaving');
    setTimeout(function () { location.href = url.href; }, 520);
  });

  // 戻るボタンで戻ってきたときは幕を外す
  window.addEventListener('pageshow', function () {
    document.documentElement.classList.remove('is-leaving');
  });
})();
