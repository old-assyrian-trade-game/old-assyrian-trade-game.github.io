// Compare legal strategies with identical transport and starting silver.
// Road losses and animal deaths are disabled here to isolate the price balance.
// Random prices, travel times, customs and all actual bills remain in use.
import {pathToFileURL} from 'node:url';
import {Game, EPS} from '../dist/engine.js';
import {RULES} from '../dist/rules.js';

const itineraries = {
  euphrates: ['assur_crossing'],
  kanes: ['assur_crossing', 'crossing_kanes'],
  durhumit: ['assur_crossing', 'crossing_kanes', 'kanes_durhumit'],
  purushhaddum: ['assur_crossing', 'crossing_kanes', 'kanes_purushhaddum']
};

function pack(game, strategy) {
  game.act('buy', 'donkey', 6);
  const tinPrice = game.quote('tin').buy;
  const textilePrice = game.quote('textile').buy;
  const finePrice = game.quote('fine_textile').buy;
  const reserve = 500;
  // Fill six loads, keeping the secondary export at the required minimum share.
  // Both consignments leave unused silver in the purse; neither gets free cargo.
  const secondaryRatio = game.rules.caravan.minimum_export_share /
    (1 - game.rules.caravan.minimum_export_share);
  const capacity = game.rules.goods[strategy === 'tin' ? 'tin' : 'textile'].units_per_donkey;
  for (let amount = 6 * capacity; amount > 0; amount--) {
    const fine = strategy === 'textiles' ? Math.min(amount, game.s.fineStock) : 0;
    const textiles = strategy === 'tin' ?
      Math.ceil(amount * tinPrice * secondaryRatio / textilePrice - EPS) : amount - fine;
    const textileCost = textiles * textilePrice + fine * finePrice;
    const tin = strategy === 'tin' ? amount :
      Math.ceil(textileCost * secondaryRatio / tinPrice - EPS);
    const cost = tin * tinPrice + textileCost;
    if (game.load({tin, textile: textiles, fine_textile: fine}) > 6 + EPS ||
        cost > game.available() - reserve) continue;
    game.act('buy', 'tin', tin);
    if (textiles) game.act('buy', 'textile', textiles);
    if (fine) game.act('buy', 'fine_textile', fine);
    return;
  }
  throw new Error('No legal consignment fits the audit assumptions.');
}

function travel(game, road) {
  game.act('start', road);
  for (let step = 0; game.s.journey && !game.s.finished; step++) {
    if (step > 120) throw new Error('Audit journey did not finish.');
    if (game.s.event) throw new Error('Unexpected loss or incident in price audit.');
    game.act('advance', 7);
  }
  if (game.s.finished) throw new Error('Audit could not return before the deadline.');
}

export function compareStrategies(GameClass = Game, rules = RULES, samples = 200) {
  const safeRules = structuredClone(rules);
  safeRules.caravan.donkey_weekly_mortality = 0;
  safeRules.caravan.hard_driving_weekly_mortality = 0;
  safeRules.caravan.incident_chance_per_day = 0;
  for (const road of safeRules.routes) road.loss_chance = 0;
  const results = [];
  for (const [city, roads] of Object.entries(itineraries)) {
    const sums = {tin: 0, ordinary: 0, textiles: 0};
    for (let seed = 0; seed < samples; seed++) {
      for (const strategy of Object.keys(sums)) {
        const game = new GameClass(`balance-${seed}`, 'Balance audit', safeRules);
        pack(game, strategy);
        for (const road of roads) travel(game, road);
        for (const good of ['tin', 'textile', 'fine_textile']) {
          if (game.qty(good)) game.act('sell', good, game.qty(good));
        }
        game.act('sell', 'donkey', game.s.donkeys);
        for (const road of roads.toReversed()) travel(game, road);
        game.act('finish');
        sums[strategy] += game.s.result.profit;
      }
    }
    results.push({city, samples, ...Object.fromEntries(
      Object.entries(sums).map(([key, total]) => [key, total / samples])
    )});
  }
  return results;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  console.table(compareStrategies().map(row => Object.fromEntries(
    Object.entries(row).map(([key, value]) => [key, typeof value === 'number' ? +value.toFixed(2) : value])
  )));
}
