'use strict';
/* ═══════════ ресурси, інструменти, рецепти, будівництво бази ═══════════ */
Object.assign(ITEMS, {
  // сировина й матеріали
  wood:   { n: 'Деревина', t: 'mat', w: 0.5, d: 'Колоди й гілки. Основа всього в таборі.' },
  stone:  { n: 'Камінь', t: 'mat', w: 0.6, d: 'Для вогнищ, печей і мурів.' },
  fiber:  { n: 'Волокно', t: 'mat', w: 0.05, d: 'Рослинні волокна: з них скручують мотузки й тчуть полотно.' },
  ore:    { n: 'Залізна руда', t: 'mat', w: 0.8, d: 'Переплавляється в печі на злитки.' },
  sulfur: { n: 'Сірка', t: 'mat', w: 0.2, d: 'Трапляється в рудних жилах. Потрібна для пороху.' },
  plank:  { n: 'Дошки', t: 'mat', w: 0.3, d: 'Оброблена на верстаку деревина.' },
  coal:   { n: 'Деревне вугілля', t: 'mat', w: 0.2, d: 'Паливо для печі й основа пороху.' },
  ingot:  { n: 'Залізний злиток', t: 'mat', w: 0.7, d: 'Метал для інструментів, зброї й набоїв.' },
  brick:  { n: 'Цегла', t: 'mat', w: 0.6, d: 'Випалений камінь для мурів і кузні.' },
  rope:   { n: 'Мотузка', t: 'mat', w: 0.15, d: 'Скручене волокно. Тримає докупи пів табору.' },
  powder: { n: 'Порох', t: 'mat', w: 0.05, d: 'Для саморобних набоїв.' },
  // їжа з табору
  potato:  { n: 'Картопля', t: 'food', ic: '🥔', w: 0.2, hunger: 10, d: 'Сира. Краще запекти на багатті.' },
  baked:   { n: 'Печена картопля', t: 'food', ic: '🍠', w: 0.2, hunger: 30, d: 'Гаряча й ситна.' },
  berries: { n: 'Ягоди', t: 'food', ic: '🍒', w: 0.05, hunger: 7, thirst: 5, d: 'Жменя лісових ягід.' },
  stew:    { n: 'Гаряча юшка', t: 'food', ic: '🍲', w: 0.5, hunger: 60, thirst: 15, heal: 12, d: 'Найкраща їжа в таборі. Трохи лікує.' },
  tea:     { n: 'Ягідний відвар', t: 'food', ic: '🍵', w: 0.4, thirst: 45, buff: ['energy', 45], d: 'Тамує спрагу й бадьорить.' },
  // інструменти та нова зброя
  stoneaxe:  { n: 'Кам\'яна сокира', t: 'melee', w: 1.2, dmg: 17, range: 1.5, arc: 70, spd: 0.6, stam: 8, dur: 70, kb: 1.2, targets: 1, crit: 0.05, chop: 12, d: 'Рубає дерева. Швидко тупиться.' },
  stonepick: { n: 'Кам\'яне кайло', t: 'melee', w: 1.4, dmg: 15, range: 1.5, arc: 60, spd: 0.62, stam: 9, dur: 80, kb: 1.0, targets: 1, crit: 0.05, mine: 10, d: 'Розбиває валуни й рудні жили.' },
  ironaxe:   { n: 'Залізна сокира', t: 'melee', w: 1.8, dmg: 36, range: 1.7, arc: 80, spd: 0.62, stam: 10, dur: 240, kb: 1.5, targets: 2, crit: 0.10, chop: 30, d: 'Валить дерево за два удари.' },
  ironpick:  { n: 'Залізне кайло', t: 'melee', w: 2.0, dmg: 28, range: 1.6, arc: 60, spd: 0.6, stam: 10, dur: 260, kb: 1.2, targets: 1, crit: 0.10, mine: 28, d: 'Руда й камінь здаються без бою.' },
  club:      { n: 'Дрючок', t: 'melee', w: 1.0, dmg: 14, range: 1.6, arc: 80, spd: 0.5, stam: 7, dur: 50, kb: 1.6, targets: 1, crit: 0.04, d: 'Перша зброя, яку можна зробити голими руками.' },
  cleaver:   { n: 'Тесак', t: 'melee', w: 1.3, dmg: 44, range: 1.7, arc: 95, spd: 0.5, stam: 9, dur: 170, kb: 1.1, targets: 2, crit: 0.12, chop: 8, d: 'Кований клинок власної роботи.' },
  crossbow:  { n: 'Арбалет', t: 'gun', w: 2.6, dmg: 70, mag: 1, rate: 0.3, reload: 1.5, spread: 1.2, noise: 5, ammo: 'bolt', range: 30, pellets: 1, pierce: 1, auto: false, kb: 1.6, two: true, recoil: 0.15, crit: 0.15, silent: true, d: 'Майже безшумний. Болти робляться на верстаку.' },
  bolt:      { n: 'Арбалетні болти', t: 'ammo', ic: 'болт', w: 0.03, d: 'Для арбалета.' },
  ironarmor: { n: 'Кована броня', t: 'armor', ic: '🛡️', w: 7.0, arm: 0.32, d: 'Захист 32%. Важка, зате своя.' },
  antenna:   { n: 'Антена-підсилювач', t: 'quest', ic: '📡', w: 2.5, d: 'Без неї сигнал не доб\'є до військових.' },
});
Object.assign(ITEMS.axe, { chop: 22 }); Object.assign(ITEMS.machete, { chop: 8 }); Object.assign(ITEMS.katana, { chop: 6 });
Object.assign(ITEMS.hammer, { mine: 6 }); Object.assign(ITEMS.crowbar, { mine: 9 }); Object.assign(ITEMS.sledge, { mine: 24 });
SKILLS.gath = { n: 'Добування', d: '+6% сили рубання й копання, шанс зайвого ресурсу. Росте від праці.' };

