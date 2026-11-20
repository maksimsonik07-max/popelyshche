'use strict';
/* ═══════════ персонажі: гравець, зомбі, бій, ефекти ═══════════ */
let P = null;
const Zs = [];
const CH = { root: null };
const ICON = {};

/* ───────── моделі зброї: [ш, в, д, x, y, z, колір], довжина вздовж +Z ───────── */
const WM = {
  knife: [[.035, .035, .12, 0, 0, 0, 0x222222], [.012, .045, .2, 0, 0, .16, 0xcfd4d8]],
  pan: [[.03, .03, .26, 0, 0, .06, 0x1c1c1c], [.26, .04, .26, 0, 0, .32, 0x33363a], [.22, .02, .22, 0, .025, .32, 0x1f2124]],
  hammer: [[.03, .03, .34, 0, 0, .1, 0x8a6a48], [.05, .13, .06, 0, 0, .28, 0x8a9096]],
  baton: [[.04, .04, .56, 0, 0, .2, 0x1a1a1c], [.03, .1, .03, 0, -.05, .06, 0x1a1a1c]],
  bat: [[.045, .045, .3, 0, 0, .06, 0x5a4028], [.075, .075, .5, 0, 0, .46, 0xa9824f]],
  spikedbat: [[.045, .045, .3, 0, 0, .06, 0x5a4028], [.075, .075, .5, 0, 0, .46, 0x8f6a3c], [.15, .015, .015, 0, 0, .42, 0xc8ccd0], [.015, .15, .015, 0, 0, .5, 0xc8ccd0], [.15, .015, .015, 0, 0, .58, 0xc8ccd0], [.015, .15, .015, 0, 0, .66, 0xc8ccd0]],
  crowbar: [[.03, .03, .76, 0, 0, .3, 0x2c3c5a], [.03, .1, .03, 0, .04, .67, 0x2c3c5a]],
  machete: [[.035, .04, .14, 0, 0, 0, 0x1a1a1a], [.012, .075, .5, 0, .01, .32, 0xbfc5ca]],
  spear: [[.03, .03, 1.5, 0, 0, .5, 0x8a6a48], [.012, .05, .24, 0, 0, 1.36, 0xcfd4d8], [.045, .045, .08, 0, 0, 1.22, 0x9a9a9a]],
  axe: [[.035, .035, .82, 0, 0, .3, 0x9a7a4a], [.02, .2, .14, 0, .09, .64, 0xb8281e], [.012, .22, .04, 0, .21, .64, 0xd0d4d8]],
  sledge: [[.04, .04, .96, 0, 0, .38, 0x8a6a48], [.14, .2, .14, 0, 0, .84, 0x3a3d42]],
  katana: [[.03, .04, .24, 0, 0, .02, 0x15151a], [.075, .075, .015, 0, 0, .15, 0xc9a23a], [.01, .035, .8, 0, 0, .56, 0xe6eaee]],
  pistol: [[.035, .05, .2, 0, .03, .07, 0x2a2c30], [.03, .1, .045, 0, -.04, 0, 0x1c1d20]],
  smg: [[.045, .07, .34, 0, .03, .12, 0x2a2c30], [.03, .16, .04, 0, -.08, .14, 0x1c1d20], [.03, .04, .16, 0, .03, -.12, 0x1c1d20], [.02, .02, .1, 0, .04, .34, 0x15161a], [.03, .09, .04, 0, -.04, 0, 0x1c1d20]],
  shotgun: [[.035, .035, .7, 0, .04, .36, 0x25272a], [.05, .05, .2, 0, 0, .4, 0x7a5a38], [.04, .075, .28, 0, -.01, -.12, 0x7a5a38], [.045, .07, .2, 0, .03, .08, 0x2f3236]],
  ar: [[.045, .08, .4, 0, .03, .12, 0x2a2c30], [.022, .022, .34, 0, .04, .5, 0x1a1b1e], [.03, .18, .06, 0, -.1, .18, 0x5a3a22], [.04, .07, .26, 0, .02, -.2, 0x6a4a2a], [.05, .05, .2, 0, .03, .38, 0x6a4a2a], [.03, .09, .04, 0, -.05, 0, 0x1c1d20]],
  rifle: [[.025, .025, .82, 0, .04, .44, 0x25272a], [.045, .07, .52, 0, 0, 0, 0x7a5a38], [.035, .035, .26, 0, .1, .2, 0x15161a], [.04, .08, .2, 0, -.02, -.3, 0x7a5a38]],
};
function weaponModel(id) {
  const g = new THREE.Group(), ps = WM[id]; if (!ps) return g;
  for (const p of ps) { const m = part(g, p[0], p[1], p[2], p[3], p[4], p[5], LM(p[6])); m.receiveShadow = false; }
  return g;
}
function makeIcons(renderer) {
  const sc = new THREE.Scene(); sc.add(new THREE.HemisphereLight(0xffffff, 0x8a8a8a, 4.5));
  const dl = new THREE.DirectionalLight(0xffffff, 5); dl.position.set(-3, 3, 1); sc.add(dl);
  const ex = renderer.toneMappingExposure; renderer.toneMappingExposure = 1.7;
  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 20); cam.position.set(-6, 0, 0); cam.lookAt(0, 0, 0);
  const size = 96, prev = renderer.getSize(new THREE.Vector2()), pr = renderer.getPixelRatio();
  renderer.setPixelRatio(1); renderer.setSize(size, size, false); renderer.setClearColor(0x2c322b, 1);
  const cv = document.createElement('canvas'); cv.width = cv.height = size; const ctx = cv.getContext('2d'), box = new THREE.Box3(), c = new THREE.Vector3(), sz = new THREE.Vector3();
  for (const id in WM) {
    const m = weaponModel(id), holder = new THREE.Group(); box.setFromObject(m); box.getCenter(c); box.getSize(sz);
    m.position.sub(c); holder.add(m); holder.rotation.x = -0.62; sc.add(holder);
    const h = Math.max(sz.z * 0.5, sz.y * 0.9, 0.14); cam.left = -h; cam.right = h; cam.top = h; cam.bottom = -h; cam.updateProjectionMatrix();
    renderer.render(sc, cam); ctx.clearRect(0, 0, size, size); ctx.drawImage(renderer.domElement, 0, 0, size, size); ICON[id] = cv.toDataURL();
    sc.remove(holder);
  }
  renderer.setPixelRatio(pr); renderer.setSize(prev.x, prev.y, false); renderer.toneMappingExposure = ex;
}

