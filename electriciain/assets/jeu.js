/* « Panne générale » : le mini-jeu des Électrici'Ain.
   Les disjoncteurs sautent, les pièces s'éteignent : réenclenchez-les avant que les clients s'impatientent.
   Pièges : la surtension (rouge, on attend qu'elle retombe) ; bonus : l'éclair doré (+3 s). */
(function () {
  'use strict';
  var game = document.querySelector('[data-jeu]');
  if (!game) return;
  var calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ROOMS = ['Salon', 'Cuisine', 'Chambre', 'Bureau', 'Salle de bain', 'Garage', 'Jardin', 'Grenier'];
  var DURATION = 60, LIVES = 3;
  var brkWrap = game.querySelector('.jeu__panel'), wins = game.querySelectorAll('.jeu__win');
  var $ = function (s) { return game.querySelector(s); };
  var scoreEl = $('[data-score]'), comboEl = $('[data-combo]'), livesEl = $('[data-lives]'), timeBar = $('[data-time]'), timeTxt = $('[data-time-txt]');
  var fx = $('.jeu__fx'), ctx = fx.getContext('2d'), pops = $('.jeu__pops');
  var screens = { start: $('[data-screen="start"]'), count: $('[data-screen="count"]'), over: $('[data-screen="over"]') };
  var BEST_KEY = 'electriciain-jeu-best';
  var best = 0; try { best = +localStorage.getItem(BEST_KEY) || 0; } catch (e) {}
  $('[data-best]').textContent = best;

  // ---------- personnage : Aymeric (le rapide) ou Louis (le prudent) ----------
  var NAMES = { aymeric: 'Aymeric', louis: 'Louis' };
  var who = 'aymeric'; try { who = localStorage.getItem('electriciain-jeu-perso') || 'aymeric'; } catch (e) {}
  if (!NAMES[who]) who = 'aymeric';
  var charBtns = game.querySelectorAll('.jchar'), playBtn = $('[data-play]');
  function pick(w) {
    who = w; try { localStorage.setItem('electriciain-jeu-perso', w); } catch (e) {}
    charBtns.forEach(function (b) { var on = b.dataset.char === w; b.classList.toggle('is-on', on); b.setAttribute('aria-checked', String(on)); });
    playBtn.textContent = 'Jouer avec ' + NAMES[w];
    game.dataset.who = w;
  }
  charBtns.forEach(function (b) { b.addEventListener('click', function () { audio(); sfx.clac(1); pick(b.dataset.char); }); });
  var me = $('[data-me]'), moodT = 0;
  function mood(m, ms) { me.dataset.mood = m; clearTimeout(moodT); moodT = setTimeout(function () { me.dataset.mood = ''; }, ms || 700); }

  // ---------- disjoncteurs ----------
  var brks = ROOMS.map(function (name, i) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'jbrk is-on'; b.dataset.i = i;
    b.innerHTML = '<span class="jbrk__label">' + name + '</span><span class="jbrk__face"><span class="jbrk__win"></span><span class="jbrk__slot"><span class="jbrk__lever"></span></span><span class="jbrk__key">' + (i + 1) + '</span></span>';
    b.setAttribute('aria-label', name + ' : allumé');
    b.addEventListener('pointerdown', function (e) { e.preventDefault(); hit(i, e.clientX, e.clientY); });
    b.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); var r = b.getBoundingClientRect(); hit(i, r.left + r.width / 2, r.top + r.height / 2); } });
    brkWrap.appendChild(b);
    return b;
  });
  addEventListener('keydown', function (e) {
    var k = parseInt(e.key, 10);
    if (state.running && k >= 1 && k <= 8) { var r = brks[k - 1].getBoundingClientRect(); hit(k - 1, r.left + r.width / 2, r.top + r.height / 2); }
  });

  // ---------- sons, synthétisés (aucun fichier) ----------
  var ac = null, master = null, muted = false;
  try { muted = localStorage.getItem('electriciain-jeu-mute') === '1'; } catch (e) {}
  var muteBtn = document.querySelector('[data-mute]');
  function syncMute() { muteBtn.setAttribute('aria-pressed', String(muted)); muteBtn.textContent = muted ? 'Son coupé' : 'Son activé'; if (master) master.gain.value = muted ? 0 : 0.6; }
  syncMute();
  muteBtn.addEventListener('click', function () { muted = !muted; try { localStorage.setItem('electriciain-jeu-mute', muted ? '1' : '0'); } catch (e) {} syncMute(); });
  function audio() {
    if (ac) return;
    try { ac = new (window.AudioContext || window.webkitAudioContext)(); master = ac.createGain(); master.gain.value = muted ? 0 : 0.6; master.connect(ac.destination); } catch (e) { ac = null; }
  }
  function tone(type, f0, f1, dur, vol, delay) {
    if (!ac) return;
    var t = ac.currentTime + (delay || 0), o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.02);
  }
  function noise(dur, vol, freq, q) {
    if (!ac) return;
    var t = ac.currentTime, n = ac.sampleRate * dur, buf = ac.createBuffer(1, n, ac.sampleRate), d = buf.getChannelData(0);
    for (var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 3);
    var s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
    s.buffer = buf; f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = q; g.gain.value = vol;
    s.connect(f); f.connect(g); g.connect(master); s.start(t);
  }
  var sfx = {
    clac: function (pitch) { noise(0.05, 0.9, 2400, 1.2); tone('square', 180 * pitch, 90, 0.06, 0.12); tone('sine', 660 * pitch, 880 * pitch, 0.12, 0.12, 0.02); },
    trip: function () { noise(0.04, 0.5, 1500, 2); tone('triangle', 220, 110, 0.12, 0.08); },
    zap: function () { tone('sawtooth', 900, 60, 0.35, 0.25); noise(0.3, 0.6, 3000, 0.7); },
    gold: function () { [880, 1175, 1568].forEach(function (f, i) { tone('sine', f, f, 0.18, 0.18, i * 0.07); }); },
    lose: function () { tone('sine', 300, 120, 0.4, 0.2); },
    tick: function (hi) { tone('sine', hi ? 1320 : 880, hi ? 1320 : 880, 0.12, 0.2); },
    end: function () { [523, 659, 784, 1046].forEach(function (f, i) { tone('triangle', f, f, 0.25, 0.16, i * 0.11); }); },
  };
  var buzz = function (ms) { if (navigator.vibrate && !calm) try { navigator.vibrate(ms); } catch (e) {} };

  // ---------- étincelles ----------
  var parts = [];
  function sizeFx() { var r = game.getBoundingClientRect(), d = Math.min(devicePixelRatio, 2); fx.width = r.width * d; fx.height = r.height * d; ctx.setTransform(d, 0, 0, d, 0, 0); }
  addEventListener('resize', sizeFx); sizeFx();
  function burst(x, y, color, n, speed) {
    if (calm) n = Math.min(n, 6);
    var r = game.getBoundingClientRect(); x -= r.left; y -= r.top;
    for (var i = 0; i < n; i++) {
      var a = Math.random() * Math.PI * 2, v = (0.4 + Math.random()) * speed;
      parts.push({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - speed * 0.4, life: 1, c: color, w: 1.5 + Math.random() * 2 });
    }
  }
  function drawFx(dt) {
    var r = game.getBoundingClientRect(); ctx.clearRect(0, 0, r.width, r.height);
    for (var i = parts.length - 1; i >= 0; i--) {
      var p = parts[i]; p.life -= dt * 2.2; if (p.life <= 0) { parts.splice(i, 1); continue; }
      var ox = p.x, oy = p.y; p.vy += 900 * dt; p.x += p.vx * dt; p.y += p.vy * dt;
      ctx.strokeStyle = p.c; ctx.globalAlpha = p.life; ctx.lineWidth = p.w; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(p.x, p.y); ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
  function pop(text, x, y, cls) {
    var r = game.getBoundingClientRect(), el = document.createElement('span');
    el.className = 'jpop ' + (cls || ''); el.textContent = text;
    el.style.left = (x - r.left) + 'px'; el.style.top = (y - r.top) + 'px';
    pops.appendChild(el); setTimeout(function () { el.remove(); }, 900);
  }
  function shake() { if (calm) return; game.classList.remove('is-shake'); void game.offsetWidth; game.classList.add('is-shake'); }

  // ---------- état de la partie ----------
  var state = { running: false };
  function reset() {
    state = { running: false, t: 0, left: DURATION, score: 0, combo: 0, lives: LIVES, next: 1.0, rooms: ROOMS.map(function () { return { s: 'on', since: 0 }; }), hits: 0, best: 0, gloves: who === 'louis' ? 1 : 0 };
    brks.forEach(function (b, i) { setRoom(i, 'on'); });
    hud();
  }
  function setRoom(i, s) {
    var r = state.rooms[i]; r.s = s; r.since = state.t;
    var b = brks[i];
    b.className = 'jbrk is-' + s;
    wins[i].setAttribute('class', 'jeu__win is-' + (s === 'on' ? 'on' : s === 'gold' ? 'gold' : 'off'));
    b.setAttribute('aria-label', ROOMS[i] + ' : ' + (s === 'on' ? 'allumé' : s === 'surge' ? 'surtension, attendez' : s === 'gold' ? 'éclair doré, à réenclencher' : 'disjoncté, à réenclencher'));
  }
  function hud() {
    scoreEl.textContent = state.score.toLocaleString('fr-FR');
    var mult = multiplier();
    comboEl.textContent = mult > 1 ? '×' + String(mult).replace('.', ',') : '';
    comboEl.classList.toggle('is-hot', mult >= 2);
    livesEl.innerHTML = ''; for (var i = 0; i < LIVES; i++) { var s = document.createElement('span'); s.className = 'jlife' + (i < state.lives ? ' is-on' : ''); livesEl.appendChild(s); }
    livesEl.setAttribute('aria-label', state.lives + ' vie' + (state.lives > 1 ? 's' : ''));
  }
  var multiplier = function () { return 1 + Math.floor(state.combo / (who === 'aymeric' ? 4 : 5)) * 0.5; };
  var grace = function () { return Math.max(1.9, 3.3 - state.t * 0.022); };          // temps avant qu'une pièce dans le noir coûte une vie
  var interval = function () { return Math.max(0.42, 1.25 - state.t * 0.014); };     // rythme des pannes

  function hit(i, x, y) {
    if (!state.running) return;
    audio();
    var r = state.rooms[i];
    if (r.s === 'on') { brks[i].classList.add('is-nudge'); setTimeout(function () { brks[i].classList.remove('is-nudge'); }, 160); return; }
    if (r.s === 'surge') {                       // coup de jus
      sfx.zap(); buzz([60, 40, 90]); burst(x, y, '#ff5a3c', 26, 380); burst(x, y, '#ffffff', 10, 260);
      if (state.gloves > 0) { state.gloves--; pop('Gants isolants !', x, y, 'is-combo'); mood('happy', 900); setRoom(i, 'off'); return; }
      shake(); mood('zap', 900); pop('Coup de jus !', x, y, 'is-bad'); state.combo = 0; loseLife(); return;
    }
    var dt = state.t - r.since;
    var gold = r.s === 'gold';
    var pts = Math.round((100 + Math.max(0, 1 - dt) * 100) * multiplier());
    if (gold) { pts += 250; state.left = Math.min(DURATION, state.left + 3); }
    state.score += pts; state.combo++; state.hits++; state.best = Math.max(state.best, state.combo);
    setRoom(i, 'on');
    sfx.clac(1 + Math.min(state.combo, 20) * 0.02); if (gold) sfx.gold(); buzz(12);
    burst(x, y, gold ? '#ffe14d' : '#f7c600', gold ? 30 : 14, gold ? 360 : 240);
    pop('+' + pts + (gold ? ' · +3 s' : ''), x, y, gold ? 'is-gold' : '');
    if (state.combo > 0 && state.combo % (who === 'aymeric' ? 4 : 5) === 0) { mood('happy', 800); }
    if (state.combo > 0 && state.combo % (who === 'aymeric' ? 4 : 5) === 0) pop('Combo ×' + String(multiplier()).replace('.', ','), x, y - 34, 'is-combo');
    hud();
  }
  function loseLife() {
    state.lives--; sfx.lose(); hud(); if (me.dataset.mood !== 'zap') mood('sad', 800);
    game.classList.remove('is-hurt'); void game.offsetWidth; game.classList.add('is-hurt');
    if (state.lives <= 0) end();
  }
  function trip() {
    var on = []; state.rooms.forEach(function (r, i) { if (r.s === 'on') on.push(i); });
    if (!on.length) return;
    var i = on[Math.floor(Math.random() * on.length)], roll = Math.random();
    var kind = state.t > 8 && roll < 0.16 ? 'surge' : roll > 0.94 ? 'gold' : 'off';
    setRoom(i, kind); sfx.trip();
    if (kind === 'surge') state.rooms[i].until = state.t + 1.5 + Math.random() * 0.6;
  }

  // ---------- boucle ----------
  var last = 0;
  function frame(now) {
    var dt = Math.min(0.05, (now - last) / 1000 || 0); last = now;
    if (state.running) {
      state.t += dt; state.left -= dt;
      if (state.t >= state.next) { trip(); if (state.t > 20 && Math.random() < 0.25) trip(); state.next = state.t + interval() * (0.6 + Math.random() * 0.8); }
      state.rooms.forEach(function (r, i) {
        if (r.s === 'surge' && state.t >= r.until) setRoom(i, 'off');
        else if ((r.s === 'off' || r.s === 'gold') && state.t - r.since > grace()) {
          var b = brks[i].getBoundingClientRect();
          pop('Client dans le noir', b.left + b.width / 2, b.top, 'is-bad'); state.combo = 0;
          setRoom(i, 'on'); loseLife();
        }
        if (r.s === 'off' || r.s === 'gold') brks[i].style.setProperty('--urg', Math.min(1, (state.t - r.since) / grace()).toFixed(2));
      });
      timeBar.style.transform = 'scaleX(' + Math.max(0, state.left / DURATION).toFixed(4) + ')';
      timeTxt.textContent = Math.ceil(Math.max(0, state.left)) + ' s';
      game.classList.toggle('is-late', state.left < 10);
      if (state.left <= 0 && state.running) end();
    }
    drawFx(dt);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(function (t) { last = t; frame(t); });

  // ---------- écrans ----------
  function show(name) { Object.keys(screens).forEach(function (k) { screens[k].hidden = k !== name; }); game.classList.toggle('is-playing', !name); }
  function start() {
    audio(); reset(); show('count');
    game.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'center' });   // tout le tableau à l'écran
    var n = 3, el = screens.count.querySelector('[data-count]');
    (function step() {
      el.textContent = n > 0 ? n : 'Courant !';
      el.classList.remove('is-pop'); void el.offsetWidth; el.classList.add('is-pop');
      sfx.tick(n === 0);
      if (n === 0) { setTimeout(function () { show(null); state.running = true; state.next = 0.6; brks[0].focus({ preventScroll: true }); }, 450); return; }
      n--; setTimeout(step, calm ? 500 : 700);
    })();
  }
  var RANKS = [[0, 'Apprenti'], [4000, 'Électricien'], [9000, 'Chef de chantier'], [15000, 'Maître électricien'], [22000, "Électrici'Ain d'or"]];
  function end() {
    state.running = false; sfx.end();
    brks.forEach(function (b, i) { setRoom(i, 'on'); });
    var s = state.score, rank = RANKS.filter(function (r) { return s >= r[0]; }).pop()[1];
    var record = s > best; if (record) { best = s; try { localStorage.setItem(BEST_KEY, String(s)); } catch (e) {} }
    $('[data-final]').textContent = s.toLocaleString('fr-FR');
    $('[data-rank]').textContent = rank;
    $('[data-best]').textContent = best.toLocaleString('fr-FR');
    $('[data-record]').hidden = !record;
    $('[data-stats]').textContent = NAMES[who] + ' a réenclenché ' + state.hits + ' disjoncteur' + (state.hits > 1 ? 's' : '') + ', meilleure série : ' + state.best + '.';
    $('[data-overav]').dataset.mood = record || state.lives > 0 ? 'happy' : 'sad';
    show('over');
    setTimeout(function () { $('[data-again]').focus({ preventScroll: true }); }, 50);
    var r = game.getBoundingClientRect();
    if (record) for (var k = 0; k < 4; k++) setTimeout(function () { burst(r.left + Math.random() * r.width, r.top + r.height * 0.3, '#f7c600', 30, 420); }, k * 180);
  }
  game.querySelectorAll('[data-play], [data-again]').forEach(function (b) { b.addEventListener('click', start); });
  var share = $('[data-share]');
  share.addEventListener('click', function () {
    var text = "J'ai fait " + state.score.toLocaleString('fr-FR') + " points avec " + NAMES[who] + " à « Panne générale », le jeu des Électrici'Ain. À vous !";
    if (navigator.share) navigator.share({ title: 'Panne générale', text: text, url: location.href }).catch(function () {});
    else if (navigator.clipboard) navigator.clipboard.writeText(text + ' ' + location.href).then(function () { share.textContent = 'Lien copié'; setTimeout(function () { share.textContent = 'Défier un ami'; }, 1800); });
  });
  pick(who); reset(); show('start');
})();