CONT.crate.loot.push(['plank', 4, 1, 3], ['rope', 2, 1, 2], ['sulfur', 1.5, 1, 2], ['wood', 2, 1, 3]);
CONT.toolshelf.loot.push(['ingot', 1.5, 1, 2], ['sulfur', 1, 1, 1], ['rope', 2, 1, 2]);
CONT.car.loot.push(['rope', 1.5]); CONT.fridge.loot.push(['potato', 3, 1, 3]); CONT.cabinet.loot.push(['potato', 2, 1, 2]);
CONT.gunlocker.loot.push(['crossbow', 0.8], ['bolt', 2, 4, 8]);

/* ── ресурсні точки ── */
const NODES = {
  tree:   { n: 'Дерево', hp: 40, tool: 'chop', regrow: 72, give: [['wood', 4, 6], ['fiber', 0, 1]], need: 'Потрібна сокира.' },
  rock:   { n: 'Валун', hp: 50, tool: 'mine', regrow: 96, give: [['stone', 3, 5]], need: 'Потрібне кайло.' },
  ore:    { n: 'Рудна жила', hp: 80, tool: 'mine', regrow: 120, give: [['ore', 2, 4], ['stone', 1, 2]], bonus: ['sulfur', 0.35], need: 'Потрібне кайло.' },
  bush:   { n: 'Кущ', hand: true, regrow: 36, give: [['fiber', 1, 2], ['wood', 1, 1]] },
  berry:  { n: 'Ягідний кущ', hand: true, regrow: 36, give: [['berries', 2, 4], ['fiber', 1, 1]] },
  pebble: { n: 'Каміння', hand: true, regrow: 72, give: [['stone', 1, 2]] },
};

/* ── робочі місця й рецепти ── */
const STATIONS = { fire: { n: 'Багаття', t: 3 }, bench: { n: 'Верстак', t: 2 }, furnace: { n: 'Піч', t: 4 }, anvil: { n: 'Кузня', t: 3 }, ammo: { n: 'Набійний стіл', t: 2.5 } };
RECIPES.length = 0;
RECIPES.push(
  // голими руками
  { out: 'stoneaxe', need: { wood: 2, stone: 2, fiber: 1 } },
  { out: 'stonepick', need: { wood: 2, stone: 3, fiber: 1 } },
  { out: 'club', need: { wood: 3 } },
  { out: 'rope', need: { fiber: 3 } },
  { out: 'cloth', need: { fiber: 4 } },
  { out: 'bandage', need: { cloth: 2 } },
  // багаття
  { out: 'baked', need: { potato: 1 }, st: 'fire' },
  { out: 'tea', need: { berries: 3, water: 1 }, st: 'fire' },
  { out: 'stew', need: { canned: 1, potato: 1, water: 1 }, st: 'fire' },
  { out: 'coal', need: { wood: 2 }, st: 'fire' },
  // верстак
  { out: 'plank', qty: 2, need: { wood: 1 }, st: 'bench' },
  { out: 'spear', need: { wood: 2, stone: 1, rope: 1 }, st: 'bench' },
  { out: 'bat', need: { plank: 3 }, st: 'bench' },
  { out: 'spikedbat', need: { bat: 1, nails: 4, rope: 1 }, st: 'bench' },
  { out: 'backpack', need: { cloth: 4, rope: 2 }, st: 'bench' },
  { out: 'repairkit', need: { scrap: 2, rope: 1 }, st: 'bench' },
  { out: 'bolt', qty: 5, need: { wood: 1, stone: 1 }, st: 'bench', base: 2 },
  { out: 'crossbow', need: { plank: 4, rope: 2, ingot: 1 }, st: 'bench', base: 2 },
  { out: 'medkit', need: { bandage: 2, painkillers: 1 }, st: 'bench', base: 2 },
  { out: 'bigpack', need: { cloth: 6, rope: 3, plank: 2 }, st: 'bench', base: 3 },
  // піч
  { out: 'coal', qty: 3, need: { wood: 2 }, st: 'furnace' },
  { out: 'ingot', need: { ore: 2, coal: 1 }, st: 'furnace' },
  { out: 'ingot', need: { scrap: 3, coal: 1 }, st: 'furnace' },
  { out: 'brick', qty: 2, need: { stone: 2, coal: 1 }, st: 'furnace' },
  // кузня
  { out: 'nails', qty: 8, need: { ingot: 1 }, st: 'anvil' },
  { out: 'ironaxe', need: { ingot: 3, plank: 1, rope: 1 }, st: 'anvil' },
  { out: 'ironpick', need: { ingot: 3, plank: 1, rope: 1 }, st: 'anvil' },
  { out: 'machete', need: { ingot: 3, plank: 1 }, st: 'anvil' },
  { out: 'cleaver', need: { ingot: 4, plank: 1, rope: 1 }, st: 'anvil' },
  { out: 'sledge', need: { ingot: 6, plank: 2 }, st: 'anvil' },
  { out: 'scraparmor', need: { scrap: 4, rope: 2, cloth: 2 }, st: 'anvil' },
  { out: 'antenna', need: { ingot: 6, scrap: 4, rope: 2 }, st: 'anvil' },
  { out: 'ironarmor', need: { ingot: 8, cloth: 3, rope: 2 }, st: 'anvil', base: 4 },
  // набійний стіл
  { out: 'powder', qty: 2, need: { coal: 2, sulfur: 1 }, st: 'ammo' },
  { out: 'a9', qty: 8, need: { ingot: 1, powder: 1 }, st: 'ammo' },
  { out: 'a12', qty: 4, need: { ingot: 1, powder: 2 }, st: 'ammo' },
  { out: 'a545', qty: 8, need: { ingot: 1, powder: 2 }, st: 'ammo' },
  { out: 'a762', qty: 4, need: { ingot: 1, powder: 2 }, st: 'ammo' }
);

