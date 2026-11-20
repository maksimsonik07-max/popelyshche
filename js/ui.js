'use strict';
/* ═══════════ інтерфейс: HUD, інвентар, персонаж, мапа ═══════════ */
const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const UI = {
  open: { inv: false, loot: null, char: false, map: false, pause: false }, floats: [], sig: {}, hudT: 0, invT: 0, tip: null, cls: 0, _v: null,

  init() {
    this._v = new THREE.Vector3();
    const fl = $('floaters'); for (let i = 0; i < 44; i++) { const d = document.createElement('div'); d.className = 'fl'; fl.appendChild(d); this.floats.push({ el: d, life: 0, x: 0, y: 0, z: 0 }); }
    // меню класів
    this.initMenu();
    const act = (e, drop) => {
      const c = e.target.closest('[data-src]'); if (!c) return; e.preventDefault();
      const src = c.dataset.src, i = +c.dataset.i;
      if (src === 'inv') { const it = P.inv[i]; if (!it) return; if (drop) this.dropItem(it, e.shiftKey ? it.qty : 1); else if (this.open.loot && this.open.loot.stash) { if (stashPut(it, e.shiftKey ? 1 : 0)) SFX.pick(); this.renderLoot(); } else useItem(it); }
      else if (src === 'eq') { if (P.eq[c.dataset.k]) { unequip(c.dataset.k); SFX.equip(); } }
      else if (src === 'loot') this.takeLoot(i);
      this.hideTip(); this.invT = 0;
    };
    for (const id of ['invGrid', 'eqSlots', 'lootGrid']) {
      $(id).addEventListener('click', e => act(e, false)); $(id).addEventListener('contextmenu', e => act(e, true));
      $(id).addEventListener('mousemove', e => { const c = e.target.closest('[data-src]'); if (!c) return this.hideTip(); const src = c.dataset.src, it = src === 'inv' ? P.inv[+c.dataset.i] : src === 'eq' ? P.eq[c.dataset.k] : this.open.loot && this.open.loot.items[+c.dataset.i]; if (it) this.showTip(it, e, src); else this.hideTip(); });
      $(id).addEventListener('mouseleave', () => this.hideTip());
    }
    $('craftList').addEventListener('click', e => { const b = e.target.closest('button[data-r]'); if (b) { craft(RECIPES[+b.dataset.r], +b.dataset.n || 1); this.sig.inv = ''; this.invT = 0; } });
    $('lootAll').addEventListener('click', () => { const c = this.open.loot; if (c && c.stash) { stashAllMats(); this.renderLoot(); this.sig.inv = ''; } else this.takeAll(); });
    $('charBody').addEventListener('click', e => {
      const a = e.target.closest('[data-attr]'), p = e.target.closest('[data-perk]');
      if (a && P.attrPts > 0 && P.attrs[a.dataset.attr] < 10) { const k = a.dataset.attr, hp0 = maxHP(); P.attrs[k]++; P.attrPts--; Quest.ev('spent'); if (k === 'end') P.hp += maxHP() - hp0; SFX.pick(); this.renderChar(); }
      if (p) { const pk = PERKS.find(x => x.id === p.dataset.perk), r = perk(pk.id); if (P.perkPts > 0 && P.level >= pk.lvl && r < pk.max) { P.perks[pk.id] = r + 1; P.perkPts--; Quest.ev('spent'); SFX.level(); this.renderChar(); } }
    });
    for (const b of document.querySelectorAll('[data-close]')) b.addEventListener('click', () => this.closeAll());
  },
  modal() { return this.open.char || this.open.map || this.open.pause || this.open.base || G.state !== 'play'; },
  anyPanel() { const o = this.open; return o.inv || o.loot || o.char || o.map || o.base || o.build; },
  syncPause() { G.paused = this.open.char || this.open.map || this.open.pause; },
  closeAll() { const o = this.open; o.inv = false; o.loot = null; o.char = false; o.map = false; $('invPanel').hidden = $('lootPanel').hidden = $('charPanel').hidden = $('mapPanel').hidden = $('basePanel').hidden = $('buildPanel').hidden = true; o.base = o.build = false; this.station = null; this.hideTip(); this.syncPause(); },
  toggleInv(v) { const o = this.open; o.inv = v === undefined ? !o.inv : v; if (!o.inv && o.loot) { o.loot = null; $('lootPanel').hidden = true; } $('invPanel').hidden = !o.inv; if (!o.inv) this.station = null; this.hideTip(); if (o.inv) { this.sig.inv = ''; this.renderInv(); } },
  toggleChar() { const o = this.open; o.char = !o.char; o.map = false; $('mapPanel').hidden = true; $('charPanel').hidden = !o.char; if (o.char) this.renderChar(); this.hideTip(); this.syncPause(); },
  toggleMap() { const o = this.open; o.map = !o.map; o.char = false; $('charPanel').hidden = true; $('mapPanel').hidden = !o.map; if (o.map) { this.drawBigMap(); Quest.ev('map'); } this.syncPause(); },
  togglePause(v) { const o = this.open; o.pause = v === undefined ? !o.pause : v; $('pause').hidden = !o.pause; this.syncPause(); },

  notify(text, cls) {
    const l = $('log'), d = document.createElement('div'); d.className = 'ln ' + (cls || ''); d.textContent = text; l.appendChild(d);
    while (l.children.length > 6) l.removeChild(l.firstChild);
    setTimeout(() => d.classList.add('out'), 5200); setTimeout(() => d.remove(), 6000);
  },
  floatText(x, y, z, text, cls) {
    let f = this.floats.find(f => f.life <= 0); if (!f) return;
    f.life = 0.9; f.x = x + rnd(-0.25, 0.25); f.y = y; f.z = z + rnd(-0.25, 0.25); f.el.textContent = text; f.el.className = 'fl on ' + (cls || '');
  },
  /* ── схованки ── */
  openLoot(c) {
    if (c.items === null) {
      c.items = genLoot(c.kind, c); c.searched = true; P.looted++; addXP(3); skillXP('scav', 5); Quest.onLoot(c);
      if (c.quest) this.notify('Знайдено: ' + ITEMS[c.quest].n, 'lvl');
    }
    this.open.loot = c; $('lootTitle').textContent = c.name; $('lootPanel').hidden = false; this.toggleInv(true); this.renderLoot(); SFX.open();
  },
  closeLoot() { this.open.loot = null; $('lootPanel').hidden = true; this.hideTip(); },
  afterLoot(c) {
    if (c.items.length) return;
    if (c.bag) { World.group.remove(c.mesh); const i = World.conts.indexOf(c); if (i >= 0) World.conts.splice(i, 1); this.closeLoot(); }
    else if (c.mesh && (c.kind === 'shelf' || c.kind === 'toolshelf')) c.mesh.geometry = contGeo(c.kind + '_e');
  },
  takeLoot(i) { const c = this.open.loot; if (!c || !c.items[i]) return; const it = c.items.splice(i, 1)[0]; invAdd(it); SFX.pick(); Quest.onItem(it); this.afterLoot(c); this.renderLoot(); this.invT = 0; },
  takeAll() { const c = this.open.loot; if (!c) return; for (const it of c.items) { invAdd(it); Quest.onItem(it); } if (c.items.length) SFX.pick(); c.items.length = 0; this.afterLoot(c); this.closeLoot(); this.invT = 0; },
  dropItem(it, n) {
    const i = P.inv.indexOf(it); if (i < 0) return; if (ITEMS[it.id].t === 'quest') { this.notify('Це ще знадобиться.'); return; }
    let out; if (isGear(it.id) || n >= it.qty) { P.inv.splice(i, 1); out = it; } else { it.qty -= n; out = { id: it.id, qty: n }; }
    const near = World.conts.find(c => c.bag && dist2(c.cx, c.cz, P.x, P.z) < 1);
    if (near) { const e = !isGear(out.id) && near.items.find(o => o.id === out.id); if (e) e.qty += out.qty; else near.items.push(out); near.life = 150; } else dropBag(P.x + Math.sin(P.rot) * 0.6, P.z + Math.cos(P.rot) * 0.6, [out]);
    SFX.pick(); if (this.open.loot) this.renderLoot();
  },
  /* ── клітинки предметів ── */
  icon(id) { return ICON[id] ? `<img src="${ICON[id]}" alt="">` : `<span class="em${(ITEMS[id].ic || '').length > 2 && ITEMS[id].t === 'ammo' ? ' tx' : ''}">${ITEMS[id].ic || '?'}</span>`; },
  cell(it, src, key) {
    if (!it) return `<div class="it empty" data-src="${src}" ${src === 'eq' ? `data-k="${key}"` : `data-i="${key}"`}></div>`;
    const d = ITEMS[it.id]; let extra = '';
    if (d.t === 'melee') extra = `<i class="dur"><i style="width:${Math.round(100 * it.dur / maxDur(it))}%"></i></i>`;
    if (d.t === 'gun') extra = `<span class="q">${it.ammo}/${magSize(it)}</span>`;
    if (it.qty > 1) extra = `<span class="q">${it.qty}</span>`;
    return `<div class="it${it.r ? ' r' + it.r : ''}" data-src="${src}" ${src === 'eq' ? `data-k="${key}"` : `data-i="${key}"`}>${this.icon(it.id)}${extra}</div>`;
  },
  renderInv() {
    const eqn = { w1: 'Зброя 1', w2: 'Зброя 2', armor: 'Броня', pack: 'Рюкзак' };
    $('eqSlots').innerHTML = Object.keys(eqn).map(k => `<div class="eq${P.active === k ? ' act' : ''}"><small>${eqn[k]}</small>${this.cell(P.eq[k], 'eq', k)}</div>`).join('');
    $('invGrid').innerHTML = P.inv.map((it, i) => this.cell(it, 'inv', i)).join('') || '<p class="mut">Порожньо. Обшукуй шафи, холодильники й багажники.</p>';
    const w = totalWeight(), cap = carryCap(); $('invWeight').textContent = `${w.toFixed(1)} / ${cap} кг`; $('invWeight').classList.toggle('bad', w > cap);
    this.renderCraft();
  },
  renderLoot() {
    const c = this.open.loot; if (!c) return;
    $('lootGrid').innerHTML = c.items.map((it, i) => this.cell(it, 'loot', i)).join('') || '<p class="mut">Порожньо.</p>';
    $('lootAll').disabled = c.stash ? false : !c.items.length; this.lootHead(c);
  },
  showTip(it, e, src) {
    const t = $('tooltip'), d = ITEMS[it.id], L = [];
    const col = it.r !== undefined ? RARITY[it.r].color : '#e6e2d3';
    L.push(`<b style="color:${col}">${esc(d.n)}</b><small>${TYPE_NAMES[d.t]}${it.r !== undefined ? ' · якість: ' + RARITY[it.r].name : ''}</small>`);
    const row = (a, b) => L.push(`<div class="tr"><span>${a}</span><span>${b}</span></div>`);
    if (d.t === 'melee') { const s = wStats(it); row('Шкода', Math.round(s.dmg)); row('Час удару', s.spd.toFixed(2) + ' с'); row('Дальність', s.range.toFixed(1) + ' м'); row('Цілей за удар', s.targets); row('Крит', Math.round(s.crit * 100) + '%'); row('Міцність', `${it.dur} / ${s.maxDur}`); if (d.chop) row('Рубання дерев', d.chop); if (d.mine) row('Копання каменю', d.mine); }
    if (d.t === 'gun') { const s = wStats(it); row('Шкода', Math.round(s.dmg) + (d.pellets > 1 ? ' × ' + d.pellets : '')); row('Пострілів за секунду', (1 / s.rate).toFixed(1)); row('Магазин', `${it.ammo} / ${s.mag}`); row('Перезарядка', s.reload.toFixed(1) + ' с'); row('Розкид', s.spread.toFixed(1) + '°'); row('Гучність', s.noise + ' м'); row('Набої', `${ITEMS[d.ammo].n} (${P ? invCount(d.ammo) : 0})`); }
    if (it.af) L.push(`<div class="af">${AFFIX[it.af].n}: ${AFFIX[it.af].d}</div>`);
    if (d.hunger) row('Ситість', '+' + d.hunger); if (d.thirst) row('Вода', (d.thirst > 0 ? '+' : '') + d.thirst); if (d.stam && d.t === 'food') row('Сили', '+' + d.stam);
    L.push(`<p>${esc(d.d || '')}</p>`); row('Вага', (d.w * it.qty).toFixed(2) + ' кг');
    L.push(`<em>${src === 'loot' ? 'ЛКМ — забрати' : src === 'eq' ? 'ЛКМ — зняти' : (isGear(it.id) ? 'ЛКМ — спорядити' : d.t === 'ammo' || d.t === 'mat' || d.t === 'quest' ? '' : 'ЛКМ — використати') + ' · ПКМ — викинути'}</em>`);
    t.innerHTML = L.join(''); t.hidden = false;
    const r = t.getBoundingClientRect(); t.style.left = Math.max(8, Math.min(innerWidth - r.width - 8, e.clientX + 16)) + 'px'; t.style.top = Math.max(8, Math.min(innerHeight - r.height - 8, e.clientY + 12)) + 'px';
  },
  hideTip() { $('tooltip').hidden = true; },
  /* ── екран персонажа ── */
  renderChar() {
    const p = P, pips = v => '<span class="pips">' + Array.from({ length: 10 }, (_, i) => `<i class="${i < v ? 'on' : ''}"></i>`).join('') + '</span>';
    const w = activeWeapon(), ws = wStats(w);
    let h = `<header><div class="big">${p.cls.ic}</div><div><h2>${p.cls.n} · рівень ${p.level}</h2><div class="bar xp"><i style="width:${100 * p.xp / xpNeed(p.level)}%"></i></div><small>Досвід ${Math.floor(p.xp)} / ${xpNeed(p.level)}</small></div>
      <div class="pts"><span class="${p.attrPts ? 'has' : ''}">Очки атрибутів: <b>${p.attrPts}</b></span><span class="${p.perkPts ? 'has' : ''}">Очки перків: <b>${p.perkPts}</b></span></div></header><div class="cols"><section><h3>Атрибути</h3>`;
    for (const k in ATTRS) h += `<div class="at"><span class="aic">${ATTRS[k].ic}</span><div><b>${ATTRS[k].n} <u>${p.attrs[k]}</u></b>${pips(p.attrs[k])}<small>${ATTRS[k].d}</small></div><button type="button" data-attr="${k}" ${p.attrPts > 0 && p.attrs[k] < 10 ? '' : 'disabled'} aria-label="Підвищити: ${ATTRS[k].n}">+</button></div>`;
    h += `<h3>Показники</h3><div class="der"><span>Здоров'я</span><b>${Math.ceil(p.hp)} / ${maxHP()}</b><span>Запас сил</span><b>${Math.round(maxStam())}</b><span>Вантаж</span><b>${totalWeight().toFixed(1)} / ${carryCap()} кг</b><span>Захист</span><b>${Math.round((1 - (1 - armorVal()) * (1 - 0.08 * perk('thick'))) * 100)}%</b><span>Шкода в руках</span><b>${Math.round(ws.dmg)}</b><span>Шанс криту</span><b>${Math.round(ws.crit * 100)}%</b><span>Вбито мертвих</span><b>${p.kills}</b></div></section><section><h3>Навички <small>ростуть від практики</small></h3>`;
    for (const k in SKILLS) { const s = p.skills[k]; h += `<div class="sk"><b>${SKILLS[k].n} <u>${s.l}</u></b><div class="bar sk"><i style="width:${s.l >= 10 ? 100 : 100 * s.xp / skillNeed(s.l)}%"></i></div><small>${SKILLS[k].d}</small></div>`; }
    h += `</section><section class="perks"><h3>Перки <small>1 очко за рівень</small></h3><div class="pcols">`;
    for (const br in BRANCHES) {
      h += `<div><h4>${BRANCHES[br]}</h4>`;
      for (const pk of PERKS.filter(x => x.br === br)) { const r = perk(pk.id), lock = p.level < pk.lvl, can = !lock && p.perkPts > 0 && r < pk.max; h += `<button type="button" class="pk${r ? ' own' : ''}${r >= pk.max ? ' max' : ''}${lock ? ' lock' : ''}${can ? ' can' : ''}" data-perk="${pk.id}" ${can ? '' : 'disabled'}><b>${pk.n}</b><span class="rk">${r}/${pk.max}</span><small>${pk.d}</small>${lock ? `<em>з ${pk.lvl} рівня</em>` : ''}</button>`; }
      h += '</div>';
    }
    $('charBody').innerHTML = h + '</div></section></div>';
  },
  /* ── HUD ── */
  set(id, key, val, fn) { if (this.sig[key] === val) return; this.sig[key] = val; fn($(id), val); },
  updateHUD() {
    const p = P, pc = (v, m) => clamp(Math.round(100 * v / m), 0, 100) + '%', W = (el, v) => { el.style.width = v; };
    this.set('hpbar', 'hp', pc(p.hp, maxHP()), W); this.set('stbar', 'st', pc(p.stam, maxStam()), W); this.set('hgbar', 'hg', pc(p.hunger, 100), W); this.set('thbar', 'th', pc(p.thirst, 100), W);
    this.set('xpbar', 'xp', pc(p.xp, xpNeed(p.level)), W);
    this.set('hptext', 'hpt', Math.ceil(p.hp) + '', (e, v) => e.textContent = v); this.set('lvl', 'lvl', p.level + '', (e, v) => e.textContent = v);
    this.set('stbar', 'exh', p.exhausted ? '1' : '0', (e, v) => e.classList.toggle('low', v === '1'));
    const fx = [];
    if (p.bleed > 0) fx.push(['bad', '🩸 Кровотеча' + (p.bleed > 1 ? ' ×' + p.bleed : '')]);
    if (p.infected) fx.push(['bad', '☣ Інфекція ' + Math.floor(p.infection) + '%']);
    if (p.hunger < 25) fx.push(['warn', p.hunger <= 0 ? 'Голодуєш' : 'Голод']); if (p.thirst < 25) fx.push(['warn', p.thirst <= 0 ? 'Зневоднення' : 'Спрага']);
    if (p.over) fx.push(['warn', 'Перевантаження']); if (p.exhausted) fx.push(['warn', 'Виснаження']); if (p.slowT > 0) fx.push(['warn', 'Схопили за ноги']);
    if (p.fatigue >= 70) fx.push(['warn', p.fatigue >= 95 ? 'Валить з ніг утома' : 'Втома']);
    if (p.sneak) fx.push(['', 'Скрадання']); if (p.buffs.energy > 0) fx.push(['good', '⚡ Енергетик']); if (p.buffs.pain > 0) fx.push(['good', '💊 Знеболення']); if (p.buffs.adren > 0 || p.speedBoost > 0) fx.push(['good', '💉 Адреналін']);
    this.set('effects', 'fx', fx.map(f => `<span class="${f[0]}">${f[1]}</span>`).join(''), (e, v) => e.innerHTML = v);
    this.set('ptsHint', 'pts', p.attrPts + p.perkPts > 0 ? '1' : '0', (e, v) => e.hidden = v !== '1');
    const hh = Math.floor(G.time), mm = Math.floor((G.time - hh) * 60);
    this.set('clock', 'clk', `${Env.night > 0.5 ? '🌙' : '☀'} День ${G.day} · ${String(hh).padStart(2, '0')}:${String(mm - mm % 10).padStart(2, '0')}`, (e, v) => e.textContent = v);
    this.set('kills', 'kl', '☠ ' + p.kills, (e, v) => e.textContent = v);
    for (const k of ['w1', 'w2']) {
      const w = p.eq[k], d = w ? ITEMS[w.id] : FISTS;
      let s = `<small>${k === 'w1' ? '1' : '2'}</small><div class="wi"${w ? ` style="border-color:${RARITY[w.r].color}"` : ''}>${w ? this.icon(w.id) : '<span class="em">✊</span>'}</div>`;
      if (w && d.t === 'gun') s += `<span class="am${w.ammo === 0 ? ' bad' : ''}">${p.reloading && p.active === k ? '···' : w.ammo}<i>/${invCount(d.ammo)}</i></span>`;
      else if (w) s += `<i class="dur"><i style="width:${Math.round(100 * w.dur / maxDur(w))}%"></i></i>`;
      this.set('ws' + k[1], k, (p.active === k ? 'A' : 'B') + s, (e, v) => { e.innerHTML = v.slice(1); e.classList.toggle('act', v[0] === 'A'); });
    }
    const q = Quest.cur();
    this.set('questTitle', 'qt', q ? q.t : '', (e, v) => e.textContent = v); this.set('questDesc', 'qd', q ? Quest.desc() : '', (e, v) => e.textContent = v);
    this.set('timer', 'tm', Quest.timerText(), (e, v) => { e.textContent = v; e.hidden = !v; });
    this.set('zone', 'zn', G.zone || '', (e, v) => e.textContent = v);
    this.set('questSkip', 'qs', Quest.isTut() ? '1' : '0', (e, v) => e.hidden = v !== '1'); this.set('keys', 'kh', Quest.isTut() ? '1' : '0', (e, v) => e.hidden = v !== '1'); this.set('quest', 'qtut', Quest.isTut() ? '1' : '0', (e, v) => e.classList.toggle('tut', v === '1'));
    const hpk = p.hp / maxHP(); $('lowhp').style.opacity = hpk < 0.35 ? (0.35 - hpk) * 2.2 : 0;
  },
  frame(dt) {
    this.hudT -= dt; if (this.hudT <= 0) { this.hudT = 0.1; this.updateHUD(); this.drawMinimap(); }
    $('hurt').style.opacity = P.hurtT * 0.55;
    const cr = P.craft, cb = $('craftBar'); if (cb.hidden !== !cr) cb.hidden = !cr;
    if (cr) { const k = Math.min(100, 100 * cr.t / cr.dur) + '%'; $('craftFill').style.width = k; this.set('craftName', 'crn', ITEMS[cr.r.out].n + (cr.n > 1 ? ' x' + cr.n : ''), (e, v) => e.textContent = v); const el = document.querySelector('#craftList .rc.act .pb > i'); if (el) el.style.width = k; }
    if (this.station && !nearStation(this.station)) { this.station = null; this.sig.inv = ''; }
    if (this.open.base && dist2(P.x, P.z, World.core.cx, World.core.cz) > 20) this.toggleBase();
    if (this.open.inv) { this.invT -= dt; if (this.invT <= 0) { this.invT = 0.25; const s = JSON.stringify([P.inv, P.eq, P.active, P.skills.craft.l, this.station, Base.lv, P.craft ? P.craft.r.out + P.craft.n : 0, inBase(P.x, P.z, 2) ? Base.stash.items : 0, STATION_IDS.map(k => nearStation(k) ? 1 : 0)]); if (s !== this.sig.inv) { this.sig.inv = s; this.renderInv(); } } }
    const c = this.open.loot; if (c && dist2(c.cx, c.cz, P.x, P.z) > (c.radius + 0.9) * (c.radius + 0.9)) this.closeLoot();
    const W = innerWidth, H = innerHeight, v = this._v, pr = $('prompt'), tg = G.target;
    if (!pr.hidden && tg) { v.set(tg.x, tg.y + 0.4, tg.z).project(G.camera); pr.style.left = clamp((v.x * 0.5 + 0.5) * W, 90, W - 90).toFixed(1) + 'px'; pr.style.top = clamp((-v.y * 0.5 + 0.5) * H, 40, H - 90).toFixed(1) + 'px'; }
    for (const f of this.floats) {
      if (f.life <= 0) continue; f.life -= dt; f.y += dt * 1.3;
      if (f.life <= 0) { f.el.className = 'fl'; continue; }
      v.set(f.x, f.y, f.z).project(G.camera);
      f.el.style.transform = `translate(${((v.x * 0.5 + 0.5) * W).toFixed(1)}px,${((-v.y * 0.5 + 0.5) * H).toFixed(1)}px) translate(-50%,-50%)`; f.el.style.opacity = Math.min(1, f.life * 3);
    }
  },
  prompt(text) { this.set('prompt', 'pr', text || '', (e, v) => { e.innerHTML = v; e.hidden = !v; }); },
  drawMinimap() {
    const cv = $('minimap'), g = cv.getContext('2d'), S = cv.width, R = 26, k = S / (R * 2), mc = World.mapCanvas; if (!mc) return;
    g.save(); g.clearRect(0, 0, S, S); g.beginPath(); g.arc(S / 2, S / 2, S / 2 - 1, 0, 7); g.clip(); g.fillStyle = '#1c2618'; g.fillRect(0, 0, S, S);
    g.translate(S / 2, S / 2); g.rotate(Cam.yaw); g.scale(k, k); g.translate(-P.x, -P.z);
    g.imageSmoothingEnabled = false; g.drawImage(mc, 0, 0, MAP, MAP);
    for (const z of Zs) { if (z.dead) continue; const d2 = dist2(z.x, z.z, P.x, P.z); if (d2 > 24 * 24 || (z.alert <= 0 && d2 > 13 * 13)) continue; g.fillStyle = z.def.boss ? '#ff00c8' : z.alert > 0 ? '#ff3b2a' : '#b0503e'; g.beginPath(); g.arc(z.x, z.z, z.def.boss ? 1.4 : 0.75, 0, 7); g.fill(); }
    for (const c of World.conts) if (c.bag) { g.fillStyle = '#ffd24a'; g.fillRect(c.cx - 0.5, c.cz - 0.5, 1, 1); }
    g.fillStyle = '#9fe07a'; g.fillRect(World.core.cx - 1.1, World.core.cz - 1.1, 2.2, 2.2); g.strokeStyle = 'rgba(159,224,122,.55)'; g.lineWidth = 0.35; g.beginPath(); g.arc(World.core.cx, World.core.cz, BASE_LV[Base.lv - 1].r, 0, 7); g.stroke(); g.fillStyle = '#c9b28a'; for (const s of Base.structs) g.fillRect(s.x + 0.1, s.z + 0.1, 0.8, 0.8);
    const m = Quest.marker();
    if (m) { let dx = m.x - P.x, dz = m.z - P.z; const d = Math.hypot(dx, dz), lim = R - 2.5; if (d > lim) { dx *= lim / d; dz *= lim / d; } g.fillStyle = '#ffd24a'; g.strokeStyle = '#000'; g.lineWidth = 0.3; g.beginPath(); g.arc(P.x + dx, P.z + dz, d > lim ? 1.1 : 1.5, 0, 7); g.fill(); g.stroke(); }
    g.translate(P.x, P.z); g.rotate(-P.rot); g.fillStyle = '#fff'; g.strokeStyle = '#000'; g.lineWidth = 0.3; g.beginPath(); g.moveTo(0, 2); g.lineTo(1.2, -1.3); g.lineTo(0, -0.6); g.lineTo(-1.2, -1.3); g.closePath(); g.fill(); g.stroke();
    g.restore();
  },
  drawBigMap() {
    const cv = $('bigmap'), g = cv.getContext('2d'), S = cv.width, k = S / MAP;
    g.imageSmoothingEnabled = false; g.drawImage(World.mapCanvas, 0, 0, S, S);
    g.font = '600 13px "PT Sans Narrow", Arial, sans-serif'; g.textAlign = 'center'; g.lineWidth = 3; g.strokeStyle = 'rgba(0,0,0,.8)';
    for (const b of World.buildings) { if (b.type === 'house' || b.type === 'shop' && b.id % 2) continue; const x = (b.x0 + b.w / 2) * k, z = (b.z0 + b.h / 2) * k; g.strokeText(b.def.n, x, z + 4); g.fillStyle = '#f0ead8'; g.fillText(b.def.n, x, z + 4); }
    if (World.tower) { const x = World.tower.cx * k, z = World.tower.cz * k; g.strokeText('Радіовежа', x, z - 8); g.fillStyle = '#f0ead8'; g.fillText('Радіовежа', x, z - 8); }
    const lab = (t, x, z, col) => { g.strokeText(t, x * k, z * k); g.fillStyle = col || '#f0ead8'; g.fillText(t, x * k, z * k); };
    const ml = s => (typeof trText === 'function' ? trText(s) : s);
    lab(ml('Табір'), World.core.cx, World.core.cz - 2.5, '#9fe07a'); lab(ml('Кар\'єр'), World.quarry.cx, World.quarry.cz); lab(ml('Озеро'), World.lake.cx, World.lake.cz); lab(ml('Місто'), 100, TOWN0 + 1, '#e3b54b');
    g.fillStyle = '#9fe07a'; g.fillRect(World.core.cx * k - 4, World.core.cz * k - 4, 8, 8);
    const m = Quest.marker(); if (m) { g.fillStyle = '#ffd24a'; g.strokeStyle = '#000'; g.lineWidth = 2; g.beginPath(); g.arc(m.x * k, m.z * k, 7, 0, 7); g.fill(); g.stroke(); }
    g.fillStyle = '#fff'; g.strokeStyle = '#000'; g.lineWidth = 2; g.beginPath(); g.arc(P.x * k, P.z * k, 5, 0, 7); g.fill(); g.stroke();
  },
  showDeath() {
    if (!P || !P.dead || G.state !== 'dead') return;
    this.closeAll(); $('hud').hidden = true;
    $('deathStats').innerHTML = `<p>Причина: <b>${esc(P.cause || 'невідома')}</b></p><div class="der"><span>Прожито</span><b>${G.day} д. · ${Math.floor(G.time)} год</b><span>Вбито мертвих</span><b>${P.kills}</b><span>Рівень</span><b>${P.level}</b><span>Обшукано схованок</span><b>${P.looted}</b></div>`;
    $('death').hidden = false;
  },
  showWin() {
    this.closeAll();
    $('winStats').innerHTML = `<div class="der"><span>Евакуація на день</span><b>${G.day}</b><span>Вбито мертвих</span><b>${P.kills}</b><span>Рівень</span><b>${P.level}</b><span>Обшукано схованок</span><b>${P.looted}</b></div>`;
    $('win').hidden = false;
  },
};
