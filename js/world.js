'use strict';
/* ═══════════ світ: генерація міста, колізії, меші, освітлення ═══════════ */
const K_WALL = 1, K_WIN = 2, K_DOOR = 3, K_BUILT = 4;
const S_FULL = 1, S_WALL = 2, S_SMALL = 3, S_DOOR = 4;
const NN = MAP * MAP;
const T = { ground: new Uint8Array(NN), solid: new Uint8Array(NN), opaque: new Uint8Array(NN), kind: new Uint8Array(NN), bid: new Int16Array(NN), res: new Uint8Array(NN), boxes: new Array(NN).fill(null) };
const World = { roads: [60, 84, 108, 132], buildings: [], doors: [], doorAt: {}, conts: [], props: [], cars: [], lamps: [], nodes: [], nodeAt: {}, blocks: [], byType: {}, fountains: [], camp: null, core: null, starter: null, lake: null, quarry: null, seed: 1, nStatic: 0, spawn: { x: 60, z: 60 }, tower: null, helipad: null, console: null, canopy: null, group: null, heli: null, mapCanvas: null };
const idx = (x, z) => z * MAP + x;
const inMap = (x, z) => x >= 0 && z >= 0 && x < MAP && z < MAP;
const wallLike = (x, z) => { if (!inMap(x, z)) return false; const k = T.kind[z * MAP + x]; return k > 0 && k < 4; };
const reserve = (x, z) => { if (inMap(x, z)) T.res[z * MAP + x] = 1; };
function setWall(x, z) { const i = idx(x, z); T.kind[i] = K_WALL; T.solid[i] = S_WALL; T.opaque[i] = 1; }
function setWindow(x, z) { const i = idx(x, z); T.kind[i] = K_WIN; T.solid[i] = S_WALL; T.opaque[i] = 0; }
function setGap(x, z) { const i = idx(x, z); T.kind[i] = 0; T.solid[i] = 0; T.opaque[i] = 0; T.res[i] = 1; }
function fillGround(x, z, w, h, g) { for (let dz = 0; dz < h; dz++) for (let dx = 0; dx < w; dx++) { const X = x + dx, Z = z + dz; if (inMap(X, Z) && !T.bid[idx(X, Z)]) T.ground[idx(X, Z)] = g; } }

/* ───────── генерація ───────── */
function addDoor(b, x, z) {
  const i = idx(x, z); T.kind[i] = K_DOOR; T.solid[i] = 0; T.opaque[i] = 0; T.res[i] = 1;
  const d = { x, z, cx: x + 0.5, cz: z + 0.5, alongX: true, open: true, hp: 70, maxHp: 70, b, pivot: null, base: 0, ang: 0, shake: 0, broken: false };
  World.doors.push(d); World.doorAt[i] = d; b.doors.push(d); return d;
}
function setDoor(d, open) {
  if (d.broken) return;
  d.open = open; const i = idx(d.x, d.z);
  T.solid[i] = open ? 0 : S_DOOR; T.opaque[i] = open ? 0 : 1;
  T.boxes[i] = open ? null : (d.alongX ? [d.x, d.z + 0.42, d.x + 1, d.z + 0.58] : [d.x + 0.42, d.z, d.x + 0.58, d.z + 1]);
  Flow.dirty = true;
}
function breakDoor(d) {
  d.broken = true; d.open = true; const i = idx(d.x, d.z);
  T.solid[i] = 0; T.opaque[i] = 0; T.boxes[i] = null; Flow.dirty = true;
  if (d.pivot) d.pivot.visible = false;
}

function makeBuilding(type, x0, z0, w, h, ents) {
  const def = BTYPES[type];
  const b = { id: World.buildings.length + 1, type, def, x0, z0, w, h, x1: x0 + w - 1, z1: z0 + h - 1, doors: [], ents: [], cut: 0, wallCol: pick(def.walls), roofCol: pick(def.roofs), group: null, roof: null, roofMat: null };
  World.buildings.push(b);
  (World.byType[type] = World.byType[type] || []).push(b);
  for (let z = z0; z <= b.z1; z++) for (let x = x0; x <= b.x1; x++) {
    const i = idx(x, z); T.bid[i] = b.id; T.ground[i] = def.floor; T.res[i] = 0;
    if (x === x0 || x === b.x1 || z === z0 || z === b.z1) setWall(x, z);
  }
  for (const e of ents) {
    const horiz = e.side === 0 || e.side === 2, len = horiz ? w : h, wd = e.width || 1;
    const a0 = rndi(2, Math.max(2, len - 2 - wd));
    const nx = e.side === 1 ? 1 : e.side === 3 ? -1 : 0, nz = e.side === 2 ? 1 : e.side === 0 ? -1 : 0;
    for (let k = 0; k < wd; k++) {
      const x = horiz ? x0 + a0 + k : (e.side === 3 ? x0 : b.x1), z = horiz ? (e.side === 0 ? z0 : b.z1) : z0 + a0 + k;
      if (e.kind === 'door') addDoor(b, x, z); else setGap(x, z);
      reserve(x - nx, z - nz); reserve(x - 2 * nx, z - 2 * nz); reserve(x + nx, z + nz);
      b.ents.push({ x, z, side: e.side, nx, nz });
    }
  }
  if (def.win) {
    const tryWin = (x, z, ax, az) => {
      if (T.kind[idx(x, z)] !== K_WALL) return;
      if (T.kind[idx(x - ax, z - az)] !== K_WALL || T.kind[idx(x + ax, z + az)] !== K_WALL) return;
      setWindow(x, z);
    };
    for (let k = 2; k < w - 2; k++) if ((k - 2) % def.win === 0) { tryWin(x0 + k, z0, 1, 0); tryWin(x0 + k, b.z1, 1, 0); }
    for (let k = 2; k < h - 2; k++) if ((k - 2) % def.win === 0) { tryWin(x0, z0 + k, 0, 1); tryWin(b.x1, z0 + k, 0, 1); }
  }
  const rooms = def.rooms || 1;
  if (rooms > 1) {
    const alongX = w >= h, L = alongX ? w : h;
    for (let r = 1; r < rooms; r++) {
      let p = Math.round(L * r / rooms);
      const bad = q => b.ents.some(e => alongX ? ((e.side === 0 || e.side === 2) && e.x === x0 + q) : ((e.side === 1 || e.side === 3) && e.z === z0 + q));
      while (bad(p)) p++;
      if (p < 3 || p > L - 4) continue;
      const lo = alongX ? z0 + 1 : x0 + 1, hi = alongX ? b.z1 - 1 : b.x1 - 1, gap = rndi(lo, hi);
      for (let a = lo; a <= hi; a++) {
        const x = alongX ? x0 + p : a, z = alongX ? a : z0 + p;
        if (a === gap) {
          T.res[idx(x, z)] = 1;
          if (alongX) { reserve(x - 1, z); reserve(x + 1, z); reserve(x - 2, z); reserve(x + 2, z); }
          else { reserve(x, z - 1); reserve(x, z + 1); reserve(x, z - 2); reserve(x, z + 2); }
          continue;
        }
        setWall(x, z);
      }
    }
  }
  return b;
}