/* ── будівлі бази ── */
const BUILDS = [
  { id: 'fire', n: 'Багаття', cost: { wood: 4, stone: 4 }, base: 1, hp: 80, st: 'fire', d: 'Готування їжі та світло вночі. Біля вогню рани гояться швидше.' },
  { id: 'bench', n: 'Верстак', cost: { wood: 8, stone: 2 }, base: 1, hp: 120, st: 'bench', d: 'Дошки, зброя, спорядження.' },
  { id: 'chest', n: 'Скриня', cost: { wood: 6 }, base: 1, hp: 100, d: 'Спільний склад бази: його вміст доступний для крафту й будівництва.' },
  { id: 'wall', n: 'Частокіл', cost: { wood: 3 }, base: 1, hp: 160, block: true, d: 'Затримує мертвих, доки вони його не розламають.' },
  { id: 'torch', n: 'Смолоскип', cost: { wood: 1, fiber: 1 }, base: 1, hp: 30, small: true, d: 'Освітлює табір уночі.' },
  { id: 'gate', n: 'Ворота', cost: { plank: 4, rope: 1 }, base: 2, hp: 220, block: true, gate: true, d: 'Відчиняються й зачиняються клавішею E.' },
  { id: 'bed', n: 'Лежанка', cost: { plank: 4, cloth: 3 }, base: 2, hp: 60, d: 'Сон пришвидшує ніч і відновлює сили.' },
  { id: 'furnace', n: 'Піч', cost: { stone: 14, coal: 2 }, base: 2, hp: 300, st: 'furnace', d: 'Плавить руду, випалює цеглу й вугілля.' },
  { id: 'trap', n: 'Пастка з кілків', cost: { wood: 4, plank: 2 }, base: 2, hp: 12, flat: true, d: 'Ранить мертвих, що на неї стали. Витримує 12 спрацювань.' },
  { id: 'garden', n: 'Грядка', cost: { plank: 2, berries: 2 }, base: 2, hp: 40, d: 'Щоранку дає картоплю.' },
  { id: 'water', n: 'Збирач води', cost: { plank: 4, ingot: 1, cloth: 1 }, base: 3, hp: 60, d: 'Щоранку дає пляшку води.' },
  { id: 'anvil', n: 'Кузня', cost: { ingot: 5, brick: 6, plank: 2 }, base: 3, hp: 400, st: 'anvil', d: 'Залізні інструменти, зброя, броня й антена.' },
  { id: 'swall', n: 'Мур', cost: { brick: 3, stone: 2 }, base: 3, hp: 520, block: true, d: 'Утричі міцніший за частокіл.' },
  { id: 'ammo', n: 'Набійний стіл', cost: { ingot: 6, plank: 6, brick: 4 }, base: 4, hp: 200, st: 'ammo', d: 'Порох і набої власного виробництва.' },
];
const BASE_LV = [
  { n: 'Табір', r: 9, d: 'Багаття, верстак, скриня, частокіл.' },
  { n: 'Стоянка', r: 12, cost: { wood: 20, stone: 12, rope: 3 }, d: 'Піч, лежанка, ворота, пастки, грядки. Рани в базі гояться самі.' },
  { n: 'Форпост', r: 15, cost: { plank: 24, brick: 10, ingot: 4 }, d: 'Кузня, мур, збирач води. Крафт у базі швидший.' },
  { n: 'Фортеця', r: 19, cost: { plank: 30, brick: 24, ingot: 14 }, d: 'Набійний стіл і кована броня. Найбільший периметр.' },
];
