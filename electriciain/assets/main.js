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

  // Au toucher d'un disjoncteur : « clac », voyant qui brille, puis la page du service.
  document.querySelectorAll('a.brk').forEach(function (a) {
    a.addEventListener('click', function (e) {
      if (calm || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      e.preventDefault();
      a.classList.add('is-pressed');
      var face = a.querySelector('.brk__face');
      setTimeout(function () {
        if (face && window.innerWidth > 860) face.style.viewTransitionName = 'breaker';
        window.location.href = a.href;
      }, 430);
    });
  });
  // Retour arrière (cache de page) : retirer l'état « appuyé ».
  window.addEventListener('pageshow', function () {
    document.querySelectorAll('.brk.is-pressed').forEach(function (a) {
      a.classList.remove('is-pressed');
      var f = a.querySelector('.brk__face'); if (f) f.style.viewTransitionName = '';
    });
  });

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
