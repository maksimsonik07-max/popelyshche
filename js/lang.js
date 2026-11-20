'use strict';
/* ═══════════ дві мови інтерфейсу: український текст лишається вихідним, англійський накладається поверх ═══════════ */
let LANG = 'uk';
const CYR = /[Ѐ-ӿ]/;
/* точні рядки */
const L = {
  // стани й повідомлення
  'Знайдено: ': 'Found: ', 'Це ще знадобиться.': 'This will still come in useful.',
  'Зброя 1': 'Weapon 1', 'Зброя 2': 'Weapon 2', 'Броня': 'Armour', 'Рюкзак': 'Backpack',
  'Порожньо. Обшукуй шафи, холодильники й багажники.': 'Empty. Search cupboards, fridges and car boots.',
  'Порожньо.': 'Empty.', ' · якість: ': ' · quality: ',
  'Шкода': 'Damage', 'Час удару': 'Swing time', 'Дальність': 'Range', 'Цілей за удар': 'Targets per swing',
  'Крит': 'Crit', 'Міцність': 'Durability', 'Рубання дерев': 'Chopping power', 'Копання каменю': 'Mining power',
  'Пострілів за секунду': 'Rounds per second', 'Магазин': 'Magazine', 'Перезарядка': 'Reload', 'Розкид': 'Spread',
  'Гучність': 'Noise', 'Набої': 'Ammunition', 'Ситість': 'Hunger', 'Вода': 'Water', 'Сили': 'Stamina', 'Вага': 'Weight',
  'ЛКМ — забрати': 'Left click — take', 'ЛКМ — зняти': 'Left click — unequip', 'ЛКМ — спорядити': 'Left click — equip',
  'ЛКМ — використати': 'Left click — use', ' · ПКМ — викинути': ' · right click — drop',
  'Атрибути': 'Attributes', 'Показники': 'Stats', 'Навички': 'Skills', 'Перки': 'Perks',
  'ростуть від практики': 'grow through use', '1 очко за рівень': '1 point per level',
  'Здоров\'я': 'Health', 'Запас сил': 'Stamina', 'Вантаж': 'Load', 'Захист': 'Protection',
  'Шкода в руках': 'Damage in hand', 'Шанс криту': 'Crit chance', 'Вбито мертвих': 'Dead killed',
  'Прожито': 'Survived', 'Рівень': 'Level', 'Обшукано схованок': 'Caches searched', 'Евакуація на день': 'Evacuated on day',
  'невідома': 'unknown', 'Причина: ': 'Cause: ', 'Завдання': 'Objective',
  // база, крафт, будівництво
  'Розібрати': 'Demolish', 'Розібрати будівлю': 'Demolish a structure', 'Повертає половину матеріалів': 'Returns half the materials',
  'Клацни по будівлі, яку треба розібрати. ПКМ або Esc — скасувати.': 'Click the structure to demolish. Right click or Esc cancels.',
  'Клацни на місці для будівлі. ПКМ або Esc — скасувати.': 'Click where the structure goes. Right click or Esc cancels.',
  'Будувати можна лише в межах бази — навколо намету.': 'You can only build inside the base, around the tent.',
  'Гру збережено.': 'Game saved.', 'Порожній слот': 'Empty slot', 'Евакуацію пройдено · ': 'Evacuation complete · ',
  'Це збереження буде перезаписано': 'This save will be overwritten', 'немає скрині': 'no chest',
  'Базу розбудовано повністю.': 'The base is fully built.', 'Скласти матеріали': 'Store materials',
  'Клацни по предмету в інвентарі, щоб покласти його на склад.': 'Click an item in your inventory to put it in the store.',
  'Майстерня: голими руками': 'Crafting: by hand', 'Майстерня': 'Crafting',
  'Більше рецептів — на багатті, верстаку, в печі й кузні. Будувати: ': 'More recipes at the campfire, workbench, furnace and forge. To build: ',
  'Будівель': 'Structures', 'Склад': 'Store', 'Загоєння в базі': 'Healing in base', 'Швидкість крафту': 'Crafting speed',
  'Зробити': 'Craft', 'Будівництво': 'Building', 'База': 'Base', 'Інвентар': 'Inventory', 'Мапа міста': 'Map',
  'Потрібно робоче місце: ': 'You need a workstation: ',
  'Бракує матеріалів': 'Not enough materials', 'Бракує ресурсів': 'Not enough resources',
  'Спершу закінчи попередню роботу.': 'Finish the current job first.', 'Це краще тримати при собі.': 'Better keep this on you.',
  'Склад переповнений — постав ще одну скриню.': 'The store is full — build another chest.',
  'У рюкзаку немає матеріалів.': 'There are no materials in your backpack.',
  'Покращувати базу можна лише в таборі.': 'The base can only be upgraded at the camp.',
  'Бракує ресурсів для покращення.': 'Not enough resources to upgrade.',
  'Тут нічого розбирати': 'Nothing to demolish here', 'Поза межами бази': 'Outside the base',
  'Місце зайняте': 'The spot is taken', 'Спершу збери те, що тут росте': 'Gather what grows here first',
  'Відійди з цього місця': 'Step off this spot', 'Заважає мертвяк': 'One of the dead is in the way',
  'Потрібен вищий рівень бази': 'Requires a higher base tier',
  'Склад бази': 'Base store', 'Зруйновано: ': 'Destroyed: ', 'Розібрано: ': 'Demolished: ',
  ' (повернуто половину матеріалів)': ' (half the materials returned)',
  'База: грядки й збирачі води дали врожай.': 'Base: the patches and collectors have yielded.',
  'Для ремонту бракує: ': 'Not enough to repair: ', 'Щось заважає зачинити ворота.': 'Something is blocking the gate.',
  'Ще нічого немає — зазирни вранці.': 'Nothing yet — look again in the morning.',
  'Зачинити': 'Close', 'Відчинити': 'Open', 'картопля': 'potatoes', 'вода': 'water',
  // сон, виживання
  'Ти ще не втомився — спати можна вночі або коли зморить утома.': 'You are not tired yet — you can sleep at night, or once fatigue sets in.',
  'Поруч мертві — не до сну.': 'The dead are close — no time to sleep.', 'Ранок. Ти виспався.': 'Morning. You slept well.',
  'Щось наближається — ти прокинувся!': 'Something is coming — you wake up!', 'Ти прокинувся.': 'You wake up.',
  'Ти відпочив.': 'You are rested.', 'Тебе атакують!': 'You are under attack!',
  'Ти втомився: сили відновлюються повільніше. Виспись на лежанці.': 'You are tired: stamina recovers more slowly. Sleep on a bed.',
  'Ти не хочеш пити.': 'You are not thirsty.', 'Ти ситий і не хочеш пити.': 'You are fed and not thirsty.',
  'Немає чого випити.': 'Nothing to drink.', 'Немає чого з\'їсти.': 'Nothing to eat.', 'Базу атакують: ': 'The base is under attack: ',
  // бій, стани гравця
  'Кислота': 'Acid', 'Рани': 'Wounds', 'Втрата крові': 'Blood loss', 'Інфекція': 'Infection', 'Спрага': 'Thirst', 'Голод': 'Hunger',
  'Ти не заражений — прибережи антибіотики.': 'You are not infected — save the antibiotics.',
  'Інфекцію зупинено.': 'The infection is stopped.', 'Лікувати нічого.': 'Nothing to treat.',
  'Кровотечу зупинено.': 'The bleeding is stopped.', 'Зброю полагоджено.': 'The weapon is repaired.',
  'Візьми в руки зношену зброю ближнього бою.': 'Hold a worn melee weapon first.',
  'Немає чим лікуватися.': 'Nothing to heal with.', 'Немає набоїв: ': 'Out of ammunition: ',
  'Ти видихся — переведи подих.': 'You are winded — catch your breath.', ' — зламано!': ' — broken!',
  'Бракує сил.': 'Not enough stamina.', 'Бракує сил для ухилу.': 'Not enough stamina to dodge.', 'ухил!': 'dodge!',
  'Кровотеча! Перев\'яжи рану бинтом.': 'Bleeding! Dress the wound with a bandage.',
  'Тебе вкусили. Інфекція поширюється — знайди антибіотики!': 'You have been bitten. The infection is spreading — find antibiotics!',
  'Друге дихання!': 'Second wind!', 'Крикун скликає мертвих!': 'The screamer is calling the dead!',
  'Двері виламано!': 'The door is broken down!', 'Ватажка вбито! Забери здобич.': 'The alpha is dead! Take the loot.',
  'Кровотеча': 'Bleeding', 'Перевантаження': 'Overloaded', 'Виснаження': 'Exhausted', 'Втома': 'Fatigue',
  'Валить з ніг утома': 'Dead on your feet', 'Голодуєш': 'Starving', 'Зневоднення': 'Dehydrated',
  'Схопили за ноги': 'Grabbed by the legs', 'Скрадання': 'Sneaking', 'Енергетик': 'Energy drink',
  'Знеболення': 'Painkillers', 'Адреналін': 'Adrenaline',
  // світ, день і ніч
  'Сутеніє. Уночі мертві швидші й лютіші.': 'Dusk is falling. At night the dead are faster and fiercer.',
  'Орда йде на твій запах!': 'The horde is coming for you!', 'Ватажок вийшов на полювання.': 'The alpha is out hunting.',
  'Світанок. Ти пережив ніч.': 'Dawn. You survived the night.', 'Дощ ущух.': 'The rain has stopped.',
  'Починається дощ: мертві гірше бачать і чують, збирачі води наповнюються.': 'Rain sets in: the dead see and hear less, and water collectors fill up.',
  'Щось заважає зачинити двері.': 'Something is blocking the door.',
  'Передавач: потрібні рація, акумулятор і антена': 'Transmitter: needs the radio, battery and antenna',
  'База: ': 'Base: ', 'Кар\'єр': 'Quarry', 'Дика місцевість': 'Wilderness', 'Місто': 'Town', 'Озеро': 'Lake',
  'Табір': 'Camp', 'Радіовежа': 'Radio tower', 'Дім': 'Home',
  // запуск
  'Розчищаємо попіл': 'Clearing the ashes', 'Зводимо місто й дороги': 'Raising the town and roads',
  'Саджаємо ліс, розкидаємо каміння': 'Planting the forest, scattering stones', 'Будимо мертвих': 'Waking the dead',
  'Готово': 'Ready', 'Завантаження світу': 'Loading the world', 'Не вдалося запустити гру: ': 'Could not start the game: ',
  'Ти отямився в таборі. Спершу освойся, потім шукай спосіб вибратися.': 'You come round in the camp. Find your feet first, then look for a way out.',
  'Місцевість цього світу: ': 'Terrain of this world: ',
  'Браузер не зміг запустити WebGL — гра потребує 3D-прискорення.': 'The browser could not start WebGL — the game needs 3D acceleration.',
  'Не вдалося завантажити 3D-бібліотеку. Перевір інтернет і онови сторінку.': 'Could not load the 3D library. Check your connection and reload the page.',
  'Не вдалося зберегти гру: браузер не дає місця для збережень.': 'Could not save: the browser is refusing storage space.',
  'Навчання пропущено. Підказки лишилися в завданнях.': 'Tutorial skipped. The hints remain in the objectives.',
  'Навчання завершено. Далі — розбудова бази й дорога до евакуації.': 'Tutorial complete. From here: build up the base and work towards the evacuation.',
  'Передавач працює. Тримайся!': 'The transmitter is live. Hold out!',
  'Гелікоптер над лісом! До майданчика!': 'The helicopter is over the forest! Get to the pad!',
  'Вільне виживання': 'Free survival', 'Ти лишився. Розбудовуй базу й рахуй пережиті ночі.': 'You stayed. Build up the base and count the nights you survive.',
  'Потрібні рація, акумулятор і антена.': 'You need the radio, battery and antenna.',
  // меню
  'Нова гра': 'New game', 'Продовжити': 'Continue', 'Завантажити': 'Load', 'Налаштування': 'Settings',
  'Зберегти гру': 'Save game', 'Зберегти й вийти в меню': 'Save and quit to menu', 'Головне меню': 'Main menu',
  'Гру зупинено': 'Game paused', 'Пауза': 'Paused', 'Хто ти?': 'Who are you?', 'Почати гру': 'Start game', 'Назад': 'Back',
  'Слот збереження': 'Save slot', 'Збережені ігри': 'Saved games', 'Видалити': 'Delete', 'Видалити назавжди?': 'Delete permanently?',
  'Так, видалити': 'Yes, delete', 'Ні': 'No', 'Лишитися': 'Stay', 'Закрити': 'Close',
  'Спробувати знову': 'Try again', 'Завантажити останнє збереження': 'Load the last save',
  'RPG-виживання · карантинна зона': 'Survival RPG · quarantine zone', 'Попелище': 'Popelyshche',
  'Ти загинув': 'You died', 'Ліс і місто забрали ще одного': 'The forest and the town took another',
  'Евакуація': 'Evacuation', 'Борт на землі': 'The bird is down',
  'Місто згоріло за три дні. Ти отямився в лісовому таборі за його межею. Добувай дерево, камінь і руду, розбудовуй базу, ходи в місто по здобич — і знайди спосіб викликати евакуацію.': 'The town burned down in three days. You come round in a forest camp beyond its edge. Gather wood, stone and ore, build up a base, raid the town for supplies — and find a way to call in an evacuation.',
  'Ти вибрався живим. Можна полетіти — або лишитися, розбудовувати базу й рахувати пережиті ночі.': 'You got out alive. You can fly away — or stay, build up the base and count the nights you survive.',
  'П\'ять слотів збереження, навчання на початку': 'Five save slots, a tutorial at the start',
  'Вибрати слот збереження': 'Choose a save slot', 'Звук, тіні, роздільність, навчання': 'Sound, shadows, resolution, tutorial',
  'Гра також зберігається сама щохвилини': 'The game also saves itself every minute',
  'Гра керується клавіатурою й мишею — відкрий її на комп\'ютері.': 'The game is played with a keyboard and mouse — open it on a computer.',
  'Гучність': 'Volume', 'Тіні': 'Shadows', 'Високі': 'High', 'Низькі': 'Low', 'Вимкнено': 'Off',
  'Роздільність картинки': 'Render resolution', 'Висока': 'High', 'Звичайна': 'Normal', 'Низька (швидше)': 'Low (faster)',
  'Навчання на початку нової гри': 'Tutorial at the start of a new game', 'Мова': 'Language',
  'Пропустити навчання': 'Skip tutorial', 'Збережено ✓': 'Saved ✓',
  'Є вільні очки розвитку —': 'Unspent development points —', 'Покращити базу': 'Upgrade the base',
  'Zzz…': 'Zzz…', 'Ніч минає швидше. Будь-яка клавіша руху або E — прокинутися.': 'The night passes faster. Any movement key or E wakes you.',
  // підказки керування
  'рух відносно камери': 'move, relative to the camera', 'біг / скрадання': 'sprint / sneak',
  'удар, постріл, рубання': 'swing, shoot, chop', 'поштовх / ухил': 'shove / dodge',
  'дія: обшук, двері, збирання, ремонт': 'interact: search, doors, gather, repair',
  'будівництво в межах бази': 'build inside the base', 'інвентар, персонаж, мапа': 'inventory, character, map',
  'перезарядка, зміна зброї': 'reload, swap weapon', 'лікування / їжа й вода / ліхтарик': 'heal / eat and drink / flashlight',
  'камера, коліщатко — масштаб': 'camera, wheel zooms', 'рух': 'move', 'біг': 'sprint', 'скрадання': 'sneak',
  'удар / постріл': 'swing / shoot', 'поштовх': 'shove', 'дія': 'interact', 'лікування': 'heal', 'ліхтарик': 'flashlight',
  'зміна зброї': 'swap weapon', 'інвентар': 'inventory', 'персонаж': 'character', 'мапа': 'map', 'будівництво': 'building',
  'Кулаки': 'Fists', 'ЛКМ': 'LMB', 'ПКМ': 'RMB', 'Пробіл': 'Space', 'перезарядка': 'reload', 'поштовх': 'shove',
  'ЛКМ + рух': 'LMB + move', 'ПКМ + рух': 'RMB + move', 'коліщатко': 'wheel',
  // сцени меню
  'вечір, перше багаття': 'evening, the first fire', 'полудень, вулиці мертвих': 'midday, streets of the dead',
  'світанок, руда й камінь': 'dawn, ore and stone', 'дощ на заході сонця': 'rain at sunset',
  'ніч, останній шанс на сигнал': 'night, a last chance at a signal',
};
/* підказки меню */
const TIPS_EN = [
  'V — dodge: a short lunge during which the blows of the dead cannot land.',
  'In the rain the dead see and hear less — the best time for a run into town.',
  'A damaged palisade or wall can be repaired with E for a single unit of material.',
  'The dead hear running and gunfire. Sneaking (C) halves the distance at which they notice you.',
  'The base store can be used for crafting and building while you are inside the camp.',
  'A stone axe is made with bare hands: 2 wood, 2 stone, 1 fibre.',
  'A downed walker is far easier to finish off. Space shoves them over.',
  'A palisade will not stop a horde, but it buys time: the dead break through whatever is in their way.',
  'Ore and sulfur are in the quarry, which is marked on the map. Nothing to do there without a pickaxe.',
  'The dead do not know where you are: they notice you only up close, or follow a noise. Break their line of sight and they lose the trail.',
  'Every world is different: terrain, and the placing of camp, lake, tower and quarry change each time.',
  'At night the dead are faster. A bed lets you sleep through the dark if things are quiet nearby.',
  'After a bite, look for antibiotics: an infection does not pass on its own.',
  'The quality of a found weapon depends on luck; of a forged one, on your crafting skill.',
  'A vegetable patch and a water collector yield every morning — a built-up base feeds itself.',
  'The crossbow is almost silent: with it you need not call the whole town down on you.',
  'The game saves itself every minute when no dead are nearby.',
  'A campfire does more than cook: wounds heal faster beside it.',
  'Felled trees and broken boulders come back in time — the forest will not run out.',
  'G quickly eats or drinks the best thing in your backpack.',
  'You can drink your fill from the lake — press E at the shore.',
  'Fatigue builds through the day: sleep it off on a bed, or stamina recovers more slowly.',
  'The crossbow turret takes bolts from the base store — keep them in a chest.',
];
/* шаблони для рядків із числами */
const LP = [
  [/Потрібна база (\d+) рівня/g, 'Requires base tier $1'],
  [/Рівень (\d+)! \+2 очки атрибутів і перк — натисни P/g, 'Level $1! +2 attribute points and a perk — press P'],
  [/Навичка «(.+?)» зросла до (\d+)/g, 'Skill "$1" has risen to $2'],
  [/Базу покращено: (.+?) \(рівень (\d+)\)/g, 'Base upgraded: $1 (tier $2)'],
  [/Гру завантажено: день (\d+)\./g, 'Game loaded: day $1.'],
  [/Гелікоптер прибуде через (\d+) с/g, 'The helicopter arrives in $1 s'],
  [/Виконано: /g, 'Completed: '], [/Слот (\d+)/g, 'Slot $1'],
  [/рівень (\d+) з (\d+) · радіус (\d+) м/g, 'tier $1 of $2 · radius $3 m'],
  [/база (\d+) рівня/g, 'base tier $1'], [/З (\d+) рівня бази/g, 'From base tier $1'],
  [/Далі: /g, 'Next: '], [/Досвід /g, 'XP '], [/Очки атрибутів: /g, 'Attribute points: '], [/Очки перків: /g, 'Perk points: '],
  [/з (\d+) рівня/g, 'from level $1'], [/· рівень (\d+)/g, '· level $1'], [/рівень (\d+)/g, 'level $1'],
  [/День (\d+), /g, 'Day $1, '], [/День (\d+)/g, 'Day $1'], [/день (\d+)/g, 'day $1'],
  [/(\d+) д\. · (\d+) год/g, '$1 d · $2 h'], [/вбито (\d+)/g, '$1 killed'], [/збережено /g, 'saved '],
  [/Обшукати: /g, 'Search: '], [/Зібрати: /g, 'Gather: '], [/Полагодити: /g, 'Repair: '],
  [/Забрати все/g, 'Take all'], [/Відкрити скриню/g, 'Open the chest'], [/Лягти спати/g, 'Sleep'],
  [/Напитися з озера/g, 'Drink from the lake'], [/Увімкнути передавач/g, 'Switch on the transmitter'],
  [/Намет: база «(.+?)»/g, 'Tent: base "$1"'], [/(.+?): рецепти/g, '$1: recipes'],
  [/Зачинити ворота/g, 'Close the gate'], [/Відчинити ворота/g, 'Open the gate'],
  [/Зачинити двері/g, 'Close the door'], [/Відчинити двері/g, 'Open the door'],
  [/ — порожньо/g, ' — empty'], [/: зазирни вранці/g, ': look again in the morning'],
  [/болтів на складі: (\d+)/g, 'bolts in store: $1'], [/\+(\d+) води/g, '+$1 water'],
  [/Підвищити: /g, 'Increase: '], [/Склад бази · /g, 'Base store · '],
  [/ кг(?![Ѐ-ӿ])/g, ' kg'], [/ м(?![Ѐ-ӿ])/g, ' m'], [/ с(?![Ѐ-ӿ])/g, ' s'], [/ год(?![Ѐ-ӿ])/g, ' h'],
];
/* словник ще раз, але вже як пошук окремих висловів усередині довшого тексту */
const LT = {}; let MEGA;
function megaRe() {
  if (MEGA !== undefined) return MEGA;
  const keys = [];
  for (const k in L) { const a = k.trim(), b = L[k].trim(); if (a && b && CYR.test(a)) { LT[a] = b; keys.push(a); } }
  keys.sort((a, b) => b.length - a.length);
  const alt = '(' + keys.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')';
  try { MEGA = new RegExp('(?<![\\u0400-\\u04FF])' + alt + '(?![\\u0400-\\u04FF])', 'g'); }
  catch (e) { try { MEGA = new RegExp(alt + '(?![\\u0400-\\u04FF])', 'g'); } catch (e2) { MEGA = null; } }
  return MEGA;
}
function trText(s) {
  if (LANG !== 'en' || !s || !CYR.test(s)) return s;
  const k = s.trim(); if (L[k] !== undefined) return s.replace(k, L[k]);
  let out = s; for (const p of LP) out = out.replace(p[0], p[1]);
  if (L[out.trim()] !== undefined) return out.replace(out.trim(), L[out.trim()]);
  const re = megaRe(); if (re) out = out.replace(re, m => LT[m] !== undefined ? LT[m] : m);
  return out;
}
/* текстові вузли; оригінал зберігається на вузлі, щоб можна було повернути українську */
function trDOM(root) {
  if (!root) return;
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let n;
  while ((n = w.nextNode())) {
    if (n.__uk === undefined) { if (!CYR.test(n.nodeValue)) continue; n.__uk = n.nodeValue; }
    const v = LANG === 'en' ? trText(n.__uk) : n.__uk; if (n.nodeValue !== v) n.nodeValue = v;
  }
  for (const el of root.querySelectorAll('[title],[aria-label]')) for (const a of ['title', 'aria-label']) {
    const cur = el.getAttribute(a); if (cur === null) continue;
    const key = '__' + a; if (el[key] === undefined) { if (!CYR.test(cur)) continue; el[key] = cur; }
    el.setAttribute(a, LANG === 'en' ? trText(el[key]) : el[key]);
  }
}
/* поля таблиць даних: запам'ятовуємо оригінали й підміняємо на льоту */
const ORIG = [];
function regField(o, key, en) { if (o && typeof o[key] === 'string') ORIG.push([o, key, o[key], en]); }
function regPair(o, en) { if (!o || !en) return; regField(o, 'n', en[0]); regField(o, 'd', en[1]); if (en[2]) regField(o, 'bonus', en[2]); }
let LREG = false;
function registerLang() {
  if (LREG) return; LREG = true;
  for (const id in ITEMS) { regPair(ITEMS[id], EN.items[id]); if (EN.ic[id]) regField(ITEMS[id], 'ic', EN.ic[id]); }
  regPair(FISTS, EN.fists);
  for (const id in NODES) regField(NODES[id], 'n', EN.nodes[id] && EN.nodes[id][0]), regField(NODES[id], 'need', EN.nodes[id] && EN.nodes[id][1]);
  for (const id in CONT) regField(CONT[id], 'n', EN.cont[id]);
  for (const id in BTYPES) regField(BTYPES[id], 'n', EN.btypes[id]);
  for (const id in ZTYPES) regField(ZTYPES[id], 'n', EN.ztypes[id]);
  for (const id in ATTRS) regPair(ATTRS[id], EN.attrs[id]);
  for (const id in SKILLS) regPair(SKILLS[id], EN.skills[id]);
  for (const id in STATIONS) regField(STATIONS[id], 'n', EN.stations[id]);
  for (const id in AFFIX) regPair(AFFIX[id], EN.affix[id]);
  for (const id in TYPE_NAMES) regField(TYPE_NAMES, id, EN.types[id]);
  for (const id in PROP_NAMES) regField(PROP_NAMES, id, EN.props[id]);
  for (const id in BRANCHES) regField(BRANCHES, id, EN.branches[id]);
  RARITY.forEach((r, i) => regField(r, 'name', EN.rarity[i]));
  PERKS.forEach(p => regPair(p, EN.perks[p.id]));
  CLASSES.forEach(c => regPair(c, EN.classes[c.id]));
  BUILDS.forEach(b => regPair(b, EN.builds[b.id]));
  BASE_LV.forEach((b, i) => regPair(b, EN.baselv[i]));
  BIOMES.forEach((b, i) => regField(b, 'n', EN.biomes[i]));
  TIPS.forEach((s, i) => { if (TIPS_EN[i]) ORIG.push([TIPS, i, s, TIPS_EN[i]]); });
  Quest.stages.forEach((s, i) => { if (QT_EN[i]) { ORIG.push([s, 't', s.t, QT_EN[i]]); ORIG.push([s, 'd', s.d, QD_EN[i]]); } });
}
function applyLang() {
  registerLang();
  for (const e of ORIG) e[0][e[1]] = LANG === 'en' && e[3] ? e[3] : e[2];
  document.documentElement.dataset.lang = LANG;
  UI.sig = {};
  const cl = $('classList');
  if (cl) cl.innerHTML = CLASSES.map((c, i) => `<button class="cls${i === UI.cls ? ' sel' : ''}" data-i="${i}" type="button"><span class="cic">${c.ic}</span><b>${c.n}</b><span class="cd">${c.d}</span><span class="cb">${c.bonus}</span><span class="cg">${c.items.map(e => ITEMS[e[0]].n + (e[1] > 1 ? ' ×' + e[1] : '')).join(' · ')}</span></button>`).join('');
  trDOM(document.body);
  if ($('menuTip')) $('menuTip').textContent = TIPS[MenuFX.tip % TIPS.length];
  if (P && G.state === 'play') { UI.renderInv && UI.open.inv && UI.renderInv(); UI.open.char && UI.renderChar(); UI.updateHUD(); }
}
function setLang(v) {
  if (v === LANG) return; LANG = v; Settings.d.lang = v; applyLang();
  if (G.state === 'menu') { UI.menu(UI.mview === 'none' ? 'main' : UI.mview); if (MenuFX.scenes.length) MenuFX.enter(); }
}
/* англійські завдання */
const QT_EN = [
  'Tutorial: movement', 'Tutorial: camera', 'Tutorial: supplies', 'Tutorial: inventory', 'Tutorial: gathering',
  'Tutorial: tools', 'Tutorial: felling', 'Tutorial: building', 'Tutorial: the workbench', 'Tutorial: combat',
  'Tutorial: progression', 'Tutorial: storage', 'Tutorial: finding your way',
  'Outpost', 'A run into town', 'Iron', 'Contact', 'Power', 'Stronghold', 'The signal', 'Hold the line', 'Evacuation',
];
const QD_EN = [
  () => 'Walk around the camp. WASD moves; your character faces the cursor.',
  () => 'Hold the right mouse button and turn the camera. The wheel zooms.',
  () => 'Walk up to the crate by the tent and press E. Press E again to take everything.',
  () => 'Open the inventory (Tab) and click the tinned meat or the water to eat or drink.',
  () => `Strip bushes and pick up stones with E. Wood ${Math.min(2, resCount('wood'))}/2 · stone ${Math.min(2, resCount('stone'))}/2 · fibre ${Math.min(1, resCount('fiber'))}/1`,
  () => 'The inventory (Tab) has a "Crafting" section. Make a stone axe and click it to take it in hand.',
  () => 'Walk up to a tree and chop it with the left mouse button until it falls.',
  () => `Press B, choose "Campfire" and click a clear spot near the tent. Wood ${Math.min(4, resCount('wood'))}/4 · stone ${Math.min(4, resCount('stone'))}/4`,
  () => `Place a workbench the same way. Then walk up to it and press E — its recipes will open. Wood ${Math.min(8, resCount('wood'))}/8 · stone ${Math.min(2, resCount('stone'))}/2`,
  () => 'One of the dead has reached the camp! Left click swings, space shoves, V dodges. Kill it.',
  () => 'A new level! Press P and spend the points: "+" beside an attribute, or a perk with a yellow border.',
  () => `Place a chest (B). Anything in the store can be used for building and crafting inside the base. Wood ${Math.min(6, resCount('wood'))}/6`,
  () => 'Press M: the map shows the camp, the town and the objective marker. F is the flashlight, Shift sprints, C sneaks, H heals. The game saves itself.',
  () => 'Gather 20 wood, 12 stone and 3 rope (fibre → rope), then upgrade the base: walk up to the tent and press E.',
  () => 'The dirt road from the camp leads to the town. Find the pharmacy — medicine and bandages are there.',
  () => 'Build a furnace, mine ore in the quarry (the yellow marker on the map) and smelt your first ingot.',
  () => 'Find the radio set in the police station.',
  () => 'Find the car battery in the car workshop.',
  () => `Upgrade the base to tier 3 (currently ${Base.lv}), build a forge and forge a signal antenna.`,
  () => 'Carry the radio, battery and antenna to the radio tower (marked on the map) and switch on the transmitter.',
  () => 'Everyone heard the signal. Hold out until the helicopter arrives!',
  () => 'The helicopter is landing. Run to the pad!',
];
/* перехоплення точок, де текст потрапляє на екран */
{
  const s = UI.set; UI.set = function (id, key, val, fn) { return s.call(this, id, key, typeof val === 'string' ? trText(val) : val, fn); };
  const n = UI.notify; UI.notify = function (text, cls) { return n.call(this, trText(text), cls); };
  const f = UI.floatText; UI.floatText = function (x, y, z, text, cls) { return f.call(this, x, y, z, trText(text), cls); };
  const after = (name, el) => { const o = UI[name]; if (o) UI[name] = function () { const r = o.apply(this, arguments); if (LANG === 'en') trDOM(typeof el === 'string' ? $(el) : document.body); return r; }; };
  after('renderInv', 'invPanel'); after('renderLoot', 'lootPanel'); after('renderChar', 'charPanel'); after('showTip', 'tooltip');
  after('renderCraft', 'invPanel'); after('renderBuild', 'buildPanel'); after('renderBase', 'basePanel');
  after('renderSlots', 'menu'); after('lootHead', 'lootPanel'); after('menu', 'menu'); after('loading', 'loading');
  after('showDeath', 'death'); after('showWin', 'win');
  const im = UI.initMenu;
  UI.initMenu = function () {
    im.call(this);
    const sel = $('setLang');
    if (sel) sel.addEventListener('change', () => { setLang(sel.value); Settings.save(); });
    const m = UI.menu; UI.menu = function (v) { const r = m.call(this, v); if (v === 'settings' && $('setLang')) $('setLang').value = LANG; return r; };
  };
  const me = MenuFX.enter; MenuFX.enter = function () { const r = me.call(this); if (LANG === 'en') trDOM($('sceneCap')); return r; };
  const sa = Settings.apply; Settings.apply = function () { const r = sa.call(this); if (this.d.lang && this.d.lang !== LANG) { LANG = this.d.lang; applyLang(); } return r; };
  Settings.d.lang = 'uk';
}
