// sign-in: pick a role, validate, stash the session, send them to the right dashboard.
// no real backend yet — sessionStorage is enough for the demo.

const AUTH_KEY = 'stacklyAuth';

const form   = document.getElementById('signinForm');
const email  = document.getElementById('email');
const pass   = document.getElementById('password');
const btn    = document.getElementById('signinBtn');
const roleBtns = document.querySelectorAll('.role-opt');

let role = 'member';

roleBtns.forEach(b => {
  b.onclick = () => {
    roleBtns.forEach(x => { x.classList.remove('is-active'); x.setAttribute('aria-selected', 'false'); });
    b.classList.add('is-active');
    b.setAttribute('aria-selected', 'true');
    role = b.dataset.role;
    btn.textContent = role === 'coach' ? 'Sign in as Coach' : 'Sign in as Member';
    if (!email.value.trim()) {
      email.placeholder = role === 'coach' ? 'coach@stacklysports.in' : 'member@stacklysports.in';
    }
  };
});

// show / hide the password
document.getElementById('pwdToggle').addEventListener('click', e => {
  const hidden = pass.type === 'password';
  pass.type = hidden ? 'text' : 'password';
  e.target.textContent = hidden ? 'Hide' : 'Show';
});

document.getElementById('forgotLink').addEventListener('click', e => {
  e.preventDefault();
  alert('Password resets go through the front desk for now — give us a call on +91 98765 43210.');
});

// clear the red as soon as they start fixing the field
[email, pass].forEach(el => {
  el.addEventListener('input', () => {
    el.classList.remove('has-error');
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
  input.classList.add('has-error');
  input.closest('.auth-field').querySelector('.auth-error').textContent = msg;
  return false;
}