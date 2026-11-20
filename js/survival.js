'use strict';
/* ═══════════ виживання й оборона бази: втома, швидке харчування, озеро, відвар, стрілецька вежа, тривога ═══════════ */
ITEMS.herbal = { n: 'Трав\'яний відвар', t: 'med', ic: '🌿', w: 0.3, hp: 8, cure: true, d: 'Варять на багатті з ягід і волокна. Зупиняє інфекцію без аптечних ліків.' };
RECIPES.push({ out: 'herbal', need: { berries: 4, fiber: 2, water: 1 }, st: 'fire' });
BUILDS.push({ id: 'turret', n: 'Стрілецька вежа', cost: { plank: 8, ingot: 4, rope: 2 }, base: 3, hp: 180, d: 'Сама стріляє в мертвих поблизу болтами зі складу бази.' });
SAVE_P.push('fatigue');
TIPS.push('G — швидко поїсти або попити найкращим, що є в рюкзаку.', 'З озера можна пити досхочу — клавіша E на березі.', 'Втома накопичується за день: виспись на лежанці, інакше сили відновлюватимуться повільніше.', 'Стрілецька вежа бере болти зі складу бази — тримай їх у скрині.');

{ // модель вежі
  const sd = structDetail;
  structDetail = function (B, legs, id) {
    if (id !== 'turret') return sd(B, legs, id);
    for (const sx of [-0.45, 0.37]) for (const sz of [-0.45, 0.37]) B(sx, 0, sz, sx + 0.08, 1.6, sz + 0.08, 0x6f5530);
    B(-0.47, 0.7, -0.47, 0.47, 0.78, -0.41, 0x5a3d27); B(-0.47, 0.7, 0.41, 0.47, 0.78, 0.47, 0x5a3d27); B(-0.47, 0.7, -0.47, -0.41, 0.78, 0.47, 0x5a3d27); B(0.41, 0.7, -0.47, 0.47, 0.78, 0.47, 0x5a3d27);
    B(-0.5, 1.6, -0.5, 0.5, 1.7, 0.5, 0x9a7a52); B(-0.5, 1.7, -0.5, 0.5, 1.95, -0.44, 0x7d6038); B(-0.5, 1.7, 0.44, 0.5, 1.95, 0.5, 0x7d6038); B(-0.5, 1.7, -0.5, -0.44, 1.95, 0.5, 0x7d6038); B(0.44, 1.7, -0.5, 0.5, 1.95, 0.5, 0x7d6038);
    B(-0.05, 1.7, -0.05, 0.05, 2.15, 0.05, 0x4a4f55); B(-0.04, 2.15, -0.32, 0.04, 2.23, 0.32, 0x6a4a2a); B(-0.36, 2.17, 0.18, 0.36, 2.22, 0.24, 0x3a3d42); B(-0.012, 2.23, -0.2, 0.012, 2.25, 0.3, 0xc9b28a);
    return true;
  };
  const sp = structPrompt; structPrompt = s => s.id === 'turret' ? `Стрілецька вежа · болтів на складі: ${stashCount('bolt')}` : sp(s);
  const ui = useItem; useItem = function (it) { const id = it.id, ok = ui(it); if (ok && (id === 'energy' || id === 'tea')) P.fatigue = Math.max(0, (P.fatigue || 0) - 25); return ok; };
  const ds = damageStruct;
  damageStruct = function (s, dmg) {
    ds(s, dmg);
    if (P && !P.dead && Math.abs(G.t - (Base.warnT || -99)) > 25) { Base.warnT = G.t; UI.notify('Базу атакують: ' + s.def.n + '!', 'bad'); SFX.drone(); }
  };
  // вода з озера
  const fi = findInteract;
  findInteract = function () {
    const b = fi(), l = (World.lakes || []).find(q => Math.hypot(P.x - q.cx, P.z - q.cz) < q.r + 1.7); if (b || !l) return b;
    const d = Math.hypot(P.x - l.cx, P.z - l.cz); if (d > l.r + 1.7 || d < 0.1) return b;
    const k = (l.r - 0.3) / d; return { t: 'lake', x: l.cx + (P.x - l.cx) * k, z: l.cz + (P.z - l.cz) * k, y: 0.9 };
  };
  const ia = interact;
  interact = function () {
    const t = findInteract(); if (!t || t.t !== 'lake' || P.dead) { ia(); return; }
    if (P.thirst > 95) { UI.notify('Ти не хочеш пити.'); return; }
    P.thirst = Math.min(100, P.thirst + 35); P.gatherT = 0.35; SFX.eat(); UI.floatText(P.x, 2.2, P.z, '+35 води', 'res');
  };
  const it = interactTick; interactTick = function (dt) { it(dt); if (G.target && G.target.t === 'lake') UI.prompt('<kbd>E</kbd> Напитися з озера'); };
  const ue = updateExtras; updateExtras = function (dt) { ue(dt); updateSurvival(dt); };
}
function quickEat() {
  if (P.dead) return; const want = P.thirst < P.hunger ? 'thirst' : 'hunger'; let best = null, bv = 0;
  if (P[want] > 85) { UI.notify('Ти ситий і не хочеш пити.'); return; }
  for (const it of P.inv) { const d = ITEMS[it.id]; if (d.t !== 'food') continue; const v = d[want] || 0; if (v > bv) { bv = v; best = it; } }
  if (!best) { UI.notify(want === 'thirst' ? 'Немає чого випити.' : 'Немає чого з\'їсти.', 'bad'); return; }
  const n = ITEMS[best.id].n; if (useItem(best)) UI.floatText(P.x, 2.3, P.z, n, 'res');
}
function stashTake(id, n) { for (let i = Base.stash.items.length - 1; i >= 0 && n > 0; i--) { const it = Base.stash.items[i]; if (it.id !== id) continue; const t = Math.min(n, it.qty); it.qty -= t; n -= t; if (it.qty <= 0) Base.stash.items.splice(i, 1); } }
function updateSurvival(dt) {
  if (P.dead) return;
  // втома: росте за день, спадає уві сні
  const f0 = P.fatigue || 0; P.fatigue = clamp(f0 + (Base.sleeping ? -0.75 : 0.1) * dt, 0, 100);
  if (f0 < 70 && P.fatigue >= 70) UI.notify('Ти втомився: сили відновлюються повільніше. Виспись на лежанці.', 'bad');
  if (P.fatigue >= 95) P.stam = Math.min(P.stam, maxStam() * 0.6);
  if (Base.sleeping && Env.night < 0.5 && P.fatigue <= 0) wake('Ти відпочив.');
  // стрілецькі вежі
  for (const s of Base.structs) {
    if (s.id !== 'turret') continue; s.cd = (s.cd || 0) - dt; if (s.cd > 0) continue; s.cd = 0.5;
    if (!stashCount('bolt')) continue; let best = null, bd = 100;
    for (const z of Zs) { if (z.dead || z.emerge > 0) continue; const d = dist2(z.x, z.z, s.cx, s.cz); if (d < bd) { bd = d; best = z; } }
    if (!best) continue;
    const l = Math.sqrt(bd) || 1; s.cd = 1.7; s.shake = 0.4; stashTake('bolt', 1); tracer(s.cx, s.cz, best.x, best.z);
    dealDamage(best, 45, { kb: 0.8, dx: (best.x - s.cx) / l, dz: (best.z - s.cz) / l }); SFX.tone(300, 140, 0.1, 0.25 * SFX.att(Math.hypot(s.cx - P.x, s.cz - P.z)), 'triangle');
  }
}
