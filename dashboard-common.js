// Shared bits both dashboards lean on: the session gate, showing who's logged in,
// flipping between panels, the mobile sidebar, logout, and a little toast.
// Whatever the page script needs, it grabs off window.StacklyDash.

(() => {
  const AUTH_KEY = 'stacklyAuth';

  // --- are they even logged in? ---
  let session;
  try { session = JSON.parse(sessionStorage.getItem(AUTH_KEY) || 'null'); }
  catch { session = null; }

  const wantRole = document.body.dataset.role
    || (location.pathname.includes('coach') ? 'coach' : 'member');

  if (!session || !session.email) {
    location.replace('signin.html');          // not logged in -> back to the gate
    return;
  }
  if (session.role && session.role !== wantRole) {
    // logged in, wrong door — send them to their own dashboard
    location.replace(session.role === 'coach' ? 'coach-dashboard.html' : 'member-dashboard.html');
    return;
  }

  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

  const initials = name => {
    const p = (name || '').trim().split(/\s+/);
    if (!p[0]) return wantRole === 'coach' ? 'C' : 'M';
    return (p[0][0] + (p[1] ? p[1][0] : '')).toUpperCase();
  };

  // drop the identity into the topbar + welcome banner (this is where the email shows)
  const first = (session.name || '').split(' ')[0];
  set('acctName', session.name || (wantRole === 'coach' ? 'Coach' : 'Member'));
  set('acctEmail', session.email);
  set('welcomeEmail', session.email);
  set('welcomeName', 'Welcome back' + (first ? ', ' + first : ''));
  const avatar = document.getElementById('acctAvatar');
  if (avatar) avatar.textContent = initials(session.name);

  // --- panel switching ---
  const navBtns = [...document.querySelectorAll('.dash-nav-btn[data-panel]')];
  const panels  = [...document.querySelectorAll('.panel[data-panel]')];
  const titleEl = document.getElementById('pageTitle');

  function showPanel(name) {
    navBtns.forEach(b => b.classList.toggle('is-active', b.dataset.panel === name));
    panels.forEach(p => p.classList.toggle('is-active', p.dataset.panel === name));

    const active = navBtns.find(b => b.dataset.panel === name);
    if (active && titleEl) {
      // first real word in the button, skipping the svg and any badge number
      const label = active.textContent.split('\n').map(s => s.trim())
        .find(s => s && !/^[0-9!]+$/.test(s));
      titleEl.textContent = label || name;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    closeSide();
  }
  navBtns.forEach(b => b.addEventListener('click', () => showPanel(b.dataset.panel)));

  // --- mobile sidebar ---
  const side  = document.getElementById('dashSide');
  const scrim = document.getElementById('dashScrim');
  const openSide  = () => { side?.classList.add('is-open'); scrim?.classList.add('is-show'); };
  function closeSide() { side?.classList.remove('is-open'); scrim?.classList.remove('is-show'); }
  document.getElementById('dashBurger')?.addEventListener('click', openSide);
  scrim?.addEventListener('click', closeSide);

  // --- logout ---
  document.getElementById('logoutBtn')?.addEventListener('click', () => {
    sessionStorage.removeItem(AUTH_KEY);
    location.href = 'signin.html';
  });

  // --- toast ---
  const toastEl = document.getElementById('toast');
  let toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('is-show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('is-show'), 2600);
  }

  window.StacklyDash = { session, showPanel, toast, set };
  document.dispatchEvent(new CustomEvent('dash:ready'));
})();