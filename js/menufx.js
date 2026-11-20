'use strict';
/* ═══════════ живе тло меню: огляд локацій у різний час доби, блукаючі мертві, іскри, поради ═══════════ */
const TIPS = [
  'V — ухил: короткий ривок, під час якого удари мертвих не влучають.',
  'У дощ мертві гірше бачать і чують — найкращий час для вилазки в місто.',
  'Пошкоджений частокіл чи мур можна полагодити клавішею E за одну одиницю матеріалу.',
  'Мертві чують біг і постріли. Скрадання (C) удвічі скорочує відстань, на якій тебе помічають.',
  'Склад бази доступний для крафту й будівництва, поки ти в межах табору.',
  'Кам\'яна сокира робиться голими руками: 2 деревини, 2 камені, 1 волокно.',
  'Збитого з ніг мертвяка добивати значно легше. Пробіл — поштовх.',
  'Частокіл не зупинить орду, але дасть час: мертві ламають усе, що стоїть на їхньому шляху.',
  'Руда й сірка — в кар\'єрі, він підписаний на мапі. Без кайла там нічого робити.',
  'Мертві не знають, де ти: вони помічають тебе лише зблизька або йдуть на шум. Сховайся з очей — і вони загублять слід.',
  'Кожен новий світ інший: тип місцевості, розташування табору, озера, вежі й кар\'єру щоразу змінюються.',
  'Уночі мертві швидші. Лежанка дозволяє проспати темряву, якщо поруч тихо.',
  'Після укусу шукай антибіотики: інфекція сама не минає.',
  'Якість знайденої зброї залежить від удачі, а викуваної — від навички ремесла.',
  'Грядка і збирач води дають їжу й воду щоранку — розбудована база годує себе сама.',
  'Арбалет майже безшумний: з ним можна не скликати на себе все місто.',
  'Гра зберігається сама щохвилини, коли поруч немає мертвих.',
  'Багаття не лише готує їжу: біля вогню рани гояться швидше.',
  'Зрубані дерева й розбиті валуни з часом відновлюються — ліс не скінчиться.',
];
const MenuFX = {
  i: 0, t: 0, time: 12, scenes: [], tipT: 0, tip: 0, cv: null, g: null, sp: [], still: false,
  init() {
    this.cv = $('menuFx'); this.g = this.cv.getContext('2d'); this.still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    for (let k = 0; k < 90; k++) this.sp.push(this.spark({}, true));
    this.tip = (Math.random() * TIPS.length) | 0; $('menuTip').textContent = TIPS[this.tip];
  },
  spark(s, any) {
    const ash = Math.random() < 0.3; s.ash = ash; s.x = Math.random(); s.y = any ? Math.random() : (ash ? -0.05 : 1.05);
    s.vx = rnd(-0.01, 0.03); s.vy = ash ? rnd(0.015, 0.04) : -rnd(0.03, 0.09); s.r = ash ? rnd(1, 2.4) : rnd(0.8, 2.2); s.ph = rnd(6.28); s.life = rnd(4, 11); return s;
  },
  build() {
    const R = World.roads, tw = World.tower || { cx: World.camp.x, cz: World.camp.z };
    this.scenes = [
      { n: 'Табір', tn: 'вечір, перше багаття', x: World.camp.x + 2, z: World.camp.z + 1, time: 18.7, dist: 27, pitch: 0.6, zs: 3, zr: [13, 19] },
      { n: 'Місто', tn: 'полудень, вулиці мертвих', x: R[1] + 2, z: R[1] + 2, time: 12.4, dist: 36, pitch: 0.72, zs: 12, zr: [3, 17] },
      { n: 'Кар\'єр', tn: 'світанок, руда й камінь', x: World.quarry.cx, z: World.quarry.cz, time: 6.9, dist: 32, pitch: 0.62, zs: 4, zr: [6, 15] },
      { n: 'Озеро', tn: 'дощ на заході сонця', x: World.lake.cx + 4, z: World.lake.cz, time: 19.3, dist: 34, pitch: 0.55, zs: 5, zr: [9, 16], rain: 1 },
      { n: 'Радіовежа', tn: 'ніч, останній шанс на сигнал', x: tw.cx - 3, z: tw.cz - 3, time: 23.2, dist: 33, pitch: 0.6, zs: 7, zr: [5, 15] },
    ];
    if (!Base.structs.some(s => s.id === 'fire')) {
      const c = World.core;
      for (const e of [['fire', 2, 1], ['torch', -2, 2]]) { const x = c.x + e[1], z = c.z + e[2], i = idx(x, z); if (!T.solid[i] && !Base.at[i]) placeStruct(BUILDS.find(b => b.id === e[0]), x, z, { hp: 50 }); }
    }
    this.i = (Math.random() * this.scenes.length) | 0; this.enter();
  },
  enter() {
    const s = this.scenes[this.i]; this.t = 0; this.time = s.time; Cam.yaw = rnd(6.28); Cam.dist = s.dist; Cam.pitch = s.pitch; Cam.x = s.x; Cam.z = s.z;
    clearZombies();
    for (let k = 0, t = 0; k < s.zs && t < 300; t++) {
      const a = rnd(6.283), r = rnd(s.zr[0], s.zr[1]), x = Math.floor(s.x + Math.sin(a) * r), z = Math.floor(s.z + Math.cos(a) * r);
      if (x < 2 || z < 2 || x > MAP - 3 || z > MAP - 3) continue; const i = idx(x, z); if (T.solid[i] || T.kind[i]) continue;
      const zb = spawnZombie(wpick(zWeights(3))[0], x + 0.5, z + 0.5, false); zb.wanderT = rnd(0, 2); k++;
    }
    $('sceneCap').innerHTML = `${s.n}<small>${s.tn}</small>`;
  },
  update(dt) {
    const s = this.scenes[this.i]; if (!s) return; G.t += dt; this.t += dt; const D = 13;
    if (!this.still) { Cam.yaw += dt * 0.05; Cam.dist = s.dist + Math.sin(this.t * 0.25) * 2; this.time += dt * 0.02; }
    placeCamera(dt); updateEnv(this.time % 24, Cam.x, Cam.z, Cam.dist); updateBuildings(dt, -99, -99, 0); Weather.target = s.rain ? 1 : 0; Weather.visual(dt, Cam.x, Cam.z, 0.6);
    $('menuFade').style.opacity = this.still ? 0 : Math.max(0, 1 - this.t / 0.9, (this.t - (D - 0.9)) / 0.9);
    if (this.t >= D && !this.still) { this.i = (this.i + 1) % this.scenes.length; this.enter(); }
    for (const z of Zs) {
      z.wanderT -= dt; if (z.wanderT <= 0) { z.wanderT = rnd(2, 6); const a = rnd(6.28), r = rnd(2, 6); z.wx = z.x + Math.sin(a) * r; z.wz = z.z + Math.cos(a) * r; }
      const dx = z.wx - z.x, dz = z.wz - z.z, l = Math.hypot(dx, dz), mv = l > 0.4, spd = mv ? z.spd * 0.45 : 0;
      if (mv) { z.x += dx / l * spd * dt; z.z += dz / l * spd * dt; z.rot += angDiff(Math.atan2(dx, dz), z.rot) * Math.min(1, dt * 4); collide(z, 0.3); }
      z.h.g.position.set(z.x, 0, z.z); z.h.g.rotation.y = z.rot; animZombie(z, dt, mv, spd);
    }
    for (const st of Base.structs) if (st.flame) { const f = 1 + Math.sin(G.t * 13 + st.ph) * 0.14 + Math.sin(G.t * 29 + st.ph * 2) * 0.08; st.flame.scale.y = (st.id === 'torch' ? 0.6 : 1) * f; st.flame.rotation.y = G.t * 2; st.glow.material.opacity = 0.16 + Env.night * 0.62; }
    this.tipT += dt;
    if (this.tipT > 7) { this.tipT = 0; this.tip = (this.tip + 1) % TIPS.length; const e = $('menuTip'), k = this.tip; e.style.opacity = 0; setTimeout(() => { e.textContent = TIPS[k]; e.style.opacity = 1; }, 480); }
    this.draw(dt);
  },
  draw(dt) {
    const cv = this.cv, g = this.g, W = cv.clientWidth, H = cv.clientHeight; if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
    g.clearRect(0, 0, W, H); if (this.still) return;
    for (const s of this.sp) {
      s.life -= dt; s.x += (s.vx + Math.sin(G.t * 0.7 + s.ph) * 0.012) * dt; s.y += s.vy * dt;
      if (s.life <= 0 || s.y < -0.08 || s.y > 1.08 || s.x > 1.05) this.spark(s);
      const a = Math.min(1, s.life) * (s.ash ? 0.35 : 0.55 + 0.45 * Math.sin(G.t * 6 + s.ph));
      g.globalCompositeOperation = s.ash ? 'source-over' : 'lighter'; g.fillStyle = s.ash ? `rgba(190,186,170,${a})` : `rgba(255,${150 + ((s.ph * 12) | 0)},60,${a})`;
      g.beginPath(); g.arc(s.x * W, s.y * H, s.r, 0, 6.3); g.fill();
    }
  },
  stop() { $('menuFade').style.opacity = 0; this.g.clearRect(0, 0, this.cv.width, this.cv.height); },
};
