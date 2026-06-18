// Member side: schedule + RSVP, attendance, progress bars, fees, profile.
// All in-memory demo data for now. TODO: swap these arrays for real API calls.

document.addEventListener('dash:ready', () => {
  const { session, toast, set } = window.StacklyDash;
  const inr = n => '₹' + Number(n).toLocaleString('en-IN');

  let schedule = [
    { id: 1, when: 'Mon · 6:00am', title: 'Track — sprints block',      loc: 'Hebbal Grounds · Lane 4', coach: 'Coach Meera', rsvp: 'going' },
    { id: 2, when: 'Wed · 6:00am', title: 'Track — speed endurance',    loc: 'Hebbal Grounds · Lane 4', coach: 'Coach Meera', rsvp: 'going' },
    { id: 3, when: 'Fri · 6:00am', title: 'Strength & conditioning',    loc: 'S&C Lab',                 coach: 'Coach Arjun', rsvp: 'none'  },
    { id: 4, when: 'Sat · 7:00am', title: 'Technique review (filmed)',  loc: 'Hebbal Grounds',          coach: 'Coach Meera', rsvp: 'none'  }
  ];

  const attendance = [
    { date: '14 Jun', session: 'Track — sprints',    coach: 'Meera', present: true  },
    { date: '12 Jun', session: 'Speed endurance',    coach: 'Meera', present: true  },
    { date: '10 Jun', session: 'S&C',                coach: 'Arjun', present: true  },
    { date: '08 Jun', session: 'Technique review',   coach: 'Meera', present: false },
    { date: '07 Jun', session: 'Track — sprints',    coach: 'Meera', present: true  },
    { date: '05 Jun', session: 'Speed endurance',    coach: 'Meera', present: true  },
    { date: '03 Jun', session: 'S&C',                coach: 'Arjun', present: true  },
    { date: '01 Jun', session: 'Track — sprints',    coach: 'Meera', present: true  }
  ];

  const progress = [
    ['Block start reaction', 82],
    ['Acceleration (0–30m)', 74],
    ['Top speed mechanics', 68],
    ['Endurance base', 60],
    ['Flexibility & mobility', 88]
  ];

  let payments = [
    { inv: 'INV-2406', period: 'Jun 2026', amount: 4500, paid: false },
    { inv: 'INV-2405', period: 'May 2026', amount: 4500, paid: true  },
    { inv: 'INV-2404', period: 'Apr 2026', amount: 4500, paid: true  },
    { inv: 'INV-2403', period: 'Mar 2026', amount: 4500, paid: true  }
  ];

  const rsvpPill = s =>
    s === 'going' ? '<span class="pill pill-green">Going</span>'
    : '<span class="pill pill-grey">No reply</span>';

  function row(s, readonly) {
    const el = document.createElement('div');
    el.className = 'list-row';
    el.innerHTML = `
      <span class="list-when">${s.when}</span>
      <div class="list-main"><strong>${s.title}</strong><span>${s.loc} · ${s.coach}</span></div>
      <div class="list-action"></div>`;
    const action = el.querySelector('.list-action');

    if (readonly) {
      action.innerHTML = rsvpPill(s.rsvp);
    } else {
      const b = document.createElement('button');
      b.className = 'btn btn-sm ' + (s.rsvp === 'going' ? 'btn-primary' : 'btn-ghost');
      b.textContent = s.rsvp === 'going' ? 'Going ✓' : "I'll be there";
      // RSVP buttons take the member to the (placeholder) booking page
      b.addEventListener('click', () => { window.location.href = '404.html'; });
      action.appendChild(b);
    }
    return el;
  }

  function drawOverview() {
    const present = attendance.filter(a => a.present).length;
    set('ovAttendance', Math.round(present / attendance.length * 100) + '%');
    set('ovSessions', schedule.length);

    const next = document.getElementById('ovNextList');
    next.innerHTML = '';
    schedule.slice(0, 3).forEach(s => next.appendChild(row(s, true)));
  }

  function drawSchedule() {
    const list = document.getElementById('scheduleList');
    list.innerHTML = '';
    schedule.forEach(s => list.appendChild(row(s, false)));
  }

  function drawAttendance() {
    document.getElementById('attTable').innerHTML = attendance.map(a => `
      <tr>
        <td>${a.date}</td>
        <td class="name-cell">${a.session}</td>
        <td>Coach ${a.coach}</td>
        <td>${a.present ? '<span class="pill pill-green">Present</span>' : '<span class="pill pill-red">Absent</span>'}</td>
      </tr>`).join('');
  }

  function drawProgress() {
    const wrap = document.getElementById('progList');
    wrap.innerHTML = '';
    progress.forEach(([skill, val]) => {
      const item = document.createElement('div');
      item.className = 'prog-item';
      item.innerHTML = `
        <div class="prog-top"><strong>${skill}</strong><span>${val}%</span></div>
        <div class="prog-track"><div class="prog-fill"></div></div>`;
      wrap.appendChild(item);
      requestAnimationFrame(() => item.querySelector('.prog-fill').style.width = val + '%');
    });
  }

  function drawPayments() {
    const tb = document.getElementById('payTable');
    tb.innerHTML = '';
    payments.forEach(p => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="name-cell">${p.inv}</td>
        <td>${p.period}</td>
        <td>${inr(p.amount)}</td>
        <td>${p.paid ? '<span class="pill pill-green">Paid</span>' : '<span class="pill pill-red">Due</span>'}</td>
        <td></td>`;
      const cell = tr.lastElementChild;

      const btn = document.createElement('button');
      if (!p.paid) {
        btn.className = 'btn btn-gold btn-sm';
        btn.textContent = 'Pay now';
      } else {
        btn.className = 'btn btn-ghost btn-sm';
        btn.textContent = 'Receipt';
      }
      // both Pay now and Receipt go to the (placeholder) billing page
      btn.addEventListener('click', () => { window.location.href = '404.html'; });
      cell.appendChild(btn);

      tb.appendChild(tr);
    });
  }

  function setupProfile() {
    const nameI  = document.getElementById('pf-name');
    const phoneI = document.getElementById('pf-phone');
    const emergI = document.getElementById('pf-emergency');

    nameI.value = session.name || '';
    document.getElementById('pf-email').value = session.email || '';

    // ----- live filtering as they type -----
    // name: letters only, max 16
    nameI.addEventListener('input', () => {
      nameI.value = nameI.value.replace(/[^A-Za-z]/g, '').slice(0, 16);
    });
    // phone + emergency: digits only, max 10
    [phoneI, emergI].forEach(el => {
      el.addEventListener('input', () => {
        el.value = el.value.replace(/\D/g, '').slice(0, 10);
        el.classList.remove('is-invalid');
      });
    });
    nameI.addEventListener('input', () => nameI.classList.remove('is-invalid'));

    document.getElementById('profileForm').addEventListener('submit', e => {
      e.preventDefault();

      const name  = nameI.value.trim();
      const phone = phoneI.value.trim();
      const emerg = emergI.value.trim();

      const nameBad  = !/^[A-Za-z]{1,16}$/.test(name);
      const phoneBad = !/^\d{10}$/.test(phone);
      const emergBad = !/^\d{10}$/.test(emerg);

      nameI.classList.toggle('is-invalid', nameBad);
      phoneI.classList.toggle('is-invalid', phoneBad);
      emergI.classList.toggle('is-invalid', emergBad);

      // show the first problem in the toast (no alert), stop the save
      if (nameBad)  { nameI.focus();  return toast('Name: letters only, up to 16 characters'); }
      if (phoneBad) { phoneI.focus(); return toast('Phone must be exactly 10 digits'); }
      if (emergBad) { emergI.focus(); return toast('Emergency contact must be exactly 10 digits'); }

      // all good — apply and confirm
      session.name = name;
      set('acctName', name);
      set('welcomeName', 'Welcome back, ' + name.split(/\s+/)[0]);
      const p = name.split(/\s+/);
      document.getElementById('acctAvatar').textContent =
        (p[0][0] + (p[1] ? p[1][0] : '')).toUpperCase();
      toast('Profile saved');
    });
  }

  function badges() {
    set('navUpcoming', schedule.filter(s => s.rsvp === 'going').length);
    const due = document.getElementById('navDue');
    if (due) due.style.display = payments.some(p => !p.paid) ? '' : 'none';
  }

  drawOverview();
  drawSchedule();
  drawAttendance();
  drawProgress();
  drawPayments();
  setupProfile();
  badges();
});

document.addEventListener('DOMContentLoaded', () => {

  document.querySelectorAll(
    '#scheduleList button, #payTable button'
  ).forEach(btn => {

    btn.addEventListener('click', e => {
      e.preventDefault();
      window.location.assign('./404.html');
    });

  });

});