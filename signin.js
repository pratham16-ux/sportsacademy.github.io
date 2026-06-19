// sign-in: pick a role, validate, stash the session, send them to the right dashboard.
// no real backend yet — sessionStorage is enough for the demo.

const AUTH_KEY = 'stacklyAuth';

const form     = document.getElementById('signinForm');
const email    = document.getElementById('email');
const pass     = document.getElementById('password');
const btn      = document.getElementById('signinBtn');
const roleBtns = document.querySelectorAll('.role-opt');

let role = 'member';

function setRole(next) {
  role = next;
  roleBtns.forEach(b => {
    const on = b.dataset.role === role;
    b.classList.toggle('is-active', on);
    b.setAttribute('aria-selected', String(on));
  });
  btn.textContent = role === 'coach' ? 'Sign in as Coach' : 'Sign in as Member';
  if (!email.value.trim()) {
    email.placeholder = role === 'coach' ? 'coach@stacklysports.in' : 'member@stacklysports.in';
  }
}

roleBtns.forEach(b => {
  b.addEventListener('click', () => setRole(b.dataset.role));
});

// arriving from sign-up with ?role=coach? start on the right tab.
if (new URLSearchParams(location.search).get('role') === 'coach') setRole('coach');

// show / hide the password
document.getElementById('pwdToggle').addEventListener('click', e => {
  const hidden = pass.type === 'password';
  pass.type = hidden ? 'text' : 'password';
  e.currentTarget.textContent = hidden ? 'Hide' : 'Show';
});

// forgot-password link — no reset flow yet, so point them at the front desk.
// guarded so a missing/renamed link can't take the whole script down.
const forgot = document.getElementById('forgotLink') || document.querySelector('.auth-link');
if (forgot) {
  forgot.addEventListener('click', e => {
    e.preventDefault();
    alert('Password resets go through the front desk for now — give us a call on +91 98765 43210.');
  });
}

// clear the red as soon as they start fixing the field
[email, pass].forEach(el => {
  el.addEventListener('input', () => {
    el.classList.remove('is-invalid');
    el.closest('.auth-field').querySelector('.auth-error').textContent = '';
  });
});

const emailLooksOk = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

// "ravi.kumar@..." -> "Ravi Kumar" for the greeting
function nameFromEmail(addr) {
  const local = addr.split('@')[0].replace(/[._-]+/g, ' ').trim();
  if (!local || local === 'member' || local === 'coach') {
    return role === 'coach' ? 'Coach' : 'Athlete';
  }
  return local.replace(/\b\w/g, c => c.toUpperCase());
}

form.addEventListener('submit', e => {
  e.preventDefault();

  const addr = email.value.trim();
  let ok = true;

  if (!addr) ok = flag(email, 'Enter your email address.');
  else if (!emailLooksOk(addr)) ok = flag(email, "That doesn't look like a valid email.");

  if (!pass.value) ok = flag(pass, 'Enter your password.');
  else if (pass.value.length < 6) ok = flag(pass, 'Password needs at least 6 characters.');

  if (!ok) return;

  btn.disabled = true;
  btn.textContent = 'Signing in…';

  const session = {
    email: addr,
    role,
    name: nameFromEmail(addr),
    remember: document.getElementById('remember').checked,
    loginAt: new Date().toISOString()
  };

  // small pause so the button state actually registers
  setTimeout(() => {
    try {
      sessionStorage.setItem(AUTH_KEY, JSON.stringify(session));
    } catch (err) {
      alert("Couldn't start a session — storage looks blocked. Try a normal (non-private) window.");
      btn.disabled = false;
      btn.textContent = role === 'coach' ? 'Sign in as Coach' : 'Sign in as Member';
      return;
    }
    location.href = role === 'coach' ? 'coach-dashboard.html' : 'member-dashboard.html';
  }, 650);
});

function flag(input, msg) {
  input.classList.add('is-invalid');
  input.closest('.auth-field').querySelector('.auth-error').textContent = msg;
  return false;
}