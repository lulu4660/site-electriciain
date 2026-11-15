/* « Panne générale » : le jeu des Électrici'Ain.
   Maison en coupe, de nuit. Les pièces s'éteignent : touchez-les, votre électricien y court et répare.
   Court-circuit (étincelles rouges) : couper d'abord au tableau électrique de l'entrée, sinon coup de jus.
   Personnages dessinés et animés image par image (marche, escalier, échelle, réparation, électrocution). */
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

  // ======================================================================= personnages
  var GUYS = {
    aymeric: { name: 'Aymeric', polo: '#1f2c4d', poloHi: '#2b3c66', hair: '#3b271b', hairHi: '#5a3d2b', skin: '#efc19b', skinSh: '#d9a078', beard: true, speed: 1.25, fix: 1, gloves: 0 },
    louis: { name: 'Louis', polo: '#19191c', poloHi: '#2c2c31', hair: '#8a5b37', hairHi: '#a8744b', skin: '#f0c3a0', skinSh: '#daa47f', beard: false, speed: 1, fix: 1.45, gloves: 1, belt: true, watch: true },
  };
  var INK = '#1a2238';
  function rr(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
  function limb(c, x1, y1, x2, y2, w, col) { c.lineCap = 'round'; c.strokeStyle = INK; c.lineWidth = w + 4; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke(); c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke(); }
  /* dessine un électricien, pieds en (x, y). pose : { walk, climb, fix, zap, blink, dir, mood, t, portrait } */
  function drawGuy(c, who, x, y, s, p) {
    var g = GUYS[who], t = p.t || 0;
    c.save(); c.translate(x, y); c.scale(s * (p.dir || 1), s);
    var bob = p.walk ? Math.abs(Math.sin(p.walk * 2)) * 3 : Math.sin(t * 2.2) * 1.2;
    if (p.zap) c.translate(Math.sin(t * 90) * 2.5, 0);
    if (!p.portrait) { c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.ellipse(0, 0, 22, 5, 0, 0, Math.PI * 2); c.fill(); }
    c.translate(0, -bob);
    var sw = p.walk ? Math.sin(p.walk * 2) : 0, cl = p.climb ? Math.sin(p.climb * 3) : 0;
    // jambes
    var hipY = -46, legL = p.climb ? cl * 8 : sw * 11, legR = p.climb ? -cl * 8 : -sw * 11;
    var fL = p.climb && cl > 0 ? -8 : 0, fR = p.climb && cl < 0 ? -8 : 0;
    limb(c, -7, hipY, -7 + legL, -6 + fL, 11, '#2a3142');
    limb(c, 7, hipY, 7 + legR, -6 + fR, 11, '#2a3142');
    [[-7 + legL, fL], [7 + legR, fR]].forEach(function (f) { c.fillStyle = '#121620'; rr(c, f[0] - 8, f[1] - 9, 17, 9, 4); c.fill(); });
    // buste (polo)
    c.fillStyle = INK; rr(c, -21, -92, 42, 52, 14); c.fill();
    var grd = c.createLinearGradient(-19, -90, 19, -42); grd.addColorStop(0, g.poloHi); grd.addColorStop(1, g.polo);
    c.fillStyle = grd; rr(c, -19, -90, 38, 48, 12); c.fill();
    c.fillStyle = g.poloHi; c.beginPath(); c.moveTo(-9, -90); c.lineTo(0, -80); c.lineTo(9, -90); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(255,255,255,.18)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(0, -80); c.lineTo(0, -70); c.stroke();
    // logo brodé : maison bleue + éclair jaune
    c.save(); c.translate(8, -74); c.strokeStyle = '#4b86ea'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(-5, 1); c.lineTo(0, -4); c.lineTo(5, 1); c.lineTo(5, 6); c.lineTo(-5, 6); c.closePath(); c.stroke();
    c.strokeStyle = '#f7c600'; c.beginPath(); c.moveTo(1, -1); c.lineTo(-1, 2); c.lineTo(1, 2); c.lineTo(-1, 5); c.stroke(); c.restore();
    if (g.belt) { c.fillStyle = INK; c.fillRect(-20, -48, 40, 8); c.fillStyle = '#c9a774'; c.fillRect(-19, -47, 38, 6); c.fillStyle = '#6b5636'; c.fillRect(-4, -48, 8, 8); c.fillStyle = INK; rr(c, 10, -48, 10, 13, 2); c.fill(); c.fillStyle = '#a28157'; rr(c, 11, -47, 8, 11, 2); c.fill(); }
    // bras
    var sh = -84, aL, aR;
    if (p.fix) { var k = Math.sin(t * 18) * 3; aL = [-14, -102 + k]; aR = [16, -108 - k]; }
    else if (p.zap) { aL = [-26, -112]; aR = [26, -112]; }
    else if (p.climb) { aL = [-12, -110 - cl * 6]; aR = [12, -110 + cl * 6]; }
    else if (p.walk) { aL = [-16 - sw * 9, -56]; aR = [16 + sw * 9, -56]; }
    else if (p.portrait) { aL = null; aR = [-12, -60]; }
    else { aL = [-19, -54]; aR = [19, -54]; }
    // un bras : manche courte du polo (épaule -> 40 %), puis avant-bras nu, puis la main
    function arm(sx, a) {
      var mx = sx + (a[0] - sx) * 0.42, my = sh + (a[1] - sh) * 0.42;
      limb(c, sx, sh, a[0], a[1], 8, g.skin);
      limb(c, sx, sh, mx, my, 11, g.polo);
      c.fillStyle = INK; c.beginPath(); c.arc(a[0], a[1], 6.2, 0, 7); c.fill(); c.fillStyle = g.skin; c.beginPath(); c.arc(a[0], a[1], 4.6, 0, 7); c.fill();
    }
    if (p.portrait) {
      // bras croisés : manches le long du buste, avant-bras repliés l'un sur l'autre
      limb(c, -16, sh, -20, -66, 11, g.polo); limb(c, 16, sh, 20, -66, 11, g.polo);
      limb(c, -20, -64, 14, -60, 9, g.skinSh); limb(c, 20, -58, -14, -56, 9, g.skin);
      c.fillStyle = INK; c.beginPath(); c.arc(14, -61, 5.5, 0, 7); c.arc(-15, -56, 5.5, 0, 7); c.fill();
      c.fillStyle = g.skinSh; c.beginPath(); c.arc(14, -61, 4, 0, 7); c.fill(); c.fillStyle = g.skin; c.beginPath(); c.arc(-15, -56, 4, 0, 7); c.fill();
      if (g.watch) { c.fillStyle = '#0d0d0f'; rr(c, 6, -61, 6, 7, 1.5); c.fill(); }
      aR = [-15, -56];
    } else { arm(-15, aL); arm(15, aR); }
    if (g.watch && !p.fix && !p.zap && !p.portrait) { c.fillStyle = '#0d0d0f'; rr(c, aR[0] - 4, aR[1] - 10, 8, 6, 1.5); c.fill(); }
    if (p.fix) { c.strokeStyle = INK; c.lineWidth = 5; c.beginPath(); c.moveTo(aR[0], aR[1]); c.lineTo(aR[0] + 6, aR[1] - 14); c.stroke(); c.strokeStyle = '#f7c600'; c.lineWidth = 3; c.beginPath(); c.moveTo(aR[0], aR[1]); c.lineTo(aR[0] + 3, aR[1] - 7); c.stroke(); c.strokeStyle = '#c9ced6'; c.lineWidth = 2; c.beginPath(); c.moveTo(aR[0] + 3, aR[1] - 7); c.lineTo(aR[0] + 7, aR[1] - 16); c.stroke(); }
    // cou + tête
    c.fillStyle = INK; rr(c, -7, -100, 14, 14, 4); c.fill(); c.fillStyle = g.skinSh; rr(c, -5, -99, 10, 12, 3); c.fill();
    c.save(); c.translate(0, -122); c.rotate(p.zap ? 0 : Math.sin(t * 1.3) * 0.03);
    c.fillStyle = INK; c.beginPath(); c.ellipse(-20, 2, 6, 8, 0, 0, 7); c.ellipse(20, 2, 6, 8, 0, 0, 7); c.fill();
    c.fillStyle = g.skinSh; c.beginPath(); c.ellipse(-20, 2, 4, 6, 0, 0, 7); c.ellipse(20, 2, 4, 6, 0, 0, 7); c.fill();
    c.fillStyle = INK; c.beginPath(); c.ellipse(0, 0, 22, 25, 0, 0, 7); c.fill();
    c.fillStyle = g.skin; c.beginPath(); c.ellipse(0, 0, 20, 23, 0, 0, 7); c.fill();
    c.fillStyle = 'rgba(217,140,110,.35)'; c.beginPath(); c.ellipse(-11, 8, 4.5, 3, 0, 0, 7); c.ellipse(11, 8, 4.5, 3, 0, 0, 7); c.fill();
    if (g.beard) { c.fillStyle = 'rgba(59,39,27,.42)'; c.beginPath(); c.moveTo(-19, 2); c.quadraticCurveTo(-18, 24, 0, 24); c.quadraticCurveTo(18, 24, 19, 2); c.quadraticCurveTo(12, 14, 0, 14); c.quadraticCurveTo(-12, 14, -19, 2); c.fill(); }
    // cheveux
    c.strokeStyle = INK; c.lineWidth = 2.5;
    if (p.zap) { c.fillStyle = '#fff3a0'; c.beginPath(); for (var i = 0; i <= 10; i++) { var ang = Math.PI + i / 10 * Math.PI, r2 = i % 2 ? 22 : 36; c.lineTo(Math.cos(ang) * r2, -6 + Math.sin(ang) * r2); } c.closePath(); c.fill(); c.stroke(); }
    else if (who === 'aymeric') {
      // mèche brune relevée et rabattue sur le côté, côtés plus courts
      c.fillStyle = g.hair; c.beginPath(); c.moveTo(-20, 0); c.quadraticCurveTo(-23, -18, -15, -26); c.quadraticCurveTo(-6, -34, 7, -33); c.quadraticCurveTo(20, -31, 22, -20);
      c.quadraticCurveTo(24, -12, 20, 0); c.quadraticCurveTo(18, -10, 15, -14); c.quadraticCurveTo(6, -22, -6, -18); c.quadraticCurveTo(-13, -16, -16, -10); c.quadraticCurveTo(-18, -5, -20, 0); c.closePath(); c.fill(); c.stroke();
      c.strokeStyle = g.hairHi; c.lineWidth = 2; c.beginPath(); c.moveTo(-10, -26); c.quadraticCurveTo(4, -32, 17, -24); c.moveTo(-4, -21); c.quadraticCurveTo(8, -27, 17, -19); c.stroke();
      c.fillStyle = 'rgba(59,39,27,.35)'; c.beginPath(); c.ellipse(-19, -4, 3, 6, 0, 0, 7); c.ellipse(19, -4, 3, 6, 0, 0, 7); c.fill();
    } else {
      // coupe courte châtain, tempes dégagées
      c.fillStyle = g.hair; c.beginPath(); c.moveTo(-20, -2); c.quadraticCurveTo(-22, -22, -10, -29); c.quadraticCurveTo(0, -33, 10, -29); c.quadraticCurveTo(22, -22, 20, -2);
      c.quadraticCurveTo(18, -10, 15, -13); c.quadraticCurveTo(13, -21, 6, -20); c.quadraticCurveTo(0, -16, -6, -20); c.quadraticCurveTo(-13, -21, -15, -13); c.quadraticCurveTo(-18, -10, -20, -2); c.closePath(); c.fill(); c.stroke();
      c.strokeStyle = g.hairHi; c.lineWidth = 1.6; for (var hh = -12; hh <= 12; hh += 4) { c.beginPath(); c.moveTo(hh, -27); c.lineTo(hh + 1.5, -22); c.stroke(); }
    }
    // visage
    c.strokeStyle = g.hair; c.lineWidth = 2.6; c.lineCap = 'round';
    c.beginPath(); c.moveTo(-13, -8); c.quadraticCurveTo(-8, p.mood === 'sad' ? -6 : -11, -3, -8); c.moveTo(3, -8); c.quadraticCurveTo(8, p.mood === 'sad' ? -6 : -11, 13, -8); c.stroke();
    if (p.zap) { c.strokeStyle = INK; c.lineWidth = 2.4; c.beginPath(); c.moveTo(-11, -3); c.lineTo(-5, 3); c.moveTo(-5, -3); c.lineTo(-11, 3); c.moveTo(5, -3); c.lineTo(11, 3); c.moveTo(11, -3); c.lineTo(5, 3); c.stroke(); }
    else if (p.blink) { c.strokeStyle = INK; c.lineWidth = 2.2; c.beginPath(); c.moveTo(-11, 0); c.lineTo(-5, 0); c.moveTo(5, 0); c.lineTo(11, 0); c.stroke(); }
    else { [-8, 8].forEach(function (ex) { c.fillStyle = '#fff'; c.beginPath(); c.ellipse(ex, 0, 4.6, 5.2, 0, 0, 7); c.fill(); c.fillStyle = INK; c.beginPath(); c.arc(ex + 1, 1, 2.8, 0, 7); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.arc(ex + 2, -0.5, 1, 0, 7); c.fill(); }); }
    c.strokeStyle = g.skinSh; c.lineWidth = 2; c.beginPath(); c.moveTo(0, 2); c.quadraticCurveTo(-3, 8, 1, 9); c.stroke();
    c.strokeStyle = '#7a3b2e'; c.fillStyle = '#7a3b2e'; c.lineWidth = 2.4;
    if (p.zap) { c.beginPath(); c.ellipse(0, 15, 4, 5, 0, 0, 7); c.fill(); }
    else if (p.mood === 'happy' || p.fix) { c.beginPath(); c.moveTo(-8, 12); c.quadraticCurveTo(0, 21, 8, 12); c.closePath(); c.fill(); c.fillStyle = '#fff'; c.fillRect(-5, 12, 10, 2.5); }
    else if (p.mood === 'sad') { c.beginPath(); c.moveTo(-6, 17); c.quadraticCurveTo(0, 11, 6, 17); c.stroke(); }
    else { c.beginPath(); c.moveTo(-6, 13); c.quadraticCurveTo(1, 17, 7, 12); c.stroke(); }
    c.restore();
    if (p.zap) { c.strokeStyle = '#7fd4ff'; c.lineWidth = 2.5; c.globalAlpha = 0.6 + 0.4 * Math.sin(t * 60); for (var z = 0; z < 4; z++) { var a0 = z * 1.6 + t * 8; c.beginPath(); c.moveTo(Math.cos(a0) * 34, -80 + Math.sin(a0) * 50); c.lineTo(Math.cos(a0 + .4) * 46, -80 + Math.sin(a0 + .3) * 60); c.lineTo(Math.cos(a0 + .2) * 54, -80 + Math.sin(a0 + .5) * 66); c.stroke(); } c.globalAlpha = 1; }
    c.restore();
  }

  // ======================================================================= la maison
  var FY = [500, 360, 220];                 // sols : rez-de-chaussée, étage, combles
  var RANGE = [[24, 940], [132, 828], [282, 678]];
  var STAIRS = { bx: 548, tx: 640 };        // escalier : (548, 500) -> (640, 360)
  var LADDER = { x: 300 };                  // échelle : étage -> combles
  var ROOMS = [
    { id: 'cuisine', name: 'Cuisine', f: 0, x0: 128, x1: 368, spot: 300, wall: '#f3e7d3' },
    { id: 'salon', name: 'Salon', f: 0, x0: 368, x1: 608, spot: 440, wall: '#e3ebf3' },
    { id: 'entree', name: 'Entrée', f: 0, x0: 608, x1: 832, spot: 700, wall: '#efe6dd' },
    { id: 'chambre', name: 'Chambre', f: 1, x0: 128, x1: 368, spot: 220, wall: '#e9e2f1' },
    { id: 'sdb', name: 'Salle de bain', f: 1, x0: 368, x1: 608, spot: 470, wall: '#dcefee' },
    { id: 'bureau', name: 'Bureau', f: 1, x0: 608, x1: 832, spot: 740, wall: '#f2ecd6' },
    { id: 'combles', name: 'Combles', f: 2, x0: 278, x1: 682, spot: 560, wall: '#e8e1d6' },
    { id: 'jardin', name: 'Jardin', f: 0, x0: 20, x1: 118, spot: 64, out: true },
    { id: 'garage', name: 'Garage', f: 0, x0: 842, x1: 952, spot: 880, out: true },
  ];
  var TABLEAU = { x: 790, y: 432 };         // tableau électrique, dans l'entrée
  ROOMS.forEach(function (r, i) { r.i = i; r.top = r.f === 2 ? 120 : r.out ? 380 : FY[r.f] - 140; r.bot = FY[r.f]; });
  function roomPath(c, r) {
    c.beginPath();
    if (r.f === 2) { c.moveTo(r.x0, r.bot); c.lineTo(r.x1, r.bot); c.lineTo(r.x1 - 40, 175); c.lineTo(480, 92); c.lineTo(r.x0 + 40, 175); c.closePath(); }
    else c.rect(r.x0 + 4, r.top + 4, r.x1 - r.x0 - 8, r.bot - r.top - 6);
  }

  // décor statique, dessiné une fois
  var deco = document.createElement('canvas'); deco.width = W * 2; deco.height = H * 2;
  (function paintDeco() {
    var c = deco.getContext('2d'); c.scale(2, 2);
    var sky = c.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#0b1631'); sky.addColorStop(0.7, '#1c2f5c'); sky.addColorStop(1, '#2a3f6e');
    c.fillStyle = sky; c.fillRect(0, 0, W, H);
    var seed = 3, rnd = function () { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    for (var i = 0; i < 90; i++) { c.fillStyle = 'rgba(255,255,255,' + (0.3 + rnd() * 0.6) + ')'; c.beginPath(); c.arc(rnd() * W, rnd() * 260, rnd() * 1.4 + 0.3, 0, 7); c.fill(); }
    c.fillStyle = '#fff4c2'; c.beginPath(); c.arc(870, 80, 28, 0, 7); c.fill(); c.fillStyle = '#0f1c3c'; c.beginPath(); c.arc(882, 72, 25, 0, 7); c.fill();
    c.fillStyle = '#16264a'; c.beginPath(); c.moveTo(0, 470); c.quadraticCurveTo(200, 400, 420, 450); c.quadraticCurveTo(700, 380, 960, 440); c.lineTo(960, 600); c.lineTo(0, 600); c.fill();
    c.fillStyle = '#2f4a2e'; c.fillRect(0, 500, W, 100); c.fillStyle = '#3d5e39'; c.fillRect(0, 500, W, 8);
    c.fillStyle = '#25261f'; c.fillRect(0, 512, W, 88);
    for (var j = 0; j < 40; j++) { c.fillStyle = 'rgba(255,255,255,.04)'; c.fillRect(rnd() * W, 520 + rnd() * 70, 30 + rnd() * 40, 2); }
    // toit
    c.fillStyle = INK; c.beginPath(); c.moveTo(96, 224); c.lineTo(480, 52); c.lineTo(864, 224); c.closePath(); c.fill();
    c.fillStyle = '#2a5cb3'; c.beginPath(); c.moveTo(108, 220); c.lineTo(480, 60); c.lineTo(852, 220); c.closePath(); c.fill();
    c.fillStyle = '#e9ecef'; c.fillRect(120, 220, 720, 284);
    ROOMS.forEach(function (r) {
      if (r.out) return;
      c.save(); roomPath(c, r); c.clip();
      c.fillStyle = r.wall; c.fillRect(r.x0, r.top - 120, r.x1 - r.x0, 300);
      c.fillStyle = 'rgba(0,0,0,.035)'; for (var x = r.x0; x < r.x1; x += 18) c.fillRect(x, r.top - 60, 2, 200);
      c.fillStyle = '#c9a577'; c.fillRect(r.x0, r.bot - 10, r.x1 - r.x0, 10); c.fillStyle = '#b08a5e'; for (var px = r.x0; px < r.x1; px += 26) c.fillRect(px, r.bot - 10, 1.5, 10);
      furniture(c, r);
      c.restore();
    });
    // structure : planchers, murs, cloisons
    c.fillStyle = '#5a6272';
    [360, 220].forEach(function (y) { c.fillRect(120, y - 4, 720, 10); });
    c.fillRect(116, 220, 10, 284); c.fillRect(834, 220, 10, 284); c.fillRect(116, 498, 728, 8);
    [368, 608].forEach(function (x) { c.fillRect(x - 3, 364, 6, 60); c.fillRect(x - 3, 224, 6, 66); });
    // escalier
    var n = 9, stw = (STAIRS.tx - STAIRS.bx) / n;
    for (var s = 0; s < n; s++) { var sx = STAIRS.bx + s * stw, sy = 500 - (s + 1) * (140 / n); c.fillStyle = INK; c.fillRect(sx, sy, stw + 2, 500 - sy); c.fillStyle = s % 2 ? '#9a7550' : '#8b6a48'; c.fillRect(sx + 1, sy + 2, stw, 500 - sy - 2); }
    c.strokeStyle = '#5a4430'; c.lineWidth = 3; c.beginPath(); c.moveTo(STAIRS.bx, 470); c.lineTo(STAIRS.tx, 330); c.stroke();
    // échelle
    c.strokeStyle = '#a07a4c'; c.lineWidth = 4; c.beginPath(); c.moveTo(LADDER.x - 12, 360); c.lineTo(LADDER.x - 12, 205); c.moveTo(LADDER.x + 12, 360); c.lineTo(LADDER.x + 12, 205); c.stroke();
    c.lineWidth = 3; for (var l = 0; l < 7; l++) { c.beginPath(); c.moveTo(LADDER.x - 12, 350 - l * 22); c.lineTo(LADDER.x + 12, 350 - l * 22); c.stroke(); }
    // garage et voiture
    c.fillStyle = '#5a6272'; c.fillRect(840, 380, 116, 8); c.fillRect(950, 380, 6, 124);
    c.fillStyle = '#cfd3d7'; c.fillRect(844, 388, 106, 112);
    c.fillStyle = INK; rr(c, 846, 446, 98, 38, 12); c.fill(); c.fillStyle = '#2a5cb3'; rr(c, 848, 448, 94, 34, 11); c.fill();
    c.fillStyle = INK; rr(c, 862, 426, 62, 26, 10); c.fill(); c.fillStyle = '#9cc0ec'; rr(c, 865, 429, 56, 20, 8); c.fill();
    [870, 920].forEach(function (wx) { c.fillStyle = INK; c.beginPath(); c.arc(wx, 486, 11, 0, 7); c.fill(); c.fillStyle = '#9aa1ab'; c.beginPath(); c.arc(wx, 486, 5, 0, 7); c.fill(); });
    c.fillStyle = INK; rr(c, 930, 408, 18, 38, 5); c.fill(); c.fillStyle = '#fff'; rr(c, 932, 410, 14, 34, 4); c.fill(); c.fillStyle = '#2a5cb3'; c.fillRect(935, 416, 8, 8);
    // jardin : lampadaire, buissons
    c.fillStyle = '#2b3550'; c.fillRect(61, 392, 6, 110); rr(c, 52, 384, 24, 10, 3); c.fill();
    [[30, 500, 18], [102, 500, 14]].forEach(function (b) { c.fillStyle = '#3f6a3b'; c.beginPath(); c.arc(b[0], b[1] - 2, b[2], Math.PI, 0); c.fill(); });
  })();

  function furniture(c, r) {
    var b = r.bot - 10, box = function (x, y, w, h, col, rad) { c.fillStyle = INK; rr(c, x - 2, y - 2, w + 4, h + 4, (rad || 3) + 1); c.fill(); c.fillStyle = col; rr(c, x, y, w, h, rad || 3); c.fill(); };
    switch (r.id) {
      case 'cuisine': box(140, b - 46, 150, 46, '#ffffff'); box(140, b - 52, 150, 8, '#c9a577', 2); box(296, b - 92, 52, 92, '#f4f6f8', 6); box(150, r.top + 30, 120, 30, '#ffffff');
        c.fillStyle = '#333'; c.fillRect(196, b - 54, 26, 3); c.fillStyle = '#9aa1ab'; c.fillRect(340, b - 70, 3, 16); break;
      case 'salon': box(390, b - 40, 110, 40, '#2a5cb3', 10); box(390, b - 58, 110, 22, '#2a5cb3', 10); box(512, b - 22, 40, 22, '#c9a577');
        box(420, r.top + 34, 70, 44, '#22262e'); c.fillStyle = '#3a6fb8'; c.fillRect(424, r.top + 38, 62, 36); break;
      case 'entree': box(640, b - 100, 44, 100, '#b98d5d'); c.fillStyle = '#f7c600'; c.beginPath(); c.arc(676, b - 50, 3, 0, 7); c.fill(); box(726, b - 60, 8, 60, '#6b5636', 2); break;
      case 'chambre': box(150, b - 30, 130, 30, '#ffffff', 6); box(150, b - 48, 18, 48, '#b98d5d'); box(176, b - 38, 104, 12, '#2a5cb3', 4); box(300, b - 34, 34, 34, '#c9a577'); break;
      case 'sdb': box(384, b - 34, 110, 34, '#ffffff', 14); c.fillStyle = '#8fd0ec'; rr(c, 392, b - 30, 94, 12, 6); c.fill(); box(530, b - 46, 40, 46, '#ffffff', 4); box(536, r.top + 36, 30, 40, '#bfe3f3', 4); break;
      case 'bureau': box(640, b - 50, 120, 8, '#c9a577', 2); box(648, b - 42, 8, 42, '#8b6a48', 1); box(744, b - 42, 8, 42, '#8b6a48', 1); box(680, b - 86, 46, 32, '#22262e'); c.fillStyle = '#5bd08a'; c.fillRect(684, b - 82, 38, 24); box(780, b - 70, 34, 70, '#b98d5d'); break;
      case 'combles': box(470, b - 44, 90, 44, '#dfe3e8', 6); c.fillStyle = INK; c.beginPath(); c.arc(515, b - 22, 15, 0, 7); c.fill(); c.fillStyle = '#9aa1ab'; c.beginPath(); c.arc(515, b - 22, 12, 0, 7); c.fill();
        box(330, b - 30, 40, 30, '#c9a577'); box(600, b - 24, 46, 24, '#c9a577'); break;
    }
  }

  // ======================================================================= état de la partie
  var whoSel = 'aymeric'; try { whoSel = localStorage.getItem('electriciain-jeu-perso') || 'aymeric'; } catch (e) {}
  if (!GUYS[whoSel]) whoSel = 'aymeric';
  var S, parts = [], floats = [];
  function reset() {
    S = { run: false, t: 0, left: DURATION, score: 0, combo: 0, best: 0, fixed: 0, stars: STARS, next: 1.6, who: whoSel,
      gloves: GUYS[whoSel].gloves, queue: [],
      rooms: ROOMS.map(function () { return { s: 'ok', since: 0, flick: 0 }; }),
      guy: { f: 0, x: 470, y: 500, dir: 1, walk: 0, climb: 0, fix: 0, zap: 0, path: [], task: null, mood: '', moodT: 0, blinkT: 2 } };
    parts.length = 0; floats.length = 0; hud(); hudTime();
  }

  // ======================================================================= déplacements
  function pathTo(f, x) {
    var g = S.guy, pts = [], cf = g.f;
    function walkTo(fl, xx) { pts.push({ f: fl, x: Math.max(RANGE[fl][0], Math.min(RANGE[fl][1], xx)), y: FY[fl], mode: 'walk' }); }
    var guard = 0;
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
    g.path = t.type === 'room' ? pathTo(ROOMS[t.i].f, ROOMS[t.i].spot) : pathTo(0, TABLEAU.x - 26);
  }
  function order(t) {
    if (!S.run) return;
    audio();
    var busy = S.queue.concat(S.guy.task ? [S.guy.task] : []).some(function (q) { return q.type === t.type && q.i === t.i; });
    if (busy) return;
    if (t.type === 'room' && S.rooms[t.i].s === 'ok') { floatText('Tout fonctionne ici', ROOMS[t.i].spot, ROOMS[t.i].top + 40, '#cfe0ff'); return; }
    if (S.queue.length >= 3) { floatText('3 interventions d\'avance au maximum', S.guy.x, S.guy.y - 110, '#ffb4a6'); sfx.no(); return; }
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
      if (p.x >= r.x0 && p.x <= r.x1 && p.y >= r.top - (r.out ? 30 : 0) && p.y <= r.bot + 10) { order({ type: 'room', i: i }); return; }
    }
  });
  addEventListener('keydown', function (e) {
    if (!S || !S.run) return;
    var k = e.key.toLowerCase();
    if (k === 't') { order({ type: 'tableau' }); e.preventDefault(); return; }
    var n = parseInt(k, 10); if (n >= 1 && n <= ROOMS.length) { order({ type: 'room', i: n - 1 }); e.preventDefault(); }
  });

  // ======================================================================= sons (synthétisés, aucun fichier)
  var ac = null, master = null, muted = false;
  try { muted = localStorage.getItem('electriciain-jeu-mute') === '1'; } catch (e) {}
  var muteBtn = document.querySelector('[data-mute]');
  function syncMute() { muteBtn.setAttribute('aria-pressed', String(muted)); muteBtn.textContent = muted ? 'Son coupé' : 'Son activé'; if (master) master.gain.value = muted ? 0 : 0.55; }
  syncMute(); muteBtn.addEventListener('click', function () { muted = !muted; try { localStorage.setItem('electriciain-jeu-mute', muted ? '1' : '0'); } catch (e) {} syncMute(); });
  function audio() { if (ac) return; try { ac = new (window.AudioContext || window.webkitAudioContext)(); master = ac.createGain(); master.gain.value = muted ? 0 : 0.55; master.connect(ac.destination); } catch (e) { ac = null; } }
  function tone(type, f0, f1, dur, vol, delay) { if (!ac) return; var t = ac.currentTime + (delay || 0), o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.02); }
  function noise(dur, vol, freq, q) { if (!ac) return; var t = ac.currentTime, n = Math.floor(ac.sampleRate * dur), buf = ac.createBuffer(1, n, ac.sampleRate), d = buf.getChannelData(0); for (var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2); var s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = buf; f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = q; g.gain.value = vol; s.connect(f); f.connect(g); g.connect(master); s.start(t); }
  var sfx = {
    tap: function () { tone('sine', 740, 990, 0.08, 0.12); },
    no: function () { tone('square', 200, 150, 0.12, 0.08); },
    out: function () { noise(0.08, 0.4, 900, 1.5); tone('triangle', 330, 110, 0.25, 0.12); },
    fixed: function (c) { var p = 1 + Math.min(c, 12) * 0.04; noise(0.05, 0.7, 2600, 1.2); [660, 880, 1320].forEach(function (f, i) { tone('sine', f * p, f * p, 0.14, 0.12, 0.04 + i * 0.05); }); },
    zap: function () { tone('sawtooth', 1100, 50, 0.5, 0.22); noise(0.45, 0.5, 3200, 0.8); },
    cut: function () { noise(0.06, 0.9, 1800, 1); tone('square', 160, 80, 0.12, 0.12); },
    lose: function () { tone('sine', 392, 196, 0.5, 0.18); },
    step: function () { noise(0.03, 0.12, 500, 2); },
    tick: function (hi) { tone('sine', hi ? 1320 : 880, hi ? 1320 : 880, 0.12, 0.18); },
    end: function () { [523, 659, 784, 1046].forEach(function (f, i) { tone('triangle', f, f, 0.28, 0.15, i * 0.12); }); },
  };
  var vib = function (p) { if (navigator.vibrate && !calm) try { navigator.vibrate(p); } catch (e) {} };

  // ======================================================================= effets
  function sparks(x, y, col, n, sp) { if (calm) n = Math.min(n, 5); for (var i = 0; i < n; i++) { var a = Math.random() * Math.PI * 2, v = (0.3 + Math.random()) * sp; parts.push({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - sp * 0.5, life: 1, c: col }); } }
  function floatText(txt, x, y, col, big) { floats.push({ txt: txt, x: Math.max(110, Math.min(W - 110, x)), y: y, c: col, life: 1, big: big }); }
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
    if (t.type === 'tableau') { g.dir = 1; g.fix = 0.45 / GUYS[S.who].fix; return; }
    var r = S.rooms[t.i];
    if (r.s === 'ok') { g.task = null; startNext(); return; }
    if (r.s === 'short') {
      if (S.gloves > 0) { S.gloves--; floatText('Gants isolants !', g.x, g.y - 110, '#9fd0ff', true); g.fix = 0.9 / GUYS[S.who].fix; return; }
      g.zap = 1.5; g.task = null; S.combo = 0; sfx.zap(); vib([80, 40, 120]); shakeT = 0.45;
      sparks(g.x, g.y - 60, '#7fd4ff', 30, 260); sparks(g.x, g.y - 60, '#ffffff', 12, 200);
      floatText('Coup de jus !', g.x, g.y - 115, '#ff8a70', true); say('Coup de jus ! Coupez au tableau avant de réparer un court-circuit.');
      hud(); return;
    }
    g.fix = 0.9 / GUYS[S.who].fix;
  }
  function finishFix() {
    var g = S.guy, t = g.task; g.task = null;
    if (t.type === 'tableau') {
      var n = 0; S.rooms.forEach(function (r) { if (r.s === 'short') { r.s = 'dark'; n++; } });
      sfx.cut(); floatText(n ? 'Coupé : ' + n + ' court-circuit' + (n > 1 ? 's' : '') + ' sécurisé' + (n > 1 ? 's' : '') : 'Rien à couper', TABLEAU.x - 60, TABLEAU.y - 66, '#ffe14d');
      sparks(TABLEAU.x, TABLEAU.y, '#f7c600', 12, 160);
      startNext(); return;
    }
    var r = S.rooms[t.i], room = ROOMS[t.i];
    var left = Math.max(0, patience() - (S.t - r.since));
    S.combo++; S.best = Math.max(S.best, S.combo); S.fixed++;
    var pts = Math.round((100 + left * 15) * mult());
    S.score += pts; r.s = 'ok'; r.flick = 0.45;
    sfx.fixed(S.combo); vib(15);
    sparks(room.spot, room.top + 30, '#ffd54a', 22, 220);
    floatText('+' + pts, room.spot, room.top + 50, '#ffe14d', true);
    if (S.combo % 4 === 0) { floatText('Série ×' + String(mult()).replace('.', ','), room.spot, room.top + 80, '#ffffff'); g.mood = 'happy'; g.moodT = 1.2; }
    say(room.name + ' : réparé. ' + S.score + ' points.');
    hud(); startNext();
  }
  function loseStar(i) {
    S.stars--; S.combo = 0; S.rooms[i].s = 'ok'; sfx.lose(); vib(60);
    floatText('Client mécontent', ROOMS[i].spot, ROOMS[i].top + 40, '#ff8a70', true);
    S.guy.mood = 'sad'; S.guy.moodT = 1.2;
    S.queue = S.queue.filter(function (q) { return !(q.type === 'room' && q.i === i); });
    if (S.guy.task && S.guy.task.type === 'room' && S.guy.task.i === i) { S.guy.task = null; S.guy.path = []; S.guy.fix = 0; startNext(); }
    hud(); game.classList.remove('is-hurt'); void game.offsetWidth; game.classList.add('is-hurt');
    if (S.stars <= 0) end();
  }

  // ======================================================================= simulation
  var stepT = 0;
  function update(dt) {
    var g = S.guy, G = GUYS[S.who];
    g.blinkT -= dt; if (g.blinkT < -0.12) g.blinkT = 2 + Math.random() * 3;
    if (g.moodT > 0) { g.moodT -= dt; if (g.moodT <= 0) g.mood = ''; }
    S.rooms.forEach(function (r) { if (r.flick > 0) r.flick -= dt; });
    if (!S.run) return;
    S.t += dt; S.left -= dt;
    if (S.t >= S.next) { breakRoom(); if (S.t > 35 && Math.random() < 0.3) breakRoom(); S.next = S.t + spawnGap() * (0.7 + Math.random() * 0.6); }
    for (var i = 0; i < S.rooms.length; i++) { var r = S.rooms[i]; if ((r.s === 'dark' || r.s === 'short') && S.t - r.since > patience()) loseStar(i); if (!S.run) return; }
    if (g.zap > 0) { g.zap -= dt; if (g.zap <= 0) { g.zap = 0; startNext(); } }
    else if (g.fix > 0) { g.fix -= dt; if (Math.random() < 0.5) sparks(g.x + 16 * g.dir, g.y - 74, '#ffd54a', 1, 120); if (g.fix <= 0) { g.fix = 0; finishFix(); } }
    else if (g.path.length) {
      var p = g.path[0];
      if (p.mode === 'walk') {
        var dx = p.x - g.x; if (Math.abs(dx) > 0.5) g.dir = dx > 0 ? 1 : -1;
        g.x += g.dir * Math.min(Math.abs(dx), 230 * G.speed * dt); g.walk += dt * 7 * G.speed; g.climb = 0;
        stepT -= dt; if (stepT <= 0) { sfx.step(); stepT = 0.26 / G.speed; }
        if (Math.abs(p.x - g.x) < 0.6) { g.x = p.x; g.path.shift(); if (!g.path.length) { g.walk = 0; arrive(); } }
      } else {
        var ddx = p.x - g.x, ddy = p.y - g.y, d = Math.hypot(ddx, ddy), v = (p.mode === 'ladder' ? 150 : 190) * G.speed * dt;
        if (d <= v) { g.x = p.x; g.y = p.y; g.f = p.f; g.path.shift(); g.climb = 0; if (!g.path.length) arrive(); }
        else { g.x += ddx / d * v; g.y += ddy / d * v; if (Math.abs(ddx) > 1) g.dir = ddx > 0 ? 1 : -1; if (p.mode === 'ladder') { g.climb += dt * 6; g.walk = 0; } else { g.walk += dt * 7; g.climb = 0; } }
      }
    } else { g.walk = 0; g.climb = 0; }
    if (S.left <= 0) end();
    hudTime();
  }

  // ======================================================================= rendu
  function draw(t) {
    var sc = cv.width / W;
    ctx.setTransform(sc, 0, 0, sc, 0, 0);
    if (shakeT > 0 && !calm) ctx.translate((Math.random() - 0.5) * 12 * shakeT, (Math.random() - 0.5) * 12 * shakeT);
    ctx.drawImage(deco, 0, 0, W, H);
    ROOMS.forEach(function (room, i) {
      var r = S.rooms[i], top = room.top, lx = room.spot, ly = top + 18;
      if (room.id === 'jardin') { lx = 64; ly = 390; }
      if (room.id === 'garage') { lx = 896; ly = 396; }
      ctx.save(); roomPath(ctx, room); ctx.clip();
      if (r.s === 'ok') {
        var fl = r.flick > 0 && Math.sin(t * 60) > 0 ? 0.3 : 0;
        var gl = ctx.createRadialGradient(lx, ly, 4, lx, ly, room.out ? 110 : 210);
        gl.addColorStop(0, 'rgba(255,214,120,' + (0.55 - fl) + ')'); gl.addColorStop(1, 'rgba(255,214,120,0)');
        ctx.fillStyle = gl; ctx.fillRect(room.x0 - 100, top - 100, room.x1 - room.x0 + 200, 400);
      } else {
        ctx.fillStyle = 'rgba(6,12,30,.80)'; ctx.fillRect(room.x0 - 50, top - 120, room.x1 - room.x0 + 100, 400);
        if (r.s === 'short') {
          ctx.fillStyle = 'rgba(255,50,30,' + (0.16 + 0.12 * Math.sin(t * 14)) + ')'; ctx.fillRect(room.x0 - 50, top - 120, room.x1 - room.x0 + 100, 400);
          if (Math.random() < 0.3) sparks(room.x0 + 30 + Math.random() * (room.x1 - room.x0 - 60), room.bot - 24 - Math.random() * 60, Math.random() < 0.5 ? '#ff6a4d' : '#ffe14d', 2, 140);
        }
      }
      ctx.restore();
      if (!room.out && room.f !== 2) { ctx.strokeStyle = '#3a4050'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(lx, top + 4); ctx.lineTo(lx, top + 12); ctx.stroke(); }
      ctx.fillStyle = r.s === 'ok' ? '#ffe7a0' : r.s === 'short' ? (Math.sin(t * 20) > 0 ? '#ff6a4d' : '#552') : '#3a4050';
      ctx.beginPath(); ctx.arc(lx, ly, 7, 0, 7); ctx.fill();
      if (r.s !== 'ok') {
        var k = Math.max(0, 1 - (S.t - r.since) / patience()), bx = room.spot, by = room.out ? top - 26 : top + 52;
        ctx.fillStyle = 'rgba(10,16,34,.88)'; ctx.beginPath(); ctx.arc(bx, by, 19, 0, 7); ctx.fill();
        ctx.strokeStyle = k > 0.5 ? '#7ee08a' : k > 0.25 ? '#f7c600' : '#ff5a3c'; ctx.lineWidth = 4; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.arc(bx, by, 15, -Math.PI / 2, -Math.PI / 2 + k * Math.PI * 2); ctx.stroke();
        ctx.fillStyle = r.s === 'short' ? '#ff8a70' : '#ffffff'; ctx.font = '700 19px "Barlow Condensed", sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(r.s === 'short' ? '⚡' : '!', bx, by + 1);
        if (k < 0.3 && Math.sin(t * 10) > 0) { ctx.strokeStyle = 'rgba(255,90,60,.7)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(bx, by, 25, 0, 7); ctx.stroke(); }
      }
    });
    // tableau électrique
    var anyShort = S.rooms.some(function (r) { return r.s === 'short'; });
    ctx.fillStyle = INK; rr(ctx, TABLEAU.x - 24, TABLEAU.y - 32, 48, 64, 6); ctx.fill();
    ctx.fillStyle = '#fcfcfa'; rr(ctx, TABLEAU.x - 21, TABLEAU.y - 29, 42, 58, 5); ctx.fill();
    for (var m = 0; m < 6; m++) { var mx = TABLEAU.x - 13 + (m % 3) * 12, my = TABLEAU.y - 16 + Math.floor(m / 3) * 26; ctx.fillStyle = '#2b2e31'; ctx.fillRect(mx - 3, my, 7, 16); ctx.fillStyle = anyShort && m === Math.floor(t * 6) % 6 ? '#ff5a3c' : '#f7c600'; ctx.fillRect(mx - 3, my - 5, 7, 3); }
    if (anyShort) {
      ctx.strokeStyle = 'rgba(247,198,0,' + (0.5 + 0.5 * Math.sin(t * 8)) + ')'; ctx.lineWidth = 3; rr(ctx, TABLEAU.x - 30, TABLEAU.y - 38, 60, 76, 9); ctx.stroke();
      ctx.font = '700 italic 17px "Barlow Condensed", sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.strokeText('Couper ici', TABLEAU.x - 6, TABLEAU.y - 52); ctx.fillStyle = '#ffe14d'; ctx.fillText('Couper ici', TABLEAU.x - 6, TABLEAU.y - 52);
    }
    // interventions programmées (numérotées)
    var list = (S.guy.task ? [S.guy.task] : []).concat(S.queue);
    list.forEach(function (q, n) {
      var x = q.type === 'tableau' ? TABLEAU.x + 28 : ROOMS[q.i].spot + 30, y = q.type === 'tableau' ? TABLEAU.y - 40 : (ROOMS[q.i].out ? ROOMS[q.i].top - 26 : ROOMS[q.i].top + 30);
      ctx.fillStyle = n === 0 ? '#f7c600' : '#ffffff'; ctx.strokeStyle = INK; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(x, y, 12, 0, 7); ctx.fill(); ctx.stroke();
      ctx.fillStyle = INK; ctx.font = '700 15px "Barlow Condensed", sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(String(n + 1), x, y + 1);
    });
    // l'électricien
    var g = S.guy;
    drawGuy(ctx, S.who, g.x, g.y, 0.62, { walk: g.walk, climb: g.climb, fix: g.fix > 0, zap: g.zap > 0, blink: g.blinkT < 0, dir: g.dir, mood: g.mood, t: t });
    // étincelles et textes
    for (var i = parts.length - 1; i >= 0; i--) {
      var p = parts[i]; p.life -= 0.04; if (p.life <= 0) { parts.splice(i, 1); continue; }
      var ox = p.x, oy = p.y; p.vy += 11.7; p.x += p.vx / 60; p.y += p.vy / 60;
      ctx.strokeStyle = p.c; ctx.globalAlpha = p.life; ctx.lineWidth = 2.2; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(p.x, p.y); ctx.stroke();
    }
    ctx.globalAlpha = 1;
    for (var j = floats.length - 1; j >= 0; j--) {
      var f = floats[j]; f.life -= 0.018; f.y -= 0.7; if (f.life <= 0) { floats.splice(j, 1); continue; }
      ctx.globalAlpha = Math.min(1, f.life * 2); ctx.font = (f.big ? '700 italic 28px' : '700 italic 20px') + ' "Barlow Condensed", sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(10,16,34,.85)'; ctx.strokeText(f.txt, f.x, f.y); ctx.fillStyle = f.c; ctx.fillText(f.txt, f.x, f.y);
    }
    ctx.globalAlpha = 1;
  }

  // ======================================================================= interface
  var scoreEl = $('[data-score]'), comboEl = $('[data-combo]'), starsEl = $('[data-stars]'), timeBar = $('[data-time]'), timeTxt = $('[data-time-txt]');
  function hud() {
    scoreEl.textContent = S.score.toLocaleString('fr-FR');
    var m = mult(); comboEl.textContent = m > 1 ? 'Série ×' + String(m).replace('.', ',') : '';
    starsEl.innerHTML = ''; for (var i = 0; i < STARS; i++) { var s = document.createElement('span'); s.className = 'jstar' + (i < S.stars ? ' is-on' : ''); starsEl.appendChild(s); }
    starsEl.setAttribute('aria-label', S.stars + ' étoile' + (S.stars > 1 ? 's' : '') + ' d\'avis client');
  }
  function hudTime() { timeBar.style.transform = 'scaleX(' + Math.max(0, S.left / DURATION).toFixed(4) + ')'; timeTxt.textContent = Math.ceil(Math.max(0, S.left)) + ' s'; game.classList.toggle('is-late', S.run && S.left < 15); }
  function size() { var r = cv.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2); cv.width = Math.max(1, Math.round(r.width * d)); cv.height = Math.round(cv.width * H / W); }
  new ResizeObserver(size).observe(cv); size();

  // portraits animés (choix, tableau de bord, fin de partie)
  var portraitCvs = [].slice.call(game.querySelectorAll('canvas[data-portrait]'));
  var pBlink = { aymeric: 3, louis: 4.5 };
  function portraits(t, dt) {
    pBlink.aymeric -= dt; pBlink.louis -= dt;
    ['aymeric', 'louis'].forEach(function (w) { if (pBlink[w] < -0.12) pBlink[w] = 2 + Math.random() * 3; });
    portraitCvs.forEach(function (c) {
      if (!c.offsetParent) return;
      var who = c.dataset.portrait === 'me' ? S.who : c.dataset.portrait, x = c.getContext('2d'), d = Math.min(devicePixelRatio || 1, 2);
      var w = Math.round(c.clientWidth * d), h = Math.round(c.clientHeight * d); if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
      x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, w, h);
      var mood = c.dataset.mood || (c.dataset.portrait === 'me' ? (S.guy.zap > 0 ? 'zap' : S.guy.mood) : (c.closest('.jchar') && c.closest('.jchar').classList.contains('is-on') ? 'happy' : ''));
      drawGuy(x, who, w / 2, h * 1.45, h / 118, { portrait: true, blink: pBlink[who] < 0, dir: 1, mood: mood === 'zap' ? '' : mood, zap: mood === 'zap', t: t + (who === 'louis' ? 1 : 0) });
    });
  }

  // choix du personnage
  var charBtns = game.querySelectorAll('.jchar'), playBtn = $('[data-play]');
  function pick(w) {
    whoSel = w; try { localStorage.setItem('electriciain-jeu-perso', w); } catch (e) {}
    charBtns.forEach(function (b) { var on = b.dataset.char === w; b.classList.toggle('is-on', on); b.setAttribute('aria-checked', String(on)); });
    playBtn.textContent = 'Jouer avec ' + GUYS[w].name;
    if (S && !S.run) S.who = w;
  }
  charBtns.forEach(function (b) { b.addEventListener('click', function () { audio(); sfx.tap(); pick(b.dataset.char); }); });

  var screens = { start: $('[data-screen="start"]'), count: $('[data-screen="count"]'), over: $('[data-screen="over"]') };
  function show(n) { Object.keys(screens).forEach(function (k) { screens[k].hidden = k !== n; }); game.classList.toggle('is-playing', !n); }
  var BEST_KEY = 'electriciain-jeu-best2', best = 0; try { best = +localStorage.getItem(BEST_KEY) || 0; } catch (e) {}
  game.querySelectorAll('[data-best]').forEach(function (el) { el.textContent = best.toLocaleString('fr-FR'); });
  function start() {
    audio(); reset(); show('count');
    game.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'center' });
    var n = 3, el = screens.count.querySelector('[data-count]');
    (function step() {
      el.textContent = n > 0 ? n : 'Au boulot !'; el.classList.remove('is-pop'); void el.offsetWidth; el.classList.add('is-pop'); sfx.tick(n === 0);
      if (n === 0) { setTimeout(function () { show(null); S.run = true; cv.focus({ preventScroll: true }); say('Partie lancée'); }, 500); return; }
      n--; setTimeout(step, calm ? 500 : 700);
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
    $('[data-stats]').textContent = GUYS[S.who].name + ' a réparé ' + S.fixed + ' panne' + (S.fixed > 1 ? 's' : '') + ', meilleure série : ' + S.best + '.';
    $('[data-portrait="me"][data-end]').dataset.mood = S.stars > 0 || record ? 'happy' : 'sad';
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
    update(dt); draw(now / 1000); portraits(now / 1000, dt);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
  window.__jeu = { get state() { return S; }, order: order };   // vérifications automatiques
})();