function addCont(b, kind, x, z, rot) {
  const loot = !!CONT[kind];
  const c = { kind, name: loot ? CONT[kind].n : (PROP_NAMES[kind] || ''), loot, x, z, cx: x + 0.5, cz: z + 0.5, rot, items: null, searched: false, bid: b ? b.id : 0, mesh: null, radius: 1.75, quest: null };
  T.solid[idx(x, z)] = S_FULL;
  (loot ? World.conts : World.props).push(c);
  return c;
}
function wallTiles(b) {
  const out = [];
  for (let z = b.z0 + 1; z < b.z1; z++) for (let x = b.x0 + 1; x < b.x1; x++) {
    const i = idx(x, z); if (T.kind[i] || T.solid[i] || T.res[i]) continue;
    let rot = null;
    if (T.kind[idx(x, z - 1)] === K_WALL) rot = 0; else if (T.kind[idx(x, z + 1)] === K_WALL) rot = Math.PI;
    else if (T.kind[idx(x - 1, z)] === K_WALL) rot = Math.PI / 2; else if (T.kind[idx(x + 1, z)] === K_WALL) rot = -Math.PI / 2;
    if (rot !== null) out.push([x, z, rot]);
  }
  return shuffle(out);
}
function placeConts(b, list) {
  const tiles = wallTiles(b), placed = [];
  for (const kind of list) {
    while (tiles.length) {
      const [x, z, rot] = tiles.pop();
      if (T.solid[idx(x, z)]) continue;
      if (T.solid[idx(x - 1, z)] === S_FULL || T.solid[idx(x + 1, z)] === S_FULL || T.solid[idx(x, z - 1)] === S_FULL || T.solid[idx(x, z + 1)] === S_FULL) continue;
      placed.push(addCont(b, kind, x, z, rot)); break;
    }
  }
  return placed;
}
function placeRows(b, kind, stock, step) {
  const mid = b.x0 + (b.w >> 1);
  for (let z = b.z0 + 2; z <= b.z1 - 2; z += step) for (let x = b.x0 + 2; x <= b.x1 - 2; x++) {
    if (x === mid || x === mid - 1) continue;
    const i = idx(x, z); if (T.solid[i] || T.res[i] || T.kind[i]) continue;
    const c = addCont(b, kind, x, z, 0);
    if (!chance(stock)) { c.items = []; c.searched = true; }
  }
}
function addCar(x, z, vert, style) {
  const w = vert ? 2 : 4, l = vert ? 4 : 2;
  for (let dz = 0; dz < l; dz++) for (let dx = 0; dx < w; dx++) {
    const X = x + dx, Z = z + dz; if (!inMap(X, Z)) return null;
    const i = idx(X, Z); if (T.solid[i] || T.res[i] || T.bid[i] || T.kind[i]) return null;
  }
  for (let dz = 0; dz < l; dz++) for (let dx = 0; dx < w; dx++) T.solid[idx(x + dx, z + dz)] = S_FULL;
  const car = { x, z, vert, cx: x + w / 2, cz: z + l / 2, style: style || 'civil', color: pick([0x8a2f2a, 0x2f4f7a, 0x8a8f94, 0x3d5a3a, 0xc9c4b4, 0x2a2c30, 0xb07a2a, 0x5a3a5a]), rot: (vert ? 0 : Math.PI / 2) + rnd(-0.05, 0.05) + (chance(0.5) ? Math.PI : 0) };
  World.cars.push(car);
  if (chance(0.75)) World.conts.push({ kind: 'car', name: CONT.car.n, loot: true, x: -1, z: -1, cx: car.cx, cz: car.cz, rot: 0, items: null, searched: false, bid: 0, mesh: null, radius: 2.8, quest: null });
  return car;
}
function pathFrom(x, z, dx, dz) {
  let n = 0; x += dx; z += dz;
  while (inMap(x, z) && n < 14) {
    const i = idx(x, z);
    if (T.ground[i] === G_GRASS) { T.ground[i] = G_DIRT; T.res[i] = 1; } else if (!T.bid[i]) break;
    x += dx; z += dz; n++;
  }
}
function quadBuildings(bl, type) {
  for (let q = 0; q < 4; q++) {
    const east = q % 2 === 1, south = q >= 2, w = rndi(6, 7), h = rndi(6, 7);
    const qx = bl.x + (east ? 9 : 0), qz = bl.z + (south ? 9 : 0);
    const x0 = east ? qx + 8 - w : qx + 1, z0 = south ? qz + 8 - h : qz + 1;
    const side = chance(0.5) ? (east ? 1 : 3) : (south ? 2 : 0);
    const b = makeBuilding(type, x0, z0, w, h, [{ side, kind: 'door' }]);
    bl.builds.push(b);
    for (const e of b.ents) pathFrom(e.x, e.z, e.nx, e.nz);
    if (type === 'house') placeConts(b, shuffle(['fridge', 'cabinet', 'wardrobe', 'drawer']).slice(0, rndi(3, 4)).concat(shuffle(['bed', 'table', 'sofa']).slice(0, 2)));
    else placeConts(b, pick([['shelf', 'shelf', 'shelf', 'fridge', 'counter'], ['toolshelf', 'toolshelf', 'crate', 'crate', 'counter'], ['wardrobe', 'wardrobe', 'wardrobe', 'drawer', 'counter'], ['medcab', 'medcab', 'shelf', 'drawer', 'counter']]));
  }
}
function genBlock(bl) {
  const x = bl.x, z = bl.z;
  switch (bl.type) {
    case 'house': quadBuildings(bl, 'house'); break;
    case 'shops': fillGround(x, z, 18, 18, G_SIDEWALK); quadBuildings(bl, 'shop'); break;
    case 'police': {
      fillGround(x, z + 12, 18, 6, G_CONCRETE);
      const b = makeBuilding('police', x + 2, z + 2, 14, 10, [{ side: 2, kind: 'door' }, { side: 0, kind: 'door' }]); bl.builds.push(b);
      placeConts(b, ['gunlocker', 'gunlocker', 'gunlocker', 'desk', 'desk', 'desk', 'medcab', 'drawer', 'table']);
      addCar(x + 1, z + 13, true, 'police'); addCar(x + 5, z + 13, true, 'police'); addCar(x + 13, z + 14, false, 'police');
      break;
    }
    case 'clinic': {
      fillGround(x, z + 12, 18, 6, G_CONCRETE);
      const b = makeBuilding('clinic', x + 3, z + 3, 12, 9, [{ side: 2, kind: 'door' }]); bl.builds.push(b);
      placeConts(b, ['medcab', 'medcab', 'medcab', 'medcab', 'medcab', 'desk', 'desk', 'drawer', 'bed', 'bed']);
      addCar(x + 2, z + 13, false, 'ambulance'); addCar(x + 12, z + 13, true);
      break;
    }
    case 'workshop': {
      fillGround(x, z, 18, 18, G_CONCRETE);
      const b = makeBuilding('workshop', x + 2, z + 2, 13, 9, [{ side: 2, kind: 'open', width: 3 }, { side: 1, kind: 'door' }]); bl.builds.push(b);
      placeConts(b, ['toolshelf', 'toolshelf', 'toolshelf', 'toolshelf', 'crate', 'crate', 'crate', 'crate', 'desk']);
      addCar(x + 2, z + 13, true); addCar(x + 8, z + 14, false); addCar(x + 14, z + 12, true);
      break;
    }
    case 'market': {
      fillGround(x, z + 12, 18, 6, G_CONCRETE);
      const b = makeBuilding('market', x + 1, z + 1, 16, 11, [{ side: 2, kind: 'open', width: 2 }]); bl.builds.push(b);
      placeRows(b, 'shelf', 0.4, 3);
      placeConts(b, ['fridge', 'fridge', 'fridge', 'counter', 'counter', 'desk']);
      addCar(x + 1, z + 13, true); addCar(x + 6, z + 13, true); addCar(x + 12, z + 14, false);
      break;
    }
    case 'warehouse': {
      fillGround(x, z, 18, 18, G_CONCRETE);
      const b = makeBuilding('warehouse', x + 2, z + 2, 14, 11, [{ side: 2, kind: 'open', width: 3 }, { side: 0, kind: 'door' }]); bl.builds.push(b);
      placeRows(b, 'crate', 0.45, 3);
      placeConts(b, ['toolshelf', 'toolshelf', 'desk']);
      addCar(x + 3, z + 14, false); addCar(x + 12, z + 13, true);
      break;
    }
    case 'gas': {
      fillGround(x, z, 18, 18, G_CONCRETE);
      const b = makeBuilding('gas', x + 10, z + 2, 7, 6, [{ side: 3, kind: 'door' }]); bl.builds.push(b);
      placeConts(b, ['shelf', 'shelf', 'shelf', 'fridge', 'desk', 'counter']);
      World.canopy = { x: x + 1, z: z + 3, w: 7, h: 9 };
      for (const [px, pz] of [[x + 1, z + 3], [x + 7, z + 3], [x + 1, z + 11], [x + 7, z + 11]]) { T.solid[idx(px, pz)] = S_SMALL; T.res[idx(px, pz)] = 1; }
      World.props.push(addContProp('pump', x + 4, z + 5), addContProp('pump', x + 4, z + 9));
      addCar(x + 5, z + 4, true); addCar(x + 2, z + 8, true); addCar(x + 11, z + 12, false);
      break;
    }
    case 'park': {
      for (let k = 0; k < 18; k++) for (const o of [8, 9]) { T.ground[idx(x + o, z + k)] = G_DIRT; T.res[idx(x + o, z + k)] = 1; T.ground[idx(x + k, z + o)] = G_DIRT; T.res[idx(x + k, z + o)] = 1; }
      for (let dz = 6; dz <= 11; dz++) for (let dx = 6; dx <= 11; dx++) { const i = idx(x + dx, z + dz); T.ground[i] = G_DIRT; T.res[i] = 1; if (dx >= 8 && dx <= 9 && dz >= 8 && dz <= 9) T.solid[i] = S_FULL; }
      World.fountains.push({ cx: x + 9, cz: z + 9 });
      addCont(null, 'bench', x + 7, z + 3, Math.PI / 2); addCont(null, 'bench', x + 10, z + 14, -Math.PI / 2);
      addCont(null, 'bench', x + 3, z + 10, Math.PI); addCont(null, 'bench', x + 14, z + 7, 0);
      break;
    }
    case 'tower': {
      fillGround(x + 2, z + 2, 7, 7, G_CONCRETE);
      for (let dz = 1; dz <= 9; dz++) for (let dx = 1; dx <= 9; dx++) reserve(x + dx, z + dz);
      for (let dz = 9; dz <= 16; dz++) for (let dx = 8; dx <= 16; dx++) reserve(x + dx, z + dz);
      World.helipad = { cx: x + 5.5, cz: z + 5.5 };
      for (let dz = 11; dz <= 12; dz++) for (let dx = 11; dx <= 12; dx++) T.solid[idx(x + dx, z + dz)] = S_FULL;
      World.tower = { cx: x + 12, cz: z + 12 };
      const c = addCont(null, 'console', x + 11, z + 14, 0); World.console = c;
      const b = makeBuilding('shed', x + 13, z + 2, 5, 5, [{ side: 3, kind: 'door' }]); bl.builds.push(b);
      placeConts(b, ['crate', 'desk', 'toolshelf']);
      break;
    }
  }
}
function addContProp(kind, x, z) {
  T.solid[idx(x, z)] = S_FULL; T.res[idx(x, z)] = 1;
  return { kind, name: '', loot: false, x, z, cx: x + 0.5, cz: z + 0.5, rot: 0, bid: 0, mesh: null };
}
function blockAt(x, z) { for (const bl of World.blocks) if (x >= bl.x && x < bl.x + 18 && z >= bl.z && z < bl.z + 18) return bl; return null; }

function wallSegs(x, z) {
  const a = [x + 0.3, z + 0.3, x + 0.7, z + 0.7];
  if (wallLike(x - 1, z)) a.push(x, z + 0.3, x + 0.3, z + 0.7);
  if (wallLike(x + 1, z)) a.push(x + 0.7, z + 0.3, x + 1, z + 0.7);
  if (wallLike(x, z - 1)) a.push(x + 0.3, z, x + 0.7, z + 0.3);
  if (wallLike(x, z + 1)) a.push(x + 0.3, z + 0.7, x + 0.7, z + 1);
  return a;
}
function computeBoxes() {
  for (let z = 0; z < MAP; z++) for (let x = 0; x < MAP; x++) {
    const i = idx(x, z), s = T.solid[i];
    if (s === S_FULL) T.boxes[i] = [x, z, x + 1, z + 1];
    else if (s === S_SMALL) T.boxes[i] = [x + 0.34, z + 0.34, x + 0.66, z + 0.66];
    else if (s === S_WALL) T.boxes[i] = wallSegs(x, z);
    else T.boxes[i] = null;
  }
  for (const d of World.doors) setDoor(d, d.open);
}

