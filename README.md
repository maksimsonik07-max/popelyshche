# Popelyshche

**English** · [Українська](README.uk.md)

A 3D zombie survival RPG that runs in the browser. *Popelyshche* means "the ashes" — what is left of a town after it burns. You come round in a camp beyond the town's edge: gather resources, build up a base, raid the streets for supplies, and find a way to call in an evacuation.

Written in plain JavaScript with [three.js](https://threejs.org/). No build step, no dependencies, no back end — everything runs in the browser.

## Running it

Open `index.html` in a browser. An internet connection is needed: three.js and the fonts are loaded from a CDN.

If your browser blocks local files, serve the folder instead:

```
python -m http.server 8000
```

then open `http://localhost:8000`.

## Controls

| Keys | Action |
| --- | --- |
| `WASD` | move, relative to the camera |
| `Shift` / `C` | sprint / sneak |
| `Left mouse` | swing, shoot, chop trees and mine rock |
| `Space` / `V` | shove / dodge |
| `E` | interact: search, doors, gather, repair, workstations |
| `B` | build, inside the base radius |
| `Tab` / `P` / `M` | inventory, character, map |
| `R` / `Q` / `1` `2` | reload, swap weapon |
| `H` / `G` / `F` | heal / eat and drink / flashlight |
| `Right mouse` + move | rotate the camera; wheel zooms |

## What is in the game

**Progression.** Four starting classes, five attributes, seven skills that grow through use, and 23 perks across four branches: brawler, shooter, survivor, craftsman.

**The dead.** Walker, runner, crawler, brute, spitter, screamer and a boss that hunts at night. They do not know where you are: they spot you only within their own line of sight, or follow a noise, and once they lose the trail they head for the place they saw you last. At night they are faster and more aggressive.

**Weapons.** Twelve melee weapons and six firearms, with quality from common to legendary, random affixes, wear and repair.

**Gathering and crafting.** Wood, stone, iron ore, sulfur, plant fibre, berries; 39 recipes — by hand, or at a campfire, workbench, furnace, forge and ammo bench.

**The base.** Fifteen structures and four base tiers: palisade, stone wall, gate, spike traps, storage chest, bed, vegetable patch, water collector, crossbow turret. The dead break through whatever stands in their way.

**Survival.** Hunger, thirst, fatigue, bleeding, infection, a day–night cycle, and rain that dulls the senses of the dead.

**The world.** Six terrain types and a randomised layout of camp, lake, quarry and radio tower — every world is different. A tutorial woven into the opening, a story line leading to the evacuation, and five save slots.

## Layout

```
index.html        markup, styles, script load order
js/data.js        items, zombies, classes, attributes, perks
js/data2.js       resources, recipes, base structures
js/world.js       town generation, collision, pathfinding, lighting
js/wild.js        wilderness: terrain types, camp, lakes, quarries
js/entities.js    player, zombies, combat, effects
js/nodes.js       trees, boulders, ore veins
js/base.js        base structures and build mode
js/stations.js    workstations and their effects
js/craft.js       crafting, storage, base tiers, sleep
js/survival.js    fatigue, drinking water, turrets
js/extras.js      weather, ambient sound, dodging
js/quest.js       tutorial and story line
js/save.js        settings and five save slots
js/lang-data.js   English names and descriptions for the data tables
js/lang.js        the second language: dictionary and the switch
js/ui.js          HUD and panels
js/menu.js        menus, save slots, building
js/menufx.js      the living main-menu backdrop
js/main.js        game loop, input, sound
js/game.js        start-up, loading, loading screen
```

The interface comes in English and Ukrainian. Switch it under **Settings → Language**; the choice is remembered between sessions.

## Licence

[MIT](LICENSE).
