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
  setTimeout(showAll, 2000);
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
  window.addEventListener('resize', function () {
    if (window.innerWidth > 600) setOpen(false);
  }, { passive: true });
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
    if (!wide.matches) return;
    blocks.forEach(function (d) { d.open = true; });
  }
  sync();
  wide.addEventListener('change', sync);
})();
