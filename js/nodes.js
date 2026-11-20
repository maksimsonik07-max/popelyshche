'use strict';
/* ═══════════ ресурсні точки: дерева, валуни, руда, кущі, каміння ═══════════ */
const NM = { fall: [], shaking: [], ducked: [], dkT: 0, regT: 0, a: null, b: null, c: null, d: null, x: null, ax: null, sv: null };

function buildNodeMeshes(root) {
  const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), S = new THREE.Vector3(), V = new THREE.Vector3(), E = new THREE.Euler(), col = new THREE.Color();
  NM.a = new THREE.Matrix4(); NM.b = new THREE.Matrix4(); NM.c = new THREE.Matrix4(); NM.x = new THREE.Matrix4(); NM.ax = new THREE.Vector3(); NM.sv = new THREE.Vector3(); NM.d = new THREE.Matrix4(); NM.fall.length = 0; NM.shaking.length = 0; NM.ducked.length = 0;
  const cnt = { trunk: 0, leaf: 0, pine: 0, rock: 0, bush: 0, dot: 0 };
  for (const n of World.nodes) {
    if (n.type === 'tree') { cnt.trunk++; if (n.kind) cnt.pine += 3; else cnt.leaf += 2; }
    else if (n.type === 'pebble') cnt.rock += 2; else if (n.type === 'rock') cnt.rock++; else if (n.type === 'ore') { cnt.rock++; cnt.dot += 3; }
    else { cnt.bush++; if (n.type === 'berry') cnt.dot += 4; }
  }
  const mk = (geo, mat, c, shadow) => { const im = new THREE.InstancedMesh(geo, mat, Math.max(1, c)); im.count = 0; im.frustumCulled = false; im.castShadow = shadow; im.receiveShadow = true; root.add(im); return im; };
  const trunk = mk(new THREE.CylinderGeometry(0.12, 0.2, 1, 6).translate(0, 0.5, 0), MAT.leaf, cnt.trunk, true);
  const leaf = mk(new THREE.IcosahedronGeometry(1, 0), MAT.leaf, cnt.leaf, true), pine = mk(new THREE.ConeGeometry(1, 1, 7).translate(0, 0.5, 0), MAT.leaf, cnt.pine, true);
  const rock = mk(new THREE.DodecahedronGeometry(0.62, 0), MAT.leaf, cnt.rock, true), bush = mk(new THREE.IcosahedronGeometry(0.5, 0), MAT.leaf, cnt.bush, true), dot = mk(GEO.box, MAT.plain, cnt.dot, false);
  const add = (im, n, hex) => { const i = im.count++; im.setMatrixAt(i, M); if (hex !== undefined) col.set(hex); im.setColorAt(i, col); n.parts.push({ im, i, m: M.clone() }); };
  for (const n of World.nodes) {
    const s = n.s, x = n.cx, z = n.cz, h = n.hue; n.parts.length = 0; Q.identity();
    if (n.type === 'tree') {
      M.compose(V.set(x, 0, z), Q, S.set(s, (n.kind ? 1.2 : 2.0) * s, s)); add(trunk, n, n.v === 2 ? 0x221f1c : 0x4a3a28);
      n.stump = new THREE.Matrix4().compose(V.set(x, 0, z), Q, S.set(s * 1.1, 0.28, s * 1.1));
      if (n.v === 2) { n.burnt = true; } else if (!n.kind) {
        const autumn = h > 0.9 || n.v === 1; col.setHSL(autumn ? 0.08 + h * 0.03 : 0.25 + h * 0.09, autumn ? 0.6 : 0.42, 0.2 + h * 0.1);
        Q.setFromEuler(E.set(h * 3, h * 7, 0)); M.compose(V.set(x, 2.5 * s, z), Q, S.set(1.15 * s, s, 1.15 * s)); add(leaf, n);
        Q.setFromEuler(E.set(h * 5, h * 2, 1)); M.compose(V.set(x + (h - 0.5) * s, 3.3 * s, z + (0.5 - h) * 0.8 * s), Q, S.set(0.8 * s, 0.75 * s, 0.8 * s)); col.offsetHSL(0, 0, 0.03); add(leaf, n);
      } else {
        col.setHSL(0.36 + h * 0.05, 0.38, 0.14 + h * 0.07);
        for (let k = 0; k < 3; k++) { M.compose(V.set(x, (0.9 + k * 1.1) * s, z), Q, S.set((1.15 - k * 0.3) * s, 1.7 * s, (1.15 - k * 0.3) * s)); add(pine, n); }
      }
    } else if (n.type === 'rock' || n.type === 'ore') {
      Q.setFromEuler(E.set(h * 6, h * 9, h * 4)); M.compose(V.set(x, 0.3 * s, z), Q, S.set(s * 0.95, s * 0.82, s * 0.95));
      if (n.type === 'ore') col.setHSL(0.05, 0.42, 0.26 + h * 0.06); else col.setHSL(0.09, 0.05, 0.36 + h * 0.14); add(rock, n);
      if (n.type === 'ore') for (let k = 0; k < 3; k++) { const a = h * 9 + k * 2.1; Q.setFromEuler(E.set(a, a * 2, 0)); M.compose(V.set(x + Math.sin(a) * 0.4 * s, (0.42 + (k % 2) * 0.2) * s, z + Math.cos(a) * 0.4 * s), Q, S.set(0.14, 0.14, 0.14)); add(dot, n, 0xe09a3e); }
    } else if (n.type === 'pebble') {
      for (let k = 0; k < 2; k++) { Q.setFromEuler(E.set(h * 5 + k, h * 8, k * 2)); const r = k ? 0.2 : 0.3; M.compose(V.set(x + (k ? 0.28 : -0.1), r * 0.45, z + (k ? -0.18 : 0.1)), Q, S.set(r, r * 0.75, r)); col.setHSL(0.09, 0.05, 0.42 + h * 0.14); add(rock, n); }
    } else {
      Q.setFromEuler(E.set(0, h * 6, 0)); M.compose(V.set(x, 0.3 * s, z), Q, S.set(1.5 * s, 1.05 * s, 1.5 * s));
      if (n.type === 'berry') col.setHSL(0.31, 0.5, 0.2 + h * 0.06); else col.setHSL(0.22 + h * 0.05, 0.4, 0.22 + h * 0.08); add(bush, n);
      if (n.type === 'berry') for (let k = 0; k < 4; k++) { const a = h * 7 + k * 1.6; Q.identity(); M.compose(V.set(x + Math.sin(a) * 0.5 * s, (0.4 + (k % 2) * 0.22) * s, z + Math.cos(a) * 0.5 * s), Q, S.set(0.1, 0.1, 0.1)); add(dot, n, 0xc2263a); }
    }
  }
  for (const im of [trunk, leaf, pine, rock, bush, dot]) { im.instanceMatrix.needsUpdate = true; if (im.instanceColor) im.instanceColor.needsUpdate = true; }
}
function nodeShow(n, on) {
  NM.a.makeScale(0, 0, 0);
  n.parts.forEach((p, k) => { p.im.setMatrixAt(p.i, on ? partM(n, p, k) : (k === 0 && n.stump ? n.stump : NM.a)); p.im.instanceMatrix.needsUpdate = true; });
}
/* перетворення навколо основи точки: X — обертання чи масштаб */
function nodePivot(n, X) {
  NM.a.makeTranslation(n.cx, 0, n.cz).multiply(X); NM.b.makeTranslation(-n.cx, 0, -n.cz);
  n.parts.forEach((p, k) => { NM.c.copy(NM.a).multiply(NM.b).multiply(partM(n, p, k)); p.im.setMatrixAt(p.i, NM.c); p.im.instanceMatrix.needsUpdate = true; });
}
/* крона дерева, що затуляє гравця від камери, стискається до нуля — видно лише стовбур */
function partM(n, p, k) { if (!k || !n.dk || n.type !== 'tree') return p.m; const s = 1 - n.dk; return NM.d.copy(p.m).scale(NM.sv.set(s, s, s)); }
function updateCanopy(dt, px, pz, yaw) {
  NM.dkT -= dt;
  if (NM.dkT <= 0) {
    NM.dkT = 0.12; for (const n of NM.ducked) n.dkOn = 0;
    const cx = Math.sin(yaw), cz = Math.cos(yaw);
    for (let k = 0; k <= 5; k++) {
      const sx = px + cx * k * 1.1, sz = pz + cz * k * 1.1, r = 1.5 + k * 0.28, x0 = Math.floor(sx - r), x1 = Math.floor(sx + r), z0 = Math.floor(sz - r), z1 = Math.floor(sz + r);
      for (let z = z0; z <= z1; z++) for (let x = x0; x <= x1; x++) {
        if (!inMap(x, z)) continue; const n = World.nodeAt[idx(x, z)];
        if (!n || !n.alive || n.type !== 'tree' || dist2(n.cx, n.cz, sx, sz) > r * r) continue;
        n.dkOn = 1; if (!n.inDk) { n.inDk = true; n.dk = 0; NM.ducked.push(n); }
      }
    }
  }
  for (let i = NM.ducked.length - 1; i >= 0; i--) {
    const n = NM.ducked[i], t = n.alive ? n.dkOn : 0;
    if (!n.alive) { n.dk = 0; n.inDk = false; NM.ducked.splice(i, 1); continue; }
    if (n.dk !== t) { n.dk = moveTo(n.dk, t, dt * 7); if (n.shake <= 0) nodeShow(n, true); }
    else if (t === 0) { n.inDk = false; NM.ducked.splice(i, 1); }
  }
}
function nodeTile(n, solid) {
  const i = idx(n.x, n.z); if (n.def.hand) return;
  T.solid[i] = solid ? (n.type === 'tree' ? S_SMALL : S_FULL) : 0;
  T.boxes[i] = !solid ? null : n.type === 'tree' ? [n.x + 0.34, n.z + 0.34, n.x + 0.66, n.z + 0.66] : [n.x, n.z, n.x + 1, n.z + 1];
  Flow.dirty = true;
}
function killNode(n, silent, dx, dz) {
  n.alive = false; n.hp = 0; n.shake = 0; if (!silent) n.regrow = G.abs + n.def.regrow * rnd(0.85, 1.2);
  nodeTile(n, false);
  if (n.type === 'tree' && !silent) { const l = Math.hypot(dx || 0, dz || 0) || 1; NM.fall.push({ n, t: 0, dx: (dx || 1) / l, dz: (dz || 0) / l }); SFX.fall(); }
  else { nodeShow(n, false); if (!silent) spawnParts(8, n.cx, 0.4, n.cz, 0, 2, 0, 2, n.def.hand && n.type !== 'pebble' ? 0x4f7a34 : 0x8a8780, 0.6, 0.07); }
}
function reviveNode(n) {
  const i = idx(n.x, n.z);
  if (T.solid[i] || T.kind[i] || dist2(n.cx, n.cz, P.x, P.z) < 9 || (typeof structAt === 'function' && structAt(n.x, n.z))) { n.regrow = G.abs + 6; return; }
  n.alive = true; n.hp = n.def.hp || 1; nodeTile(n, true); nodeShow(n, true);
}
function giveNode(n) {
  const def = n.def, out = [], extra = (chance(0.05 * P.skills.gath.l) ? 1 : 0) + (n.type === 'tree' ? perk('lumber') : def.tool === 'mine' ? perk('miner') : 0);
  def.give.forEach((g, k) => { const q = rndi(g[1], g[2]) + (k === 0 ? extra : 0); if (q > 0) { invAdd({ id: g[0], qty: q }); out.push(`+${q} ${ITEMS[g[0]].n}`); } });
  if (def.bonus && chance(def.bonus[1])) { invAdd({ id: def.bonus[0], qty: 1 }); out.push('+1 ' + ITEMS[def.bonus[0]].n); }
  UI.floatText(n.cx, 1.7, n.cz, out.join(' · '), 'res'); addXP(def.hand ? 1 : 3); skillXP('gath', def.hand ? 2 : 5); SFX.pick(); Quest.ev(n.type);
}
/* удар інструментом; повертає true, якщо удар щось дав */
function hitNode(n, w, dx, dz) {
  const def = n.def, d = w ? ITEMS[w.id] : FISTS, pow = (d[def.tool] || 0) * (1 + P.skills.gath.l * 0.06), wood = n.type === 'tree';
  spawnParts(pow ? 6 : 2, n.cx - dx * 0.4, wood ? 1.1 : 0.6, n.cz - dz * 0.4, -dx * 1.5, 1.5, -dz * 1.5, 1.6, wood ? 0xb08a56 : n.type === 'ore' ? 0xa5623a : 0x8f8c84, 0.5, 0.06);
  if (!pow) { SFX.thump(0); if (P.clickCd <= 0) { P.clickCd = 1.2; UI.notify(def.need, 'bad'); } return false; }
  n.hp -= pow; n.shake = 1; if (!NM.shaking.includes(n)) NM.shaking.push(n);
  if (wood) SFX.chop(); else SFX.mine(); skillXP('gath', 1);
  if (n.hp <= 0) { giveNode(n); killNode(n, false, dx, dz); }
  return true;
}
function handGather(n) { if (!n.alive || P.dead) return; P.gatherT = 0.35; giveNode(n); killNode(n, false); }
/* найближча точка перед гравцем у межах удару */
function nodeInFront(range, half) {
  let best = null, bd = 1e9; const px = P.x | 0, pz = P.z | 0;
  for (let dz = -3; dz <= 3; dz++) for (let dx = -3; dx <= 3; dx++) {
    const x = px + dx, z = pz + dz; if (!inMap(x, z)) continue;
    const n = World.nodeAt[idx(x, z)]; if (!n || !n.alive || n.def.hand) continue;
    const ex = n.cx - P.x, ez = n.cz - P.z, d = Math.hypot(ex, ez); if (d > range + 0.55 || d >= bd) continue;
    if (Math.abs(angDiff(Math.atan2(ex, ez), P.rot)) > half + 0.45) continue;
    bd = d; best = n;
  }
  return best;
}
function updateNodes(dt) {
  for (let i = NM.shaking.length - 1; i >= 0; i--) {
    const n = NM.shaking[i]; n.shake -= dt * 3.5;
    if (n.shake <= 0 || !n.alive) { n.shake = 0; if (n.alive) nodeShow(n, true); NM.shaking.splice(i, 1); continue; }
    if (n.type === 'tree') NM.x.makeRotationZ(Math.sin(n.shake * 22) * 0.07 * n.shake); else { const k = 1 - 0.1 * n.shake * Math.abs(Math.sin(n.shake * 18)); NM.x.makeScale(k, k, k); }
    nodePivot(n, NM.x);
  }
  for (let i = NM.fall.length - 1; i >= 0; i--) {
    const f = NM.fall[i]; f.t += dt; const k = Math.min(1, f.t / 0.95);
    NM.x.makeRotationAxis(NM.ax.set(f.dz, 0, -f.dx), k * k * Math.PI * 0.5); nodePivot(f.n, NM.x);
    if (k >= 1) {
      nodeShow(f.n, false); NM.fall.splice(i, 1); const h = 2.6 * f.n.s;
      spawnParts(14, f.n.cx + f.dx * h, 0.4, f.n.cz + f.dz * h, 0, 2.2, 0, 2.6, f.n.kind ? 0x2f5a34 : 0x4f7a34, 0.8, 0.09); camShake(0.12);
    }
  }
  NM.regT -= dt; if (NM.regT > 0) return; NM.regT = 2;
  for (const n of World.nodes) if (!n.alive && n.regrow && G.abs >= n.regrow) reviveNode(n);
}
