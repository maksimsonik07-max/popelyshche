'use strict';
/* ═══════════ гра: цикл, керування, звук, завдання ═══════════ */
const G = { state: 'menu', time: 8, day: 1, paused: false, scene: null, camera: null, renderer: null, clock: null, t: 0, flowT: 0, spawnT: 0, actT: 0, zone: '', endless: false, flash: null, beacon: null, hl: null, aim: null, target: null, heliT: 0 };
const Cam = { yaw: Math.PI / 4, pitch: 0.84, dist: 30, x: 60, z: 60, shake: 0 };
const Input = { keys: {}, mx: 0, my: 0, down: false, fresh: false, rdown: false, aimX: 0, aimZ: 0 };
function camShake(v) { Cam.shake = Math.min(1, Cam.shake + v); }

/* ───────── звук (синтез, без файлів) ───────── */
const SFX = {
  ctx: null, out: null, nb: null,
  init() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { this.ctx = null; return; }
    const c = this.ctx; this.out = c.createGain(); this.out.gain.value = 0.5; this.out.connect(c.destination);
    const len = c.sampleRate, b = c.createBuffer(1, len, len), d = b.getChannelData(0); for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1; this.nb = b;
    const s = c.createBufferSource(); s.buffer = b; s.loop = true; const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 320;
    const g = c.createGain(); g.gain.value = 0.05; s.connect(f); f.connect(g); g.connect(this.out); s.start();
    const lfo = c.createOscillator(); lfo.frequency.value = 0.13; const lg = c.createGain(); lg.gain.value = 140; lfo.connect(lg); lg.connect(f.frequency); lfo.start();
  },
  noise(dur, f0, f1, vol, type, q) {
    const c = this.ctx; if (!c || vol <= 0.003) return; const t = c.currentTime, s = c.createBufferSource(); s.buffer = this.nb;
    const f = c.createBiquadFilter(); f.type = type || 'lowpass'; f.Q.value = q || 1; f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(Math.max(30, f1), t + dur);
    const g = c.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur); s.connect(f); f.connect(g); g.connect(this.out); s.start(t, Math.random() * 0.5, dur + 0.05);
  },
  tone(f0, f1, dur, vol, type, delay) {
    const c = this.ctx; if (!c || vol <= 0.003) return; const t = c.currentTime + (delay || 0), o = c.createOscillator(); o.type = type || 'sine';
    o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    const g = c.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.012); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g); g.connect(this.out); o.start(t); o.stop(t + dur + 0.05);
  },
  att(d) { const k = clamp(1 - d / 32, 0, 1); return k * k; },
  shot(id) {
    if (id === 'pistol') { this.noise(0.16, 3200, 300, 0.5); this.tone(220, 60, 0.12, 0.35, 'square'); }
    else if (id === 'smg') { this.noise(0.1, 3800, 500, 0.34); this.tone(260, 80, 0.08, 0.24, 'square'); }
    else if (id === 'shotgun') { this.noise(0.38, 2200, 120, 0.75); this.tone(130, 40, 0.25, 0.5, 'sawtooth'); this.tone(600, 400, 0.05, 0.1, 'square', 0.4); }
    else if (id === 'ar') { this.noise(0.14, 3000, 300, 0.5); this.tone(180, 50, 0.1, 0.4, 'square'); }
    else if (id === 'crossbow') { this.tone(300, 140, 0.12, 0.3, 'triangle'); this.noise(0.08, 2500, 800, 0.15, 'bandpass', 3); }
    else { this.noise(0.5, 2600, 100, 0.8); this.tone(110, 35, 0.3, 0.55, 'sawtooth'); }
  },
  swing() { this.noise(0.18, 600, 2400, 0.16, 'bandpass', 2); },
  hit() { this.tone(140, 50, 0.12, 0.4); this.noise(0.08, 900, 200, 0.3); },
  empty() { this.tone(1400, 900, 0.03, 0.12, 'square'); },
  reload() { this.tone(700, 500, 0.04, 0.12, 'square'); this.tone(500, 800, 0.05, 0.12, 'square', 0.3); },
  equip() { this.noise(0.07, 1800, 600, 0.14, 'bandpass', 3); },
  eat() { this.noise(0.1, 500, 300, 0.15); this.tone(300, 200, 0.08, 0.08, 'sine', 0.1); },
  pick() { this.tone(660, 880, 0.07, 0.12, 'triangle'); },
  open() { this.noise(0.15, 400, 900, 0.12, 'bandpass', 2); },
  door() { this.noise(0.12, 500, 250, 0.2); this.tone(180, 120, 0.1, 0.1); },
  level() { [523, 659, 784, 1047].forEach((f, i) => this.tone(f, f, 0.22, 0.16, 'triangle', i * 0.09)); },
  hurt() { this.tone(200, 90, 0.2, 0.36, 'sawtooth'); this.noise(0.1, 700, 200, 0.2); },
  death() { this.tone(160, 40, 1.2, 0.5, 'sawtooth'); },
  step() { this.noise(0.05, 300, 120, 0.05); },
  groan(d) { const v = this.att(d) * 0.2, f = rnd(70, 115); this.tone(f, f * 0.7, rnd(0.5, 0.9), v, 'sawtooth'); this.tone(f * 1.5, f, 0.5, v * 0.4, 'square'); },
  scream(d) { const v = this.att(d * 0.6); this.tone(900, 1400, 0.9, v * 0.3, 'sawtooth'); this.tone(1300, 700, 0.9, v * 0.18, 'square'); },
  thump(d) { const v = this.att(d); this.tone(90, 40, 0.18, v * 0.6); this.noise(0.1, 300, 100, v * 0.3); },
  breakW() { this.noise(0.3, 1500, 200, 0.4); this.tone(200, 60, 0.2, 0.3, 'square'); },
  splat(d) { this.noise(0.2, 900, 200, this.att(d) * 0.3); },
  spit(d) { this.noise(0.15, 1200, 2500, this.att(d) * 0.2, 'bandpass', 3); },
  zdie(d) { this.tone(120, 45, 0.5, this.att(d) * 0.25, 'sawtooth'); },
  chop() { this.tone(180, 90, 0.08, 0.3, 'square'); this.noise(0.07, 1400, 500, 0.25); },
  mine() { this.tone(900, 500, 0.05, 0.2, 'square'); this.noise(0.06, 3000, 1200, 0.25); },
  fall() { this.noise(0.5, 500, 120, 0.4); this.tone(90, 45, 0.4, 0.3); },
  build() { this.tone(240, 180, 0.07, 0.25, 'square'); this.tone(320, 240, 0.07, 0.2, 'square', 0.09); this.noise(0.1, 900, 300, 0.2); },
  craft() { this.noise(0.12, 1200, 700, 0.12, 'bandpass', 2); this.tone(500, 620, 0.06, 0.08, 'triangle', 0.08); },
  drone() { this.tone(110, 104, 2.4, 0.22, 'sawtooth'); this.tone(165, 150, 2.4, 0.12, 'sawtooth'); },
};

