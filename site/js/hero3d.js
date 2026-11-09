// PELTECH — casă 3D interactivă în hero (Three.js r160, găzduit local)
import * as THREE from './vendor/three.module.min.js';
import { OrbitControls } from './vendor/OrbitControls.js';

const box = document.getElementById('hero3d');
const hero = document.querySelector('.hero');
if (box) init();

function init() {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const touch = matchMedia('(hover: none)').matches;
  const mobile = innerWidth <= 900;

  box.classList.add('active');

  // ---------- renderer / scene / camera ----------
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.5 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = !mobile;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  box.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 200);
  camera.position.set(15.5, 8.4, 18);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(-0.4, 1.9, 0.4);
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.minPolarAngle = 0.95;
  controls.maxPolarAngle = 1.38;
  controls.autoRotate = !reduced;
  controls.autoRotateSpeed = 0.55;
  if (touch) controls.enableRotate = false; // nu blocăm scroll-ul pe telefon

  // ---------- materiale ----------
  const M = (o) => new THREE.MeshStandardMaterial(o);
  const wallMat = M({ color: 0xe8e3d9, roughness: 0.92 });
  const plinthMat = M({ color: 0x4a4744, roughness: 0.9 });
  const roofMat = M({ color: 0x2b2b2e, roughness: 0.75 });
  const trimMat = M({ color: 0x1c1c1e, roughness: 0.6 });
  const doorMat = M({ color: 0x5a3b26, roughness: 0.7 });
  const winMat = M({ color: 0x1b2433, roughness: 0.15, metalness: 0.3, emissive: 0xffb45c, emissiveIntensity: 0 });
  const frameMat = M({ color: 0xc9ccd1, roughness: 0.35, metalness: 0.8 });
  const groundMat = M({ color: 0x17161a, roughness: 1 });
  const lawnMat = M({ color: 0x1f2a1c, roughness: 1 });
  const pavMat = M({ color: 0x3a3836, roughness: 0.95 });
  const leafMat = M({ color: 0x2f4a2a, roughness: 0.9 });
  const trunkMat = M({ color: 0x4a3626, roughness: 0.9 });
  const devMat = M({ color: 0xf2f0eb, roughness: 0.5 });
  const greyMat = M({ color: 0x8a8d92, roughness: 0.5, metalness: 0.4 });
  const poleMat = M({ color: 0x6b6258, roughness: 0.9 });

  const shadow = (m, cast = true, recv = true) => { m.castShadow = cast; m.receiveShadow = recv; return m; };
  const mesh = (g, m, x = 0, y = 0, z = 0) => { const o = shadow(new THREE.Mesh(g, m)); o.position.set(x, y, z); return o; };

  // ---------- teren ----------
  const ground = mesh(new THREE.CircleGeometry(15, 64), groundMat);
  ground.rotation.x = -Math.PI / 2; ground.castShadow = false; scene.add(ground);
  const lawn = mesh(new THREE.CircleGeometry(8.5, 64), lawnMat);
  lawn.rotation.x = -Math.PI / 2; lawn.position.y = 0.005; lawn.castShadow = false; scene.add(lawn);
  const path = mesh(new THREE.PlaneGeometry(1.3, 6), pavMat, -0.9, 0.01, 5.2);
  path.rotation.x = -Math.PI / 2; path.castShadow = false; scene.add(path);
  const ring = new THREE.Mesh(new THREE.RingGeometry(8.45, 8.55, 96), new THREE.MeshBasicMaterial({ color: 0xf7931e, transparent: true, opacity: 0.35 }));
  ring.rotation.x = -Math.PI / 2; ring.position.y = 0.012; scene.add(ring);

  // ---------- casa ----------
  const W = 6, D = 4.5, H = 2.8;
  const house = new THREE.Group(); scene.add(house);
  house.add(mesh(new THREE.BoxGeometry(W + 0.12, 0.35, D + 0.12), plinthMat, 0, 0.175, 0));
  house.add(mesh(new THREE.BoxGeometry(W, H - 0.35, D), wallMat, 0, 0.35 + (H - 0.35) / 2, 0));

  // acoperiș în două ape (coamă pe axa X)
  const ov = 0.35, rise = 1.9, half = D / 2 + ov;
  const shp = new THREE.Shape();
  shp.moveTo(-half, 0); shp.lineTo(half, 0); shp.lineTo(0, rise); shp.closePath();
  const roofGeo = new THREE.ExtrudeGeometry(shp, { depth: W + 2 * ov, bevelEnabled: false });
  roofGeo.rotateY(-Math.PI / 2); roofGeo.translate((W + 2 * ov) / 2, 0, 0);
  const roof = mesh(roofGeo, roofMat, 0, H, 0); house.add(roof);
  // streașină
  house.add(mesh(new THREE.BoxGeometry(W + 2 * ov, 0.08, 0.12), trimMat, 0, H + 0.02, half));
  house.add(mesh(new THREE.BoxGeometry(W + 2 * ov, 0.08, 0.12), trimMat, 0, H + 0.02, -half));
  // coș
  house.add(mesh(new THREE.BoxGeometry(0.45, 1.1, 0.45), plinthMat, -1.8, H + rise - 0.1, -0.7));

  // uși și ferestre
  const fz = D / 2 + 0.03;
  house.add(mesh(new THREE.BoxGeometry(0.95, 2.05, 0.08), doorMat, -0.9, 0.35 + 1.02, fz));
  const windows = [];
  const addWin = (x, y, z, w, h, rotY = 0) => {
    const g = new THREE.Group();
    g.add(mesh(new THREE.BoxGeometry(w + 0.12, h + 0.12, 0.06), trimMat));
    const pane = mesh(new THREE.BoxGeometry(w, h, 0.08), winMat.clone()); g.add(pane);
    g.add(mesh(new THREE.BoxGeometry(0.04, h, 0.1), trimMat));
    g.position.set(x, y, z); g.rotation.y = rotY; house.add(g); windows.push(pane.material);
  };
  addWin(1.35, 1.65, fz, 1.6, 1.25);
  addWin(-2.25, 1.65, fz, 0.9, 1.25);
  addWin(-W / 2 - 0.03, 1.65, 0.6, 1.1, 1.1, Math.PI / 2);
  addWin(W / 2 + 0.03, 1.75, -1.1, 0.9, 1.0, Math.PI / 2);
  addWin(0.6, 1.65, -fz, 1.6, 1.2);

  // ---------- panouri fotovoltaice pe apa din față ----------
  const cellTex = (() => {
    const c = document.createElement('canvas'); c.width = 128; c.height = 208;
    const x = c.getContext('2d');
    const gr = x.createLinearGradient(0, 0, 128, 208); gr.addColorStop(0, '#13233b'); gr.addColorStop(1, '#0a1424');
    x.fillStyle = gr; x.fillRect(0, 0, 128, 208);
    x.strokeStyle = 'rgba(120,150,190,0.35)'; x.lineWidth = 1.2;
    for (let i = 1; i < 6; i++) { x.beginPath(); x.moveTo(i * 128 / 6, 0); x.lineTo(i * 128 / 6, 208); x.stroke(); }
    for (let j = 1; j < 10; j++) { x.beginPath(); x.moveTo(0, j * 208 / 10); x.lineTo(128, j * 208 / 10); x.stroke(); }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
  })();
  const panelMat = M({ map: cellTex, roughness: 0.22, metalness: 0.55, emissive: 0x0a1a33, emissiveIntensity: 0 });
  const slope = Math.atan2(rise, half);
  const slopeLen = Math.hypot(rise, half);
  const arr = new THREE.Group();
  arr.position.set(0.25, H + rise / 2, half / 2);
  arr.rotation.x = slope;
  house.add(arr);
  const cols = 5, rows = 2, pw = 1.02, pd = 1.32;
  const panels = [];
  for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
    const g = new THREE.Group();
    g.add(mesh(new THREE.BoxGeometry(pw + 0.05, 0.05, pd + 0.05), frameMat));
    const p = mesh(new THREE.BoxGeometry(pw, 0.06, pd), panelMat); g.add(p);
    g.position.set((i - (cols - 1) / 2) * (pw + 0.07), 0.09, (j - (rows - 1) / 2) * (pd + 0.07) - 0.05);
    arr.add(g); panels.push(g);
  }
  void slopeLen;

  // ---------- invertor + baterie pe peretele din dreapta ----------
  const sx = W / 2;
  const inv = mesh(new THREE.BoxGeometry(0.16, 0.62, 0.5), devMat, sx + 0.08, 2.05, 1.0); house.add(inv);
  house.add(mesh(new THREE.BoxGeometry(0.02, 0.08, 0.3), new THREE.MeshBasicMaterial({ color: 0x2b2b2e }), sx + 0.17, 2.18, 1.0));
  const bat = mesh(new THREE.BoxGeometry(0.24, 1.25, 0.62), devMat, sx + 0.12, 0.98, 1.0); house.add(bat);
  const ledMats = [];
  for (let k = 0; k < 5; k++) {
    const m = new THREE.MeshBasicMaterial({ color: 0xf7931e, transparent: true, opacity: 0.15 });
    const led = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.07, 0.36), m);
    led.position.set(sx + 0.25, 0.6 + k * 0.17, 1.0); house.add(led); ledMats.push(m);
  }
  // contor/tablou pe fațadă
  house.add(mesh(new THREE.BoxGeometry(0.5, 0.65, 0.12), greyMat, 2.55, 1.45, fz + 0.03));

  // ---------- stâlp rețea + cablu ----------
  const poleP = new THREE.Vector3(6.4, 0, 3.2);
  scene.add(mesh(new THREE.CylinderGeometry(0.09, 0.13, 5.2, 10), poleMat, poleP.x, 2.6, poleP.z));
  scene.add(mesh(new THREE.BoxGeometry(1.1, 0.08, 0.08), poleMat, poleP.x, 4.9, poleP.z));
  const wireTop = new THREE.Vector3(poleP.x - 0.45, 4.95, poleP.z);
  const wireHouse = new THREE.Vector3(sx + 0.05, 2.7, 1.7);
  const wireMid = wireTop.clone().lerp(wireHouse, 0.5); wireMid.y -= 0.55;
  const wireCurve = new THREE.CatmullRomCurve3([wireHouse, wireMid, wireTop]);
  scene.add(new THREE.Mesh(new THREE.TubeGeometry(wireCurve, 40, 0.018, 6), trimMat));

  // ---------- copaci ----------
  const tree = (x, z, s) => {
    const g = new THREE.Group();
    g.add(mesh(new THREE.CylinderGeometry(0.09 * s, 0.13 * s, 1.2 * s, 8), trunkMat, 0, 0.6 * s, 0));
    g.add(mesh(new THREE.IcosahedronGeometry(0.85 * s, 1), leafMat, 0, 1.6 * s, 0));
    g.add(mesh(new THREE.IcosahedronGeometry(0.6 * s, 1), leafMat, 0.35 * s, 2.15 * s, 0.1 * s));
    g.position.set(x, 0, z); scene.add(g);
  };
  tree(-5.3, -1.5, 1.25); tree(-4.6, 3.4, 0.9); tree(4.8, -3.6, 1.05);

  // ---------- lumini ----------
  const hemi = new THREE.HemisphereLight(0xfff2e0, 0x2a2118, 0.6); scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff1d6, 2.4);
  sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, { left: -10, right: 10, top: 10, bottom: -10, near: 1, far: 50 });
  sun.shadow.bias = -0.0005; sun.shadow.normalBias = 0.02;
  scene.add(sun); scene.add(sun.target); sun.target.position.set(0, 1, 0);
  const porch = new THREE.PointLight(0xffb45c, 0, 6, 1.6); porch.position.set(-0.9, 2.7, fz + 0.6); scene.add(porch);

  // soare + lună vizuale
  const glowTex = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const x = c.getContext('2d'); const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.35, 'rgba(255,255,255,0.55)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = g; x.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c);
  })();
  const sunVis = new THREE.Group();
  sunVis.add(new THREE.Mesh(new THREE.SphereGeometry(0.55, 24, 16), new THREE.MeshBasicMaterial({ color: 0xffdca8 })));
  const sunGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffb35c, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  sunGlow.scale.set(4.5, 4.5, 1); sunVis.add(sunGlow); scene.add(sunVis);
  const moonVis = new THREE.Group();
  moonVis.add(new THREE.Mesh(new THREE.SphereGeometry(0.32, 20, 14), new THREE.MeshBasicMaterial({ color: 0xdfe6ff })));
  const moonGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0x8fa6ff, transparent: true, opacity: 0.5, depthWrite: false, blending: THREE.AdditiveBlending }));
  moonGlow.scale.set(2.2, 2.2, 1); moonVis.add(moonGlow); scene.add(moonVis);

  // ---------- fluxuri de energie (particule) ----------
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const flows = {
    solar: new THREE.CatmullRomCurve3([V(1.4, H + 1.25, 1.35), V(2.9, H + 0.35, half - 0.1), V(sx + 0.3, H - 0.1, 1.6), V(sx + 0.3, 2.05, 1.0), V(sx + 0.3, 1.25, 1.0)]),
    home: new THREE.CatmullRomCurve3([V(sx + 0.3, 0.9, 1.35), V(sx + 0.2, 1.1, fz + 0.25), V(2.55, 1.3, fz + 0.2), V(1.4, 1.5, fz + 0.15)]),
    grid: new THREE.CatmullRomCurve3([V(sx + 0.3, 2.3, 1.1), wireHouse.clone().add(V(0.1, 0, 0)), wireMid, wireTop]),
  };
  const flowState = { solar: 0, home: 0, grid: 0, gridDir: 1 };
  const N = mobile ? 7 : 10;
  const particles = [];
  const pMat = new THREE.SpriteMaterial({ map: glowTex, color: 0xffa53a, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  Object.keys(flows).forEach((k) => {
    for (let i = 0; i < N; i++) {
      const s = new THREE.Sprite(pMat.clone()); s.scale.set(0.32, 0.32, 1);
      scene.add(s); particles.push({ s, k, off: i / N });
    }
  });

  // ---------- HUD ----------
  const hud = document.createElement('div');
  hud.className = 'hero-3d-hud';
  hud.innerHTML = '<div class="h3-status"><span class="h3-ico">☀</span><span class="h3-txt"></span></div>'
    + '<div class="h3-bat"><span>Baterie</span><div class="h3-bar"><i></i></div><b>0%</b></div>'
    + (touch ? '' : '<div class="h3-hint">↔ Trage pentru a roti casa</div>');
  box.appendChild(hud);
  const hIco = hud.querySelector('.h3-ico'), hTxt = hud.querySelector('.h3-txt');
  const hBar = hud.querySelector('.h3-bar i'), hPct = hud.querySelector('.h3-bat b');
  let lastMsg = '';

  // ---------- ciclu zi / noapte ----------
  const PERIOD = 18, DAY = 0.62;
  const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const cSunHigh = new THREE.Color(0xfff1d6), cSunLow = new THREE.Color(0xff9a4a);
  let scrollOff = 0;
  addEventListener('scroll', () => { scrollOff = scrollY / 1400; }, { passive: true });

  function update(time) {
    const cyc = reduced ? 0.32 : ((time / PERIOD + scrollOff) % 1 + 1) % 1;
    const isDay = cyc < DAY;
    const d = isDay ? cyc / DAY : 0;
    const n = isDay ? 0 : (cyc - DAY) / (1 - DAY);
    const elev = Math.sin(Math.PI * d);

    // soare
    const R = 22;
    const sp = V(Math.cos(Math.PI * d) * R, 1.5 + elev * 14, 12);
    sun.position.copy(sp).multiplyScalar(0.55);
    sunVis.position.copy(sp); sunVis.visible = isDay && elev > 0.02;
    sun.intensity = isDay ? 0.3 + 2.3 * Math.pow(elev, 0.7) : 0.55;
    sun.color.copy(isDay ? cSunLow.clone().lerp(cSunHigh, Math.min(1, elev * 1.6)) : new THREE.Color(0x9fb2ff));
    if (!isDay) sun.position.set(-8, 12, 8);
    moonVis.visible = !isDay;
    moonVis.position.set(-Math.cos(Math.PI * n) * R, 2 + Math.sin(Math.PI * n) * 11, 12);

    const dusk = isDay ? 1 - smooth(0, 0.18, Math.min(d, 1 - d)) : 1;
    hemi.intensity = isDay ? 0.3 + 0.45 * elev : 0.32;
    hemi.color.set(isDay ? 0xfff2e0 : 0x6b7ca8);
    windows.forEach((m) => { m.emissiveIntensity = dusk * 1.6; });
    porch.intensity = dusk * 3;
    panelMat.emissiveIntensity = isDay ? elev * 0.35 : 0;

    // baterie
    let charge;
    if (isDay) charge = 0.15 + 0.85 * smooth(0.08, 0.72, d);
    else charge = 1 - 0.85 * smooth(0, 0.92, n);
    const lit = Math.round(charge * 5);
    ledMats.forEach((m, i) => { m.opacity = i < lit ? 1 : 0.12; });

    // fluxuri
    const prod = isDay ? Math.max(0, elev - 0.08) : 0;
    flowState.solar = prod > 0 ? 1 : 0;
    flowState.home = 1;
    const exporting = isDay && charge > 0.97 && prod > 0.3;
    const importing = !isDay && charge < 0.2;
    flowState.grid = exporting || importing ? 1 : 0;
    flowState.gridDir = exporting ? 1 : -1;

    particles.forEach((p) => {
      const on = flowState[p.k];
      p.s.visible = on > 0;
      if (!p.s.visible) return;
      let u = ((reduced ? 0 : time * 0.38) + p.off) % 1;
      if (p.k === 'grid' && flowState.gridDir < 0) u = 1 - u;
      p.s.position.copy(flows[p.k].getPointAt(u));
      const fade = Math.sin(Math.PI * u);
      p.s.material.opacity = 0.25 + 0.75 * fade;
    });

    // HUD
    let ico, msg;
    if (isDay && prod > 0) {
      ico = '☀';
      msg = exporting ? 'Zi — bateria e plină, surplusul merge în rețea' : 'Zi — panourile alimentează casa și încarcă bateria';
    } else if (importing) { ico = '🌙'; msg = 'Noapte — bateria e aproape goală, casa ia energie din rețea'; }
    else { ico = '🌙'; msg = 'Seară — bateria alimentează casa'; }
    if (msg !== lastMsg) { hIco.textContent = ico; hTxt.textContent = msg; lastMsg = msg; }
    hBar.style.width = Math.round(charge * 100) + '%';
    hPct.textContent = Math.round(charge * 100) + '%';
  }

  // ---------- resize / vizibilitate / buclă ----------
  function resize() {
    const w = box.clientWidth, h = box.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const asp = w / h, small = innerWidth <= 900;
    camera.fov = small ? 29 : 32;
    controls.target.set(small ? 0.4 : -0.4, small ? 1.4 : 1.9, 0.4);
    // pe containere înguste, camera se depărtează ca toată casa să încapă
    const dist = 25.2 * (small ? 1 : Math.max(1, 1.12 / asp));
    const dir = camera.position.clone().sub(controls.target).normalize();
    camera.position.copy(controls.target).addScaledVector(dir, dist);
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(box); resize();

  let visible = true;
  new IntersectionObserver((e) => { visible = e[0].isIntersecting; if (visible) loop(); }, { threshold: 0 }).observe(box);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) loop(); });

  const clock = new THREE.Clock();
  let running = false, shown = false;
  function frame() {
    if (!visible || document.hidden) { running = false; return; }
    const t = clock.getElapsedTime();
    controls.update();
    update(t);
    renderer.render(scene, camera);
    if (!shown) { shown = true; box.classList.add('shown'); hero && hero.classList.add('has-3d'); }
    if (reduced && !controls.autoRotate) { running = false; return; }
    requestAnimationFrame(frame);
  }
  function loop() { if (!running) { running = true; requestAnimationFrame(frame); } }
  if (reduced) controls.addEventListener('change', () => { controls.update(); renderer.render(scene, camera); });
  loop();
}
