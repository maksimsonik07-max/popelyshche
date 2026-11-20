'use strict';
/* ═══════════ погода, звуки довкілля, ухил, вказівник завдання, гілка перків «Майстер» ═══════════ */
PERKS.push(
  { id: 'lumber', br: 'craft', n: 'Лісоруб', lvl: 2, max: 3, d: '+1 деревина з кожного дерева' },
  { id: 'miner', br: 'craft', n: 'Рудокоп', lvl: 3, max: 3, d: '+1 камінь або руда з кожного валуна й жили' },
  { id: 'builder', br: 'craft', n: 'Будівничий', lvl: 3, max: 2, d: 'Нові будівлі на 25% міцніші' },
  { id: 'artisan', br: 'craft', n: 'Умілець', lvl: 4, max: 2, d: 'Крафт на 20% швидший' },
  { id: 'thrifty', br: 'craft', n: 'Ощадливий', lvl: 5, max: 1, d: '20% шанс не витратити матеріали під час крафту' }
);
BRANCHES.craft = 'Майстер';

const Weather = {
  rain: 0, target: 0, next: 8, N: 700, ls: null, pos: null, gray: null, gain: null,
  init(scene) {
    this.pos = new Float32Array(this.N * 6); for (let i = 0; i < this.N; i++) this.drop(i, true);
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(this.pos, 3));
    this.ls = new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: 0xa8bcd0, transparent: true, opacity: 0, depthWrite: false }));
    this.ls.frustumCulled = false; this.ls.visible = false; scene.add(this.ls); this.gray = new THREE.Color(0x4a525c);
  },
  drop(i, any) { const p = this.pos, j = i * 6, x = (Math.random() - 0.5) * 46, z = (Math.random() - 0.5) * 46, y = any ? Math.random() * 20 : 20; p[j] = x; p[j + 1] = y; p[j + 2] = z; p[j + 3] = x + 0.12; p[j + 4] = y - 0.9; p[j + 5] = z + 0.05; },
  /* краплі, сіре небо й ближчий туман; викликається після updateEnv */
  visual(dt, cx, cz, ramp) {
    this.rain = moveTo(this.rain, this.target, dt * (ramp || 0.09));
    const ls = this.ls; ls.visible = this.rain > 0.01; if (!ls.visible) return;
    ls.position.set(cx, 0, cz); ls.material.opacity = 0.42 * this.rain; const p = this.pos, v = 26 * dt, w = 3 * dt;
    for (let i = 0; i < this.N; i++) { const j = i * 6; p[j + 1] -= v; p[j + 4] -= v; p[j] += w; p[j + 3] += w; if (p[j + 4] < 0) this.drop(i); }
    ls.geometry.attributes.position.needsUpdate = true;
    Env.sun.intensity *= 1 - 0.45 * this.rain; Env.bg.lerp(this.gray, 0.45 * this.rain * (1 - Env.night * 0.7)); Env.fog.color.copy(Env.bg); Env.fog.far -= 16 * this.rain;
  },
  logic(dt) {
    if (G.abs >= this.next) {
      if (this.target) { this.target = 0; this.next = G.abs + rnd(6, 14); UI.notify('Дощ ущух.'); }
      else if (chance(0.45) && !Quest.isTut()) {
        this.target = 1; this.next = G.abs + rnd(2, 5); UI.notify('Починається дощ: мертві гірше бачать і чують, збирачі води наповнюються.', 'good');
        for (const s of Base.structs) if (s.id === 'water') s.stock = Math.min(3, s.stock + 1);
      } else this.next = G.abs + rnd(3, 8);
    }
    if (this.rain > 0.3 && chance(dt * 14)) spawnParts(1, P.x + rnd(-7, 7), 0.05, P.z + rnd(-7, 7), 0, 1.4, 0, 0.5, 0xa8bcd0, 0.25, 0.04);
  },
  audio() {
    const c = SFX.ctx; if (!c) return;
    if (!this.gain) { const s = c.createBufferSource(); s.buffer = SFX.nb; s.loop = true; const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 2200; f.Q.value = 0.6; this.gain = c.createGain(); this.gain.gain.value = 0; s.connect(f); f.connect(this.gain); this.gain.connect(SFX.out); s.start(); }
    this.gain.gain.value = this.rain * 0.16;
  },
};
const Amb = { t: 3 }, QP = { t: 0, v: null };
function ambient(dt) {
  Amb.t -= dt; if (Amb.t > 0 || !SFX.ctx) return; Amb.t = rnd(2.5, 7);
  if (Base.structs.some(s => s.id === 'fire' && dist2(s.cx, s.cz, P.x, P.z) < 64)) { SFX.noise(0.04, 2400, 700, 0.07); if (chance(0.5)) SFX.noise(0.03, 3000, 900, 0.05); Amb.t = rnd(0.4, 1.6); return; }
  if (Weather.rain > 0.5 || (P.x >= TOWN0 && P.z >= TOWN0)) return;
  if (Env.night > 0.5) for (let k = 0; k < 3; k++) SFX.tone(4300, 4300, 0.05, 0.018, 'sine', k * 0.09);
  else { const f = rnd(2300, 3400); SFX.tone(f, f * 1.25, 0.09, 0.03, 'sine'); if (chance(0.6)) SFX.tone(f * 1.2, f, 0.08, 0.025, 'sine', 0.14); }
}
/* ухил: короткий ривок із невразливістю */
function dodge() {
  if (P.dead || Base.sleeping || (P.dodgeCd || 0) > 0) return;
  if (P.stam < 14) { UI.notify('Бракує сил для ухилу.', 'bad'); return; }
  let dx = P.vx, dz = P.vz; const l = Math.hypot(dx, dz); if (l < 0.5) { dx = Math.sin(P.rot); dz = Math.cos(P.rot); } else { dx /= l; dz /= l; }
  P.kx += dx * 13; P.kz += dz * 13; P.stam -= 14; P.stamDelay = 0.6; P.dodgeCd = 0.9; P.iframe = 0.32; P.dodgeT = 0.3; P.swing = null;
  SFX.swing(); spawnParts(6, P.x, 0.15, P.z, -dx, 0.8, -dz, 1.2, 0x8a8370, 0.45, 0.07); skillXP('fit', 1);
}
/* відстань до цілі завдання і стрілка на краю екрана, коли ціль поза кадром */
function questPointer(dt) {
  QP.t -= dt; const m = Quest.marker(), ar = $('qArrow');
  if (QP.t <= 0) { QP.t = 0.25; $('questDist').textContent = m ? Math.round(Math.hypot(m.x - P.x, m.z - P.z)) + ' м' : ''; }
  if (!m || P.dead || UI.modal()) { ar.hidden = true; return; }
  const v = QP.v || (QP.v = new THREE.Vector3()); v.set(m.x, 1, m.z).project(G.camera);
  const on = v.z < 1 && Math.abs(v.x) < 0.92 && Math.abs(v.y) < 0.88; ar.hidden = on; if (on) return;
  let x = v.x, y = v.y; if (v.z > 1) { x = -x; y = -y; }
  const k = 0.86 / Math.max(Math.abs(x), Math.abs(y), 0.001); x *= k; y *= k;
  ar.style.left = ((x * 0.5 + 0.5) * innerWidth).toFixed(0) + 'px'; ar.style.top = ((-y * 0.5 + 0.5) * innerHeight).toFixed(0) + 'px';
  ar.style.transform = `translate(-50%,-50%) rotate(${Math.atan2(-y, x).toFixed(2)}rad)`;
}
function resetExtras() { Weather.target = 0; Weather.rain = 0; Weather.next = G.abs + rnd(5, 10); Amb.t = 3; }
function updateExtras(dt) {
  P.dodgeCd = Math.max(0, (P.dodgeCd || 0) - dt); P.iframe = Math.max(0, (P.iframe || 0) - dt); P.dodgeT = Math.max(0, (P.dodgeT || 0) - dt);
  if (P.dodgeT > 0 && !P.dead) { P.h.body.rotation.x = 0.95; P.h.body.position.y = -0.28; }
  if (P.sprinting && chance(dt * 9)) spawnParts(1, P.x, 0.08, P.z, -P.vx * 0.15, 0.6, -P.vz * 0.15, 0.5, 0x8a8370, 0.4, 0.06, 3);
  if (!P.dead) Weather.logic(dt);
  Weather.visual(dt, Cam.x, Cam.z); Weather.audio(); ambient(dt); questPointer(dt);
}
