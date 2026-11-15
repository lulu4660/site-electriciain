/* Maison en 3D interactive : chaque point jaune est un métier de l'entreprise.
   Volumes blancs cernés de noir (comme un plan), accents bleus et jaunes du logo.
   Au clic sur un point : la caméra s'approche, l'équipement s'anime, la fiche du service s'affiche. */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const stage = document.querySelector('[data-plan]');
if (stage) init();

function init() {
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = matchMedia('(pointer: coarse)').matches;
  const canvas = stage.querySelector('canvas');
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true }); }
  catch (e) { stage.classList.add('is-nogl'); return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const C = { wire: 0x1f56c8, volt: 0xffcf00, ink: 0x000000, white: 0xffffff, floor: 0xf1f4f9, steel: 0xdfe5ee, road: 0xc5cdd9, night: 0x0b2d73, red: 0xd8261c, green: 0x3bb36a, orange: 0xff8a00 };
  const scene = new THREE.Scene();
  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 200);
  cam.position.set(26, 22, 26);
  scene.add(new THREE.HemisphereLight(0xffffff, 0xc9d3e3, 2.1));
  const sun = new THREE.DirectionalLight(0xffffff, 1.6);
  sun.position.set(14, 26, 10); sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -16, right: 16, top: 16, bottom: -16, near: 1, far: 70 });
  sun.shadow.bias = -0.0008;
  scene.add(sun);

  const edgeMat = new THREE.LineBasicMaterial({ color: C.ink });
  const mats = {};
  const mat = (c) => mats[c] || (mats[c] = new THREE.MeshLambertMaterial({ color: c }));
  // pavé posé au sol : (largeur x, hauteur y, profondeur z), position du coin bas au centre
  function box(w, h, d, x, y, z, color, parent = scene, opts = {}) {
    const g = new THREE.BoxGeometry(w, h, d);
    const m = new THREE.Mesh(g, opts.mat || mat(color));
    m.position.set(x, y + h / 2, z);
    m.castShadow = opts.shadow !== false; m.receiveShadow = true;
    if (opts.edges !== false) m.add(new THREE.LineSegments(new THREE.EdgesGeometry(g), edgeMat));
    parent.add(m);
    return m;
  }
  function cyl(r, h, x, y, z, color, parent = scene, seg = 24, opts = {}) {
    const g = new THREE.CylinderGeometry(r, r, h, seg);
    const m = new THREE.Mesh(g, opts.mat || mat(color));
    m.position.set(x, y + h / 2, z); m.castShadow = true;
    if (opts.edges !== false) m.add(new THREE.LineSegments(new THREE.EdgesGeometry(g, 40), edgeMat));
    parent.add(m);
    return m;
  }

  // ---------- terrain ----------
  box(26, 0.4, 19, 0, -0.4, 0, C.steel, scene, { shadow: false });
  box(5, 0.02, 4.6, 5.5, 0, 6.3, C.road, scene, { shadow: false });              // allée du garage
  box(1.4, 0.02, 4.4, -4.5, 0, 6.2, C.road, scene, { shadow: false });           // chemin d'entrée
  [[-12, 7.5], [11.5, -7], [-11.8, -7.6], [11.5, 3.2]].forEach(([x, z], i) => {  // arbres : cônes bleus
    cyl(0.16, 1, x, 0, z, 0x6b4a2b, scene, 8);
    const g = new THREE.ConeGeometry(1 - i * 0.08, 2.6, 7);
    const m = new THREE.Mesh(g, mat(C.wire)); m.position.set(x, 2.3, z); m.castShadow = true;
    m.add(new THREE.LineSegments(new THREE.EdgesGeometry(g), edgeMat)); scene.add(m);
  });

  // ---------- maison (murs avant et droit coupés bas, comme une maquette ouverte) ----------
  const H = 2.8, T = 0.2, L = 0.55;
  box(10, 0.2, 8, -2, 0, 0, C.floor);
  box(10, H, T, -2, 0.2, -4 + T / 2, C.white);                    // mur du fond
  box(T, H, 8, -7 + T / 2, 0.2, 0, C.white);                      // mur gauche
  box(3.4, L, T, -5.3 + 0.6, 0.2, 4 - T / 2, C.white);            // mur avant (bas), ouvert sur la porte
  box(5.6, L, T, 0.2, 0.2, 4 - T / 2, C.white);
  box(T, L, 8, 3 - T / 2, 0.2, 0, C.white);                       // mur droit (bas)
  box(T, 1.5, 4, -2, 0.2, -2, C.white);                           // cloisons à mi-hauteur
  box(5, 1.5, T, 0.5, 0.2, 0, C.white);
  box(T, 1.5, 4, 0.5, 0.2, -2, C.white);
  // porte d'entrée : seuil et dormant
  box(1, 0.06, 0.5, -3.1, 0.2, 4, C.wire);

  // salon : canapé, table basse, tapis
  box(3, 0.02, 2.2, -4.6, 0.2, 0.6, 0xe9eefb, scene, { shadow: false });
  const sofa = new THREE.Group(); scene.add(sofa);
  box(2.6, 0.45, 0.9, -4.6, 0.2, -2.6, C.wire, sofa);
  box(2.6, 0.55, 0.25, -4.6, 0.65, -3.0, C.wire, sofa);
  box(1.2, 0.35, 0.7, -4.6, 0.2, 0.7, C.white);
  // chambre : lit
  box(1.8, 0.45, 2.4, -0.6, 0.2, 2.6, C.white);
  box(1.8, 0.12, 1.2, -0.6, 0.65, 3.0, 0xe9eefb);
  // salle de bain : baignoire
  box(1.2, 0.55, 2.2, 2.15, 0.2, -2.6, C.white);

  // ---------- garage + bureau voisin ----------
  box(5, 0.2, 8, 5.5, 0, 0, C.floor);
  box(5, H, T, 5.5, 0.2, -4 + T / 2, C.white);
  box(T, L, 8, 8 - T / 2, 0.2, 0, C.white);
  box(0.7, H, T, 3.35, 0.2, 4 - T / 2, C.white);                  // piliers et linteau du portail
  box(0.7, H, T, 7.65, 0.2, 4 - T / 2, C.white);
  box(3.6, 0.4, T, 5.5, 2.6, 4 - T / 2, C.white);

  const office = new THREE.Group(); scene.add(office);              // bureaux / atelier : tertiaire
  box(3.4, 4.2, 5.6, -10.2, 0, 3.6, C.white, office);
  for (let i = 0; i < 3; i++) {                                      // toit en sheds
    const g = new THREE.CylinderGeometry(0.75, 0.75, 3.4, 3, 1);
    const m = new THREE.Mesh(g, mat(C.wire)); m.rotation.z = Math.PI / 2; m.rotation.x = Math.PI / 6;
    m.position.set(-10.2, 4.55, 1.55 + i * 1.75); m.castShadow = true;
    m.add(new THREE.LineSegments(new THREE.EdgesGeometry(g), edgeMat)); office.add(m);
  }
  const winMat = () => new THREE.MeshLambertMaterial({ color: 0xdfe6f3, emissive: 0x000000 });
  const offWins = [];
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {         // fenêtres face avant et face droite
    offWins.push(box(0.7, 0.6, 0.06, -11.25 + c * 1.05, 0.6 + r * 1.2, 6.42, null, office, { mat: winMat(), shadow: false }));
    offWins.push(box(0.06, 0.6, 0.8, -8.47, 0.6 + r * 1.2, 1.5 + c * 1.5, null, office, { mat: winMat(), shadow: false }));
  }

  // ---------- équipements : un par métier ----------
  const fx = {};
  const glow = (c) => new THREE.MeshLambertMaterial({ color: c, emissive: 0x000000 });

  // électricité générale : le tableau électrique dans le local technique
  const panelG = new THREE.Group(); scene.add(panelG);
  box(1.5, 1.2, 0.14, -0.75, 1.2, -3.83, C.white, panelG);
  const brks = [];
  for (let r = 0; r < 2; r++) for (let c = 0; c < 6; c++)
    brks.push(box(0.16, 0.34, 0.08, -1.25 + c * 0.2, 1.35 + r * 0.5, -3.73, null, panelG, { mat: glow(0xcfd3cd), shadow: false }));
  fx['electricite-generale'] = (t, on) => brks.forEach((b, i) => {
    const lit = on && ((t * 4 - i * 0.35) > 0);
    b.material.color.set(lit ? C.volt : 0xcfd3cd); b.material.emissive.set(lit ? 0x6b5500 : 0x000000);
  });

  // domotique : suspension connectée au salon + boîtier mural
  const bulbMat = glow(0xfff6d6);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.26, 20, 14), bulbMat); bulb.position.set(-4.6, 2.1, 0.6); scene.add(bulb);
  box(0.02, 0.7, 0.02, -4.6, 2.3, 0.6, C.ink, scene, { edges: false });
  const lamp = new THREE.PointLight(C.volt, 0, 7, 1.6); lamp.position.copy(bulb.position); scene.add(lamp);
  const hub = box(0.08, 0.45, 0.32, -6.86, 1.2, -1.2, null, scene, { mat: glow(C.wire), shadow: false });
  fx.domotique = (t, on) => {
    const k = on ? Math.min(1, t * 2) : 0;
    bulbMat.emissive.setRGB(k, k * 0.8, 0); lamp.intensity = k * 9;
    hub.material.emissive.setRGB(0, 0, on ? 0.4 + 0.3 * Math.sin(t * 6) : 0);
  };

  // alarme : détecteur dans l'angle du salon + interphone à l'entrée
  const det = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), glow(0xf2f3f0));
  det.rotation.x = Math.PI; det.position.set(-6.75, 2.95, -3.75); det.add(new THREE.LineSegments(new THREE.EdgesGeometry(det.geometry, 40), edgeMat)); scene.add(det);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.035, 8, 40), new THREE.MeshBasicMaterial({ color: C.red, transparent: true, opacity: 0 }));
  ring.position.set(-6.75, 2.75, -3.75); ring.rotation.x = Math.PI / 2; scene.add(ring);
  box(0.16, 1.3, 0.16, -2.25, 0, 4.6, C.white);
  const intercom = box(0.32, 0.42, 0.12, -2.25, 1.3, 4.6, null, scene, { mat: glow(C.wire) });
  fx['alarme-interphonie'] = (t, on) => {
    const blink = on && Math.sin(t * 10) > 0;
    det.material.emissive.set(blink ? C.red : 0x000000);
    const p = (t * 0.9) % 1;
    ring.scale.setScalar(on ? 1 + p * 5 : 1); ring.material.opacity = on ? 0.9 * (1 - p) : 0;
    intercom.material.emissive.set(on && Math.sin(t * 4) > 0 ? 0x2a4ea0 : 0x000000);
  };

  // chauffage : radiateur dans la chambre
  const fins = [];
  box(1.5, 0.08, 0.14, 1.75, 0.35, 0.22, C.white);
  for (let i = 0; i < 7; i++) fins.push(box(0.16, 0.7, 0.14, 1.12 + i * 0.21, 0.4, 0.22, null, scene, { mat: glow(0xf6f6f6) }));
  fx['chauffage-electrique'] = (t, on) => fins.forEach((f, i) => {
    const k = on ? THREE.MathUtils.clamp(t * 2.2 - i * 0.18, 0, 1) : 0;
    f.material.color.setRGB(1, 1 - 0.38 * k, 1 - 0.85 * k); f.material.emissive.setRGB(0.35 * k, 0.12 * k, 0);
  });

  // VMC : bouche et ventilateur dans la salle de bain
  box(0.9, 0.9, 0.12, 1.75, 1.75, -3.83, C.white);
  const fan = new THREE.Group(); fan.position.set(1.75, 2.2, -3.74); scene.add(fan);
  for (let i = 0; i < 4; i++) {
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.34, 0.03), mat(C.wire)); b.position.y = 0.18;
    const arm = new THREE.Group(); arm.rotation.z = i * Math.PI / 2; arm.add(b); fan.add(arm);
  }
  let fanSpeed = 0.6;
  fx.vmc = (t, on, dt) => { fanSpeed += ((on ? 14 : 0.6) - fanSpeed) * Math.min(1, dt * 1.5); fan.rotation.z -= fanSpeed * dt; };

  // motorisation : porte de garage basculante + feu clignotant
  const doorPivot = new THREE.Group(); doorPivot.position.set(5.5, 2.6, 4 - T / 2); scene.add(doorPivot);
  const door = box(3.6, 2.4, 0.1, 0, -2.4, 0, C.white, doorPivot);
  [-0.6, 0, 0.6].forEach((y) => box(3.6, 0.03, 0.12, 0, y - 0.015, 0, C.ink, door, { edges: false, shadow: false }));   // rainures du panneau
  const flash = new THREE.Mesh(new THREE.SphereGeometry(0.16, 14, 10), glow(0xf3d6b6)); flash.position.set(7.75, 3.05, 4.05); scene.add(flash);
  let doorA = 0;
  fx['motorisation-portails-garages'] = (t, on, dt) => {
    const target = on ? -Math.PI / 2 + 0.06 : 0;
    doorA += (target - doorA) * Math.min(1, dt * 2.4); doorPivot.rotation.x = doorA;
    const moving = Math.abs(target - doorA) > 0.02;
    flash.material.emissive.set(moving && Math.sin(t * 12) > 0 ? C.orange : 0x000000);
  };

  // borne de recharge : borne, voiture, câble qui s'allume
  box(0.5, 1.5, 0.35, 8.6, 0, 5.2, C.white);
  const screenM = glow(C.wire); box(0.36, 0.3, 0.04, 8.6, 1.05, 5.39, null, scene, { mat: screenM, shadow: false });
  const car = new THREE.Group(); car.position.set(5.5, 0, 6.6); scene.add(car);
  box(1.9, 0.6, 3.8, 0, 0.3, 0, C.wire, car);
  box(1.7, 0.55, 2, 0, 0.9, 0.3, 0xe7eefc, car);
  [[-0.95, -1.2], [0.95, -1.2], [-0.95, 1.2], [0.95, 1.2]].forEach(([x, z]) => {
    const w = cyl(0.36, 0.25, x, 0.36, z, 0x222222, car, 16); w.rotation.z = Math.PI / 2; w.position.y = 0.36;
  });
  const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(8.6, 0.9, 5.4), new THREE.Vector3(8.2, 0.15, 6), new THREE.Vector3(7.2, 0.15, 6.8), new THREE.Vector3(6.45, 0.75, 7.2)]);
  const cableM = glow(0x222222);
  scene.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 30, 0.05, 8), cableM));
  const bars = [];
  for (let i = 0; i < 4; i++) bars.push(box(0.3, 0.5, 0.06, -0.48 + i * 0.32, 1.6, 0.3, null, car, { mat: glow(0xdde3ea), shadow: false }));
  fx['borne-irve'] = (t, on) => {
    cableM.color.set(on ? C.volt : 0x222222); cableM.emissive.set(on ? 0x6b5500 : 0x000000);
    screenM.emissive.set(on ? 0x113a8a : 0x000000);
    bars.forEach((b, i) => { const lit = on && (t * 1.2 % 5) > i + 0.4; b.material.color.set(lit ? C.green : 0xdde3ea); b.visible = on; });
  };

  // tertiaire : les fenêtres du bâtiment de bureaux s'allument une à une
  fx['electricite-tertiaire-et-industrielle'] = (t, on) => offWins.forEach((w, i) => {
    const lit = on && t * 6 > (i * 7) % offWins.length;
    w.material.color.set(lit ? C.volt : 0xdfe6f3); w.material.emissive.set(lit ? 0x5a4700 : 0x000000);
  });

  // ---------- points d'intérêt (boutons HTML placés sur la 3D) ----------
  const SPOTS = {
    'electricite-generale': [-0.75, 1.9, -3.7], 'domotique': [-4.6, 2.55, 0.6], 'alarme-interphonie': [-6.6, 3.1, -3.6],
    'chauffage-electrique': [1.75, 1.3, 0.3], 'vmc': [1.75, 2.75, -3.7], 'motorisation-portails-garages': [5.5, 3.3, 4.2],
    'borne-irve': [8.6, 1.9, 5.3], 'electricite-tertiaire-et-industrielle': [-10.2, 5.6, 4.2],
  };
  const pinsBox = stage.querySelector('.plan__pins');
  const pins = {};
  Object.keys(SPOTS).forEach((slug) => {
    const tpl = document.getElementById('pl-' + slug); if (!tpl) return;
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'pin'; b.dataset.slug = slug;
    b.innerHTML = '<span class="pin__dot"></span><span class="pin__label">' + tpl.dataset.title + '</span>';
    b.setAttribute('aria-label', tpl.dataset.title);
    b.addEventListener('click', () => select(active === slug ? null : slug));
    pinsBox.appendChild(b); pins[slug] = b;
  });
  stage.closest('.plan').querySelectorAll('[data-pick]').forEach((b) => b.addEventListener('click', () => select(b.dataset.pick)));

  // ---------- caméra, contrôles ----------
  const controls = new OrbitControls(cam, canvas);
  controls.enableDamping = true; controls.dampingFactor = 0.08;
  controls.enablePan = false; controls.minZoom = 0.8; controls.maxZoom = 2.6;
  controls.minPolarAngle = 0.35; controls.maxPolarAngle = 1.2;
  controls.target.set(-1, 1, 0.5);
  controls.autoRotate = !calm; controls.autoRotateSpeed = 0.6;
  if (coarse) {   // sur téléphone : un doigt fait défiler la page, deux doigts tournent et zooment
    controls.touches = { ONE: null, TWO: THREE.TOUCH.DOLLY_ROTATE };
    canvas.style.touchAction = 'pan-y';
  } else controls.enableZoom = true;
  controls.addEventListener('start', () => { controls.autoRotate = false; stage.classList.add('is-touched'); });

  function size() {
    const w = stage.clientWidth, h = stage.clientHeight, a = w / h, f = w < 560 ? 12.5 : 10.5;
    cam.left = -f * a; cam.right = f * a; cam.top = f; cam.bottom = -f; cam.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  }
  new ResizeObserver(size).observe(stage); size();

  // déplacement doux de la caméra vers un équipement
  let tween = null;
  function flyTo(target, zoom, theta = Math.PI / 4, phi = 0.95) {
    // la caméra glisse autour de la maison pour regarder l'équipement de face, puis s'approche
    const s0 = new THREE.Spherical().setFromVector3(cam.position.clone().sub(controls.target));
    let dTh = (theta - s0.theta) % (Math.PI * 2);
    if (dTh > Math.PI) dTh -= Math.PI * 2; if (dTh < -Math.PI) dTh += Math.PI * 2;
    const from = { t: controls.target.clone(), z: cam.zoom }, start = performance.now(), dur = calm ? 0 : 1100;
    const sp = new THREE.Spherical();
    tween = (now) => {
      const k = dur ? Math.min(1, (now - start) / dur) : 1, e = k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
      controls.target.lerpVectors(from.t, target, e);
      sp.set(s0.radius, s0.phi + (phi - s0.phi) * e, s0.theta + dTh * e);
      cam.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(sp));
      cam.zoom = from.z + (zoom - from.z) * e; cam.updateProjectionMatrix();
      if (k >= 1) tween = null;
    };
  }

  // ---------- sélection d'un métier ----------
  const card = stage.closest('.plan').querySelector('.plan__card'), intro = stage.closest('.plan').querySelector('.plan__intro');
  let active = null, since = 0;
  function select(slug) {
    active = slug; since = 0;
    Object.entries(pins).forEach(([s, b]) => { b.classList.toggle('is-on', s === slug); b.setAttribute('aria-pressed', s === slug); });
    stage.classList.toggle('has-active', !!slug);
    controls.autoRotate = false;
    if (!slug) {
      card.hidden = true; intro.hidden = false; flyTo(new THREE.Vector3(-1, 1, 0.5), 1); return;
    }
    const tpl = document.getElementById('pl-' + slug);
    card.innerHTML = ''; card.appendChild(tpl.content.cloneNode(true)); card.hidden = false; intro.hidden = true;
    card.querySelector('[data-back]').addEventListener('click', () => { select(null); pins[slug] && pins[slug].focus(); });
    card.classList.remove('is-in'); void card.offsetWidth; card.classList.add('is-in');
    const p = SPOTS[slug];
    const far = slug === 'electricite-tertiaire-et-industrielle' || slug === 'borne-irve';
    flyTo(new THREE.Vector3(p[0], Math.min(p[1], 2), p[2]), far ? 1.5 : 1.8, slug === 'electricite-tertiaire-et-industrielle' ? 0.35 : Math.PI / 4);
    if (coarse && card.getBoundingClientRect().top > innerHeight) card.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'nearest' });
  }
  stage.querySelectorAll('[data-rot]').forEach((b) => b.addEventListener('click', () => {
    const a = Number(b.dataset.rot) * Math.PI / 4, off = cam.position.clone().sub(controls.target);
    off.applyAxisAngle(new THREE.Vector3(0, 1, 0), a); cam.position.copy(controls.target).add(off); controls.autoRotate = false;
  }));
  stage.querySelector('[data-reset]').addEventListener('click', () => select(null));

  // ---------- boucle : tourne seulement quand la maison est à l'écran ----------
  const v = new THREE.Vector3();
  let visible = true, last = performance.now(), t = 0;
  new IntersectionObserver((es) => { visible = es[0].isIntersecting; if (visible) { last = performance.now(); requestAnimationFrame(loop); } }, { threshold: 0.05 }).observe(stage);
  function loop(now) {
    if (!visible) return;
    const dt = Math.min(0.05, (now - last) / 1000); last = now; t += dt; since += dt;
    if (tween) tween(now);
    controls.update();
    Object.entries(fx).forEach(([slug, f]) => f(slug === active ? since : t, slug === active, dt));
    renderer.render(scene, cam);
    const w = stage.clientWidth, h = stage.clientHeight;
    Object.entries(pins).forEach(([slug, b]) => {
      v.set(...SPOTS[slug]).project(cam);
      const px = (v.x + 1) / 2 * w;
      b.style.transform = `translate(${px.toFixed(1)}px, ${((1 - v.y) / 2 * h).toFixed(1)}px)`;
      b.classList.toggle('is-left', px > w * 0.6);   // étiquette à gauche du point près du bord droit
    });
    requestAnimationFrame(loop);
  }
  stage.classList.add('is-ready');
  requestAnimationFrame(loop);
}
