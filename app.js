/* リンクワン株式会社 コーポレートサイト
   スクロール連動の表示とヘッダーの影。STUDIOでは「モーション」機能で同等のことができます。 */
(function () {
  var root = document.documentElement;

  /* ヘッダーの影と、ページトップボタンの表示 */
  var head = document.querySelector('.site-head');
  var top = document.querySelector('.pagetop');
  var onScroll = function () {
    var y = window.scrollY;
    if (head) { head.classList.toggle('is-stuck', y > 8); }
    if (top) { top.classList.toggle('is-on', y > 480); }
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* スクロールに合わせて現れる */
  var targets = document.querySelectorAll('.reveal');
  if (!targets.length) { return; }

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var showAll = function () {
    for (var i = 0; i < targets.length; i++) { targets[i].classList.add('is-in'); }
  };

  if (reduce || !('IntersectionObserver' in window)) { showAll(); return; }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

  for (var i = 0; i < targets.length; i++) { io.observe(targets[i]); }

  /* 保険：何らかの理由で監視が働かなくても、必ず表示する */
  window.setTimeout(showAll, 2000);
}());

/* スマホのメニュー開閉（三本線ボタン） */
(function () {
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('gnav');
  if (!toggle || !nav) { return; }

  var setOpen = function (open) {
    nav.classList.toggle("is-open", open);
    toggle.classList.toggle("is-open", open);
    document.body.classList.toggle("nav-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "メニューを閉じる" : "メニューを開く");
  };

  toggle.addEventListener('click', function () {
    setOpen(!nav.classList.contains('is-open'));
  });

  /* リンクを選んだら閉じる */
  nav.addEventListener('click', function (e) {
    if (e.target.closest('a')) { setOpen(false); }
  });

  /* Escキーで閉じる */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) {
      setOpen(false);
      toggle.focus();
    }
  });

  /* 画面幅が広がったら開閉状態をリセット */
  window.addEventListener('resize', function () {
    if (window.innerWidth > 600) { setOpen(false); }
  }, { passive: true });
}());

/* お問い合わせフォーム：サーバーを使わず、入力内容を入れたメールを作成する
   （内容はURLやサーバーに残らず、利用者の端末のメールアプリに渡るだけ） */
(function () {
  var f = document.getElementById('contact-form');
  if (!f) { return; }
  f.addEventListener('submit', function (e) {
    e.preventDefault();
    if (f.reportValidity && !f.reportValidity()) { return; }
    var v = function (n) { return f.elements[n] ? (f.elements[n].value || '').trim() : ''; };
    var subject = '【HPお問い合わせ】' + v('type');
    var body = [
      'お問い合わせ種別：' + v('type'),
      '学校・団体・企業名：' + v('org'),
      'お名前：' + v('name'),
      'メールアドレス：' + v('email'),
      '電話番号：' + v('tel'),
      'ご希望の実施時期：' + v('when'),
      '',
      '【ご相談内容】',
      v('body')
    ].join('\r\n');
    window.location.href = 'mailto:r.maeda@link1-inc.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    var m = document.getElementById('form-msg');
    if (m) { m.textContent = 'メールアプリを開きました。内容をご確認のうえ、そのまま送信してください。開かない場合は r.maeda@link1-inc.com まで直接お送りください。'; }
  });
}());