/* ───────── гуманоїди ───────── */
function initChars() {
  const near = t => { t.magFilter = THREE.NearestFilter; return t; };
  const face = (skin, o) => near(ctex(32, g => {
    g.fillStyle = skin; g.fillRect(0, 0, 32, 32);
    g.fillStyle = o.socket || '#1c1512'; g.fillRect(5, 10, 8, 6); g.fillRect(19, 10, 8, 6);
    g.fillStyle = o.eye || '#d9d5a8'; g.fillRect(8, 12, 3, 3); g.fillRect(22, 12, 3, 3);
    g.fillStyle = '#35100c'; g.fillRect(8, 21, 16, o.mouth || 5);
    g.fillStyle = '#d6cfbc'; for (let i = 0; i < 4; i++) g.fillRect(9 + i * 4, 21, 2, 2);
    g.fillStyle = 'rgba(110,12,10,.9)'; g.fillRect(10, 26, 5, 6); g.fillRect(20, 24, 3, 8); g.fillRect(2 + ((o.seed || 0) * 7) % 20, 2, 6, 4);
  }, true));
  const skins = [['#8a9a78', 0x8a9a78], ['#9aa3a0', 0x9aa3a0], ['#7d8466', 0x7d8466], ['#a79b84', 0xa79b84]];
  const heads = (css, hex, o) => { const s = LM(hex), f = new THREE.MeshLambertMaterial({ map: face(css, o) }); if (o.glow) { f.emissive = new THREE.Color(o.glow); f.emissiveMap = f.map; f.emissiveIntensity = 0.9; } return [s, s, s, s, f, s]; };
  CH.skin = skins.map(s => LM(s[1]));
  CH.heads = skins.map((s, i) => heads(s[0], s[1], { seed: i }));
  CH.headRunner = heads('#a08a80', 0xa08a80, { eye: '#ff5a3a', mouth: 7, seed: 2 });
  CH.headBrute = heads('#6f7a66', 0x6f7a66, { eye: '#e8d060', mouth: 6, seed: 1 });
  CH.headSpit = heads('#7f9a5a', 0x7f9a5a, { eye: '#c8ff5a', socket: '#20300f', mouth: 8, glow: 0x9aff40, seed: 3 });
  CH.headScream = heads('#c9c9c4', 0xc9c9c4, { eye: '#101010', socket: '#3a2a2a', mouth: 10, seed: 2 });
  CH.headBoss = heads('#5a4a48', 0x5a4a48, { eye: '#ff2a1a', socket: '#1a0808', mouth: 8, glow: 0xff3a20, seed: 1 });
  const shirtTex = [0, 1, 2].map(() => near(ctex(32, g => {
    g.fillStyle = '#fff'; g.fillRect(0, 0, 32, 32);
    for (let i = 0; i < 5; i++) { g.fillStyle = `rgba(${90 + rndi(0, 40)},8,8,${rnd(0.6, 0.95)})`; g.fillRect(rndi(0, 26), rndi(0, 26), rndi(3, 10), rndi(3, 12)); }
    g.fillStyle = 'rgba(0,0,0,.28)'; for (let i = 0; i < 6; i++) g.fillRect(rndi(0, 30), rndi(0, 30), rndi(1, 3), rndi(2, 8));
  }, true)));
  CH.shirts = [];
  for (const c of [0x6a7a8a, 0x8a6a5a, 0x7a8a6a, 0xa8a49a, 0x5a5a7a, 0x8a8456, 0x7a4a4a, 0x4a6a6a]) for (const t of shirtTex) CH.shirts.push(new THREE.MeshLambertMaterial({ color: c, map: t }));
  CH.pants = [0x3a4252, 0x4a4438, 0x2e3030, 0x54504a, 0x3a3a52].map(LM);
  CH.hair = [0x2a2018, 0x4a3a28, 0x15120f, 0x6a6a66, 0x5a3a20].map(LM);
  CH.flash = new THREE.MeshBasicMaterial({ color: 0xffffff });
  CH.barBg = new THREE.MeshBasicMaterial({ color: 0x0a0a0a }); CH.barFg = new THREE.MeshBasicMaterial({ color: 0xc8261c });
  CH.pface = new THREE.MeshLambertMaterial({ map: near(ctex(32, g => {
    g.fillStyle = '#d9a982'; g.fillRect(0, 0, 32, 32); g.fillStyle = '#fff'; g.fillRect(6, 12, 7, 4); g.fillRect(19, 12, 7, 4);
    g.fillStyle = '#2a1c12'; g.fillRect(9, 12, 3, 4); g.fillRect(21, 12, 3, 4); g.fillStyle = '#3a2a1c'; g.fillRect(5, 8, 8, 2); g.fillRect(19, 8, 8, 2);
    g.fillStyle = '#8a4a3a'; g.fillRect(11, 23, 10, 2); g.fillStyle = 'rgba(110,75,50,.45)'; g.fillRect(7, 26, 18, 6);
  }, true)) });
}
function buildHumanoid(o) {
  const g = new THREE.Group(); g.rotation.order = 'YXZ';
  const body = new THREE.Group(); g.add(body);
  const bw = o.bulk || 1, ms = [];
  const P_ = (par, w, h, d, x, y, z, mat) => { const m = part(par, w, h, d, x, y, z, mat); ms.push(m); return m; };
  P_(body, 0.44 * bw, 0.2, 0.26, 0, 0.88, 0, o.pants);
  P_(body, 0.5 * bw, 0.58, 0.28 * (o.belly || 1), 0, 1.25, 0, o.shirt);
  const head = new THREE.Group(); head.position.set(0, 1.54, 0); body.add(head);
  const hs = o.headScale || 1, hm = new THREE.Mesh(GEO.box, o.headMats); hm.scale.set(0.34 * hs, 0.34 * hs, 0.34 * hs); hm.position.y = 0.19 * hs; hm.castShadow = true; head.add(hm); ms.push(hm);
  if (o.hair) P_(head, 0.36 * hs, 0.12, 0.37 * hs, 0, 0.37 * hs, -0.01, o.hair);
  const arm = sx => {
    const a = new THREE.Group(); a.position.set(sx * (0.25 * bw + 0.09), 1.49, 0); body.add(a);
    const th = o.armThick || 1;
    if (o.sleeve) { P_(a, 0.15 * th, 0.36, 0.16 * th, 0, -0.16, 0, o.sleeve); P_(a, 0.13 * th, 0.3, 0.14 * th, 0, -0.48, 0, o.skin); }
    else P_(a, 0.14 * th, 0.64, 0.15 * th, 0, -0.3, 0, o.skin);
    return a;
  };
  const leg = sx => {
    const l = new THREE.Group(); l.position.set(sx * 0.12 * bw, 0.8, 0); body.add(l);
    P_(l, 0.19 * (o.legThick || 1), o.shoes ? 0.72 : 0.8, 0.2 * (o.legThick || 1), 0, o.shoes ? -0.36 : -0.4, 0, o.pants);
    if (o.shoes) P_(l, 0.2, 0.1, 0.28, 0, -0.75, 0.03, o.shoes);
    return l;
  };
  const armL = arm(1), armR = arm(-1), legL = leg(1), legR = leg(-1);
  for (const m of ms) m.userData.mat = m.material;
  return { g, body, head, armL, armR, legL, legR, ms, P_ };
}
function flashOn(h) { for (const m of h.ms) m.material = CH.flash; }
function flashOff(h) { for (const m of h.ms) m.material = m.userData.mat; }

/* ───────── ефекти ───────── */
const FX = { root: null, N: 520, pm: null, px: null, pv: null, pl: null, ps: null, pg: null, pi: 0, decals: null, di: 0, tracers: [], flash: null, flashM: null, puddles: [], projs: [], rings: [], _m: null, _q: null, _s: null, _v: null, _c: null, _e: null };
function initFX(scene) {
  FX.root = new THREE.Group(); scene.add(FX.root);
  FX._m = new THREE.Matrix4(); FX._q = new THREE.Quaternion(); FX._s = new THREE.Vector3(); FX._v = new THREE.Vector3(); FX._c = new THREE.Color(); FX._e = new THREE.Euler();
  const N = FX.N; FX.px = new Float32Array(N * 3); FX.pv = new Float32Array(N * 3); FX.pl = new Float32Array(N); FX.ps = new Float32Array(N); FX.pg = new Float32Array(N);
  FX.pm = new THREE.InstancedMesh(GEO.box, new THREE.MeshLambertMaterial(), N); FX.pm.frustumCulled = false;
  FX._m.makeScale(0, 0, 0); for (let i = 0; i < N; i++) { FX.pm.setMatrixAt(i, FX._m); FX.pm.setColorAt(i, FX._c.set(0xffffff)); }
  FX.root.add(FX.pm);
  const bt = ctex(64, g => { g.clearRect(0, 0, 64, 64); g.fillStyle = '#fff'; for (let i = 0; i < 9; i++) { g.globalAlpha = rnd(0.5, 1); g.beginPath(); g.arc(32 + rnd(-12, 12), 32 + rnd(-12, 12), rnd(5, 15), 0, 7); g.fill(); } }, true);
  FX.decals = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), new THREE.MeshLambertMaterial({ map: bt, color: 0x6a0a0a, transparent: true, opacity: 0.85, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3 }), 180);
  FX.decals.frustumCulled = false; for (let i = 0; i < 180; i++) FX.decals.setMatrixAt(i, FX._m); FX.root.add(FX.decals);
  const tm = new THREE.MeshBasicMaterial({ color: 0xffe08a, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false });
  for (let i = 0; i < 20; i++) { const m = new THREE.Mesh(GEO.box, tm); m.visible = false; FX.root.add(m); FX.tracers.push({ m, life: 0 }); }
  FX.flash = new THREE.PointLight(0xffc060, 0, 14, 1.2); FX.root.add(FX.flash);
  FX.flashM = new THREE.Mesh(GEO.box, new THREE.MeshBasicMaterial({ color: 0xffe9a0 })); FX.flashM.visible = false; FX.root.add(FX.flashM);
  FX.puddleMat = new THREE.MeshBasicMaterial({ color: 0x7fd43a, transparent: true, opacity: 0.55, depthWrite: false });
  FX.puddleGeo = new THREE.CircleGeometry(1, 14).rotateX(-Math.PI / 2);
  FX.ringGeo = new THREE.RingGeometry(0.85, 1, 28).rotateX(-Math.PI / 2);
  FX.spitMat = new THREE.MeshBasicMaterial({ color: 0x9aff40 });
}
function clearFX() {
  for (const a of [FX.puddles, FX.projs, FX.rings]) { for (const o of a) FX.root.remove(o.m); a.length = 0; }
  FX._m.makeScale(0, 0, 0); for (let i = 0; i < 180; i++) FX.decals.setMatrixAt(i, FX._m); FX.decals.instanceMatrix.needsUpdate = true; FX.pl.fill(0);
  for (let i = 0; i < FX.N; i++) FX.pm.setMatrixAt(i, FX._m); FX.pm.instanceMatrix.needsUpdate = true;
}
function spawnParts(n, x, y, z, vx, vy, vz, spread, color, life, size, grav) {
  for (let k = 0; k < n; k++) {
    const i = FX.pi = (FX.pi + 1) % FX.N, j = i * 3;
    FX.px[j] = x; FX.px[j + 1] = y; FX.px[j + 2] = z;
    FX.pv[j] = vx + rnd(-spread, spread); FX.pv[j + 1] = vy + rnd(-spread * 0.5, spread); FX.pv[j + 2] = vz + rnd(-spread, spread);
    FX.pl[i] = life * rnd(0.6, 1.2); FX.ps[i] = size * rnd(0.6, 1.4); FX.pg[i] = grav === undefined ? 14 : grav;
    FX.pm.setColorAt(i, FX._c.set(color));
  }
  FX.pm.instanceColor.needsUpdate = true;
}
function bloodFX(x, y, z, dx, dz, n, color) { spawnParts(n, x, y, z, dx * 2.5, 1.8, dz * 2.5, 2.2, color || 0x8a0c0c, 0.8, 0.075); }
function addDecal(x, z, s) {
  const i = FX.di = (FX.di + 1) % 180; FX._q.setFromEuler(FX._e.set(0, rnd(6.28), 0));
  FX._m.compose(FX._v.set(x, 0.022, z), FX._q, FX._s.set(s, 1, s)); FX.decals.setMatrixAt(i, FX._m); FX.decals.instanceMatrix.needsUpdate = true;
}
function tracer(x0, z0, x1, z1) {
  const t = FX.tracers.find(t => t.life <= 0) || FX.tracers[0], dx = x1 - x0, dz = z1 - z0, l = Math.hypot(dx, dz);
  t.m.position.set((x0 + x1) / 2, 1.35, (z0 + z1) / 2); t.m.scale.set(0.035, 0.035, l); t.m.rotation.y = Math.atan2(dx, dz); t.m.visible = true; t.life = 0.07;
}
function muzzleFlash(x, y, z, rot) {
  FX.flash.position.set(x, y + 0.3, z); FX.flash.intensity = 30;
  FX.flashM.position.set(x, y, z); FX.flashM.rotation.set(0, rot, rnd(3)); FX.flashM.scale.set(0.22, 0.22, 0.5); FX.flashM.visible = true; FX.flashT = 0.045;
}
function ringFX(x, z, r, color, life) {
  const m = new THREE.Mesh(FX.ringGeo, new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.8, depthWrite: false, side: THREE.DoubleSide }));
  m.position.set(x, 0.08, z); FX.root.add(m); FX.rings.push({ m, r, t: 0, life: life || 0.7 });
}
function updateFX(dt) {
  const M = FX._m, Q = FX._q, S = FX._s, V = FX._v; Q.identity(); let any = false;
  for (let i = 0; i < FX.N; i++) {
    if (FX.pl[i] <= 0) continue; any = true; const j = i * 3;
    FX.pl[i] -= dt;
    if (FX.pl[i] <= 0) { M.makeScale(0, 0, 0); FX.pm.setMatrixAt(i, M); continue; }
    FX.pv[j + 1] -= FX.pg[i] * dt;
    FX.px[j] += FX.pv[j] * dt; FX.px[j + 1] += FX.pv[j + 1] * dt; FX.px[j + 2] += FX.pv[j + 2] * dt;
    if (FX.px[j + 1] < 0.03) { FX.px[j + 1] = 0.03; FX.pv[j] = FX.pv[j + 1] = FX.pv[j + 2] = 0; }
    const s = FX.ps[i] * Math.min(1, FX.pl[i] * 4);
    M.compose(V.set(FX.px[j], FX.px[j + 1], FX.px[j + 2]), Q, S.set(s, s, s)); FX.pm.setMatrixAt(i, M);
  }
  if (any) FX.pm.instanceMatrix.needsUpdate = true;
  for (const t of FX.tracers) if (t.life > 0) { t.life -= dt; if (t.life <= 0) t.m.visible = false; }
  if (FX.flash.intensity > 0) FX.flash.intensity = Math.max(0, FX.flash.intensity - dt * 500);
  if (FX.flashT > 0) { FX.flashT -= dt; if (FX.flashT <= 0) FX.flashM.visible = false; }
  for (let i = FX.rings.length - 1; i >= 0; i--) {
    const r = FX.rings[i]; r.t += dt; const k = r.t / r.life, s = r.r * k; r.m.scale.set(s, 1, s); r.m.material.opacity = 0.8 * (1 - k);
    if (k >= 1) { FX.root.remove(r.m); r.m.material.dispose(); FX.rings.splice(i, 1); }
  }
  for (let i = FX.projs.length - 1; i >= 0; i--) {
    const p = FX.projs[i]; p.vy -= 14 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt; p.m.position.set(p.x, p.y, p.z);
    if (chance(0.5)) spawnParts(1, p.x, p.y, p.z, 0, 0, 0, 0.4, 0x7fd43a, 0.3, 0.05);
    const hitP = !P.dead && p.y < 1.9 && dist2(p.x, p.z, P.x, P.z) < 0.3, wall = inMap(p.x | 0, p.z | 0) && T.opaque[idx(p.x | 0, p.z | 0)];
    if (p.y <= 0.1 || hitP || wall) {
      spawnParts(12, p.x, Math.max(0.2, p.y), p.z, 0, 2, 0, 2.2, 0x7fd43a, 0.6, 0.07);
      if (hitP || (!P.dead && dist2(p.x, p.z, P.x, P.z) < 1.3)) damagePlayer(p.dmg, null, 'Плювач');
      if (!wall) { const m = new THREE.Mesh(FX.puddleGeo, FX.puddleMat); m.position.set(p.x, 0.03, p.z); m.scale.set(1.3, 1, 1.3); FX.root.add(m); FX.puddles.push({ m, x: p.x, z: p.z, r: 1.3, life: 4.5, tick: 0 }); }
      SFX.splat(Math.hypot(p.x - P.x, p.z - P.z)); FX.root.remove(p.m); FX.projs.splice(i, 1);
    }
  }
  for (let i = FX.puddles.length - 1; i >= 0; i--) {
    const p = FX.puddles[i]; p.life -= dt; p.tick -= dt; const s = p.r * Math.min(1, p.life); p.m.scale.set(s, 1, s);
    if (!P.dead && p.tick <= 0 && dist2(p.x, p.z, P.x, P.z) < p.r * p.r) { p.tick = 0.5; damagePlayer(3, null, 'Кислота'); }
    if (p.life <= 0) { FX.root.remove(p.m); FX.puddles.splice(i, 1); }
  }
}
function dist2(ax, az, bx, bz) { const dx = ax - bx, dz = az - bz; return dx * dx + dz * dz; }

