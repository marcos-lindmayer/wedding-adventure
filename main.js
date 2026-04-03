(() => {
  // --- CANVAS: SMOKE + PARTICLES + CONFETTI ---
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const colors = ['#c5a059', '#d4af37', '#e8dbce', '#8b5e1a', '#f0d060'];

  const smokes = Array.from({ length: 18 }, () => newSmoke());
  function newSmoke() {
    return {
      x: Math.random() * window.innerWidth,
      y: window.innerHeight + 60,
      r: 40 + Math.random() * 80,
      vx: (Math.random() - 0.5) * 0.4,
      vy: -(0.3 + Math.random() * 0.5),
      alpha: 0.08 + Math.random() * 0.1,
      grow: 0.1 + Math.random() * 0.15,
    };
  }

  const edgeParticles = [];
  function spawnEdgeParticle() {
    const side = Math.floor(Math.random() * 4);
    const w = canvas.width, h = canvas.height;
    let x, y, vx, vy;
    if (side === 0) { x = Math.random() * w; y = 0; vx = (Math.random()-0.5)*1.5; vy = 1+Math.random()*2; }
    else if (side === 1) { x = w; y = Math.random() * h; vx = -(1+Math.random()*2); vy = (Math.random()-0.5)*1.5; }
    else if (side === 2) { x = Math.random() * w; y = h; vx = (Math.random()-0.5)*1.5; vy = -(1+Math.random()*2); }
    else { x = 0; y = Math.random() * h; vx = 1+Math.random()*2; vy = (Math.random()-0.5)*1.5; }
    edgeParticles.push({ x, y, vx, vy, r: 2+Math.random()*3, alpha: 1, color: colors[Math.floor(Math.random()*colors.length)], decay: 0.008+Math.random()*0.012, trail: [] });
  }

  const bursts = [];
  function spawnBurst(x, y) {
    for (let i = 0; i < 36; i++) {
      const angle = (Math.PI * 2 * i) / 36 + Math.random() * 0.3;
      const speed = 3 + Math.random() * 7;
      bursts.push({ x, y, vx: Math.cos(angle)*speed, vy: Math.sin(angle)*speed, r: 2+Math.random()*4, alpha: 1, color: colors[Math.floor(Math.random()*colors.length)], decay: 0.018+Math.random()*0.025 });
    }
  }

  const confetti = [];
  const confettiColors = ['#c5a059', '#d4af37', '#f0d060', '#e8dbce', '#8b5e1a', '#fff8e7', '#b87333', '#e07b39'];
  function spawnConfetti() {
    for (let i = 0; i < 220; i++) {
      confetti.push({
        x: Math.random() * canvas.width,
        y: -10 - Math.random() * 300,
        w: 6 + Math.random() * 8,
        h: 3 + Math.random() * 5,
        color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
        vx: (Math.random() - 0.5) * 3,
        vy: 2 + Math.random() * 4,
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.2,
        alpha: 1,
        decay: 0.003 + Math.random() * 0.003,
      });
    }
  }

  let frame = 0;
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    frame++;

    if (frame % 4 === 0) spawnEdgeParticle();

    smokes.forEach((s, i) => {
      const grad = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r);
      grad.addColorStop(0, `rgba(180,150,100,${s.alpha})`);
      grad.addColorStop(1, `rgba(180,150,100,0)`);
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI*2); ctx.fillStyle = grad; ctx.fill();
      s.x += s.vx; s.y += s.vy; s.r += s.grow; s.alpha -= 0.0004;
      if (s.alpha <= 0 || s.y < -s.r) smokes[i] = newSmoke();
    });

    for (let i = edgeParticles.length - 1; i >= 0; i--) {
      const p = edgeParticles[i];
      p.trail.push({ x: p.x, y: p.y });
      if (p.trail.length > 10) p.trail.shift();
      p.trail.forEach((pt, ti) => {
        ctx.beginPath(); ctx.arc(pt.x, pt.y, p.r*(ti/p.trail.length)*0.8, 0, Math.PI*2);
        ctx.fillStyle = p.color; ctx.globalAlpha = p.alpha*(ti/p.trail.length)*0.5; ctx.fill();
      });
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fillStyle = p.color; ctx.globalAlpha = p.alpha; ctx.fill(); ctx.globalAlpha = 1;
      p.x += p.vx; p.y += p.vy; p.alpha -= p.decay;
      if (p.alpha <= 0) edgeParticles.splice(i, 1);
    }

    for (let i = bursts.length - 1; i >= 0; i--) {
      const p = bursts[i];
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fillStyle = p.color; ctx.globalAlpha = p.alpha; ctx.fill(); ctx.globalAlpha = 1;
      p.x += p.vx; p.y += p.vy; p.vy += 0.15; p.alpha -= p.decay;
      if (p.alpha <= 0) bursts.splice(i, 1);
    }

    for (let i = confetti.length - 1; i >= 0; i--) {
      const c = confetti[i];
      ctx.save();
      ctx.translate(c.x, c.y); ctx.rotate(c.angle);
      ctx.globalAlpha = c.alpha; ctx.fillStyle = c.color;
      ctx.fillRect(-c.w/2, -c.h/2, c.w, c.h);
      ctx.restore(); ctx.globalAlpha = 1;
      c.x += c.vx; c.y += c.vy; c.vx += (Math.random()-0.5)*0.1;
      c.angle += c.spin; c.alpha -= c.decay;
      if (c.alpha <= 0) confetti.splice(i, 1);
    }

    requestAnimationFrame(animate);
  }
  animate();

  window.spawnBurst = spawnBurst;
  window.spawnConfetti = spawnConfetti;
})();

