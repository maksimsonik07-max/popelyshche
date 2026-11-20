'use strict';
/* ═══════════ головне меню, слоти, налаштування, панелі бази й будівництва ═══════════ */
const STATION_IDS = Object.keys(STATIONS);
Object.assign(UI, {
  station: null, mview: 'main', newSlot: 0, delAsk: -1,
  initMenu() {
    $('classList').innerHTML = CLASSES.map((c, i) => `<button class="cls${i === 0 ? ' sel' : ''}" data-i="${i}" type="button"><span class="cic">${c.ic}</span><b>${c.n}</b><span class="cd">${c.d}</span><span class="cb">${c.bonus}</span><span class="cg">${c.items.map(e => ITEMS[e[0]].n + (e[1] > 1 ? ' ×' + e[1] : '')).join(' · ')}</span></button>`).join('');
    $('classList').addEventListener('click', e => { const b = e.target.closest('.cls'); if (!b) return; this.cls = +b.dataset.i; document.querySelectorAll('#classList .cls').forEach(x => x.classList.toggle('sel', x === b)); });
    for (const id of ['menu', 'pause', 'death', 'win']) $(id).addEventListener('click', e => { const b = e.target.closest('[data-m]'); if (b) this.menuAct(b.dataset.m, b.dataset.i !== undefined ? +b.dataset.i : -1); });
    const set = (id, ev, fn) => $(id).addEventListener(ev, () => { fn($(id)); Settings.save(); Settings.apply(); });
    set('setVol', 'input', e => { Settings.d.vol = +e.value / 100; }); set('setShadow', 'change', e => { Settings.d.shadows = +e.value; });
    set('setRes', 'change', e => { Settings.d.res = +e.value; }); set('setTut', 'change', e => { Settings.d.tut = e.checked; });
    $('questSkip').addEventListener('click', () => Quest.skipTut());
    $('buildList').addEventListener('click', e => {
      const b = e.target.closest('[data-b]'); if (!b || b.disabled) return; const id = b.dataset.b; this.toggleBuild(false);
      buildSelect(id === 'demolish' ? { id: 'demolish', n: 'Розібрати', cost: {}, base: 1 } : BUILDS.find(x => x.id === id));
      this.notify(id === 'demolish' ? 'Клацни по будівлі, яку треба розібрати. ПКМ або Esc — скасувати.' : 'Клацни на місці для будівлі. ПКМ або Esc — скасувати.');
    });
    $('baseUp').addEventListener('click', () => { upgradeBase(); this.renderBase(); });
  },
  menuAct(a, i) {
    switch (a) {
      case 'continue': { const s = Save.latest(); if (s >= 0) startGame(s, null, Save.read(s)); break; }
      case 'new': case 'load': case 'settings': this.menu(a); break;
      case 'back': this.menu(G.state === 'play' ? 'none' : 'main'); break;
      case 'slot': this.newSlot = i; this.renderSlots(); break;
      case 'start': startGame(this.newSlot, CLASSES[this.cls], null); break;
      case 'loadslot': { const d = Save.read(i); if (d) startGame(i, null, d); break; }
      case 'del': this.delAsk = i; this.renderSlots(); break;
      case 'delyes': Save.del(i); this.delAsk = -1; this.renderSlots(); break;
      case 'delno': this.delAsk = -1; this.renderSlots(); break;
      case 'resume': this.togglePause(false); break;
      case 'savenow': this.togglePause(false); if (Save.write()) { this.notify('Гру збережено.', 'good'); this.saved(); } break;
      case 'quit': this.togglePause(false); toMenu(); break;
      case 'tomenu': toMenu(); break;
      case 'reload': { const d = Save.read(Save.slot); if (d) startGame(Save.slot, null, d); else toMenu(); break; }
      case 'stay': $('win').hidden = true; G.state = 'play'; G.endless = true; break;
    }
  },
  menu(view) {
    this.mview = view; $('menu').hidden = view === 'none'; this.delAsk = -1;
    for (const v of ['main', 'new', 'load', 'settings']) $('mv-' + v).hidden = v !== view;
    if (view === 'main') {
      const s = Save.latest(), m = s >= 0 ? Save.meta(s) : null; $('btnContinue').hidden = $('btnLoad').hidden = !m; this.menuMsg('');
      if (m) $('contInfo').textContent = `Слот ${s + 1} · ${this.clsName(m.cls)} · день ${m.day} · рівень ${m.lvl}`;
    } else if (view === 'new') { this.newSlot = 0; for (let i = 0; i < 5; i++) if (!Save.meta(i)) { this.newSlot = i; break; } this.renderSlots(); }
    else if (view === 'load') this.renderSlots();
    else if (view === 'settings') { $('setVol').value = Math.round(Settings.d.vol * 100); $('setShadow').value = Settings.d.shadows; $('setRes').value = Settings.d.res; $('setTut').checked = Settings.d.tut; }
  },
  menuMsg(t) { const e = $('menuErr'); e.textContent = t; e.hidden = !t; },
  clsName(id) { const c = CLASSES.find(c => c.id === id); return c ? c.n : '—'; },
  slotInfo(m) {
    if (!m) return '<span class="se">Порожній слот</span>';
    const when = new Date(m.ts).toLocaleString('uk-UA', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
    return `<span>${this.clsName(m.cls)} · рівень ${m.lvl}</span><span>День ${m.day}, ${String(Math.floor(m.time)).padStart(2, '0')}:00 · база ${m.base} рівня · вбито ${m.kills}</span><small>${m.done ? 'Евакуацію пройдено · ' : ''}збережено ${when}</small>`;
  },
  renderSlots() {
    if (this.mview === 'new') {
      $('slotsNew').innerHTML = [0, 1, 2, 3, 4].map(i => { const m = Save.meta(i); return `<button type="button" class="slot${this.newSlot === i ? ' sel' : ''}" data-m="slot" data-i="${i}"><b>Слот ${i + 1}</b>${this.slotInfo(m)}${m && this.newSlot === i ? '<em>Це збереження буде перезаписано</em>' : ''}</button>`; }).join('');
    } else if (this.mview === 'load') {
      $('slotsLoad').innerHTML = [0, 1, 2, 3, 4].map(i => {
        const m = Save.meta(i); let btn = '';
        if (m) btn = this.delAsk === i ? `<span class="sb"><em>Видалити назавжди?</em><button type="button" class="mini bad" data-m="delyes" data-i="${i}">Так, видалити</button><button type="button" class="mini" data-m="delno" data-i="${i}">Ні</button></span>` : `<span class="sb"><button type="button" class="mini go" data-m="loadslot" data-i="${i}">Завантажити</button><button type="button" class="mini" data-m="del" data-i="${i}">Видалити</button></span>`;
        return `<div class="slot${m ? '' : ' empty'}"><b>Слот ${i + 1}</b>${this.slotInfo(m)}${btn}</div>`;
      }).join('');
    }
  },
  loading(k, text) {
    const l = $('loading'); if (l.hidden) { l.hidden = false; $('loadTip').textContent = pick(TIPS); }
    $('loadText').textContent = text; $('loadFill').style.width = Math.round(k * 100) + '%';
  },
  saved() { const e = $('saved'); e.classList.remove('on'); void e.offsetWidth; e.classList.add('on'); },
  /* ── будівництво ── */
  toggleBuild(v) {
    const o = this.open; o.build = v === undefined ? !o.build : v; $('buildPanel').hidden = !o.build;
    if (o.build) { buildCancel(); this.renderBuild(); if (!inBase(P.x, P.z)) this.notify('Будувати можна лише в межах бази — навколо намету.'); }
  },
  costHTML(c) { return Object.keys(c).map(k => `<span class="${resCount(k) >= c[k] ? 'ok' : 'no'}">${ITEMS[k].n} ${Math.min(resCount(k), c[k])}/${c[k]}</span>`).join(', '); },
  renderBuild() {
    $('buildList').innerHTML = BUILDS.map(b => {
      const lock = Base.lv < b.base, can = !lock && hasCost(b.cost);
      return `<button type="button" class="bd${lock ? ' lock' : ''}${can ? ' can' : ''}" data-b="${b.id}" title="${esc(b.d)}" ${lock ? 'disabled' : ''}><img src="${ICON['b_' + b.id] || ''}" alt=""><b>${b.n}</b><small>${lock ? 'З ' + b.base + ' рівня бази' : this.costHTML(b.cost)}</small></button>`;
    }).join('') + '<button type="button" class="bd" data-b="demolish" title="Повертає половину матеріалів"><span class="bx">✕</span><b>Розібрати будівлю</b><small>Повертає половину матеріалів</small></button>';
  },
  /* ── база ── */
  toggleBase() { const o = this.open; o.base = !o.base; $('basePanel').hidden = !o.base; if (o.base) this.renderBase(); },
  renderBase() {
    const lv = Base.lv, cur = BASE_LV[lv - 1], nx = BASE_LV[lv], chests = Base.structs.filter(s => s.id === 'chest').length;
    let h = `<div class="blv"><b>${cur.n}</b><span>рівень ${lv} з ${BASE_LV.length} · радіус ${cur.r} м</span></div><p>${cur.d}</p>`;
    h += `<div class="der"><span>Будівель</span><b>${Base.structs.length}</b><span>Склад</span><b>${chests ? stashWeight().toFixed(0) + ' / ' + stashCap() + ' кг' : 'немає скрині'}</b><span>Загоєння в базі</span><b>+${((lv - 1) * 0.25).toFixed(2)} / с</b><span>Швидкість крафту</span><b>+${(lv - 1) * 10}%</b></div>`;
    h += nx ? `<h4>Далі: ${nx.n}</h4><p>${nx.d}</p><p class="cost">${this.costHTML(nx.cost)}</p>` : '<p class="ok">Базу розбудовано повністю.</p>';
    $('baseBody').innerHTML = h; $('baseUp').hidden = !nx; $('baseUp').disabled = !nx || !hasCost(nx.cost);
  },
  /* ── робочі місця й рецепти ── */
  openStation(st) { this.station = st; this.toggleInv(true); this.sig.inv = ''; this.renderInv(); SFX.open(); },
  lootHead(c) {
    $('lootTitle').textContent = c.stash ? `Склад бази · ${stashWeight().toFixed(0)} / ${stashCap()} кг` : c.name;
    $('lootAll').innerHTML = c.stash ? 'Скласти матеріали' : 'Забрати все <kbd>E</kbd>';
    if (c.stash) $('lootGrid').insertAdjacentHTML('beforeend', '<p class="mut">Клацни по предмету в інвентарі, щоб покласти його на склад.</p>');
  },
  renderCraft() {
    const st = this.station, list = RECIPES.map((r, i) => [r, i]).filter(e => (e[0].st || null) === (st || null));
    $('craftTitle').innerHTML = st ? `<img src="${ICON['b_' + st] || ''}" alt="">${STATIONS[st].n}` : 'Майстерня: голими руками';
    $('craftList').innerHTML = list.map(e => {
      const r = e[0], lock = r.base && Base.lv < r.base, can = canCraft(r), act = P.craft && P.craft.r === r;
      return `<div class="rc${act ? ' act' : ''}"><div class="it">${this.icon(r.out)}</div><div class="rt"><b>${ITEMS[r.out].n}${r.qty > 1 ? ' ×' + r.qty : ''}</b><small>${this.costHTML(r.need)}${lock ? ` · <span class="no">база ${r.base} рівня</span>` : ''}</small><i class="pb"><i></i></i></div><button type="button" data-r="${e[1]}" ${can ? '' : 'disabled'}>Зробити</button><button type="button" data-r="${e[1]}" data-n="5" ${can ? '' : 'disabled'}>×5</button></div>`;
    }).join('') + (st ? '' : '<p class="mut">Більше рецептів — на багатті, верстаку, в печі й кузні. Будувати: <kbd>B</kbd></p>');
  },
});
