'use strict';
/* ═══════════ запуск: нова гра, завантаження, повернення в меню, керування ═══════════ */
const randSeed = () => (Math.random() * 4294967295) >>> 0;
/* запуск іде етапами з паузами, щоб екран завантаження встигав показувати прогрес */
function startGame(slot, cls, data) {
  SFX.init(); G.state = 'loading'; UI.loading(0.06, 'Розчищаємо попіл');
  const steps = [['Зводимо місто й дороги', () => launchA(data)], ['Саджаємо ліс, розкидаємо каміння', () => launchB()], ['Будимо мертвих', () => launchC(slot, cls, data)]];
  let k = 0;
  const fail = e => {
    console.error(e); $('loading').hidden = true;
    try { launchA(null); launchB(); MenuFX.build(); } catch (e2) { console.error(e2); }
    G.state = 'menu'; UI.menu('main'); UI.menuMsg('Не вдалося запустити гру: ' + e.message);
  };
  const next = () => {
    if (k >= steps.length) { $('loading').hidden = true; return; }
    UI.loading((k + 1) / (steps.length + 1), steps[k][0]);
    setTimeout(() => {
      try { steps[k][1](); } catch (e) { fail(e); return; }
      k++; if (k >= steps.length) { UI.loading(1, 'Готово'); setTimeout(next, 180); } else next();
    }, 170);
  };
  next();
}
function launch(slot, cls, data) { launchA(data); launchB(); launchC(slot, cls, data); }
function launchA(data) {
  MenuFX.stop(); clearZombies(); clearFX(); buildCancel(); wake(); if (P && P.h) CH.root.remove(P.h.g); P = null;
  disposeWorld(G.scene); genWorld(data ? data.seed : randSeed()); if (data) Save.apply(data);
}
function launchB() { buildWorldMeshes(G.scene); resetBase(); }
function launchC(slot, cls, data) {
  G.time = data ? data.time : 8; G.day = data ? data.day : 1; G.endless = !!(data && data.endless); G.abs = (G.day - 1) * 24 + G.time; G.t = 0; G.spawnT = 4; G.paused = false;
  newPlayer(data ? CLASSES.find(c => c.id === data.p.cls) || CLASSES[0] : cls, data ? data.p : null);
  if (data) Save.applyLate(data);
  collide(P, 0.3);
  Cam.x = P.x; Cam.z = P.z; Cam.yaw = Math.PI / 4; Cam.dist = 26; Cam.pitch = 0.84; Input.aimX = P.x; Input.aimZ = P.z + 1; Input.down = false;
  computeFlow(P.x, P.z); populate(); resetExtras();
  if (data) Quest.load(data.q); else Quest.reset(!Settings.d.tut);
  Save.slot = slot; Save.t = 45; Save.ok = true;
  UI.sig = {}; UI.closeAll(); UI.open.pause = false;
  for (const id of ['menu', 'death', 'win', 'pause', 'sleep']) $(id).hidden = true;
  $('hud').hidden = false; $('clsname').textContent = P.cls.n;
  G.state = 'play'; Settings.apply();
  if (data) UI.notify(`Гру завантажено: день ${G.day}.`, 'good');
  else { UI.notify('Ти отямився в таборі. Спершу освойся, потім шукай спосіб вибратися.'); UI.notify('Місцевість цього світу: ' + World.biome.n + '.', 'good'); Save.write(); }
}
function toMenu() {
  if (G.state === 'play' && P && !P.dead) Save.write();
  G.state = 'menu'; clearZombies(); clearFX(); buildCancel(); wake(); if (P && P.h) CH.root.remove(P.h.g); P = null;
  G.flash.visible = false; G.aim.visible = false; G.beacon.visible = false; G.hl.visible = false;
  UI.closeAll(); UI.open.pause = false; G.paused = false;
  for (const id of ['death', 'win', 'pause', 'hud', 'sleep']) $(id).hidden = true;
  UI.menu('main'); MenuFX.build();
}
function boot() {
  Settings.load();
  const canvas = $('game'); let r;
  try { r = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' }); }
  catch (e) { $('loading').hidden = true; UI.init(); UI.menu('main'); UI.menuMsg('Браузер не зміг запустити WebGL — гра потребує 3D-прискорення.'); return; }
  G.renderer = r; r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap; r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.05;
  G.scene = new THREE.Scene(); G.camera = new THREE.PerspectiveCamera(40, 1, 1, 400); G.clock = new THREE.Clock();
  initShared(r); initChars(); initEnv(G.scene);
  CH.root = new THREE.Group(); G.scene.add(CH.root); initFX(G.scene); makeIcons(r); makeBuildIcons(r); Weather.init(G.scene);
  G.flash = new THREE.SpotLight(0xfff0d0, 260, 28, 0.5, 0.6, 1.5); G.flash.castShadow = true; G.flash.shadow.mapSize.set(1024, 1024); G.flash.shadow.camera.near = 0.4; G.flash.shadow.camera.far = 30; G.flash.shadow.bias = -0.003; G.flash.visible = false; G.scene.add(G.flash, G.flash.target);
  G.aim = new THREE.Mesh(GEO.box, new THREE.MeshBasicMaterial({ color: 0xff4030, transparent: true, opacity: 0.3, depthWrite: false })); G.aim.visible = false; G.scene.add(G.aim);
  G.beacon = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 18, 10, 1, true), new THREE.MeshBasicMaterial({ color: 0xffd24a, transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })); G.beacon.visible = false; G.scene.add(G.beacon);
  G.hl = new THREE.Mesh(new THREE.OctahedronGeometry(0.17), new THREE.MeshBasicMaterial({ color: 0xffd24a })); G.hl.visible = false; G.scene.add(G.hl);
  UI.init(); MenuFX.init(); genWorld(randSeed()); buildWorldMeshes(G.scene); resetBase(); resize(); Settings.apply(); addEventListener('resize', resize);
  // прогріваємо шейдери обох станів ліхтарика, щоб перше ввімкнення не давало ривка
  Cam.x = World.camp.x; Cam.z = World.camp.z; placeCamera(0); updateEnv(18.4, Cam.x, Cam.z, 34);
  G.flash.visible = true; r.compile(G.scene, G.camera); G.flash.visible = false; r.compile(G.scene, G.camera);
  addEventListener('keydown', e => {
    if (['Tab', 'Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code) && G.state === 'play') e.preventDefault();
    if (e.repeat) return; Input.keys[e.code] = true;
    if (G.state !== 'play') return;
    if (Base.sleeping) { if (['KeyE', 'Space', 'KeyW', 'KeyA', 'KeyS', 'KeyD', 'Escape'].includes(e.code)) wake('Ти прокинувся.'); return; }
    if (e.code === 'Escape') { if (Base.sel) buildCancel(); else if (UI.anyPanel()) UI.closeAll(); else UI.togglePause(); return; }
    if (UI.open.pause) return;
    switch (e.code) {
      case 'Tab': case 'KeyI': UI.toggleInv(); break;
      case 'KeyP': UI.toggleChar(); break;
      case 'KeyM': UI.toggleMap(); break;
      case 'KeyB': if (!G.paused) UI.toggleBuild(); break;
      case 'KeyE': if (!G.paused) interact(); break;
      case 'KeyR': if (!G.paused) startReload(); break;
      case 'KeyF': P.flashlight = !P.flashlight; SFX.empty(); break;
      case 'KeyC': P.sneak = !P.sneak; break;
      case 'KeyH': if (!G.paused) quickHeal(); break;
      case 'Digit1': switchWeapon('w1'); break;
      case 'Digit2': switchWeapon('w2'); break;
      case 'KeyQ': switchWeapon(P.active === 'w1' ? 'w2' : 'w1'); break;
      case 'Space': if (!G.paused) shove(); break;
      case 'KeyV': if (!G.paused) dodge(); break;
      case 'KeyG': if (!G.paused) quickEat(); break;
    }
  });
  addEventListener('keyup', e => { Input.keys[e.code] = false; });
  addEventListener('blur', () => { Input.keys = {}; Input.down = false; Input.rdown = false; });
  document.addEventListener('visibilitychange', () => { if (document.hidden && G.state === 'play') Save.write(); });
  canvas.addEventListener('mousedown', e => {
    SFX.init(); if (G.state !== 'play') return;
    if (e.button === 0) { if (Base.sel) tryPlace(); else { Input.down = true; Input.fresh = true; } }
    else if (e.button === 2) { if (Base.sel) buildCancel(); Input.rdown = true; }
  });
  addEventListener('mouseup', e => { if (e.button === 0) Input.down = false; else if (e.button === 2) Input.rdown = false; });
  addEventListener('mousemove', e => {
    if (Input.rdown && G.state === 'play') { Cam.yaw -= e.movementX * 0.006; Cam.pitch = clamp(Cam.pitch + e.movementY * 0.004, 0.55, 1.25); }
    Input.mx = e.clientX; Input.my = e.clientY;
  });
  canvas.addEventListener('contextmenu', e => e.preventDefault());
  canvas.addEventListener('wheel', e => { e.preventDefault(); if (G.state === 'play') Cam.dist = clamp(Cam.dist + Math.sign(e.deltaY) * 2.5, 13, 40); }, { passive: false });
  $('loading').hidden = true; UI.menu('main'); MenuFX.build(); frame();
}
boot();
