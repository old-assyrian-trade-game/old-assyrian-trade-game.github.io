// Pure game engine: no DOM, storage, network, or framework dependencies.
// Quantities are minas (metals) or pieces (textiles); money is silver shekels.
import { RULES } from './rules.js';
export const EPS = 1e-7;
const EXPORTS = ['tin','textile','fine_textile'];
const clone = value => JSON.parse(JSON.stringify(value));
export class GameError extends Error {}
function requireThat(condition, message) { if (!condition) throw new GameError(message); }
function positive(n) { requireThat(typeof n==='number' && Number.isFinite(n) && n>0, 'Enter a positive, finite amount.'); return n; }
export class Game {
  constructor(seed='', team='Assur trader', rules=RULES) {
    this.rules=clone(rules);
    this.seed=String(seed || globalThis.crypto?.randomUUID?.() || Date.now()).slice(0,80);
    this.randomState=2166136261;
    for(const c of this.seed) this.randomState=Math.imul(this.randomState^c.charCodeAt(0),16777619)>>>0;
    const r=this.rules,m=r.markets;
    const close=r.season.base_days+this.roll(r.season.dice);
    this.s={team:String(team).trim().slice(0,60)||'Assur trader',day:0,close,
      deadline:close+r.season.foot_grace_base+this.roll(r.season.foot_grace_dice),
      city:'assur',purse:r.starting_silver,bank:0,principal:r.starting_silver,emergency:0,
      donkeys:0,wagon:null,inventory:Object.fromEntries(Object.keys(r.goods).map(k=>[k,{qty:0,basis:0,cleared:0}])),
      journey:null,event:null,finished:false,jailed:false,result:null,log:[],ledger:[],
      epoch:'',quotes:{},source:{},donkeyPeriod:-1,donkeyStock:0,
      fineStock:m.fine_restock_loads*r.goods.fine_textile.units_per_donkey,
      nextFine:this.roll(m.fine_restock_dice)*m.fine_restock_days_per_roll,ironStock:0,ironPurchases:0,
      tinChange:m.tin_change_day_base+this.integer(-m.tin_change_day_spread,m.tin_change_day_spread),wool:[],transfers:[]};
    this.refreshMarkets();
    this.note('Game begins',`${this.s.team} receives an interest-free loan of ${r.starting_silver} shekels of silver. Caravans must arrive by day ${close}; final accounting is on day ${this.s.deadline}.`);
  }
  random() {
    this.randomState=(this.randomState+0x6D2B79F5)>>>0;
    let t=this.randomState;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);
    return ((t^(t>>>14))>>>0)/4294967296;
  }
  integer(a,b) { return a+Math.floor(this.random()*(b-a+1)); }
  roll([n,sides]) { let total=0;for(let i=0;i<n;i++) total+=this.integer(1,sides);return total; }
  signed(dice) { return this.roll(dice)*(this.random()<.5?-1:1); }
  name(city=this.s.city) { return this.rules.cities[city].name; }
  qty(key) { return key==='donkey'?this.s.donkeys:this.s.inventory[key].qty; }
  debt() { return this.s.principal+this.s.emergency; }
  available() { return this.s.purse+(this.s.city==='assur'&&!this.s.journey?this.s.bank:0); }
  note(title,text,kind='info') { this.s.log.push({day:this.s.day,title,text,kind}); }
  entry(category,amount,text) { this.s.ledger.push({day:this.s.day,category,amount,purse:this.s.purse,bank:this.s.bank,debt:this.debt(),text}); }
  pay(amount,category,text,credit=false) {
    requireThat(Number.isFinite(amount)&&amount>=0,'Invalid bill.');
    requireThat(credit||amount<=this.available()+EPS,'There is not enough silver available here.');
    let left=amount;const cash=Math.min(left,this.s.purse);this.s.purse-=cash;left-=cash;
    if(this.s.city==='assur'&&!this.s.journey){const bank=Math.min(left,this.s.bank);this.s.bank-=bank;left-=bank;}
    if(left>EPS){const fee=left*this.rules.finance.emergency_fee;this.s.emergency+=left+fee;
      this.note('Emergency credit',`A bill shortfall of ${left.toFixed(2)} silver becomes debt, with a ${fee.toFixed(2)} handling fee.`,'warning');}
    this.entry(category,-amount,text);
  }
  receive(amount,text,bank=false) { this.s[bank?'bank':'purse']+=amount;this.entry('Receipt',amount,text); }
  active(town=false) {
    requireThat(!this.s.finished,'This game has ended. Start a new game to play again.');
    requireThat(!this.s.event,'Resolve the road decision first.');
    if(town) requireThat(!this.s.journey,'Arrive in town before doing business.');
  }
  // Public mutation entry point. Invalid actions restore money, time AND random state.
  act(action,...args) {
    const allowed=['buy','sell','discard','rent','start','advance','resolve','lodging','roadSell','deposit','withdraw','repay','remit','buyWool','finish'];
    requireThat(allowed.includes(action),'Unknown action.');
    const previous=this.snapshot();
    try { this[action](...args);this.checkInvariants(); }
    catch(error){this.s=previous.state;this.randomState=previous.randomState;throw error;}
    return this;
  }
  refreshMarkets() {
    const r=this.rules,m=r.markets,day=this.s.day;
    const period=Math.floor(day/m.donkey_restock_days);
    if(period!==this.s.donkeyPeriod){this.s.donkeyStock=m.donkey_stock_base+this.signed(m.donkey_stock_dice);this.s.donkeyPeriod=period;}
    while(day>=this.s.nextFine){this.s.fineStock+=m.fine_restock_loads*r.goods.fine_textile.units_per_donkey;
      this.s.nextFine+=this.roll(m.fine_restock_dice)*m.fine_restock_days_per_roll;}
    const epoch=`${Math.floor(day/m.quote_days)}:${day>=this.s.tinChange}`;
    if(epoch===this.s.epoch)return;
    const tinBase=day>=this.s.tinChange?m.tin_late_ratio_base:m.tin_early_ratio_base;
    const p={tin:60/(tinBase+this.signed(m.tin_ratio_dice)),
      textile:m.textile_base+this.signed(m.textile_dice),fine_textile:m.fine_textile_base+this.signed(m.fine_textile_dice),
      copper:60/(m.copper_ratio_base+this.signed(m.copper_ratio_dice)),iron:m.iron_silver_per_mina};
    this.s.source=p;this.s.quotes={};
    for(const [city,c] of Object.entries(r.cities)) {
      const quotes={};
      for(const key of Object.keys(r.goods)) {
        let buy=null,sell=null;
        if(EXPORTS.includes(key)) {
          // Textiles earn a larger typical return than tin. Apply the factor to
          // the city's markup, leaving weekly price variation and tax separate.
          const markup=c.markup_base*m.export_markup_factors[key];
          const price=p[key]*(1+(city==='assur'?0:markup+this.signed(c.markup_dice)/100));
          buy=city==='assur'?price:price*m.import_purchase_factor;
          sell=city==='assur'?price*m.assur_resale_factor:price;
          if(key==='fine_textile'&&city!=='assur')buy=null;
        } else if(key==='copper') {
          if(city==='durhumit'){buy=p.copper;sell=buy*m.assur_resale_factor;}
          if(city==='purushhaddum')sell=p.copper*(1+m.copper_markup_base+this.signed(m.copper_markup_dice)/100);
        } else if(key==='iron') {
          if(city==='euphrates'){buy=p.iron;sell=p.iron*m.assur_resale_factor;}
          if(city==='durhumit')sell=p.iron*(1+m.iron_markup_base+this.signed(m.iron_markup_dice)/100);
        }
        const tax=city==='purushhaddum'?r.taxes.purushhaddum_sales:0;
        quotes[key]={buy,sell,tax,net:sell===null?null:sell*(1-tax)};
      }
      const buy=city==='assur'?m.donkey_assur_price_base+this.integer(-m.donkey_assur_price_spread,m.donkey_assur_price_spread):m.donkey_other_price_base+this.roll(m.donkey_other_price_dice);
      const sell=m.donkey_sale_base-this.roll(m.donkey_sale_dice);
      quotes.donkey={buy,sell,tax:0,net:sell};this.s.quotes[city]=quotes;
    }
    this.s.epoch=epoch;
  }
  quote(key,city=this.s.city) { return this.s.quotes[city][key]; }
  stock(key) {
    if(key==='donkey')return this.s.city==='assur'?this.s.donkeyStock:Infinity;
    if(key==='fine_textile'&&this.s.city==='assur')return this.s.fineStock;
    if(key==='iron')return this.s.city==='euphrates'&&this.s.ironPurchases<this.rules.markets.iron_purchase_limit?this.s.ironStock:0;
    return this.quote(key).buy===null?0:Infinity;
  }
  wagonCapacity(wagon=this.s.wagon) { return wagon?this.rules.wagons[wagon].capacity_minas:0; }
  load(changes={},wagon=this.s.wagon) {
    return Object.entries(this.rules.goods).reduce((sum,[key,g])=>{
      let qty=this.qty(key)+(changes[key]||0);
      if(key==='copper')qty=Math.max(0,qty-this.wagonCapacity(wagon));
      return sum+qty/g.units_per_donkey;
    },0);
  }
  cargoBasis() { return Object.values(this.s.inventory).reduce((n,l)=>n+l.basis,0); }
  solo() { return this.s.donkeys===0&&!this.s.wagon&&this.load()<EPS; }
  maxBuy(key) {
    const price=this.quote(key).buy;if(price===null)return 0;
    if(key==='donkey')return Math.floor(Math.min(this.available()/price,this.stock(key)));
    const g=this.rules.goods[key];let room=Math.max(0,this.s.donkeys-this.load())*g.units_per_donkey;
    if(key==='copper')room+=Math.max(0,this.wagonCapacity()-this.qty('copper'));
    return Math.max(0,Math.floor((Math.min(room,this.available()/price,this.stock(key))+EPS)/g.step)*g.step);
  }
  tradeAmount(key,qty) {
    requireThat(key==='donkey'||Object.hasOwn(this.rules.goods,key),'Unknown commodity.');positive(qty);
    const step=key==='donkey'?1:this.rules.goods[key].step;
    requireThat(Math.abs(qty/step-Math.round(qty/step))<EPS,`Trade in steps of ${step}.`);
    return Math.round(qty/step)*step;
  }
  buy(key,qty) {
    this.active(true);qty=this.tradeAmount(key,qty);const q=this.quote(key);
    if(key==='iron')requireThat(this.s.ironPurchases<this.rules.markets.iron_purchase_limit,'You have reached the iron purchase limit for this season.');
    requireThat(q.buy!==null,'No seller offers this here.');requireThat(qty<=this.stock(key)+EPS,'The market does not have that much stock.');
    requireThat(key==='donkey'||this.load({[key]:qty})<=this.s.donkeys+EPS,'Buy more transport or reduce this purchase.');
    this.pay(qty*q.buy,'Purchase',`${qty} ${key}`);
    if(key==='donkey'){this.s.donkeys+=qty;if(this.s.city==='assur')this.s.donkeyStock-=qty;}
    else {const l=this.s.inventory[key];l.qty+=qty;l.basis+=qty*q.buy;if(this.s.city==='kanes')l.cleared+=qty;
      if(key==='fine_textile'&&this.s.city==='assur')this.s.fineStock-=qty;
      // Count completed purchases, not offers. Selling or losing the cargo does
      // not restore the allowance; the counter is part of every saved game.
      if(key==='iron'){this.s.ironPurchases++;this.s.ironStock-=qty;}}
    this.note('Goods purchased',`Bought ${qty} ${key==='donkey'?'donkeys':this.rules.goods[key].name} for ${(qty*q.buy).toFixed(2)} silver.`);
  }
  remove(key,qty) {
    const lot=this.s.inventory[key],part=Math.min(1,qty/lot.qty),basis=lot.basis*part;
    lot.qty=Math.max(0,lot.qty-qty);lot.basis=Math.max(0,lot.basis-basis);lot.cleared*=1-part;
    if(lot.qty<EPS)Object.assign(lot,{qty:0,basis:0,cleared:0});return basis;
  }
  sell(key,qty) {
    this.active(true);qty=this.tradeAmount(key,qty);const q=this.quote(key);
    requireThat(qty<=this.qty(key)+EPS,'You do not own that quantity.');requireThat(q.sell!==null,'There is no local buyer.');
    requireThat(key!=='donkey'||this.load()<=this.s.donkeys-qty+EPS,'Sell cargo before selling its pack animals.');
    if(key==='donkey')this.s.donkeys-=qty;else this.remove(key,qty);
    this.receive(q.sell*qty,`Sold ${qty} ${key}`);if(q.tax)this.pay(q.sell*qty*q.tax,'Tax','Local sales levy');
    this.note('Sale completed',`Sold ${qty} ${key==='donkey'?'donkeys':this.rules.goods[key].name}; received ${(q.net*qty).toFixed(2)} silver after tax.`,'good');
  }
  discard(key,qty) { this.active(true);qty=this.tradeAmount(key,qty);requireThat(key!=='donkey'&&qty<=this.qty(key)+EPS,'Choose cargo that you own.');this.remove(key,qty);this.note('Cargo abandoned',`Left ${qty} ${this.rules.goods[key].name} behind.`,'warning'); }
  rent(wagon) {
    this.active(true);requireThat(wagon===null||Object.hasOwn(this.rules.wagons,wagon),'Unknown wagon.');
    requireThat(wagon===null||this.s.city==='durhumit','Hire wagons in Durhumit.');
    requireThat(this.load({},wagon)<=this.s.donkeys+EPS,'Unload copper before reducing wagon capacity.');
    this.s.wagon=wagon;this.note('Transport changed',wagon?`Hired a ${this.rules.wagons[wagon].name.toLowerCase()}. Rent accrues every day, including in town.`:'Released the wagon. Rent has stopped.');
  }
  deposit(amount) { this.active(true);positive(amount);requireThat(this.s.city==='assur'&&amount<=this.s.purse+EPS,'Deposit available purse silver while in Assur.');this.s.purse=Math.max(0,this.s.purse-amount);this.s.bank+=amount;this.entry('Deposit',amount,'Silver secured in Assur'); }
  withdraw(amount) { this.active(true);positive(amount);requireThat(this.s.city==='assur'&&amount<=this.s.bank+EPS,'Withdraw silver from your Assur account while in Assur.');this.s.bank=Math.max(0,this.s.bank-amount);this.s.purse+=amount;this.entry('Withdrawal',amount,'Assur account to purse'); }
  repay(amount) {
    this.active(true);positive(amount);requireThat(this.s.city==='assur','Repay creditors in Assur.');requireThat(amount<=this.debt()+EPS&&amount<=this.available()+EPS,'Repayment exceeds available silver or debt.');
    const cash=Math.min(amount,this.s.purse);this.s.purse-=cash;this.s.bank=Math.max(0,this.s.bank-(amount-cash));let left=amount;
    for(const key of ['emergency','principal']){const paid=Math.min(left,this.s[key]);this.s[key]=Math.max(0,this.s[key]-paid);left-=paid;}
    this.entry('Repayment',-amount,'Creditors in Assur');this.note('Credit repaid',`Repaid ${amount.toFixed(2)} silver.`,'good');
  }
  remit(amount) {
    this.active(true);if(this.s.city==='assur'){this.deposit(amount);return;}positive(amount);
    const f=this.rules.finance,due=this.s.day+f.remittance_days;
    requireThat(amount<=this.s.purse+EPS,'Not enough purse silver.');requireThat(due<=this.s.deadline,'The messenger would arrive after final accounting.');
    this.s.purse=Math.max(0,this.s.purse-amount);const net=amount*(1-f.remittance_fee);
    this.s.transfers.push({amount:net,due,kind:'Silver remittance'});this.entry('Remittance',-amount,`Net ${net.toFixed(2)} due day ${due}`);
    this.note('Silver sent home',`${net.toFixed(2)} silver is due in Assur on day ${due}.`);
  }
  buyWool(amount) {
    this.active(true);positive(amount);const w=this.rules.wool;
    requireThat(this.s.city==='purushhaddum'&&this.s.day>=w.buy_start&&this.s.day<=w.buy_end,'Wool contracts are available in Purušhaddum during the plucking window.');
    this.pay(amount,'Wool investment','Agent stores wool');this.s.wool.push({cost:amount,qty:amount/w.silver_per_mina,sold:false});
    this.note('Wool entrusted to an agent',`Invested ${amount.toFixed(2)} silver. Your agent sells on day ${w.sale_day}, then sends the proceeds home.`);
  }
  route(id) { const road=this.rules.routes.find(x=>x.id===id);requireThat(road,'Unknown road.');return road; }
  neighbors(city=this.s.city) { return this.rules.routes.filter(x=>[x.a,x.b].includes(city)).map(r=>({road:r,destination:r.a===city?r.b:r.a})); }
  uncleared() { return EXPORTS.some(k=>this.s.inventory[k].qty-this.s.inventory[k].cleared>EPS); }
  shares() {
    const tin=this.qty('tin')*this.s.source.tin;
    const textiles=this.qty('textile')*this.s.source.textile+this.qty('fine_textile')*this.s.source.fine_textile;
    return tin+textiles>EPS?[tin/(tin+textiles),textiles/(tin+textiles)]:[0,0];
  }
  timeRange(id,pace='normal') {
    const road=this.route(id),[n,s]=road.days_dice;
    let low=road.days_base+(road.days_signed?-n*s:n),high=road.days_base+n*s;
    if(pace==='hard'&&!this.solo()){low=Math.ceil(low/(1+this.rules.caravan.hard_driving_speed_bonus));high=Math.ceil(high/(1+this.rules.caravan.hard_driving_speed_bonus));}
    const destination=road.a===this.s.city?road.b:road.a;
    if(destination==='kanes'&&this.uncleared()){const [n,s]=this.rules.taxes.clearance_dice;low+=n;high+=n*s;}
    return [Math.max(1,low),Math.max(1,high)];
  }
  fees(id) { return this.cargoBasis()*(this.route(id).toll+(this.s.city==='assur'?this.rules.caravan.leader_fee:0)); }
  dailyCost(escort=false,road=true) {
    const c=this.rules.caravan;let value=this.rules.finance.living_per_week/7;
    if(road)value+=((c.tin_shekels_per_donkey_day+c.stabling_tin_shekels)*this.s.donkeys+c.hotel_tin_shekels)*this.s.source.tin/60;
    if(this.s.wagon)value+=this.rules.wagons[this.s.wagon].weekly_rent/7;
    return value+(road&&escort?c.escort_cost_per_day:0);
  }
  start(id,pace='normal',escort=false) {
    this.active(true);const road=this.route(id);
    requireThat([road.a,road.b].includes(this.s.city),'Choose a connected road.');requireThat(['normal','hard'].includes(pace),'Choose a valid pace.');
    requireThat(this.load()<=this.s.donkeys+EPS,'The caravan is overloaded.');
    requireThat(!this.s.wagon||id==='durhumit_purushhaddum','Release the copper wagon before taking another road.');
    requireThat(!this.qty('iron')||road.smuggling,'Unlicensed iron can only use Smuggler’s Track. Sell or discard it first.');
    if(this.s.city==='assur'&&EXPORTS.some(k=>this.qty(k)>EPS)) requireThat(Math.min(...this.shares())+EPS>=this.rules.caravan.minimum_export_share,'Your export needs both tin and textiles, each at least one tenth of their combined value.');
    const cutoff=this.solo()?this.s.deadline:this.s.close;
    requireThat(this.s.day+this.timeRange(id,pace)[1]<=cutoff,'Even the longest expected journey must fit before the travel deadline. Leave earlier, choose another road or pace, or sell all transport and goods to travel on foot.');
    const destination=road.a===this.s.city?road.b:road.a;
    let days=road.days_base+(road.days_signed?this.signed(road.days_dice):this.roll(road.days_dice));
    if(pace==='hard'&&!this.solo())days=Math.ceil(days/(1+this.rules.caravan.hard_driving_speed_bonus));
    if(destination==='kanes'&&this.uncleared())days+=this.roll(this.rules.taxes.clearance_dice);
    this.pay(this.fees(id),'Road fees',road.name,true);
    this.s.journey={id,origin:this.s.city,destination,total:days,hazardDays:days,left:days,elapsed:0,pace,escort:!!escort,
      inspectionDay:this.integer(1,days),inspected:false,lodgeStock:0,lodgePrice:0,lodgeSell:0};
    this.note('Departure',`Left ${this.name()} for ${this.name(destination)}. The planned journey is ${days} days, including any Kaneš clearance.`);
  }
  dailyAccounts() {
    const s=this.s,f=this.rules.finance;
    this.pay(this.dailyCost(s.journey?.escort,!!s.journey),'Daily costs','Living, travel, and any wagon rent',true);
    const w=this.rules.wool;
    for(const lot of s.wool)if(!lot.sold&&s.day>=w.sale_day){
      const gross=lot.cost*(1+w.markup_base+this.signed(w.markup_dice)/100);
      const net=gross*(1-this.rules.taxes.purushhaddum_sales)*(1-f.remittance_fee);
      lot.sold=true;lot.proceeds=net;s.transfers.push({amount:net,due:s.day+f.remittance_days,kind:'Wool proceeds'});
      this.note('Letter from the wool agent',`The wool has sold. Net ${net.toFixed(2)} silver is due in Assur on day ${s.day+f.remittance_days}.`,'good');
    }
    for(const transfer of [...s.transfers])if(s.day>=transfer.due){this.receive(transfer.amount,transfer.kind,true);s.transfers.splice(s.transfers.indexOf(transfer),1);this.note('Silver reaches Assur',`${transfer.amount.toFixed(2)} silver credited to your Assur account.`,'good');}
  }
  advance(days=1) {
    this.active();requireThat(Number.isInteger(days)&&days>=1&&days<=60,'Choose between one and sixty whole days.');
    const startedOnRoad=!!this.s.journey;
    for(let i=0;i<days&&!this.s.finished&&!this.s.event;i++){
      this.s.day++;this.refreshMarkets();this.dailyAccounts();
      if(this.s.journey)this.roadDay();else this.mortality(false);
      if(this.s.day===this.s.close)this.note('Caravan season closes','Only travelers without goods, animals, or a wagon can still depart.','warning');
      if(this.s.day>=this.s.deadline&&!this.s.finished)this.closeBooks('The final accounting deadline has arrived.');
      if(startedOnRoad&&!this.s.journey)break;
    }
    if(!startedOnRoad&&!this.s.finished)this.note('Days pass',`It is day ${this.s.day} in ${this.name()}.`);
  }
  mortality(hard) {
    const c=this.rules.caravan,weekly=hard?c.hard_driving_weekly_mortality:c.donkey_weekly_mortality,p=1-(1-weekly)**(1/7);
    let lost=0;for(let i=0;i<this.s.donkeys;i++)if(this.random()<p)lost++;
    if(lost){this.s.donkeys-=lost;this.note('Pack animals lost',`${lost} donkey(s) died; ${this.s.donkeys} remain.`,'warning');
      if(this.s.journey&&this.load()>this.s.donkeys+EPS)this.overload();}
  }
  roadDay() {
    const j=this.s.journey,road=this.route(j.id),c=this.rules.caravan,m=this.rules.markets;
    j.elapsed++;j.left--;j.lodgeStock=this.roll(c.nightly_replacement_dice);j.lodgePrice=m.donkey_other_price_base+this.roll(m.donkey_other_price_dice);j.lodgeSell=m.donkey_sale_base-this.roll(m.donkey_sale_dice);
    if(road.smuggling&&!j.inspected&&j.elapsed>=j.inspectionDay){j.inspected=true;
      const chance=this.roll(road.arrest_dice)/100*(j.escort?c.escort_arrest_multiplier:1);
      if(this.random()<chance){this.s.jailed=true;this.closeBooks('A patrol seized the caravan. Jailed teams lose.');return;}}
    if(!this.solo()){
      const chance=road.loss_chance*(j.escort?c.escort_loss_multiplier:1);
      if(this.random()<1-(1-chance)**(1/j.hazardDays)){
        for(const k of Object.keys(this.s.inventory))if(this.qty(k))this.remove(k,this.qty(k));
        this.s.donkeys=0;this.s.wagon=null;
        this.s.event={kind:'loss',title:'The consignment is lost',text:'An attack scatters the caravan. Cargo, animals, and any wagon are lost. You escape with your purse; your Assur account and agents remain safe.'};
        this.note('Caravan lost',this.s.event.text,'danger');
      }
    }
    if(!this.s.event)this.mortality(j.pace==='hard');
    if(!this.s.event&&j.left>0&&this.random()<c.incident_chance_per_day){
      const kind=['guide','repair','news'][this.integer(0,2)];
      if(kind==='news')this.note('News at the lodging','Silver must reach Assur before final accounting to count toward your profit.');
      else {const guide=kind==='guide'||this.solo();this.s.event={kind:guide?'guide':'repair',title:guide?'A damaged crossing':'Fraying pack gear',fee:guide?c.guide_fee:c.repair_fee,delay:guide?c.guide_delay_days:c.repair_delay_days,text:guide?'A local guide knows a passable crossing. Pay for help or spend extra time finding a detour.':'Pay a craft worker to repair the straps, or lose time doing the work yourselves.'};}
    }
    if(j.left<=0&&!this.s.event)this.arrive();
  }
  overload() { const j=this.s.journey;this.s.event={kind:'overload',title:'Too few pack animals',text:'The cargo no longer fits. Buy replacement animals or abandon the least valuable cargo per load.',count:Math.min(Math.ceil(this.load()-this.s.donkeys-EPS),j.lodgeStock),price:j.lodgePrice}; }
  resolve(choice) {
    requireThat(!this.s.finished&&this.s.event,'No road decision is pending.');
    const e=this.s.event,j=this.s.journey;
    if(e.kind==='loss')requireThat(choice==='continue','Continue on foot.');
    else if(e.kind==='overload'){
      requireThat(['buy','discard'].includes(choice),'Choose replacements or abandonment.');
      if(choice==='buy'){requireThat(e.count>0,'No animals remain at this lodging.');this.pay(e.count*e.price,'Purchase','Replacement animals',true);this.s.donkeys+=e.count;j.lodgeStock-=e.count;}
      else this.dropExcess();
    }else{
      requireThat(['pay','wait'].includes(choice),'Choose help or delay.');
      if(choice==='pay')this.pay(e.fee,'Road costs',e.title,true);
      else {const cutoff=this.solo()?this.s.deadline:this.s.close;requireThat(this.s.day+j.left+e.delay<=cutoff,'The detour would arrive after closure. Pay for assistance instead.');j.left+=e.delay;j.total+=e.delay;}
    }
    this.note(e.title,choice==='wait'?`Added ${e.delay} day(s).`:`Decision: ${choice}.`);
    this.s.event=null;
    if(this.load()>this.s.donkeys+EPS)this.overload();else if(j.left<=0)this.arrive();
  }
  dropExcess() {
    const keys=Object.keys(this.rules.goods).sort((a,b)=>(this.quote(a).net??this.s.source[a]*.5)*this.rules.goods[a].units_per_donkey-(this.quote(b).net??this.s.source[b]*.5)*this.rules.goods[b].units_per_donkey);
    for(const k of keys){const excess=this.load()-this.s.donkeys;if(excess<EPS)break;const g=this.rules.goods[k];
      const available=Math.max(0,this.qty(k)-(k==='copper'?this.wagonCapacity():0));
      const qty=Math.min(available,Math.ceil((excess*g.units_per_donkey-EPS)/g.step)*g.step);
      if(qty>EPS){this.remove(k,qty);this.note('Cargo left behind',`${qty} ${g.name} abandoned.`,'warning');}}
  }
  lodging(count=1) {
    this.active();const j=this.s.journey;requireThat(j&&Number.isInteger(count)&&count>0&&count<=j.lodgeStock,'Choose animals available at tonight’s lodging.');
    requireThat(this.s.day+j.left<=this.s.close,'This journey uses the foot-travel grace period. You cannot add animals to it.');
    this.pay(count*j.lodgePrice,'Purchase','Nightly lodging animals');this.s.donkeys+=count;j.lodgeStock-=count;
  }
  roadSell(count) {
    this.active();const j=this.s.journey;
    requireThat(j&&j.elapsed>0&&Number.isInteger(count)&&count>0&&count<=this.s.donkeys,'Choose owned animals at a nightly lodging.');
    requireThat(this.load()<=this.s.donkeys-count+EPS,'Keep enough animals to carry the cargo.');
    this.s.donkeys-=count;this.receive(count*j.lodgeSell,'Animals sold en route');
    this.note('Animals sold en route',`Sold ${count} donkey(s) for ${(count*j.lodgeSell).toFixed(2)} silver.`,'good');
  }
  arrive() {
    this.s.city=this.s.journey.destination;this.s.journey=null;this.s.ironStock=0;
    if(this.s.city==='kanes'&&this.uncleared()){
      let tax=0;for(const k of EXPORTS){const l=this.s.inventory[k],rate=k==='tin'?this.rules.taxes.kanes_tin:this.rules.taxes.kanes_textiles;tax+=(l.qty-l.cleared)*this.quote(k).sell*rate;l.cleared=l.qty;}
      this.pay(tax,'Customs','Kaneš clearance',true);this.note('Customs cleared',`Paid ${tax.toFixed(2)} silver. These goods keep their seals on later visits.`);
    }
    const m=this.rules.markets;
    if(this.s.city==='euphrates'&&this.s.ironPurchases<m.iron_purchase_limit&&this.random()<m.iron_offer_chance){
      this.s.ironStock=m.iron_offer_minas;
      const remaining=m.iron_purchase_limit-this.s.ironPurchases;
      this.note('A discreet offer',`A trader offers iron. You may buy iron at most ${remaining} more ${remaining===1?'time':'times'} this season. The cargo must take Smuggler’s Track to Durhumit.`,'warning');
    }
    this.note('Arrival',`Reached ${this.name()} on day ${this.s.day}. The market is open.`,'good');
  }
  settlement() {
    const home=this.s.city==='assur'&&!this.s.journey;
    const cargo=home?Object.keys(this.rules.goods).reduce((a,k)=>a+this.qty(k)*(this.quote(k,'assur').net??0),0):0;
    const animals=home?this.s.donkeys*this.quote('donkey','assur').net:0;
    const purse=home?this.s.purse:0;
    const unrecovered=(home?Object.keys(this.rules.goods).reduce((a,k)=>a+(this.quote(k,'assur').net===null?this.s.inventory[k].basis:0),0):this.s.purse+this.cargoBasis()+this.s.donkeys*this.quote('donkey').net)
      +this.s.transfers.reduce((a,t)=>a+t.amount,0)+this.s.wool.filter(w=>!w.sold).reduce((a,w)=>a+w.cost,0);
    return {bank:this.s.bank,purse,cargo,animals,principal:this.s.principal,emergency:this.s.emergency,debt:this.debt(),unrecovered,profit:this.s.bank+purse+cargo+animals-this.debt()};
  }
  wealth() { return this.s.purse+this.s.bank+Object.keys(this.rules.goods).reduce((a,k)=>a+this.qty(k)*(this.quote(k).net??this.s.source[k]*.5),0)+this.s.donkeys*this.quote('donkey').net+this.s.transfers.reduce((a,t)=>a+t.amount,0)+this.s.wool.filter(w=>!w.sold).reduce((a,w)=>a+w.cost,0)-this.debt(); }
  finish() { this.active();this.closeBooks('You ended the game.'); }
  closeBooks(reason) { this.s.result={...this.settlement(),reason,jailed:this.s.jailed};this.s.finished=true;this.s.event=null;this.note('Final accounting',reason,this.s.jailed?'danger':'good'); }
  snapshot() { return clone({format:'YATS-WEB',version:this.rules.version,seed:this.seed,randomState:this.randomState,rules:this.rules,state:this.s}); }
  static restore(data) {
    requireThat(data?.format==='YATS-WEB'&&data.version===RULES.version,'This save uses an earlier or different version of the rules. Start a new game to use the current rules.');
    // Rules are part of the save; this version accepts only this exact scenario.
    requireThat(JSON.stringify(data.rules)===JSON.stringify(RULES),'This save uses different scenario rules.');
    const game=Object.create(Game.prototype);game.rules=clone(data.rules);game.s=clone(data.state);game.seed=String(data.seed);
    requireThat(Number.isInteger(data.randomState)&&data.randomState>=0&&data.randomState<=4294967295,'Damaged random state.');game.randomState=data.randomState;game.checkInvariants();return game;
  }
  checkInvariants() {
    const s=this.s;requireThat(s&&this.rules.cities[s.city]&&Number.isInteger(s.day)&&s.day>=0&&s.day<=s.deadline,'Damaged game calendar or location.');
    for(const key of ['purse','bank','principal','emergency','donkeys'])requireThat(typeof s[key]==='number'&&Number.isFinite(s[key])&&s[key]>=-EPS,`Invalid ${key}.`);
    requireThat(Number.isInteger(s.donkeys),'Invalid animal count.');
    for(const k of Object.keys(this.rules.goods)){const lot=s.inventory[k];requireThat(lot&&['qty','basis','cleared'].every(x=>Number.isFinite(lot[x])&&lot[x]>=-EPS)&&lot.cleared<=lot.qty+EPS,'Invalid cargo record.');}
    requireThat(Array.isArray(s.log)&&Array.isArray(s.ledger)&&Array.isArray(s.wool)&&Array.isArray(s.transfers),'Damaged game records.');
    for(const t of s.transfers)requireThat(Number.isFinite(t.amount)&&t.amount>=0&&Number.isInteger(t.due),'Invalid remittance.');
    if(s.journey){const j=s.journey,road=this.route(j.id);requireThat([road.a,road.b].includes(j.origin)&&[road.a,road.b].includes(j.destination)&&j.origin!==j.destination&&Number.isInteger(j.left)&&j.left>=0&&j.total>0,'Damaged journey.');}
    requireThat(!s.event||s.journey,'A road decision needs a journey.');
    const finite=(n,min=0)=>typeof n==='number'&&Number.isFinite(n)&&n>=min;
    requireThat(Number.isInteger(s.close)&&Number.isInteger(s.deadline)&&s.close>0&&s.deadline>s.close,'Invalid season deadlines.');
    requireThat(typeof s.team==='string'&&s.team.length<=60&&typeof s.finished==='boolean'&&typeof s.jailed==='boolean','Invalid player or team name.');
    requireThat(s.wagon===null||Object.hasOwn(this.rules.wagons,s.wagon),'Invalid wagon.');
    for(const city of Object.keys(this.rules.cities))for(const key of [...Object.keys(this.rules.goods),'donkey']){
      const q=s.quotes?.[city]?.[key];requireThat(q&&['buy','sell','net'].every(k=>q[k]===null||finite(q[k]))&&finite(q.tax)&&q.tax<=1,'Invalid market quotes.');
    }
    for(const key of Object.keys(this.rules.goods))requireThat(finite(s.source?.[key],EPS),'Invalid reference price.');
    for(const key of ['donkeyStock','fineStock','ironStock','nextFine','tinChange','donkeyPeriod'])requireThat(Number.isInteger(s[key])&&s[key]>=0,'Invalid market stocks or dates.');
    requireThat(Number.isInteger(s.ironPurchases)&&s.ironPurchases>=0&&s.ironPurchases<=this.rules.markets.iron_purchase_limit,'Invalid seasonal iron purchase count.');
    requireThat(s.ironStock<=this.rules.markets.iron_offer_minas,'Invalid iron offer.');
    for(const lot of s.wool)requireThat(finite(lot.cost,EPS)&&finite(lot.qty,EPS)&&typeof lot.sold==='boolean'&&(!lot.sold||finite(lot.proceeds)),'Invalid wool contract.');
    for(const l of s.log)requireThat(Number.isInteger(l.day)&&l.day>=0&&l.day<=s.day&&typeof l.title==='string'&&typeof l.text==='string'&&['info','good','warning','danger'].includes(l.kind),'Invalid journal.');
    for(const l of s.ledger)requireThat(Number.isInteger(l.day)&&finite(Math.abs(l.amount))&&typeof l.category==='string'&&typeof l.text==='string','Invalid ledger.');
    if(s.journey){const j=s.journey;requireThat(Number.isInteger(j.total)&&j.total>0&&Number.isInteger(j.hazardDays)&&j.hazardDays>0&&Number.isInteger(j.elapsed)&&j.elapsed>=0&&j.left+j.elapsed===j.total&&['normal','hard'].includes(j.pace)&&typeof j.escort==='boolean'&&typeof j.inspected==='boolean'&&Number.isInteger(j.inspectionDay)&&j.inspectionDay>=1&&j.inspectionDay<=j.hazardDays&&Number.isInteger(j.lodgeStock)&&j.lodgeStock>=0&&finite(j.lodgePrice)&&finite(j.lodgeSell),'Invalid journey details.');}
    if(s.event){const e=s.event;requireThat(['guide','repair','loss','overload'].includes(e.kind)&&typeof e.title==='string'&&typeof e.text==='string','Invalid event.');
      if(['guide','repair'].includes(e.kind))requireThat(finite(e.fee)&&Number.isInteger(e.delay)&&e.delay>0,'Invalid road decision.');
      if(e.kind==='overload')requireThat(Number.isInteger(e.count)&&e.count>=0&&finite(e.price),'Invalid replacement offer.');}
    if(s.finished)requireThat(s.result&&['bank','purse','cargo','animals','principal','emergency','debt','unrecovered'].every(k=>finite(s.result[k]))&&Number.isFinite(s.result.profit)&&typeof s.result.reason==='string'&&typeof s.result.jailed==='boolean','Invalid final accounts.');
  }
}
