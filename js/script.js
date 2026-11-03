(() => {
  'use strict';
  const DAY = 864e5;
  const day = n => { const d = new Date(); d.setDate(d.getDate() + n); d.setHours(10, 0, 0, 0); return d.toISOString(); };
  const EVENTS = [
    { id: 1, name: 'DevSphere Web Summit', cat: 'Tech', date: day(9), venue: 'KIIT Convention Centre, Bhubaneswar', seats: 120, price: 'Free',
      desc: 'A day of talks on modern front-end development.',
      long: 'Hear from engineers building fast, accessible products. Sessions cover responsive design, JavaScript performance, React and deployment on Vercel and Netlify. Includes a live code-review hour and a networking lunch.' },
    { id: 2, name: 'Sunset Sitar Sessions', cat: 'Music', date: day(14), venue: 'Rabindra Mandap, Bhubaneswar', seats: 300, price: '₹299',
      desc: 'An evening of classical and fusion sitar.',
      long: 'Three artists, one open-air stage. Expect classical ragas that slide into contemporary fusion. Gates open at 5 PM; seating is first-come, first-served.' },
    { id: 3, name: 'Pottery for Beginners', cat: 'Workshop', date: day(18), venue: 'Clay Studio, Saheed Nagar', seats: 18, price: '₹799',
      desc: 'Shape your first bowl on the wheel.',
      long: 'A relaxed three-hour class. You will centre clay, throw a bowl and take home a glazed piece two weeks later. Materials and aprons are provided.' },
    { id: 4, name: 'Startup Pitch Night', cat: 'Business', date: day(23), venue: 'Startup Odisha Hub, Bhubaneswar', seats: 80, price: 'Free',
      desc: 'Ten founders. Five minutes each. Real feedback.',
      long: 'Watch early-stage teams pitch to a panel of investors and mentors, then vote for the audience favourite. Open mic for questions after each pitch.' },
    { id: 5, name: 'City Half Marathon', cat: 'Sports', date: day(31), venue: 'Marine Drive Start Line, Puri', seats: 500, price: '₹499',
      desc: '21 km along the coast, with 5 km and 10 km options.',
      long: 'Chip-timed race along the Puri coastline. Registration includes a tee, a finisher medal, hydration points every 2 km and a post-race breakfast.' },
    { id: 6, name: 'Street Art Walk', cat: 'Art', date: day(36), venue: 'Old Town, Bhubaneswar', seats: 30, price: 'Free',
      desc: 'A guided walk through the city\'s best murals.',
      long: 'Walk two kilometres with a local muralist who explains the stories behind each piece. Bring comfortable shoes and water. Photography is welcome.' },
    { id: 7, name: 'AI for Everyone Workshop', cat: 'Workshop', date: day(42), venue: 'Online (Zoom)', seats: 200, price: 'Free',
      desc: 'Hands-on intro to using AI tools in daily work.',
      long: 'A practical two-hour session. You will learn how to write good prompts, check outputs and use AI safely for study and work. No coding needed.' },
    { id: 8, name: 'Indie Band Night', cat: 'Music', date: day(48), venue: 'The Loft, Patia', seats: 150, price: '₹399',
      desc: 'Four local bands, one loud night.',
      long: 'Doors open at 6 PM. Four sets of original music from Odisha\'s indie scene, plus food stalls and a merch corner.' },
    { id: 9, name: 'Women in Tech Meetup', cat: 'Tech', date: day(55), venue: 'Infocity, Bhubaneswar', seats: 60, price: 'Free',
      desc: 'Panel, mentoring circles and a career Q&A.',
      long: 'A welcoming meetup for students and professionals. Join mentoring circles with senior engineers and pick up tips for interviews and portfolios.' }
  ];
  const STORE = 'gather.registrations';
  const $ = s => document.querySelector(s);
  const grid = $('#grid'), modal = $('#modal'), mBody = $('#mBody');
  let cat = 'All', query = '', timerId;

  /* ---------- storage ---------- */
  const load = () => { try { return JSON.parse(localStorage.getItem(STORE)) || []; } catch { return []; } };
  const save = list => { try { localStorage.setItem(STORE, JSON.stringify(list)); } catch {} };
  const taken = id => load().filter(r => r.eventId === id).length;
  const seatsLeft = e => Math.max(0, e.seats - taken(e.id));

  /* ---------- helpers ---------- */
  const fmtDate = iso => new Date(iso).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  const fmtTime = iso => new Date(iso).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });
  const img = e => `https://picsum.photos/seed/${encodeURIComponent(e.name)}/640/400`;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const upcoming = () => EVENTS.filter(e => new Date(e.date) > Date.now()).sort((a, b) => new Date(a.date) - new Date(b.date));

  /* ---------- theme ---------- */
  const setTheme = t => {
    document.documentElement.dataset.theme = t;
    const b = $('#themeBtn');
    b.textContent = t === 'dark' ? 'Light' : 'Dark';
    b.setAttribute('aria-label', `Switch to ${t === 'dark' ? 'light' : 'dark'} mode`);
    try { localStorage.setItem('gather.theme', t); } catch {}
  };
  let saved = null; try { saved = localStorage.getItem('gather.theme'); } catch {}
  setTheme(saved || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
  $('#themeBtn').onclick = () => setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
  $('#menuBtn').onclick = e => {
    const open = $('#menu').classList.toggle('open');
    e.currentTarget.setAttribute('aria-expanded', open);
  };
  $('#menu').onclick = e => { if (e.target.closest('a')) $('#menu').classList.remove('open'); };

  /* ---------- countdown ---------- */
  const countdown = iso => {
    let ms = Math.max(0, new Date(iso) - Date.now());
    const d = Math.floor(ms / DAY); ms -= d * DAY;
    const h = Math.floor(ms / 36e5); ms -= h * 36e5;
    const m = Math.floor(ms / 6e4), s = Math.floor((ms - m * 6e4) / 1e3);
    return [['Days', d], ['Hours', h], ['Mins', m], ['Secs', s]]
      .map(([l, v]) => `<div><b>${String(v).padStart(2, '0')}</b><span>${l}</span></div>`).join('');
  };
  function renderHero() {
    const next = upcoming()[0];
    if (!next) { $('#nextTitle').textContent = 'No upcoming events'; return; }
    $('#nextTitle').textContent = next.name;
    $('#nextMeta').textContent = `${fmtDate(next.date)} · ${next.venue}`;
    $('#nextBtn').onclick = () => openEvent(next.id);
    const tick = () => { $('#nextTimer').innerHTML = countdown(next.date); };
    tick(); clearInterval(timerId); timerId = setInterval(tick, 1000);
  }

  /* ---------- list, search, filter ---------- */
  function renderFilters() {
    const cats = ['All', ...new Set(EVENTS.map(e => e.cat))];
    $('#filters').innerHTML = cats.map(c => `<button class="chip" aria-pressed="${c === cat}" data-cat="${c}">${c}</button>`).join('');
  }
  function renderGrid() {
    const q = query.trim().toLowerCase();
    const list = upcoming().filter(e => (cat === 'All' || e.cat === cat) &&
      (!q || [e.name, e.venue, e.cat, e.desc].join(' ').toLowerCase().includes(q)));
    $('#count').textContent = `${list.length} event${list.length === 1 ? '' : 's'} found`;
    $('#empty').hidden = list.length > 0;
    grid.innerHTML = list.map(e => {
      const left = seatsLeft(e);
      return `<article class="card">
        <img src="${img(e)}" alt="" loading="lazy" onerror="this.removeAttribute('src')">
        <div class="card-body">
          <span class="tag">${e.cat}</span>
          <h3>${esc(e.name)}</h3>
          <p class="meta">${fmtDate(e.date)}, ${fmtTime(e.date)}<br>${esc(e.venue)}</p>
          <p class="desc">${esc(e.desc)}</p>
          <div class="card-foot">
            <span class="left">${left ? left + ' seats left' : 'Sold out'}</span>
            <button class="btn small" data-id="${e.id}">View details</button>
          </div>
        </div></article>`;
    }).join('');
  }
  $('#search').oninput = e => { query = e.target.value; renderGrid(); };
  $('#filters').onclick = e => {
    const b = e.target.closest('[data-cat]'); if (!b) return;
    cat = b.dataset.cat; renderFilters(); renderGrid();
  };
  grid.onclick = e => { const b = e.target.closest('[data-id]'); if (b) openEvent(+b.dataset.id); };
  $('#reset').onclick = () => { query = ''; cat = 'All'; $('#search').value = ''; renderFilters(); renderGrid(); };

  /* ---------- modal + registration ---------- */
  function openEvent(id) {
    const e = EVENTS.find(x => x.id === id), left = seatsLeft(e);
    mBody.innerHTML = `
      <img class="m-img" src="${img(e)}" alt="" onerror="this.removeAttribute('src')">
      <div class="m-body">
        <span class="tag">${e.cat}</span>
        <h2 id="mTitle">${esc(e.name)}</h2>
        <p>${esc(e.long)}</p>
        <div class="facts">
          <div><b>Date</b>${fmtDate(e.date)}</div>
          <div><b>Time</b>${fmtTime(e.date)}</div>
          <div><b>Venue</b>${esc(e.venue)}</div>
          <div><b>Price</b>${e.price}</div>
          <div><b>Seats left</b>${left}</div>
        </div>
        ${left ? form(e) : '<p class="error">This event is sold out.</p>'}
      </div>`;
    if (!modal.open) modal.showModal();
    modal.scrollTop = 0;
    const f = $('#regForm'); if (f) setupForm(f);
  }
  const form = e => `
    <form id="regForm" novalidate>
      <h3>Register for this event</h3>
      <div class="field"><label for="fName">Full name</label><input id="fName" name="name" autocomplete="name"><span class="error"></span></div>
      <div class="field"><label for="fEmail">Email address</label><input id="fEmail" name="email" type="email" autocomplete="email"><span class="error"></span></div>
      <div class="field"><label for="fPhone">Phone number</label><input id="fPhone" name="phone" type="tel" inputmode="numeric" placeholder="10-digit mobile number" autocomplete="tel"><span class="error"></span></div>
      <div class="field"><label for="fEvent">Selected event</label>
        <select id="fEvent" name="event">${upcoming().filter(x => seatsLeft(x)).map(x => `<option value="${x.id}" ${x.id === e.id ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}</select><span class="error"></span></div>
      <button class="btn" type="submit">Confirm registration</button>
    </form>`;
  const RULES = {
    name: v => !v.trim() ? 'Enter your full name.' : !/^[A-Za-z][A-Za-z .'-]{2,49}$/.test(v.trim()) ? 'Use 3–50 letters. Numbers and symbols are not allowed.' : '',
    email: v => !v.trim() ? 'Enter your email address.' : !/^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test(v.trim()) ? 'Enter a valid email, like name@example.com.' : '',
    phone: v => !v.trim() ? 'Enter your phone number.' : !/^[6-9]\d{9}$/.test(v.replace(/[\s-]/g, '')) ? 'Enter a 10-digit mobile number starting with 6, 7, 8 or 9.' : '',
    event: v => v ? '' : 'Choose an event.'
  };
  function setupForm(f) {
    const check = el => {
      const msg = RULES[el.name](el.value), box = el.closest('.field');
      box.querySelector('.error').textContent = msg;
      box.classList.toggle('bad', !!msg); box.classList.toggle('good', !msg);
      el.setAttribute('aria-invalid', !!msg);
      return !msg;
    };
    f.querySelectorAll('input,select').forEach(el => { el.onblur = () => check(el); el.oninput = () => el.closest('.field').classList.contains('bad') && check(el); });
    f.onsubmit = ev => {
      ev.preventDefault();
      const els = [...f.querySelectorAll('input,select')];
      const results = els.map(check);
      if (results.includes(false)) { els[results.indexOf(false)].focus(); return; }
      const data = Object.fromEntries(new FormData(f)); const id = +data.event;
      const list = load();
      if (list.some(r => r.eventId === id && r.email.toLowerCase() === data.email.trim().toLowerCase())) {
        const box = $('#fEmail').closest('.field');
        box.classList.replace('good', 'bad'); box.querySelector('.error').textContent = 'This email is already registered for this event.'; return;
      }
      if (!seatsLeft(EVENTS.find(x => x.id === id))) { alert('Sorry, this event just sold out.'); return; }
      const reg = { ref: 'GTH-' + Date.now().toString(36).toUpperCase(), eventId: id, name: data.name.trim(), email: data.email.trim(), phone: data.phone.replace(/[\s-]/g, ''), at: new Date().toISOString() };
      list.push(reg); save(list);
      confirmation(reg); renderGrid(); renderRegs();
    };
  }
  function confirmation(r) {
    const e = EVENTS.find(x => x.id === r.eventId);
    mBody.innerHTML = `<div class="done" role="status">
      <div class="tick" aria-hidden="true">✓</div>
      <h2 id="mTitle">You're registered, ${esc(r.name.split(' ')[0])}!</h2>
      <p>${esc(e.name)}<br>${fmtDate(e.date)}, ${fmtTime(e.date)}<br>${esc(e.venue)}</p>
      <p class="muted">Confirmation reference: <b>${r.ref}</b><br>Keep this reference for your records.</p>
      <button class="btn" id="doneBtn">Back to events</button></div>`;
    $('#doneBtn').onclick = () => modal.close();
  }
  $('#closeBtn').onclick = () => modal.close();
  modal.addEventListener('click', ev => { if (ev.target === modal) modal.close(); });

  /* ---------- my registrations ---------- */
  function renderRegs() {
    const list = load();
    $('#regCount').textContent = list.length;
    $('#regList').innerHTML = list.length ? list.map(r => {
      const e = EVENTS.find(x => x.id === r.eventId);
      return `<li><div><b>${esc(e.name)}</b><br><span class="meta">${fmtDate(e.date)} · ${esc(r.name)} · ${r.ref}</span></div>
        <button class="btn small ghost" data-cancel="${r.ref}">Cancel registration</button></li>`;
    }).join('') : '<li class="none">You have not registered for any events yet.</li>';
  }
  $('#regList').onclick = e => {
    const b = e.target.closest('[data-cancel]'); if (!b) return;
    if (confirm('Cancel this registration?')) { save(load().filter(r => r.ref !== b.dataset.cancel)); renderRegs(); renderGrid(); }
  };

  renderHero(); renderFilters(); renderGrid(); renderRegs();
})();
