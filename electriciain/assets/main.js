// Menu mobile, sous-menu services, tableau électrique, formulaire.
(function () {
  var burger = document.querySelector('.burger');
  var nav = document.querySelector('.nav');
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      burger.setAttribute('aria-expanded', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
  }

  document.querySelectorAll('.nav__drop > button').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var drop = btn.parentElement;
      var open = drop.classList.toggle('open');
      btn.setAttribute('aria-expanded', open);
    });
  });
  document.addEventListener('click', function (e) {
    document.querySelectorAll('.nav__drop.open').forEach(function (d) {
      if (!d.contains(e.target) && window.innerWidth > 1020) d.classList.remove('open');
    });
  });

  var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Mise sous tension : chaque disjoncteur s'allume quand il arrive vraiment à l'écran.
  // Ceux qui arrivent ensemble (une rangée sur ordinateur) s'allument l'un après l'autre.
  var units = document.querySelectorAll('.pw');
  if (calm || !('IntersectionObserver' in window)) {
    units.forEach(function (el) { el.classList.add('is-on'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      var k = 0;
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target, d = (el.hasAttribute('data-now') ? 450 : 150) + k * 260;
        el.style.setProperty('--d', d + 'ms');
        el.classList.add('is-on');
        io.unobserve(el); k++;
      });
    }, { threshold: 0.9, rootMargin: '0px 0px -18% 0px' });
    units.forEach(function (el) { io.observe(el); });
  }

  // Au toucher d'un disjoncteur : « clac », voyant qui brille, puis le volet du coffret
  // s'ouvre sur place et montre le service. Sans JavaScript (ou Ctrl-clic), le lien
  // mène simplement à la page du service.
  var volet = null, lastBrk = null, openSlug = null, busy = false;
  var EASE = 'cubic-bezier(.32, .72, 0, 1)';   // départ vif, arrivée très douce
  function buildVolet() {
    volet = document.createElement('div');
    volet.className = 'volet';
    volet.hidden = true;
    volet.setAttribute('role', 'dialog');
    volet.setAttribute('aria-modal', 'true');
    volet.innerHTML = '<div class="volet__backdrop"></div><div class="volet__morph"></div>' +
      '<div class="volet__sheet"><div class="volet__bar"><span class="volet__tag"></span>' +
      '<button class="volet__close" type="button" aria-label="Fermer"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button></div>' +
      '<div class="volet__inside"><div class="volet__content"></div></div></div>';
    document.body.appendChild(volet);
    volet.querySelector('.volet__backdrop').addEventListener('click', function () { closeVolet(true); });
    volet.querySelector('.volet__close').addEventListener('click', function () { closeVolet(true); });
    volet.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.preventDefault(); closeVolet(true); }
      if (e.key === 'Tab') {   // garder le focus dans le volet
        var f = volet.querySelectorAll('a[href], button');
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }
  // Le calque est posé à la place exacte de la fiche ; seul son « transform » est animé
  // (déplacement + échelle), ce que la carte graphique gère seule : animation fluide.
  function placeMorph(morph, to, radius) {
    morph.style.left = to.left + 'px'; morph.style.top = to.top + 'px';
    morph.style.width = to.width + 'px'; morph.style.height = to.height + 'px';
    morph.style.borderRadius = radius + 'px';
  }
  function fit(r, to) {
    return 'translate(' + (r.left - to.left) + 'px, ' + (r.top - to.top) + 'px) scale(' + (r.width / to.width) + ', ' + (r.height / to.height) + ')';
  }
  function fromRect() {
    var face = lastBrk && (lastBrk.querySelector('.brk__face') || lastBrk);
    var r = face && face.getBoundingClientRect();
    if (!r || r.bottom < 0 || r.top > window.innerHeight) return null;   // disjoncteur hors écran
    return r;
  }
  function openVolet(slug, push) {
    var tpl = document.getElementById('volet-' + slug);
    if (!tpl) return false;
    if (!volet) buildVolet();
    var content = volet.querySelector('.volet__content');
    content.innerHTML = '';
    content.appendChild(tpl.content.cloneNode(true));
    content.querySelector('.vc__title').id = 'volet-title';
    volet.setAttribute('aria-labelledby', 'volet-title');
    volet.querySelector('.volet__tag').textContent = tpl.dataset.title;
    volet.querySelector('.volet__inside').scrollTop = 0;
    volet.classList.remove('is-open', 'is-ready', 'is-leaving');
    volet.hidden = false;
    document.documentElement.classList.add('volet-lock');
    openSlug = slug;
    if (push) history.pushState({ volet: slug }, '', '#' + slug);
    var sheet = volet.querySelector('.volet__sheet'), morph = volet.querySelector('.volet__morph');
    var to = sheet.getBoundingClientRect(), from = fromRect();
    var radius = window.innerWidth > 760 ? 14 : 0;
    void volet.offsetWidth;
    volet.classList.add('is-open');
    function ready() {
      volet.classList.add('is-ready');
      volet.querySelector('.volet__close').focus({ preventScroll: true });
      content.querySelectorAll('.scene').forEach(initScene);   // la scène se dessine dès l'ouverture
    }
    if (calm || !from || !morph.animate) { morph.style.opacity = '0'; ready(); return true; }
    placeMorph(morph, to, radius);
    morph.style.opacity = '1';
    var anim = morph.animate([{ transform: fit(from, to) }, { transform: 'none' }],
      { duration: 520, easing: EASE, fill: 'forwards' });
    setTimeout(ready, 210);                         // la fiche apparaît en fondu pendant la fin du mouvement
    anim.onfinish = function () { morph.style.opacity = '0'; };
    return true;
  }
  function closeVolet(viaHistory) {
    if (!volet || !openSlug || busy) return;
    if (viaHistory && history.state && history.state.volet) { history.back(); return; }  // popstate refermera
    openSlug = null; busy = true;
    var sheet = volet.querySelector('.volet__sheet'), morph = volet.querySelector('.volet__morph');
    var to = fromRect(), from = sheet.getBoundingClientRect();
    var radius = window.innerWidth > 760 ? 14 : 0;
    function done() {
      volet.hidden = true; busy = false;
      volet.classList.remove('is-open', 'is-ready', 'is-leaving');
      morph.getAnimations().forEach(function (a) { a.cancel(); });
      document.documentElement.classList.remove('volet-lock');
      if (!viaHistory && location.hash && document.getElementById('volet-' + location.hash.slice(1)))
        history.replaceState(null, '', location.pathname + location.search);
      if (lastBrk) { lastBrk.classList.remove('is-pressed'); lastBrk.focus({ preventScroll: true }); }
    }
    volet.classList.add('is-leaving');
    volet.classList.remove('is-open');
    if (calm || !to || !morph.animate) { setTimeout(done, calm ? 0 : 320); return; }
    morph.getAnimations().forEach(function (a) { a.cancel(); });
    placeMorph(morph, from, radius);
    morph.style.opacity = '1';                      // le calque, sous la fiche, prend le relais
    volet.classList.remove('is-ready');
    morph.animate([{ transform: 'none', opacity: 1 }, { transform: fit(to, from), opacity: 1, offset: .85 }, { transform: fit(to, from), opacity: 0 }],
      { duration: 420, delay: 70, easing: EASE, fill: 'forwards' }).onfinish = done;
  }
  window.addEventListener('popstate', function (e) {
    var h = location.hash.slice(1);
    var slug = (e.state && e.state.volet) || (h && document.getElementById('volet-' + h) ? h : null);
    if (slug && slug !== openSlug) openVolet(slug, false);
    else if (!slug && openSlug) closeVolet(false);
  });

  // un lien « Voir la fiche » (maison 3D) ouvre le même volet que les disjoncteurs
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[data-volet]');
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    if (!document.getElementById('volet-' + a.dataset.volet)) return;
    e.preventDefault(); lastBrk = a; openVolet(a.dataset.volet, true);
  });
  document.querySelectorAll('a.brk').forEach(function (a) {
    a.addEventListener('click', function (e) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      var slug = a.getAttribute('href').replace('.html', '');
      if (!document.getElementById('volet-' + slug)) return;
      e.preventDefault();
      lastBrk = a;
      if (calm) { openVolet(slug, true); return; }
      a.classList.add('is-pressed');
      setTimeout(function () { openVolet(slug, true); }, 90);
    });
    // précharger la photo de la fiche dès que la souris ou le doigt approche
    function preload() {
      var tpl = document.getElementById('volet-' + a.getAttribute('href').replace('.html', ''));
      var img = tpl && tpl.content.querySelector('img');
      if (img && !img.dataset.pre) { img.dataset.pre = 1; var i = new Image(); i.src = img.getAttribute('src'); if (i.decode) i.decode().catch(function () {}); }
    }
    a.addEventListener('pointerenter', preload);
    a.addEventListener('touchstart', preload, { passive: true });
    a.addEventListener('focus', preload);
  });
  // Lien direct vers un service ouvert (ex. index.html#domotique)
  if (location.hash && document.getElementById('volet-' + location.hash.slice(1))) {
    history.replaceState({ volet: location.hash.slice(1) }, '', location.hash);
    openVolet(location.hash.slice(1), false);
  }

  // Apparition des sections au défilement : les blocs glissent légèrement, l'un après l'autre.
  // Les classes sont posées ici : sans JavaScript, tout reste visible.
  var REVEAL = ['.section h2', '.section h2 + p', '.split > *', '.team .person', '.steps li', '.pledge__stamp',
    '.pledge dl > div', '.checks li', '.aside-note', '.faq details', '.faq-grid > div > p', '.brands', '.split h3',
    '.cta__text', '.call', '.contact-calls', '.info-list li', '.form', '.mapbox', '.gallery .shot', '.row-btns'];
  if (!calm && 'IntersectionObserver' in window) {
    var seen = new Set();
    REVEAL.forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el) {
        if (seen.has(el) || el.closest('.hero, .page-hero, .panel')) return;
        seen.add(el); el.classList.add('rv');
      });
    });
    // un bloc déjà animé n'anime pas aussi ses enfants (pas de double mouvement)
    seen.forEach(function (el) {
      if (el.parentElement && el.parentElement.closest('.rv')) { el.classList.remove('rv'); seen.delete(el); }
    });
    var rio = new IntersectionObserver(function (entries) {
      var k = 0;
      entries.forEach(function (en) {
        // déjà dépassé (défilement très rapide) : afficher sans attendre
        if (!en.isIntersecting && en.boundingClientRect.top < 0) { en.target.classList.add('in'); rio.unobserve(en.target); return; }
        if (!en.isIntersecting) return;
        en.target.style.setProperty('--rd', Math.min(k++, 6) * 90 + 'ms');
        en.target.classList.add('in');
        rio.unobserve(en.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    seen.forEach(function (el) { rio.observe(el); });
  }

  // Scènes animées des pages services : tracé à l'arrivée, puis boucle (.is-live),
  // en pause hors écran ; inclinaison 3D qui suit la souris.
  document.querySelectorAll('.scene').forEach(initScene);
  function initScene(sc) {
    var start = function () {
      if (sc.classList.contains('is-in')) return;
      sc.classList.add('is-in', 'is-vis');
      setTimeout(function () { sc.classList.add('is-live'); }, calm ? 0 : 1800);
    };
    if (!('IntersectionObserver' in window)) { start(); return; }
    new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) start();
        sc.classList.toggle('is-vis', e.isIntersecting);
      });
    }, { threshold: 0.3 }).observe(sc);
    if (calm || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    var raf = 0;
    sc.addEventListener('pointermove', function (e) {
      if (raf) return;
      raf = requestAnimationFrame(function () {
        raf = 0;
        var r = sc.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        sc.classList.add('is-tilt');
        sc.style.setProperty('--ry', ((x - 0.5) * 12).toFixed(2) + 'deg');
        sc.style.setProperty('--rx', ((0.5 - y) * 10).toFixed(2) + 'deg');
        sc.style.setProperty('--gx', (x * 100).toFixed(1) + '%');
        sc.style.setProperty('--gy', (y * 100).toFixed(1) + '%');
      });
    });
    sc.addEventListener('pointerleave', function () {
      sc.classList.remove('is-tilt');
      sc.style.setProperty('--rx', '0deg'); sc.style.setProperty('--ry', '0deg');
    });
  }

  // Formulaire de contact : tant qu'aucun service d'envoi n'est branché
  // (attribut action vide), on ouvre un e-mail pré-rempli à l'adresse data-email.
  var form = document.querySelector('form[data-email]');
  if (form && !form.getAttribute('action')) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.dataset.email) {
        var note = form.querySelector('.form__note');
        if (note) { note.hidden = false; note.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
        return;
      }
      var f = new FormData(form);
      var body = 'Nom : ' + f.get('nom') + '\nTéléphone : ' + f.get('tel') +
        '\nE-mail : ' + f.get('email') + '\nCommune : ' + f.get('ville') +
        '\nPrestation : ' + f.get('service') + '\n\n' + f.get('message');
      window.location.href = 'mailto:' + form.dataset.email +
        '?subject=' + encodeURIComponent('Demande de devis – ' + f.get('service')) +
        '&body=' + encodeURIComponent(body);
    });
  }
})();