/* ───────── гравець: показники ───────── */
const perk = id => P.perks[id] || 0;
const maxHP = () => 90 + P.attrs.end * 10;
const maxStam = () => (90 + P.attrs.end * 6 + P.attrs.agi * 3) * (1 + P.skills.fit.l * 0.03);
const carryCap = () => 16 + P.attrs.str * 2 + perk('mule') * 6 + (P.eq.pack ? ITEMS[P.eq.pack.id].cap : 0);
const armorVal = () => P.eq.armor ? ITEMS[P.eq.armor.id].arm : 0;
const xpNeed = l => Math.floor(100 + (l - 1) * 90 + Math.pow(l - 1, 1.8) * 18);
const skillNeed = l => Math.floor(100 * Math.pow(l + 1, 1.6) * Math.pow(1.15, l));
const isGear = id => { const t = ITEMS[id].t; return t === 'melee' || t === 'gun' || t === 'armor' || t === 'pack'; };
const activeWeapon = () => P.eq[P.active];
function maxDur(w) { return Math.round((ITEMS[w.id].dur || 0) * (w.af === 'sturdy' ? 2 : 1) * (1 + (w.r || 0) * 0.1)); }
function magSize(w) { return Math.round(ITEMS[w.id].mag * (w.af === 'sturdy' ? 1.3 : 1)); }
function wStats(w) {
  const d = w ? ITEMS[w.id] : FISTS, r = w ? RARITY[w.r || 0].mult : 1, af = w ? w.af : null, a = P.attrs, s = P.skills;
  if (d.t === 'gun') return {
    gun: true, d, dmg: d.dmg * r * (1 + a.per * 0.04 + s.guns.l * 0.03) * (af === 'heavy' ? 1.1 : 1), rate: d.rate / (af === 'light' ? 1.15 : 1),
    reload: d.reload * (1 - 0.2 * perk('fasthands')), spread: d.spread * Math.max(0.25, 1 - a.per * 0.04 - s.guns.l * 0.05 - perk('steady') * 0.12),
    crit: d.crit + a.per * 0.01 + a.lck * 0.01 + perk('headhunter') * 0.05 + (af === 'sharp' ? 0.1 : 0), mag: magSize(w), pierce: d.pierce + perk('piercing'),
    kb: d.kb * (af === 'heavy' ? 1.3 : 1), range: d.range, noise: d.noise,
  };
  return {
    gun: false, d, dmg: d.dmg * r * (1 + a.str * 0.06 + s.melee.l * 0.04 + perk('butcher') * 0.1) * (af === 'heavy' ? 1.1 : 1),
    spd: d.spd / ((1 + a.agi * 0.03) * (af === 'light' ? 1.15 : 1)), stam: d.stam * (1 - s.fit.l * 0.03), range: d.range, arc: d.arc,
    crit: d.crit + s.melee.l * 0.01 + a.lck * 0.01 + (af === 'sharp' ? 0.1 : 0), kb: d.kb * (af === 'heavy' ? 1.3 : 1) * (1 + a.str * 0.03),
    targets: d.targets + perk('sweep'), maxDur: w ? maxDur(w) : 0,
  };
}
function rollRarity() { const l = P ? P.attrs.lck : 1, k = 1 + l * 0.07 + ((G.day || 1) - 1) * 0.06; return wpick([[0, 62], [1, 24 * k], [2, 10 * k], [3, 3.2 * k], [4, 0.7 * k]])[0]; }
function mkItem(id, qty, opt) {
  const d = ITEMS[id], it = { id, qty: qty || 1 }; opt = opt || {};
  if (d.t === 'melee' || d.t === 'gun') {
    it.qty = 1; it.r = opt.r !== undefined ? opt.r : rollRarity();
    it.af = opt.af !== undefined ? opt.af : (it.r >= 2 || (it.r === 1 && chance(0.3)) ? pick(Object.keys(AFFIX)) : null);
    if (d.t === 'melee') it.dur = opt.dur !== undefined ? opt.dur : Math.round(maxDur(it) * (opt.r !== undefined ? 1 : rnd(0.45, 1)));
    else it.ammo = opt.ammo !== undefined ? opt.ammo : rndi(0, magSize(it));
  }
  return it;
}
function genLoot(kind, c) {
  const def = CONT[kind], out = []; let n = rndi(def.rolls[0], def.rolls[1]);
  if (chance(0.12 * perk('scavenger') + 0.04 * P.skills.scav.l + P.attrs.lck * 0.012)) n++;
  for (let k = 0; k < n; k++) {
    const e = wpick(def.loot), it = mkItem(e[0], rndi(e[2] || 1, e[3] || e[2] || 1)), ex = !isGear(it.id) && out.find(o => o.id === it.id);
    if (ex) ex.qty += it.qty; else out.push(it);
  }
  if (c && c.quest) out.unshift(mkItem(c.quest, 1));
  return out;
}
/* інвентар */
function invAdd(it) { if (!isGear(it.id)) { const e = P.inv.find(x => x.id === it.id); if (e) { e.qty += it.qty; return; } } P.inv.push(it); }
function invCount(id) { let n = 0; for (const it of P.inv) if (it.id === id) n += it.qty; return n; }
function invRemove(id, qty) { for (let i = P.inv.length - 1; i >= 0 && qty > 0; i--) { const it = P.inv[i]; if (it.id !== id) continue; const t = Math.min(qty, it.qty); it.qty -= t; qty -= t; if (it.qty <= 0) P.inv.splice(i, 1); } }
function totalWeight() { let w = 0; for (const it of P.inv) w += ITEMS[it.id].w * it.qty; for (const k in P.eq) if (P.eq[k]) w += ITEMS[P.eq[k].id].w; return w; }
function equipWeapon(it) {
  const i = P.inv.indexOf(it); if (i < 0) return; P.inv.splice(i, 1);
  const slot = !P.eq[P.active] ? P.active : !P.eq.w1 ? 'w1' : !P.eq.w2 ? 'w2' : P.active;
  if (P.eq[slot]) P.inv.push(P.eq[slot]);
  P.eq[slot] = it; P.active = slot; P.reloading = null; P.swing = null; refreshWeaponMesh();
}
function unequip(slot) { const it = P.eq[slot]; if (!it) return; P.eq[slot] = null; P.inv.push(it); P.reloading = null; refreshWeaponMesh(); }
function switchWeapon(slot) { if (P.active === slot || P.swing) return; P.active = slot; P.reloading = null; refreshWeaponMesh(); SFX.equip(); const w = activeWeapon(); UI.floatText(P.x, 2.4, P.z, w ? ITEMS[w.id].n : FISTS.n, 'res'); }
function heal(n) { const v = n * (1 + P.skills.med.l * 0.08 + perk('medic') * 0.25); P.hp = Math.min(maxHP(), P.hp + v); UI.floatText(P.x, 2.1, P.z, '+' + Math.round(v), 'heal'); }
function useItem(it) {
  const d = ITEMS[it.id];
  if (d.t === 'melee' || d.t === 'gun') { equipWeapon(it); SFX.equip(); return true; }
  if (d.t === 'armor' || d.t === 'pack') { P.inv.splice(P.inv.indexOf(it), 1); if (P.eq[d.t]) P.inv.push(P.eq[d.t]); P.eq[d.t] = it; refreshWeaponMesh(); SFX.equip(); return true; }
  if (d.t === 'food') {
    if (d.heal) heal(d.heal); Quest.ev('food'); if (d.hunger) P.hunger = clamp(P.hunger + d.hunger, 0, 100); if (d.thirst) P.thirst = clamp(P.thirst + d.thirst, 0, 100);
    if (d.stam) P.stam = Math.min(maxStam(), P.stam + d.stam); if (d.buff) P.buffs[d.buff[0]] = d.buff[1];
    SFX.eat(); invRemove(it.id, 1); return true;
  }
  if (d.t === 'med') {
    if (d.cure) { if (!P.infected) { UI.notify('Ти не заражений — прибережи антибіотики.'); return false; } P.infected = false; P.infection = 0; UI.notify('Інфекцію зупинено.', 'good'); }
    else if (!d.buff && !d.stam && P.hp >= maxHP() - 0.5 && !(d.bleed && P.bleed > 0)) { UI.notify('Лікувати нічого.'); return false; }
    if (d.hp) heal(d.hp); if (d.bleed && P.bleed > 0) { P.bleed = 0; UI.notify('Кровотечу зупинено.', 'good'); }
    if (d.stam) P.stam = Math.min(maxStam(), P.stam + d.stam); if (d.buff) P.buffs[d.buff[0]] = d.buff[1];
    skillXP('med', 8); SFX.eat(); invRemove(it.id, 1); return true;
  }
  if (d.t === 'tool') {
    const w = activeWeapon();
    if (!w || ITEMS[w.id].t !== 'melee' || w.dur >= maxDur(w)) { UI.notify('Візьми в руки зношену зброю ближнього бою.'); return false; }
    w.dur = Math.min(maxDur(w), Math.round(w.dur + maxDur(w) * (0.6 + P.skills.craft.l * 0.04)));
    skillXP('craft', 10); SFX.equip(); UI.notify('Зброю полагоджено.', 'good'); invRemove(it.id, 1); return true;
  }
  return false;
}
function quickHeal() {
  const order = P.bleed > 0 ? ['bandage', 'medkit'] : (maxHP() - P.hp > 45 ? ['medkit', 'painkillers', 'bandage'] : ['bandage', 'painkillers', 'medkit']);
  for (const id of order) { const it = P.inv.find(x => x.id === id); if (it) { useItem(it); return; } }
  UI.notify('Немає чим лікуватися.', 'bad');
}
function addXP(n) {
  if (P.dead) return; P.xp += n; let up = false;
  while (P.level < 30 && P.xp >= xpNeed(P.level)) { P.xp -= xpNeed(P.level); P.level++; P.attrPts += 2; P.perkPts += 1; up = true; }
  if (up) {
    P.hp = Math.min(maxHP(), P.hp + maxHP() * 0.3); SFX.level(); UI.notify(`Рівень ${P.level}! +2 очки атрибутів і перк — натисни P`, 'lvl');
    ringFX(P.x, P.z, 3.5, 0xffd24a, 0.8); spawnParts(26, P.x, 1.2, P.z, 0, 4, 0, 2.5, 0xffd24a, 0.9, 0.07, 5);
  }
}
function skillXP(k, n) {
  const s = P.skills[k]; if (s.l >= 10) return; s.xp += n;
  while (s.l < 10 && s.xp >= skillNeed(s.l)) { s.xp -= skillNeed(s.l); s.l++; UI.notify(`Навичка «${SKILLS[k].n}» зросла до ${s.l}`, 'good'); addXP(10); }
}

