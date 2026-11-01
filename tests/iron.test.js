import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Game, GameError} from '../dist/engine.js';
import {RULES} from '../dist/rules.js';

function offeredIron() {
  const game = new Game('iron-limit', 'Iron trader');
  game.act('buy', 'donkey', 1);
  game.s.city = 'euphrates';
  game.s.ironStock = RULES.markets.iron_offer_minas;
  return game;
}

test('the whole season permits exactly two successful iron purchases', () => {
  const game = offeredIron();
  for (let count = 1; count <= 2; count++) {
    game.s.ironStock = 1;
    game.act('buy', 'iron', 1);
    assert.equal(game.s.ironPurchases, count);
    game.act('sell', 'iron', 1);
  }
  // Even a stale offer cannot bypass the guard in the trade action.
  game.s.ironStock = 1;
  assert.equal(game.stock('iron'), 0);
  assert.equal(game.maxBuy('iron'), 0);
  const before = game.snapshot();
  assert.throws(() => game.act('buy', 'iron', 1), /limit for this season/);
  assert.deepEqual(game.snapshot(), before);
});

test('an unaffordable or invalid iron purchase uses no allowance', () => {
  const game = offeredIron();
  game.s.purse = 0;
  for (const quantity of [1, 0, -1, 0.5, 2, NaN]) {
    const before = game.snapshot();
    assert.throws(() => game.act('buy', 'iron', quantity), GameError);
    assert.deepEqual(game.snapshot(), before);
  }
  assert.equal(game.s.ironPurchases, 0);
});

test('discarding iron does not restore the seasonal allowance', () => {
  const game = offeredIron();
  game.act('buy', 'iron', 1);
  game.act('discard', 'iron', 1);
  assert.equal(game.s.ironPurchases, 1);
});

test('a road attack cannot reset the iron purchase allowance', () => {
  const rules = structuredClone(RULES);
  const track = rules.routes.find(road => road.id === 'smugglers_track');
  track.loss_chance = 1;
  track.arrest_dice = [0, 1];
  const game = new Game('iron-lost', 'Lost cargo', rules);
  game.act('buy', 'donkey', 1);
  game.s.city = 'euphrates';
  game.s.ironStock = 1;
  game.act('buy', 'iron', 1);
  game.act('start', 'smugglers_track');
  game.act('advance', 1);
  assert.equal(game.s.event.kind, 'loss');
  assert.equal(game.qty('iron'), 0);
  assert.equal(game.s.ironPurchases, 1);
});

test('saving and restoring preserves the iron allowance and next random draw', () => {
  const game = offeredIron();
  game.act('buy', 'iron', 1);
  const restored = Game.restore(game.snapshot());
  assert.equal(restored.s.ironPurchases, 1);
  assert.deepEqual(restored.snapshot(), game.snapshot());
  assert.equal(restored.random(), game.random());
  assert.equal(new Game('new-season').s.ironPurchases, 0);
});

test('arrivals and waiting stop making iron offers after the second purchase', () => {
  const game = offeredIron();
  game.s.ironPurchases = 2;
  game.s.ironStock = 0;
  for (let visit = 0; visit < 4; visit++) {
    // Arrive is isolated here: the random source would always produce an offer.
    game.s.journey = {destination: 'euphrates'};
    game.random = () => 0;
    game.arrive();
    assert.equal(game.s.ironStock, 0);
    assert.equal(game.s.ironPurchases, 2);
    game.refreshMarkets();
    assert.equal(game.stock('iron'), 0);
  }
  assert.equal(game.s.log.filter(entry => entry.title === 'A discreet offer').length, 0);
});

test('declined offers, repeat visits and waiting do not consume a purchase', () => {
  const game = offeredIron();
  game.act('advance', 1);
  assert.equal(game.s.ironPurchases, 0);
  game.s.journey = {destination: 'euphrates'};
  game.random = () => 0;
  game.arrive();
  assert.equal(game.s.ironStock, 1);
  assert.equal(game.s.ironPurchases, 0);
});

test('actual return journeys cannot obtain a third iron consignment', () => {
  const rules = structuredClone(RULES);
  rules.markets.iron_offer_chance = 1;
  rules.caravan.donkey_weekly_mortality = 0;
  rules.caravan.incident_chance_per_day = 0;
  rules.routes[0].loss_chance = 0;
  const game = new Game('repeat-crossing', 'Repeat traveler', rules);
  game.act('buy', 'donkey', 1);
  const cross = () => {
    game.act('start', 'assur_crossing');
    while (game.s.journey) game.act('advance', 7);
  };
  for (let visit = 1; visit <= 3; visit++) {
    cross();
    assert.equal(game.s.city, 'euphrates');
    if (visit <= 2) {
      game.act('buy', 'iron', 1);
      // Sell at the crossing to permit the legal return road.
      game.act('sell', 'iron', 1);
    } else {
      assert.equal(game.stock('iron'), 0);
      assert.throws(() => game.act('buy', 'iron', 1), /limit/);
    }
    if (visit < 3) cross();
  }
  assert.equal(game.s.ironPurchases, 2);
});

for (const count of [-1, 3, 1.5, null, '1', undefined]) {
  test(`damaged save rejects an iron counter of ${count}`, () => {
    const save = new Game('counter').snapshot();
    save.state.ironPurchases = count;
    assert.throws(() => Game.restore(save), /iron purchase count/);
  });
}