// Visionneuse plein écran pour la galerie
(function () {
  var links = [].slice.call(document.querySelectorAll('a[data-lightbox]'));
  if (!links.length) return;
  var box, idx = 0;
  function show(i) {
    idx = (i + links.length) % links.length;
    var a = links[idx], cap = a.parentElement.querySelector('figcaption');
    box.querySelector('img').src = a.href;
    box.querySelector('img').alt = a.querySelector('img').alt;
    box.querySelector('p').textContent = cap ? cap.textContent : '';
  }
  function close() { box.remove(); box = null; document.removeEventListener('keydown', key); }
  function key(e) {
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowRight') show(idx + 1);
    if (e.key === 'ArrowLeft') show(idx - 1);
  }
  links.forEach(function (a, i) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      box = document.createElement('div');
      box.className = 'lightbox';
      box.setAttribute('role', 'dialog');
      box.setAttribute('aria-label', 'Photo agrandie');
      box.innerHTML = '<div><img src="" alt=""><p></p></div>' +
        '<button class="lb-close" aria-label="Fermer">×</button>' +
        (links.length > 1 ? '<button class="lb-prev" aria-label="Précédente">‹</button><button class="lb-next" aria-label="Suivante">›</button>' : '');
      box.addEventListener('click', function (ev) {
        if (ev.target === box || ev.target.classList.contains('lb-close')) close();
        if (ev.target.classList.contains('lb-prev')) show(idx - 1);
        if (ev.target.classList.contains('lb-next')) show(idx + 1);
      });
      document.body.appendChild(box);
      document.addEventListener('keydown', key);
      show(i);
      box.querySelector('.lb-close').focus();
    });
  });
})();

// Carte de la page contact : fond gris, repère aux couleurs de l'entreprise.
window.addEventListener('load', function () {
  var el = document.getElementById('map');
  if (!el || !window.L) return;
  var pos = [+el.dataset.lat, +el.dataset.lng];
  var touch = window.matchMedia('(pointer: coarse)').matches;
  var map = L.map(el, { scrollWheelZoom: false, dragging: !touch, tap: false, zoomControl: false, attributionControl: true }).setView(pos, 15);
  L.control.zoom({ position: 'bottomright' }).addTo(map);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);
  var icon = L.divIcon({ className: '', iconSize: [46, 46], iconAnchor: [23, 55],
    html: '<div class="pin"><span class="pin__halo"></span><span class="pin__dot"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z"/></svg></span></div>' });
  L.marker(pos, { icon: icon, keyboard: false, title: "Les Électrici'Ain" }).addTo(map);
  var wide = el.offsetWidth > 640;
  // sur ordinateur, décaler pour que le repère ne soit pas sous la carte de visite
  if (wide) map.panBy([-170, 0], { animate: false });
});