/* ───────── гравець: створення й оновлення ───────── */
function newPlayer(cls, sv) {
  P = {
    cls, x: World.spawn.x, z: World.spawn.z, rot: 0, vx: 0, vz: 0, kx: 0, kz: 0, hp: 0, stam: 0, hunger: 68, thirst: 70, level: 1, xp: 0, attrPts: 0, perkPts: 0,
    attrs: { str: 1, agi: 1, end: 1, per: 1, lck: 1 }, skills: {}, perks: {}, inv: [], eq: { w1: null, w2: null, armor: null, pack: null }, active: 'w1',
    bleed: 0, infected: false, infection: 0, buffs: {}, dead: false, deadT: 0, swing: null, reloading: null, atkCd: 0, gunCd: 0, clickCd: 0, recoil: 0, kick: 0,
    shoveCd: 0, shoveT: 0, stamDelay: 0, regenDelay: 0, hurtT: 0, slowT: 0, swCd: 0, speedBoost: 0, exhausted: false, sneak: false, sprinting: false, moving: false,
    flashlight: false, craft: null, gatherT: 0, phase: 0, kills: 0, looted: 0, noiseT: 0, fitAcc: 0, h: null, wmesh: null, pack: null,
  };
  for (const k in SKILLS) P.skills[k] = { l: 0, xp: 0 };
  for (const k in cls.attrs) P.attrs[k] += cls.attrs[k];
  for (const k in cls.skills) P.skills[k].l = cls.skills[k];
  for (const e of cls.items) {
    const it = mkItem(e[0], e[1], e[2]), t = ITEMS[e[0]].t;
    if ((t === 'melee' || t === 'gun') && !P.eq.w1) P.eq.w1 = it; else if ((t === 'melee' || t === 'gun') && !P.eq.w2) P.eq.w2 = it; else invAdd(it);
  }
  P.hp = maxHP(); P.stam = maxStam(); if (sv) for (const k of SAVE_P) if (sv[k] !== undefined) P[k] = sv[k];
  const skin = LM(0xd9a982), hair = LM(cls.hair);
  P.h = buildHumanoid({ skin, shirt: LM(cls.shirt), sleeve: LM(cls.shirt), pants: LM(cls.pants), headMats: [skin, skin, hair, skin, CH.pface, hair], hair, shoes: LM(0x1a1a1a) });
  P.pack = part(P.h.body, 0.36, 0.44, 0.17, 0, 1.25, -0.22, LM(0x5a5040));
  P.h.g.position.set(P.x, 0, P.z); CH.root.add(P.h.g);
  refreshWeaponMesh();
}
function refreshWeaponMesh() {
  if (P.wmesh) { P.h.armR.remove(P.wmesh); P.wmesh = null; }
  P.pack.visible = !!P.eq.pack;
  const w = activeWeapon(); if (!w) return;
  const m = weaponModel(w.id); m.position.set(0, -0.62, 0.03); if (ITEMS[w.id].t === 'gun') m.rotation.x = Math.PI / 2;
  P.h.armR.add(m); P.wmesh = m;
}
function makeNoise(x, z, r) {
  const r2 = r * r * (1 - 0.3 * Weather.rain);
  for (const zb of Zs) { if (zb.dead || zb.alert > 3) continue; if (dist2(x, z, zb.x, zb.z) < r2) { if (zb.alert <= 0) onAlert(zb, true); zb.alert = Math.max(zb.alert, 6 + Math.random() * 4); zb.lkx = x; zb.lkz = z; } }
}
function startReload() {
  const w = activeWeapon(); if (!w || P.reloading || ITEMS[w.id].t !== 'gun') return;
  const st = wStats(w); if (w.ammo >= st.mag) return;
  if (invCount(st.d.ammo) <= 0) { UI.notify('Немає набоїв: ' + ITEMS[st.d.ammo].n, 'bad'); return; }
  P.reloading = { t: 0, dur: st.reload }; SFX.reload();
}
const _hits = [];
function tryAttack() {
  if (P.dead || P.swing || P.shoveT > 0) return;
  const w = activeWeapon(), st = wStats(w);
  if (st.gun) { fireGun(w, st); return; }
  if (P.atkCd > 0) return;
  if (P.stam < st.stam * 0.5) { if (P.clickCd <= 0) { P.clickCd = 0.8; UI.notify('Ти видихся — переведи подих.', 'bad'); } return; }
  P.stam = Math.max(0, P.stam - st.stam); P.stamDelay = 0.7;
  P.swing = { t: 0, dur: st.spd, hit: false, w, st }; P.atkCd = st.spd + 0.04; SFX.swing();
}
function meleeHit(sw) {
  const st = sw.st, w = sw.w, range = st.range + 0.25, half = st.arc * Math.PI / 360, fx = Math.sin(P.rot), fz = Math.cos(P.rot);
  _hits.length = 0;
  for (const z of Zs) {
    if (z.dead) continue; const dx = z.x - P.x, dz = z.z - P.z, d = Math.hypot(dx, dz);
    if (d > range + z.def.rad) continue;
    if (Math.abs(angDiff(Math.atan2(dx, dz), P.rot)) > half + (d < 1 ? 0.7 : 0.1)) continue;
    if (!hasLOS(P.x, P.z, z.x, z.z, 0)) continue;
    _hits.push([d, z]);
  }
  _hits.sort((a, b) => a[0] - b[0]);
  const n = Math.min(_hits.length, st.targets); let worked = false; if (n === 0) { const nd = nodeInFront(st.range, half); if (nd) worked = hitNode(nd, w, fx, fz); }
  for (let i = 0; i < n; i++) {
    const z = _hits[i][1]; let dmg = st.dmg * rnd(0.88, 1.12); const crit = chance(st.crit);
    if (z.down > 0 || z.stun > 0.25) dmg *= perk('executioner') ? 2 : 1.3;
    if (crit) dmg *= 2;
    dealDamage(z, dmg, { crit, kb: st.kb, dx: fx, dz: fz, melee: true });
  }
  if (n > 0) {
    SFX.hit(); camShake(0.1 + st.kb * 0.03); skillXP('melee', 3 + n); }
  if (n > 0 || worked) {
    if (w) { if (chance(1 - 0.3 * perk('tinkerer'))) w.dur -= 1; if (w.dur <= 0) { P.eq[P.active] = null; refreshWeaponMesh(); UI.notify(ITEMS[w.id].n + ' — зламано!', 'bad'); SFX.breakW(); } }
  }
  makeNoise(P.x, P.z, n > 0 ? 6 : 3);
}
function fireGun(w, st) {
  const d = st.d;
  if (P.gunCd > 0 || P.reloading) return;
  if (w.ammo <= 0) { if (P.clickCd <= 0) { SFX.empty(); P.clickCd = 0.4; startReload(); } return; }
  w.ammo--; P.gunCd = st.rate;
  const base = Math.atan2(Input.aimX - P.x, Input.aimZ - P.z), sprd = st.spread * Math.PI / 180 * (1 + P.recoil * 2) * (P.moving ? 1.3 : 1) * (P.sneak ? 0.8 : 1);
  const ox = P.x + Math.sin(base) * 0.75, oz = P.z + Math.cos(base) * 0.75; let hitAny = false;
  for (let p = 0; p < d.pellets; p++) {
    const a = base + (Math.random() + Math.random() - 1) * sprd, dx = Math.sin(a), dz = Math.cos(a), wallD = rayGrid(P.x, P.z, dx, dz, st.range, 0);
    _hits.length = 0;
    for (const z of Zs) {
      if (z.dead) continue; const rx = z.x - P.x, rz = z.z - P.z, t = rx * dx + rz * dz;
      if (t < 0.2 || t > wallD) continue;
      if (Math.abs(rx * dz - rz * dx) < z.def.rad + 0.12) _hits.push([t, z]);
    }
    _hits.sort((a, b) => a[0] - b[0]);
    let end = wallD; const n = Math.min(_hits.length, st.pierce + 1);
    for (let i = 0; i < n; i++) {
      const t = _hits[i][0], z = _hits[i][1], crit = chance(st.crit);
      let dmg = st.dmg * rnd(0.9, 1.1) * (t > st.range * 0.6 ? lerp(1, 0.5, (t - st.range * 0.6) / (st.range * 0.4)) : 1) * Math.pow(0.8, i);
      if (crit) dmg *= 2.2;
      dealDamage(z, dmg, { crit, kb: st.kb, dx, dz }); hitAny = true;
      if (i === n - 1 && n === st.pierce + 1) end = t;
    }
    tracer(ox, oz, P.x + dx * end, P.z + dz * end);
    if (end === wallD && wallD < st.range) spawnParts(4, P.x + dx * (end - 0.1), 1.3, P.z + dz * (end - 0.1), -dx * 2, 1.5, -dz * 2, 1.5, 0xffd68a, 0.3, 0.04);
  }
  P.recoil = Math.min(1, P.recoil + d.recoil); P.kick = 1;
  if (!d.silent) muzzleFlash(ox, 1.38, oz, base); SFX.shot(w.id); camShake(d.recoil * 0.45 + 0.04); makeNoise(P.x, P.z, st.noise);
  if (!d.silent) spawnParts(1, P.x, 1.35, P.z, Math.cos(base) * 2, 2.5, -Math.sin(base) * 2, 0.6, 0xc9a23a, 1.2, 0.045);
  if (hitAny) skillXP('guns', 3);
}
function shove() {
  if (P.dead || P.shoveCd > 0 || P.swing) return;
  if (P.stam < 8) { UI.notify('Бракує сил.', 'bad'); return; }
  P.stam -= 10; P.stamDelay = 0.6; P.shoveCd = 0.75; P.shoveT = 0.22; SFX.swing();
  const fx = Math.sin(P.rot), fz = Math.cos(P.rot); let n = 0;
  for (const z of Zs) {
    if (z.dead || z.down > 0) continue; const dx = z.x - P.x, dz = z.z - P.z, d = Math.hypot(dx, dz);
    if (d > 1.75 + z.def.rad || Math.abs(angDiff(Math.atan2(dx, dz), P.rot)) > 1.15) continue;
    const res = z.def.stagRes || 0, k = (4.5 + P.attrs.str * 0.35) * (1 - res);
    z.kx += fx * k; z.kz += fz * k; z.stun = Math.max(z.stun, 0.9 * (1 - res)); z.attack = null; z.alert = Math.max(z.alert, 10); z.lkx = P.x; z.lkz = P.z;
    if (res < 0.5 && chance(0.3 + P.attrs.str * 0.03)) z.down = 2.4;
    n++;
  }
  if (n) { SFX.hit(); skillXP('fit', 2); camShake(0.08); }
  makeNoise(P.x, P.z, 4);
}
function damagePlayer(dmg, z, srcName) {
  if (P.dead || G.state !== 'play') return;
  if (P.iframe > 0 && z) { UI.floatText(P.x, 2.2, P.z, 'ухил!', 'res'); return; }
  let m = (1 - armorVal()) * (1 - 0.08 * perk('thick')); if (P.buffs.pain > 0) m *= 0.8;
  dmg *= m; P.hp -= dmg; P.hurtT = 1; wake('Тебе атакують!', true); P.regenDelay = 8; camShake(0.28); SFX.hurt();
  UI.floatText(P.x, 2.2, P.z, '-' + Math.round(dmg), 'hurt'); bloodFX(P.x, 1.3, P.z, 0, 0, 5);
  if (z) {
    const im = 1 - 0.4 * perk('immune');
    if (chance(z.def.bleed * im) && P.bleed < 3) { P.bleed++; UI.notify('Кровотеча! Перев\'яжи рану бинтом.', 'bad'); }
    if (!P.infected && chance(z.def.infect * im * Math.max(0.3, 1 - P.attrs.lck * 0.04))) { P.infected = true; P.infection = 0; UI.notify('Тебе вкусили. Інфекція поширюється — знайди антибіотики!', 'bad'); }
  }
  if (P.hp <= 0) {
    if (perk('secondwind') && P.swCd <= 0) { P.hp = maxHP() * 0.25; P.swCd = 120; UI.notify('Друге дихання!', 'lvl'); ringFX(P.x, P.z, 3, 0xffffff, 0.5); }
    else killPlayer(srcName || (z ? z.def.n : 'Рани'));
  }
}
function killPlayer(cause) { P.hp = 0; P.dead = true; P.deadT = 0; P.cause = cause; P.swing = null; P.reloading = null; SFX.death(); G.state = 'dead'; setTimeout(() => UI.showDeath(), 1800); }
function updatePlayer(dt) {
  const p = P, h = p.h;
  if (p.dead) { p.deadT += dt; const k = Math.min(1, p.deadT / 0.6), e = 1 - (1 - k) * (1 - k); h.g.rotation.x = -e * Math.PI / 2; h.g.position.y = 0.15 * e; return; }
  for (const k of ['atkCd', 'gunCd', 'clickCd', 'shoveCd', 'shoveT', 'stamDelay', 'regenDelay', 'slowT', 'swCd', 'speedBoost', 'gatherT']) if (p[k] > 0) p[k] = Math.max(0, p[k] - dt);
  p.hurtT = Math.max(0, p.hurtT - dt * 2.5); p.recoil = Math.max(0, p.recoil - dt * 1.7); p.kick = Math.max(0, p.kick - dt * 9);
  for (const k in p.buffs) if (p.buffs[k] > 0) p.buffs[k] -= dt;
  // рух
  const K = Input.keys; let ix = 0, iz = 0;
  if (K.KeyW || K.ArrowUp) iz += 1; if (K.KeyS || K.ArrowDown) iz -= 1; if (K.KeyD || K.ArrowRight) ix += 1; if (K.KeyA || K.ArrowLeft) ix -= 1;
  if (Base.sleeping) { ix = 0; iz = 0; }
  const fx = -Math.sin(Cam.yaw), fz = -Math.cos(Cam.yaw), rx = Math.cos(Cam.yaw), rz = -Math.sin(Cam.yaw);
  let mx = fx * iz + rx * ix, mz = fz * iz + rz * ix; const ml = Math.hypot(mx, mz);
  p.moving = ml > 0.01; if (p.moving) { mx /= ml; mz /= ml; }
  if (p.stam <= 0.5) p.exhausted = true; else if (p.exhausted && p.stam > maxStam() * 0.25) p.exhausted = false;
  const wantSprint = K.ShiftLeft || K.ShiftRight; if (wantSprint && p.moving) p.sneak = false;
  p.sprinting = p.moving && wantSprint && !p.exhausted;
  const over = totalWeight() > carryCap(); p.over = over;
  let spd = 4.0 * (1 + p.attrs.agi * 0.02);
  if (p.sprinting) spd *= over ? 1.15 : 1.6; else if (p.sneak) spd *= 0.5;
  if (over) spd *= 0.6; if (p.slowT > 0) spd *= 0.5; if (p.swing) spd *= 0.65; if (p.buffs.adren > 0 || p.speedBoost > 0) spd *= 1.25;
  if (p.infected && p.infection > 60) spd *= 0.9;
  const a = 1 - Math.exp(-14 * dt); p.vx = lerp(p.vx, mx * spd, a); p.vz = lerp(p.vz, mz * spd, a);
  p.x += (p.vx + p.kx) * dt; p.z += (p.vz + p.kz) * dt; const kf = Math.exp(-6 * dt); p.kx *= kf; p.kz *= kf;
  collide(p, 0.3);
  for (const z of Zs) {
    if (z.dead || z.down > 0) continue; const dx = p.x - z.x, dz = p.z - z.z, rr = 0.3 + z.def.rad, d2 = dx * dx + dz * dz;
    if (d2 < rr * rr && d2 > 1e-6) { const d = Math.sqrt(d2), o = (rr - d) / d * 0.5; p.x += dx * o; p.z += dz * o; z.x -= dx * o; z.z -= dz * o; }
  }
  collide(p, 0.3);
  // сили
  if (p.sprinting) { p.stam = Math.max(0, p.stam - 11 * (1 - p.skills.fit.l * 0.03) * dt); p.stamDelay = 0.6; p.fitAcc += dt; if (p.fitAcc > 4) { p.fitAcc = 0; skillXP('fit', 3); } }
  else if (p.stamDelay <= 0) {
    let rg = 13 + p.attrs.end * 1.2; if (p.fatigue > 70) rg *= 0.7; if (p.buffs.energy > 0) rg *= 2; if (p.hunger < 20 || p.thirst < 20) rg *= 0.5; if (p.infected && p.infection > 50) rg *= 0.7; if (!p.moving) rg *= 1.3;
    p.stam = Math.min(maxStam(), p.stam + rg * dt);
  }
  // потреби та стани
  const nm = (1 - 0.2 * perk('iron')) * (Base.sleeping ? 0.35 : 1); if (Base.sleeping) { p.stam = Math.min(maxStam(), p.stam + 30 * dt); if (p.hp < maxHP() && !p.bleed) p.hp = Math.min(maxHP(), p.hp + 0.12 * dt); }
  p.hunger = Math.max(0, p.hunger - dt * 0.105 * nm * (p.sprinting ? 1.5 : 1)); p.thirst = Math.max(0, p.thirst - dt * 0.14 * nm * (p.sprinting ? 1.5 : 1));
  let drain = 0; if (p.hunger <= 0) drain += 0.45; if (p.thirst <= 0) drain += 0.6; if (p.bleed > 0) drain += 0.55 * p.bleed;
  if (p.infected) { p.infection = Math.min(100, p.infection + dt * 0.3); if (p.infection >= 100) drain += 1.6; }
  if (drain > 0) { p.hp -= drain * dt; if (p.hp <= 0) { killPlayer(p.bleed > 0 ? 'Втрата крові' : p.infection >= 100 ? 'Інфекція' : p.thirst <= 0 ? 'Спрага' : 'Голод'); return; } }
  else if (p.regenDelay <= 0 && p.hunger > 40 && p.thirst > 40 && p.hp < maxHP()) p.hp = Math.min(maxHP(), p.hp + (0.15 + 0.4 * perk('regen')) * dt);
  // напрям погляду
  p.rot += angDiff(Math.atan2(Input.aimX - p.x, Input.aimZ - p.z), p.rot) * Math.min(1, dt * 18);
  // атака
  if (Input.down && !UI.modal() && !Base.sel && !Base.sleeping) { const w = activeWeapon(); if (!w || ITEMS[w.id].t !== 'gun' || ITEMS[w.id].auto || Input.fresh) tryAttack(); Input.fresh = false; }
  if (p.swing) { const s = p.swing; s.t += dt; if (!s.hit && s.t >= s.dur * 0.45) { s.hit = true; meleeHit(s); } if (p.swing && s.t >= s.dur) p.swing = null; }
  if (p.reloading) {
    const r = p.reloading, w = activeWeapon(); r.t += dt;
    if (!w || ITEMS[w.id].t !== 'gun') p.reloading = null;
    else if (r.t >= r.dur) { const st = wStats(w), take = Math.min(st.mag - w.ammo, invCount(st.d.ammo)); invRemove(st.d.ammo, take); w.ammo += take; p.reloading = null; SFX.equip(); }
  }
  // шум кроків
  p.noiseT -= dt; if (p.noiseT <= 0 && p.moving) { p.noiseT = 0.45; if (!p.sneak) makeNoise(p.x, p.z, p.sprinting ? 7.5 : 3.2); if (p.sprinting) SFX.step(); }
  animPlayer(dt);
}
function animPlayer(dt) {
  const p = P, h = p.h, w = activeWeapon(), d = w ? ITEMS[w.id] : FISTS, gun = d.t === 'gun', spd = Math.hypot(p.vx, p.vz);
  p.phase += dt * spd * 2.4; const s = Math.sin(p.phase), amp = Math.min(1, spd / 4) * 0.7;
  h.g.position.set(p.x, 0, p.z); h.g.rotation.y = p.rot; h.g.rotation.x = 0; if (Base.sleeping) { h.g.rotation.x = -Math.PI / 2; h.g.position.y = 0.2; }
  h.legL.rotation.x = s * amp; h.legR.rotation.x = -s * amp;
  let aR = -s * amp * 0.6, aL = s * amp * 0.6, aRz = -0.05, aLz = 0.05, twist = 0, lean = p.sprinting ? 0.24 : 0.04, by = Math.abs(Math.cos(p.phase)) * 0.045 * amp + Math.sin(G.t * 2.4) * 0.012 * (1 - Math.min(1, spd / 2));
  if (p.sneak) { lean = 0.38; by -= 0.17; h.legL.rotation.x += 0.35; h.legR.rotation.x += 0.35; }
  if (gun) { aR = -Math.PI / 2 - p.kick * 0.22; if (d.two) { aL = -Math.PI / 2 + 0.12; aLz = -0.52; aRz = 0.14; } }
  else if (w) aR = -0.5 - s * amp * 0.2;
  if (p.swing) {
    const k = p.swing.t / p.swing.dur;
    if (!w) { aR = k < 0.4 ? lerp(-0.4, -1.65, k / 0.4) : lerp(-1.65, -0.3, (k - 0.4) / 0.6); twist = k < 0.4 ? -0.35 * k / 0.4 : -0.35 * (1 - (k - 0.4) / 0.6); }
    else {
      aR = k < 0.25 ? lerp(-0.5, -2.7, k / 0.25) : k < 0.55 ? lerp(-2.7, -0.35, (k - 0.25) / 0.3) : lerp(-0.35, -0.5, (k - 0.55) / 0.45);
      twist = k < 0.25 ? lerp(0, 0.65, k / 0.25) : k < 0.55 ? lerp(0.65, -0.75, (k - 0.25) / 0.3) : lerp(-0.75, 0, (k - 0.55) / 0.45);
      lean += k > 0.25 && k < 0.6 ? 0.18 : 0;
    }
  }
  if (p.shoveT > 0) { aR = aL = -1.5; aLz = aRz = 0; lean = 0.3; } if (p.gatherT > 0) { aR = aL = -0.9; lean = 0.55; }
  if (p.reloading) { aL = -1.15; aLz = -0.7; aR = -1.05; }
  h.armR.rotation.x = aR; h.armL.rotation.x = aL; h.armR.rotation.z = aRz; h.armL.rotation.z = aLz;
  h.body.rotation.y = twist; h.body.rotation.x = lean; h.body.position.y = by;
}