/* ───────── колізії, промені, поле шляху ───────── */
function collide(o, r) {
  const x0 = Math.floor(o.x - r), x1 = Math.floor(o.x + r), z0 = Math.floor(o.z - r), z1 = Math.floor(o.z + r), r2 = r * r;
  for (let tz = z0; tz <= z1; tz++) for (let tx = x0; tx <= x1; tx++) {
    if (!inMap(tx, tz)) continue;
    const b = T.boxes[tz * MAP + tx]; if (!b) continue;
    for (let k = 0; k < b.length; k += 4) {
      const cx = clamp(o.x, b[k], b[k + 2]), cz = clamp(o.z, b[k + 1], b[k + 3]);
      const dx = o.x - cx, dz = o.z - cz, d2 = dx * dx + dz * dz;
      if (d2 >= r2) continue;
      if (d2 > 1e-8) { const d = Math.sqrt(d2), p = (r - d) / d; o.x += dx * p; o.z += dz * p; }
      else {
        const l = o.x - b[k], rr = b[k + 2] - o.x, t = o.z - b[k + 1], bb = b[k + 3] - o.z, m = Math.min(l, rr, t, bb);
        if (m === l) o.x = b[k] - r; else if (m === rr) o.x = b[k + 2] + r; else if (m === t) o.z = b[k + 1] - r; else o.z = b[k + 3] + r;
      }
    }
  }
  o.x = clamp(o.x, 1.5, MAP - 1.5); o.z = clamp(o.z, 1.5, MAP - 1.5);
}
/* mode 0 — перешкоди для зору й куль; mode 1 — перешкоди для ходьби */
function rayGrid(x, z, dx, dz, maxD, mode) {
  let tx = Math.floor(x), tz = Math.floor(z);
  const sx = dx > 0 ? 1 : -1, sz = dz > 0 ? 1 : -1;
  const ddx = dx !== 0 ? Math.abs(1 / dx) : 1e9, ddz = dz !== 0 ? Math.abs(1 / dz) : 1e9;
  let mx = dx !== 0 ? (dx > 0 ? tx + 1 - x : x - tx) * ddx : 1e9, mz = dz !== 0 ? (dz > 0 ? tz + 1 - z : z - tz) * ddz : 1e9, t = 0;
  for (let n = 0; n < 200; n++) {
    if (mx < mz) { t = mx; mx += ddx; tx += sx; } else { t = mz; mz += ddz; tz += sz; }
    if (t >= maxD) return maxD;
    if (!inMap(tx, tz)) return t;
    const i = tz * MAP + tx;
    if (mode ? (T.solid[i] === S_WALL || T.solid[i] === S_DOOR || T.solid[i] === S_FULL) : T.opaque[i]) return t;
  }
  return maxD;
}
function hasLOS(ax, az, bx, bz, mode) {
  const dx = bx - ax, dz = bz - az, d = Math.hypot(dx, dz); if (d < 0.01) return true;
  return rayGrid(ax, az, dx / d, dz / d, d, mode || 0) >= d - 0.001;
}
const Flow = { dist: new Int16Array(NN), open: new Int16Array(NN), q: new Int32Array(NN), dirty: true, px: -1, pz: -1, out: { x: 0, z: 0, door: null } };
const passable = i => T.solid[i] === 0 || T.kind[i] === K_DOOR || T.kind[i] === K_BUILT;
const walkable = i => T.solid[i] === 0;
function bfs(d, s, pass) {
  const q = Flow.q; let h = 0, t = 0; q[t++] = s; d[s] = 0;
  while (h < t) {
    const i = q[h++], dd = d[i]; if (dd >= 90) continue;
    const x = i % MAP, z = (i / MAP) | 0; let j;
    if (x > 0) { j = i - 1; if (d[j] < 0 && pass(j)) { d[j] = dd + 1; q[t++] = j; } }
    if (x < MAP - 1) { j = i + 1; if (d[j] < 0 && pass(j)) { d[j] = dd + 1; q[t++] = j; } }
    if (z > 0) { j = i - MAP; if (d[j] < 0 && pass(j)) { d[j] = dd + 1; q[t++] = j; } }
    if (z < MAP - 1) { j = i + MAP; if (d[j] < 0 && pass(j)) { d[j] = dd + 1; q[t++] = j; } }
  }
}
function computeFlow(px, pz) {
  let sx = Math.floor(px), sz = Math.floor(pz);
  Flow.dist.fill(-1); Flow.open.fill(-1); Flow.dirty = false; Flow.px = sx; Flow.pz = sz;
  if (!inMap(sx, sz)) return;
  if (!passable(idx(sx, sz))) {
    let ok = false;
    for (let dz = -1; dz <= 1 && !ok; dz++) for (let dx = -1; dx <= 1 && !ok; dx++) { const X = sx + dx, Z = sz + dz; if (inMap(X, Z) && passable(idx(X, Z))) { sx = X; sz = Z; ok = true; } }
    if (!ok) return;
  }
  bfs(Flow.dist, idx(sx, sz), passable);
  if (walkable(idx(sx, sz))) bfs(Flow.open, idx(sx, sz), walkable);
}
function flowStep(x, z) {
  const cx = Math.floor(x), cz = Math.floor(z); if (!inMap(cx, cz)) return null;
  const ci = idx(cx, cz), d = Flow.open[ci] >= 0 ? Flow.open : Flow.dist, here = d[ci];
  let bd = here < 0 ? 30000 : here, bx = -1, bz = -1;
  for (let dz = -1; dz <= 1; dz++) for (let dx = -1; dx <= 1; dx++) {
    if (!dx && !dz) continue;
    const nx = cx + dx, nz = cz + dz; if (!inMap(nx, nz)) continue;
    const dd = d[idx(nx, nz)]; if (dd < 0) continue;
    if (dx && dz && (d[idx(cx + dx, cz)] < 0 || d[idx(cx, cz + dz)] < 0)) continue;
    const cost = dd + (dx && dz ? 0.4 : 0);
    if (cost < bd) { bd = cost; bx = nx; bz = nz; }
  }
  if (bx < 0) return null;
  const o = Flow.out, i = idx(bx, bz); o.x = bx + 0.5; o.z = bz + 0.5;
  o.door = (T.solid[i] === S_DOOR || (T.kind[i] === K_BUILT && T.solid[i])) ? World.doorAt[i] : null;
  if (!o.door && T.solid[ci] === S_DOOR) o.door = World.doorAt[ci];
  return o;
}
function randomFreeTile(tries, test) {
  for (let n = 0; n < tries; n++) {
    const x = rndi(3, MAP - 4), z = rndi(3, MAP - 4), i = idx(x, z);
    if (T.solid[i] || T.kind[i]) continue;
    if (!test || test(x, z)) return [x, z];
  }
  return null;
}