/* ───────── завдання ───────── */
function spawnAround(n, alerted, minD, maxD, type, emerge) {
  let made = 0;
  for (let t = 0; t < n * 14 && made < n; t++) {
    const a = rnd(6.283), r = rnd(minD, maxD), x = Math.floor(P.x + Math.sin(a) * r), z = Math.floor(P.z + Math.cos(a) * r);
    if (x < 2 || z < 2 || x > MAP - 3 || z > MAP - 3) continue;
    const i = idx(x, z); if (T.solid[i] || T.kind[i] || Flow.dist[i] < 0) continue;
    const zb = spawnZombie(type || wpick(zWeights(G.day))[0], x + 0.5, z + 0.5, alerted, emerge); if (alerted === 2) zb.alert = 45; made++;
  }
  return made;
}
function populate() {
  let n = 0;
  for (let t = 0; t < 6000 && n < 46; t++) {
    const x = rndi(4, MAP - 5), z = rndi(4, MAP - 5), i = idx(x, z);
    if (T.solid[i] || T.kind[i] || dist2(x, z, P.x, P.z) < 900 || dist2(x, z, World.camp.x, World.camp.z) < 1150) continue;
    if (!T.bid[i] && !chance(x >= TOWN0 && z >= TOWN0 ? 0.12 : 0.02)) continue;
    spawnZombie(wpick(zWeights(1))[0], x + 0.5, z + 0.5, false); n++;
  }
}
function spawner(dt) {
  G.spawnT -= dt; if (G.spawnT > 0) return; G.spawnT = 2.5;
  const night = Env.night > 0.5; let near = 0, total = 0;
  for (let i = Zs.length - 1; i >= 0; i--) {
    const z = Zs[i]; if (z.dead) continue; total++;
    const d2 = dist2(z.x, z.z, P.x, P.z);
    if (d2 < 3600) near++; else if (total > 110 && !z.def.boss && d2 > 7225 && chance(0.3)) { removeZombie(z); Zs.splice(i, 1); total--; }
  }
  if (Quest.isTut() || total >= 125) return;
  const inTown = P.x >= TOWN0 - 8 && P.z >= TOWN0 - 8, cap = (inTown ? Math.min(60, 26 + G.day * 6) : Math.min(30, 4 + G.day * 4)) * (night ? 1.4 : 1);
  if (near < cap) spawnAround(rndi(1, 2), false, 30, 46);
}
function timeEvents(a, b) {
  const X = h => a < h && b >= h;
  if (X(21)) { UI.notify('Сутеніє. Уночі мертві швидші й лютіші.', 'bad'); SFX.drone(); }
  if (X(23)) {
    if (Quest.isTut()) return; const n = Math.min(24, 3 + G.day * 3); spawnAround(n, 2, 24, 38, null, true); UI.notify('Орда йде на твій запах!', 'bad'); SFX.drone();
    if (G.day % 2 === 0) { if (spawnAround(1, 2, 30, 40, 'boss', true)) UI.notify('Ватажок вийшов на полювання.', 'bad'); }
  }
  if (X(6)) { UI.notify('Світанок. Ти пережив ніч.', 'good'); addXP(40 + G.day * 20); morningProduce(); Save.auto(true); }
}