/* ───────── зомбі ───────── */
function spawnZombie(type, x, z, alerted, emerge) {
  const def = ZTYPES[type], day = G.day || 1, hs = 1 + 0.06 * (day - 1), sc = def.scale * rnd(0.95, 1.05), si = rndi(0, 3);
  const o = { skin: CH.skin[si], shirt: pick(CH.shirts), pants: pick(CH.pants), headMats: CH.heads[si], hair: chance(0.6) ? pick(CH.hair) : null };
  if (type === 'runner') { o.headMats = CH.headRunner; o.skin = LM(0xa08a80); o.bulk = 0.88; o.armThick = 0.85; o.legThick = 0.9; }
  if (type === 'brute') { o.headMats = CH.headBrute; o.skin = LM(0x6f7a66); o.bulk = 1.5; o.belly = 1.35; o.armThick = 1.5; o.legThick = 1.4; o.hair = null; }
  if (type === 'spitter') { o.headMats = CH.headSpit; o.skin = LM(0x7f9a5a); o.belly = 1.5; }
  if (type === 'screamer') { o.headMats = CH.headScream; o.skin = LM(0xc9c9c4); o.bulk = 0.85; o.headScale = 1.22; o.hair = null; }
  if (type === 'boss') { o.headMats = CH.headBoss; o.skin = LM(0x5a4a48); o.shirt = LM(0x2a1c1c); o.pants = LM(0x1c1a1a); o.bulk = 1.45; o.belly = 1.2; o.armThick = 1.6; o.legThick = 1.4; o.hair = null; }
  const h = buildHumanoid(o);
  if (type === 'spitter') h.P_(h.body, 0.4, 0.34, 0.26, 0, 1.12, 0.2, new THREE.MeshLambertMaterial({ color: 0x86c43a, emissive: 0x3a6a10 }));
  if (type === 'brute') h.P_(h.body, 0.86, 0.22, 0.4, 0, 1.52, -0.02, o.shirt);
  if (type === 'boss') { for (let i = 0; i < 3; i++) h.P_(h.body, 0.1, 0.34 - i * 0.05, 0.1, 0, 1.62 - i * 0.24, -0.2, LM(0xd8d0c0)); h.P_(h.body, 0.9, 0.24, 0.42, 0, 1.52, -0.02, o.shirt); }
  for (const m of h.ms) m.userData.mat = m.material;
  h.g.scale.setScalar(sc); h.g.position.set(x, 0, z); CH.root.add(h.g);
  const bar = new THREE.Group(), bg = new THREE.Mesh(GEO.plane, CH.barBg), fg = new THREE.Mesh(GEO.plane, CH.barFg);
  bg.scale.set(0.9, 0.11, 1); fg.scale.set(0.86, 0.07, 1); fg.position.z = 0.002; bar.add(bg, fg); bar.visible = false; if (def.boss) bar.scale.setScalar(2.2); CH.root.add(bar);
  const zb = {
    type, def, x, z, rot: rnd(6.28), hp: def.hp * hs, maxHp: def.hp * hs, spd: def.spd * rnd(0.88, 1.12) * Math.min(1.25, 1 + 0.02 * (day - 1)), sc, dmgK: 1 + 0.04 * (day - 1),
    alert: alerted ? 16 : 0, emerge: emerge ? 1.1 : 0, seen: false, lkx: alerted && P ? P.x : x, lkz: alerted && P ? P.z : z, los: false, direct: false, senseT: rnd(0.3), wanderT: rnd(2), wx: x, wz: z, wandering: false, attack: null, atkCd: rnd(0.5), stun: 0, down: 0, busy: 0,
    kx: 0, kz: 0, flash: 0, dead: false, deadT: 0, fallDir: -1, corpse: rnd(35, 55), phase: rnd(6), armL: rnd(-1.5, -0.8), armR: rnd(-1.5, -0.8), headTilt: rnd(-0.3, 0.3),
    spitCd: rnd(1, 3), screamCd: 0, groanT: rnd(2, 8), h, bar, fg,
  };
  Zs.push(zb); return zb;
}
function removeZombie(z) { CH.root.remove(z.h.g); CH.root.remove(z.bar); }
function clearZombies() { for (const z of Zs) removeZombie(z); Zs.length = 0; }
function onAlert(z, quiet) {
  if (!quiet) UI.floatText(z.x, 2.3 * z.sc, z.z, '!', 'crit');
  const d = Math.hypot(z.x - P.x, z.z - P.z);
  if (z.def.scream && z.screamCd <= 0 && !quiet) {
    z.busy = 1.3; z.screamCd = 16; SFX.scream(d); ringFX(z.x, z.z, 14, 0xe8e0d0, 0.9);
    for (const o of Zs) if (!o.dead && o !== z && dist2(o.x, o.z, z.x, z.z) < 900) { o.alert = Math.max(o.alert, 14); o.lkx = P.x; o.lkz = P.z; }
    if (d < 30) UI.notify('Крикун скликає мертвих!', 'bad');
  } else if (d < 24 && chance(0.6)) SFX.groan(d);
}
function senseTick(z, d, dx, dz) {
  if (P.dead) { z.los = false; z.direct = false; z.seen = false; return; }
  let range = z.def.sight * (Env.night > 0.5 ? 0.8 : 1) * (P.sneak ? 0.5 : P.sprinting ? 1.25 : 1) * (1 - 0.2 * perk('quiet'));
  if (P.flashlight && Env.night > 0.5) range *= 1.25; range *= 1 - 0.2 * Weather.rain;
  const los = d < 40 && hasLOS(z.x, z.z, P.x, P.z, 0);
  z.los = los; z.direct = los && d < 16 && hasLOS(z.x, z.z, P.x, P.z, 1);
  let seen = d < 1.8;
  if (!seen && los && d < range) seen = (Math.sin(z.rot) * dx + Math.cos(z.rot) * dz) > -0.25 * d || d < 3.5 || z.alert > 0;
  z.seen = seen; if (seen) { if (z.alert <= 0) onAlert(z); z.alert = Math.max(z.alert, 9); z.lkx = P.x; z.lkz = P.z; }
}
function zombieHit(z) {
  const def = z.def, dx = P.x - z.x, dz = P.z - z.z, d = Math.hypot(dx, dz) || 1;
  damagePlayer(def.dmg * z.dmgK * rnd(0.85, 1.15), z);
  if (def.push) { P.kx += dx / d * def.push; P.kz += dz / d * def.push; camShake(0.4); }
  if (def.slow) P.slowT = def.slow;
  if (def.boss) { ringFX(z.x, z.z, 4, 0xff5a3a, 0.5); spawnParts(14, z.x + dx / d, 0.2, z.z + dz / d, 0, 3, 0, 3, 0x6a6258, 0.6, 0.09); }
}
function hitDoor(z, door) {
  if (door.broken || door.open) return; z.alert = Math.max(z.alert, 8);
  if (door.isStruct) { damageStruct(door, z.def.dmg * 0.7 + 4); SFX.thump(Math.hypot(z.x - P.x, z.z - P.z)); return; }
  const d = Math.hypot(z.x - P.x, z.z - P.z);
  door.hp -= z.def.dmg * 0.7 + 4; door.shake = 1; SFX.thump(d); spawnParts(3, door.cx, 1.2, door.cz, 0, 1, 0, 1.5, 0x6b4a2e, 0.5, 0.05);
  if (door.hp <= 0) { breakDoor(door); spawnParts(18, door.cx, 1.1, door.cz, 0, 2, 0, 3, 0x6b4a2e, 0.9, 0.09); SFX.breakW(); if (d < 14) UI.notify('Двері виламано!', 'bad'); }
}
function spit(z, d) {
  z.spitCd = rnd(3, 4.5); z.busy = 0.4;
  const t = clamp(d / 11, 0.35, 1.2), tx = P.x + P.vx * t * 0.6, tz = P.z + P.vz * t * 0.6, y0 = 1.5 * z.sc;
  const m = new THREE.Mesh(GEO.box, FX.spitMat); m.scale.setScalar(0.2); FX.root.add(m);
  FX.projs.push({ x: z.x, y: y0, z: z.z, vx: (tx - z.x) / t, vz: (tz - z.z) / t, vy: (0.9 - y0) / t + 7 * t, m, dmg: z.def.dmg * 1.7 * z.dmgK });
  SFX.spit(d);
}
function dealDamage(z, dmg, o) {
  if (z.dead) return; o = o || {}; const def = z.def;
  z.hp -= dmg; z.flash = 0.08; flashOn(z.h); z.alert = Math.max(z.alert, 12); z.lkx = P.x; z.lkz = P.z;
  const res = def.stagRes || 0, kb = (o.kb || 0) * (1 - res);
  if (kb > 0) { z.kx += (o.dx || 0) * kb * 2.6; z.kz += (o.dz || 0) * kb * 2.6; }
  if (chance(1 - res)) z.stun = Math.max(z.stun, o.melee ? 0.22 + kb * 0.07 : 0.1);
  bloodFX(z.x, (z.type === 'crawler' ? 0.4 : 1.3) * z.sc, z.z, o.dx || 0, o.dz || 0, o.crit ? 14 : 7, def.spit ? 0x6fae3a : 0x8a0c0c);
  UI.floatText(z.x, 2.0 * z.sc, z.z, String(Math.round(dmg)), o.crit ? 'crit' : 'dmg');
  if (z.hp <= 0) { killZombie(z, o); return; }
  if (o.melee && kb >= 1.8 && z.down <= 0 && chance(0.2 * kb / 2)) z.down = 2.4;
}
function dropBag(x, z, items) {
  if (!items.length) return;
  const c = { kind: 'bag', name: CONT.bag.n, loot: true, x: -1, z: -1, cx: x, cz: z, rot: rnd(6.28), items, searched: true, bid: 0, mesh: null, radius: 1.6, quest: null, life: 150, bag: true };
  c.mesh = contMesh(c); World.group.add(c.mesh); World.conts.push(c);
}
function killZombie(z, o) {
  const def = z.def; z.dead = true; z.deadT = 0; z.attack = null; z.fallDir = chance(0.3) ? 1 : -1; z.bar.visible = false;
  P.kills++; G.hitStop = o.melee ? 0.06 : 0; Quest.ev('kill'); addXP(Math.round(def.xp * (1 + 0.05 * (G.day - 1))));
  addDecal(z.x, z.z, rnd(1.2, 2.2) * z.sc); bloodFX(z.x, 1.2 * z.sc, z.z, o.dx || 0, o.dz || 0, 12, def.spit ? 0x6fae3a : 0x8a0c0c);
  if (perk('adrenaline')) { P.speedBoost = 3; P.stam = Math.min(maxStam(), P.stam + 10); }
  const w = activeWeapon(); if (w && w.af === 'vamp') P.hp = Math.min(maxHP(), P.hp + 3);
  if (def.boss) { dropBag(z.x, z.z, [mkItem(pick(['katana', 'ar', 'rifle', 'sledge', 'shotgun']), 1, { r: rndi(3, 4) }), mkItem('medkit', 2), mkItem('a545', 30), mkItem('a762', 10), mkItem('adrenaline', 1)]); UI.notify('Ватажка вбито! Забери здобич.', 'lvl'); }
  else if (chance(0.2 + P.attrs.lck * 0.012)) dropBag(z.x, z.z, genLoot('bag'));
  SFX.zdie(Math.hypot(z.x - P.x, z.z - P.z));
}
function updateZombie(z, dt) {
  const def = z.def, h = z.h, g = h.g;
  if (z.flash > 0) { z.flash -= dt; if (z.flash <= 0) flashOff(h); }
  if (z.kx || z.kz) {
    z.x += z.kx * dt; z.z += z.kz * dt; const f = Math.exp(-7 * dt); z.kx *= f; z.kz *= f;
    if (Math.abs(z.kx) + Math.abs(z.kz) < 0.05) z.kx = z.kz = 0;
  }
  if (z.dead) {
    z.deadT += dt;
    if (z.type !== 'crawler') { const k = Math.min(1, z.deadT / 0.45), e = 1 - (1 - k) * (1 - k); g.rotation.x = z.fallDir * e * Math.PI / 2; g.position.y = 0.15 * z.sc * e; }
    if (z.deadT < 1) { collide(z, 0.25); g.position.x = z.x; g.position.z = z.z; }
    if (z.deadT > z.corpse) g.position.y -= dt * 0.25;
    return z.deadT > z.corpse + 2.5;
  }
  const dx = P.x - z.x, dz = P.z - z.z, d = Math.hypot(dx, dz);
  if (d > 75) { g.visible = false; z.bar.visible = false; return false; }
  g.visible = true; z.atkCd -= dt; z.spitCd -= dt; z.screamCd -= dt;
  if (z.emerge > 0) {
    z.emerge -= dt; g.position.set(z.x, -1.7 * z.sc * Math.max(0, z.emerge / 1.1), z.z); g.rotation.y = z.rot;
    if (chance(0.3)) spawnParts(1, z.x + rnd(-0.3, 0.3), 0.05, z.z + rnd(-0.3, 0.3), 0, 1.6, 0, 1.2, 0x5c4f3a, 0.5, 0.07);
    animZombie(z, dt, false, 0); return false;
  }
  let moving = false, spd = 0;
  if (z.down > 0) { z.down -= dt; z.attack = null; const k = z.down > 0.6 ? 1 : Math.max(0, z.down / 0.6); g.rotation.x = -k * Math.PI / 2; g.position.y = 0.15 * z.sc * k; }
  else {
    g.rotation.x = 0; g.position.y = 0;
    if (z.stun > 0) { z.stun -= dt; z.attack = null; }
    else if (z.busy > 0) z.busy -= dt;
    else {
      z.senseT -= dt; if (z.senseT <= 0) { z.senseT = 0.25 + Math.random() * 0.15; senseTick(z, d, dx, dz); }
      if (z.alert > 0 && !P.dead) {
        z.alert -= dt;
        if (z.attack) {
          const a = z.attack; a.t += dt;
          const ta = a.door ? Math.atan2(a.door.cx - z.x, a.door.cz - z.z) : Math.atan2(dx, dz); z.rot += angDiff(ta, z.rot) * Math.min(1, dt * 8);
          if (!a.hit && a.t >= def.windup) { a.hit = true; if (a.door) hitDoor(z, a.door); else if (d < def.reach + 0.65) zombieHit(z); }
          if (a.t >= def.windup + 0.3) { z.attack = null; z.atkCd = def.cd * rnd(0.8, 1.2); }
        } else {
          let tx = P.x, tz = P.z, door = null;
          if (!(z.seen || dist2(z.lkx, z.lkz, P.x, P.z) < 9)) {
            tx = z.lkx; tz = z.lkz; const hl = Math.hypot(tx - z.x, tz - z.z);
            if (hl < 1.3) { z.alert = Math.min(z.alert, 1.2); tx = z.x; tz = z.z; }
            else { const ax = Math.floor(z.x + (tx - z.x) / hl * 0.9), az = Math.floor(z.z + (tz - z.z) / hl * 0.9); if (inMap(ax, az)) { const ai = idx(ax, az); if (T.solid[ai] === S_DOOR || (T.kind[ai] === K_BUILT && T.solid[ai])) door = World.doorAt[ai]; } }
          } else if (!z.direct) { const f = flowStep(z.x, z.z); if (f) { tx = f.x; tz = f.z; door = f.door; } }
          if (door && !door.broken && !door.open && dist2(z.x, z.z, door.cx, door.cz) < 1.35) { if (z.atkCd <= 0) z.attack = { t: 0, hit: false, door }; }
          else if (d < def.reach + 0.2 && z.los) { if (z.atkCd <= 0) z.attack = { t: 0, hit: false, door: null }; }
          else if (def.spit && z.seen && z.los && d > 4 && d < 12 && z.spitCd <= 0) spit(z, d);
          else {
            const tdx = tx - z.x, tdz = tz - z.z, tl = Math.hypot(tdx, tdz) || 1;
            spd = z.spd * (Env.night > 0.5 ? 1.15 : 1) * (def.boss && z.hp < z.maxHp * 0.4 ? 1.35 : 1);
            z.x += tdx / tl * spd * dt; z.z += tdz / tl * spd * dt; z.rot += angDiff(Math.atan2(tdx, tdz), z.rot) * Math.min(1, dt * 7); moving = true;
          }
        }
      } else {
        z.wanderT -= dt;
        if (z.wanderT <= 0) { z.wanderT = rnd(3, 8); z.wandering = chance(0.6); if (z.wandering) { const a = rnd(6.28), r = rnd(2, 6); z.wx = z.x + Math.sin(a) * r; z.wz = z.z + Math.cos(a) * r; } }
        if (z.wandering) {
          const tdx = z.wx - z.x, tdz = z.wz - z.z, tl = Math.hypot(tdx, tdz);
          if (tl < 0.4) z.wandering = false;
          else { spd = z.spd * 0.4; z.x += tdx / tl * spd * dt; z.z += tdz / tl * spd * dt; z.rot += angDiff(Math.atan2(tdx, tdz), z.rot) * Math.min(1, dt * 4); moving = true; }
        }
      }
    }
  }
  collide(z, Math.min(def.rad, 0.45));
  g.position.x = z.x; g.position.z = z.z; g.rotation.y = z.rot;
  animZombie(z, dt, moving, spd);
  if (z.hp < z.maxHp) {
    const r = Math.max(0, z.hp / z.maxHp), b = z.bar; b.visible = true; b.position.set(z.x, (z.down > 0 || z.type === 'crawler' ? 1.0 : 2.15) * z.sc, z.z); b.quaternion.copy(G.camera.quaternion);
    z.fg.scale.x = 0.86 * r; z.fg.position.x = -0.43 * (1 - r);
  }
  z.groanT -= dt; if (z.groanT <= 0) { z.groanT = rnd(5, 12); if (z.alert > 0 && d < 20) SFX.groan(d); }
  return false;
}
function animZombie(z, dt, moving, spd) {
  const h = z.h, def = z.def;
  z.phase += dt * (moving ? 2.5 + spd * 2.6 : 1.2);
  const s = Math.sin(z.phase), alert = z.alert > 0;
  if (z.type === 'crawler') {
    h.body.rotation.x = z.dead ? 1.5 : 1.36; const k = moving ? 0.5 : 0.1;
    h.armL.rotation.x = -Math.PI + 0.3 + s * k; h.armR.rotation.x = -Math.PI + 0.3 - s * k;
    h.legL.rotation.x = s * 0.12; h.legR.rotation.x = -s * 0.12; h.head.rotation.x = -0.9;
    if (z.attack) { const a = Math.min(1, z.attack.t / def.windup); h.armL.rotation.x = h.armR.rotation.x = -Math.PI + 0.3 - a * 0.9; }
    return;
  }
  const amp = moving ? Math.min(0.75, 0.3 + spd * 0.2) : 0;
  h.legL.rotation.x = s * amp; h.legR.rotation.x = -s * amp;
  let aL = (alert ? z.armL : -0.15) + Math.sin(z.phase * 0.7) * 0.1, aR = (alert ? z.armR : -0.1) + Math.cos(z.phase * 0.6) * 0.1, lean = moving ? def.lean : 0.05, zL = 0.06, zR = -0.06, hx = 0;
  if (z.attack) {
    const t = z.attack.t, k = t / def.windup;
    if (k < 1) { aL = aR = lerp(-1.2, -2.7, k); lean = -0.1; } else { aL = aR = lerp(-2.7, -0.7, Math.min(1, (t - def.windup) / 0.12)); lean = 0.35; }
  }
  if (z.stun > 0) { lean = -0.3; aL = -0.4 + s * 0.5; aR = -0.4 - s * 0.5; }
  if (z.busy > 0) { lean = -0.25; hx = -0.5; if (def.scream) { aL = aR = -0.3; zL = 0.9; zR = -0.9; } }
  h.armL.rotation.x = aL; h.armR.rotation.x = aR; h.armL.rotation.z = zL; h.armR.rotation.z = zR;
  h.body.rotation.x = lean; h.body.rotation.z = s * 0.07 * (moving ? 1 : 0.4); h.head.rotation.z = z.headTilt + s * 0.04; h.head.rotation.x = hx;
}
function updateZombies(dt) {
  for (let i = Zs.length - 1; i >= 0; i--) if (updateZombie(Zs[i], dt)) { removeZombie(Zs[i]); Zs.splice(i, 1); }
  // розштовхування
  const n = Zs.length;
  for (let i = 0; i < n; i++) {
    const a = Zs[i]; if (a.dead || !a.h.g.visible) continue;
    for (let j = i + 1; j < n; j++) {
      const b = Zs[j]; if (b.dead) continue;
      const dx = b.x - a.x, dz = b.z - a.z, rr = (a.def.rad + b.def.rad) * 0.9; if (dx > rr || dx < -rr || dz > rr || dz < -rr) continue;
      const d2 = dx * dx + dz * dz; if (d2 >= rr * rr || d2 < 1e-6) continue;
      const d = Math.sqrt(d2), o = (rr - d) / d * 0.5; a.x -= dx * o; a.z -= dz * o; b.x += dx * o; b.z += dz * o;
    }
  }
}
