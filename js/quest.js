'use strict';
/* ═══════════ навчання на початку гри та сюжетна лінія ═══════════ */
const TUT_END = 13;
const Quest = {
  stage: 0, c: {}, ref: {}, timer: 0, wave: 0, done: false, tutZ: null, lx: 0, lz: 0,
  ev(k, n) { this.c[k] = (this.c[k] || 0) + (n === undefined ? 1 : n); },
  n(k) { return (this.c[k] || 0) - (this.ref[k] || 0); },
  has(id) { return invCount(id) > 0 || Object.keys(P.eq).some(k => P.eq[k] && P.eq[k].id === id); },
  bpos(type) { const b = (World.byType[type] || [])[0]; if (!b) return null; const c = b.questCont; return c && c.items === null ? { x: c.cx, z: c.cz } : { x: b.x0 + b.w / 2, z: b.z0 + b.h / 2 }; },
  core() { return { x: World.core.cx, z: World.core.cz + 1.5 }; },
  stages: [
    { t: 'Навчання: рух', d: () => 'Пройдися табором. WASD — рух, герой дивиться туди, де курсор.', ok: () => Quest.n('moved') >= 6 },
    { t: 'Навчання: камера', d: () => 'Затисни праву кнопку миші й поверни камеру. Коліщатко змінює масштаб.', ok: () => Math.abs(Cam.yaw - Quest.ref.yaw) > 0.4 || Math.abs(Cam.dist - Quest.ref.dist) > 4 },
    { t: 'Навчання: припаси', d: () => 'Підійди до ящика біля намету й натисни E. Ще раз E — забрати все.', mk: () => ({ x: World.starter.cx, z: World.starter.cz }), ok: () => World.starter.items.length === 0 },
    { t: 'Навчання: інвентар', d: () => 'Відкрий інвентар (Tab) і клацни по консервах або воді, щоб поїсти чи попити.', ok: () => Quest.n('food') > 0 },
    { t: 'Навчання: збирання', d: () => `Обривай кущі та підбирай каміння клавішею E. Деревина ${Math.min(2, resCount('wood'))}/2 · камінь ${Math.min(2, resCount('stone'))}/2 · волокно ${Math.min(1, resCount('fiber'))}/1`, ok: () => Quest.has('stoneaxe') || (resCount('wood') >= 2 && resCount('stone') >= 2 && resCount('fiber') >= 1) },
    { t: 'Навчання: інструмент', d: () => 'В інвентарі (Tab) є «Майстерня». Зроби кам\'яну сокиру й клацни по ній, щоб узяти в руки.', ok: () => { const w = activeWeapon(); return !!(w && ITEMS[w.id].chop) || Quest.n('tree') > 0; } },
    { t: 'Навчання: лісоруб', d: () => 'Підійди до дерева й рубай його лівою кнопкою миші, доки не впаде.', mk: () => Quest.ref.treePos, ok: () => Quest.n('tree') > 0 },
    { t: 'Навчання: будівництво', d: () => `Натисни B, вибери «Багаття» і клацни на вільному місці біля намету. Деревина ${Math.min(4, resCount('wood'))}/4 · камінь ${Math.min(4, resCount('stone'))}/4`, ok: () => (Quest.c.b_fire || 0) > 0 },
    { t: 'Навчання: верстак', d: () => `Так само постав верстак. Потім підійди до нього й натисни E — відкриються його рецепти. Деревина ${Math.min(8, resCount('wood'))}/8 · камінь ${Math.min(2, resCount('stone'))}/2`, ok: () => (Quest.c.b_bench || 0) > 0 },
    { t: 'Навчання: бій', d: () => 'До табору вийшов мертвяк! Ліва кнопка — удар, пробіл — відштовхнути, V — ухил від удару. Убий його.', mk: () => Quest.tutZ && !Quest.tutZ.dead ? { x: Quest.tutZ.x, z: Quest.tutZ.z } : null,
      enter: () => { if (spawnAround(1, true, 9, 12, 'walker', true)) { const z = Zs[Zs.length - 1]; z.hp = z.maxHp = 34; z.spd *= 0.8; Quest.tutZ = z; } }, ok: () => !Quest.tutZ || Quest.tutZ.dead },
    { t: 'Навчання: розвиток', d: () => 'Новий рівень! Натисни P і вклади очки: «+» біля атрибута або перк із жовтою рамкою.', enter: () => { if (P.attrPts + P.perkPts === 0) addXP(xpNeed(P.level) - P.xp + 1); }, ok: () => Quest.n('spent') > 0 },
    { t: 'Навчання: склад', d: () => `Постав скриню (B). Усе, що лежить на складі, доступне для будівництва й крафту в межах бази. Деревина ${Math.min(6, resCount('wood'))}/6`, ok: () => (Quest.c.b_chest || 0) > 0 },
    { t: 'Навчання: орієнтування', d: () => 'Натисни M: на мапі видно табір, місто й позначку завдання. F — ліхтарик, Shift — біг, C — скрадання, H — лікування. Гра зберігається сама.', ok: () => Quest.n('map') > 0 },
    { t: 'Стоянка', xp: 80, d: () => 'Збери 20 деревини, 12 каменю й 3 мотузки (волокно → мотузка) та покращ базу: підійди до намету й натисни E.', mk: () => Quest.core(), ok: () => Base.lv >= 2 },
    { t: 'Вилазка в місто', xp: 80, d: () => 'Ґрунтова дорога від табору веде до міста. Знайди аптеку — там ліки й бинти.', mk: () => Quest.bpos('clinic'), ok: () => { const b = (World.byType.clinic || [])[0]; return !b || T.bid[idx(P.x | 0, P.z | 0)] === b.id; } },
    { t: 'Залізо', xp: 100, d: () => 'Збудуй піч, добудь кайлом руду в кар\'єрі (жовта позначка на мапі) й виплав перший злиток.', mk: () => ({ x: World.quarry.cx, z: World.quarry.cz }), ok: () => (Quest.c.c_ingot || 0) > 0 },
    { t: 'Зв\'язок', xp: 120, d: () => 'Знайди рацію в поліцейській дільниці.', mk: () => Quest.bpos('police'), ok: () => Quest.has('radio') },
    { t: 'Живлення', xp: 120, d: () => 'Знайди акумулятор в автомайстерні.', mk: () => Quest.bpos('workshop'), ok: () => Quest.has('battery') },
    { t: 'Форпост', xp: 150, d: () => `Покращ базу до 3 рівня (зараз ${Base.lv}), збудуй кузню й викуй антену-підсилювач.`, mk: () => Quest.core(), ok: () => Quest.has('antenna') },
    { t: 'Сигнал', xp: 150, d: () => 'Віднеси рацію, акумулятор і антену до радіовежі (позначка на мапі) та ввімкни передавач.', mk: () => ({ x: World.console.cx, z: World.console.cz }) },
    { t: 'Тримай оборону', xp: 300, d: () => 'Сигнал почули всі. Протримайся, доки летить гелікоптер!', mk: () => ({ x: World.tower.cx, z: World.tower.cz + 2 }) },
    { t: 'Евакуація', d: () => 'Гелікоптер сідає. Біжи на майданчик!', mk: () => ({ x: World.helipad.cx, z: World.helipad.cz }) },
  ],
  reset(skipTut) { this.stage = skipTut ? TUT_END : 0; this.c = {}; this.timer = 0; this.wave = 0; this.done = false; this.tutZ = null; this.lx = P.x; this.lz = P.z; this.begin(); },
  load(q) { this.stage = q.stage; this.c = q.c || {}; this.timer = q.timer || 0; this.wave = 2; this.done = !!q.done; this.tutZ = null; this.lx = P.x; this.lz = P.z; this.begin(true); if (this.stage === 21) { const h = World.heli; h.state = 2; h.y = 0; h.g.visible = true; h.g.position.y = 0; } },
  dump() { return { stage: this.stage, c: this.c, timer: this.timer, done: this.done }; },
  begin(loaded) {
    this.ref = Object.assign({}, this.c, { yaw: Cam.yaw, dist: Cam.dist });
    const s = this.stages[this.stage]; if (this.done || !s) return;
    if (this.stage === 6) { let b = null, bd = 1e9; for (const n of World.nodes) { if (n.type !== 'tree' || !n.alive) continue; const d = dist2(n.cx, n.cz, P.x, P.z); if (d < bd) { bd = d; b = n; } } this.ref.treePos = b ? { x: b.cx, z: b.cz } : null; }
    if (s.enter && !loaded) s.enter();
  },
  isTut() { return !this.done && this.stage < TUT_END; },
  skipTut() { if (!this.isTut()) return; this.stage = TUT_END; this.tutZ = null; this.begin(); UI.notify('Навчання пропущено. Підказки лишилися в завданнях.'); },
  cur() { return this.done ? { t: 'Вільне виживання' } : this.stages[this.stage]; },
  desc() { return this.done ? 'Ти лишився. Розбудовуй базу й рахуй пережиті ночі.' : this.stages[this.stage].d(); },
  timerText() { return this.stage === 20 && !this.done ? 'Гелікоптер прибуде через ' + Math.ceil(this.timer) + ' с' : ''; },
  marker() { if (this.done) return null; const s = this.stages[this.stage]; return s && s.mk ? s.mk() : null; },
  advance() {
    const s = this.stages[this.stage], tut = this.stage < TUT_END; addXP(s.xp || 12); UI.notify('Виконано: ' + s.t, 'lvl'); if (tut) SFX.pick(); else SFX.level();
    this.stage++;
    if (this.stage === TUT_END) UI.notify('Навчання завершено. Далі — розбудова бази й дорога до евакуації.', 'good');
    if (this.stage === 20) { this.timer = 110; this.wave = 2; UI.notify('Передавач працює. Тримайся!', 'bad'); SFX.drone(); }
    if (this.stage === 21) { const h = World.heli; h.state = 1; h.g.visible = true; h.y = 42; UI.notify('Гелікоптер над лісом! До майданчика!', 'lvl'); }
    this.begin(); if (!tut) Save.auto(true);
  },
  onLoot() {}, onItem() {},
  useConsole() {
    if (this.stage !== 19 || this.done) return;
    if (!invCount('radio') || !invCount('battery') || !invCount('antenna')) { UI.notify('Потрібні рація, акумулятор і антена.', 'bad'); return; }
    invRemove('radio', 1); invRemove('battery', 1); invRemove('antenna', 1); this.advance();
  },
  update(dt) {
    const h = World.heli;
    if (h && h.state > 0) {
      h.rotor.rotation.y += dt * 22; h.tr.rotation.x += dt * 30;
      if (h.state === 1) { h.y = Math.max(0, h.y - dt * 4.2); h.g.position.y = h.y; if (h.y > 6) h.g.rotation.y += dt * 0.5; if (h.y <= 0) h.state = 2; if (h.y < 8) spawnParts(2, World.helipad.cx + rnd(-3, 3), 0.1, World.helipad.cz + rnd(-3, 3), 0, 1, 0, 3, 0x9a9484, 0.5, 0.06, 2); }
      G.heliT -= dt; if (G.heliT <= 0) { G.heliT = 0.11; SFX.noise(0.07, 220, 70, SFX.att(Math.hypot(P.x - World.helipad.cx, P.z - World.helipad.cz) * 0.35) * 0.35); }
    }
    if (this.done || P.dead) return;
    this.ev('moved', Math.hypot(P.x - this.lx, P.z - this.lz)); this.lx = P.x; this.lz = P.z;
    const s = this.stages[this.stage];
    if (this.stage === 20) {
      this.timer -= dt; this.wave -= dt;
      if (this.wave <= 0) { this.wave = 7; spawnAround(rndi(3, 5), 2, 22, 32, null, true); }
      if (this.timer <= 0) this.advance();
    } else if (this.stage === 21) {
      if (h.state === 2 && dist2(P.x, P.z, World.helipad.cx, World.helipad.cz) < 9) { this.done = true; G.state = 'won'; SFX.level(); UI.showWin(); }
    } else if (s.ok && s.ok()) this.advance();
  },
};