fetch('dialog.json')
  .then(r => r.json())
  .then(dialog => {

  const pick = arr => arr[Math.floor(Math.random() * arr.length)];

  const state = { selectedMap: null, selectedFriends: new Set(), selectedYear: null };

  const mapCards = document.querySelectorAll('.map-card');
  const friendCards = document.querySelectorAll('.character-card');
  const yearCards = document.querySelectorAll('.year-card');
  const startBtn = document.getElementById('start-btn');
  const toast = document.getElementById('toast');
  const loadingScreen = document.getElementById('loading-screen');
  const loadingMsg = document.getElementById('loading-msg');
  const congratsScreen = document.getElementById('congrats-screen');
  const congratsSub = document.getElementById('congrats-sub');
  const centerPopup = document.getElementById('center-popup');

  if (!startBtn || !toast) return;
  const totalFriends = friendCards.length;

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.remove('show');
    void toast.offsetWidth;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 4000);
  }

  function showCenterPopup(msg) {
    centerPopup.textContent = msg;
    centerPopup.classList.remove('show');
    void centerPopup.offsetWidth;
    centerPopup.classList.add('show');
    clearTimeout(centerPopup._timer);
    centerPopup._timer = setTimeout(() => centerPopup.classList.remove('show'), 4000);
  }

  function updateButton() {
    const allReady = state.selectedMap && state.selectedFriends.size === totalFriends && state.selectedYear;
    if (allReady) {
      startBtn.textContent = `Journey to ${state.selectedMap} in ${state.selectedYear}`;
    } else if (!state.selectedYear && !state.selectedMap) {
      startBtn.textContent = 'Embark on Quest';
    } else if (!state.selectedYear) {
      startBtn.textContent = 'Choose thy year…';
    } else if (state.selectedFriends.size < totalFriends) {
      const remaining = totalFriends - state.selectedFriends.size;
      startBtn.textContent = `Awaiting ${remaining} companion${remaining > 1 ? 's' : ''}…`;
    } else {
      startBtn.textContent = 'Choose thy destination…';
    }
  }

  function runLaunchSequence() {
    const lobby = document.querySelector('.lobby-container');
    lobby.classList.add('collapsing');
    setTimeout(() => {
      lobby.style.display = 'none';
      loadingScreen.classList.add('active');
      let i = 0;
      function showMsg() {
        loadingMsg.style.animation = 'none';
        void loadingMsg.offsetWidth;
        loadingMsg.style.animation = '';
        loadingMsg.textContent = dialog.loading[i % dialog.loading.length];
        i++;
      }
      showMsg();
      const msgInterval = setInterval(showMsg, 3500);
      setTimeout(() => {
        clearInterval(msgInterval);
        loadingScreen.classList.remove('active');
        const fellowship = `Stefanie, Martin, ${[...state.selectedFriends].join(', ')}`;
        congratsSub.textContent = dialog.congrats.fellowship
          .replace('{names}', fellowship)
          .replace('{destination}', state.selectedMap)
          .replace('{year}', state.selectedYear);
        const keyword = (dialog.destinations[state.selectedMap] || {}).keyword || 'ADVENTURE';
        document.getElementById('congrats-keyword').innerHTML = dialog.congrats.keyword
          .replace('{keyword}', `<strong>${keyword}</strong>`);
        congratsScreen.classList.add('active');
        spawnConfetti();
        document.body.classList.add('flash');
        setTimeout(() => document.body.classList.remove('flash'), 800);
      }, 14000);
    }, 700);
  }

  function selectYear(card) {
    const year = card.dataset.year;
    if (year !== '2027') {
      showCenterPopup(pick(dialog.yearTaunts[year] || ['Not this year!']));
      card.classList.add('clicking');
      card.addEventListener('animationend', () => card.classList.remove('clicking'), { once: true });
      return;
    }
    yearCards.forEach(c => c.classList.remove('selected'));
    card.classList.add('selected', 'clicking');
    card.addEventListener('animationend', () => card.classList.remove('clicking'), { once: true });
    const r = card.getBoundingClientRect();
    spawnBurst(r.left + r.width / 2, r.top + r.height / 2);
    state.selectedYear = year;
    document.getElementById('scroll-hint').classList.add('visible');
    window.addEventListener('scroll', () => document.getElementById('scroll-hint').classList.remove('visible'), { once: true });
    updateButton();
  }

  function selectMap(card) {
    const isSelected = card.classList.contains('selected');
    mapCards.forEach(c => c.classList.remove('selected'));
    if (isSelected) {
      state.selectedMap = null;
    } else {
      card.classList.add('selected');
      const r = card.getBoundingClientRect();
      spawnBurst(r.left + r.width / 2, r.top + r.height / 2);
      state.selectedMap = card.dataset.map;
    }
    updateButton();
  }

  function toggleFriend(card) {
    const friendName = card.dataset.friend;
    card.classList.add('clicking');
    card.addEventListener('animationend', () => card.classList.remove('clicking'), { once: true });
    const r = card.getBoundingClientRect();
    spawnBurst(r.left + r.width / 2, r.top + r.height / 2);
    const bubble = card.querySelector('.speech-bubble');
    const img = card.querySelector('img');
    const name = friendName.toLowerCase();
    if (state.selectedFriends.has(friendName)) {
      state.selectedFriends.delete(friendName);
      card.classList.remove('selected');
      if (img) img.src = `img/${name}1.png`;
      if (bubble) { clearTimeout(bubble._timer); bubble.classList.remove('visible'); }
    } else {
      state.selectedFriends.add(friendName);
      card.classList.add('selected');
      if (img) img.src = `img/${name}2.png`;
      const quotes = dialog.companionQuotes[friendName] || [];
      if (bubble && quotes.length) {
        if (!bubble._remaining || bubble._remaining.length === 0) {
          bubble._remaining = [...quotes];
        }
        const idx = Math.floor(Math.random() * bubble._remaining.length);
        const quote = bubble._remaining.splice(idx, 1)[0];
        bubble.textContent = quote;
        clearTimeout(bubble._timer);
        bubble.classList.remove('visible');
        void bubble.offsetWidth;
        bubble.classList.add('visible');
        bubble._timer = setTimeout(() => bubble.classList.remove('visible'), 5000);
      }
    }
    updateButton();
  }

  yearCards.forEach(card => card.addEventListener('click', () => selectYear(card)));
  mapCards.forEach(card => card.addEventListener('click', () => selectMap(card)));
  friendCards.forEach(card => card.addEventListener('click', () => toggleFriend(card)));

  startBtn.addEventListener('click', () => {
    const e = dialog.startErrors;
    if (!state.selectedMap && state.selectedFriends.size !== totalFriends && !state.selectedYear) {
      showToast(e.nothingSelected); return;
    }
    if (!state.selectedYear) {
      showToast(e.noYear); return;
    }
    if (!state.selectedMap && state.selectedFriends.size !== totalFriends) {
      const count = totalFriends - state.selectedFriends.size;
      showToast(e.noDestinationAndMissing.replace('{count}', count).replace('{s}', count > 1 ? 's are' : ' is')); return;
    }
    if (!state.selectedMap) {
      showToast(pick(e.noDestination)); return;
    }
    if (state.selectedFriends.size !== totalFriends) {
      const missing = [...friendCards].map(c => c.dataset.friend).filter(n => !state.selectedFriends.has(n));
      const names = missing.join(missing.length > 1 ? ' and ' : '');
      showToast(pick(e.missingCompanions).replace('{names}', names).replace('{names}', names.toUpperCase())); return;
    }
    runLaunchSequence();
  });

});
