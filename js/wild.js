'use strict';
/* ═══════════ генерація світу: місто на південному сході, довкола — дика місцевість із випадковим типом і розкладом ═══════════ */
const BIOMES = [
  { n: 'Густий ліс', tree: [0.2, 0.07, 0.012], bush: 0.018, berry: 0.01, rock: 0.01, peb: 0.012, ponds: 0, pine: 0.32, dead: 0, tint: 0xffffff },
  { n: 'Рівнина', tree: [0.06, 0.02, 0.004], bush: 0.034, berry: 0.014, rock: 0.012, peb: 0.02, ponds: 1, pine: 0.15, dead: 0, tint: 0xfff2c8 },
  { n: 'Озерний край', tree: [0.16, 0.06, 0.01], bush: 0.02, berry: 0.022, rock: 0.008, peb: 0.012, ponds: 3, pine: 0.25, dead: 0, tint: 0xe6ffe6 },
  { n: 'Скелясте нагір\'я', tree: [0.1, 0.035, 0.006], bush: 0.014, berry: 0.008, rock: 0.034, peb: 0.03, ponds: 0, pine: 0.55, dead: 0, tint: 0xdfe6dc, quarry2: true },
  { n: 'Осінній ліс', tree: [0.19, 0.07, 0.012], bush: 0.018, berry: 0.012, rock: 0.01, peb: 0.012, ponds: 1, pine: 0.12, dead: 0.05, tint: 0xffe2b0, autumn: true },
  { n: 'Згарище', tree: [0.17, 0.06, 0.012], bush: 0.008, berry: 0.004, rock: 0.014, peb: 0.016, ponds: 0, pine: 0.3, dead: 0.6, tint: 0xb8b4a8 },
];
/* п'ять ділянок дикої місцевості: табір, озеро, вежа й кар'єр щоразу займають різні */
const ZONES = [[30, 30], [28, 74], [24, 114], [84, 28], [116, 26]];
function addNode(type, x, z) {
  const def = NODES[type], i = idx(x, z), B = World.biome || BIOMES[0];
  const n = { type, def, x, z, cx: x + 0.5 + rnd(-0.12, 0.12), cz: z + 0.5 + rnd(-0.12, 0.12), s: rnd(0.85, 1.4), kind: chance(B.pine) ? 1 : 0, v: B.autumn ? 1 : chance(B.dead) ? 2 : 0, hue: _rand(), hp: def.hp || 1, alive: true, regrow: 0, shake: 0, parts: [], id: World.nodes.length };
  if (type === 'tree') T.solid[i] = S_SMALL; else if (!def.hand) T.solid[i] = S_FULL;
  T.res[i] = 1; World.nodes.push(n); World.nodeAt[i] = n; return n;
}
const dirt = (x, z) => { if (!inMap(x, z)) return; const i = idx(x, z); if (!T.bid[i] && T.ground[i] === G_GRASS) T.ground[i] = G_DIRT; T.res[i] = 1; };
function campAt(cx, cz) {
  World.camp = { x: cx + 0.5, z: cz + 0.5, tx: cx, tz: cz };
  for (let dz = -8; dz <= 8; dz++) for (let dx = -8; dx <= 8; dx++) {
    const d = Math.hypot(dx, dz); if (d > 8.2) continue;
    const i = idx(cx + dx, cz + dz); T.res[i] = 1;
    if (d < 3.4 + vnoise((cx + dx) * 0.7, (cz + dz) * 0.7) * 1.8) T.ground[i] = G_DIRT;
  }
  T.solid[idx(cx, cz)] = S_FULL; World.core = { x: cx, z: cz, cx: cx + 0.5, cz: cz + 0.5 };
  const sc = addCont(null, 'crate', cx + 2, cz - 1, 0);
  sc.items = [{ id: 'canned', qty: 2 }, { id: 'water', qty: 2 }, { id: 'bandage', qty: 2 }, { id: 'cloth', qty: 2 }]; World.starter = sc;
  World.spawn = { x: cx + 0.5, z: cz + 2.5 };
  // ґрунтова дорога до найближчого краю міста
  if (cx + 3 <= 62) {
    const north = cz + 4 < TOWN0;
    for (let x = cx + 3; x <= (north ? 62 : TOWN0 + 1); x++) for (const o of [4, 5]) dirt(x, cz + o);
    if (north) for (let z = cz + 4; z < TOWN0; z++) for (const o of [61, 62]) dirt(o, z);
  } else for (let z = cz + 3; z <= TOWN0; z++) for (const o of [0, 1]) dirt(cx + o, z);
}
function lakeAt(lx, lz, lr) {
  World.lakes.push({ cx: lx + 0.5, cz: lz + 0.5, r: lr }); const m = Math.ceil(lr) + 2;
  for (let dz = -m; dz <= m; dz++) for (let dx = -m; dx <= m; dx++) {
    if (!inMap(lx + dx, lz + dz)) continue; const d = Math.hypot(dx, dz), i = idx(lx + dx, lz + dz); if (d > lr + 1.6) continue;
    T.res[i] = 1; T.ground[i] = G_DIRT; if (d < lr - 0.4) T.solid[i] = S_FULL;
  }
}
/* вільний квадрат дикої місцевості зі стороною s */
function wildSpot(s) {
  for (let t = 0; t < 90; t++) {
    const x = rndi(6, MAP - 7 - s), z = rndi(6, MAP - 7 - s); if (x + s > TOWN0 - 3 && z + s > TOWN0 - 3) continue;
    let ok = true;
    for (let dz = 0; dz < s && ok; dz++) for (let dx = 0; dx < s && ok; dx++) { const i = idx(x + dx, z + dz); if (T.res[i] || T.solid[i] || T.bid[i] || T.ground[i] !== G_GRASS) ok = false; }
    if (ok) return [x, z];
  }
  return null;
}
/* цікаві місця в лісі: хатина, покинутий блокпост, розбиті машини */
function poiAt(type) {
  const s = wildSpot(9); if (!s) return; const x = s[0], z = s[1];
  if (type === 'cabin') { const b = makeBuilding('house', x + 1, z + 1, 6, 6, [{ side: rndi(0, 3), kind: 'door' }]); placeConts(b, ['wardrobe', 'cabinet', 'drawer', 'bed', 'table']); }
  else if (type === 'post') {
    for (let k = 0; k < 4; k++) World.props.push(Object.assign(addContProp('barrier', x + 2 + k, z + 2), { rot: 0 }));
    addCont(null, 'gunlocker', x + 3, z + 4, 0); addCont(null, 'crate', x + 5, z + 4, 0); addCar(x + 2, z + 6, false, 'police');
  } else { addCar(x + 1, z + 1, true); addCar(x + 4, z + 3, false); addCont(null, 'crate', x + 6, z + 6, 0); addCont(null, 'crate', x + 2, z + 6, 0); }
  for (let dz = 0; dz < 9; dz++) for (let dx = 0; dx < 9; dx++) T.res[idx(x + dx, z + dz)] = 1;
}
function genWild() {
  const B = World.biome = pick(BIOMES), zs = shuffle(ZONES.map(q => [q[0] + rndi(-4, 4), q[1] + rndi(-4, 4)]));
  const cx = zs[0][0], cz = zs[0][1]; campAt(cx, cz);
  World.lakes = []; lakeAt(zs[1][0], zs[1][1], rnd(6, 8)); World.lake = World.lakes[0];
  genBlock({ x: zs[2][0] - 9, z: zs[2][1] - 9, type: 'tower', builds: [] });
  const quarries = [{ cx: zs[3][0], cz: zs[3][1], r: 13 }]; World.quarry = quarries[0];
  if (B.quarry2) quarries.push({ cx: zs[4][0], cz: zs[4][1], r: 10 });
  // ресурси біля табору, щоб навчання завжди було прохідним
  const ring = (type, n, r0, r1) => {
    for (let k = 0, t = 0; k < n && t < 300; t++) {
      const a = rnd(6.283), r = rnd(r0, r1), x = Math.round(cx + Math.sin(a) * r), z = Math.round(cz + Math.cos(a) * r), i = idx(x, z);
      if (T.solid[i] || World.nodeAt[i] || T.ground[i] === G_DIRT) continue;
      addNode(type, x, z); k++;
    }
  };
  ring('bush', 5, 4.5, 7.5); ring('berry', 2, 5, 7.5); ring('pebble', 8, 4.5, 7.8); ring('tree', 10, 8.6, 11.5); ring('rock', 4, 9, 13);
  for (let k = 0, n = rndi(3, 5); k < n; k++) poiAt(pick(['cabin', 'cabin', 'post', 'wreck']));
  for (let k = 0; k < B.ponds; k++) { const r = rnd(3.2, 4.6), sz = Math.ceil(r * 2 + 4), s = wildSpot(sz); if (s) lakeAt(s[0] + (sz >> 1), s[1] + (sz >> 1), r); }
  const so = rnd(500), so2 = rnd(500);
  for (let z = 2; z < MAP - 2; z++) for (let x = 2; x < MAP - 2; x++) {
    const i = idx(x, z); if (T.solid[i] || T.res[i] || T.bid[i] || T.kind[i]) continue;
    const g = T.ground[i], r = _rand();
    if (x >= TOWN0 && z >= TOWN0) { if (g === G_GRASS && r < 0.04) addNode('tree', x, z); continue; }
    if (quarries.some(q => Math.hypot(x - q.cx, z - q.cz) < q.r * (0.8 + 0.3 * vnoise(x * 0.3, z * 0.3)))) {
      T.ground[i] = G_DIRT;
      if (r < 0.14) addNode('rock', x, z); else if (r < 0.2) addNode('ore', x, z); else if (r < 0.24) addNode('pebble', x, z);
      continue;
    }
    if (g !== G_GRASS) continue;
    const f = vnoise(x * 0.055 + so, z * 0.055 + so2), edge = x < 6 || z < 6 || (x > MAP - 7 && z < TOWN0) || (z > MAP - 7 && x < TOWN0);
    let q = edge ? 0.45 : f > 0.56 ? B.tree[0] : f > 0.42 ? B.tree[1] : B.tree[2];
    if (r < q) addNode('tree', x, z); else if (r < (q += B.rock)) addNode('rock', x, z); else if (r < (q += 0.002)) addNode('ore', x, z);
    else if (r < (q += B.bush)) addNode('bush', x, z); else if (r < (q += B.berry)) addNode('berry', x, z); else if (r < (q += B.peb)) addNode('pebble', x, z);
  }
}
function genWorld(seed) {
  World.seed = seed >>> 0; seedRand(World.seed);
  T.ground.fill(G_GRASS); T.solid.fill(0); T.opaque.fill(0); T.kind.fill(0); T.bid.fill(0); T.res.fill(0); T.boxes.fill(null);
  Object.assign(World, { buildings: [], doors: [], doorAt: {}, conts: [], props: [], cars: [], lamps: [], nodes: [], nodeAt: {}, blocks: [], byType: {}, fountains: [], lakes: [], biome: null, tower: null, helipad: null, console: null, canopy: null, heli: null, camp: null, core: null, starter: null, lake: null, quarry: null });
  const R = World.roads;
  for (const r of R) for (let a = TOWN0; a < MAP; a++) for (let k = 0; k < 4; k++) { T.ground[idx(r + k, a)] = G_ASPHALT; T.ground[idx(a, r + k)] = G_ASPHALT; }
  for (const r of R) for (let a = TOWN0; a < MAP; a++) for (const s of [r - 1, r + 4]) {
    if (T.ground[idx(s, a)] === G_GRASS) T.ground[idx(s, a)] = G_SIDEWALK;
    if (T.ground[idx(a, s)] === G_GRASS) T.ground[idx(a, s)] = G_SIDEWALK;
  }
  // склад кварталів міста теж змінюється: шість обов'язкових і три випадкові
  const types = shuffle(['police', 'clinic', 'workshop', 'market', 'gas', 'house', pick(['warehouse', 'shops']), pick(['house', 'park', 'shops']), pick(['house', 'park', 'warehouse'])]);
  for (let bz = 0; bz < 3; bz++) for (let bx = 0; bx < 3; bx++) {
    const bl = { bx, bz, x: R[bx] + 5, z: R[bz] + 5, type: types[bz * 3 + bx], builds: [] };
    World.blocks.push(bl); genBlock(bl);
  }
  genWild();
  for (const d of World.doors) { d.alongX = wallLike(d.x - 1, d.z) || wallLike(d.x + 1, d.z); d.open = chance(0.5); }
  for (const r of R) for (let n = 0; n < 5; n++) {
    const a = rndi(TOWN0 + 4, MAP - 9); if (R.some(q => a + 4 > q - 2 && a < q + 6)) continue;
    const lane = chance(0.5) ? 0 : 2;
    if (chance(0.5)) addCar(r + lane, a, true); else addCar(a, r + lane, false);
  }
  for (const r of R) for (let k = -1; k <= 4; k++) {
    const e = MAP - 3;
    if (!T.solid[idx(r + k, e)]) World.props.push(Object.assign(addContProp('barrier', r + k, e), { rot: 0 }));
    if (!T.solid[idx(e, r + k)]) World.props.push(Object.assign(addContProp('barrier', e, r + k), { rot: Math.PI / 2 }));
  }
  const lamp = (x, z, rot) => { if (!inMap(x, z)) return; const i = idx(x, z); if (T.ground[i] !== G_SIDEWALK || T.solid[i] || T.res[i] || T.bid[i]) return; T.solid[i] = S_SMALL; World.lamps.push({ x: x + 0.5, z: z + 0.5, rot }); };
  for (const r of R) for (let a = TOWN0 + 5; a < MAP - 6; a += 12) { lamp(r - 1, a, 0); lamp(r + 4, a + 6, Math.PI); lamp(a, r - 1, -Math.PI / 2); lamp(a + 6, r + 4, Math.PI / 2); }
  const qc = (type, kinds, item) => {
    const b = (World.byType[type] || [])[0]; if (!b) return;
    const cs = World.conts.filter(c => c.bid === b.id), c = cs.find(c => kinds.includes(c.kind)) || cs[0];
    if (c) { c.quest = item; c.items = null; c.searched = false; b.questCont = c; }
  };
  qc('police', ['gunlocker'], 'radio'); qc('workshop', ['crate', 'toolshelf'], 'battery');
  World.nStatic = World.conts.length;
  computeBoxes();
}
function buildWildMeshes(root) {
  for (const l of World.lakes) {
    const w = new THREE.Mesh(new THREE.CircleGeometry(l.r, 30).rotateX(-Math.PI / 2), MAT.water); w.position.set(l.cx, 0.07, l.cz); w.receiveShadow = true; root.add(w);
    const deep = new THREE.Mesh(new THREE.CircleGeometry(l.r * 0.62, 24).rotateX(-Math.PI / 2), new THREE.MeshLambertMaterial({ color: 0x2a556e, transparent: true, opacity: 0.55 })); deep.position.set(l.cx, 0.075, l.cz); root.add(deep);
  }
}