/* ───────── взаємодія ───────── */
function findInteract() {
  let best = null, bs = 1e9; const fx = Math.sin(P.rot), fz = Math.cos(P.rot);
  const score = (x, z, r) => { const dx = x - P.x, dz = z - P.z, d = Math.hypot(dx, dz); return d > r ? 1e9 : d - 0.5 * (dx * fx + dz * fz) / (d || 1); };
  for (const c of World.conts) { const s = score(c.cx, c.cz, c.radius); if (s < bs) { bs = s; best = { t: 'cont', c, x: c.cx, z: c.cz, y: c.kind === 'bag' ? 0.9 : c.kind === 'car' ? 1.9 : 2.35 }; } }
  for (const d of World.doors) { if (d.broken) continue; const s = score(d.cx, d.cz, 1.6) + 0.15; if (s < bs) { bs = s; best = { t: 'door', d, x: d.cx, z: d.cz, y: 2.6 }; } }
  if (Quest.stage === 19 && !Quest.done) { const c = World.console, s = score(c.cx, c.cz, 2.3) - 0.6; if (s < bs) { bs = s; best = { t: 'console', x: c.cx, z: c.cz, y: 2.5 }; } }
  for (const st of Base.structs) { if (st.def.flat || st.def.small || (st.def.block && !st.def.gate && st.hp >= st.max)) continue; const s = score(st.cx, st.cz, 1.9); if (s < bs) { bs = s; best = { t: 'struct', s: st, x: st.cx, z: st.cz, y: 2.3 }; } }
  { const c = World.core, s = score(c.cx, c.cz, 2.3); if (s < bs) { bs = s; best = { t: 'core', x: c.cx, z: c.cz, y: 2.9 }; } }
  const px = P.x | 0, pz = P.z | 0;
  for (let dz = -2; dz <= 2; dz++) for (let dx = -2; dx <= 2; dx++) {
    if (!inMap(px + dx, pz + dz)) continue; const n = World.nodeAt[idx(px + dx, pz + dz)]; if (!n || !n.alive || !n.def.hand) continue;
    const s = score(n.cx, n.cz, 1.7) - 0.1; if (s < bs) { bs = s; best = { t: 'node', n, x: n.cx, z: n.cz, y: 1.3 }; }
  }
  return best;
}
function interact() {
  const t = G.target = findInteract(); if (!t || P.dead) return;
  if (t.t === 'cont') { if (UI.open.loot === t.c) UI.takeAll(); else UI.openLoot(t.c); }
  else if (t.t === 'door') {
    const d = t.d;
    if (d.open) { if (dist2(P.x, P.z, d.cx, d.cz) < 0.36 || Zs.some(z => !z.dead && dist2(z.x, z.z, d.cx, d.cz) < 0.5)) { UI.notify('Щось заважає зачинити двері.'); return; } }
    setDoor(d, !d.open); SFX.door(); makeNoise(P.x, P.z, 2.5);
  } else if (t.t === 'struct') useStruct(t.s); else if (t.t === 'core') UI.toggleBase(); else if (t.t === 'node') handGather(t.n); else Quest.useConsole();
}
function interactTick(dt) {
  G.actT -= dt; if (G.actT > 0) { if (G.hl.visible) { G.hl.rotation.y += dt * 3; G.hl.position.y = G.hlY + Math.sin(G.t * 4) * 0.08; } return; }
  G.actT = 0.1;
  const t = G.target = P.dead ? null : findInteract(); let s = '';
  if (t) {
    if (t.t === 'cont') { const c = t.c; s = UI.open.loot === c ? (c.items.length ? '<kbd>E</kbd> Забрати все' : '') : c.items === null ? `<kbd>E</kbd> Обшукати: ${c.name}` : c.items.length ? `<kbd>E</kbd> ${c.name}` : `${c.name} — порожньо`; }
    else if (t.t === 'door') s = `<kbd>E</kbd> ${t.d.open ? 'Зачинити' : 'Відчинити'} двері`;
    else if (t.t === 'struct') s = structPrompt(t.s);
    else if (t.t === 'core') s = `<kbd>E</kbd> Намет: база «${BASE_LV[Base.lv - 1].n}»`;
    else if (t.t === 'node') s = `<kbd>E</kbd> Зібрати: ${t.n.def.n}`;
    else s = invCount('radio') && invCount('battery') && invCount('antenna') ? '<kbd>E</kbd> Увімкнути передавач' : 'Передавач: потрібні рація, акумулятор і антена';
    G.hl.visible = true; G.hlY = t.y; G.hl.position.set(t.x, t.y, t.z);
  } else G.hl.visible = false;
  UI.prompt(s);
  const bid = T.bid[idx(P.x | 0, P.z | 0)]; G.zone = bid ? World.buildings[bid - 1].def.n : inBase(P.x, P.z) ? 'База: ' + BASE_LV[Base.lv - 1].n : World.quarry && dist2(P.x, P.z, World.quarry.cx, World.quarry.cz) < 150 ? 'Кар\'єр' : P.x >= TOWN0 && P.z >= TOWN0 ? 'Місто' : 'Дика місцевість';
  for (let i = World.conts.length - 1; i >= 0; i--) { const c = World.conts[i]; if (!c.bag) continue; c.life -= 0.1; if (c.life <= 0 && UI.open.loot !== c) { World.group.remove(c.mesh); World.conts.splice(i, 1); } }
}

