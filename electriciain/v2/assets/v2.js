/* Les Électrici'Ain, version 2 : la maison tracée d'un trait, le câble qui suit la lecture, les scènes animées. */
(function () {
  'use strict';
  var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var doc = document.documentElement;

  // ---------- la maison du logo, redessinée à la taille de l'écran ----------
  var hero = document.querySelector('.hero');
  function drawHouse() {
    if (!hero) return;
    var stage = hero.querySelector('.hero__stage'), svg = hero.querySelector('.hero__house');
    var w = stage.clientWidth, h = stage.clientHeight, m = 8;
    var roof = Math.max(110, Math.min(300, w * 0.27)) - 4;   // hauteur du bas du toit (même valeur que le CSS)
    var peakX = w * 0.42, bottom = h - m, plugX = w - 46;
    var slope = function (x) { return m + (x - peakX) * (roof - m) / (w - m - peakX); };   // pan droit du toit
    var c1 = peakX + (w - m - peakX) * 0.32, c2 = c1 + Math.max(34, w * 0.07);
    var top = slope(c1) - Math.max(34, h * 0.07);
    var d = ['M', w - m, roof, 'L', c2, slope(c2), 'V', top, 'H', c1, 'V', slope(c1), 'L', peakX, m,
             'L', m, roof, 'V', bottom, 'H', plugX].join(' ');
    svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
    var line = svg.querySelector('.hero__line');
    line.setAttribute('d', d); line.setAttribute('pathLength', '1');
    svg.querySelector('.hero__plug').setAttribute('transform', 'translate(' + plugX + ' ' + bottom + ')');
  }
  if (hero) {
    drawHouse();
    requestAnimationFrame(function () { hero.classList.add('is-go'); });
    // la hauteur change quand la police arrive : on retrace la maison à la bonne taille
    if ('ResizeObserver' in window) new ResizeObserver(drawHouse).observe(hero.querySelector('.hero__stage'));
  }

  // ---------- le câble : il part sous l'en-tête et se déroule au fil du défilement jusqu'à la prise ----------
  var wire = document.querySelector('svg.wire'), end = document.querySelector('[data-wire-end]');
  var line = wire && wire.querySelector('.wire__line'), halo = wire && wire.querySelector('.wire__halo');
  var table = [], total = 0, nodes = [].slice.call(document.querySelectorAll('[data-wire-node]'));
  function abs(el) { var r = el.getBoundingClientRect(); return { x: r.left + scrollX, y: r.top + scrollY, w: r.width, h: r.height }; }
  function rounded(pts, r) {   // polyligne orthogonale aux angles arrondis
    var d = 'M' + pts[0][0] + ' ' + pts[0][1];
    for (var i = 1; i < pts.length - 1; i++) {
      var p = pts[i - 1], c = pts[i], n = pts[i + 1];
      var a = Math.min(r, Math.hypot(c[0] - p[0], c[1] - p[1]) / 2), b = Math.min(r, Math.hypot(n[0] - c[0], n[1] - c[1]) / 2);
      var ux = Math.sign(c[0] - p[0]), uy = Math.sign(c[1] - p[1]), vx = Math.sign(n[0] - c[0]), vy = Math.sign(n[1] - c[1]);
      d += ' L' + (c[0] - ux * a) + ' ' + (c[1] - uy * a) + ' Q' + c[0] + ' ' + c[1] + ' ' + (c[0] + vx * b) + ' ' + (c[1] + vy * b);
    }
    var l = pts[pts.length - 1];
    return d + ' L' + l[0] + ' ' + l[1];
  }
  function layWire() {
    if (!wire || !end) return;
    wire.style.height = '0px';   // ne pas compter le câble lui-même dans la hauteur de la page
    var wrap = document.querySelector('main .wrap') || document.body, cs = getComputedStyle(wrap);
    var wr = wrap.getBoundingClientRect(), W = doc.clientWidth;
    var pl = parseFloat(cs.paddingLeft), pr = parseFloat(cs.paddingRight);
    var G = Math.round(wr.left + pl * 0.42), R = Math.round(wr.right - pr * 0.42);
    var narrow = W < 761;
    var first = document.querySelector('.hero, .shero');
    var y0 = first ? abs(first).y + abs(first).h : 0;
    var plate = abs(end.querySelector('svg')), ey = Math.round(plate.y + plate.h / 2), ex = Math.round(plate.x + plate.w * 0.22);
    var pts = [[G, y0]];
    if (narrow) {
      pts.push([G, ey], [ex, ey]);   // sur mobile : tout droit le long de la marge
    } else if (nodes.length) {
      var ny = Math.round(abs(nodes[0]).y + abs(nodes[0]).h / 2);
      pts.push([G, ny]);
      nodes.forEach(function (n) { var b = abs(n); pts.push([Math.round(b.x + b.w / 2), ny]); });
      pts.push([R, ny], [R, ey], [ex, ey]);
    } else {
      var mid = abs(document.querySelector('.end')).y - 70;
      pts.push([G, mid], [R, mid], [R, ey], [ex, ey]);
    }
    // supprimer les points alignés en double
    pts = pts.filter(function (p, i) { var q = pts[i - 1]; return !q || q[0] !== p[0] || q[1] !== p[1]; });
    var H = doc.scrollHeight;
    wire.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    wire.style.height = H + 'px'; wire.style.width = W + 'px';
    var d = rounded(pts, 28);
    line.setAttribute('d', d); halo.setAttribute('d', d);
    total = line.getTotalLength();
    table = [];
    for (var s = 0; s <= total; s += 6) table.push([s, line.getPointAtLength(s).y]);
    table.push([total, line.getPointAtLength(total).y]);
    [line, halo].forEach(function (p) { p.style.strokeDasharray = total + ' ' + (total + 10); });
    paint();
  }
  var ticking = false;
  function paint() {
    ticking = false;
    if (!total) return;
    var atEnd = scrollY + innerHeight >= doc.scrollHeight - 4;
    var lim = scrollY + innerHeight * 0.72, len = 0;
    if (calm || atEnd) len = total;
    else for (var i = 0; i < table.length; i++) { if (table[i][1] > lim) break; len = table[i][0]; }
    [line, halo].forEach(function (p) { p.style.strokeDashoffset = total - len; });
    var tip = len / total;
    nodes.forEach(function (n) { n.classList.toggle('is-live', n.getBoundingClientRect().top + scrollY + 30 < lim || calm || atEnd); });
    var e = document.querySelector('.end'); if (e) e.classList.toggle('is-lit', tip > 0.995);
  }
  if (wire) {
    addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(paint); } }, { passive: true });
    var t; addEventListener('resize', function () { clearTimeout(t); t = setTimeout(function () { drawHouse(); layWire(); }, 120); });
    addEventListener('load', layWire);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(layWire);
    if ('ResizeObserver' in window) new ResizeObserver(function () { clearTimeout(t); t = setTimeout(layWire, 120); }).observe(document.body);
    layWire();
  }

  // ---------- scènes animées des pages services (mêmes réglages que la version 1) ----------
  document.querySelectorAll('.scene').forEach(function (sc) {
    var start = function () {
      if (sc.classList.contains('is-in')) return;
      sc.classList.add('is-in', 'is-vis');
      setTimeout(function () { sc.classList.add('is-live'); }, calm ? 0 : 1800);
    };
    if (!('IntersectionObserver' in window)) { start(); return; }
    new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) start(); sc.classList.toggle('is-vis', e.isIntersecting); });
    }, { threshold: 0.3 }).observe(sc);
  });

  // ---------- formulaire : e-mail pré-rempli tant qu'aucun service d'envoi n'est branché ----------
  var form = document.querySelector('form[data-email]');
  if (form) form.addEventListener('submit', function (e) {
    e.preventDefault();
    var note = form.querySelector('.form__note');
    if (!form.dataset.email) { note.hidden = false; return; }
    var f = new FormData(form), body = [];
    f.forEach(function (v, k) { if (v) body.push(k + ' : ' + v); });
    location.href = 'mailto:' + form.dataset.email + '?subject=' + encodeURIComponent('Demande de devis') + '&body=' + encodeURIComponent(body.join('\n'));
  });
})();
