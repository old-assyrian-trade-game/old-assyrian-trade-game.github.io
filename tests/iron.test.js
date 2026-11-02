import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Game, GameError} from '../dist/engine.js';
import {RULES} from '../dist/rules.js';

// Isolate arrival randomness without changing the saved scenario rules.
function visitCrossing(game, draw=0) {
  const originalRandom=game.random;
  game.s.journey={destination:'euphrates'};
  game.random=()=>draw;
  game.arrive();
  game.random=originalRandom;
  game.checkInvariants();
}

function offeredIron() {
  const game=new Game('iron-offers','Iron trader');
  game.act('buy','donkey',1);
  visitCrossing(game);
  return game;
}

const offers=game=>game.s.log.filter(entry=>entry.title==='A discreet offer').length;
const legacySave=()=>JSON.parse(readFileSync(new URL('./fixtures/iron-offer-2.3.0.json',import.meta.url),'utf8'));

test('a season can have no iron offers despite repeated visits',()=>{
  const game=new Game('no-iron');
  for(let visit=0;visit<8;visit++)visitCrossing(game,.99);
  assert.equal(game.s.ironOffers,0);
  assert.equal(offers(game),0);
  assert.equal(game.stock('iron'),0);
});

test('a season can have one offer without a guaranteed second offer',()=>{
  const game=offeredIron();
  game.act('declineIron');
  for(let visit=0;visit<6;visit++)visitCrossing(game,.99);
  assert.equal(game.s.ironOffers,1);
  assert.equal(offers(game),1);
});

test('an offer counts immediately, before a purchase or refusal',()=>{
  const game=offeredIron();
  assert.equal(game.s.ironOffers,1);
  assert.equal(game.qty('iron'),0);
  assert.equal(game.stock('iron'),1);
});

test('two declined offers exhaust the season and never produce a third',()=>{
  const game=offeredIron();
  for(let count=1;count<=2;count++) {
    assert.equal(game.s.ironOffers,count);
    game.act('declineIron');
    assert.equal(game.stock('iron'),0);
    if(count===1)visitCrossing(game);
  }
  for(let visit=0;visit<6;visit++)visitCrossing(game);
  assert.equal(game.s.ironOffers,2);
  assert.equal(offers(game),2);
  assert.equal(game.qty('iron'),0);
  assert.equal(game.stock('iron'),0);
});

test('the second offer can be purchased after the first was refused',()=>{
  const game=offeredIron();
  game.act('declineIron');
  visitCrossing(game);
  assert.equal(game.s.ironOffers,2);
  assert.equal(game.maxBuy('iron'),1);
  game.act('buy','iron',1);
  assert.equal(game.qty('iron'),1);
  assert.equal(game.s.ironOffers,2);
  assert.equal(game.stock('iron'),0);
});

test('buying and selling two offers never restores an opportunity',()=>{
  const game=offeredIron();
  for(let count=1;count<=2;count++) {
    game.act('buy','iron',1);
    game.act('sell','iron',1);
    assert.equal(game.s.ironOffers,count);
    visitCrossing(game);
  }
  assert.equal(game.stock('iron'),0);
  const before=game.snapshot();
  assert.throws(()=>game.act('buy','iron',1),/No iron offer/);
  assert.deepEqual(game.snapshot(),before);
});

test('waiting and reopening the market preserve one pending offer without rerolling',()=>{
  const game=offeredIron();
  game.act('advance',7);
  for(let read=0;read<5;read++) {
    game.refreshMarkets();game.quote('iron');game.maxBuy('iron');
  }
  assert.equal(game.s.ironOffers,1);
  assert.equal(offers(game),1);
  assert.equal(game.stock('iron'),1);
});

test('a declined offer cannot be recovered by waiting or reopening the market',()=>{
  const game=offeredIron();
  game.act('declineIron');
  game.act('advance',7);
  game.refreshMarkets();
  assert.equal(game.stock('iron'),0);
  assert.equal(game.s.ironOffers,1);
  assert.throws(()=>game.act('buy','iron',1),/No iron offer/);
});

test('refusing twice or refusing outside an offer is rejected without state changes',()=>{
  for(const game of [new Game('no-offer'),offeredIron()]) {
    if(game.stock('iron'))game.act('declineIron');
    const before=game.snapshot();
    assert.throws(()=>game.act('declineIron'),/no iron offer to decline/);
    assert.deepEqual(game.snapshot(),before);
  }
});

test('an unaffordable or invalid purchase cannot erase or duplicate the offer',()=>{
  const game=offeredIron();
  game.s.purse=0;
  for(const quantity of [1,0,-1,.5,2,NaN]) {
    const before=game.snapshot();
    assert.throws(()=>game.act('buy','iron',quantity),GameError);
    assert.deepEqual(game.snapshot(),before);
  }
  assert.equal(game.s.ironOffers,1);
  assert.equal(game.stock('iron'),1);
});

test('leaving the crossing expires an unaccepted offer immediately',()=>{
  const game=offeredIron();
  game.act('start','assur_crossing');
  assert.equal(game.s.ironStock,0);
  assert.equal(game.s.ironOffers,1);
  assert.equal(game.stock('iron'),0);
});

