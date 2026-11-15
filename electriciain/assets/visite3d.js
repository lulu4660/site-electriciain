/* « La visite » : une maison en 3D que l'on parcourt en faisant défiler la page.
   La vue reste épinglée à l'écran pendant que les étapes (du vrai texte HTML) défilent par-dessus.
   Le toit se soulève, la caméra passe de pièce en pièce, chaque métier s'allume, le jour tombe ;
   à la fin la maison illuminée se fait tourner librement.
   Modèles : Kenney (CC0). three.js n'est chargé qu'à l'approche de la section. */
const root = document.querySelector('[data-visite]');
if (root) {
  const io = new IntersectionObserver((es) => {
    if (!es[0].isIntersecting) return;
    io.disconnect();
    Promise.all([
      import('three'),
      import('three/addons/loaders/GLTFLoader.js'),
      import('three/addons/geometries/RoundedBoxGeometry.js'),
      import('three/addons/environments/RoomEnvironment.js'),
      import('three/addons/controls/OrbitControls.js'),
      import('three/addons/utils/BufferGeometryUtils.js'),
    ]).then((mods) => boot(...mods)).catch((e) => { console.warn(e); root.classList.add('is-nogl'); });
  }, { rootMargin: '600px 0px' });
  io.observe(root);
}

async function boot(THREE, { GLTFLoader }, { RoundedBoxGeometry }, { RoomEnvironment }, { OrbitControls }, { mergeGeometries }) {
  const rm = matchMedia('(prefers-reduced-motion: reduce)');
  let calm = rm.matches;
  const coarse = matchMedia('(pointer: coarse)').matches;
  const stage = root.querySelector('.visite__stage');
  const canvas = root.querySelector('.visite__canvas');
  const steps = [...root.querySelectorAll('.vstep')];
  const N = steps.length - 1;                      // index de la dernière étape
  const glbUrl = root.dataset.glb;

  // ---------- rendu ----------
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' }); }
  catch (e) { root.classList.add('is-nogl'); return; }
  const hiQ = !coarse && innerWidth > 900 && !/[?&]q=low/.test(location.search);   // ?q=low : sans post-traitement (tests)
  let dpr = Math.min(devicePixelRatio, hiQ ? 1.75 : 1.5);
  renderer.setPixelRatio(dpr);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  const SKY = { day: new THREE.Color(0xe9edf0), dusk: new THREE.Color(0xf3cfa8), blue: new THREE.Color(0x3d5285), night: new THREE.Color(0x0e1a31) };
  scene.background = SKY.day.clone();
  scene.fog = new THREE.Fog(SKY.day.clone(), 60, 120);

  const cam = new THREE.PerspectiveCamera(30, 1, 0.5, 200);
  const hemi = new THREE.HemisphereLight(0xffffff, 0xd2d6cf, 0.55); scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff4e2, 2.6);
  sun.position.set(14, 24, 12); sun.castShadow = true;
  sun.shadow.mapSize.set(hiQ ? 2048 : 1024, hiQ ? 2048 : 1024);
  Object.assign(sun.shadow.camera, { left: -20, right: 20, top: 16, bottom: -16, near: 2, far: 70 });
  sun.shadow.bias = -0.0003; sun.shadow.normalBias = 0.03; sun.shadow.radius = 5;
  scene.add(sun);

  // ---------- matières et textures dessinées par le code ----------
  const std = (color, roughness = 0.85, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness, metalness: 0, ...extra });
  function canvasTex(w, h, draw, repeat) {
    const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = renderer.capabilities.getMaxAnisotropy(); if (repeat) t.repeat.set(...repeat); return t;
  }
  const rnd = (() => { let s = 7; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();   // aléatoire reproductible
  const parquet = canvasTex(512, 512, (g, w, h) => {
    const rows = 8, rh = h / rows;
    for (let r = 0; r < rows; r++) {
      let x = -rnd() * 200;
      while (x < w) {
        const len = 140 + rnd() * 160, l = 72 + rnd() * 8;
        g.fillStyle = `hsl(33, ${38 + rnd() * 10}%, ${l}%)`; g.fillRect(x, r * rh, len, rh);
        g.fillStyle = 'rgba(90,60,30,.10)'; for (let k = 0; k < 6; k++) g.fillRect(x, r * rh + rnd() * rh, len, 1);
        g.fillStyle = 'rgba(80,55,30,.35)'; g.fillRect(x, r * rh, 1.5, rh); x += len;
      }
      g.fillStyle = 'rgba(80,55,30,.35)'; g.fillRect(0, r * rh, w, 1.5);
    }
  }, [3, 3]);
  const tiles = canvasTex(256, 256, (g, w) => {
    g.fillStyle = '#e8eae6'; g.fillRect(0, 0, w, w);
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { g.fillStyle = `hsl(90, 4%, ${88 + rnd() * 4}%)`; g.fillRect(i * 64 + 1, j * 64 + 1, 62, 62); }
  }, [4, 4]);
  const grass = canvasTex(256, 256, (g, w) => {
    g.fillStyle = '#9fbf86'; g.fillRect(0, 0, w, w);
    for (let i = 0; i < 2600; i++) { g.fillStyle = `hsla(${90 + rnd() * 25}, 35%, ${48 + rnd() * 18}%, .35)`; g.fillRect(rnd() * w, rnd() * w, 1.5, 3); }
  }, [10, 8]);
  const paving = canvasTex(256, 256, (g, w) => {
    g.fillStyle = '#c9ccc6'; g.fillRect(0, 0, w, w);
    for (let i = 0; i < 4; i++) for (let j = 0; j < 8; j++) { g.fillStyle = `hsl(60, 4%, ${76 + rnd() * 6}%)`; g.fillRect(i * 64 + (j % 2) * 32 + 1, j * 32 + 1, 62, 30); }
  }, [2, 3]);
  const M = {
    wall: std(0xf7f6f2, 0.92), wallEdge: std(0xe9e7e1, 0.9), plinth: std(0xdcdfd9, 0.95),
    oak: std(0xffffff, 0.7, { map: parquet }), tile: std(0xffffff, 0.4, { map: tiles }),
    lawn: std(0xffffff, 1, { map: grass }), pave: std(0xffffff, 0.95, { map: paving }), concrete: std(0xcdd0ca, 0.95),
    roof: std(0x2a5cb3, 0.6, { transparent: true }), gable: std(0xf7f6f2, 0.92, { transparent: true }),
    frame: std(0x30363c, 0.45), glass: std(0xcfe0f2, 0.05, { transparent: true, opacity: 0.32, depthWrite: false }),
    white: std(0xffffff, 0.35), dark: std(0x262a2e, 0.5), steel: std(0xb9bfc4, 0.3, { metalness: 0.7 }), blue: std(0x2a5cb3, 0.5),
    road: std(0x9ea29c, 0.95), gate: std(0x30363c, 0.5),
  };
  const glow = (color, emissive = 0x000000) => std(color, 0.5, { emissive });

  const statics = [];   // géométries fixes fusionnées à la fin, par matière
  function rbox(w, h, d, x, y, z, mat, parent = scene, r = 0.03) {
    const m = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 2, Math.min(r, w / 2.1, h / 2.1, d / 2.1)), mat);
    m.position.set(x, y + h / 2, z); m.castShadow = m.receiveShadow = true; parent.add(m);
    if (parent === scene && Object.values(M).includes(mat) && !mat.transparent) statics.push(m);
    return m;
  }

  // ---------- terrain ----------
  rbox(31, 0.8, 23, 0, -0.8, 0, M.plinth, scene, 0.35);
  rbox(30.4, 0.06, 22.4, 0, 0, 0, M.lawn, scene, 0.03);
  rbox(5.6, 0.07, 8.6, 6.75, 0.02, 6.6, M.pave, scene, 0.03);                 // allée du garage
  rbox(1.5, 0.07, 6.6, -0.1, 0.02, 7.6, M.pave, scene, 0.03);                 // allée piétonne
  rbox(30.4, 0.05, 1.6, 0, 0.0, 11.0, M.road, scene, 0.02);                    // trottoir

  // ---------- murs avec ouvertures ----------
  const H = 2.7, T = 0.2, F0 = 0.12;            // hauteur, épaisseur, niveau du sol fini
  const lowerable = [];                          // murs avant qui s'abaissent quand le toit s'en va
  // mur le long de x (de x1 à x2, à la profondeur z) ; ouvertures : [début, fin, bas, haut, 'fenetre'|'porte']
  function wallX(x1, x2, z, open = [], low = false) {
    const g = low ? new THREE.Group() : scene; if (low) { scene.add(g); lowerable.push(g); }
    let x = x1; const sorted = open.slice().sort((a, b) => a[0] - b[0]);
    for (const [a, b, y0, y1, kind] of sorted) {
      if (a > x) rbox(a - x, H, T, (x + a) / 2, F0, z, M.wall, g, 0.02);
      if (y0 > 0) rbox(b - a, y0, T, (a + b) / 2, F0, z, M.wall, g, 0.02);
      if (y1 < H) rbox(b - a, H - y1, T, (a + b) / 2, F0 + y1, z, M.wall, g, 0.02);
      opening(a, b, y0, y1, z, 'x', kind, g); x = b;
    }
    if (x < x2) rbox(x2 - x, H, T, (x + x2) / 2, F0, z, M.wall, g, 0.02);
    return g;
  }
  function wallZ(z1, z2, x, open = [], low = false) {
    const g = low ? new THREE.Group() : scene; if (low) { scene.add(g); lowerable.push(g); }
    let z = z1; const sorted = open.slice().sort((a, b) => a[0] - b[0]);
    for (const [a, b, y0, y1, kind] of sorted) {
      if (a > z) rbox(T, H, a - z, x, F0, (z + a) / 2, M.wall, g, 0.02);
      if (y0 > 0) rbox(T, y0, b - a, x, F0, (a + b) / 2, M.wall, g, 0.02);
      if (y1 < H) rbox(T, H - y1, b - a, x, F0 + y1, (a + b) / 2, M.wall, g, 0.02);
      opening(a, b, y0, y1, x, 'z', kind, g); z = b;
    }
    if (z < z2) rbox(T, H, z2 - z, x, F0, (z + z2) / 2, M.wall, g, 0.02);
    return g;
  }
  function opening(a, b, y0, y1, c, axis, kind, g) {
    if (kind !== 'fenetre') return;
    const L = b - a, mid = (a + b) / 2, f = 0.06;
    const put = (w, h, d, u, y, mat) => axis === 'x' ? rbox(w, h, d, u, y, c, mat, g, 0.01) : rbox(d, h, w, c, y, u, mat, g, 0.01);
    put(L, f, T + 0.04, mid, F0 + y0, M.frame); put(L, f, T + 0.04, mid, F0 + y1 - f, M.frame);
    put(f, y1 - y0, T + 0.04, a + f / 2, F0 + y0, M.frame); put(f, y1 - y0, T + 0.04, b - f / 2, F0 + y0, M.frame);
    put(f, y1 - y0, 0.06, mid, F0 + y0, M.frame);
    const glass = axis === 'x' ? new THREE.Mesh(new THREE.PlaneGeometry(L, y1 - y0), M.glass) : new THREE.Mesh(new THREE.PlaneGeometry(L, y1 - y0), M.glass);
    glass.position.set(axis === 'x' ? mid : c, F0 + (y0 + y1) / 2, axis === 'x' ? c : mid); if (axis === 'z') glass.rotation.y = Math.PI / 2;
    g.add(glass);
  }

  // maison : x -8..4, z -5..4 ; garage : x 4..9.6, z -5..2
  rbox(12.2, F0, 9.2, -2, 0, -0.5, M.wallEdge, scene, 0.02);
  const floor = (w, d, x, z, mat) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), mat); m.rotation.x = -Math.PI / 2; m.position.set(x, F0 + 0.005, z); m.receiveShadow = true; scene.add(m); return m; };
  floor(7, 9, -4.5, -0.5, M.oak);                // séjour-cuisine
  floor(3.2, 5.5, 2.4, 1.25, M.oak);             // chambre
  floor(1.8, 5.5, -0.1, 1.25, M.oak);            // entrée
  floor(2.4, 3.5, -0.2, -3.25, M.tile);          // cellier technique
  floor(3, 3.5, 2.5, -3.25, M.tile);             // salle de bain
  wallX(-8, 4, -5, [[-7, -5.4, 0.9, 2.2, 'fenetre'], [-4.6, -3.0, 0.9, 2.2, 'fenetre'], [2.0, 3.2, 1.4, 2.2, 'fenetre']]);   // nord
  wallZ(-5, 4, -8, [[-2.2, 0.6, 0.6, 2.3, 'fenetre']]);                                                                      // ouest
  wallX(-8, 4, 4, [[-6.6, -4.2, 0.5, 2.3, 'fenetre'], [-0.6, 0.4, 0, 2.15, 'porte'], [1.6, 3.2, 0.9, 2.2, 'fenetre']], true); // sud
  wallZ(-1.5, 4, 4, [[0.2, 1.8, 0.9, 2.2, 'fenetre']], true);                                                                 // est (chambre)
  // cloisons
  wallZ(-5, -1.5, -1.4, [[-3.0, -2.2, 0, 2.1, 'porte']]);
  wallZ(-5, -1.5, 1.0, []);
  wallX(-1.4, 4, -1.5, [[-0.6, 0.2, 0, 2.1, 'porte'], [1.6, 2.4, 0, 2.1, 'porte']]);
  wallZ(-1.5, 4, 0.8, [[-0.8, 0.0, 0, 2.1, 'porte']]);
  // garage
  rbox(5.6, F0, 7.2, 6.8, 0, -1.5, M.concrete, scene, 0.02);
  wallX(4, 9.6, -5, []);
  wallZ(-5, 2, 9.6, [], true);
  wallZ(-5, -1.5, 4, []);
  rbox(0.55, H, T, 4.27, F0, 2 - T / 2, M.wall); rbox(0.55, H, T, 9.33, F0, 2 - T / 2, M.wall);
  rbox(4.5, 0.35, T, 6.8, F0 + H - 0.35, 2 - T / 2, M.wall);

  // ---------- toit (se soulève au premier défilement) ----------
  const roof = new THREE.Group(); scene.add(roof);
  const rise = 2.4, half = 4.75, slope = Math.atan(rise / half), len = Math.hypot(rise, half) + 0.3;
  [-1, 1].forEach((s) => {
    const m = new THREE.Mesh(new RoundedBoxGeometry(12.8, 0.2, len, 2, 0.06), M.roof);
    m.position.set(-2, F0 + H + rise / 2 + 0.06, -0.5 + s * half / 2); m.rotation.x = s * slope; m.castShadow = true; roof.add(m);
  });
  const gShape = new THREE.Shape([new THREE.Vector2(-4.6, 0), new THREE.Vector2(4.6, 0), new THREE.Vector2(0, rise)]);
  [-8, 4 - T].forEach((x) => {
    const g = new THREE.Mesh(new THREE.ExtrudeGeometry(gShape, { depth: T, bevelEnabled: false }), M.gable);
    g.rotation.y = Math.PI / 2; g.position.set(x, F0 + H, -0.5); g.castShadow = true; roof.add(g);
  });
  const gRoof = new THREE.Mesh(new RoundedBoxGeometry(5.9, 0.22, 7.4, 2, 0.06), M.roof);
  gRoof.position.set(6.8, F0 + H + 0.11, -1.5); gRoof.castShadow = true; roof.add(gRoof);

  // ---------- modèles 3D (mobilier, voiture, végétation) ----------
  const lib = {};
  try {
    const gltf = await new GLTFLoader().loadAsync(glbUrl);
    gltf.scene.children.slice().forEach((n) => { lib[n.name] = n; });
  } catch (e) { console.warn('modèles 3D indisponibles', e); }
  const RECOLOR = {   // palette du site : chêne clair, blanc, bleu du logo, verts naturels
    wood: 0xd9b88e, woodDark: 0xa98260, woodBark: 0x8a6446, woodBarkDark: 0x6e4f3a,
    metal: 0xdadcd8, metalLight: 0xf3f4f1, metalMedium: 0x8f969b, metalDark: 0x3a3f44,
    carpet: 0x2a5cb3, carpetBlue: 0x1e4790, carpetDarker: 0x3e444b, carpetWhite: 0xf1efe9,
    plant: 0x5e8f52, leafsGreen: 0x76a05e, leafsDark: 0x4f7c4a, grass: 0x86ab6b, lamp: 0xfff3d6,
    colorYellow: 0xf7c600, colorRed: 0xd8564f, colorPurple: 0x8f7fe0,
  };
  const recolored = new Set();
  function put(name, x, z, { s = 2, ry = 0, y = F0 } = {}) {
    const src = lib[name]; if (!src) return null;
    const o = src.clone(true);
    o.traverse((c) => {
      if (!c.isMesh) return;
      c.castShadow = c.receiveShadow = true;
      const m = c.material;
      if (m && !recolored.has(m)) {
        recolored.add(m);
        if (RECOLOR[m.name] !== undefined) m.color.set(RECOLOR[m.name]);
        if ('roughness' in m) { m.roughness = Math.max(m.roughness, 0.55); m.metalness = Math.min(m.metalness, m.name.startsWith('metal') ? 0.4 : 0); }
      }
    });
    o.scale.setScalar(s); o.rotation.y = ry; o.position.set(x, y, z); scene.add(o); return o;
  }
  // séjour : cuisine contre le mur nord, salon face à la télé
  [-7.5, -6.64, -5.78, -4.92].forEach((x, i) => put(['kitchenCabinet', 'kitchenSink', 'kitchenStoveElectric', 'kitchenCabinetDrawer'][i], x, -4.45, { ry: 0 }));
  put('kitchenFridgeLarge', -2.6, -4.4);
  [-7.5, -6.64].forEach((x) => put('kitchenCabinetUpperDouble', x, -4.68, { y: F0 + 1.45 }));
  put('table', -5.6, -2.4, { ry: 0 });
  [[-6.3, -2.4, Math.PI / 2], [-4.9, -2.4, -Math.PI / 2], [-5.6, -1.75, Math.PI], [-5.6, -3.05, 0]].forEach(([x, z, r]) => put('chair', x, z, { ry: r }));
  put('rugRectangle', -4.6, 1.6, { s: 2.2 });
  put('loungeSofaLong', -4.6, 0.55, { ry: 0 });
  put('tableCoffee', -4.6, 1.85);
  put('cabinetTelevision', -4.6, 3.55, { ry: Math.PI });
  put('televisionModern', -4.6, 3.6, { ry: Math.PI, y: F0 + 0.62 });
  put('loungeChair', -2.4, 1.7, { ry: -Math.PI / 2 });
  put('lampRoundFloor', -7.4, 0.2);
  put('pottedPlant', -7.4, 3.4); put('bookcaseOpenLow', -7.6, 1.6, { ry: Math.PI / 2 }); put('books', -7.6, 1.6, { y: F0 + 0.8 });
  // chambre
  put('bedDouble', 2.6, 2.2, { ry: -Math.PI / 2 });
  put('cabinetBedDrawerTable', 3.55, 0.95, { ry: -Math.PI / 2 }); put('cabinetBedDrawerTable', 3.55, 3.45, { ry: -Math.PI / 2 });
  put('lampRoundTable', 3.55, 0.95, { y: F0 + 0.53 }); put('lampRoundTable', 3.55, 3.45, { y: F0 + 0.53 });
  put('rugRounded', 1.6, 2.2, { s: 1.4, ry: Math.PI / 2 });
  // entrée
  put('plantSmall1', 0.1, 3.4, { s: 3 });
  // cellier technique
  put('washer', -0.95, -2.2, { ry: Math.PI / 2 }); put('dryer', -0.95, -3.0, { ry: Math.PI / 2 });
  // salle de bain
  put('bathtub', 2.55, -4.35, { ry: 0 });
  put('toilet', 3.6, -2.2, { ry: -Math.PI / 2 });
  put('bathroomSink', 1.4, -2.0, { ry: Math.PI / 2 }); put('bathroomMirror', 1.13, -2.0, { ry: Math.PI / 2, y: F0 + 1.3 });
  // jardin
  const trees = [['tree_oak', -12.5, 7.5, 3.6], ['tree_default', 12.6, -8.2, 3.6], ['tree_detailed', -12.8, -1.5, 3.2], ['tree_pineRoundC', 13.1, 3.0, 3.6], ['tree_oak', 2.6, -9.2, 3.0], ['tree_default', -4.5, -9.0, 2.6]];
  trees.forEach(([n, x, z, s]) => put(n, x, z, { s, ry: rnd() * 6, y: 0.03 }));
  for (let i = 0; i < 9; i++) put(['plant_bushDetailed', 'plant_bushLarge', 'plant_bush'][i % 3], -7.6 + i * 0.85, 5.2, { s: 2.2, ry: rnd() * 6, y: 0.03 });
  [[1.8, 5.1], [2.6, 5.4], [3.3, 5.0], [-8.6, 2.0], [-8.7, -3.0]].forEach(([x, z], i) => put(['flower_yellowA', 'flower_purpleB', 'flower_redA'][i % 3], x, z, { s: 2.6, y: 0.03 }));
  [[11.4, 6.4], [-10.5, 9.5], [10.8, -3.6]].forEach(([x, z]) => put('grass_large', x, z, { s: 2.6, y: 0.03 }));
  put('pot_large', 0.95, 4.7, { s: 1.4, y: 0.03 });

  // ---------- les équipements, un par métier : act[k](niveau 0..1, temps) ----------
  const act = {};
  const lights = [];
  const L = (color, x, y, z, dist = 6) => { const l = new THREE.PointLight(color, 0, dist, 1.6); l.position.set(x, y, z); scene.add(l); lights.push(l); return l; };

  // 1. électricité générale : le tableau du cellier, ses modules s'allument un à un
  const TBx = -0.2, TBz = -4.86;
  rbox(1.3, 1.1, 0.16, TBx, 1.15, TBz, M.white, scene, 0.04);
  rbox(1.18, 0.98, 0.04, TBx, 1.21, TBz + 0.08, std(0xe4e6e2, 0.8), scene, 0.02);
  const leds = [];
  for (let r = 0; r < 3; r++) {
    rbox(1.1, 0.04, 0.03, TBx, 1.35 + r * 0.3, TBz + 0.11, M.steel, scene, 0.01);
    for (let c = 0; c < 9; c++) {
      rbox(0.1, 0.22, 0.08, TBx - 0.48 + c * 0.12, 1.26 + r * 0.3, TBz + 0.13, std(0xfcfcfa, 0.6), scene, 0.015);
      leds.push(rbox(0.05, 0.035, 0.02, TBx - 0.48 + c * 0.12, 1.42 + r * 0.3, TBz + 0.18, glow(0xc8ccc6), scene, 0.008));
    }
  }
  const tbLight = L(0xffd36b, TBx, 1.7, TBz + 0.9, 3.5);
  act[1] = (a) => {
    leds.forEach((m, i) => { const on = a * leds.length > i + 0.5; m.material.color.set(on ? 0xf7c600 : 0xc8ccc6); m.material.emissive.set(on ? 0xc89a00 : 0x000000); });
    tbLight.intensity = a * 4;
  };

  // 2. domotique : suspensions du séjour, bandeau LED de cuisine, volet roulant piloté, tablette murale
  const pendants = [];
  [[-5.6, -2.4], [-4.6, 1.6]].forEach(([x, z]) => {
    rbox(0.012, 0.9, 0.012, x, F0 + H - 0.9, z, M.dark, scene, 0.004);
    const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.34, 0.26, 32, 1, true), std(0x2a5cb3, 0.5, { side: THREE.DoubleSide }));
    shade.position.set(x, F0 + H - 1.0, z); shade.castShadow = true; scene.add(shade);
    const bulbM = glow(0xfff4dc); const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.08, 16, 10), bulbM); bulb.position.set(x, F0 + H - 1.08, z); scene.add(bulb);
    pendants.push({ bulbM, light: L(0xffd59a, x, F0 + H - 1.25, z, 7) });
  });
  const ledStrip = rbox(1.7, 0.02, 0.05, -7.07, F0 + 1.42, -4.42, glow(0xfaf7ef), scene, 0.005);
  const shutter = new THREE.Group(); shutter.position.set(-8 + T / 2 + 0.02, F0 + 2.3, -0.8); scene.add(shutter);
  rbox(0.12, 0.22, 2.9, -8 + T / 2 + 0.06, F0 + 2.3, -0.8, M.white);
  const slats = rbox(0.05, 1.7, 2.75, 0, -1.7, 0, std(0xdfe2dc, 0.6), shutter, 0.01);
  shutter.scale.y = 0.02;
  const tablet = rbox(0.03, 0.22, 0.32, -1.52, F0 + 1.3, 0.6, glow(0x1a1d20), scene, 0.02);
  act[2] = (a, t) => {
    pendants.forEach((p) => { p.bulbM.emissive.setRGB(2.4 * a, 1.9 * a, 1.2 * a); p.light.intensity = a * 9; });
    ledStrip.material.emissive.setRGB(1.6 * a, 1.4 * a, 1.0 * a);
    shutter.scale.y = 0.02 + 0.98 * THREE.MathUtils.smoothstep(a, 0.3, 1);
    tablet.material.emissive.setRGB(0.05 * a, 0.25 * a, 0.75 * a);
  };

  // 3. chauffage : radiateur de la chambre (mur est), il rougit et la chaleur monte
  const RX = 3.86, RZ = 2.2;
  const fins = [];
  for (let i = 0; i < 9; i++) fins.push(rbox(0.1, 0.62, 0.11, RX, F0 + 0.18, RZ - 0.66 + i * 0.165, glow(0xf8f8f6), scene, 0.04));
  rbox(0.08, 0.05, 1.5, RX, F0 + 0.12, RZ, M.white);
  const heatL = L(0xff8a3c, RX - 0.6, F0 + 0.7, RZ, 4.5);
  const heatN = 46, heatPos = new Float32Array(heatN * 3), heatSeed = [];
  for (let i = 0; i < heatN; i++) heatSeed.push([RX - 0.15 - rnd() * 0.25, RZ - 0.7 + rnd() * 1.4, rnd()]);
  const heatGeo = new THREE.BufferGeometry(); heatGeo.setAttribute('position', new THREE.BufferAttribute(heatPos, 3));
  const dot = canvasTex(64, 64, (g) => { const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); });
  const heatM = new THREE.PointsMaterial({ color: 0xff9a4a, size: 0.22, map: dot, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
  scene.add(new THREE.Points(heatGeo, heatM));
  act[3] = (a, t) => {
    fins.forEach((f, i) => { const k = THREE.MathUtils.clamp(a * 1.6 - i * 0.05, 0, 1); f.material.color.setRGB(1, 1 - 0.34 * k, 1 - 0.8 * k); f.material.emissive.setRGB(0.45 * k, 0.12 * k, 0); });
    heatL.intensity = a * 5; heatM.opacity = 0.55 * a;
    heatSeed.forEach(([x, z, s], i) => { const p = (t * 0.25 + s) % 1; heatPos.set([x - p * 0.25 + Math.sin(t * 2 + i) * 0.05, F0 + 0.85 + p * 1.6, z + Math.sin(t * 1.3 + i * 2) * 0.06], i * 3); });
    heatGeo.attributes.position.needsUpdate = true;
  };

  // 4. VMC : caisson au-dessus du cellier, gaines vers la cuisine et la salle de bain, l'air circule
  const vmcBox = rbox(0.9, 0.45, 0.7, -0.2, F0 + H + 0.05, -3.2, std(0xffffff, 0.35), scene, 0.06);
  const ducts = [
    new THREE.CatmullRomCurve3([[-0.2, 3.05, -3.2], [1.4, 3.05, -3.2], [2.6, 3.05, -3.0], [2.6, 2.75, -3.0]].map((p) => new THREE.Vector3(...p))),
    new THREE.CatmullRomCurve3([[-0.2, 3.05, -3.2], [-2.4, 3.05, -3.6], [-5.8, 3.05, -4.2], [-5.8, 2.75, -4.4]].map((p) => new THREE.Vector3(...p))),
    new THREE.CatmullRomCurve3([[-0.2, 3.25, -3.2], [-0.2, 4.1, -3.2], [-0.2, 4.6, -3.0]].map((p) => new THREE.Vector3(...p))),
  ];
  const ductM = std(0xd6dadf, 0.35, { metalness: 0.5 });
  const ductMeshes = ducts.map((c) => { const m = new THREE.Mesh(new THREE.TubeGeometry(c, 40, 0.09, 12), ductM); m.castShadow = true; scene.add(m); return m; });
  [[2.6, -3.0], [-5.8, -4.4]].forEach(([x, z]) => { const v = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.05, 24), M.white); v.position.set(x, 2.72, z); scene.add(v); });
  const fan = new THREE.Group(); fan.position.set(-0.2, F0 + H + 0.28, -2.84); scene.add(fan);
  for (let i = 0; i < 5; i++) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.16, 0.01), M.blue); b.position.y = 0.08; const arm = new THREE.Group(); arm.rotation.z = i * 1.2566; arm.add(b); fan.add(arm); }
  const airN = 60, air = new THREE.InstancedMesh(new THREE.SphereGeometry(0.045, 8, 6), new THREE.MeshBasicMaterial({ color: 0x8fc2ff, transparent: true, opacity: 0 }), airN);
  scene.add(air);
  const tmpO = new THREE.Object3D();
  let fanSpin = 0;
  act[4] = (a, t, dt) => {
    ductMeshes.forEach((m) => { const n = m.geometry.index.count; m.geometry.setDrawRange(0, Math.floor(n * THREE.MathUtils.clamp(a * 1.25, 0, 1) / 6) * 6); m.visible = a > 0.01; });
    const sc = Math.max(0.0001, THREE.MathUtils.smoothstep(a, 0, 0.35)); vmcBox.scale.setScalar(sc); fan.scale.setScalar(sc);
    fanSpin += (0.4 + a * 14) * dt; fan.rotation.z = -fanSpin;
    air.material.opacity = 0.9 * a;
    for (let i = 0; i < airN; i++) {
      const c = ducts[i % 3], u = ((t * 0.22 + i / airN * 3) % 1);
      c.getPointAt(i % 3 === 2 ? u : 1 - u, tmpO.position); tmpO.scale.setScalar(a > 0.02 ? 1 : 0.0001); tmpO.updateMatrix(); air.setMatrixAt(i, tmpO.matrix);
    }
    air.instanceMatrix.needsUpdate = true;
  };

  // 5. alarme & interphonie : détecteur qui balaie le séjour, visiophone, caméra extérieure
  const det = rbox(0.14, 0.12, 0.14, -7.82, F0 + 2.45, -4.82, M.white, scene, 0.04);
  const detLed = new THREE.Mesh(new THREE.SphereGeometry(0.025, 10, 8), glow(0x3a3f44)); detLed.position.set(-7.74, F0 + 2.48, -4.74); scene.add(detLed);
  const beamPivot = new THREE.Group(); beamPivot.position.set(-7.75, F0 + 2.45, -4.75); scene.add(beamPivot);
  const beamM = new THREE.MeshBasicMaterial({ color: 0xff4a3d, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
  const beam = new THREE.Mesh(new THREE.ConeGeometry(1.3, 5.2, 32, 1, true), beamM);
  beam.rotation.x = Math.PI / 2; beam.position.z = 2.6; const beamTilt = new THREE.Group(); beamTilt.rotation.x = 0.42; beamTilt.add(beam); beamPivot.add(beamTilt);
  rbox(0.2, 0.32, 0.05, 0.75, F0 + 1.25, 4.13, M.dark, scene, 0.02);                 // platine extérieure
  const callBtn = rbox(0.06, 0.06, 0.03, 0.75, F0 + 1.3, 4.17, glow(0x2a5cb3), scene, 0.01);
  const visio = rbox(0.03, 0.22, 0.3, 0.7, F0 + 1.35, 3.0, glow(0x101215), scene, 0.02);  // écran intérieur (entrée)
  const camBody = rbox(0.12, 0.12, 0.3, 9.45, F0 + 2.35, 2.15, M.white, scene, 0.04);
  const camLed = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 6), glow(0x3a3f44)); camLed.position.set(9.45, F0 + 2.41, 2.32); scene.add(camLed);
  act[5] = (a, t) => {
    beamM.opacity = 0.09 * a; beamPivot.rotation.y = 0.75 + Math.sin(t * 0.9) * 0.45;
    const blink = a > 0.05 && Math.sin(t * 7) > 0;
    detLed.material.emissive.set(blink ? 0xff2a1a : 0x000000); camLed.material.emissive.set(a > 0.05 && Math.sin(t * 3) > 0.6 ? 0xff2a1a : 0x000000);
    visio.material.emissive.setRGB(0.15 * a, 0.35 * a, 0.8 * a);
    callBtn.material.emissive.setRGB(0.1 * a, 0.3 * a, 1.2 * a * (0.6 + 0.4 * Math.sin(t * 4)));
  };

  // 6. motorisation : porte de garage qui bascule, portail coulissant, feu clignotant
  const gPivot = new THREE.Group(); gPivot.position.set(6.8, F0 + H - 0.35, 2 - T / 2 - 0.05); scene.add(gPivot);
  const gDoor = rbox(4.5, 2.25, 0.08, 0, -2.25, 0, std(0xf2f1ec, 0.6), gPivot, 0.02);
  for (let i = 1; i < 5; i++) rbox(4.5, 0.025, 0.1, 0, -1.125 + i * 0.45 - 0.0125, 0, std(0xd9d8d2, 0.7), gDoor, 0.005);   // rainures des panneaux
  // clôture et portail sur la rue
  for (let x = -14.6; x <= 14.6; x += 1.6) if (x < 3.8 || x > 10) rbox(0.07, 1.0, 0.07, x, 0.03, 10.1, M.gate, scene, 0.01);
  rbox(18.4, 0.05, 0.05, -5.4, 0.95, 10.1, M.gate, scene, 0.01); rbox(18.4, 0.05, 0.05, -5.4, 0.35, 10.1, M.gate, scene, 0.01);
  rbox(4.6, 0.05, 0.05, 12.5, 0.95, 10.1, M.gate, scene, 0.01); rbox(4.6, 0.05, 0.05, 12.5, 0.35, 10.1, M.gate, scene, 0.01);
  rbox(0.18, 1.3, 0.18, 4.0, 0.03, 10.1, M.dark, scene, 0.03); rbox(0.18, 1.3, 0.18, 9.8, 0.03, 10.1, M.dark, scene, 0.03);
  const gate = new THREE.Group(); gate.position.set(6.9, 0.03, 10.25); scene.add(gate);
  rbox(5.5, 0.07, 0.07, 0, 1.05, 0, M.gate, gate, 0.01); rbox(5.5, 0.07, 0.07, 0, 0.12, 0, M.gate, gate, 0.01);
  for (let i = 0; i < 23; i++) rbox(0.035, 0.95, 0.035, -2.7 + i * 0.245, 0.15, 0, M.gate, gate, 0.005);
  const flashM = glow(0xf5d8b8); const flash = new THREE.Mesh(new THREE.SphereGeometry(0.11, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2), flashM); flash.position.set(9.8, 1.33, 10.1); scene.add(flash);
  const flashL = L(0xff8a00, 9.8, 1.6, 10.3, 5);
  let prevA6 = 0;
  act[6] = (a, t, dt) => {
    const e = THREE.MathUtils.smootherstep(a, 0, 1);
    gPivot.rotation.x = e * (Math.PI / 2 - 0.08);
    gate.position.x = 6.9 + e * 5.4;
    const moving = Math.abs(a - prevA6) > 0.0005 || (a > 0.02 && a < 0.98); prevA6 = a;
    const on = moving && Math.sin(t * 10) > 0;
    flashM.emissive.set(on ? 0xff8a00 : 0x000000); flashL.intensity = on ? 3 : 0;
  };

  // 7. borne de recharge : la borne, la voiture, le câble où le courant circule, la batterie qui se remplit
  const car = put('sedan', 6.9, 5.3, { s: 1.7, ry: Math.PI, y: 0.08 });
  car && car.traverse((c) => {
    const m = c.material; if (!c.isMesh || !m || !m.map || m.userData.repainted) return;
    m.userData.repainted = true;
    const img = m.map.image, cv = document.createElement('canvas'); cv.width = img.width; cv.height = img.height;
    const g = cv.getContext('2d'); g.drawImage(img, 0, 0); const d = g.getImageData(0, 0, cv.width, cv.height), px = d.data;
    for (let i = 0; i < px.length; i += 4) {
      const r = px[i] / 255, gg = px[i + 1] / 255, b = px[i + 2] / 255, mx = Math.max(r, gg, b), mn = Math.min(r, gg, b);
      if (mx - mn > 0.25 && r === mx && gg < 0.75) {            // tons orangés / rouges : la carrosserie
        const l = (mx + mn) / 2; px[i] = 42 * l * 2.1; px[i + 1] = 92 * l * 2.1; px[i + 2] = 179 * l * 2.1;
      }
    }
    g.putImageData(d, 0, 0); const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace; tx.flipY = m.map.flipY;
    tx.magFilter = m.map.magFilter; tx.minFilter = m.map.minFilter; m.map = tx; m.needsUpdate = true;
  });
  rbox(0.38, 1.25, 0.28, 9.85, 0.08, 4.1, M.white, scene, 0.08);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.018, 8, 32), glow(0x3a3f44)); ring.position.set(9.66, 1.05, 4.1); ring.rotation.y = Math.PI / 2; scene.add(ring);
  const stripes = canvasTex(128, 8, (g) => { g.fillStyle = '#26292c'; g.fillRect(0, 0, 128, 8); g.fillStyle = '#f7c600'; g.fillRect(0, 0, 28, 8); }, [6, 1]);
  const cableM = std(0xffffff, 0.5, { map: stripes, emissive: 0x000000, emissiveMap: stripes });
  const cable = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([[9.66, 0.95, 4.1], [9.3, 0.22, 4.5], [8.6, 0.2, 5.2], [8.0, 0.6, 5.9]].map((p) => new THREE.Vector3(...p))), 48, 0.035, 8), cableM);
  cable.castShadow = true; scene.add(cable);
  const bat = new THREE.Group(); bat.position.set(6.9, 2.55, 5.3); scene.add(bat);
  const batFrameM = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 });
  const batFrame = new THREE.Mesh(new THREE.PlaneGeometry(1.25, 0.46), batFrameM); bat.add(batFrame);
  const cells = [];
  for (let i = 0; i < 5; i++) { const c = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.32), new THREE.MeshBasicMaterial({ color: 0xdfe2dc, transparent: true, opacity: 0 })); c.position.set(-0.48 + i * 0.24, 0, 0.01); bat.add(c); cells.push(c); }
  act[7] = (a, t) => {
    cableM.emissive.setRGB(a * 1.2, a * 0.95, 0); stripes.offset.x = -t * 0.8;
    ring.material.emissive.setRGB(0, a * (0.6 + 0.4 * Math.sin(t * 3)), a * 0.3);
    batFrameM.opacity = 0.85 * a; bat.quaternion.copy(cam.quaternion);
    const fill = a > 0.05 ? ((t * 0.35) % 1.2) : 0;
    cells.forEach((c, i) => { c.material.opacity = a; c.material.color.set(fill * 5 > i + 0.2 ? 0x3bb36a : 0xdfe2dc); });
  };

  // 8. tertiaire : l'immeuble de bureaux voisin s'allume étage par étage
  const office = new THREE.Group(); scene.add(office);
  rbox(5.4, 7.6, 6.2, -11.6, 0.03, -6.6, M.wall, office, 0.06);
  rbox(5.6, 0.25, 6.4, -11.6, 7.6, -6.6, M.frame, office, 0.04);
  const offWins = [];
  for (let f = 0; f < 3; f++) for (let c = 0; c < 4; c++) {
    offWins.push({ f, m: rbox(1.0, 1.5, 0.05, -13.6 + c * 1.33, 0.6 + f * 2.4, -3.47, glow(0xb9c7d8), office, 0.02) });
    offWins.push({ f, m: rbox(0.05, 1.5, 1.15, -8.88, 0.6 + f * 2.4, -9.0 + c * 1.55, glow(0xb9c7d8), office, 0.02) });
  }
  rbox(1.6, 2.2, 0.06, -11.6, 0.03, -3.46, M.frame, office, 0.02);
  const offL = L(0xfff0cc, -9.5, 4, -3, 10);
  act[8] = (a) => {
    offWins.forEach(({ f, m }, i) => { const on = a * 3.2 > f + ((i * 7) % 5) / 10 + 0.2; m.material.color.set(on ? 0xffe9a8 : 0xb9c7d8); m.material.emissive.set(on ? 0xd6a632 : 0x000000); });
    offL.intensity = a * 6;
  };

  // éclairage du jardin, qui s'allume avec la nuit
  const bollards = [];
  [[-0.95, 6.0], [-0.95, 8.6], [0.75, 7.3], [9.9, 7.6], [3.9, 7.6]].forEach(([x, z]) => {
    rbox(0.12, 0.6, 0.12, x, 0.03, z, M.dark, scene, 0.03);
    const h = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.1, 12), glow(0xfff2d0)); h.position.set(x, 0.58, z); scene.add(h); bollards.push(h);
  });
  const gardenL = L(0xffd59a, 4, 2.2, 7.4, 9);
  // lumières des fenêtres de la maison la nuit
  const houseNight = L(0xffcf87, -2, 1.8, 0, 12);

  // ---------- fusion des géométries fixes (moins d'appels de dessin) ----------
  scene.updateMatrixWorld(true);
  const byMat = new Map();
  statics.forEach((m) => { if (!byMat.has(m.material)) byMat.set(m.material, []); byMat.get(m.material).push(m); });
  byMat.forEach((list, mat) => {
    if (list.length < 2) return;
    const geos = list.map((m) => { const g = (m.geometry.index ? m.geometry.toNonIndexed() : m.geometry.clone()); g.applyMatrix4(m.matrixWorld); return g; });
    const merged = mergeGeometries(geos, false); geos.forEach((g) => g.dispose());
    if (!merged) return;
    const one = new THREE.Mesh(merged, mat); one.castShadow = one.receiveShadow = true; scene.add(one);
    list.forEach((m) => { m.parent.remove(m); m.geometry.dispose(); });
  });

  // ---------- post-traitement (ordinateur seulement) : occlusion ambiante et halo des lumières ----------
  let composer = null, bloom = null, gtao = null;
  if (hiQ) {
    try {
      const [{ EffectComposer }, { RenderPass }, { GTAOPass }, { UnrealBloomPass }, { OutputPass }] = await Promise.all([
        import('three/addons/postprocessing/EffectComposer.js'), import('three/addons/postprocessing/RenderPass.js'),
        import('three/addons/postprocessing/GTAOPass.js'), import('three/addons/postprocessing/UnrealBloomPass.js'),
        import('three/addons/postprocessing/OutputPass.js')]);
      composer = new EffectComposer(renderer);
      composer.addPass(new RenderPass(scene, cam));
      gtao = new GTAOPass(scene, cam, 1, 1); gtao.blendIntensity = 0.85;
      gtao.updateGtaoMaterial({ radius: 0.6, distanceExponent: 1.4, thickness: 1.2, scale: 1, samples: 12 });
      composer.addPass(gtao);
      bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0, 0.55, 0.82); composer.addPass(bloom);
      composer.addPass(new OutputPass());
    } catch (e) { composer = null; }
  }

  // ---------- trajectoire de la caméra : une position par étape ----------
  const K = [
    { p: [24, 15, 27], t: [-1, 1.2, 0] },          // 0 la maison, toit en place
    { p: [0.5, 4.9, 1.6], t: [-0.2, 1.55, -4.8] },  // 1 tableau électrique
    { p: [-0.6, 8.2, 6.6], t: [-4.8, 0.8, -1.0] }, // 2 domotique, séjour
    { p: [-1.2, 5.4, 3.4], t: [3.7, 0.7, 2.2] },   // 3 chauffage, chambre
    { p: [5.5, 11.5, 6.5], t: [-2.2, 1.8, -3.4] },  // 4 VMC
    { p: [1.8, 7.6, 6.4], t: [-5.4, 1.3, -2.6] },  // 5 alarme
    { p: [12.5, 7.5, 22.5], t: [6.8, 1.0, 7.2] },  // 6 motorisation
    { p: [15.5, 5.2, 12.5], t: [8.0, 0.9, 4.8] },  // 7 borne
    { p: [0.5, 10.5, 13], t: [-11.0, 3.4, -6.0] },// 8 tertiaire
    { p: [22, 17, 25], t: [-1.2, 0.8, 0.4] },      // 9 vue d'ensemble, de nuit
  ].map((k) => ({ p: new THREE.Vector3(...k.p), t: new THREE.Vector3(...k.t) }));

  const pins = [...root.querySelectorAll('.vpin')];
  const PIN = { 1: [-0.2, 2.0, -4.6], 2: [-4.6, 2.2, 1.6], 3: [3.7, 1.3, 2.2], 4: [-0.2, 3.6, -3.2], 5: [-7.7, 2.9, -4.7], 6: [6.8, 3.2, 2.2], 7: [9.85, 1.8, 4.1], 8: [-11.6, 8.3, -6.6] };
  const breakers = [...root.querySelectorAll('.vrail__b')];
  breakers.forEach((b) => b.addEventListener('click', () => steps[+b.dataset.k].scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'center' })));

  // ---------- lecture du défilement ----------
  let f = 0, fs = 0;      // étape courante (continue) et sa version amortie
  function readScroll() {
    const r0 = steps[0].getBoundingClientRect(), rN = steps[N].getBoundingClientRect();
    const c0 = r0.top + r0.height / 2, cN = rN.top + rN.height / 2, mid = innerHeight / 2;
    f = THREE.MathUtils.clamp((mid - c0) / ((cN - c0) / N), 0, N);
  }
  const ease = (x) => x * x * x * (x * (x * 6 - 15) + 10);
  const camP = new THREE.Vector3(), camT = new THREE.Vector3(), goalP = new THREE.Vector3(), goalT = new THREE.Vector3(), tmp = new THREE.Vector3();
  function pathAt(x, outP, outT) {
    const i = Math.min(N - 1, Math.floor(x)), u = x - i;
    const e = calm ? (u > 0.5 ? 1 : 0) : ease(THREE.MathUtils.clamp((u - 0.12) / 0.62, 0, 1));   // déplacement, puis temps de lecture
    outP.lerpVectors(K[i].p, K[i + 1].p, e); outT.lerpVectors(K[i].t, K[i + 1].t, e);
    outP.y += Math.sin(Math.PI * e) * (calm ? 0 : 1.8);    // petit mouvement de grue entre deux pièces
    // écran vertical : on recule pour garder la pièce dans le cadre
    const a = cam.aspect; if (a < 1.2) { tmp.subVectors(outP, outT).multiplyScalar(1 + (1.2 - a) * 0.9); outP.copy(outT).add(tmp); }
  }

  // ---------- exploration libre à la dernière étape ----------
  const controls = new OrbitControls(cam, canvas);
  controls.enabled = false; controls.enableZoom = false; controls.enablePan = false; controls.enableDamping = true;
  controls.minPolarAngle = 0.35; controls.maxPolarAngle = 1.25; controls.rotateSpeed = 0.6;
  if (coarse) { controls.touches = { ONE: THREE.TOUCH.ROTATE, TWO: null }; }
  let free = false;

  function resize() {
    const w = stage.clientWidth, h = stage.clientHeight;
    cam.aspect = w / h; cam.fov = cam.aspect < 1 ? 42 : 30;
    // sur grand écran la fiche occupe la gauche : on décale l'image pour garder le sujet dans la partie libre
    if (w > 760) cam.setViewOffset(w, h, -Math.min(w * 0.17, 300), 0, w, h); else cam.clearViewOffset();
    cam.updateProjectionMatrix();
    renderer.setSize(w, h, false);
    if (composer) { composer.setSize(w, h); composer.setPixelRatio(dpr); }
  }
  new ResizeObserver(resize).observe(stage); resize();
  readScroll(); fs = f; pathAt(fs, camP, camT);

  // ---------- boucle ----------
  const clock = new THREE.Clock();
  let t = 0, visible = true, slow = 0, frames = 0, budgetChecked = false;
  const v = new THREE.Vector3();
  addEventListener('scroll', readScroll, { passive: true });
  addEventListener('resize', readScroll);
  rm.addEventListener('change', (e) => { calm = e.matches; });
  function frame() {
    const dt = Math.min(clock.getDelta(), 0.1); t += dt;
    // amortissement indépendant de la cadence d'images
    fs = calm ? f : fs + (f - fs) * (1 - Math.exp(-7 * dt));
    if (Math.abs(f - fs) < 0.0005) fs = f;
    const lvl = (k) => THREE.MathUtils.clamp((fs - (k - 0.55)) / 0.45, 0, 1);

    // toit et murs avant
    const r = THREE.MathUtils.clamp(fs / 0.7, 0, 1), re = ease(r);
    roof.position.y = re * 7; roof.visible = r < 0.999; M.roof.opacity = M.gable.opacity = 1 - THREE.MathUtils.clamp((r - 0.3) / 0.6, 0, 1);
    const w = ease(THREE.MathUtils.clamp((fs - 0.3) / 0.6, 0, 1));
    lowerable.forEach((g) => { g.scale.y = 1 - w * 0.62; });

    // jour -> crépuscule -> nuit
    const dusk = THREE.MathUtils.smoothstep(fs, 4.2, 6.2), blueH = THREE.MathUtils.smoothstep(fs, 6.0, 7.4), night = THREE.MathUtils.smoothstep(fs, 6.4, 8.6);
    scene.background.copy(SKY.day).lerp(SKY.dusk, dusk).lerp(SKY.blue, blueH).lerp(SKY.night, THREE.MathUtils.smoothstep(fs, 7.2, 8.8)); scene.fog.color.copy(scene.background);
    sun.color.setHSL(0.09 - dusk * 0.04, 0.4 + dusk * 0.5, 0.9 - dusk * 0.2);
    sun.intensity = 2.6 * (1 - night * 0.86) - dusk * 0.6; sun.position.set(14 - dusk * 20, 24 - dusk * 13 - night * 4, 12);
    hemi.intensity = 0.55 - night * 0.32; hemi.color.setHSL(0.6, night * 0.5, 0.85 - night * 0.5);
    scene.environmentIntensity = 0.6 - night * 0.45;
    renderer.toneMappingExposure = 1.0 + night * 0.15;
    bollards.forEach((b) => b.material.emissive.setRGB(2.2 * night, 1.8 * night, 1.0 * night)); gardenL.intensity = night * 10; houseNight.intensity = night * 14;
    if (bloom) bloom.strength = 0.15 + night * 0.65 + dusk * 0.1;

    // équipements : ils s'allument à leur étape et restent allumés ensuite
    for (let k = 1; k <= 8; k++) act[k](lvl(k), t, dt);

    // caméra
    if (fs > N - 0.25 && !calm) {
      if (!free) { free = true; controls.target.copy(camT); controls.enabled = true; root.classList.add('is-free'); }
    } else if (free) { free = false; controls.enabled = false; root.classList.remove('is-free'); }
    if (free) controls.update();
    else {
      pathAt(fs, goalP, goalT);
      camP.lerp(goalP, calm ? 1 : 1 - Math.exp(-9 * dt)); camT.lerp(goalT, calm ? 1 : 1 - Math.exp(-9 * dt));
      cam.position.copy(camP); cam.lookAt(camT);
    }

    // disjoncteurs de progression et points de la vue finale
    breakers.forEach((b, i) => b.classList.toggle('is-on', fs > i + 0.6));
    const showPins = fs > N - 0.35;
    root.classList.toggle('is-final', showPins);
    if (showPins) {
      const W = stage.clientWidth, Hh = stage.clientHeight;
      pins.forEach((p) => { const k = +p.dataset.k; v.set(...PIN[k]).project(cam); p.style.transform = `translate3d(${((v.x + 1) / 2 * W).toFixed(1)}px, ${((1 - v.y) / 2 * Hh).toFixed(1)}px, 0)`; });
    }

    if (composer) composer.render(dt); else renderer.render(scene, cam);

    // qualité adaptative : si l'appareil peine, on allège (occlusion, puis halo, puis résolution)
    frames++; if (dt > 1 / 40) slow++;
    if (!budgetChecked && frames === 90) {
      budgetChecked = true;
      if (slow > 30 && composer) { composer.passes.splice(composer.passes.indexOf(gtao), 1); }
      if (slow > 55) { composer = null; dpr = Math.min(dpr, 1.25); renderer.setPixelRatio(dpr); resize(); }
    }
  }
  new IntersectionObserver((es) => {
    visible = es[0].isIntersecting;
    clock.getDelta();
    renderer.setAnimationLoop(visible ? frame : null);
  }, { threshold: 0 }).observe(stage);
  root.classList.add('is-ready');
  window.__visite = { go: (x) => { f = fs = x; } };   // pour les vérifications automatiques
}
