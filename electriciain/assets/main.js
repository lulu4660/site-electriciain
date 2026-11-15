// Menu mobile, sous-menu services, apparition au défilement, formulaire.
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

  var items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('in'); });
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
