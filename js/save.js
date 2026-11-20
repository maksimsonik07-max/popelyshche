'use strict';
/* ═══════════ налаштування і п'ять слотів збереження ═══════════ */
const SAVE_P = ['x', 'z', 'hp', 'stam', 'hunger', 'thirst', 'level', 'xp', 'attrPts', 'perkPts', 'attrs', 'skills', 'perks', 'inv', 'eq', 'active', 'bleed', 'infected', 'infection', 'kills', 'looted'];
const Settings = {
  d: { vol: 0.6, shadows: 2, res: 1, tut: true },
  load() { try { Object.assign(this.d, JSON.parse(localStorage.getItem('popel.settings') || '{}')); } catch (e) { /* сховище недоступне — лишаємо типові */ } },
  save() { try { localStorage.setItem('popel.settings', JSON.stringify(this.d)); } catch (e) { /* не критично */ } },
  apply() {
    if (SFX.out) SFX.out.gain.value = this.d.vol * 0.85;
    const s = Env.sun;
    if (s) {
      const size = this.d.shadows === 2 ? 2048 : 1024; s.castShadow = this.d.shadows > 0;
      if (s.shadow.mapSize.x !== size) { s.shadow.mapSize.set(size, size); if (s.shadow.map) { s.shadow.map.dispose(); s.shadow.map = null; } }
    }
    if (G.flash) G.flash.castShadow = this.d.shadows === 2;
    if (G.renderer) resize();
  },
};
const Save = {
  slot: 0, t: 45, ok: true,
  key(i) { return 'popel.save.' + i; },
  read(i) { try { const d = JSON.parse(localStorage.getItem(this.key(i)) || 'null'); return d && d.v === 3 ? d : null; } catch (e) { return null; } },
  meta(i) { const d = this.read(i); return d ? { ts: d.ts, day: d.day, time: d.time, lvl: d.p.level, cls: d.p.cls, base: d.base.lv, stage: d.q.stage, done: d.q.done, kills: d.p.kills } : null; },
  del(i) { try { localStorage.removeItem(this.key(i)); } catch (e) { /* нічого */ } },
  latest() { let b = -1, bt = 0; for (let i = 0; i < 5; i++) { const m = this.meta(i); if (m && m.ts > bt) { bt = m.ts; b = i; } } return b; },
  dump() {
    const p = { cls: P.cls.id }; for (const k of SAVE_P) p[k] = P[k];
    const conts = []; for (let i = 0; i < World.nStatic; i++) { const c = World.conts[i]; if (c.items !== null) conts.push([i, c.items]); }
    const nodes = []; for (const n of World.nodes) if (!n.alive) nodes.push([n.id, Math.round(n.regrow * 10) / 10]);
    return {
      v: 3, ts: Date.now(), seed: World.seed, day: G.day, time: Math.round(G.time * 1000) / 1000, endless: G.endless, p, q: Quest.dump(), conts, nodes,
      doors: World.doors.map(d => d.broken ? 2 : d.open ? 1 : 0).join(''),
      bags: World.conts.filter(c => c.bag).map(c => ({ x: Math.round(c.cx * 100) / 100, z: Math.round(c.cz * 100) / 100, items: c.items })),
      base: { lv: Base.lv, stash: Base.stash.items, structs: Base.structs.map(s => ({ id: s.id, x: s.x, z: s.z, hp: Math.round(s.hp), open: s.open ? 1 : 0, stock: s.stock })) },
    };
  },
  write() {
    if (!P || P.dead || G.state !== 'play') return false;
    try { localStorage.setItem(this.key(this.slot), JSON.stringify(this.dump())); this.ok = true; return true; }
    catch (e) { if (this.ok) UI.notify('Не вдалося зберегти гру: браузер не дає місця для збережень.', 'bad'); this.ok = false; return false; }
  },
  auto(force) { if (!force) return false; this.t = 45; const ok = this.write(); if (ok) UI.saved(); return ok; },
  tick(dt) {
    this.t -= dt; if (this.t > 0) return; this.t = 45;
    if (P.dead || Base.sleeping || G.state !== 'play') return;
    if (Zs.some(z => !z.dead && z.alert > 0 && dist2(z.x, z.z, P.x, P.z) < 144)) { this.t = 6; return; }
    if (this.write()) UI.saved();
  },
  /* після генерації світу, до побудови мешів */
  apply(d) {
    for (const e of d.conts) { const c = World.conts[e[0]]; if (c) { c.items = e[1]; c.searched = true; } }
    World.doors.forEach((dr, i) => { const v = d.doors[i]; if (v === '2') breakDoor(dr); else setDoor(dr, v === '1'); });
  },
  /* після побудови мешів і створення гравця */
  applyLate(d) {
    for (const e of d.nodes) { const n = World.nodes[e[0]]; if (n) { killNode(n, true); n.regrow = e[1]; } }
    for (const b of d.bags) dropBag(b.x, b.z, b.items);
    Base.lv = clamp(d.base.lv || 1, 1, BASE_LV.length); rebuildCore(); Base.stash.items = d.base.stash || [];
    for (const s of d.base.structs) { const def = BUILDS.find(b => b.id === s.id); if (def && inMap(s.x, s.z)) placeStruct(def, s.x, s.z, s); }
  },
};
