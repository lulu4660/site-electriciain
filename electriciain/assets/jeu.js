/* « Panne générale » : le jeu des Électrici'Ain.
   Vue de supervision : la maison en coupe, en plan technique, et son réseau électrique.
   Les pièces tombent en panne : touchez-les, l'électricien s'y rend et rétablit le courant.
   Court-circuit (câble rouge) : couper d'abord au tableau électrique, sinon il est électrisé. */
(function () {
  'use strict';
  var game = document.querySelector('[data-jeu]');
  if (!game) return;
  var calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s) { return game.querySelector(s); };
  var cv = $('.jeu__cv'), ctx = cv.getContext('2d');
  var W = 960, H = 600, DURATION = 90, STARS = 3;
  var live = $('[data-live]');
  var say = function (t) { live.textContent = t; };
  var UI = 1, fz = function (n) { return Math.round(n * UI); };   // textes agrandis sur petit écran
  var FONT = '"Barlow Condensed", "Arial Narrow", sans-serif', FONT2 = 'Barlow, system-ui, sans-serif';

  // ======================================================================= électriciens
  var GUYS = {
    aymeric: { name: 'Aymeric', ini: 'A', color: '#5b93f0', speed: 1.25, fix: 1, gloves: 0 },
    louis: { name: 'Louis', ini: 'L', color: '#f7c600', speed: 1, fix: 1.45, gloves: 1 },
  };
  var LINE = '#5d7099', DIM = '#34425f', TXT = '#a9b8d6', YEL = '#f7c600', RED = '#ff5a45';
  function rr(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }

  // ======================================================================= la maison
  var FY = [500, 360, 220];                 // sols : rez-de-chaussée, étage, combles
  var RANGE = [[24, 940], [132, 828], [282, 678]];
  var STAIRS = { bx: 548, tx: 640 };
  var LADDER = { x: 300 };
  var ROOMS = [
    { id: 'cuisine', name: 'Cuisine', f: 0, x0: 128, x1: 368, spot: 300 },
    { id: 'salon', name: 'Salon', f: 0, x0: 368, x1: 608, spot: 440 },
    { id: 'entree', name: 'Entrée', f: 0, x0: 608, x1: 832, spot: 700 },
    { id: 'chambre', name: 'Chambre', f: 1, x0: 128, x1: 368, spot: 220 },
    { id: 'sdb', name: 'Salle de bain', f: 1, x0: 368, x1: 608, spot: 470 },
    { id: 'bureau', name: 'Bureau', f: 1, x0: 608, x1: 832, spot: 740 },
    { id: 'combles', name: 'Combles', f: 2, x0: 278, x1: 682, spot: 560 },
    { id: 'jardin', name: 'Jardin', f: 0, x0: 20, x1: 118, spot: 64, out: true },
    { id: 'garage', name: 'Garage', f: 0, x0: 842, x1: 952, spot: 880, out: true },
  ];
  var TABLEAU = { x: 790, y: 432 };
  ROOMS.forEach(function (r, i) {
    r.i = i; r.top = r.f === 2 ? 120 : r.out ? 380 : FY[r.f] - 140; r.bot = FY[r.f];
    r.lamp = r.id === 'jardin' ? [64, 392] : r.id === 'garage' ? [896, 398] : r.f === 2 ? [r.spot, 176] : [r.spot, r.top + 16];
    r.label = r.out ? [r.x0 + 6, r.top - 34] : r.f === 2 ? [r.x0 + 58, r.bot - 46] : [r.x0 + 12, r.top + 22];
    // câble depuis le tableau (tracé orthogonal, un léger décalage par circuit pour les distinguer)
    var o = (i - 4) * 3, L = r.lamp;
    if (r.id === 'jardin') r.wire = [[TABLEAU.x, TABLEAU.y + 30], [TABLEAU.x, 512 + o], [64, 512 + o], [64, L[1]]];
    else if (r.id === 'garage') r.wire = [[TABLEAU.x + 22, TABLEAU.y], [L[0], TABLEAU.y + o], [L[0], L[1]]];
    else { var cy = (r.f === 0 ? 372 : r.f === 1 ? 232 : 188) + o; r.wire = [[TABLEAU.x, TABLEAU.y - 30], [TABLEAU.x, cy], [L[0], cy], [L[0], L[1]]]; }
  });
  function roomPath(c, r) {
    c.beginPath();
    if (r.f === 2) { c.moveTo(r.x0, r.bot); c.lineTo(r.x1, r.bot); c.lineTo(r.x1 - 40, 175); c.lineTo(480, 92); c.lineTo(r.x0 + 40, 175); c.closePath(); }
    else c.rect(r.x0 + 3, r.top + 3, r.x1 - r.x0 - 6, r.bot - r.top - 5);
  }
  function poly(c, pts) { c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); for (var i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]); }

  // fond technique dessiné une fois
  var deco = document.createElement('canvas'); deco.width = W * 2; deco.height = H * 2;
  (function paintDeco() {
    var c = deco.getContext('2d'); c.scale(2, 2);
    var bg = c.createRadialGradient(480, 260, 60, 480, 300, 640); bg.addColorStop(0, '#111c34'); bg.addColorStop(1, '#070d1b');
    c.fillStyle = bg; c.fillRect(0, 0, W, H);
    for (var x = 0; x <= W; x += 24) { c.fillStyle = x % 120 ? 'rgba(120,150,210,.05)' : 'rgba(120,150,210,.10)'; c.fillRect(x, 0, 1, H); }
    for (var y = 0; y <= H; y += 24) { c.fillStyle = y % 120 ? 'rgba(120,150,210,.05)' : 'rgba(120,150,210,.10)'; c.fillRect(0, y, W, 1); }
    c.lineCap = 'round'; c.lineJoin = 'round';
    // sol
    c.strokeStyle = LINE; c.lineWidth = 1.5; c.beginPath(); c.moveTo(0, 504); c.lineTo(W, 504); c.stroke();
    c.strokeStyle = 'rgba(93,112,153,.35)'; c.lineWidth = 1; for (var h = 0; h < W; h += 14) { c.beginPath(); c.moveTo(h, 504); c.lineTo(h - 8, 512); c.stroke(); }
    // toit, murs, planchers, cloisons
    c.strokeStyle = '#7f93bb'; c.lineWidth = 2.2;
    c.beginPath(); c.moveTo(100, 224); c.lineTo(480, 56); c.lineTo(860, 224); c.stroke();
    c.beginPath(); c.moveTo(122, 220); c.lineTo(122, 504); c.moveTo(838, 220); c.lineTo(838, 504); c.stroke();
    c.lineWidth = 3; [220, 360].forEach(function (yy) { c.beginPath(); c.moveTo(122, yy); c.lineTo(838, yy); c.stroke(); });
    c.lineWidth = 1.6; c.strokeStyle = LINE;
    [368, 608].forEach(function (xx) { c.beginPath(); c.moveTo(xx, 362); c.lineTo(xx, 424); c.moveTo(xx, 222); c.lineTo(xx, 290); c.stroke(); });
    // escalier et échelle
    c.strokeStyle = LINE; c.lineWidth = 1.4; var n = 9, sw = (STAIRS.tx - STAIRS.bx) / n;
    c.beginPath(); c.moveTo(STAIRS.bx, 500);
    for (var s = 0; s < n; s++) { c.lineTo(STAIRS.bx + s * sw, 500 - (s + 1) * 140 / n); c.lineTo(STAIRS.bx + (s + 1) * sw, 500 - (s + 1) * 140 / n); }
    c.stroke();
    c.beginPath(); c.moveTo(LADDER.x - 10, 360); c.lineTo(LADDER.x - 10, 206); c.moveTo(LADDER.x + 10, 360); c.lineTo(LADDER.x + 10, 206);
    for (var l = 0; l < 7; l++) { c.moveTo(LADDER.x - 10, 348 - l * 22); c.lineTo(LADDER.x + 10, 348 - l * 22); } c.stroke();
    // mobilier en traits fins, à l'échelle
    c.strokeStyle = 'rgba(127,147,187,.55)'; c.lineWidth = 1.3;
    var R = function (x, y, w, h, r) { rr(c, x, y, w, h, r || 2); c.stroke(); };
    R(140, 450, 150, 46); c.beginPath(); c.moveTo(140, 456); c.lineTo(290, 456); c.stroke(); R(296, 408, 52, 92, 4); R(150, 392, 120, 26);         // cuisine
    R(390, 458, 110, 40, 8); R(390, 446, 110, 14, 6); R(512, 476, 40, 22); R(420, 394, 70, 42);                                         // salon
    R(640, 398, 44, 100); R(726, 438, 8, 60);                                                                                          // entrée
    R(150, 320, 130, 30, 4); R(150, 302, 16, 48); R(300, 316, 34, 34);                                                                  // chambre
    R(384, 316, 110, 34, 14); R(530, 304, 40, 46, 4); R(536, 256, 30, 40, 4);                                                          // salle de bain
    R(640, 300, 120, 6); c.beginPath(); c.moveTo(650, 306); c.lineTo(650, 350); c.moveTo(750, 306); c.lineTo(750, 350); c.stroke(); R(680, 266, 46, 30); R(780, 280, 34, 70);   // bureau
    R(470, 166, 90, 44, 6); c.beginPath(); c.arc(515, 188, 14, 0, 7); c.stroke(); R(330, 180, 40, 30); R(600, 186, 46, 24);               // combles : caisson VMC
    // garage et voiture, jardin
    c.strokeStyle = LINE; c.lineWidth = 1.6; c.beginPath(); c.moveTo(838, 380); c.lineTo(954, 380); c.lineTo(954, 504); c.stroke();
    c.strokeStyle = 'rgba(127,147,187,.55)'; c.lineWidth = 1.3; rr(c, 848, 448, 94, 34, 11); c.stroke(); rr(c, 864, 428, 58, 22, 8); c.stroke();
    [870, 920].forEach(function (wx) { c.beginPath(); c.arc(wx, 486, 10, 0, 7); c.stroke(); });
    rr(c, 932, 410, 14, 34, 4); c.stroke();
    c.beginPath(); c.moveTo(64, 504); c.lineTo(64, 396); c.stroke(); rr(c, 54, 386, 20, 8, 3); c.stroke();
  })();

  // ======================================================================= état de la partie
  var whoSel = 'aymeric'; try { whoSel = localStorage.getItem('electriciain-jeu-perso') || 'aymeric'; } catch (e) {}
  if (!GUYS[whoSel]) whoSel = 'aymeric';
  var S, parts = [], floats = [];
  function reset() {
    S = { run: false, t: 0, left: DURATION, score: 0, combo: 0, best: 0, fixed: 0, stars: STARS, next: 1.6, who: whoSel,
      gloves: GUYS[whoSel].gloves, queue: [],
      rooms: ROOMS.map(function () { return { s: 'ok', since: 0, flick: 0 }; }),
      guy: { f: 0, x: 470, y: 500, fix: 0, fixMax: 1, zap: 0, path: [], task: null, trail: [] } };
    parts.length = 0; floats.length = 0; hud(); hudTime();
  }

  // ======================================================================= déplacements
  function pathTo(f, x) {
    var g = S.guy, pts = [], cf = g.f, guard = 0;
    function walkTo(fl, xx) { pts.push({ f: fl, x: Math.max(RANGE[fl][0], Math.min(RANGE[fl][1], xx)), y: FY[fl], mode: 'walk' }); }
    while (cf !== f && guard++ < 4) {
      if (cf === 0) { walkTo(0, STAIRS.bx); pts.push({ f: 1, x: STAIRS.tx, y: FY[1], mode: 'stairs' }); cf = 1; }
      else if (cf === 1 && f === 2) { walkTo(1, LADDER.x); pts.push({ f: 2, x: LADDER.x, y: FY[2], mode: 'ladder' }); cf = 2; }
      else if (cf === 2) { walkTo(2, LADDER.x); pts.push({ f: 1, x: LADDER.x, y: FY[1], mode: 'ladder' }); cf = 1; }
      else { walkTo(1, STAIRS.tx); pts.push({ f: 0, x: STAIRS.bx, y: FY[0], mode: 'stairs' }); cf = 0; }
    }
    walkTo(f, x);
    return pts;
  }
  function startNext() {
    var g = S.guy;
    if (g.task || g.zap > 0) return;
    var t = S.queue.shift(); if (!t) return;
    g.task = t;
    g.path = t.type === 'room' ? pathTo(ROOMS[t.i].f, ROOMS[t.i].spot) : pathTo(0, TABLEAU.x - 30);
  }
  function order(t) {
    if (!S.run) return;
    audio();
    var busy = S.queue.concat(S.guy.task ? [S.guy.task] : []).some(function (q) { return q.type === t.type && q.i === t.i; });
    if (busy) return;
    if (t.type === 'room' && S.rooms[t.i].s === 'ok') { floatText('Rien à signaler', ROOMS[t.i].spot, ROOMS[t.i].top + 50, TXT); return; }
    if (S.queue.length >= 3) { floatText('3 interventions d\'avance au maximum', S.guy.x, S.guy.y - 60, '#ffb4a6'); sfx.no(); return; }
    S.queue.push(t); sfx.tap(); startNext();
  }

  // ======================================================================= commandes
  function toWorld(e) { var r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width * W, y: (e.clientY - r.top) / r.height * H }; }
  cv.addEventListener('pointerdown', function (e) {
    if (!S.run) return; e.preventDefault();
    var p = toWorld(e);
    if (Math.abs(p.x - TABLEAU.x) < 40 && Math.abs(p.y - TABLEAU.y) < 46) { order({ type: 'tableau' }); return; }
    for (var i = 0; i < ROOMS.length; i++) {
      var r = ROOMS[i];
      if (p.x >= r.x0 && p.x <= r.x1 && p.y >= r.top - (r.out ? 40 : 0) && p.y <= r.bot + 10) { order({ type: 'room', i: i }); return; }
    }
  });
  addEventListener('keydown', function (e) {
    if (!S || !S.run) return;
    var k = e.key.toLowerCase();
    if (k === 't') { order({ type: 'tableau' }); e.preventDefault(); return; }
    var n = parseInt(k, 10); if (n >= 1 && n <= ROOMS.length) { order({ type: 'room', i: n - 1 }); e.preventDefault(); }
  });

  // ======================================================================= sons (synthétisés, discrets)
  var ac = null, master = null, muted = false;
  try { muted = localStorage.getItem('electriciain-jeu-mute') === '1'; } catch (e) {}
  var muteBtn = document.querySelector('[data-mute]');
  function syncMute() { muteBtn.setAttribute('aria-pressed', String(muted)); muteBtn.textContent = muted ? 'Son coupé' : 'Son activé'; if (master) master.gain.value = muted ? 0 : 0.5; }
  syncMute(); muteBtn.addEventListener('click', function () { muted = !muted; try { localStorage.setItem('electriciain-jeu-mute', muted ? '1' : '0'); } catch (e) {} syncMute(); });
  function audio() { if (ac) return; try { ac = new (window.AudioContext || window.webkitAudioContext)(); master = ac.createGain(); master.gain.value = muted ? 0 : 0.5; master.connect(ac.destination); } catch (e) { ac = null; } }
  function tone(type, f0, f1, dur, vol, delay) { if (!ac) return; var t = ac.currentTime + (delay || 0), o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.02); }
  function noise(dur, vol, freq, q) { if (!ac) return; var t = ac.currentTime, n = Math.floor(ac.sampleRate * dur), buf = ac.createBuffer(1, n, ac.sampleRate), d = buf.getChannelData(0); for (var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2); var s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = buf; f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = q; g.gain.value = vol; s.connect(f); f.connect(g); g.connect(master); s.start(t); }
  var sfx = {
    tap: function () { tone('sine', 880, 880, 0.06, 0.08); },
    no: function () { tone('sine', 220, 180, 0.12, 0.08); },
    out: function () { tone('sine', 520, 260, 0.3, 0.09); },
    fixed: function (c) { var p = 1 + Math.min(c, 12) * 0.03; noise(0.03, 0.4, 3000, 2); tone('sine', 660 * p, 660 * p, 0.12, 0.09, 0.02); tone('sine', 990 * p, 990 * p, 0.2, 0.08, 0.09); },
    zap: function () { tone('sawtooth', 900, 60, 0.4, 0.16); noise(0.35, 0.4, 3200, 0.8); },
    cut: function () { noise(0.05, 0.6, 1600, 1); tone('sine', 300, 200, 0.12, 0.08); },
    lose: function () { tone('sine', 392, 196, 0.5, 0.12); },
    tick: function (hi) { tone('sine', hi ? 1320 : 880, hi ? 1320 : 880, 0.1, 0.12); },
    end: function () { [523, 659, 784].forEach(function (f, i) { tone('sine', f, f, 0.4, 0.1, i * 0.12); }); },
  };
  var vib = function (p) { if (navigator.vibrate && !calm) try { navigator.vibrate(p); } catch (e) {} };

  // ======================================================================= effets
  function sparks(x, y, col, n, sp) { if (calm) n = Math.min(n, 4); for (var i = 0; i < n; i++) { var a = Math.random() * Math.PI * 2, v = (0.3 + Math.random()) * sp; parts.push({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 1, c: col }); } }
  function floatText(txt, x, y, col, big) { floats.push({ txt: txt, x: Math.max(120, Math.min(W - 120, x)), y: y, c: col, life: 1, big: big }); }
  var shakeT = 0;

  // ======================================================================= règles
  var patience = function () { return Math.max(6.5, 11.5 - S.t * 0.05); };
  var spawnGap = function () { return Math.max(1.05, 2.9 - S.t * 0.022); };
  var mult = function () { return 1 + Math.floor(S.combo / 4) * 0.5; };
  function breakRoom() {
    var free = []; S.rooms.forEach(function (r, i) { if (r.s === 'ok') free.push(i); });
    if (!free.length) return;
    var i = free[Math.floor(Math.random() * free.length)], short = S.t > 10 && Math.random() < 0.25;
    S.rooms[i].s = short ? 'short' : 'dark'; S.rooms[i].since = S.t;
    sfx.out(); say(ROOMS[i].name + (short ? ' : court-circuit' : ' : panne'));
  }
  function arrive() {
    var g = S.guy, t = g.task;
    if (!t) return;
    var G = GUYS[S.who];
    if (t.type === 'tableau') { g.fix = g.fixMax = 0.45 / G.fix; return; }
    var r = S.rooms[t.i];
    if (r.s === 'ok') { g.task = null; startNext(); return; }
    if (r.s === 'short') {
      if (S.gloves > 0) { S.gloves--; floatText('Gants isolants : protégé', g.x, g.y - 60, '#9fc4ff'); g.fix = g.fixMax = 0.9 / G.fix; return; }
      g.zap = 1.5; g.task = null; S.combo = 0; sfx.zap(); vib([80, 40, 120]); shakeT = 0.35;
      sparks(g.x, g.y - 16, '#9fd8ff', 22, 220);
      floatText('Électrisé : coupez au tableau d\'abord', g.x, g.y - 60, RED); say('Électrisé ! Coupez au tableau avant de réparer un court-circuit.');
      hud(); return;
    }
    g.fix = g.fixMax = 0.9 / G.fix;
  }
  function finishFix() {
    var g = S.guy, t = g.task; g.task = null;
    if (t.type === 'tableau') {
      var n = 0; S.rooms.forEach(function (r) { if (r.s === 'short') { r.s = 'dark'; n++; } });
      sfx.cut(); floatText(n ? n + ' circuit' + (n > 1 ? 's' : '') + ' sécurisé' + (n > 1 ? 's' : '') : 'Aucun défaut', TABLEAU.x - 70, TABLEAU.y - 62, YEL);
      startNext(); return;
    }
    var r = S.rooms[t.i], room = ROOMS[t.i];
    var left = Math.max(0, patience() - (S.t - r.since));
    S.combo++; S.best = Math.max(S.best, S.combo); S.fixed++;
    var pts = Math.round((100 + left * 15) * mult());
    S.score += pts; r.s = 'ok'; r.flick = 0.35;
    sfx.fixed(S.combo); vib(12);
    sparks(room.lamp[0], room.lamp[1], YEL, 10, 140);
    floatText('+' + pts, room.spot, room.top + 60, YEL, true);
    if (S.combo % 4 === 0) floatText('Série ×' + String(mult()).replace('.', ','), room.spot, room.top + 88, '#ffffff');
    say(room.name + ' : rétabli. ' + S.score + ' points.');
    hud(); startNext();
  }
  function loseStar(i) {
    S.stars--; S.combo = 0; S.rooms[i].s = 'ok'; sfx.lose(); vib(60);
    floatText('Client insatisfait', ROOMS[i].spot, ROOMS[i].top + 60, RED, true);
    S.queue = S.queue.filter(function (q) { return !(q.type === 'room' && q.i === i); });
    if (S.guy.task && S.guy.task.type === 'room' && S.guy.task.i === i) { S.guy.task = null; S.guy.path = []; S.guy.fix = 0; startNext(); }
    hud(); game.classList.remove('is-hurt'); void game.offsetWidth; game.classList.add('is-hurt');
    if (S.stars <= 0) end();
  }

  // ======================================================================= simulation
  var trailT = 0;
  function update(dt) {
    var g = S.guy, G = GUYS[S.who];
    S.rooms.forEach(function (r) { if (r.flick > 0) r.flick -= dt; });
    trailT -= dt; if (trailT <= 0) { trailT = 0.03; g.trail.push([g.x, g.y - 16]); if (g.trail.length > 18) g.trail.shift(); }
    if (!S.run) return;
    S.t += dt; S.left -= dt;
    if (S.t >= S.next) { breakRoom(); if (S.t > 35 && Math.random() < 0.3) breakRoom(); S.next = S.t + spawnGap() * (0.7 + Math.random() * 0.6); }
    for (var i = 0; i < S.rooms.length; i++) { var r = S.rooms[i]; if ((r.s === 'dark' || r.s === 'short') && S.t - r.since > patience()) loseStar(i); if (!S.run) return; }
    if (g.zap > 0) { g.zap -= dt; if (g.zap <= 0) { g.zap = 0; startNext(); } }
    else if (g.fix > 0) { g.fix -= dt; if (g.fix <= 0) { g.fix = 0; finishFix(); } }
    else if (g.path.length) {
      var p = g.path[0];
      if (p.mode === 'walk') {
        var dx = p.x - g.x; g.x += Math.sign(dx) * Math.min(Math.abs(dx), 240 * G.speed * dt);
        if (Math.abs(p.x - g.x) < 0.6) { g.x = p.x; g.path.shift(); if (!g.path.length) arrive(); }
      } else {
        var ddx = p.x - g.x, ddy = p.y - g.y, d = Math.hypot(ddx, ddy), v = (p.mode === 'ladder' ? 160 : 200) * G.speed * dt;
        if (d <= v) { g.x = p.x; g.y = p.y; g.f = p.f; g.path.shift(); if (!g.path.length) arrive(); }
        else { g.x += ddx / d * v; g.y += ddy / d * v; }
      }
    }
    if (S.left <= 0) end();
    hudTime();
  }

  // ======================================================================= rendu
  function draw(t) {
    var sc = cv.width / W;
    ctx.setTransform(sc, 0, 0, sc, 0, 0);
    if (shakeT > 0 && !calm) ctx.translate((Math.random() - 0.5) * 8 * shakeT, (Math.random() - 0.5) * 8 * shakeT);
    ctx.drawImage(deco, 0, 0, W, H);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    var anyShort = false;
    // pièces : lumière ou obscurité
    ROOMS.forEach(function (room, i) {
      var r = S.rooms[i], L = room.lamp; if (r.s === 'short') anyShort = true;
      ctx.save(); if (room.out) { ctx.beginPath(); ctx.rect(room.x0, room.top - 10, room.x1 - room.x0, room.bot - room.top + 14); } else roomPath(ctx, room); ctx.clip();
      if (r.s === 'ok') {
        var fl = r.flick > 0 && Math.sin(t * 70) > 0 ? 0.5 : 1;
        var gl = ctx.createRadialGradient(L[0], L[1], 2, L[0], L[1], room.out ? 120 : 230);
        gl.addColorStop(0, 'rgba(255,205,96,' + 0.26 * fl + ')'); gl.addColorStop(1, 'rgba(255,205,96,0)');
        ctx.fillStyle = gl; ctx.fillRect(room.x0 - 120, room.top - 120, room.x1 - room.x0 + 240, 420);
      } else {
        ctx.fillStyle = 'rgba(2,5,12,.55)'; ctx.fillRect(room.x0 - 60, room.top - 130, room.x1 - room.x0 + 120, 420);
        if (r.s === 'short') { ctx.fillStyle = 'rgba(255,70,50,' + (0.07 + 0.05 * Math.sin(t * 12)) + ')'; ctx.fillRect(room.x0 - 60, room.top - 130, room.x1 - room.x0 + 120, 420); }
      }
      ctx.restore();
    });
    // réseau : un câble par pièce depuis le tableau
    ROOMS.forEach(function (room, i) {
      var r = S.rooms[i];
      poly(ctx, room.wire);
      if (r.s === 'ok') {
        ctx.strokeStyle = 'rgba(247,198,0,.28)'; ctx.lineWidth = 1.4; ctx.setLineDash([]); ctx.stroke();
        ctx.strokeStyle = 'rgba(255,224,120,.9)'; ctx.lineWidth = 1.6; ctx.setLineDash([2, 14]); ctx.lineDashOffset = calm ? 0 : -t * 46; ctx.stroke();
      } else if (r.s === 'short') {
        ctx.strokeStyle = 'rgba(255,90,69,' + (0.45 + 0.4 * Math.sin(t * 22)) + ')'; ctx.lineWidth = 1.8; ctx.setLineDash([]); ctx.stroke();
      } else { ctx.strokeStyle = DIM; ctx.lineWidth = 1.2; ctx.setLineDash([3, 5]); ctx.lineDashOffset = 0; ctx.stroke(); }
      ctx.setLineDash([]);
      // défaut : petit arc électrique sur le câble
      if (r.s === 'short' && !calm) {
        var w = room.wire, a = w[w.length - 2], b = w[w.length - 1], mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
        ctx.strokeStyle = 'rgba(255,200,180,.9)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(mx - 8, my);
        for (var z = 0; z < 5; z++) ctx.lineTo(mx - 8 + z * 4, my + (Math.random() - 0.5) * 10); ctx.stroke();
      }
    });
    // luminaires, étiquettes, jauges de patience
    ctx.textBaseline = 'middle';
    ROOMS.forEach(function (room, i) {
      var r = S.rooms[i], L = room.lamp;
      if (r.s === 'ok') { ctx.shadowColor = 'rgba(255,205,96,.9)'; ctx.shadowBlur = 14; ctx.fillStyle = '#ffe28a'; }
      else ctx.fillStyle = r.s === 'short' ? RED : '#3d4b69';
      ctx.beginPath(); ctx.arc(L[0], L[1], 4.5, 0, 7); ctx.fill(); ctx.shadowBlur = 0;
      var lx = room.label[0], ly = room.label[1];
      ctx.font = '500 ' + fz(13) + 'px ' + FONT2; ctx.textAlign = 'left';
      if (r.s === 'ok') { ctx.fillStyle = TXT; ctx.fillText(room.name, lx, ly); }
      else {
        var k = Math.max(0, 1 - (S.t - r.since) / patience());
        ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(lx + 9, ly, 9 * UI, 0, 7); ctx.stroke();
        ctx.strokeStyle = k > 0.5 ? '#ffffff' : k > 0.25 ? YEL : RED; ctx.beginPath(); ctx.arc(lx + 9, ly, 9 * UI, -Math.PI / 2, -Math.PI / 2 + k * Math.PI * 2); ctx.stroke();
        ctx.fillStyle = r.s === 'short' ? RED : '#ffffff'; ctx.font = '600 ' + fz(13) + 'px ' + FONT2;
        ctx.fillText(UI > 1 ? room.name : room.name + (r.s === 'short' ? ' · court-circuit' : ' · panne'), lx + 9 + 15 * UI, ly);
      }
      ctx.fillStyle = 'rgba(169,184,214,.45)'; ctx.font = '500 ' + fz(11) + 'px ' + FONT2; ctx.textAlign = 'right';
      if (UI > 1) return;
      if (!room.out) ctx.fillText(String(i + 1), room.x1 - 10, room.f === 2 ? room.bot - 14 : room.top + 20);
      else ctx.fillText(String(i + 1), room.x1 - 4, room.top - 34);
    });
    // tableau électrique
    var pulse = 0.55 + 0.45 * Math.sin(t * 7);
    ctx.strokeStyle = anyShort ? 'rgba(247,198,0,' + pulse + ')' : '#7f93bb'; ctx.lineWidth = anyShort ? 2 : 1.5;
    rr(ctx, TABLEAU.x - 22, TABLEAU.y - 30, 44, 60, 5); ctx.stroke();
    for (var m = 0; m < 8; m++) { var mx2 = TABLEAU.x - 15 + (m % 4) * 10, my2 = TABLEAU.y - 18 + Math.floor(m / 4) * 26; ctx.fillStyle = 'rgba(127,147,187,.35)'; ctx.fillRect(mx2 - 3, my2, 6, 14); ctx.fillStyle = anyShort && m === Math.floor(t * 8) % 8 ? RED : YEL; ctx.fillRect(mx2 - 3, my2 - 4, 6, 2); }
    ctx.font = '500 ' + fz(11) + 'px ' + FONT2; ctx.textAlign = 'center'; ctx.fillStyle = anyShort ? YEL : TXT;
    ctx.fillText(anyShort ? 'Couper ici (T)' : 'Tableau', TABLEAU.x, TABLEAU.y + 44);
    // interventions programmées : un trait pointillé de l'électricien vers chaque cible, numérotée
    var g = S.guy, list = (g.task ? [g.task] : []).concat(S.queue), px = g.x, py = g.y - 16;
    list.forEach(function (q, n) {
      var tx = q.type === 'tableau' ? TABLEAU.x : ROOMS[q.i].spot, ty = q.type === 'tableau' ? TABLEAU.y : ROOMS[q.i].bot - 16;
      ctx.strokeStyle = n === 0 ? 'rgba(255,255,255,.35)' : 'rgba(255,255,255,.14)'; ctx.lineWidth = 1; ctx.setLineDash([4, 6]); ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(tx, ty); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = n === 0 ? '#ffffff' : 'rgba(255,255,255,.75)'; ctx.beginPath(); ctx.arc(tx, ty, 8, 0, 7); ctx.fill();
      ctx.fillStyle = '#0b1328'; ctx.font = '700 ' + fz(11) + 'px ' + FONT2; ctx.textAlign = 'center'; ctx.fillText(String(n + 1), tx, ty + 0.5);
      px = tx; py = ty;
    });
    // l'électricien : médaillon à son initiale, traînée, anneau de progression
    var G = GUYS[S.who], gx = g.x, gy = g.y - 16;
    if (g.zap > 0 && !calm) { gx += (Math.random() - 0.5) * 5; gy += (Math.random() - 0.5) * 5; }
    for (var tr = 1; tr < g.trail.length; tr++) { ctx.strokeStyle = G.color; ctx.globalAlpha = tr / g.trail.length * 0.5; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(g.trail[tr - 1][0], g.trail[tr - 1][1]); ctx.lineTo(g.trail[tr][0], g.trail[tr][1]); ctx.stroke(); }
    ctx.globalAlpha = 1;
    var halo = ctx.createRadialGradient(gx, gy, 6, gx, gy, 30); halo.addColorStop(0, g.zap > 0 ? 'rgba(255,90,69,.45)' : 'rgba(255,255,255,.18)'); halo.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(gx, gy, 30, 0, 7); ctx.fill();
    ctx.fillStyle = '#0b1328'; ctx.beginPath(); ctx.arc(gx, gy, 14 * UI, 0, 7); ctx.fill();
    ctx.strokeStyle = g.zap > 0 ? RED : G.color; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(gx, gy, 14 * UI, 0, 7); ctx.stroke();
    ctx.fillStyle = '#ffffff'; ctx.font = '700 italic ' + fz(17) + 'px ' + FONT; ctx.textAlign = 'center'; ctx.fillText(G.ini, gx, gy + 1);
    if (g.fix > 0) { ctx.strokeStyle = YEL; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(gx, gy, 20 * UI, -Math.PI / 2, -Math.PI / 2 + (1 - g.fix / g.fixMax) * Math.PI * 2); ctx.stroke(); }
    if (g.zap > 0) { ctx.strokeStyle = RED; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(gx, gy, 20 * UI, -Math.PI / 2, -Math.PI / 2 + g.zap / 1.5 * Math.PI * 2); ctx.stroke(); }
    ctx.font = '600 ' + fz(11) + 'px ' + FONT2; ctx.fillStyle = 'rgba(255,255,255,.8)'; ctx.fillText(g.zap > 0 ? 'Électrisé' : g.fix > 0 ? 'Intervention' : G.name, gx, gy - 28 * UI);
    // étincelles et messages
    for (var i = parts.length - 1; i >= 0; i--) {
      var p = parts[i]; p.life -= 0.05; if (p.life <= 0) { parts.splice(i, 1); continue; }
      var ox = p.x, oy = p.y; p.x += p.vx / 60; p.y += p.vy / 60; p.vx *= 0.92; p.vy *= 0.92;
      ctx.strokeStyle = p.c; ctx.globalAlpha = p.life; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(p.x, p.y); ctx.stroke();
    }
    ctx.globalAlpha = 1;
    for (var j = floats.length - 1; j >= 0; j--) {
      var f = floats[j]; f.life -= 0.016; f.y -= 0.45; if (f.life <= 0) { floats.splice(j, 1); continue; }
      ctx.globalAlpha = Math.min(1, f.life * 2.2); ctx.font = (f.big ? '700 italic ' + fz(24) + 'px ' + FONT : '600 ' + fz(13) + 'px ' + FONT2); ctx.textAlign = 'center'; ctx.fillStyle = f.c; ctx.fillText(f.txt, f.x, f.y);
    }
    ctx.globalAlpha = 1;
  }

  // ======================================================================= interface
  var scoreEl = $('[data-score]'), comboEl = $('[data-combo]'), starsEl = $('[data-stars]'), timeBar = $('[data-time]'), timeTxt = $('[data-time-txt]');
  function hud() {
    scoreEl.textContent = S.score.toLocaleString('fr-FR');
    var m = mult(); comboEl.textContent = m > 1 ? 'Série ×' + String(m).replace('.', ',') : '';
    starsEl.innerHTML = ''; for (var i = 0; i < STARS; i++) { var s = document.createElement('span'); s.className = 'jstar' + (i < S.stars ? ' is-on' : ''); starsEl.appendChild(s); }
    starsEl.setAttribute('aria-label', S.stars + ' étoile' + (S.stars > 1 ? 's' : '') + ' de satisfaction client');
    game.querySelectorAll('[data-mono]').forEach(function (el) { el.textContent = GUYS[S.who].ini; el.dataset.who = S.who; });
    var nm = $('[data-me-name]'); if (nm) nm.textContent = GUYS[S.who].name;
  }
  function hudTime() { timeBar.style.transform = 'scaleX(' + Math.max(0, S.left / DURATION).toFixed(4) + ')'; timeTxt.textContent = Math.ceil(Math.max(0, S.left)) + ' s'; game.classList.toggle('is-late', S.run && S.left < 15); }
  function size() { var r = cv.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2); UI = r.width < 560 ? 1.7 : r.width < 760 ? 1.3 : 1; cv.width = Math.max(1, Math.round(r.width * d)); cv.height = Math.round(cv.width * H / W); }
  new ResizeObserver(size).observe(cv); size();

  // choix de l'électricien
  var charBtns = game.querySelectorAll('.jchar'), playBtn = $('[data-play]');
  function pick(w) {
    whoSel = w; try { localStorage.setItem('electriciain-jeu-perso', w); } catch (e) {}
    charBtns.forEach(function (b) { var on = b.dataset.char === w; b.classList.toggle('is-on', on); b.setAttribute('aria-checked', String(on)); });
    playBtn.textContent = 'Commencer avec ' + GUYS[w].name;
    if (S && !S.run) { S.who = w; hud(); }
  }
  charBtns.forEach(function (b) { b.addEventListener('click', function () { audio(); sfx.tap(); pick(b.dataset.char); }); });

  var screens = { start: $('[data-screen="start"]'), count: $('[data-screen="count"]'), over: $('[data-screen="over"]') };
  function show(n) { Object.keys(screens).forEach(function (k) { screens[k].hidden = k !== n; }); game.classList.toggle('is-playing', !n); }
  var BEST_KEY = 'electriciain-jeu-best3', best = 0; try { best = +localStorage.getItem(BEST_KEY) || 0; } catch (e) {}
  game.querySelectorAll('[data-best]').forEach(function (el) { el.textContent = best.toLocaleString('fr-FR'); });
  function start() {
    audio(); reset(); show('count');
    game.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'center' });
    var n = 3, el = screens.count.querySelector('[data-count]');
    (function step() {
      el.textContent = n > 0 ? n : 'Go'; el.classList.remove('is-pop'); void el.offsetWidth; el.classList.add('is-pop'); sfx.tick(n === 0);
      if (n === 0) { setTimeout(function () { show(null); S.run = true; cv.focus({ preventScroll: true }); say('Partie lancée'); }, 450); return; }
      n--; setTimeout(step, calm ? 450 : 650);
    })();
  }
  var RANKS = [[0, 'Apprenti'], [3000, 'Électricien'], [7000, 'Chef de chantier'], [12000, 'Maître électricien'], [18000, "Électrici'Ain d'or"]];
  function end() {
    if (!S.run) return; S.run = false; sfx.end();
    var s = S.score, rank = RANKS.filter(function (r) { return s >= r[0]; }).pop()[1], record = s > best;
    if (record) { best = s; try { localStorage.setItem(BEST_KEY, String(s)); } catch (e) {} }
    $('[data-final]').textContent = s.toLocaleString('fr-FR'); $('[data-rank]').textContent = rank;
    game.querySelectorAll('[data-best]').forEach(function (el) { el.textContent = best.toLocaleString('fr-FR'); });
    $('[data-record]').hidden = !record;
    $('[data-stats]').textContent = S.fixed + ' intervention' + (S.fixed > 1 ? 's' : '') + ' réussie' + (S.fixed > 1 ? 's' : '') + ' par ' + GUYS[S.who].name + ', meilleure série : ' + S.best + ', satisfaction : ' + Math.max(0, S.stars) + '/3.';
    show('over'); setTimeout(function () { $('[data-again]').focus({ preventScroll: true }); }, 60);
    say('Partie terminée : ' + s + ' points, grade ' + rank + '.');
  }
  game.querySelectorAll('[data-play], [data-again]').forEach(function (b) { b.addEventListener('click', start); });
  $('[data-change]').addEventListener('click', function () { show('start'); });
  var share = $('[data-share]');
  share.addEventListener('click', function () {
    var text = "J'ai fait " + S.score.toLocaleString('fr-FR') + ' points avec ' + GUYS[S.who].name + " à « Panne générale », le jeu des Électrici'Ain. À vous !";
    if (navigator.share) navigator.share({ title: 'Panne générale', text: text, url: location.href }).catch(function () {});
    else if (navigator.clipboard) navigator.clipboard.writeText(text + ' ' + location.href).then(function () { share.textContent = 'Lien copié'; setTimeout(function () { share.textContent = 'Défier un ami'; }, 1800); });
  });

  // ======================================================================= démarrage
  pick(whoSel); reset(); show('start');
  S.rooms[1].s = 'dark'; S.rooms[4].s = 'short';          // la maison vit déjà derrière l'écran d'accueil
  var last = performance.now();
  function loop(now) {
    var dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (shakeT > 0) shakeT -= dt;
    update(dt); draw(now / 1000);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
  window.__jeu = { get state() { return S; }, order: order };   // vérifications automatiques
})();