/* ───────── камера й приціл ───────── */
const _ray = new THREE.Raycaster(), _ndc = new THREE.Vector2(), _plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -1), _hit = new THREE.Vector3();
function updateAim() {
  _ndc.set(Input.mx / innerWidth * 2 - 1, -(Input.my / innerHeight) * 2 + 1); _ray.setFromCamera(_ndc, G.camera);
  if (_ray.ray.intersectPlane(_plane, _hit)) { Input.aimX = _hit.x; Input.aimZ = _hit.z; }
}
function placeCamera(dt) {
  const c = G.camera, cp = Math.cos(Cam.pitch); let sx = 0, sy = 0;
  if (Cam.shake > 0) { Cam.shake = Math.max(0, Cam.shake - dt * 2.4); const s = Cam.shake * Cam.shake * 0.9; sx = rnd(-s, s); sy = rnd(-s, s); }
  c.position.set(Cam.x + Math.sin(Cam.yaw) * cp * Cam.dist + sx, Math.sin(Cam.pitch) * Cam.dist + 1 + sy, Cam.z + Math.cos(Cam.yaw) * cp * Cam.dist + sx);
  c.lookAt(Cam.x, 1, Cam.z);
}
function updateCamera(dt) {
  let lx = (Input.aimX - P.x) * 0.1, lz = (Input.aimZ - P.z) * 0.1; const l = Math.hypot(lx, lz); if (l > 2.6) { lx *= 2.6 / l; lz *= 2.6 / l; }
  if (P.dead) lx = lz = 0;
  const k = 1 - Math.exp(-7 * dt); Cam.x = lerp(Cam.x, P.x + lx, k); Cam.z = lerp(Cam.z, P.z + lz, k);
  placeCamera(dt);
}
function updateLights() {
  const fx = Math.sin(P.rot), fz = Math.cos(P.rot), f = G.flash, on = P.flashlight && !P.dead;
  if (f.visible !== on) f.visible = on;
  if (on) { f.position.set(P.x + fx * 0.35, 1.5, P.z + fz * 0.35); f.target.position.set(P.x + fx * 9, 0.5, P.z + fz * 9); }
  const w = activeWeapon(), gun = w && ITEMS[w.id].t === 'gun' && !P.dead && !UI.modal();
  G.aim.visible = !!gun;
  if (gun) {
    const a = Math.atan2(Input.aimX - P.x, Input.aimZ - P.z), dx = Math.sin(a), dz = Math.cos(a), len = Math.max(0.5, rayGrid(P.x, P.z, dx, dz, ITEMS[w.id].range, 0) - 0.8);
    G.aim.position.set(P.x + dx * (0.8 + len / 2), 1.36, P.z + dz * (0.8 + len / 2)); G.aim.scale.set(0.025, 0.012, len); G.aim.rotation.y = a;
  }
  const m = Quest.marker(), b = G.beacon;
  if (m && dist2(m.x, m.z, P.x, P.z) > 81) { b.visible = true; b.position.set(m.x, 9, m.z); b.material.opacity = 0.1 + Math.sin(G.t * 3) * 0.04; } else b.visible = false;
  if (World.tower && World.tower.light) World.tower.light.visible = (G.t % 1.4) < 0.7;
}

