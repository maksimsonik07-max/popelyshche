'use strict';
/* ═══════════ ПОПЕЛИЩЕ · дані гри ═══════════ */
const MAP = 140, TOWN0 = 58, WALL_H = 3, DAY_LEN = 600;
const G_GRASS = 0, G_ASPHALT = 1, G_SIDEWALK = 2, G_WOOD = 3, G_TILE = 4, G_CONCRETE = 5, G_DIRT = 6;

let _rand = Math.random;
function seedRand(s) { let a = s >>> 0; _rand = function () { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function unseedRand() { _rand = Math.random; }
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp = (a, b, t) => a + (b - a) * t;
const rnd = (a, b) => b === undefined ? _rand() * a : a + _rand() * (b - a);
const rndi = (a, b) => Math.floor(a + _rand() * (b - a + 1));
const pick = a => a[(_rand() * a.length) | 0];
const chance = p => _rand() < p;
function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = (_rand() * (i + 1)) | 0; const t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
function angDiff(a, b) { let d = a - b; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2; return d; }
function wpick(list) { let s = 0; for (const e of list) s += e[1]; let r = _rand() * s; for (const e of list) { r -= e[1]; if (r <= 0) return e; } return list[list.length - 1]; }
function moveTo(v, target, step) { return v < target ? Math.min(target, v + step) : Math.max(target, v - step); }

/* ── якість зброї ── */
const RARITY = [
  { name: 'звичайна', color: '#c9c7b8', mult: 1 },
  { name: 'добротна', color: '#7fcf5f', mult: 1.15 },
  { name: 'рідкісна', color: '#58a8ff', mult: 1.32 },
  { name: 'епічна', color: '#bb72ff', mult: 1.52 },
  { name: 'легендарна', color: '#ff9d33', mult: 1.8 },
];
const AFFIX = {
  sharp: { n: 'Гострота', d: '+10% шанс критичного удару' },
  light: { n: 'Легкість', d: '+15% швидкість атаки' },
  sturdy: { n: 'Міцність', d: 'подвійний запас міцності / +30% магазин' },
  vamp: { n: 'Кровожерливість', d: '+3 здоров\'я за кожне вбивство' },
  heavy: { n: 'Міць', d: '+10% шкоди, +30% відкидання' },
};

/* ── предмети ── */
const FISTS = { n: 'Кулаки', t: 'melee', ic: '✊', w: 0, dmg: 7, range: 1.2, arc: 65, spd: 0.36, stam: 4, kb: 0.9, targets: 1, crit: 0.03, d: 'Останній аргумент.' };
const ITEMS = {
  // ближній бій:        шкода, дальність, дуга°, час удару, витривалість, міцність, відкидання, цілей, крит
  knife:     { n: 'Кухонний ніж', t: 'melee', w: 0.4, dmg: 15, range: 1.35, arc: 55, spd: 0.36, stam: 5, dur: 70, kb: 0.6, targets: 1, crit: 0.14, d: 'Короткий і швидкий. Часто б\'є критично.' },
  pan:       { n: 'Сковорода', t: 'melee', w: 1.3, dmg: 16, range: 1.4, arc: 70, spd: 0.5, stam: 7, dur: 140, kb: 2.4, targets: 1, crit: 0.04, d: 'Дзвінкий аргумент. Добре відкидає.' },
  hammer:    { n: 'Молоток', t: 'melee', w: 0.9, dmg: 20, range: 1.35, arc: 60, spd: 0.44, stam: 6, dur: 170, kb: 1.2, targets: 1, crit: 0.08, d: 'Надійний інструмент, що не підводить.' },
  baton:     { n: 'Поліцейський кийок', t: 'melee', w: 0.7, dmg: 19, range: 1.55, arc: 70, spd: 0.4, stam: 6, dur: 180, kb: 1.6, targets: 1, crit: 0.06, d: 'Табельний кийок. Легкий і міцний.' },
  bat:       { n: 'Бейсбольна бита', t: 'melee', w: 1.2, dmg: 24, range: 1.8, arc: 90, spd: 0.55, stam: 9, dur: 95, kb: 2.2, targets: 2, crit: 0.06, d: 'Класика. Зачіпає двох одразу.' },
  spikedbat: { n: 'Шипована бита', t: 'melee', w: 1.5, dmg: 36, range: 1.8, arc: 90, spd: 0.58, stam: 10, dur: 85, kb: 2.0, targets: 2, crit: 0.10, d: 'Бита, цвяхи і трохи фантазії.' },
  crowbar:   { n: 'Лом', t: 'melee', w: 2.0, dmg: 28, range: 1.7, arc: 80, spd: 0.6, stam: 10, dur: 260, kb: 1.8, targets: 1, crit: 0.07, d: 'Майже не ламається.' },
  machete:   { n: 'Мачете', t: 'melee', w: 1.0, dmg: 36, range: 1.7, arc: 100, spd: 0.46, stam: 8, dur: 95, kb: 1.0, targets: 2, crit: 0.10, d: 'Широкий розмах, гостре лезо.' },
  spear:     { n: 'Саморобний спис', t: 'melee', w: 1.4, dmg: 32, range: 2.5, arc: 30, spd: 0.55, stam: 9, dur: 70, kb: 1.4, targets: 1, crit: 0.12, d: 'Тримає мертвих на відстані. Вузький укол.' },
  axe:       { n: 'Пожежна сокира', t: 'melee', w: 2.8, dmg: 46, range: 1.8, arc: 85, spd: 0.8, stam: 14, dur: 120, kb: 1.6, targets: 2, crit: 0.10, d: 'Важка, повільна і дуже переконлива.' },
  sledge:    { n: 'Кувалда', t: 'melee', w: 5.0, dmg: 78, range: 2.0, arc: 110, spd: 1.15, stam: 22, dur: 180, kb: 4.2, targets: 3, crit: 0.06, d: 'Збиває з ніг усе, що стоїть поруч.' },
  katana:    { n: 'Катана', t: 'melee', w: 1.3, dmg: 58, range: 2.0, arc: 110, spd: 0.44, stam: 9, dur: 130, kb: 1.0, targets: 3, crit: 0.18, d: 'Колекційний клинок. Тепер він знову при ділі.' },
  // вогнепальна
  pistol:  { n: 'Пістолет 9 мм', t: 'gun', w: 0.9, dmg: 27, mag: 12, rate: 0.26, reload: 1.4, spread: 2.4, noise: 26, ammo: 'a9', range: 26, pellets: 1, pierce: 0, auto: false, kb: 0.6, two: false, recoil: 0.18, crit: 0.08, d: 'Надійний напівавтомат. Не надто гучний.' },
  smg:     { n: 'Пістолет-кулемет', t: 'gun', w: 2.4, dmg: 17, mag: 30, rate: 0.085, reload: 2.0, spread: 5, noise: 30, ammo: 'a9', range: 22, pellets: 1, pierce: 0, auto: true, kb: 0.4, two: true, recoil: 0.07, crit: 0.05, d: 'Поливає свинцем. Швидко з\'їдає набої.' },
  shotgun: { n: 'Помпова рушниця', t: 'gun', w: 3.4, dmg: 14, mag: 6, rate: 0.8, reload: 2.6, spread: 10, noise: 42, ammo: 'a12', range: 15, pellets: 8, pierce: 0, auto: false, kb: 2.8, two: true, recoil: 0.5, crit: 0.04, d: 'Вісім картечин за постріл. Зблизька нищівна.' },
  ar:      { n: 'Автомат', t: 'gun', w: 3.6, dmg: 31, mag: 30, rate: 0.11, reload: 2.3, spread: 3, noise: 42, ammo: 'a545', range: 34, pellets: 1, pierce: 1, auto: true, kb: 0.7, two: true, recoil: 0.09, crit: 0.07, d: 'Автоматичний вогонь, куля пробиває одного наскрізь.' },
  rifle:   { n: 'Мисливський карабін', t: 'gun', w: 3.9, dmg: 110, mag: 5, rate: 1.05, reload: 2.6, spread: 0.5, noise: 46, ammo: 'a762', range: 50, pellets: 1, pierce: 2, auto: false, kb: 2.0, two: true, recoil: 0.6, crit: 0.2, d: 'Один постріл — один труп. А то й два.' },
  // набої
  a9:   { n: 'Набої 9 мм', t: 'ammo', ic: '9мм', w: 0.012, d: 'Для пістолета й пістолета-кулемета.' },
  a12:  { n: 'Набої 12 калібру', t: 'ammo', ic: '12к', w: 0.04, d: 'Картеч для рушниці.' },
  a545: { n: 'Набої 5,45', t: 'ammo', ic: '5,45', w: 0.012, d: 'Для автомата.' },
  a762: { n: 'Набої 7,62', t: 'ammo', ic: '7,62', w: 0.025, d: 'Для карабіна.' },
  // їжа й вода
  canned:    { n: 'Консерви', t: 'food', ic: '🥫', w: 0.4, hunger: 35, d: 'Тушонка. Ситно.' },
  bread:     { n: 'Хліб', t: 'food', ic: '🍞', w: 0.3, hunger: 22, d: 'Трохи черствий, але їстівний.' },
  chips:     { n: 'Чіпси', t: 'food', ic: '🍟', w: 0.1, hunger: 12, thirst: -4, d: 'Солоні. Після них хочеться пити.' },
  chocolate: { n: 'Шоколад', t: 'food', ic: '🍫', w: 0.1, hunger: 10, stam: 25, d: 'Швидка енергія.' },
  water:     { n: 'Пляшка води', t: 'food', ic: '💧', w: 0.5, thirst: 40, d: 'Чиста вода.' },
  soda:      { n: 'Газована вода', t: 'food', ic: '🥤', w: 0.35, thirst: 24, stam: 10, d: 'Солодка й тепла.' },
  energy:    { n: 'Енергетик', t: 'food', ic: '⚡', w: 0.3, thirst: 12, buff: ['energy', 60], d: 'Хвилину витривалість відновлюється вдвічі швидше.' },
  // медицина
  bandage:     { n: 'Бинт', t: 'med', ic: '🩹', w: 0.1, hp: 10, bleed: true, d: 'Зупиняє кровотечу.' },
  medkit:      { n: 'Аптечка', t: 'med', ic: '⛑️', w: 0.6, hp: 60, bleed: true, d: 'Повертає 60 здоров\'я і зупиняє кровотечу.' },
  antibiotics: { n: 'Антибіотики', t: 'med', ic: '🧪', w: 0.1, cure: true, d: 'Єдине, що зупиняє інфекцію після укусу.' },
  painkillers: { n: 'Знеболювальне', t: 'med', ic: '💊', w: 0.05, hp: 18, buff: ['pain', 60], d: '+18 здоров\'я. Хвилину отримуєш на 20% менше шкоди.' },
  adrenaline:  { n: 'Адреналін', t: 'med', ic: '💉', w: 0.1, stam: 200, buff: ['adren', 25], d: 'Повна витривалість і +25% швидкості на 25 секунд.' },
  // матеріали
  scrap: { n: 'Брухт', t: 'mat', ic: '🔩', w: 0.5, d: 'Залізяччя для ремонту й саморобок.' },
  cloth: { n: 'Тканина', t: 'mat', ic: '🧵', w: 0.1, d: 'Із двох клаптів виходить бинт.' },
  tape:  { n: 'Скотч', t: 'mat', ic: '🩶', w: 0.1, d: 'Тримає світ докупи.' },
  nails: { n: 'Цвяхи', t: 'mat', ic: '📌', w: 0.02, d: 'Згодяться для шипованої бити.' },
  repairkit: { n: 'Ремкомплект', t: 'tool', ic: '🧰', w: 0.8, d: 'Відновлює 60% міцності зброї в руках.' },
  // спорядження
  jacket:     { n: 'Шкіряна куртка', t: 'armor', ic: '🧥', w: 1.5, arm: 0.10, d: 'Захист 10%.' },
  scraparmor: { n: 'Саморобна броня', t: 'armor', ic: '🛡️', w: 4.0, arm: 0.18, d: 'Захист 18%. Гримить, але тримає.' },
  vest:       { n: 'Бронежилет', t: 'armor', ic: '🦺', w: 3.5, arm: 0.25, d: 'Захист 25%.' },
  riot:       { n: 'Штурмовий обладунок', t: 'armor', ic: '🛡️', w: 6.0, arm: 0.38, d: 'Захист 38%. Спецзасіб поліції.' },
  backpack:   { n: 'Рюкзак', t: 'pack', ic: '🎒', w: 0.5, cap: 10, d: '+10 кг вантажу.' },
  bigpack:    { n: 'Туристичний рюкзак', t: 'pack', ic: '🎒', w: 1.0, cap: 18, d: '+18 кг вантажу.' },
  // сюжетні
  radio:   { n: 'Рація', t: 'quest', ic: '📻', w: 1.0, d: 'Поліцейська рація далекого зв\'язку. Без живлення мовчить.' },
  battery: { n: 'Акумулятор', t: 'quest', ic: '🔋', w: 3.0, d: 'Заряджений автомобільний акумулятор.' },
};
const TYPE_NAMES = { melee: 'Зброя ближнього бою', gun: 'Вогнепальна зброя', ammo: 'Набої', food: 'Їжа й напої', med: 'Медицина', mat: 'Матеріал', tool: 'Інструмент', armor: 'Броня', pack: 'Рюкзак', quest: 'Сюжетний предмет' };

/* ── схованки й здобич: [предмет, вага, мін, макс] ── */
const CONT = {
  fridge:    { n: 'Холодильник', rolls: [1, 3], loot: [['canned', 6, 1, 2], ['water', 6, 1, 2], ['soda', 4, 1, 2], ['bread', 4], ['chocolate', 2], ['energy', 1]] },
  cabinet:   { n: 'Кухонна шафка', rolls: [1, 3], loot: [['canned', 5, 1, 2], ['chips', 4, 1, 2], ['knife', 3], ['pan', 2], ['water', 3], ['cloth', 3, 1, 2], ['painkillers', 1]] },
  wardrobe:  { n: 'Шафа', rolls: [1, 3], loot: [['cloth', 8, 1, 3], ['jacket', 2], ['backpack', 1.5], ['bat', 2], ['a9', 1.5, 4, 10], ['bandage', 2], ['tape', 2]] },
  drawer:    { n: 'Комод', rolls: [0, 2], loot: [['cloth', 4, 1, 2], ['painkillers', 2], ['bandage', 3, 1, 2], ['chocolate', 2], ['a9', 1.5, 3, 8], ['tape', 2], ['nails', 2, 2, 5], ['knife', 1], ['hammer', 1]] },
  shelf:     { n: 'Стелаж', rolls: [1, 3], loot: [['canned', 6, 1, 3], ['chips', 5, 1, 2], ['water', 6, 1, 2], ['soda', 5, 1, 2], ['bread', 3], ['chocolate', 3, 1, 2], ['energy', 2]] },
  toolshelf: { n: 'Стелаж з інструментами', rolls: [1, 3], loot: [['hammer', 3], ['crowbar', 2], ['nails', 6, 3, 8], ['tape', 5, 1, 2], ['scrap', 6, 1, 3], ['repairkit', 2], ['machete', 1], ['axe', 1.2], ['sledge', 0.7], ['bat', 1]] },
  crate:     { n: 'Ящик', rolls: [1, 3], loot: [['scrap', 7, 1, 3], ['nails', 5, 2, 6], ['tape', 4, 1, 2], ['canned', 3, 1, 3], ['water', 2, 1, 2], ['cloth', 3, 1, 3], ['repairkit', 1.5], ['crowbar', 1.5], ['a12', 1, 2, 5], ['bigpack', 0.6]] },
  medcab:    { n: 'Медична шафа', rolls: [1, 3], loot: [['bandage', 7, 1, 3], ['medkit', 3], ['antibiotics', 3], ['painkillers', 5, 1, 2], ['adrenaline', 1.2]] },
  gunlocker: { n: 'Збройова шафа', rolls: [2, 4], loot: [['pistol', 3], ['shotgun', 1.6], ['smg', 1.2], ['ar', 0.8], ['rifle', 0.8], ['a9', 7, 8, 20], ['a12', 5, 4, 10], ['a545', 3, 10, 24], ['a762', 2.5, 4, 10], ['vest', 1.5], ['baton', 2], ['riot', 0.4]] },
  desk:      { n: 'Письмовий стіл', rolls: [0, 2], loot: [['a9', 2, 3, 8], ['painkillers', 2], ['chocolate', 2], ['tape', 2], ['bandage', 2], ['energy', 1], ['cloth', 2]] },
  car:       { n: 'Багажник', rolls: [0, 2], loot: [['scrap', 5, 1, 2], ['tape', 3], ['water', 3], ['canned', 2], ['crowbar', 1.2], ['bandage', 2], ['a9', 1, 3, 8], ['a12', 1, 2, 4], ['backpack', 0.7], ['repairkit', 1]] },
  bag:       { n: 'Здобич', rolls: [1, 2], loot: [['a9', 3, 2, 6], ['bandage', 3], ['canned', 2], ['water', 2], ['cloth', 4, 1, 2], ['chips', 2], ['a12', 1, 1, 3], ['painkillers', 1], ['scrap', 2], ['a545', 0.8, 3, 8]] },
};
const PROP_NAMES = { bed: 'Ліжко', table: 'Стіл', sofa: 'Диван', counter: 'Прилавок', bench: 'Лавка' };

/* ── типи будівель ── */
const BTYPES = {
  house:     { n: 'Житловий будинок', tex: 'plaster', walls: [0xd9cfb8, 0xb9c4c9, 0xc9b39a, 0xa9b89a, 0xd4b8a8, 0xbfae9c], floor: G_WOOD, roof: 'gable', roofs: [0x7a4032, 0x46505a, 0x55633f, 0x66503c], win: 3, rooms: 1, map: '#9a927c' },
  shop:      { n: 'Крамниця', tex: 'brick', walls: [0xffffff, 0xe8d8c8, 0xd8e0e8], floor: G_TILE, roof: 'flat', roofs: [0x55585c], win: 2, rooms: 1, map: '#b59a5a' },
  police:    { n: 'Поліцейська дільниця', tex: 'brick', walls: [0xc8d2e6], floor: G_TILE, roof: 'flat', roofs: [0x3d4654], win: 4, rooms: 3, map: '#4f7fd1' },
  clinic:    { n: 'Аптека', tex: 'plaster', walls: [0xf0f0ea], floor: G_TILE, roof: 'flat', roofs: [0x8a8f92], win: 3, rooms: 2, map: '#d8d8d8' },
  workshop:  { n: 'Автомайстерня', tex: 'metal', walls: [0xb9a27a], floor: G_CONCRETE, roof: 'flat', roofs: [0x5a4a3a], win: 5, rooms: 1, map: '#d08a3c' },
  market:    { n: 'Супермаркет', tex: 'plaster', walls: [0xd8c8a0], floor: G_TILE, roof: 'flat', roofs: [0x60656a], win: 3, rooms: 1, map: '#6fb35a' },
  warehouse: { n: 'Склад', tex: 'metal', walls: [0x9aa3a8], floor: G_CONCRETE, roof: 'gable', roofs: [0x59636a], win: 0, rooms: 1, map: '#8a6f55' },
  gas:       { n: 'Заправка', tex: 'plaster', walls: [0xe8e0d0], floor: G_TILE, roof: 'flat', roofs: [0xb03a2e], win: 2, rooms: 1, map: '#c9563c' },
  shed:      { n: 'Апаратна', tex: 'metal', walls: [0x8f9a8a], floor: G_CONCRETE, roof: 'flat', roofs: [0x4a4f48], win: 0, rooms: 1, map: '#777f70' },
};

/* ── зомбі ── */
const ZTYPES = {
  walker:   { n: 'Блукач', hp: 60, spd: 1.25, dmg: 9, reach: 1.15, sight: 13, xp: 10, scale: 1, windup: 0.5, cd: 1.2, stagRes: 0, lean: 0.12, rad: 0.32, bleed: 0.18, infect: 0.035 },
  runner:   { n: 'Бігун', hp: 42, spd: 3.9, dmg: 7, reach: 1.1, sight: 16, xp: 16, scale: 0.96, windup: 0.32, cd: 0.9, stagRes: 0, lean: 0.38, rad: 0.3, bleed: 0.2, infect: 0.03 },
  crawler:  { n: 'Повзун', hp: 45, spd: 0.85, dmg: 8, reach: 1.0, sight: 10, xp: 8, scale: 1, windup: 0.45, cd: 1.3, stagRes: 0.3, lean: 0, rad: 0.34, bleed: 0.25, infect: 0.05, slow: 1.4 },
  brute:    { n: 'Бугай', hp: 280, spd: 1.5, dmg: 24, reach: 1.6, sight: 13, xp: 45, scale: 1.42, windup: 0.7, cd: 1.6, stagRes: 0.8, lean: 0.2, rad: 0.48, bleed: 0.3, infect: 0.03, push: 5 },
  spitter:  { n: 'Плювач', hp: 55, spd: 1.4, dmg: 6, reach: 1.1, sight: 15, xp: 20, scale: 1.04, windup: 0.5, cd: 1.3, stagRes: 0, lean: 0.1, rad: 0.36, bleed: 0.1, infect: 0.03, spit: true },
  screamer: { n: 'Крикун', hp: 40, spd: 1.7, dmg: 5, reach: 1.1, sight: 16, xp: 20, scale: 1.02, windup: 0.45, cd: 1.2, stagRes: 0, lean: 0.15, rad: 0.3, bleed: 0.1, infect: 0.03, scream: true },
  boss:     { n: 'Ватажок', hp: 1400, spd: 2.3, dmg: 34, reach: 2.0, sight: 22, xp: 300, scale: 1.9, windup: 0.8, cd: 1.7, stagRes: 1, lean: 0.22, rad: 0.62, bleed: 0.5, infect: 0.05, push: 7, boss: true },
};
function zWeights(day) {
  return [['walker', 60], ['runner', 5 + day * 4], ['crawler', 8], ['spitter', day >= 2 ? 3 + day * 2 : 0], ['screamer', day >= 2 ? 3 + day * 1.5 : 0], ['brute', day >= 3 ? 1 + day : 0]];
}

/* ── RPG: атрибути, навички, перки, класи ── */
const ATTRS = {
  str: { n: 'Сила', ic: '💪', d: '+6% шкоди ближнього бою, +2 кг вантажу, сильніший поштовх' },
  agi: { n: 'Спритність', ic: '🏃', d: '+2% швидкості руху, +3% швидкості атаки' },
  end: { n: 'Витривалість', ic: '🫀', d: '+10 здоров\'я, +6 запасу сил, швидше відновлення' },
  per: { n: 'Сприйняття', ic: '🎯', d: '+4% шкоди зі зброї, −4% розкиду, +1% криту' },
  lck: { n: 'Удача', ic: '🍀', d: 'краща здобич, +1% криту, −4% шансу зараження' },
};
const SKILLS = {
  melee: { n: 'Ближній бій', d: '+4% шкоди й +1% криту за рівень. Росте від ударів.' },
  guns:  { n: 'Стрільба', d: '+3% шкоди й −5% розкиду за рівень. Росте від влучань.' },
  fit:   { n: 'Атлетика', d: '+3% запасу сил, дешевші удари. Росте від бігу й поштовхів.' },
  med:   { n: 'Медицина', d: '+8% до лікування за рівень. Росте від перев\'язок.' },
  scav:  { n: 'Мародерство', d: '+4% шанс зайвої знахідки. Росте від обшуків.' },
  craft: { n: 'Ремесло', d: 'Відкриває рецепти, кращий ремонт. Росте від майстрування.' },
};
const PERKS = [
  { id: 'sweep', br: 'melee', n: 'Широкий розмах', lvl: 2, max: 2, d: '+1 ціль для кожного удару' },
  { id: 'butcher', br: 'melee', n: 'М\'ясник', lvl: 3, max: 3, d: '+10% шкоди ближнього бою' },
  { id: 'tinkerer', br: 'melee', n: 'Дбайливі руки', lvl: 4, max: 2, d: '−30% зносу зброї' },
  { id: 'executioner', br: 'melee', n: 'Кат', lvl: 5, max: 1, d: 'Подвійна шкода по збитих з ніг та оглушених' },
  { id: 'adrenaline', br: 'melee', n: 'Смак крові', lvl: 6, max: 1, d: 'Вбивство: +25% швидкості на 3 с і +10 сил' },
  { id: 'steady', br: 'gun', n: 'Тверда рука', lvl: 2, max: 3, d: '−12% розкиду' },
  { id: 'fasthands', br: 'gun', n: 'Швидкі руки', lvl: 3, max: 2, d: '−20% часу перезарядки' },
  { id: 'headhunter', br: 'gun', n: 'Мисливець за головами', lvl: 4, max: 3, d: '+5% шанс критичного влучання' },
  { id: 'piercing', br: 'gun', n: 'Пробивні кулі', lvl: 6, max: 2, d: 'Куля пробиває ще одну ціль' },
  { id: 'quiet', br: 'gun', n: 'Тихий крок', lvl: 3, max: 2, d: 'Мертві помічають тебе на 20% ближче' },
  { id: 'thick', br: 'surv', n: 'Товста шкіра', lvl: 2, max: 3, d: '−8% отриманої шкоди' },
  { id: 'mule', br: 'surv', n: 'В\'ючний мул', lvl: 2, max: 3, d: '+6 кг вантажу' },
  { id: 'scavenger', br: 'surv', n: 'Нишпорка', lvl: 2, max: 3, d: '+12% шанс зайвої знахідки' },
  { id: 'medic', br: 'surv', n: 'Польовий медик', lvl: 3, max: 2, d: '+25% до лікування' },
  { id: 'iron', br: 'surv', n: 'Залізний шлунок', lvl: 3, max: 2, d: 'Голод і спрага наростають на 20% повільніше' },
  { id: 'immune', br: 'surv', n: 'Міцний імунітет', lvl: 4, max: 2, d: '−40% шанс кровотечі й зараження' },
  { id: 'regen', br: 'surv', n: 'Загоєння', lvl: 6, max: 2, d: '+0,4 здоров\'я за секунду, якщо ти ситий' },
  { id: 'secondwind', br: 'surv', n: 'Друге дихання', lvl: 7, max: 1, d: 'Раз на 2 хв смертельний удар лишає тобі 25% здоров\'я' },
];
const BRANCHES = { melee: 'Рукопашник', gun: 'Стрілець', surv: 'Виживальник' };

const CLASSES = [
  { id: 'cop', n: 'Поліцейський', ic: '🚓', d: 'Табельна зброя і тверда рука. Найкраще почувається на відстані пострілу.',
    bonus: 'Сприйняття +2 · Стрільба 2', attrs: { per: 2 }, skills: { guns: 2 },
    items: [['pistol', 1, { r: 0, ammo: 12 }], ['a9', 24], ['baton', 1, { r: 0 }], ['bandage', 1], ['water', 1]], shirt: 0x26324d, pants: 0x1c2233, hair: 0x2a1f14 },
  { id: 'fire', n: 'Пожежник', ic: '🚒', d: 'Сокира, сталеві м\'язи і звичка заходити туди, звідки всі тікають.',
    bonus: 'Сила +2 · Витривалість +1 · Ближній бій 2', attrs: { str: 2, end: 1 }, skills: { melee: 2 },
    items: [['axe', 1, { r: 0 }], ['bandage', 2], ['water', 1], ['canned', 1]], shirt: 0xc9a227, pants: 0x2b2b2b, hair: 0x3a2a1a },
  { id: 'medic', n: 'Парамедик', ic: '🚑', d: 'Знає, як зупинити кров і збити гарячку. Живе довше за інших.',
    bonus: 'Спритність +1 · Удача +1 · Медицина 3', attrs: { agi: 1, lck: 1 }, skills: { med: 3 },
    items: [['knife', 1, { r: 0 }], ['medkit', 2], ['bandage', 3], ['antibiotics', 1], ['painkillers', 2], ['water', 1]], shirt: 0xd8dde0, pants: 0x8f1f1f, hair: 0x6b4a2a },
  { id: 'mech', n: 'Механік', ic: '🔧', d: 'З брухту і скотчу збере що завгодно. Зброя в його руках служить довше.',
    bonus: 'Сила +1 · Витривалість +1 · Ремесло 3', attrs: { str: 1, end: 1 }, skills: { craft: 3 },
    items: [['crowbar', 1, { r: 0 }], ['repairkit', 2], ['tape', 3], ['scrap', 3], ['nails', 6], ['bandage', 1], ['water', 1]], shirt: 0xb85a1e, pants: 0x34383d, hair: 0x15120f },
];

const RECIPES = [
  { out: 'bandage', qty: 1, need: { cloth: 2 }, lvl: 0 },
  { out: 'spear', qty: 1, need: { knife: 1, scrap: 1, tape: 1 }, lvl: 1 },
  { out: 'repairkit', qty: 1, need: { scrap: 2, tape: 1 }, lvl: 1 },
  { out: 'spikedbat', qty: 1, need: { bat: 1, nails: 4, tape: 1 }, lvl: 2 },
  { out: 'scraparmor', qty: 1, need: { scrap: 4, tape: 2, cloth: 2 }, lvl: 3 },
];
