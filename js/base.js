'use strict';
/* ═══════════ база: будівлі, робочі місця, ворота, пастки, режим будівництва ═══════════ */
const Base = { lv: 1, structs: [], at: {}, stash: null, sel: null, ghost: null, ring: null, coreMesh: null, sleeping: false, trapT: 0, gx: 0, gz: 0, t: 0, mats: null };
const _sg = {};
function structGeo(id) {
  if (_sg[id]) return _sg[id];
  if (id === 'bed') return _sg[id] = contGeo('bed');
  const g = new GB(), B = (x0, y0, z0, x1, y1, z1, hex) => g.box(x0, y0, z0, x1, y1, z1, C(hex), 1, 63);
  const legs = (h, hex) => { for (const sx of [-0.46, 0.38]) for (const sz of [-0.32, 0.24]) B(sx, 0, sz, sx + 0.08, h, sz + 0.08, hex); };
  if (structDetail(B, legs, id)) return _sg[id] = g.build();
  switch (id) {
    case 'fire': for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4, x = Math.sin(a) * 0.36, z = Math.cos(a) * 0.36; B(x - 0.09, 0, z - 0.09, x + 0.09, 0.13 + (k % 2) * 0.04, z + 0.09, k % 2 ? 0x77756e : 0x8d8a82); } B(-0.2, 0, -0.2, 0.2, 0.04, 0.2, 0x2a2826); B(-0.28, 0.05, -0.05, 0.28, 0.15, 0.05, 0x5a3d27); B(-0.05, 0.08, -0.28, 0.05, 0.18, 0.28, 0x4f3622); break;
    case 'bench': B(-0.5, 0.78, -0.36, 0.5, 0.86, 0.36, 0x9a7a52); legs(0.78, 0x6f5530); B(-0.44, 0.3, -0.3, 0.44, 0.34, 0.3, 0x7d6038); B(0.26, 0.86, -0.3, 0.42, 1.0, -0.14, 0x4a4f55); B(-0.4, 0.86, 0.05, 0.1, 0.9, 0.2, 0xc9a66a); B(-0.3, 0.86, -0.25, 0, 0.88, -0.17, 0xb8bcc0); break;
    case 'chest': B(-0.42, 0, -0.3, 0.42, 0.5, 0.3, 0x8a6a3c); B(-0.44, 0.5, -0.32, 0.44, 0.62, 0.32, 0x7a5a30); B(-0.3, 0, -0.31, -0.24, 0.63, 0.31, 0x3a3d42); B(0.24, 0, -0.31, 0.3, 0.63, 0.31, 0x3a3d42); B(-0.05, 0.36, 0.3, 0.05, 0.48, 0.33, 0xd0b050); break;
    case 'wall': [[-0.5, -0.5, 2.0, 0x7a5a36], [0, -0.5, 2.15, 0x6f5230], [-0.5, 0, 2.1, 0x735534], [0, 0, 1.95, 0x7d5d38]].forEach(l => { B(l[0], 0, l[1], l[0] + 0.5, l[2], l[1] + 0.5, l[3]); B(l[0] + 0.13, l[2], l[1] + 0.13, l[0] + 0.37, l[2] + 0.24, l[1] + 0.37, 0x5f4526); }); B(-0.52, 1.1, -0.52, 0.52, 1.22, 0.52, 0x4f3622); break;
    case 'swall': B(-0.5, 0, -0.5, 0.5, 2.1, 0.5, 0x8d8a82); for (const y of [0.5, 1.05, 1.6]) B(-0.51, y, -0.51, 0.51, y + 0.04, 0.51, 0x6a6862); for (const sx of [-0.5, 0.16]) for (const sz of [-0.5, 0.16]) B(sx, 2.1, sz, sx + 0.34, 2.4, sz + 0.34, 0x7f7c75); break;
    case 'torch': B(-0.05, 0, -0.05, 0.05, 1.5, 0.05, 0x5a3d27); B(-0.09, 1.5, -0.09, 0.09, 1.68, 0.09, 0x2a2826); B(-0.14, 0, -0.14, 0.14, 0.08, 0.14, 0x77756e); break;
    case 'gate': B(-0.5, 0, -0.08, -0.38, 2.1, 0.08, 0x5a3d27); B(0.38, 0, -0.08, 0.5, 2.1, 0.08, 0x5a3d27); B(-0.38, 0.15, -0.05, 0.38, 1.9, 0.05, 0x9a7a52); B(-0.38, 0.5, -0.07, 0.38, 0.62, 0.07, 0x6f5530); B(-0.38, 1.4, -0.07, 0.38, 1.52, 0.07, 0x6f5530); break;
    case 'furnace': B(-0.45, 0, -0.45, 0.45, 1.1, 0.45, 0x77756e); B(-0.38, 1.1, -0.38, 0.38, 1.3, 0.38, 0x6a6862); B(-0.15, 1.3, -0.15, 0.15, 2.0, 0.15, 0x5d5b56); B(-0.22, 0.22, 0.45, 0.22, 0.62, 0.47, 0x1a1512); B(-0.46, 0.7, -0.46, 0.46, 0.76, 0.46, 0x5d5b56); break;
    case 'trap': B(-0.45, 0, -0.45, 0.45, 0.05, 0.45, 0x6f5530); for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) { B(i * 0.3 - 0.04, 0.05, j * 0.3 - 0.04, i * 0.3 + 0.04, 0.3, j * 0.3 + 0.04, 0xc9b28a); B(i * 0.3 - 0.02, 0.3, j * 0.3 - 0.02, i * 0.3 + 0.02, 0.46, j * 0.3 + 0.02, 0xe0d0aa); } break;
    case 'garden': B(-0.48, 0, -0.48, 0.48, 0.18, 0.48, 0x6f5530); B(-0.42, 0.18, -0.42, 0.42, 0.22, 0.42, 0x3d2e1e); for (const sx of [-0.22, 0.22]) for (const sz of [-0.22, 0.22]) { B(sx - 0.03, 0.22, sz - 0.03, sx + 0.03, 0.42, sz + 0.03, 0x5a9a3a); B(sx - 0.1, 0.36, sz - 0.02, sx + 0.1, 0.4, sz + 0.02, 0x6fb04a); } break;
    case 'water': B(-0.3, 0, -0.3, 0.3, 0.8, 0.3, 0x4a6a8a); B(-0.33, 0.8, -0.33, 0.33, 0.86, 0.33, 0x3a3d42); for (const sx of [-0.47, 0.43]) for (const sz of [-0.47, 0.43]) B(sx, 0, sz, sx + 0.04, 1.5, sz + 0.04, 0x5a3d27); B(-0.48, 1.46, -0.48, 0.48, 1.5, 0.48, 0x8a9a8a); break;
    case 'anvil': B(-0.48, 0, -0.48, 0, 0.9, 0.48, 0x8a4a3a); B(-0.42, 0.9, -0.4, -0.06, 0.96, 0.4, 0x2a1a14); B(0.16, 0, -0.14, 0.4, 0.45, 0.14, 0x3a3d42); B(0.06, 0.45, -0.2, 0.5, 0.65, 0.2, 0x2a2d32); B(-0.3, 0.96, -0.2, -0.18, 1.0, 0.2, 0xff7a2a); break;
    case 'ammo': B(-0.5, 0.78, -0.36, 0.5, 0.84, 0.36, 0x5a5f66); legs(0.78, 0x3a3d42); B(-0.32, 0.84, -0.12, -0.1, 1.3, 0.1, 0x8a2f2a); B(-0.24, 1.3, -0.03, 0.12, 1.34, 0.03, 0x2a2d32); B(0.1, 0.84, -0.22, 0.42, 0.98, 0.1, 0x6a7a4a); B(0.14, 0.98, -0.18, 0.2, 1.06, -0.12, 0xd0b050); B(0.26, 0.98, -0.1, 0.32, 1.06, -0.04, 0xd0b050); break;
    case 'demolish': B(-0.5, 0, -0.5, 0.5, 0.12, 0.5, 0xffffff); break;
  }
  return _sg[id] = g.build();
}
function coreGeo(lv) {
  const g = new GB(), B = (x0, y0, z0, x1, y1, z1, hex) => g.box(x0, y0, z0, x1, y1, z1, C(hex), 1, 63), k = lv === 1 ? 1 : 1.2;
  if (lv <= 2) {
    const w = 0.72 * k, d = 0.8 * k, h = 1.25 * k, c = C(lv === 1 ? 0x8a8a5a : 0x7a8a62), c2 = C(0x6f6f48);
    g.poly([[-w, 0, d], [0, h, d], [0, h, -d], [-w, 0, -d]], c, 2); g.poly([[w, 0, -d], [0, h, -d], [0, h, d], [w, 0, d]], c, 2); g.poly([[w, 0, -d], [-w, 0, -d], [0, h, -d]], c2, 2);
    B(-0.03, 0, d - 0.03, 0.03, h + 0.1, d + 0.03, 0x5a3d27); B(-0.4, 0, -0.5, 0.1, 0.1, 0.5, 0x5a7a9a);
  } else {
    const w = lv === 3 ? 0.72 : 0.8;
    if (lv === 4) B(-0.92, 0, -0.92, 0.92, 0.35, 0.92, 0x8d8a82);
    B(-w, 0, -w, w, 1.5, w, 0x9a7a52); B(-0.2, 0, w, 0.2, 1.1, w + 0.03, 0x3a2a1c); B(-w - 0.02, 0.7, -w - 0.02, w + 0.02, 0.78, w + 0.02, 0x6f5530);
    const c = C(lv === 3 ? 0x6b3a2e : 0x46505a), r = w + 0.18;
    g.poly([[-r, 1.5, r], [0, 2.2, r], [0, 2.2, -r], [-r, 1.5, -r]], c, 2); g.poly([[r, 1.5, -r], [0, 2.2, -r], [0, 2.2, r], [r, 1.5, r]], c, 2);
    g.poly([[r, 1.5, -r], [-r, 1.5, -r], [0, 2.2, -r]], C(0x9a7a52), 2); g.poly([[-r, 1.5, r], [r, 1.5, r], [0, 2.2, r]], C(0x9a7a52), 2);
    if (lv === 4) { B(-0.86, 0.35, -0.86, -0.82, 4.4, -0.82, 0x9aa0a6); B(-1.0, 4.0, -0.86, -0.7, 4.04, -0.82, 0x9aa0a6); }
  }
  if (lv >= 2) { B(0.82, 0, 0.82, 0.87, 2.7, 0.87, 0x5a3d27); B(0.87, 2.25, 0.83, 1.4, 2.62, 0.86, 0xcf4a2c); }
  return g.build();
}
const structAt = (x, z) => Base.at[idx(x, z)] || null;
function inBase(x, z, pad) { const c = World.core, r = BASE_LV[Base.lv - 1].r + (pad || 0); return !!c && dist2(x, z, c.cx, c.cz) <= r * r; }
function rebuildCore() {
  if (Base.coreMesh) World.group.remove(Base.coreMesh);
  const m = Base.coreMesh = new THREE.Mesh(coreGeo(Base.lv), Base.mats.vc2); m.position.set(World.core.cx, 0, World.core.cz); m.castShadow = true; m.receiveShadow = true; World.group.add(m);
  if (Base.ring) World.group.remove(Base.ring);
  const r = BASE_LV[Base.lv - 1].r; Base.ring = new THREE.Mesh(new THREE.RingGeometry(r - 0.12, r + 0.12, 64).rotateX(-Math.PI / 2), Base.mats.ring);
  Base.ring.position.set(World.core.cx, 0.05, World.core.cz); Base.ring.visible = false; World.group.add(Base.ring);
}
function resetBase() {
  if (!Base.mats) Base.mats = {
    vc2: new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide }), ring: new THREE.MeshBasicMaterial({ color: 0xffd24a, transparent: true, opacity: 0.5, depthWrite: false }),
    ghost: new THREE.MeshBasicMaterial({ color: 0x7fe07a, transparent: true, opacity: 0.55, depthWrite: false }), flame: new THREE.MeshBasicMaterial({ color: 0xffa13a }), core: new THREE.MeshBasicMaterial({ color: 0xffe9a0 }),
    glow: new THREE.MeshBasicMaterial({ map: TEX.pool, color: 0xff9a4a, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending, depthWrite: false }), flameGeo: new THREE.ConeGeometry(0.2, 0.6, 5).translate(0, 0.3, 0), glowGeo: new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2),
  };
  Base.lv = 1; Base.structs = []; Base.at = {}; Base.sel = null; Base.ghost = null; Base.sleeping = false; Base.coreMesh = null; Base.ring = null;
  Base.stash = { kind: 'chest', name: 'Склад бази', loot: true, stash: true, x: -1, z: -1, cx: 0, cz: 0, items: [], searched: true, radius: 2.2, bid: 0, mesh: null };
  rebuildCore();
}
function placeStruct(def, x, z, sv) {
  const i = idx(x, z), s = { id: def.id, def, x, z, cx: x + 0.5, cz: z + 0.5, hp: sv && sv.hp !== undefined ? sv.hp : Math.round(def.hp * (P ? 1 + 0.25 * perk('builder') : 1)), max: Math.round(def.hp * (P ? 1 + 0.25 * perk('builder') : 1)), open: false, broken: false, isStruct: true, stock: sv && sv.stock || 0, pop: sv ? 0 : 1, shake: 0, mesh: null, pivot: null, ang: 0, flame: null, glow: null, ph: _rand() * 6 };
  const grp = new THREE.Group(), m = new THREE.Mesh(structGeo(def.id), MAT.vc); m.castShadow = !def.flat; m.receiveShadow = true;
  if (def.gate) {
    const across = b => b && b.def.block; if (across(structAt(x, z - 1)) || across(structAt(x, z + 1))) grp.rotation.y = Math.PI / 2;
    const pv = s.pivot = new THREE.Group(); pv.position.x = -0.5; m.position.x = 0.5; pv.add(m); grp.add(pv);
  } else grp.add(m);
  if (def.id === 'fire' || def.id === 'torch') {
    const f = s.flame = new THREE.Mesh(Base.mats.flameGeo, Base.mats.flame); f.position.y = def.id === 'fire' ? 0.16 : 1.66; if (def.id === 'torch') f.scale.setScalar(0.6);
    const c = new THREE.Mesh(Base.mats.flameGeo, Base.mats.core); c.scale.set(0.5, 0.6, 0.5); f.add(c); grp.add(f);
    const gl = s.glow = new THREE.Mesh(Base.mats.glowGeo, Base.mats.glow); gl.position.y = 0.04; gl.scale.setScalar(def.id === 'fire' ? 13 : 9); gl.renderOrder = 1; grp.add(gl);
  }
  addStationFx(s, grp); grp.position.set(s.cx, 0, s.cz); s.mesh = grp; World.group.add(grp);
  if (def.small) { T.solid[i] = S_SMALL; T.boxes[i] = [x + 0.4, z + 0.4, x + 0.6, z + 0.6]; }
  else if (!def.flat) { T.solid[i] = S_FULL; T.kind[i] = K_BUILT; T.boxes[i] = [x, z, x + 1, z + 1]; World.doorAt[i] = s; if (def.block) T.opaque[i] = 1; }
  Base.structs.push(s); Base.at[i] = s; Flow.dirty = true;
  if (def.gate && sv && sv.open) setGate(s, true);
  return s;
}
function removeStruct(s, broken) {
  const i = idx(s.x, s.z); s.broken = true;
  if (!s.def.flat) { T.solid[i] = 0; T.kind[i] = 0; T.opaque[i] = 0; T.boxes[i] = null; delete World.doorAt[i]; }
  delete Base.at[i]; World.group.remove(s.mesh); const k = Base.structs.indexOf(s); if (k >= 0) Base.structs.splice(k, 1); Flow.dirty = true;
  spawnParts(14, s.cx, 0.6, s.cz, 0, 2, 0, 2.6, 0x7a5a36, 0.8, 0.09);
  if (broken) { SFX.breakW(); if (dist2(s.cx, s.cz, P.x, P.z) < 900) UI.notify('Зруйновано: ' + s.def.n, 'bad'); }
}
function damageStruct(s, dmg) { if (s.broken) return; s.hp -= dmg; s.shake = 1; spawnParts(3, s.cx, 1, s.cz, 0, 1, 0, 1.5, 0x7a5a36, 0.5, 0.05); if (s.hp <= 0) removeStruct(s, true); }
function setGate(s, open) {
  const i = idx(s.x, s.z); s.open = open;
  T.solid[i] = open ? 0 : S_FULL; T.opaque[i] = open ? 0 : 1; T.boxes[i] = open ? null : [s.x, s.z, s.x + 1, s.z + 1]; Flow.dirty = true;
}
/* ── режим будівництва ── */
function buildSelect(def) {
  buildCancel(); Base.sel = def;
  Base.ghost = new THREE.Mesh(structGeo(def.id), Base.mats.ghost); Base.ghost.renderOrder = 3; World.group.add(Base.ghost); Base.ring.visible = true;
}
function buildCancel() { if (Base.ghost) World.group.remove(Base.ghost); Base.ghost = null; Base.sel = null; if (Base.ring) Base.ring.visible = false; }
function canPlace(def, x, z) {
  if (def.id === 'demolish') return structAt(x, z) ? '' : 'Тут нічого розбирати';
  if (!inMap(x, z) || !inBase(x + 0.5, z + 0.5)) return 'Поза межами бази';
  const i = idx(x, z); if (T.solid[i] || T.kind[i] || T.bid[i] || Base.at[i]) return 'Місце зайняте';
  const n = World.nodeAt[i]; if (n && n.alive) return 'Спершу збери те, що тут росте';
  if (!def.flat && dist2(x + 0.5, z + 0.5, P.x, P.z) < 0.55) return 'Відійди з цього місця';
  if (!def.flat && Zs.some(zb => !zb.dead && (zb.x | 0) === x && (zb.z | 0) === z)) return 'Заважає мертвяк';
  if (Base.lv < def.base) return 'Потрібен вищий рівень бази';
  return hasCost(def.cost) ? '' : 'Бракує ресурсів';
}
function tryPlace() {
  const def = Base.sel; if (!def || P.dead) return;
  const why = canPlace(def, Base.gx, Base.gz); if (why) { UI.notify(why, 'bad'); return; }
  if (def.id === 'demolish') {
    const s = structAt(Base.gx, Base.gz); for (const k in s.def.cost) { const q = Math.floor(s.def.cost[k] / 2); if (q) invAdd({ id: k, qty: q }); }
    removeStruct(s, false); SFX.build(); UI.notify('Розібрано: ' + s.def.n + ' (повернуто половину матеріалів)'); return;
  }
  payCost(def.cost); placeStruct(def, Base.gx, Base.gz); SFX.build(); skillXP('craft', 5); addXP(3); Quest.ev('b_' + def.id);
  if (!hasCost(def.cost)) buildCancel();
}
function morningProduce() {
  let n = 0; for (const s of Base.structs) { if (s.id === 'garden') { s.stock = Math.min(4, s.stock + 2); n++; } else if (s.id === 'water') { s.stock = Math.min(3, s.stock + 1); n++; } }
  if (n) UI.notify('База: грядки й збирачі води дали врожай.', 'good');
}
function updateBase(dt) {
  Base.t += dt; const t = Base.t, night = Env.night;
  for (const s of Base.structs) {
    if (s.pop > 0) { s.pop = Math.max(0, s.pop - dt * 3.2); const k = 1 - s.pop, sc = (0.35 + 0.65 * k) * (1 + 0.22 * Math.sin(k * Math.PI)); s.mesh.scale.set(sc, sc, sc); }
    if (s.shake > 0) { s.shake = Math.max(0, s.shake - dt * 4); s.mesh.rotation.z = Math.sin(s.shake * 40) * 0.05 * s.shake; }
    stationFx(s, dt, t);
    if (s.flame) { const f = 1 + Math.sin(t * 13 + s.ph) * 0.14 + Math.sin(t * 29 + s.ph * 2) * 0.08; s.flame.scale.y = (s.id === 'torch' ? 0.6 : 1) * f; s.flame.rotation.y = t * 2 + s.ph; s.glow.material.opacity = 0.16 + night * 0.62; s.glow.scale.setScalar((s.id === 'fire' ? 13 : 9) * (0.96 + 0.05 * f)); }
    if (s.pivot) { const a = s.open ? -Math.PI / 2 : 0; if (s.ang !== a) { s.ang = moveTo(s.ang, a, dt * 6); s.pivot.rotation.y = s.ang; } }
  }
  Base.trapT -= dt;
  if (Base.trapT <= 0) {
    Base.trapT = 0.35;
    for (let k = Base.structs.length - 1; k >= 0; k--) {
      const s = Base.structs[k]; if (s.id !== 'trap') continue;
      for (const z of Zs) { if (z.dead || z.emerge > 0 || dist2(z.x, z.z, s.cx, s.cz) > 0.42) continue; dealDamage(z, 34, { kb: 0.4, dx: 0, dz: 0 }); z.stun = Math.max(z.stun, 0.5); s.hp--; s.shake = 1; SFX.hit(); break; }
      if (s.hp <= 0) removeStruct(s, true);
    }
  }
  if (Base.sel && Base.ghost) {
    Base.gx = Math.floor(Input.aimX); Base.gz = Math.floor(Input.aimZ);
    Base.ghost.position.set(Base.gx + 0.5, 0.02, Base.gz + 0.5); Base.mats.ghost.color.set(canPlace(Base.sel, Base.gx, Base.gz) ? 0xff5a48 : 0x7fe07a);
  }
  if (!P.dead && inBase(P.x, P.z) && P.regenDelay <= 0 && P.hp < maxHP()) {
    let r = (Base.lv - 1) * 0.25; if (Base.structs.some(s => s.id === 'fire' && dist2(s.cx, s.cz, P.x, P.z) < 12)) r += 0.25;
    P.hp = Math.min(maxHP(), P.hp + r * dt);
  }
}