/* ───────── спільні ресурси рендеру ───────── */
const GEO = {}, TEX = {}, MAT = {};
const _cc = {}, _lm = {};
const C = h => _cc[h] || (_cc[h] = new THREE.Color(h));
const LM = h => _lm[h] || (_lm[h] = new THREE.MeshLambertMaterial({ color: h }));
function part(parent, w, h, d, x, y, z, mat) {
  const m = new THREE.Mesh(GEO.box, mat); m.scale.set(w, h, d); m.position.set(x, y, z);
  m.castShadow = true; m.receiveShadow = true; parent.add(m); return m;
}
function beam(parent, a, b, th, mat) {
  const d = new THREE.Vector3().subVectors(b, a), len = d.length(), m = new THREE.Mesh(GEO.box, mat);
  m.scale.set(th, len, th); m.position.copy(a).addScaledVector(d, 0.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); m.castShadow = true; parent.add(m); return m;
}
class GB {
  constructor() { this.p = []; this.n = []; this.u = []; this.c = []; this.i = []; this.v = 0; }
  _v(x, y, z, nx, ny, nz, u, v, c) { this.p.push(x, y, z); this.n.push(nx, ny, nz); this.u.push(u, v); this.c.push(c.r, c.g, c.b); return this.v++; }
  _q(a) { this.i.push(a, a + 1, a + 2, a, a + 2, a + 3); }
  /* faces: +X=1 −X=2 +Y=4 −Y=8 +Z=16 −Z=32 */
  box(x0, y0, z0, x1, y1, z1, c, s, f) {
    if (s === undefined) s = 0.5; if (f === undefined) f = 55; let a;
    if (f & 1) { a = this._v(x1, y0, z1, 1, 0, 0, z1 * s, y0 * s, c); this._v(x1, y0, z0, 1, 0, 0, z0 * s, y0 * s, c); this._v(x1, y1, z0, 1, 0, 0, z0 * s, y1 * s, c); this._v(x1, y1, z1, 1, 0, 0, z1 * s, y1 * s, c); this._q(a); }
    if (f & 2) { a = this._v(x0, y0, z0, -1, 0, 0, z0 * s, y0 * s, c); this._v(x0, y0, z1, -1, 0, 0, z1 * s, y0 * s, c); this._v(x0, y1, z1, -1, 0, 0, z1 * s, y1 * s, c); this._v(x0, y1, z0, -1, 0, 0, z0 * s, y1 * s, c); this._q(a); }
    if (f & 4) { a = this._v(x0, y1, z1, 0, 1, 0, x0 * s, z1 * s, c); this._v(x1, y1, z1, 0, 1, 0, x1 * s, z1 * s, c); this._v(x1, y1, z0, 0, 1, 0, x1 * s, z0 * s, c); this._v(x0, y1, z0, 0, 1, 0, x0 * s, z0 * s, c); this._q(a); }
    if (f & 8) { a = this._v(x0, y0, z0, 0, -1, 0, x0 * s, z0 * s, c); this._v(x1, y0, z0, 0, -1, 0, x1 * s, z0 * s, c); this._v(x1, y0, z1, 0, -1, 0, x1 * s, z1 * s, c); this._v(x0, y0, z1, 0, -1, 0, x0 * s, z1 * s, c); this._q(a); }
    if (f & 16) { a = this._v(x0, y0, z1, 0, 0, 1, x0 * s, y0 * s, c); this._v(x1, y0, z1, 0, 0, 1, x1 * s, y0 * s, c); this._v(x1, y1, z1, 0, 0, 1, x1 * s, y1 * s, c); this._v(x0, y1, z1, 0, 0, 1, x0 * s, y1 * s, c); this._q(a); }
    if (f & 32) { a = this._v(x1, y0, z0, 0, 0, -1, x1 * s, y0 * s, c); this._v(x0, y0, z0, 0, 0, -1, x0 * s, y0 * s, c); this._v(x0, y1, z0, 0, 0, -1, x0 * s, y1 * s, c); this._v(x1, y1, z0, 0, 0, -1, x1 * s, y1 * s, c); this._q(a); }
  }
  quadY(x0, z0, x1, z1, y, s, s00, s10, s11, s01) {
    const b = this.v;
    this.p.push(x0, y, z1, x1, y, z1, x1, y, z0, x0, y, z0); this.n.push(0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0);
    this.u.push(x0 * s, z1 * s, x1 * s, z1 * s, x1 * s, z0 * s, x0 * s, z0 * s);
    this.c.push(s01, s01, s01, s11, s11, s11, s10, s10, s10, s00, s00, s00); this.v += 4; this._q(b);
  }
  poly(pts, c, mode) {
    const a = pts[0], b = pts[1], d = pts[2];
    const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = d[0] - a[0], vy = d[1] - a[1], vz = d[2] - a[2];
    let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx; const l = Math.hypot(nx, ny, nz) || 1; nx /= l; ny /= l; nz /= l;
    const base = this.v;
    for (const p of pts) {
      let u = 0.03, v = 0.03;
      if (mode === 0) { u = p[0] * 0.5; v = (p[2] + p[1]) * 0.5; } else if (mode === 1) { u = p[2] * 0.5; v = (p[0] + p[1]) * 0.5; }
      this._v(p[0], p[1], p[2], nx, ny, nz, u, v, c);
    }
    for (let k = 1; k < pts.length - 1; k++) this.i.push(base, base + k, base + k + 1);
  }
  build() {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.p, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(this.n, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(this.u, 2));
    g.setAttribute('color', new THREE.Float32BufferAttribute(this.c, 3));
    g.setIndex(this.i); return g;
  }
}
function hash2(x, z) { let h = (Math.imul(x, 374761393) + Math.imul(z, 668265263)) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967295; }
function vnoise(x, z) {
  const xi = Math.floor(x), zi = Math.floor(z), fx = x - xi, fz = z - zi, u = fx * fx * (3 - 2 * fx), v = fz * fz * (3 - 2 * fz);
  const a = hash2(xi, zi), b = hash2(xi + 1, zi), c = hash2(xi, zi + 1), d = hash2(xi + 1, zi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
function ctex(size, fn, noRepeat) {
  const c = document.createElement('canvas'); c.width = c.height = size; fn(c.getContext('2d'), size);
  const t = new THREE.CanvasTexture(c);
  if (!noRepeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = TEX.aniso || 4; return t;
}
function speck(g, s, n, cols, amin, amax, smax) {
  for (let i = 0; i < n; i++) { g.globalAlpha = amin + Math.random() * (amax - amin); g.fillStyle = cols[(Math.random() * cols.length) | 0]; const w = 1 + Math.random() * smax; g.fillRect(Math.random() * s, Math.random() * s, w, w); }
  g.globalAlpha = 1;
}
function initShared(renderer) {
  GEO.box = new THREE.BoxGeometry(1, 1, 1);
  GEO.door = new THREE.BoxGeometry(0.94, 2.2, 0.09);
  GEO.plane = new THREE.PlaneGeometry(1, 1);
  TEX.aniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  TEX.grass = ctex(512, (g, s) => {
    g.fillStyle = '#4b6933'; g.fillRect(0, 0, s, s);
    speck(g, s, 9000, ['#3e5a29', '#5a7a3b', '#688a42', '#35501f', '#52702f'], 0.25, 0.8, 3);
    g.strokeStyle = 'rgba(128,156,74,.4)'; g.lineWidth = 1;
    for (let i = 0; i < 800; i++) { const x = Math.random() * s, y = Math.random() * s; g.beginPath(); g.moveTo(x, y); g.lineTo(x + rnd(-2, 2), y - rnd(3, 7)); g.stroke(); }
  });
  TEX.asphalt = ctex(512, (g, s) => {
    g.fillStyle = '#3a3b3e'; g.fillRect(0, 0, s, s);
    speck(g, s, 14000, ['#2c2d30', '#47484c', '#55565a', '#232426', '#4d4e52'], 0.2, 0.7, 2.5);
    g.strokeStyle = 'rgba(15,15,16,.7)'; g.lineWidth = 1.5;
    for (let i = 0; i < 7; i++) { let x = rnd(60, s - 60), y = rnd(60, s - 60); g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 6; k++) { x += rnd(-22, 22); y += rnd(-22, 22); g.lineTo(clamp(x, 8, s - 8), clamp(y, 8, s - 8)); } g.stroke(); }
    for (let i = 0; i < 5; i++) { g.fillStyle = 'rgba(90,90,96,.12)'; g.fillRect(rnd(20, s - 120), rnd(20, s - 100), rnd(40, 100), rnd(30, 80)); }
  });
  TEX.sidewalk = ctex(256, (g, s) => {
    g.fillStyle = '#8d8c86'; g.fillRect(0, 0, s, s); speck(g, s, 3500, ['#7c7b75', '#9a9993', '#6e6d68', '#a5a49e'], 0.2, 0.6, 2);
    g.fillStyle = '#5f5e59'; for (const p of [0, 128]) { g.fillRect(p - 1.5, 0, 3, s); g.fillRect(0, p - 1.5, s, 3); } g.fillRect(s - 1.5, 0, 3, s); g.fillRect(0, s - 1.5, s, 3);
  });
  TEX.wood = ctex(256, (g, s) => {
    for (let r = 0; r < 8; r++) {
      let x = (r * 77) % 96 - 96;
      while (x < s) { const len = 96 + ((r * 31 + x) % 64 + 64) % 64, v = rnd(-12, 12); g.fillStyle = `rgb(${142 + v},${108 + v},${70 + v})`; g.fillRect(x, r * 32, len, 32); g.fillStyle = 'rgba(40,25,10,.55)'; g.fillRect(x, r * 32, 1.5, 32); x += len; }
      g.fillStyle = 'rgba(40,25,10,.5)'; g.fillRect(0, r * 32, s, 1.5);
    }
    g.strokeStyle = 'rgba(60,40,20,.18)'; g.lineWidth = 1;
    for (let i = 0; i < 160; i++) { const y = Math.random() * s, x = Math.random() * s; g.beginPath(); g.moveTo(x, y); g.lineTo(x + rnd(20, 60), y + rnd(-1, 1)); g.stroke(); }
  });
  TEX.tile = ctex(256, (g, s) => {
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) { g.fillStyle = (r + c) % 2 ? '#c3c9c7' : '#d8d8d1'; g.fillRect(c * 64, r * 64, 64, 64); }
    speck(g, s, 1500, ['#a8aeac', '#e4e4de'], 0.1, 0.3, 2);
    g.fillStyle = '#93938d'; for (let k = 0; k <= 4; k++) { g.fillRect(k * 64 - 1, 0, 2, s); g.fillRect(0, k * 64 - 1, s, 2); }
  });
  TEX.concrete = ctex(512, (g, s) => {
    g.fillStyle = '#7c7d7e'; g.fillRect(0, 0, s, s);
    for (let i = 0; i < 40; i++) { const x = rnd(40, s - 40), y = rnd(40, s - 40), r = rnd(20, 60), gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, chance(0.5) ? 'rgba(40,40,42,.14)' : 'rgba(170,170,172,.12)'); gr.addColorStop(1, 'rgba(120,120,120,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); }
    speck(g, s, 9000, ['#6a6b6c', '#8c8d8e', '#5d5e5f', '#989999'], 0.15, 0.5, 2);
    g.strokeStyle = 'rgba(50,50,52,.55)'; g.lineWidth = 3; g.strokeRect(0, 0, s, s);
  });
  TEX.dirt = ctex(256, (g, s) => { g.fillStyle = '#6d5c42'; g.fillRect(0, 0, s, s); speck(g, s, 5000, ['#5a4b35', '#7d6b4e', '#4d402d', '#8a785a'], 0.2, 0.7, 3); speck(g, s, 120, ['#9a9486', '#77705f'], 0.5, 0.9, 4); });
  TEX.brick = ctex(256, (g, s) => {
    g.fillStyle = '#a39d92'; g.fillRect(0, 0, s, s);
    const vs = []; for (let i = 0; i < 40; i++) vs.push(rnd(-16, 16));
    for (let r = 0; r < 8; r++) for (let c = -1; c < 4; c++) {
      const x = c * 64 + (r % 2 ? 32 : 0), v = vs[r * 4 + ((c + 4) % 4)];
      g.fillStyle = `rgb(${152 + v},${80 + v * 0.6},${64 + v * 0.5})`; g.fillRect(x + 2, r * 32 + 2, 60, 28);
    }
    speck(g, s, 3000, ['#000', '#fff'], 0.03, 0.1, 2);
  });
  TEX.plaster = ctex(256, (g, s) => {
    g.fillStyle = '#efece6'; g.fillRect(0, 0, s, s); speck(g, s, 4000, ['#dcd8d0', '#fbf9f4', '#cfcac0'], 0.1, 0.4, 2.5);
    g.fillStyle = 'rgba(0,0,0,.09)'; for (let y = 0; y < s; y += 32) g.fillRect(0, y, s, 2);
    g.fillStyle = 'rgba(255,255,255,.25)'; for (let y = 2; y < s; y += 32) g.fillRect(0, y, s, 1.5);
  });
  TEX.metal = ctex(256, (g, s) => {
    for (let x = 0; x < s; x += 16) { const gr = g.createLinearGradient(x, 0, x + 16, 0); gr.addColorStop(0, '#c9ccce'); gr.addColorStop(0.5, '#f0f2f3'); gr.addColorStop(1, '#b4b8bb'); g.fillStyle = gr; g.fillRect(x, 0, 16, s); }
    speck(g, s, 1800, ['#8a6a4a', '#9aa0a4'], 0.05, 0.25, 3);
  });
  TEX.roof = ctex(256, (g, s) => {
    g.fillStyle = '#d2d2d2'; g.fillRect(0, 0, s, s);
    for (let r = 0; r < 8; r++) {
      for (let c = -1; c < 8; c++) { const x = c * 32 + (r % 2 ? 16 : 0), v = ((r * 13 + ((c + 8) % 8) * 7) % 5) * 6; g.fillStyle = `rgb(${196 + v},${196 + v},${196 + v})`; g.fillRect(x + 1, r * 32 + 1, 30, 30); }
      g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(0, r * 32 + 28, s, 4);
    }
    speck(g, s, 2000, ['#000', '#fff'], 0.04, 0.12, 2);
  });
  TEX.pool = ctex(128, (g, s) => { const gr = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.3, 'rgba(255,255,255,.55)'); gr.addColorStop(0.65, 'rgba(255,255,255,.16)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, s, s); }, true);
  TEX.helipad = ctex(256, (g, s) => {
    g.clearRect(0, 0, s, s); g.strokeStyle = '#e8e4d2'; g.lineWidth = 12; g.beginPath(); g.arc(s / 2, s / 2, s / 2 - 14, 0, 7); g.stroke();
    g.fillStyle = '#e8e4d2'; g.fillRect(78, 66, 22, 124); g.fillRect(156, 66, 22, 124); g.fillRect(78, 117, 100, 22);
  }, true);
  const vc = { vertexColors: true };
  MAT.vc = new THREE.MeshLambertMaterial(vc);
  MAT.ground = [TEX.grass, TEX.asphalt, TEX.sidewalk, TEX.wood, TEX.tile, TEX.concrete, TEX.dirt].map(t => new THREE.MeshLambertMaterial({ map: t, vertexColors: true }));
  MAT.wall = { plaster: new THREE.MeshLambertMaterial({ map: TEX.plaster, ...vc }), brick: new THREE.MeshLambertMaterial({ map: TEX.brick, ...vc }), metal: new THREE.MeshLambertMaterial({ map: TEX.metal, ...vc }) };
  MAT.glass = new THREE.MeshLambertMaterial({ color: 0x9fc4d8, transparent: true, opacity: 0.38, depthWrite: false });
  MAT.door = LM(0x6b4a2e);
  MAT.roofG = new THREE.MeshLambertMaterial({ map: TEX.roof, ...vc, side: THREE.DoubleSide });
  MAT.roofF = new THREE.MeshLambertMaterial({ map: TEX.concrete, ...vc });
  MAT.marks = new THREE.MeshLambertMaterial({ color: 0xd9d5c3, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
  MAT.lampHead = new THREE.MeshBasicMaterial({ color: 0x333333 });
  MAT.pool = new THREE.MeshBasicMaterial({ map: TEX.pool, color: 0xffd08a, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
  MAT.water = new THREE.MeshLambertMaterial({ color: 0x3a6f8a, transparent: true, opacity: 0.8 });
  MAT.leaf = new THREE.MeshLambertMaterial({ flatShading: true });
  MAT.plain = new THREE.MeshLambertMaterial(); MAT.caster = new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false });
}

/* ───────── меші світу ───────── */
const _cg = {};
function contGeo(kind) {
  if (_cg[kind]) return _cg[kind];
  const g = new GB(), B = (x0, y0, z0, x1, y1, z1, hex) => g.box(x0, y0, z0, x1, y1, z1, C(hex), 1, 63);
  const goods = (cols, tool) => {
    let k = 0;
    for (const y of [0.19, 0.69, 1.19]) for (let n = 0; n < 4; n++) {
      const x = -0.4 + n * 0.21 + ((k * 7) % 3) * 0.02, w = tool ? 0.16 : 0.1 + ((k * 5) % 3) * 0.03, h = tool ? 0.12 + ((k * 3) % 3) * 0.05 : 0.16 + ((k * 11) % 4) * 0.05;
      B(x, y, -0.2 + ((k * 13) % 3) * 0.05, x + w, y + h, 0.12, cols[k % cols.length]); k++;
    }
  };
  const frame = (hex, board) => {
    for (const sx of [-0.48, 0.44]) for (const sz of [-0.3, 0.26]) B(sx, 0, sz, sx + 0.04, 1.78, sz + 0.04, hex);
    for (const y of [0.15, 0.65, 1.15, 1.65]) B(-0.48, y, -0.3, 0.48, y + 0.04, 0.3, board);
  };
  switch (kind) {
    case 'fridge': B(-.4, 0, -.42, .4, 1.78, .3, 0xdfe3e6); B(-.41, 1.2, .3, .41, 1.22, .32, 0x9aa0a6); B(.26, .55, .3, .31, 1.05, .36, 0x8a9096); B(.26, 1.35, .3, .31, 1.65, .36, 0x8a9096); break;
    case 'cabinet': B(-.48, 0, -.45, .48, .9, .28, 0x7a5a3c); B(-.5, .9, -.47, .5, .96, .32, 0xc9c2b4); B(-.48, 1.5, -.45, .48, 2.05, -.08, 0x7a5a3c); B(-.02, .1, .28, .02, .85, .3, 0x5a4028); B(-.3, .55, .28, -.2, .59, .31, 0xc8c8c8); B(.2, .55, .28, .3, .59, .31, 0xc8c8c8); B(-.02, 1.55, -.08, .02, 2.0, -.06, 0x5a4028); break;
    case 'wardrobe': B(-.46, 0, -.44, .46, 2.0, .26, 0x6b4a30); B(-.015, .05, .26, .015, 1.95, .275, 0x4a3220); B(-.1, .95, .26, -.06, 1.15, .3, 0xd0c8a0); B(.06, .95, .26, .1, 1.15, .3, 0xd0c8a0); B(-.5, 2.0, -.46, .5, 2.06, .3, 0x5a3d27); break;
    case 'drawer': B(-.45, 0, -.42, .45, .86, .26, 0x8a6844); for (let i = 0; i < 3; i++) { B(-.4, .08 + i * .27, .26, .4, .3 + i * .27, .275, 0x9a7850); B(-.05, .17 + i * .27, .275, .05, .21 + i * .27, .3, 0x3a3a3a); } B(-.47, .86, -.44, .47, .9, .29, 0x6b4e30); break;
    case 'shelf': frame(0x6f777c, 0x8f979c); goods([0xc23b2e, 0xd9b233, 0x4a8f4a, 0x3a6fb0, 0xe8e4d8, 0xd87a2a]); break;
    case 'shelf_e': frame(0x6f777c, 0x8f979c); break;
    case 'toolshelf': frame(0x4a4f55, 0x7a6a52); goods([0xb0281e, 0x6a7078, 0xd9a31a, 0x3a3d42, 0x8a5a2a], true); break;
    case 'toolshelf_e': frame(0x4a4f55, 0x7a6a52); break;
    case 'crate': B(-.42, 0, -.42, .42, .84, .42, 0x9a7a4a); for (const sx of [-.45, .37]) for (const sz of [-.45, .37]) B(sx, 0, sz, sx + .08, .87, sz + .08, 0x6f5530); B(-.45, .82, -.45, .45, .88, .45, 0x7d6038); B(-.44, .38, -.44, .44, .46, .44, 0x7d6038); break;
    case 'medcab': B(-.42, 0, -.4, .42, 1.8, .26, 0xf0f2f2); B(-.05, 1.2, .26, .05, 1.5, .28, 0xcc2222); B(-.15, 1.3, .26, .15, 1.4, .28, 0xcc2222); B(-.42, .9, .26, .42, .92, .27, 0xaab0b4); B(.3, .4, .26, .34, .7, .3, 0x8a9096); break;
    case 'gunlocker': B(-.44, 0, -.42, .44, 1.95, .26, 0x39424d); B(-.01, .05, .26, .01, 1.9, .275, 0x1f262e); for (const sx of [-.3, .12]) for (let i = 0; i < 3; i++) B(sx, 1.25 + i * .09, .26, sx + .18, 1.28 + i * .09, .275, 0x1f262e); B(.04, .9, .26, .08, 1.08, .3, 0xb8b8b8); B(-.34, 1.6, .26, -.12, 1.74, .275, 0xd9b233); break;
    case 'desk': B(-.5, .72, -.4, .5, .78, .35, 0x8a6a48); B(-.48, 0, -.38, -.2, .72, .33, 0x6b5236); B(.2, 0, -.38, .48, .72, .33, 0x6b5236); B(-.2, .95, -.25, .2, 1.25, -.21, 0x1a1d22); B(-.03, .78, -.25, .03, .95, -.21, 0x3a3d42); B(-.18, .78, -.05, .18, .8, .08, 0x2a2d32); break;
    case 'bed': B(-.48, 0, -.5, .48, .3, .5, 0x6b4a30); B(-.45, .3, -.48, .45, .48, .48, 0xe8e4d8); B(-.46, .48, -.15, .46, .52, .49, 0x5a7a9a); B(-.3, .48, -.45, .3, .58, -.22, 0xffffff); B(-.48, 0, -.5, .48, .9, -.44, 0x5a3d27); break;
    case 'table': B(-.48, .7, -.48, .48, .76, .48, 0x9a7a52); for (const sx of [-.45, .38]) for (const sz of [-.45, .38]) B(sx, 0, sz, sx + .07, .7, sz + .07, 0x6f5530); B(-.12, .76, -.1, .12, .78, .14, 0xe4e4e0); B(.2, .76, .1, .27, .98, .17, 0x3a6a3a); break;
    case 'sofa': B(-.5, 0, -.4, .5, .4, .4, 0x7a4a4a); B(-.5, .4, -.4, .5, .85, -.2, 0x6b3f3f); B(-.5, .4, -.2, -.36, .6, .4, 0x6b3f3f); B(.36, .4, -.2, .5, .6, .4, 0x6b3f3f); B(-.34, .4, -.18, .34, .48, .38, 0x8a5858); break;
    case 'counter': B(-.5, 0, -.35, .5, .95, .35, 0xc8c0b0); B(-.5, .95, -.38, .5, 1.0, .38, 0x5a5f66); B(-.2, 1.0, -.15, .15, 1.2, .15, 0x2a2d32); break;
    case 'bench': B(-.5, .4, -.2, .5, .46, .2, 0x8a6a48); B(-.5, .6, -.22, .5, .9, -.16, 0x8a6a48); for (const sx of [-.45, .38]) { B(sx, 0, -.2, sx + .07, .4, .2, 0x33373b); B(sx, .4, -.22, sx + .07, .9, -.17, 0x33373b); } break;
    case 'bag': B(-.2, 0, -.16, .2, .3, .16, 0x8a7a52); B(-.08, .3, -.06, .08, .38, .06, 0x6b5d3c); B(-.21, .12, -.17, .21, .17, .17, 0x4a4030); break;
    case 'barrier': B(-.5, 0, -.3, .5, .85, .3, 0xb8b8b4); B(-.5, .5, -.31, .5, .66, .31, 0xd9a31a); break;
    case 'pump': B(-.45, 0, -.4, .45, .12, .4, 0x8a8a86); B(-.3, .12, -.2, .3, 1.5, .2, 0xc9382c); B(-.25, .9, .2, .25, 1.35, .22, 0x1a1d22); B(-.34, 1.5, -.24, .34, 1.6, .24, 0xf0f0f0); break;
    case 'console': B(-.4, 0, -.3, .4, 1.2, .3, 0x5f6a62); B(-.3, .8, .3, .3, 1.1, .32, 0x1a221c); B(.2, 1.2, -.1, .28, 1.3, -.02, 0xff3322); B(-.25, 1.2, -.2, -.22, 2.2, -.17, 0x999999); break;
  }
  return _cg[kind] = g.build();
}
function carGeo(hex, style) {
  const g = new GB(), B = (x0, y0, z0, x1, y1, z1, h) => g.box(x0, y0, z0, x1, y1, z1, C(h), 1, 63), glass = 0x22303c;
  const tall = style === 'ambulance' ? 0.5 : 0;
  B(-.88, .28, -2.05, .88, .82, 2.05, hex);
  B(-.82, .82, -1.15 - tall * 1.2, .82, 1.38 + tall, .55, hex);
  B(-.76, .9, .55, .76, 1.32, .58, glass); B(-.76, .9, -1.18 - tall * 1.2, .76, 1.32, -1.15 - tall * 1.2, glass);
  B(-.84, .92, -.2, -.82, 1.3, .45, glass); B(.82, .92, -.2, .84, 1.3, .45, glass);
  if (!tall) { B(-.84, .92, -1.05, -.82, 1.3, -.3, glass); B(.82, .92, -1.05, .84, 1.3, -.3, glass); }
  for (const sx of [-1, 1]) for (const z of [-1.3, 1.3]) B(sx * .88 - .12, 0, z - .32, sx * .88 + .12, .64, z + .32, 0x15171a);
  B(-.9, .3, 2.05, .9, .48, 2.12, 0x2a2d32); B(-.9, .3, -2.12, .9, .48, -2.05, 0x2a2d32);
  B(-.78, .55, 2.05, -.5, .7, 2.08, 0xf2e8b0); B(.5, .55, 2.05, .78, .7, 2.08, 0xf2e8b0);
  B(-.78, .55, -2.08, -.5, .7, -2.05, 0xb02020); B(.5, .55, -2.08, .78, .7, -2.05, 0xb02020);
  if (style === 'police') { B(-.89, .5, -1.6, -.88, .64, 1.6, 0x2a4fb0); B(.88, .5, -1.6, .89, .64, 1.6, 0x2a4fb0); B(-.4, 1.38, -.4, 0, 1.5, -.2, 0xd02020); B(0, 1.38, -.4, .4, 1.5, -.2, 0x2040d0); }
  if (style === 'ambulance') { B(-.89, .55, -2.0, -.88, .7, 2.0, 0xc8281e); B(.88, .55, -2.0, .89, .7, 2.0, 0xc8281e); B(-.3, 1.88, -.3, .3, 1.98, -.1, 0x2040d0); }
  return g.build();
}
function roofGeo(b) {
  const gb = new GB(), c = C(b.roofCol), cw = C(b.wallCol), H = WALL_H;
  const X0 = b.x0 - 0.35, X1 = b.x1 + 1.35, Z0 = b.z0 - 0.35, Z1 = b.z1 + 1.35;
  if (b.def.roof === 'gable') {
    const alongX = b.w >= b.h, R = H + (alongX ? b.h : b.w) * 0.22 + 0.4;
    gb.box(X0, H - 0.06, Z0, X1, H, Z1, c, 0.5, 63);
    if (alongX) {
      const zm = (Z0 + Z1) / 2;
      gb.poly([[X0, H, Z1], [X1, H, Z1], [X1, R, zm], [X0, R, zm]], c, 0); gb.poly([[X1, H, Z0], [X0, H, Z0], [X0, R, zm], [X1, R, zm]], c, 0);
      gb.poly([[X0 + .35, H, Z0], [X0 + .35, H, Z1], [X0 + .35, R, zm]], cw, 2); gb.poly([[X1 - .35, H, Z1], [X1 - .35, H, Z0], [X1 - .35, R, zm]], cw, 2);
    } else {
      const xm = (X0 + X1) / 2;
      gb.poly([[X1, H, Z1], [X1, H, Z0], [xm, R, Z0], [xm, R, Z1]], c, 1); gb.poly([[X0, H, Z0], [X0, H, Z1], [xm, R, Z1], [xm, R, Z0]], c, 1);
      gb.poly([[X1, H, Z0 + .35], [X0, H, Z0 + .35], [xm, R, Z0 + .35]], cw, 2); gb.poly([[X0, H, Z1 - .35], [X1, H, Z1 - .35], [xm, R, Z1 - .35]], cw, 2);
    }
  } else {
    const x0 = b.x0 - 0.1, x1 = b.x1 + 1.1, z0 = b.z0 - 0.1, z1 = b.z1 + 1.1, p = 0.42;
    gb.box(x0, H, z0, x1, H + 0.18, z1, c, 0.25, 63);
    gb.box(x0, H + 0.18, z0, x1, H + p, z0 + 0.25, c, 0.25); gb.box(x0, H + 0.18, z1 - 0.25, x1, H + p, z1, c, 0.25);
    gb.box(x0, H + 0.18, z0, x0 + 0.25, H + p, z1, c, 0.25); gb.box(x1 - 0.25, H + 0.18, z0, x1, H + p, z1, c, 0.25);
    const ax = b.x0 + 1.5 + (b.id % 3), az = b.z0 + 1.5 + (b.id % 2);
    gb.box(ax, H + 0.18, az, ax + 1.3, H + 0.85, az + 1.0, C(0xaab0b4), 0.25); gb.box(ax + 0.15, H + 0.85, az + 0.15, ax + 1.15, H + 0.92, az + 0.85, C(0x5a6066), 0.25);
    if (b.w > 9) gb.box(b.x1 - 2.2, H + 0.18, b.z1 - 1.8, b.x1 - 1.2, H + 0.7, b.z1 - 0.9, C(0x8f979c), 0.25);
  }
  return gb.build();
}
function buildBuilding(b, parent) {
  const gb = new GB(), gl = new GB(), col = C(b.wallCol), H = WALL_H, glass = C(0xffffff);
  for (let z = b.z0; z <= b.z1; z++) for (let x = b.x0; x <= b.x1; x++) {
    const k = T.kind[idx(x, z)]; if (!k) continue;
    const cW = wallLike(x - 1, z), cE = wallLike(x + 1, z), cN = wallLike(x, z - 1), cS = wallLike(x, z + 1);
    const segs = [[.3, .3, .7, .7]];
    if (cW) segs.push([0, .3, .3, .7]); if (cE) segs.push([.7, .3, 1, .7]); if (cN) segs.push([.3, 0, .7, .3]); if (cS) segs.push([.3, .7, .7, 1]);
    for (const s of segs) {
      if (k === K_WALL) gb.box(x + s[0], 0, z + s[1], x + s[2], H, z + s[3], col);
      else if (k === K_WIN) { gb.box(x + s[0], 0, z + s[1], x + s[2], 0.95, z + s[3], col); gb.box(x + s[0], 2.15, z + s[1], x + s[2], H, z + s[3], col, 0.5, 63); }
      else gb.box(x + s[0], 2.25, z + s[1], x + s[2], H, z + s[3], col, 0.5, 63);
    }
    if (k === K_WIN) { if (cW || cE) gl.box(x, 0.95, z + 0.46, x + 1, 2.15, z + 0.54, glass, 1, 63); else gl.box(x + 0.46, 0.95, z, x + 0.54, 2.15, z + 1, glass, 1, 63); }
  }
  const grp = new THREE.Group();
  const wm = new THREE.Mesh(gb.build(), MAT.wall[b.def.tex]); wm.receiveShadow = true; grp.add(wm); const cw = new THREE.Mesh(wm.geometry, MAT.caster); cw.castShadow = true; parent.add(cw);
  if (gl.v) { const gm = new THREE.Mesh(gl.build(), MAT.glass); gm.renderOrder = 2; grp.add(gm); }
  for (const d of b.doors) {
    const pv = new THREE.Group();
    if (d.alongX) pv.position.set(d.x + 0.03, 0, d.z + 0.5); else pv.position.set(d.x + 0.5, 0, d.z + 0.03);
    d.base = d.alongX ? 0 : -Math.PI / 2; d.ang = d.open ? Math.PI / 2 : 0; pv.rotation.y = d.base + d.ang;
    const pm = new THREE.Mesh(GEO.door, MAT.door); pm.position.set(0.47, 1.1, 0); pm.castShadow = true; pm.receiveShadow = true; pv.add(pm);
    part(pv, 0.06, 0.06, 0.16, 0.82, 1.05, 0, LM(0xc8b060));
    d.pivot = pv; if (d.broken) pv.visible = false; grp.add(pv);
  }
  b.group = grp; parent.add(grp);
  b.roofMat = (b.def.roof === 'gable' ? MAT.roofG : MAT.roofF).clone();
  b.roof = new THREE.Mesh(roofGeo(b), b.roofMat); b.roof.receiveShadow = true; parent.add(b.roof); const cr = new THREE.Mesh(b.roof.geometry, MAT.caster); cr.castShadow = true; parent.add(cr);
  b.cut = 0;
}
function contMesh(c) {
  const m = new THREE.Mesh(contGeo(c.kind === 'shelf' && c.searched && !c.items.length ? 'shelf_e' : c.kind), MAT.vc);
  m.position.set(c.cx, 0, c.cz); m.rotation.y = c.rot || 0; m.castShadow = true; m.receiveShadow = true; return m;
}
function buildWorldMeshes(scene) {
  const root = new THREE.Group(); World.group = root; scene.add(root); MAT.ground[G_GRASS].color.set(World.biome ? World.biome.tint : 0xffffff);
  // земля
  const sc = [0.25, 0.25, 0.5, 0.5, 0.5, 0.25, 0.5], gbs = MAT.ground.map(() => new GB());
  const sh = (x, z, g) => g === G_GRASS ? 0.74 + 0.34 * vnoise(x * 0.13, z * 0.13) : g === G_ASPHALT ? 0.84 + 0.22 * vnoise(x * 0.21 + 40, z * 0.21) : 0.88 + 0.16 * vnoise(x * 0.3 + 9, z * 0.3 + 5);
  for (let z = 0; z < MAP; z++) for (let x = 0; x < MAP; x++) {
    const g = T.ground[idx(x, z)];
    gbs[g].quadY(x, z, x + 1, z + 1, 0, sc[g], sh(x, z, g), sh(x + 1, z, g), sh(x + 1, z + 1, g), sh(x, z + 1, g));
  }
  gbs.forEach((gb, i) => { if (!gb.v) return; const m = new THREE.Mesh(gb.build(), MAT.ground[i]); m.receiveShadow = true; root.add(m); });
  const under = new THREE.Mesh(new THREE.PlaneGeometry(700, 700), LM(0x41592c)); under.rotation.x = -Math.PI / 2; under.position.set(MAP / 2, -0.04, MAP / 2); root.add(under);
  // розмітка
  const mk = new GB(), R = World.roads, cross = a => R.some(q => a >= q - 1 && a < q + 5);
  for (const r of R) {
    for (let a = TOWN0; a < MAP; a += 3) { if (cross(a) || cross(a + 1)) continue; mk.quadY(r + 1.94, a, r + 2.06, a + 1.5, 0.012, 1, 1, 1, 1, 1); mk.quadY(a, r + 1.94, a + 1.5, r + 2.06, 0.012, 1, 1, 1, 1, 1); }
    for (const q of R) for (const o of [q - 1, q + 4]) for (let k = 0; k < 8; k++) {
      mk.quadY(r + 0.11 + k * 0.5, o + 0.08, r + 0.39 + k * 0.5, o + 0.92, 0.012, 1, 1, 1, 1, 1);
      mk.quadY(o + 0.08, r + 0.11 + k * 0.5, o + 0.92, r + 0.39 + k * 0.5, 0.012, 1, 1, 1, 1, 1);
    }
  }
  const mm = new THREE.Mesh(mk.build(), MAT.marks); mm.receiveShadow = true; root.add(mm);
  // будівлі, схованки, меблі
  for (const b of World.buildings) buildBuilding(b, root);
  for (const c of World.conts) { if (c.kind === 'car') continue; c.mesh = contMesh(c); root.add(c.mesh); }
  for (const p of World.props) { p.mesh = contMesh(p); root.add(p.mesh); }
  // машини
  const cgc = {};
  for (const car of World.cars) {
    const col = car.style === 'police' ? 0xe8e8e4 : car.style === 'ambulance' ? 0xf0f0ec : car.color, key = col + car.style;
    const m = new THREE.Mesh(cgc[key] || (cgc[key] = carGeo(col, car.style)), MAT.vc);
    m.position.set(car.cx, 0, car.cz); m.rotation.y = car.rot; m.castShadow = true; m.receiveShadow = true; root.add(m);
  }
  // дерева
  const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), S = new THREE.Vector3(), V = new THREE.Vector3(), E = new THREE.Euler(), col = new THREE.Color();
  buildNodeMeshes(root);
  const lg = new GB(); lg.box(-.06, 0, -.06, .06, 4.3, .06, C(0x3a3f44), 1, 63); lg.box(-.12, 0, -.12, .12, .3, .12, C(0x2a2d30), 1, 63); lg.box(0, 4.2, -.04, .9, 4.3, .04, C(0x3a3f44), 1, 63);
  const nL = Math.max(1, World.lamps.length);
  const poles = new THREE.InstancedMesh(lg.build(), MAT.vc, nL);
  const heads = new THREE.InstancedMesh(new THREE.BoxGeometry(0.5, 0.1, 0.24).translate(0.75, 4.15, 0), MAT.lampHead, nL);
  const pools = new THREE.InstancedMesh(new THREE.PlaneGeometry(11, 11).rotateX(-Math.PI / 2).translate(0.75, 0.035, 0), MAT.pool, nL);
  World.lamps.forEach((l, i) => { Q.setFromEuler(E.set(0, l.rot, 0)); M.compose(V.set(l.x, 0, l.z), Q, S.set(1, 1, 1)); poles.setMatrixAt(i, M); heads.setMatrixAt(i, M); pools.setMatrixAt(i, M); });
  poles.castShadow = true; for (const im of [poles, heads, pools]) { im.frustumCulled = false; root.add(im); } pools.renderOrder = 1;
  // трава й сміття
  const tufts = new THREE.InstancedMesh(new THREE.ConeGeometry(0.11, 0.38, 4).translate(0, 0.19, 0), MAT.plain, 1400);
  const junk = new THREE.InstancedMesh(GEO.box, MAT.plain, 500);
  let ti = 0, ji = 0;
  for (let n = 0; n < 9000 && (ti < 1400 || ji < 500); n++) {
    const x = rnd(2, MAP - 2), z = rnd(2, MAP - 2), i = idx(x | 0, z | 0), g = T.ground[i];
    if (g === G_GRASS && ti < 1400 && !T.bid[i]) { Q.setFromEuler(E.set(rnd(-0.2, 0.2), rnd(6), rnd(-0.2, 0.2))); const s = rnd(0.7, 1.7); M.compose(V.set(x, 0, z), Q, S.set(s, s * rnd(0.8, 1.5), s)); tufts.setMatrixAt(ti, M); col.setHSL(rnd(0.2, 0.3), 0.45, rnd(0.2, 0.34)); tufts.setColorAt(ti++, col); }
    else if ((g === G_ASPHALT || g === G_SIDEWALK || g === G_CONCRETE) && ji < 500 && !T.solid[i] && chance(0.3)) { Q.setFromEuler(E.set(0, rnd(6), 0)); M.compose(V.set(x, 0.015, z), Q, S.set(rnd(0.1, 0.4), 0.02, rnd(0.1, 0.3))); junk.setMatrixAt(ji, M); col.setHSL(rnd(0.05, 0.15), rnd(0, 0.25), rnd(0.25, 0.75)); junk.setColorAt(ji++, col); }
  }
  tufts.count = ti; junk.count = ji; for (const im of [tufts, junk]) { im.frustumCulled = false; im.receiveShadow = true; root.add(im); }
  // фонтани
  for (const f of World.fountains) {
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 1.35, 0.55, 16), LM(0x9a9a94)); rim.position.set(f.cx, 0.27, f.cz); rim.castShadow = true; rim.receiveShadow = true; root.add(rim);
    const wt = new THREE.Mesh(new THREE.CylinderGeometry(1.08, 1.08, 0.06, 16), MAT.water); wt.position.set(f.cx, 0.55, f.cz); root.add(wt);
    const col2 = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.2, 1.3, 8), LM(0x8a8a84)); col2.position.set(f.cx, 0.65, f.cz); col2.castShadow = true; root.add(col2);
  }
  // навіс заправки
  if (World.canopy) {
    const k = World.canopy, g = new GB();
    g.box(k.x - 0.3, 3.4, k.z - 0.3, k.x + k.w + 0.3, 3.75, k.z + k.h + 0.3, C(0xe8e4dc), 0.25, 63); g.box(k.x - 0.32, 3.45, k.z - 0.32, k.x + k.w + 0.32, 3.62, k.z + k.h + 0.32, C(0xc9382c), 0.25, 63);
    for (const [px, pz] of [[k.x, k.z], [k.x + k.w - 1, k.z], [k.x, k.z + k.h - 1], [k.x + k.w - 1, k.z + k.h - 1]]) g.box(px + 0.36, 0, pz + 0.36, px + 0.64, 3.4, pz + 0.64, C(0xd8d8d4), 0.25, 63);
    const m = new THREE.Mesh(g.build(), MAT.vc); m.castShadow = true; m.receiveShadow = true; root.add(m);
  }
  // радіовежа, майданчик, гелікоптер
  if (World.tower) {
    const tw = new THREE.Group(), red = LM(0xb03a2a), wht = LM(0xd8d8d0), HT = 22, V3 = (x, y, z) => new THREE.Vector3(x, y, z);
    const hs = y => lerp(1.0, 0.22, y / HT), cs = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
    for (let l = 0; l < 5; l++) {
      const y0 = l * HT / 5, y1 = (l + 1) * HT / 5, a = hs(y0), b = hs(y1), mat = l % 2 ? wht : red;
      for (let k = 0; k < 4; k++) {
        const c = cs[k], n = cs[(k + 1) % 4];
        beam(tw, V3(c[0] * a, y0, c[1] * a), V3(c[0] * b, y1, c[1] * b), 0.11, mat);
        beam(tw, V3(c[0] * b, y1, c[1] * b), V3(n[0] * b, y1, n[1] * b), 0.07, mat);
        beam(tw, V3(c[0] * a, y0, c[1] * a), V3(n[0] * b, y1, n[1] * b), 0.05, mat);
      }
    }
    beam(tw, V3(0, HT, 0), V3(0, HT + 5, 0), 0.07, wht);
    const lt = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 6), new THREE.MeshBasicMaterial({ color: 0xff2a1a })); lt.position.set(0, HT + 5.2, 0); tw.add(lt);
    tw.position.set(World.tower.cx, 0, World.tower.cz); root.add(tw); World.tower.light = lt;
    const hp = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), new THREE.MeshLambertMaterial({ map: TEX.helipad, transparent: true, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
    hp.rotation.x = -Math.PI / 2; hp.position.set(World.helipad.cx, 0.02, World.helipad.cz); hp.receiveShadow = true; root.add(hp);
    const h = new THREE.Group(), olive = LM(0x4a5a3c), dark = LM(0x23272b);
    part(h, 1.5, 1.4, 3.3, 0, 1.45, 0, olive); part(h, 1.3, 0.9, 1.0, 0, 1.55, 2.0, LM(0x22303c)); part(h, 1.3, 0.5, 1.0, 0, 0.98, 2.0, olive);
    part(h, 0.36, 0.36, 3.4, 0, 1.85, -3.2, olive); part(h, 0.1, 1.1, 0.7, 0, 2.4, -4.6, olive);
    for (const sx of [-0.75, 0.75]) { part(h, 0.09, 0.09, 3.2, sx, 0.08, 0.2, dark); part(h, 0.07, 0.7, 0.07, sx, 0.42, 1.0, dark); part(h, 0.07, 0.7, 0.07, sx, 0.42, -0.6, dark); }
    part(h, 0.22, 0.35, 0.22, 0, 2.3, 0, dark);
    const rotor = new THREE.Group(); rotor.position.set(0, 2.5, 0); part(rotor, 8.4, 0.05, 0.32, 0, 0, 0, dark); part(rotor, 0.32, 0.05, 8.4, 0, 0, 0, dark); h.add(rotor);
    const tr = new THREE.Group(); tr.position.set(0.14, 2.5, -4.6); part(tr, 0.04, 1.3, 0.12, 0, 0, 0, dark); part(tr, 0.04, 0.12, 1.3, 0, 0, 0, dark); h.add(tr);
    h.position.set(World.helipad.cx, 40, World.helipad.cz); h.visible = false; root.add(h);
    World.heli = { g: h, rotor, tr, y: 40, state: 0 };
  }
  buildWildMeshes(root); makeMapCanvas(); unseedRand();
}
function disposeWorld(scene) {
  if (!World.group) return;
  World.group.traverse(o => { if (o.geometry && o.geometry !== GEO.box && o.geometry !== GEO.door && o.geometry !== GEO.plane && !Object.values(_cg).includes(o.geometry)) o.geometry.dispose(); });
  for (const b of World.buildings) if (b.roofMat) b.roofMat.dispose();
  scene.remove(World.group); World.group = null;
}
function makeMapCanvas() {
  const S = 3, c = document.createElement('canvas'); c.width = c.height = MAP * S; const g = c.getContext('2d');
  const gc = ['#34482b', '#3b3c3e', '#74736d', '#6a5a44', '#7d8582', '#5f6061', '#5e513c'];
  for (let z = 0; z < MAP; z++) for (let x = 0; x < MAP; x++) {
    const i = idx(x, z), b = T.bid[i];
    g.fillStyle = T.kind[i] === K_WALL || T.kind[i] === K_WIN ? '#15150f' : b ? World.buildings[b - 1].def.map : T.solid[i] === S_FULL ? '#54575a' : gc[T.ground[i]];
    g.fillRect(x * S, z * S, S, S);
  }
  g.fillStyle = '#243a1c'; for (const t of World.nodes) if (t.type === 'tree') { g.beginPath(); g.arc(t.cx * S, t.cz * S, S * 0.75, 0, 7); g.fill(); }
  World.mapCanvas = c;
}

