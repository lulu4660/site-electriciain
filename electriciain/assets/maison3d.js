/* Maison 3D interactive (page d'accueil) : une maquette ouverte de maison, chaque point allumé est un métier.
   Au premier affichage le toit se soulève et les murs avant s'abaissent ; au clic sur un point la caméra
   vient se placer devant l'équipement, qui se met en marche, et sa fiche s'affiche à côté.
   three.js n'est chargé que lorsque la section approche de l'écran. */
const stage = document.querySelector('[data-maison]');
if (stage) {
  const io = new IntersectionObserver((es) => {
    if (!es[0].isIntersecting) return;
    io.disconnect();
    Promise.all([import('three'), import('three/addons/geometries/RoundedBoxGeometry.js'),
      import('three/addons/environments/RoomEnvironment.js'), import('three/addons/controls/OrbitControls.js')])
      .then(([THREE, rb, re, oc]) => init(THREE, rb.RoundedBoxGeometry, re.RoomEnvironment, oc.OrbitControls))
      .catch(() => stage.classList.add('is-nogl'));
  }, { rootMargin: '500px 0px' });
  io.observe(stage);
}

function init(THREE, RoundedBoxGeometry, RoomEnvironment, OrbitControls) {
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = matchMedia('(pointer: coarse)').matches;
  const root = stage.closest('.maison');
  const canvas = stage.querySelector('canvas');
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' }); }
  catch (e) { stage.classList.add('is-nogl'); return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.55;
  scene.add(new THREE.HemisphereLight(0xffffff, 0xd9dcd5, 0.6));
  const sun = new THREE.DirectionalLight(0xfff6e8, 2.4);
  sun.position.set(12, 22, 9); sun.castShadow = true;
  sun.shadow.mapSize.set(coarse ? 1024 : 2048, coarse ? 1024 : 2048);
  Object.assign(sun.shadow.camera, { left: -17, right: 17, top: 14, bottom: -14, near: 2, far: 60 });
  sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.02; sun.shadow.radius = 4;
  scene.add(sun);

  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 200);
  cam.position.set(24, 20, 24);

  // ---------- matières ----------
  const std = (color, roughness = 0.8, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness, metalness: 0, ...extra });
  const M = {
    wall: std(0xfbfbf8, 0.92), oak: std(0xe3cfac, 0.7), tile: std(0xe7eae6, 0.45), concrete: std(0xd2d5cf, 0.95),
    plinth: std(0xe4e6e2, 0.95), lawn: std(0xc8d8bd, 1), road: std(0xc3c7c0, 1), blue: std(0x2a5cb3, 0.55),
    roof: std(0x2a5cb3, 0.6, { transparent: true }), gable: std(0xfbfbf8, 0.92, { transparent: true }),
    deep: std(0x1e4790, 0.6), yellow: std(0xf7c600, 0.45), dark: std(0x2b2e31, 0.55), white: std(0xffffff, 0.4),
    fabric: std(0x2a5cb3, 0.95), wood: std(0xb88f5e, 0.7), leaf: std(0x7aa06a, 0.9), rug: std(0xf1ead9, 1),
    glass: std(0xcfe0f5, 0.08, { transparent: true, opacity: 0.55 }), steel: std(0xb9beb8, 0.35, { metalness: 0.6 }),
    tyre: std(0x1d1f22, 0.8),
  };
  const glow = (color) => std(color, 0.5, { emissive: 0x000000 });

  // pavé arrondi posé au sol (le point y est le dessous)
  function rbox(w, h, d, x, y, z, mat, parent = scene, r = 0.05) {
    const m = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 2, Math.min(r, w / 2.1, h / 2.1, d / 2.1)), mat);
    m.position.set(x, y + h / 2, z); m.castShadow = true; m.receiveShadow = true;
    parent.add(m); return m;
  }
  function cyl(rt, rb, h, x, y, z, mat, parent = scene, seg = 28) {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat);
    m.position.set(x, y + h / 2, z); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m;
  }
  function sphere(r, x, y, z, mat, parent = scene) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(r, 24, 16), mat); m.position.set(x, y, z); m.castShadow = true; parent.add(m); return m;
  }

  // ---------- socle, jardin, allées ----------
  rbox(27, 0.6, 20, 0, -0.6, 0, M.plinth, scene, 0.25);
  rbox(26.2, 0.06, 19.2, 0, 0, 0, M.lawn, scene, 0.03);
  rbox(4.8, 0.05, 4.4, 5.5, 0.03, 6.6, M.road, scene, 0.03);           // allée du garage
  for (let i = 0; i < 5; i++) rbox(0.9, 0.05, 0.55, -3.1, 0.03, 4.7 + i * 0.95, M.road, scene, 0.05);   // pas japonais
  const tree = (x, z, s) => {
    cyl(0.12 * s, 0.16 * s, 1.2 * s, x, 0, z, M.wood);
    sphere(0.95 * s, x, 1.9 * s, z, M.leaf); sphere(0.7 * s, x + 0.45 * s, 1.55 * s, z + 0.3 * s, M.leaf);
  };
  tree(-12, 8, 1); tree(11.6, -7.2, 1.15); tree(-12.2, -7.8, 0.9); tree(11.8, 2.4, 0.8);
  [[-6.2, 4.9], [-0.2, 4.6], [1.6, 4.9]].forEach(([x, z]) => sphere(0.42, x, 0.35, z, M.leaf));      // haies basses

  // ---------- maison ----------
  const H = 2.8, T = 0.2, LOW = 0.6;
  rbox(10, 0.2, 8, -2, 0.05, 0, M.wall, scene, 0.04);
  rbox(5.4, 0.04, 7.8, -4.6, 0.25, 0, M.oak, scene, 0.02);             // séjour : parquet
  rbox(5, 0.04, 3.8, 0.5, 0.25, 2.0, M.oak, scene, 0.02);              // chambre : parquet
  rbox(2.5, 0.04, 3.8, -0.75, 0.25, -2.0, M.tile, scene, 0.02);        // local technique
  rbox(2.5, 0.04, 3.8, 1.75, 0.25, -2.0, M.tile, scene, 0.02);         // salle de bain
  const Y0 = 0.25;
  rbox(10, H, T, -2, Y0, -4 + T / 2, M.wall);                          // mur du fond
  rbox(T, H, 8, -7 + T / 2, Y0, 0, M.wall);                            // mur gauche
  // murs qui s'abaissent pendant l'ouverture (avant et droite) : pivot à la base
  const lowWalls = [];
  const lowWall = (w, d, x, z) => {
    const g = new RoundedBoxGeometry(w, H, d, 2, 0.05); g.translate(0, H / 2, 0);
    const m = new THREE.Mesh(g, M.wall); m.position.set(x, Y0, z); m.castShadow = m.receiveShadow = true; scene.add(m); lowWalls.push(m); return m;
  };
  lowWall(3.5, T, -5.25, 4 - T / 2);
  lowWall(5.5, T, 0.25, 4 - T / 2);
  lowWall(T, 8, 3 - T / 2, 0);
  rbox(T, 1.6, 4, -2, Y0, -2, M.wall);                                 // cloisons à mi-hauteur
  rbox(5, 1.6, T, 0.5, Y0, 0, M.wall);
  rbox(T, 1.6, 4, 0.5, Y0, -2, M.wall);
  // fenêtres du mur du fond et du mur gauche
  [[-5.4, -3.88], [-3.2, -3.88]].forEach(([x, z]) => { rbox(1.5, 1.3, 0.08, x, 1.25, z, M.deep, scene, 0.03); rbox(1.3, 1.1, 0.1, x, 1.35, z, M.glass, scene, 0.02); });
  rbox(0.08, 1.3, 1.6, -6.88, 1.25, 1.6, M.deep, scene, 0.03); rbox(0.1, 1.1, 1.4, -6.88, 1.35, 1.6, M.glass, scene, 0.02);

  // séjour : canapé, tapis, table basse, meuble TV, cuisine, plante
  rbox(3.2, 0.03, 2.3, -4.4, Y0 + 0.04, 0.4, M.rug, scene, 0.01);
  rbox(2.8, 0.42, 0.95, -4.4, Y0 + 0.04, -2.9, M.fabric, scene, 0.14);
  rbox(2.8, 0.55, 0.28, -4.4, Y0 + 0.46, -3.3, M.fabric, scene, 0.12);
  rbox(0.3, 0.6, 0.95, -5.95, Y0 + 0.04, -2.9, M.fabric, scene, 0.12); rbox(0.3, 0.6, 0.95, -2.85, Y0 + 0.04, -2.9, M.fabric, scene, 0.12);
  rbox(1.3, 0.32, 0.75, -4.4, Y0 + 0.04, 0.5, M.wood, scene, 0.05);
  rbox(2.2, 0.45, 0.45, -4.4, Y0 + 0.04, 3.45, M.white, scene, 0.05);
  rbox(1.6, 0.9, 0.06, -4.4, Y0 + 0.65, 3.62, M.dark, scene, 0.03);
  rbox(0.65, 0.9, 3.2, -6.55, Y0 + 0.04, 1.4, M.white, scene, 0.04); rbox(0.68, 0.05, 3.2, -6.55, Y0 + 0.94, 1.4, M.wood, scene, 0.02);
  cyl(0.22, 0.18, 0.4, -2.55, Y0 + 0.04, 3.4, M.white); sphere(0.38, -2.55, Y0 + 0.82, 3.4, M.leaf);
  // chambre : lit, oreillers, tables de nuit
  rbox(1.9, 0.45, 2.3, -0.5, Y0 + 0.04, 2.55, M.wood, scene, 0.06);
  rbox(1.8, 0.2, 2.1, -0.5, Y0 + 0.45, 2.6, M.white, scene, 0.08);
  rbox(1.84, 0.06, 1.3, -0.5, Y0 + 0.62, 3.0, M.fabric, scene, 0.03);
  rbox(0.6, 0.14, 0.4, -0.95, Y0 + 0.62, 1.7, M.white, scene, 0.06); rbox(0.6, 0.14, 0.4, -0.05, Y0 + 0.62, 1.7, M.white, scene, 0.06);
  // salle de bain : baignoire, vasque ; local technique : ballon d'eau chaude
  rbox(1.15, 0.55, 2.1, 2.3, Y0 + 0.04, -2.75, M.white, scene, 0.2);
  rbox(0.9, 0.08, 0.5, 1.1, Y0 + 0.85, -3.6, M.white, scene, 0.04); rbox(0.7, 0.75, 0.45, 1.1, Y0 + 0.04, -3.6, M.wood, scene, 0.04);
  cyl(0.4, 0.4, 1.5, -1.45, Y0 + 0.04, -1.0, M.white);

  // ---------- garage ----------
  rbox(5, 0.2, 8, 5.5, 0.05, 0, M.concrete, scene, 0.04);
  rbox(5, H, T, 5.5, Y0, -4 + T / 2, M.wall);
  lowWall(T, 8, 8 - T / 2, 0);
  rbox(0.65, H, T, 3.32, Y0, 4 - T / 2, M.wall); rbox(0.65, H, T, 7.68, Y0, 4 - T / 2, M.wall);
  rbox(3.7, 0.36, T, 5.5, Y0 + H - 0.36, 4 - T / 2, M.wall);
  rbox(1.6, 0.9, 0.5, 6.9, Y0, -3.55, M.wood, scene, 0.04);              // établi

  // ---------- toit (se soulève à l'ouverture) ----------
  const roof = new THREE.Group(); scene.add(roof);
  const rise = 2.3, half = 4.35, slope = Math.atan(rise / half), len = Math.hypot(rise, half) + 0.25;
  [-1, 1].forEach((s) => {
    const m = new THREE.Mesh(new RoundedBoxGeometry(10.8, 0.18, len, 2, 0.06), M.roof);
    m.position.set(-2, Y0 + H + rise / 2 + 0.05, s * half / 2); m.rotation.x = s * slope; m.castShadow = true; roof.add(m);
  });
  const gShape = new THREE.Shape([new THREE.Vector2(-4, 0), new THREE.Vector2(4, 0), new THREE.Vector2(0, rise)]);
  [-7, 3 - T].forEach((x) => {
    const g = new THREE.Mesh(new THREE.ExtrudeGeometry(gShape, { depth: T, bevelEnabled: false }), M.gable);
    g.rotation.y = Math.PI / 2; g.position.set(x, Y0 + H, 0); g.castShadow = true; roof.add(g);
  });
  const gRoof = new THREE.Mesh(new RoundedBoxGeometry(5.3, 0.2, 8.4, 2, 0.06), M.roof);
  gRoof.position.set(5.6, Y0 + H + 0.1, 0); gRoof.castShadow = true; roof.add(gRoof);

  // ---------- bureaux voisins (tertiaire) ----------
  const office = new THREE.Group(); scene.add(office);
  rbox(3.6, 4.4, 5.8, -10.3, 0.05, 3.4, M.wall, office, 0.08);
  rbox(3.8, 0.25, 6, -10.3, 4.45, 3.4, M.blue, office, 0.06);
  const offWins = [];
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {
    offWins.push(rbox(0.75, 0.7, 0.06, -11.4 + c * 1.1, 0.75 + r * 1.25, 6.31, glow(0xd7e2f2), office, 0.03));
    offWins.push(rbox(0.06, 0.7, 0.9, -8.49, 0.75 + r * 1.25, 1.4 + c * 1.5, glow(0xd7e2f2), office, 0.03));
  }
  rbox(1, 1.6, 0.08, -10.3, 0.05, 6.33, M.deep, office, 0.03);

  // ---------- équipements : un par métier ----------
  const fx = {};
  // électricité générale : tableau électrique du local technique
  rbox(1.6, 1.25, 0.16, -0.75, 1.25, -3.82, M.white, scene, 0.05);
  const brks = [];
  for (let r = 0; r < 2; r++) for (let c = 0; c < 6; c++) brks.push(rbox(0.17, 0.38, 0.08, -1.27 + c * 0.21, 1.38 + r * 0.55, -3.72, glow(0xdfe2dc), scene, 0.02));
  const panelLight = new THREE.PointLight(0xf7c600, 0, 3, 2); panelLight.position.set(-0.75, 1.9, -3.4); scene.add(panelLight);
  fx['electricite-generale'] = (t, on) => {
    brks.forEach((b, i) => { const lit = on && t * 5 - i * 0.4 > 0; b.material.color.set(lit ? 0xf7c600 : 0xdfe2dc); b.material.emissive.set(lit ? 0x7a6000 : 0x000000); });
    panelLight.intensity = on ? Math.min(1, t) * 3 : 0;
  };
  // domotique : suspension du séjour, interrupteur connecté
  const bulbM = glow(0xfff7dc);
  const bulb = sphere(0.24, -4.4, 2.15, 0.5, bulbM); bulb.castShadow = false;
  cyl(0.012, 0.012, 0.75, -4.4, 2.28, 0.5, M.dark);
  cyl(0.34, 0.08, 0.22, -4.4, 2.24, 0.5, M.deep);
  const lamp = new THREE.PointLight(0xffd76a, 0, 8, 1.4); lamp.position.set(-4.4, 2.0, 0.5); scene.add(lamp);
  const hub = rbox(0.06, 0.4, 0.3, -6.86, 1.15, -1.2, glow(0xffffff), scene, 0.02);
  fx.domotique = (t, on) => {
    const k = on ? Math.min(1, t * 1.6) : 0;
    bulbM.emissive.setRGB(k, 0.82 * k, 0.35 * k); lamp.intensity = k * 12;
    hub.material.emissive.setRGB(0, 0.1 * k, on ? 0.5 + 0.3 * Math.sin(t * 5) : 0);
  };
  // alarme : détecteur dans l'angle du séjour, interphone au portillon
  const detM = glow(0xf2f3f0);
  const det = new THREE.Mesh(new THREE.SphereGeometry(0.18, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), detM);
  det.rotation.x = Math.PI; det.position.set(-6.75, Y0 + H - 0.02, -3.75); scene.add(det);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.03, 8, 48), new THREE.MeshBasicMaterial({ color: 0xd8261c, transparent: true, opacity: 0 }));
  ring.rotation.x = Math.PI / 2; ring.position.set(-6.75, Y0 + H - 0.2, -3.75); scene.add(ring);
  rbox(0.18, 1.35, 0.18, -2.3, 0.05, 4.65, M.white, scene, 0.04);
  const intercom = rbox(0.34, 0.46, 0.12, -2.3, 1.35, 4.65, glow(0x2a5cb3), scene, 0.04);
  fx['alarme-interphonie'] = (t, on) => {
    detM.emissive.set(on && Math.sin(t * 9) > 0 ? 0xd8261c : 0x000000);
    const p = (t * 0.8) % 1; ring.scale.setScalar(on ? 1 + p * 5 : 1); ring.material.opacity = on ? 0.85 * (1 - p) : 0;
    intercom.material.emissive.set(on && Math.sin(t * 4) > 0 ? 0x24489a : 0x000000);
  };
  // chauffage : radiateur de la chambre
  const fins = [];
  for (let i = 0; i < 7; i++) fins.push(rbox(0.17, 0.72, 0.14, 1.12 + i * 0.21, Y0 + 0.22, 0.24, glow(0xf7f7f5), scene, 0.06));
  const heat = new THREE.PointLight(0xff8a00, 0, 3, 2); heat.position.set(1.75, 0.9, 0.8); scene.add(heat);
  fx['chauffage-electrique'] = (t, on) => {
    fins.forEach((f, i) => { const k = on ? THREE.MathUtils.clamp(t * 2 - i * 0.16, 0, 1) : 0; f.material.color.setRGB(1, 1 - 0.36 * k, 1 - 0.82 * k); f.material.emissive.setRGB(0.3 * k, 0.1 * k, 0); });
    heat.intensity = on ? Math.min(1, t * 0.8) * 4 : 0;
  };
  // VMC : bouche et hélice de la salle de bain
  rbox(0.9, 0.9, 0.12, 1.75, 1.75, -3.83, M.white, scene, 0.08);
  const fan = new THREE.Group(); fan.position.set(1.75, 2.2, -3.74); scene.add(fan);
  for (let i = 0; i < 5; i++) {
    const b = new THREE.Mesh(new RoundedBoxGeometry(0.13, 0.34, 0.03, 2, 0.015), M.blue); b.position.y = 0.18;
    const arm = new THREE.Group(); arm.rotation.z = i * Math.PI * 2 / 5; arm.add(b); fan.add(arm);
  }
  let fanV = 0.5;
  fx.vmc = (t, on, dt) => { fanV += ((on ? 16 : 0.5) - fanV) * Math.min(1, dt * 1.4); fan.rotation.z -= fanV * dt; };
  // motorisation : porte de garage basculante et feu orange
  const pivot = new THREE.Group(); pivot.position.set(5.5, Y0 + H - 0.36, 4 - T / 2); scene.add(pivot);
  const door = rbox(3.7, 2.45, 0.1, 0, -2.45, 0, M.white, pivot, 0.03);
  [-0.6, 0, 0.6].forEach((y) => rbox(3.6, 0.03, 0.12, 0, y - 0.015, 0, M.wall, door, 0.01));
  const flashM = glow(0xf3d6b6); sphere(0.15, 7.7, Y0 + H + 0.12, 4.0, flashM);
  let doorA = 0;
  fx['motorisation-portails-garages'] = (t, on, dt) => {
    const target = on ? Math.PI / 2 - 0.05 : 0;   // la porte bascule vers l'intérieur, sous le plafond
    doorA += (target - doorA) * Math.min(1, dt * 2.2); pivot.rotation.x = doorA;
    flashM.emissive.set(Math.abs(target - doorA) > 0.02 && Math.sin(t * 12) > 0 ? 0xff8a00 : 0x000000);
  };
  // borne de recharge, voiture, câble
  rbox(0.5, 1.5, 0.36, 8.65, 0.05, 5.4, M.white, scene, 0.08);
  const screenM = glow(0x2a5cb3); rbox(0.34, 0.3, 0.04, 8.65, 1.05, 5.6, screenM, scene, 0.02);
  const car = new THREE.Group(); car.position.set(5.5, 0.05, 6.75); scene.add(car);
  rbox(1.95, 0.62, 4, 0, 0.3, 0, M.blue, car, 0.25);
  rbox(1.7, 0.6, 2.1, 0, 0.82, 0.25, M.glass, car, 0.22);
  rbox(1.72, 0.08, 2.0, 0, 1.4, 0.25, M.blue, car, 0.04);
  [[-0.98, -1.25], [0.98, -1.25], [-0.98, 1.3], [0.98, 1.3]].forEach(([x, z]) => {
    const w = cyl(0.37, 0.37, 0.26, x, 0, z, M.tyre, car, 24); w.rotation.z = Math.PI / 2; w.position.y = 0.37;
    const hubc = cyl(0.17, 0.17, 0.28, x, 0, z, M.steel, car, 16); hubc.rotation.z = Math.PI / 2; hubc.position.y = 0.37;
  });
  [-0.62, 0.62].forEach((x) => rbox(0.38, 0.12, 0.05, x, 0.6, -2.0, glow(0xfffbe8), car, 0.03));
  const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(8.65, 0.95, 5.62), new THREE.Vector3(8.3, 0.12, 6.2),
    new THREE.Vector3(7.4, 0.12, 7.2), new THREE.Vector3(6.5, 0.85, 7.6)]);
  const cableM = glow(0x2b2e31);
  const cable = new THREE.Mesh(new THREE.TubeGeometry(curve, 40, 0.045, 10), cableM); cable.castShadow = true; scene.add(cable);
  const bars = [];
  const bat = new THREE.Group(); bat.position.set(0, 2.1, 0.25); car.add(bat);
  rbox(1.45, 0.48, 0.08, 0, -0.24, 0, M.white, bat, 0.06);
  for (let i = 0; i < 4; i++) bars.push(rbox(0.28, 0.32, 0.1, -0.48 + i * 0.32, -0.16, 0, glow(0xdfe2dc), bat, 0.03));
  bat.visible = false;
  fx['borne-irve'] = (t, on) => {
    cableM.color.set(on ? 0xf7c600 : 0x2b2e31); cableM.emissive.set(on ? 0x6a5300 : 0x000000);
    screenM.emissive.set(on ? 0x14398a : 0x000000);
    bat.visible = on; bat.lookAt(cam.position.x, bat.getWorldPosition(new THREE.Vector3()).y, cam.position.z);
    bars.forEach((b, i) => { const lit = on && (t * 1.1) % 5.5 > i + 0.5; b.material.color.set(lit ? 0x3bb36a : 0xdfe2dc); b.material.emissive.set(lit ? 0x0d4a22 : 0x000000); });
  };
  // tertiaire : les bureaux s'allument fenêtre par fenêtre
  const order = offWins.map((_, i) => i).sort((a, b) => ((a * 7) % 11) - ((b * 7) % 11));
  fx['electricite-tertiaire-et-industrielle'] = (t, on) => order.forEach((idx, k) => {
    const lit = on && t * 7 > k; const w = offWins[idx];
    w.material.color.set(lit ? 0xf7c600 : 0xd7e2f2); w.material.emissive.set(lit ? 0x6a5300 : 0x000000);
  });

  // ---------- points d'intérêt : de vrais boutons HTML posés sur la 3D ----------
  const SPOTS = {
    'electricite-generale': [-0.75, 2.25, -3.7], 'domotique': [-4.4, 2.7, 0.5], 'alarme-interphonie': [-6.7, 3.25, -3.7],
    'chauffage-electrique': [1.75, 1.25, 0.35], 'vmc': [1.75, 2.75, -3.7], 'motorisation-portails-garages': [5.5, 3.45, 4.1],
    'borne-irve': [8.65, 1.95, 5.45], 'electricite-tertiaire-et-industrielle': [-10.3, 5.2, 4.2],
  };
  const VIEW = {   // angle de vue préféré pour chaque équipement
    'electricite-tertiaire-et-industrielle': 0.35, 'borne-irve': 0.95, 'motorisation-portails-garages': 0.85,
  };
  const pinsBox = stage.querySelector('.maison__pins');
  const pins = {};
  Object.keys(SPOTS).forEach((slug, i) => {
    const data = root.querySelector(`[data-fiche="${slug}"]`); if (!data) return;
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'mpin'; b.style.setProperty('--i', i);
    b.innerHTML = '<span class="mpin__dot"></span><span class="mpin__label"></span>';
    b.querySelector('.mpin__label').textContent = data.dataset.title;
    b.setAttribute('aria-label', data.dataset.title + ' : voir dans la maison');
    b.addEventListener('click', () => select(active === slug ? null : slug, b));
    pinsBox.appendChild(b); pins[slug] = b;
  });
  root.querySelectorAll('[data-pick]').forEach((b) => b.addEventListener('click', () => select(b.dataset.pick, b)));

  // ---------- caméra et contrôles ----------
  const HOME = new THREE.Vector3(-1.2, 1.2, 0.6);
  const controls = new OrbitControls(cam, canvas);
  controls.enableDamping = true; controls.dampingFactor = 0.07; controls.enablePan = false;
  controls.minZoom = 0.85; controls.maxZoom = 2.8; controls.minPolarAngle = 0.4; controls.maxPolarAngle = 1.22;
  controls.target.copy(HOME); controls.rotateSpeed = 0.7;
  controls.autoRotateSpeed = 0.5;
  if (coarse) { controls.touches = { ONE: null, TWO: THREE.TOUCH.DOLLY_ROTATE }; canvas.style.touchAction = 'pan-y'; }
  controls.addEventListener('start', () => { controls.autoRotate = false; tween = null; root.classList.add('is-touched'); });

  function size() {
    const w = stage.clientWidth, h = stage.clientHeight, a = w / h, f = w < 600 ? 12.6 : 10.2;
    cam.left = -f * a; cam.right = f * a; cam.top = f; cam.bottom = -f; cam.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  }
  new ResizeObserver(size).observe(stage); size();

  // déplacement de caméra : accélère puis freine (ease-in-out), autour de la maison
  let tween = null;
  const inOut = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
  function flyTo(target, zoom, theta = Math.PI / 4, phi = 0.98, dur = 1000) {
    const s0 = new THREE.Spherical().setFromVector3(cam.position.clone().sub(controls.target));
    let dTh = (theta - s0.theta) % (Math.PI * 2);
    if (dTh > Math.PI) dTh -= Math.PI * 2; if (dTh < -Math.PI) dTh += Math.PI * 2;
    const t0 = controls.target.clone(), z0 = cam.zoom, start = performance.now(), sp = new THREE.Spherical(), off = new THREE.Vector3();
    if (calm) dur = 0;
    tween = (now) => {
      const k = dur ? Math.min(1, (now - start) / dur) : 1, e = inOut(k);
      controls.target.lerpVectors(t0, target, e);
      sp.set(s0.radius, s0.phi + (phi - s0.phi) * e, s0.theta + dTh * e);
      cam.position.copy(controls.target).add(off.setFromSpherical(sp));
      cam.zoom = z0 + (zoom - z0) * e; cam.updateProjectionMatrix();
      if (k >= 1) tween = null;
    };
  }

  // ---------- sélection d'un métier ----------
  const card = root.querySelector('.maison__card'), list = root.querySelector('.maison__list');
  let active = null, since = 0;
  function select(slug, from) {
    active = slug; since = 0;
    Object.entries(pins).forEach(([s, b]) => { b.classList.toggle('is-on', s === slug); b.setAttribute('aria-pressed', String(s === slug)); });
    root.classList.toggle('has-active', !!slug);
    controls.autoRotate = false;
    if (!slug) { card.hidden = true; list.hidden = false; flyTo(HOME, 1); return; }
    const data = root.querySelector(`[data-fiche="${slug}"]`);
    card.innerHTML = ''; card.appendChild(data.content.cloneNode(true));
    card.hidden = false; list.hidden = true;
    card.classList.remove('is-in'); void card.offsetWidth; card.classList.add('is-in');
    card.querySelector('[data-back]').addEventListener('click', () => { select(null); (pins[slug] || stage).focus({ preventScroll: true }); });
    if (from && from.classList.contains('pick')) card.querySelector('h3').focus({ preventScroll: true });
    const p = SPOTS[slug];
    const far = slug === 'electricite-tertiaire-et-industrielle' || slug === 'borne-irve';
    flyTo(new THREE.Vector3(p[0], Math.min(p[1], 1.8), p[2]), far ? 1.55 : 1.95, VIEW[slug] ?? Math.PI / 4);
    if (innerWidth < 900) {
      const r = card.getBoundingClientRect();
      if (r.top > innerHeight - 120) card.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'nearest' });
    }
  }
  root.querySelectorAll('[data-rot]').forEach((b) => b.addEventListener('click', () => {
    const s = new THREE.Spherical().setFromVector3(cam.position.clone().sub(controls.target));
    flyTo(controls.target.clone(), cam.zoom, s.theta + Number(b.dataset.rot) * Math.PI / 4, s.phi, 650);
    controls.autoRotate = false;
  }));
  root.querySelector('[data-reset]').addEventListener('click', () => select(null));

  // ---------- ouverture : le toit se soulève, les murs avant s'abaissent, les points s'allument ----------
  let intro = calm ? 1 : 0;
  const introDur = 2.4;
  function applyIntro(k) {
    const r = THREE.MathUtils.clamp(k / 0.55, 0, 1), re = inOut(r);
    roof.position.y = re * 6; M.roof.opacity = M.gable.opacity = 1 - THREE.MathUtils.clamp((r - 0.35) / 0.65, 0, 1);
    roof.visible = r < 1;
    const w = inOut(THREE.MathUtils.clamp((k - 0.3) / 0.5, 0, 1));
    lowWalls.forEach((m) => { m.scale.y = 1 - w * (1 - LOW / H); });
    if (k >= 0.8 && !root.classList.contains('is-open')) root.classList.add('is-open');
  }
  cam.zoom = calm ? 1 : 0.88; cam.updateProjectionMatrix();
  applyIntro(intro);

  // ---------- boucle : ne tourne que lorsque la maison est à l'écran ----------
  const v = new THREE.Vector3();
  let visible = false, last = 0, t = 0, started = false;
  new IntersectionObserver((es) => {
    visible = es[0].isIntersecting;
    if (visible) {
      if (!started && !calm) { started = true; flyTo(HOME, 1, Math.PI / 4, 0.98, introDur * 1000); }
      last = performance.now(); requestAnimationFrame(loop);
    }
  }, { threshold: 0.35 }).observe(stage);
  function loop(now) {
    if (!visible) return;
    const dt = Math.min(0.05, (now - last) / 1000); loop.prev = last; last = now; t += dt; since += dt;
    if (intro < 1) { intro = Math.min(1, intro + Math.min(0.1, (now - (loop.prev || now)) / 1000) / introDur); applyIntro(intro); if (intro >= 1 && !active && !calm) controls.autoRotate = !root.classList.contains('is-touched'); }
    if (tween) tween(now);
    controls.update();
    for (const slug in fx) fx[slug](slug === active ? since : t, slug === active, dt);
    renderer.render(scene, cam);
    const w = stage.clientWidth, h = stage.clientHeight;
    for (const slug in pins) {
      v.set(...SPOTS[slug]).project(cam);
      const x = (v.x + 1) / 2 * w, y = (1 - v.y) / 2 * h, b = pins[slug];
      b.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      if (!b._lw) b._lw = b.lastChild.offsetWidth;   // largeur de l'étiquette, mesurée une fois
      b.classList.toggle('is-left', x + b._lw + 30 > w && x > w / 2);
    }
    requestAnimationFrame(loop);
  }
  if (calm) root.classList.add('is-open');
  stage.classList.add('is-ready');
}
