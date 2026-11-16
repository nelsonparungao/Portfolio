(() => {
  const $ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement, reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;

  const tbtn = document.getElementById('theme');
  const paint = () => { const d = root.dataset.theme === 'dark'; tbtn.setAttribute('aria-pressed', d); tbtn.setAttribute('aria-label', d ? 'Switch to light mode' : 'Switch to dark mode'); };
  paint();
  tbtn.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('theme', root.dataset.theme); } catch (e) {}
    paint();
  });

  const menu = $('.menu-btn')[0], nav = $('.nav')[0];
  const setMenu = o => { nav.classList.toggle('open', o); menu.setAttribute('aria-expanded', o); };
  menu.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
  nav.addEventListener('click', e => e.target.closest('a') && setMenu(false));
  document.addEventListener('click', e => {
    if (nav.classList.contains('open') && !nav.contains(e.target) && !menu.contains(e.target)) setMenu(false);
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
  matchMedia('(min-width:961px)').addEventListener('change', e => { if (e.matches) setMenu(false); });

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

  const track = document.getElementById('track'), slides = $('.slide', track), dots = document.getElementById('dots');
  let i = 0, timer;
  slides.forEach((s, k) => { const b = document.createElement('button'); b.type = 'button'; b.setAttribute('role', 'tab'); b.setAttribute('aria-label', 'Show ' + s.dataset.title); b.addEventListener('click', () => { go(k); restart(); }); dots.appendChild(b); });
  const go = k => { i = (k + slides.length) % slides.length; track.style.transform = `translateX(-${i * 100}%)`; $('button', dots).forEach((b, j) => b.setAttribute('aria-selected', j === i)); slides.forEach((s, j) => s.toggleAttribute('inert', j !== i)); };
  const restart = () => { clearInterval(timer); if (!reduce) timer = setInterval(() => go(i + 1), 7000); };
  document.getElementById('prev').addEventListener('click', () => { go(i - 1); restart(); });
  document.getElementById('next').addEventListener('click', () => { go(i + 1); restart(); });
  const car = document.getElementById('car');
  car.addEventListener('pointerenter', () => clearInterval(timer)); car.addEventListener('pointerleave', restart); car.addEventListener('focusin', () => clearInterval(timer));
  go(0); restart();

  const dlg = document.getElementById('dlg'), dt = document.getElementById('dt'), db = document.getElementById('db'), dh = document.getElementById('dh');
  const open = (title, col, html) => { dt.textContent = title; dh.className = 'dh ' + col; db.innerHTML = html; db.scrollTop = 0; dlg.showModal(); root.classList.add('lock'); };
  dlg.addEventListener('close', () => root.classList.remove('lock'));
  document.getElementById('dx').addEventListener('click', () => dlg.close());
  dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
  $('.more-btn').forEach(b => b.addEventListener('click', () => { const s = b.closest('.slide'); open(s.dataset.title, s.dataset.col, $('.more', s)[0].innerHTML); }));
  const cols = ['pink', 'lime', 'purple'];
  $('.ctile').forEach((b, k) => b.addEventListener('click', () => open('Certificate', cols[k % 3],
    `<div class="ph cd-img" role="img" aria-label="Certificate image placeholder"><span>Certificate image placeholder</span></div><h3 class="full">${b.dataset.title}</h3><p class="cd-meta"><span class="tag lime">${b.dataset.year}</span><span>${b.dataset.issuer}</span></p><div class="btns"><span class="btn lime dis" aria-disabled="true">View Certificate: N/A</span></div>`)));

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
})();
