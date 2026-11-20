'use strict';
/* ═══════════ ресурси бази, крафт із часом, склад, рівні бази, сон ═══════════ */
const hasChest = () => Base.structs.some(s => s.id === 'chest');
function stashCount(id) { let n = 0; for (const it of Base.stash.items) if (it.id === id) n += it.qty; return n; }
function stashWeight() { let w = 0; for (const it of Base.stash.items) w += ITEMS[it.id].w * it.qty; return w; }
const stashCap = () => 120 * Base.structs.filter(s => s.id === 'chest').length;
/* матеріали беруться з рюкзака, а в межах бази — ще й зі складу */
function resCount(id) { return invCount(id) + (inBase(P.x, P.z, 2) && hasChest() ? stashCount(id) : 0); }
function resTake(id, n) {
  const a = Math.min(n, invCount(id)); if (a) invRemove(id, a); n -= a;
  for (let i = Base.stash.items.length - 1; i >= 0 && n > 0; i--) { const it = Base.stash.items[i]; if (it.id !== id) continue; const t = Math.min(n, it.qty); it.qty -= t; n -= t; if (it.qty <= 0) Base.stash.items.splice(i, 1); }
}
function hasCost(c) { for (const k in c) if (resCount(k) < c[k]) return false; return true; }
function payCost(c) { for (const k in c) resTake(k, c[k]); }
function nearStation(st) { for (const s of Base.structs) if (s.def.st === st && dist2(s.cx, s.cz, P.x, P.z) < 10.5) return s; return null; }
function craftWhy(r) {
  if (r.st && !nearStation(r.st)) return 'Потрібно робоче місце: ' + STATIONS[r.st].n;
  if (r.base && Base.lv < r.base) return 'Потрібна база ' + r.base + ' рівня';
  return hasCost(r.need) ? '' : 'Бракує матеріалів';
}
function canCraft(r) { return !craftWhy(r); }
function craftTime(r) { return (r.st ? STATIONS[r.st].t : 1.2) * (1 - 0.04 * P.skills.craft.l) * (1 - 0.2 * perk('artisan')) * (inBase(P.x, P.z) ? 1 - 0.1 * (Base.lv - 1) : 1); }
function craft(r, n) {
  if (P.dead) return; if (P.craft) { UI.notify('Спершу закінчи попередню роботу.'); return; }
  const why = craftWhy(r); if (why) { UI.notify(why, 'bad'); return; }
  P.craft = { r, t: 0, dur: craftTime(r), n: n || 1, sm: 0 }; SFX.craft();
}
function updateCraft(dt) {
  const c = P.craft; if (!c) return;
  if (P.dead || craftWhy(c.r)) { P.craft = null; return; }
  c.t += dt; c.sm -= dt;
  if (c.sm <= 0 && (c.r.st === 'furnace' || c.r.st === 'fire' || c.r.st === 'anvil')) {
    c.sm = 0.18; const s = nearStation(c.r.st);
    if (s) spawnParts(1, s.cx + rnd(-0.1, 0.1), c.r.st === 'furnace' ? 2 : 0.8, s.cz + rnd(-0.1, 0.1), 0, 1.4, 0, 0.3, c.r.st === 'anvil' ? 0xffb04a : 0x8a8a86, 1.1, 0.09, -0.6);
  }
  if (c.t < c.dur) return;
  const r = c.r, d = ITEMS[r.out], gear = d.t === 'melee' || d.t === 'gun';
  if (!(perk('thrifty') && chance(0.2))) payCost(r.need);
  const it = mkItem(r.out, r.qty || 1, gear ? { r: Math.min(3, Math.floor(P.skills.craft.l / 3)), ammo: 0 } : undefined);
  invAdd(it); skillXP('craft', Math.min(20, 3 + 2 * Object.values(r.need).reduce((a, b) => a + b, 0))); addXP(2); SFX.pick();
  UI.floatText(P.x, 2.2, P.z, `+${r.qty || 1} ${d.n}`, 'res'); Quest.ev('c_' + r.out); Quest.onItem(it);
  c.n--; if (c.n > 0 && !craftWhy(r)) { c.t = 0; c.dur = craftTime(r); SFX.craft(); } else P.craft = null;
}
/* ── склад ── */
function stashPut(it, n) {
  const i = P.inv.indexOf(it); if (i < 0) return false;
  if (ITEMS[it.id].t === 'quest') { UI.notify('Це краще тримати при собі.'); return false; }
  n = Math.min(n || it.qty, it.qty);
  if (stashWeight() + ITEMS[it.id].w * n > stashCap()) { UI.notify('Склад переповнений — постав ще одну скриню.', 'bad'); return false; }
  let out; if (isGear(it.id) || n >= it.qty) { P.inv.splice(i, 1); out = it; } else { it.qty -= n; out = { id: it.id, qty: n }; }
  const e = !isGear(out.id) && Base.stash.items.find(o => o.id === out.id); if (e) e.qty += out.qty; else Base.stash.items.push(out);
  return true;
}
function stashAllMats() { let n = 0; for (const it of P.inv.slice()) if (ITEMS[it.id].t === 'mat' && stashPut(it)) n++; if (n) SFX.pick(); else UI.notify('У рюкзаку немає матеріалів.'); }
/* ── рівень бази ── */
function upgradeBase() {
  const nx = BASE_LV[Base.lv]; if (!nx) return;
  if (!inBase(P.x, P.z, 2)) { UI.notify('Покращувати базу можна лише в таборі.', 'bad'); return; }
  if (!hasCost(nx.cost)) { UI.notify('Бракує ресурсів для покращення.', 'bad'); return; }
  payCost(nx.cost); Base.lv++; const sel = Base.sel; rebuildCore(); if (sel) Base.ring.visible = true;
  SFX.level(); ringFX(World.core.cx, World.core.cz, nx.r, 0xffd24a, 1.2); addXP(60 * Base.lv);
  UI.notify(`Базу покращено: ${nx.n} (рівень ${Base.lv})`, 'lvl'); Quest.ev('base');
}
/* ── сон ── */
function trySleep() {
  if (Env.night < 0.5 && (P.fatigue || 0) < 50) { UI.notify('Ти ще не втомився — спати можна вночі або коли зморить утома.'); return; }
  if (Zs.some(z => !z.dead && z.alert > 0 && dist2(z.x, z.z, P.x, P.z) < 400)) { UI.notify('Поруч мертві — не до сну.', 'bad'); return; }
  Base.sleeping = true; P.sneak = false; P.craft = null; buildCancel(); UI.closeAll(); $('sleep').hidden = false;
}
function wake(msg, bad) { if (!Base.sleeping) return; Base.sleeping = false; $('sleep').hidden = true; if (msg) UI.notify(msg, bad ? 'bad' : 'good'); }
function sleepTick() {
  if (!Base.sleeping) return;
  if (Env.night < 0.05 && (P.fatigue || 0) <= 1) { wake('Ранок. Ти виспався.'); Save.auto(true); }
  else if (Zs.some(z => !z.dead && z.alert > 0 && dist2(z.x, z.z, P.x, P.z) < 196)) wake('Щось наближається — ти прокинувся!', true);
}
/* ── взаємодія з будівлями ── */
function structPrompt(s) {
  const d = s.def;
  if (d.block && !d.gate) return s.hp < s.max ? `<kbd>E</kbd> Полагодити: ${d.n} (1 × ${ITEMS[Object.keys(d.cost)[0]].n})` : '';
  if (d.st) return `<kbd>E</kbd> ${d.n}: рецепти`;
  if (s.id === 'chest') return '<kbd>E</kbd> Відкрити скриню';
  if (s.id === 'bed') return '<kbd>E</kbd> Лягти спати';
  if (d.gate) return `<kbd>E</kbd> ${s.open ? 'Зачинити' : 'Відчинити'} ворота`;
  if (s.id === 'garden' || s.id === 'water') return s.stock ? `<kbd>E</kbd> Зібрати: ${s.id === 'garden' ? 'картопля' : 'вода'} ×${s.stock}` : `${d.n}: зазирни вранці`;
  return '';
}
function useStruct(s) {
  const d = s.def;
  if (d.block && !d.gate) {
    const k = Object.keys(d.cost)[0]; if (s.hp >= s.max) return;
    if (resCount(k) < 1) { UI.notify('Для ремонту бракує: ' + ITEMS[k].n, 'bad'); return; }
    resTake(k, 1); s.hp = Math.min(s.max, s.hp + s.max * 0.6); s.pop = 0.5; SFX.build(); return;
  }
  if (d.st) UI.openStation(d.st);
  else if (s.id === 'chest') { Base.stash.cx = s.cx; Base.stash.cz = s.cz; UI.openLoot(Base.stash); }
  else if (s.id === 'bed') trySleep();
  else if (d.gate) {
    if (s.open && (dist2(P.x, P.z, s.cx, s.cz) < 0.5 || Zs.some(z => !z.dead && dist2(z.x, z.z, s.cx, s.cz) < 0.6))) { UI.notify('Щось заважає зачинити ворота.'); return; }
    setGate(s, !s.open); SFX.door();
  } else if (s.id === 'garden' || s.id === 'water') {
    if (!s.stock) { UI.notify('Ще нічого немає — зазирни вранці.'); return; }
    const id = s.id === 'garden' ? 'potato' : 'water'; invAdd({ id, qty: s.stock }); UI.floatText(s.cx, 1.6, s.cz, `+${s.stock} ${ITEMS[id].n}`, 'res'); s.stock = 0; SFX.pick();
  }
}