/* ───────── зрізи будівель: дах і стіни ховаються, коли заважають ───────── */
const _cutIds = [];
function updateBuildings(dt, px, pz, yaw) {
  _cutIds.length = 0;
  const cdx = Math.sin(yaw), cdz = Math.cos(yaw);
  for (let k = 0; k <= 4; k++) {
    const tx = Math.floor(px + cdx * k * 0.8), tz = Math.floor(pz + cdz * k * 0.8); if (!inMap(tx, tz)) continue;
    const id = T.bid[idx(tx, tz)]; if (id && !_cutIds.includes(id)) _cutIds.push(id);
  }
  for (const b of World.buildings) {
    const target = _cutIds.includes(b.id) ? 1 : 0;
    if (b.cut === target && !b.fresh) continue;
    b.cut = moveTo(b.cut, target, dt * 5);
    b.group.scale.y = 1 - 0.7 * b.cut;
    b.roofMat.opacity = 1 - b.cut; b.roofMat.transparent = b.cut > 0.01; b.roof.visible = b.cut < 0.98;
  }
  for (const d of World.doors) {
    if (d.broken) continue;
    const t = d.open ? Math.PI / 2 : 0;
    if (d.ang !== t || d.shake > 0) { d.ang = moveTo(d.ang, t, dt * 7); d.shake = Math.max(0, d.shake - dt * 4); d.pivot.rotation.y = d.base + d.ang + Math.sin(d.shake * 40) * 0.05 * d.shake; }
  }
}