test('an invalid departure leaves the current iron offer available',()=>{
  const game=offeredIron(),before=game.snapshot();
  assert.throws(()=>game.act('start','kanes_durhumit'));
  assert.deepEqual(game.snapshot(),before);
  assert.equal(game.stock('iron'),1);
});

test('discarding iron does not restore the opportunity',()=>{
  const game=offeredIron();
  game.act('buy','iron',1);
  game.act('discard','iron',1);
  assert.equal(game.s.ironOffers,1);
  assert.equal(game.stock('iron'),0);
});

test('a road attack cannot reset the number of offers',()=>{
  const rules=structuredClone(RULES);
  const track=rules.routes.find(road=>road.id==='smugglers_track');
  track.loss_chance=1;track.arrest_dice=[0,1];
  const game=new Game('iron-lost','Lost cargo',rules);
  game.act('buy','donkey',1);visitCrossing(game);
  game.act('buy','iron',1);
  game.act('start','smugglers_track');
  game.act('advance',1);
  assert.equal(game.s.event.kind,'loss');
  assert.equal(game.qty('iron'),0);
  assert.equal(game.s.ironOffers,1);
});

test('saving a declined offer preserves its count and next random draw',()=>{
  const game=offeredIron();game.act('declineIron');
  const restored=Game.restore(game.snapshot());
  assert.equal(restored.s.ironOffers,1);
  assert.equal(restored.stock('iron'),0);
  assert.deepEqual(restored.snapshot(),game.snapshot());
  assert.equal(restored.random(),game.random());
  assert.equal(new Game('new-season').s.ironOffers,0);
});

test('saving the pending second offer keeps it available to buy',()=>{
  const game=offeredIron();game.act('declineIron');visitCrossing(game);
  const restored=Game.restore(game.snapshot());
  assert.equal(restored.s.ironOffers,2);
  assert.equal(restored.stock('iron'),1);
  restored.act('buy','iron',1);
  assert.equal(restored.s.ironOffers,2);
});

test('actual return journeys cannot get a third offer after two refusals',()=>{
  const rules=structuredClone(RULES);
  rules.markets.iron_offer_chance=1;
  rules.caravan.donkey_weekly_mortality=0;
  rules.caravan.incident_chance_per_day=0;
  rules.routes[0].loss_chance=0;
  const game=new Game('repeat-crossing','Repeat traveler',rules);
  const cross=()=>{
    game.act('start','assur_crossing');
    while(game.s.journey)game.act('advance',7);
  };
  for(let visit=1;visit<=3;visit++) {
    cross();assert.equal(game.s.city,'euphrates');
    if(visit<=2)game.act('declineIron');
    else assert.equal(game.stock('iron'),0);
    if(visit<3)cross();
  }
  assert.equal(game.s.ironOffers,2);
  assert.equal(offers(game),2);
});

test('a genuine 2.3.0 save upgrades using offers, not its zero purchases',()=>{
  const save=legacySave(),before=structuredClone(save);
  const game=Game.restore(save);
  assert.deepEqual(save,before);
  assert.equal(save.state.ironPurchases,0);
  assert.equal(game.s.ironOffers,2);
  assert.equal(game.stock('iron'),1);
  assert.equal(game.rules.version,RULES.version);
  assert.equal(Object.hasOwn(game.s,'ironPurchases'),false);
  for(const key of ['purse','bank','principal','emergency','day','close','deadline','inventory','donkeys'])assert.deepEqual(game.s[key],save.state[key]);
  assert.equal(game.randomState,save.randomState);
  game.act('buy','donkey',1);game.act('buy','iron',1);
  assert.equal(game.s.ironOffers,2);
});

test('upgrading more than two old offers closes an excess pending offer',()=>{
  const save=legacySave();
  save.state.log.push({...save.state.log.find(e=>e.title==='A discreet offer')});
  const game=Game.restore(save);
  assert.equal(game.s.ironOffers,2);
  assert.equal(game.stock('iron'),0);
  visitCrossing(game);
  assert.equal(game.stock('iron'),0);
});

test('upgrading cannot recover an old offer already left behind',()=>{
  const save=legacySave();save.state.city='assur';
  const game=Game.restore(save);
  assert.equal(game.s.ironOffers,2);
  assert.equal(game.s.ironStock,0);
});

test('altered legacy rules are rejected without modifying the supplied save',()=>{
  const save=legacySave();save.rules.markets.iron_purchase_limit=99;
  const before=structuredClone(save);
  assert.throws(()=>Game.restore(save),/different scenario rules/);
  assert.deepEqual(save,before);
});

for(const count of [-1,3,1.5,null,'1',undefined]) {
  test(`damaged save rejects an iron offer counter of ${count}`,()=>{
    const save=new Game('counter').snapshot();save.state.ironOffers=count;
    assert.throws(()=>Game.restore(save),/iron offer count/);
  });
}

test('a pending offer needs a counted opportunity and the current crossing visit',()=>{
  for(const [count,city] of [[0,'euphrates'],[1,'assur']]) {
    const save=new Game('bad-offer').snapshot();
    Object.assign(save.state,{ironStock:1,ironOffers:count,city});
    assert.throws(()=>Game.restore(save),/current visit/);
  }
});
