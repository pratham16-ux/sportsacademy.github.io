// Coach side: roster (add / search / drop), sessions, attendance marking, squad messages.
// In-memory for the demo — wire to a backend later.

document.addEventListener('dash:ready', () => {
  const { session, toast, set } = window.StacklyDash;
  let nextId = 100;

  let roster = [
    { id: ++nextId, name: 'Aarav Nair',   batch: 'U-16',   att: 94, rating: 8.1 },
    { id: ++nextId, name: 'Diya Sharma',  batch: 'U-16',   att: 88, rating: 7.6 },
    { id: ++nextId, name: 'Kabir Reddy',  batch: 'Senior', att: 79, rating: 8.4 },
    { id: ++nextId, name: 'Ishaan Gupta', batch: 'U-16',   att: 91, rating: 7.2 },
    { id: ++nextId, name: 'Ananya Rao',   batch: 'Senior', att: 96, rating: 8.8 },
    { id: ++nextId, name: 'Vihaan Mehta', batch: 'U-16',   att: 72, rating: 6.9 },
    { id: ++nextId, name: 'Saanvi Iyer',  batch: 'Senior', att: 85, rating: 7.9 }
  ];

  let sessions = [
    { id: ++nextId, title: 'Acceleration block',       when: 'Mon · 6:00am', loc: 'Hebbal Grounds', today: true  },
    { id: ++nextId, title: 'Speed endurance',          when: 'Wed · 6:00am', loc: 'Hebbal Grounds', today: false },
    { id: ++nextId, title: 'Strength & conditioning',  when: 'Fri · 6:00am', loc: 'S&C Lab',        today: false },
    { id: ++nextId, title: 'Technique review (filmed)',when: 'Sat · 7:00am', loc: 'Hebbal Grounds', today: false }
  ];

  // today's register — default everyone in
  const marked = {};
  roster.forEach(a => marked[a.id] = 'present');

  const messages = [];

  // ----- validation helpers -----
  function isAlphaOnly(value) {
    return /^[A-Za-z ]+$/.test(value);
  }

  function isValidProfileName(value) {
    return /^[A-Za-z ]{1,16}$/.test(value);
  }

  function isValidPhone(value) {
    return /^\d{10}$/.test(value);
  }

  // little helper: green if great, gold if okay, red if low
  const attClass = n => n >= 90 ? 'pill-green' : n >= 80 ? 'pill-gold' : 'pill-red';

  function drawOverview() {
    set('ovSquadSize', roster.length);
    set('navRoster', roster.length);
    set('ovWeekSessions', sessions.length);
    const avg = Math.round(roster.reduce((s, a) => s + a.att, 0) / roster.length);
    set('ovAvgAtt', avg + '%');

    const today = document.getElementById('ovTodayList');
    const todays = sessions.filter(s => s.today);
    today.innerHTML = todays.length ? '' : '<div class="empty">No sessions today.</div>';
    todays.forEach(s => {
      const r = document.createElement('div');
      r.className = 'list-row';
      r.innerHTML = `
        <span class="list-when">${s.when.split(' · ')[1]}</span>
        <div class="list-main"><strong>${s.title}</strong><span>${s.loc}</span></div>
        <div class="list-action"><span class="pill pill-gold">Today</span></div>`;
      today.appendChild(r);
    });

    // who needs an eye on them — three lowest attendances
    const watch = [...roster].sort((a, b) => a.att - b.att).slice(0, 3);
    const list = document.getElementById('ovWatchList');
    list.innerHTML = '';
    watch.forEach(a => {
      const r = document.createElement('div');
      r.className = 'list-row';
      r.innerHTML = `
        <div class="list-main"><strong>${a.name}</strong><span>${a.batch} · rating ${a.rating}</span></div>
        <div class="list-action"><span class="pill ${a.att < 80 ? 'pill-red' : 'pill-gold'}">${a.att}% present</span></div>`;
      list.appendChild(r);
    });
  }

  function drawRoster(q = '') {
    const tb = document.getElementById('rosterTable');
    const hits = roster.filter(a => a.name.toLowerCase().includes(q.toLowerCase()));
    if (!hits.length) {
      tb.innerHTML = '<tr><td colspan="5"><div class="empty">No athletes match that search.</div></td></tr>';
      return;
    }
    tb.innerHTML = '';
    hits.forEach(a => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="name-cell">${a.name}</td>
        <td><span class="pill pill-grey">${a.batch}</span></td>
        <td><span class="pill ${attClass(a.att)}">${a.att}%</span></td>
        <td>${a.rating}</td>
        <td></td>`;
      const drop = document.createElement('button');
      drop.className = 'btn btn-ghost btn-sm';
      drop.textContent = 'Remove';
      drop.addEventListener('click', () => {
        window.location.href = '404.html';
      });
      tr.lastElementChild.appendChild(drop);
      tb.appendChild(tr);
    });
  }

  document.getElementById('rosterSearch').addEventListener('input', e => drawRoster(e.target.value));

  document.getElementById('addAthleteForm').addEventListener('submit', e => {
    e.preventDefault();

    const name = document.getElementById('aa-name').value.trim();

    if (!name) {
      return toast("Enter athlete name");
    }

    if (!isAlphaOnly(name)) {
      return toast("Name must contain alphabets only");
    }

    const batch = document.getElementById('aa-batch').value;

    const a = {
      id: ++nextId,
      name,
      batch,
      att: 100,
      rating: 6.5
    };

    roster.push(a);
    marked[a.id] = 'present';

    document.getElementById('aa-name').value = '';
    document.getElementById('rosterSearch').value = '';

    drawRoster();
    drawMark();
    drawOverview();

    toast(`${name} added successfully`);
  });

  function drawSessions() {
    const list = document.getElementById('sessionList');
    if (!sessions.length) { list.innerHTML = '<div class="empty">No sessions scheduled.</div>'; return; }
    list.innerHTML = '';
    sessions.forEach(s => {
      const r = document.createElement('div');
      r.className = 'list-row';
      r.innerHTML = `
        <span class="list-when">${s.when}</span>
        <div class="list-main"><strong>${s.title}</strong><span>${s.loc}</span></div>
        <div class="list-action"></div>`;
      const action = r.querySelector('.list-action');
      if (s.today) {
        const tag = document.createElement('span');
        tag.className = 'pill pill-gold';
        tag.style.marginRight = '0.6em';
        tag.textContent = 'Today';
        action.appendChild(tag);
      }
      const cancel = document.createElement('button');
      cancel.className = 'btn btn-ghost btn-sm';
      cancel.textContent = 'Cancel';
      cancel.addEventListener('click', () => {
        sessions = sessions.filter(x => x.id !== s.id);
        drawSessions();
        drawOverview();
        toast('Session cancelled');
      });
      action.appendChild(cancel);
      list.appendChild(r);
    });
  }

  document.getElementById('addSessionForm').addEventListener('submit', e => {
    e.preventDefault();

    const title = document.getElementById('se-title').value.trim();

    if (!title) {
      return toast('Give the session a focus first');
    }

    if (!isAlphaOnly(title)) {
      return toast('Focus must contain alphabets only');
    }

    const day = document.getElementById('se-day').value;

    const [h, m] =
      document.getElementById('se-time').value.split(':');

    const hr = +h;

    const when =
      `${day} · ${((hr + 11) % 12) + 1}:${m}${hr >= 12 ? 'pm' : 'am'}`;

    sessions.push({
      id: ++nextId,
      title,
      when,
      loc: document.getElementById('se-loc').value,
      today: false
    });

    document.getElementById('se-title').value = '';

    drawSessions();
    drawOverview();

    toast('Session added successfully');
  });

  function drawMark() {
    const tb = document.getElementById('markAttTable');
    tb.innerHTML = '';
    roster.forEach(a => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="name-cell">${a.name}</td>
        <td><span class="pill pill-grey">${a.batch}</span></td>
        <td style="text-align:right;"></td>`;
      const here = marked[a.id] || 'present';
      const toggle = document.createElement('span');
      toggle.className = 'att-toggle';
      toggle.innerHTML = `
        <button type="button" data-val="present" class="${here === 'present' ? 'is-on' : ''}">Present</button>
        <button type="button" data-val="absent" class="${here === 'absent' ? 'is-on' : ''}">Absent</button>`;
      toggle.querySelectorAll('button').forEach(b => {
        b.addEventListener('click', () => {
          marked[a.id] = b.dataset.val;
          toggle.querySelectorAll('button').forEach(x => x.classList.remove('is-on'));
          b.classList.add('is-on');
        });
      });
      tr.lastElementChild.appendChild(toggle);
      tb.appendChild(tr);
    });
  }

  document.getElementById('saveAttBtn').addEventListener('click', () => {
    const absent = roster.filter(a => marked[a.id] === 'absent').length;
    toast(`Attendance saved · ${roster.length - absent} present, ${absent} absent`);
  });

  function drawMessages() {
    const list = document.getElementById('msgList');
    if (!messages.length) { list.innerHTML = '<div class="empty">No messages sent yet.</div>'; return; }
    list.innerHTML = '';
    messages.forEach(m => {
      const r = document.createElement('div');
      r.className = 'list-row';
      r.innerHTML = `
        <div class="list-main"><strong>To: ${m.to === 'all' ? 'Whole squad' : m.to + ' batch'}</strong><span>${m.body}</span></div>
        <div class="list-action"><span class="pill pill-green">Sent</span></div>`;
      list.appendChild(r);
    });
  }

  document.getElementById('msgForm').addEventListener('submit', e => {
    e.preventDefault();

    const body =
      document.getElementById('msg-body').value.trim();

    if (!body) {
      return toast('Enter a message');
    }

    const to =
      document.getElementById('msg-to').value;

    messages.unshift({
      to,
      body
    });

    document.getElementById('msg-body').value = '';

    drawMessages();

    toast('Message sent successfully');
  });

  // profile
  document.getElementById('pf-name').value = session.name || '';
  document.getElementById('pf-email').value = session.email || '';

  document.getElementById('profileForm').addEventListener('submit', e => {
    e.preventDefault();

    const name =
      document.getElementById('pf-name').value.trim();

    const phone =
      document.getElementById('pf-phone').value.trim();

    if (!name) {
      return toast('Enter full name');
    }

    if (!isValidProfileName(name)) {
      return toast(
        'Full name should contain only alphabets and maximum 16 characters'
      );
    }

    if (!isValidPhone(phone)) {
      return toast(
        'Phone number must be exactly 10 digits'
      );
    }

    const emergency =
      document.getElementById('pf-emergency');

    if (
      emergency &&
      !isValidPhone(emergency.value.trim())
    ) {
      return toast(
        'Emergency contact must be exactly 10 digits'
      );
    }

    session.name = name;

    set('acctName', name);

    set(
      'welcomeName',
      'Welcome back, ' + name.split(' ')[0]
    );

    const p = name.split(/\s+/);

    document.getElementById('acctAvatar').textContent =
      (
        p[0][0] +
        (p[1] ? p[1][0] : '')
      ).toUpperCase();

    toast('Profile saved successfully');
  });

  // ----- live validation (filter as the user types) -----
  document.getElementById('aa-name')?.addEventListener('input', function () {
    this.value = this.value.replace(/[^A-Za-z ]/g, '');
  });

  document.getElementById('se-title')?.addEventListener('input', function () {
    this.value = this.value.replace(/[^A-Za-z ]/g, '');
  });

  document.getElementById('pf-name')?.addEventListener('input', function () {
    this.value = this.value.replace(/[^A-Za-z ]/g, '').slice(0, 16);
  });

  document.getElementById('pf-phone')?.addEventListener('input', function () {
    this.value = this.value.replace(/\D/g, '').slice(0, 10);
  });

  const emergencyField = document.getElementById('pf-emergency');
  if (emergencyField) {
    emergencyField.addEventListener('input', function () {
      this.value = this.value.replace(/\D/g, '').slice(0, 10);
    });
  }

  drawOverview();
  drawRoster();
  drawSessions();
  drawMark();
  drawMessages();
});