/* ───────── небо, сонце, ніч ───────── */
const Env = { sun: null, hemi: null, fog: null, night: 0, bg: null, _a: null, _b: null };
const SKY = [
  [0, 0xa8bcf0, 2.2, 0x7890c8, 2.1, 0x141d30], [4.8, 0xa8bcf0, 2.2, 0x7890c8, 2.1, 0x141d30], [5.8, 0x8a6a70, 0.04, 0x5a5a7a, 1.3, 0x2a2430],
  [6.8, 0xffa060, 1.5, 0x9a8a90, 0.8, 0xb08a78], [8.5, 0xfff0d8, 2.6, 0xb8cce0, 1.05, 0x9fb6c8], [16.5, 0xfff0d8, 2.6, 0xb8cce0, 1.05, 0x9fb6c8],
  [19, 0xff8a48, 1.6, 0xa08078, 0.8, 0xa8694a], [20.3, 0x8a5a60, 0.04, 0x5a5070, 1.3, 0x2a1e28], [21.3, 0xa8bcf0, 2.2, 0x7890c8, 2.1, 0x141d30], [24, 0xa8bcf0, 2.2, 0x7890c8, 2.1, 0x141d30],
];
function initEnv(scene) {
  Env.hemi = new THREE.HemisphereLight(0xb8cce0, 0x4a4234, 1); scene.add(Env.hemi);
  const s = Env.sun = new THREE.DirectionalLight(0xffffff, 2); s.castShadow = true;
  s.shadow.mapSize.set(2048, 2048); const c = s.shadow.camera; c.left = -42; c.right = 42; c.top = 42; c.bottom = -42; c.near = 1; c.far = 160;
  s.shadow.bias = -0.0005; s.shadow.normalBias = 0.04; scene.add(s); scene.add(s.target);
  Env.bg = new THREE.Color(0x9fb6c8); scene.background = Env.bg; Env.fog = scene.fog = new THREE.Fog(0x9fb6c8, 40, 90);
  Env._a = new THREE.Color(); Env._b = new THREE.Color();
}
function updateEnv(t, px, pz, camDist) {
  let i = 0; while (i < SKY.length - 2 && SKY[i + 1][0] <= t) i++;
  const A = SKY[i], B = SKY[i + 1], k = clamp((t - A[0]) / (B[0] - A[0] || 1), 0, 1), a = Env._a, b = Env._b;
  Env.sun.color.copy(a.set(A[1])).lerp(b.set(B[1]), k); Env.sun.intensity = lerp(A[2], B[2], k);
  Env.hemi.color.copy(a.set(A[3])).lerp(b.set(B[3]), k); Env.hemi.intensity = lerp(A[4], B[4], k);
  Env.bg.copy(a.set(A[5])).lerp(b.set(B[5]), k); Env.fog.color.copy(Env.bg);
  const n = Env.night = t < 5.3 || t > 20.8 ? 1 : t < 6.8 ? (6.8 - t) / 1.5 : t > 19.3 ? (t - 19.3) / 1.5 : 0;
  let dx, dy, dz;
  if (t > 5.8 && t < 20.3) { const an = (t - 5.8) / 14.5 * Math.PI; dx = Math.cos(an) * 0.8; dy = Math.sin(an) * 0.9 + 0.22; dz = 0.45; } else { dx = -0.5; dy = 0.8; dz = -0.35; }
  const l = Math.hypot(dx, dy, dz);
  const ex = dx / l, ey = dy / l, ez = dz / l, hl = Math.hypot(ex, ez) || 1, rx = ez / hl, rz = -ex / hl, ux = ey * rz, uy = ez * rx - ex * rz, uz = -ey * rx, ts = 84 / 2048;
  const pa = Math.round((px * rx + pz * rz) / ts) * ts, pb = Math.round((px * ux + pz * uz) / ts) * ts, pc = px * ex + pz * ez;
  const sx = pa * rx + pb * ux + pc * ex, sy = pb * uy + pc * ey, sz = pa * rz + pb * uz + pc * ez;
  Env.sun.target.position.set(sx, sy, sz); Env.sun.position.set(sx + ex * 80, sy + ey * 80, sz + ez * 80);
  Env.fog.near = camDist + 14 - n * 6; Env.fog.far = camDist + 62 - n * 26;
  MAT.pool.opacity = n * 0.9; MAT.lampHead.color.setRGB(0.04 + n * 0.96, 0.04 + n * 0.8, 0.04 + n * 0.45);
}
