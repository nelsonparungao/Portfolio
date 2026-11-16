(() => {
  const init = () => {
  const $ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const root = document.documentElement, reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;

  const tbtn = document.getElementById('theme');
  const paint = () => { const d = root.dataset.theme === 'dark'; tbtn.setAttribute('aria-pressed', d); tbtn.setAttribute('aria-label', d ? 'Switch to light mode' : 'Switch to dark mode'); };
  paint();
  tbtn.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('theme', root.dataset.theme); } catch (e) {}
    paint();
  });

  const menu = $('.menu-btn')[0], nav = $('.nav')[0], head = $('.head')[0];
  const setMenu = o => { nav.classList.toggle('open', o); menu.setAttribute('aria-expanded', o); if (o) head.classList.remove('head-hide'); };
  menu.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
  nav.addEventListener('click', e => e.target.closest('a') && setMenu(false));
  document.addEventListener('click', e => {
    if (nav.classList.contains('open') && !nav.contains(e.target) && !menu.contains(e.target)) setMenu(false);
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
  matchMedia('(min-width:961px)').addEventListener('change', e => { if (e.matches) setMenu(false); });

  let lastY = window.scrollY;
  addEventListener('scroll', () => {
    const y = Math.max(0, window.scrollY), dy = y - lastY;
    if (nav.classList.contains('open') || y <= 100 || dy > 4) head.classList.remove('head-hide');
    else if (dy < -4) head.classList.add('head-hide');
    if (Math.abs(dy) > 4) lastY = y;
  }, { passive: true });
  head.addEventListener('focusin', () => head.classList.remove('head-hide'));

  const links = $('a', nav), alias = { 'skills-all': 'skills', contact: null };
  const spy = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    const id = e.target.id in alias ? alias[e.target.id] : e.target.id;
    links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  $('main section[id], .site section[id]').forEach(s => spy.observe(s));

  const rev = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); rev.unobserve(e.target); } }), { threshold: .08 });
  $('.reveal').forEach(el => rev.observe(el));

  const mq = document.getElementById('mq'); const n = mq.children.length;
  mq.innerHTML += mq.innerHTML; $('li', mq).slice(n).forEach(li => li.setAttribute('aria-hidden', 'true'));

  const hr = document.getElementById('hr');
  if (matchMedia('(hover:hover)').matches && !reduce) {
    hr.addEventListener('pointermove', e => { const r = hr.getBoundingClientRect(); hr.style.setProperty('--px', ((e.clientX - r.left) / r.width - .5).toFixed(3)); hr.style.setProperty('--py', ((e.clientY - r.top) / r.height - .5).toFixed(3)); });
    hr.addEventListener('pointerleave', () => { hr.style.setProperty('--px', 0); hr.style.setProperty('--py', 0); });
  }

  const folders = $('.folder'), fTabs = $('.f-tab');
  const setFolder = (f, on) => {
    f.classList.toggle('open', on);
    f.hidden = !on;
    f.inert = !on;
    const tab = fTabs.find(t => t.getAttribute('aria-controls') === f.id);
    if (tab) {
      tab.setAttribute('aria-expanded', on);
      tab.classList.toggle('open', on);
    }
  };
  folders.forEach(f => setFolder(f, f.classList.contains('open')));
  fTabs.forEach(tab => {
    const f = document.getElementById(tab.getAttribute('aria-controls'));
    if (!f) return;
    tab.addEventListener('click', () => {
      if (f.classList.contains('open')) return;
      folders.forEach(o => setFolder(o, o === f));
    });
  });

  const phFallback = img => {
    const ph = img.closest('.ph');
    if (!ph) return;
    const label = document.createElement('span');
    label.textContent = img.alt || 'Screenshot coming soon';
    ph.replaceChildren(ph.querySelector('.ic') || '', label);
  };
  $('.shot img').forEach(img => {
    img.addEventListener('error', () => phFallback(img), { once: true });
    if (img.complete && img.naturalWidth === 0) phFallback(img);
  });

  const schoolLogo = $('.school-logo')[0], schoolImg = schoolLogo && $('img', schoolLogo)[0];
  if (schoolImg) {
    const logoFallback = () => schoolLogo.classList.add('no-img');
    schoolImg.addEventListener('error', logoFallback, { once: true });
    if (schoolImg.complete && schoolImg.naturalWidth === 0) logoFallback();
  }

  const dlg = document.getElementById('dlg'), dt = document.getElementById('dt'), db = document.getElementById('db'), dh = document.getElementById('dh');
  const open = (title, col, html) => { dt.textContent = title; dh.className = 'dh ' + col; db.innerHTML = html; db.scrollTop = 0; dlg.showModal(); root.classList.add('lock'); };
  dlg.addEventListener('close', () => root.classList.remove('lock'));
  document.getElementById('dx').addEventListener('click', () => dlg.close());
  dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
  $('.more-btn').forEach(b => b.addEventListener('click', () => { const s = b.closest('.folder'); open(s.dataset.title, s.dataset.col, $('.more', s)[0].innerHTML); }));
  const cols = ['pink', 'lime', 'purple'];
  const certCfg = (window.PORTFOLIO_CONTENT && window.PORTFOLIO_CONTENT.certifications) || {};
  const certViewLabel = certCfg.viewLabel || 'View Certificate';
  $('.cshot').forEach((button, index) => {
    const thumb = $('img', button)[0];
    if (thumb) {
      const noThumb = () => button.classList.add('no-img');
      thumb.addEventListener('error', noThumb, { once: true });
      if (thumb.complete && thumb.naturalWidth === 0) noThumb();
    }

    button.addEventListener('click', () => {
      const title = button.dataset.title || 'Certificate';
      const issuer = button.dataset.issuer || 'Issuer not listed';
      const year = button.dataset.year || '';
      const link = button.dataset.link || '';
      const linkHTML = link
        ? `<a class="btn lime" href="${esc(link)}"${/^https?:/i.test(link) ? ' target="_blank" rel="noopener"' : ''}>${esc(certViewLabel)}</a>`
        : `<span class="btn lime dis" aria-disabled="true">${esc(certViewLabel)}: N/A</span>`;
      const certificateDetails = `
        <img class="cd-img" alt="${esc(title)}">
        <h3 class="full">${esc(title)}</h3>
        <p class="cd-meta">
          <span class="tag lime">${esc(year)}</span>
          <span>${esc(issuer)}</span>
        </p>
        <div class="btns">${linkHTML}</div>
      `;

      open(certCfg.modalTitle || 'Certificate', cols[index % 3], certificateDetails);

      const certificateImage = db.querySelector('.cd-img');
      certificateImage.addEventListener('error', () => {
        const placeholder = document.createElement('div');
        placeholder.className = 'ph cd-img';
        placeholder.setAttribute('role', 'img');
        placeholder.setAttribute('aria-label', `${title} certificate image placeholder`);
        placeholder.innerHTML = `<svg class="ic lg" aria-hidden="true"><use href="#i-image"/></svg><span>Certificate image coming soon</span>`;
        certificateImage.replaceWith(placeholder);
      }, { once: true });
      certificateImage.src = button.dataset.image || '';
    });
  });

  const form = document.getElementById('form'), note = document.getElementById('note');
  const check = f => { const v = f.validity, m = v.valueMissing ? 'This field is required.' : v.typeMismatch ? 'Enter a valid email address.' : v.tooShort ? 'Write at least 10 characters.' : ''; f.nextElementSibling.textContent = m; f.setAttribute('aria-invalid', !!m); return !m; };
  form.addEventListener('input', e => e.target.matches('input,textarea') && check(e.target));
  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!$('input,textarea', form).map(check).every(Boolean)) { note.textContent = 'Fix the highlighted fields, then send again.'; $('[aria-invalid=true]', form)[0].focus(); return; }
    const d = new FormData(form), body = `${d.get('message')}\n\nFrom: ${d.get('name')} (${d.get('email')})`;
    location.href = `mailto:nelsonparungao03@gmail.com?subject=${encodeURIComponent(d.get('subject'))}&body=${encodeURIComponent(body)}`;
    note.textContent = 'Your email app should open with the message ready to send.'; form.reset();
  });
  };

  const start = () => {
    const ready = window.CONTENT_READY || Promise.resolve();
    Promise.resolve(ready).catch(() => {}).then(() => {
      try { init(); } catch (err) { console.error('[portfolio] UI init failed.', err); }
    });
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