/* ───────── цикл ───────── */
function update(dt) {
  G.t += dt;
  if (G.hitStop > 0) { G.hitStop -= dt; dt *= 0.12; } const prev = G.time; G.time += dt * 24 / DAY_LEN; timeEvents(prev, G.time); if (G.time >= 24) { G.time -= 24; G.day++; }
  G.abs = (G.day - 1) * 24 + G.time; updateAim(); updatePlayer(dt); updateCraft(dt);
  G.flowT -= dt; if (Flow.dirty || (G.flowT <= 0 && ((P.x | 0) !== Flow.px || (P.z | 0) !== Flow.pz))) { computeFlow(P.x, P.z); G.flowT = 0.2; }
  updateZombies(dt); updateFX(dt); updateNodes(dt); updateCanopy(dt, P.x, P.z, Cam.yaw); updateBase(dt); spawner(dt); Quest.update(dt); interactTick(dt); sleepTick(); Save.tick(dt);
  updateBuildings(dt, P.x, P.z, Cam.yaw); updateCamera(dt); updateEnv(G.time, P.x, P.z, Cam.dist); updateExtras(dt); updateLights(); UI.frame(dt);
}
function frame() {
  requestAnimationFrame(frame);
  const dt = Math.min(0.04, G.clock.getDelta());
  if (G.state === 'menu') {
    MenuFX.update(dt);
    
  } else if (!G.paused && (G.state === 'play' || G.state === 'dead')) { if (Base.sleeping) { for (let i = 0; i < 8 && Base.sleeping; i++) update(dt * 1.75); } else update(dt); }
  else if (G.state === 'won') { Quest.update(dt); updateFX(dt); }
  G.renderer.render(G.scene, G.camera);
}
function resize() { const w = innerWidth, h = innerHeight; G.renderer.setPixelRatio([0.7, Math.min(devicePixelRatio || 1, 1.25), Math.min(devicePixelRatio || 1, 2)][Settings.d.res]); G.renderer.setSize(w, h, false); G.camera.aspect = w / h; G.camera.updateProjectionMatrix(); }
