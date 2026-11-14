export const ROLES=['Attacker','Tank','Speedster'];
export const SOLDIERS=Array.from({length:5},(_,i)=>i+1).flatMap(cost=>[
 {id:`s${cost}a`,kind:'soldier',cost,role:'Attacker',a:2*cost+1,d:2*cost-1,s:2*cost},
 {id:`s${cost}t`,kind:'soldier',cost,role:'Tank',a:2*cost,d:2*cost+1,s:2*cost-1},
 {id:`s${cost}s`,kind:'soldier',cost,role:'Speedster',a:2*cost-1,d:2*cost,s:2*cost+1}
]);
export const RARITIES=['Common','Uncommon','Rare','Epic','Legendary'];
export const NAMES={Attacker:['Spike','Talon','Ripper','Havoc','Reaver'],Tank:['Bulwark','Bastion','Citadel','Rampart','Fortress'],Speedster:['Dart','Vector','Cyclone','Zephyr','Tempest']};
for(const s of SOLDIERS){s.name=NAMES[s.role][s.cost-1];s.rarity='Common';}
export const VARIANTS=SOLDIERS.flatMap(s=>RARITIES.slice(1).map((rarity,i)=>({ ...s,id:`${s.id}r${i+1}`,rarity,name:s.name+' '+rarity,ability:['vigor','pierce','guard','surge'][i],power:i+1 })));
export const MODIFIERS=['a','d','s'].flatMap(stat=>Array.from({length:5},(_,i)=>({id:`m${stat}${i+1}`,kind:'modifier',cost:Math.max(1,Math.ceil((i+1)/2)),stat,bonus:i+1,name:`+${i+1} ${ {a:'Attack',d:'Defense',s:'Speed'}[stat]}`})));
export const ATTACHMENTS=[
 ['Plated Shell','d',2,2],['Overclock Drive','s',2,2],['Razor Array','a',2,2],['Titan Plating','d',4,4],['Hyperdrive','s',4,4],['Particle Lance','a',4,4],['Emergency Shield','d',3,3],['Gyro Stabilizer','s',3,3],['Focus Lens','a',3,3],['Micro Armor','d',1,1],['Micro Thrusters','s',1,1],['Micro Blades','a',1,1],['Siege Array','a',5,5],['Aegis Matrix','d',5,5],['Quantum Engine','s',5,5]
].map(([name,stat,bonus,cost],i)=>({id:`x${i}`,kind:'modifier',name,stat,bonus,cost}));
const ACTION_NAMES=[['Repair Pulse','heal',2,1],['Field Medic','heal',4,2],['Reconstruction','heal',7,3],['Energy Bolt','damage',2,1],['Ion Cannon','damage',4,2],['Particle Burst','damage',6,3],['Precision Scan','draw',1,1],['Deep Scan','draw',2,2],['Quantum Scan','draw',3,3],['Power Surge','buffa',2,1],['Battle Protocol','buffa',4,2],['Overcharge','buffa',6,3],['Barrier Pulse','buffd',2,1],['Reinforce','buffd',4,2],['Fortification','buffd',6,3],['Acceleration','buffs',2,1],['Time Dilation','buffs',4,2],['Warp Drive','buffs',6,3],['Disrupt Armor','strip',1,2],['System Purge','strip',2,4],['Recycle Protocol','recycle',1,1],['Memory Recovery','recycle',2,2],['Emergency Reserves','draw',2,3],['Pulse Barrage','damage',5,4]];
export const ACTIONS=ACTION_NAMES.map(([name,effect,power,cost],i)=>({id:`a${i}`,kind:'action',name,effect,power,cost}));
const TRAP_NAMES=[['Counterpulse','counter',2,1],['Reactive Blast','counter',4,2],['Final Retort','counter',6,3],['Auto-Repair','repair',2,1],['Emergency Repair','repair',4,2],['Nano Restoration','repair',6,3],['Intercept Field','shield',2,1],['Barrier Trap','shield',4,2],['Aegis Trap','shield',6,3],['Speed Reversal','speed',2,1],['Phase Reversal','speed',4,2],['Temporal Reversal','speed',6,3]];
export const TRAPS=TRAP_NAMES.map(([name,effect,power,cost],i)=>({id:`t${i}`,kind:'trap',name,effect,power,cost}));
const ENV_NAMES=[['Assault Grid','a',1,1],['Warzone Matrix','a',2,2],['Siege World','a',3,4],['Defensive Grid','d',1,1],['Iron World','d',2,2],['Fortress Field','d',3,4],['Velocity Grid','s',1,1],['Slipstream','s',2,2],['Hyperlane','s',3,4],['Balanced Matrix','all',1,3]];
export const ENVIRONMENTS=ENV_NAMES.map(([name,stat,bonus,cost],i)=>({id:`e${i}`,kind:'environment',name,stat,bonus,cost}));
export const CATALOG=[...SOLDIERS,...VARIANTS,...MODIFIERS,...ATTACHMENTS,...ACTIONS,...TRAPS,...ENVIRONMENTS];
export const byId=Object.fromEntries(CATALOG.map(x=>[x.id,x]));
export const label=c=>c.name||(c.kind==='soldier'?`C${c.cost} ${c.role}`:`+${c.bonus} ${ {a:'Attack',d:'Defense',s:'Speed'}[c.stat]}`);
const clone=x=>structuredClone(x);
export function newGame({size=20,mode='single',opponent='ai'}={}){return {version:1,phase:'draft',mode,size,opponent,turn:0,round:1,log:['Draft your ordered decks. Players alternate placing one card each.'],winner:null,players:[makePlayer('You'),makePlayer(opponent==='ai'?'Computer':'Player 2')]};}
function makePlayer(name){return {name,draft:[],deck:[],flip:[],hand:[],board:[],traps:[],environment:null,dead:[],hero:0,max:0};}
export function stats(unit,game=null,owner=null){let base=byId[unit.id],o={a:base.a,d:base.d,s:base.s};for(let m of unit.mods||[]){let c=byId[m];if(c?.stat)o[c.stat]+=c.bonus;}
 if(base.rarity!=='Common'){let n=RARITIES.indexOf(base.rarity);o[base.role==='Attacker'?'a':base.role==='Tank'?'d':'s']+=n;}
 if(game&&owner!==null){let env=game.players[owner].environment;if(env){let c=byId[env.id];for(let stat of (c.stat==='all'?['a','d','s']:[c.stat]))o[stat]+=c.bonus;}}
 return o;}
export function availableDraft(g,p){return g.phase==='draft'&&g.turn===p&&g.players[p].draft.length<g.size;}
export function draft(g,p,id){if(!availableDraft(g,p))throw Error('Not your draft turn');if(!byId[id])throw Error('Unknown card');let n=clone(g),pl=n.players[p];pl.draft.push(id);n.log.unshift(`${pl.name} placed ${label(byId[id])} at position ${pl.draft.length}.`);if(n.players.every(x=>x.draft.length===n.size)){n.phase='play';n.turn=0;n.round=1;for(let x of n.players){x.deck=x.draft.map((id,i)=>({id,uid:`${i}-${id}`}));x.max=x.deck.filter(c=>byId[c.id].kind==='soldier').length;x.hero=x.max;draw(x,7);}n.log.unshift('Battle begins! Your decks retain their drafted order.');}else n.turn=1-p;return n;}
export function draw(pl,target=7){while(pl.hand.length<target&&(pl.deck.length||pl.flip.length)){if(!pl.deck.length){pl.deck=pl.flip.reverse();pl.flip=[];}pl.hand.push(pl.deck.shift());}}
function getTarget(me,enemy,action,base){if(base.kind==='modifier'||['heal','buffa','buffd','buffs'].includes(base.effect))return me.board.find(x=>x.uid===action.target);
 if(base.effect==='damage')return enemy.board.find(x=>x.uid===action.target);return null;}
function consumeTrap(g,defenderIndex,attackDamage,target){let p=g.players[defenderIndex];if(!p.traps.length)return {damage:attackDamage,note:''};let t=p.traps.shift(),c=byId[t.id],note=` ${p.name}'s ${c.name} triggered!`;
 if(c.effect==='shield')attackDamage=Math.max(0,attackDamage-c.power);
 if(c.effect==='repair'&&target)target.damage=Math.max(0,target.damage-c.power);
 if(c.effect==='counter')return {damage:attackDamage,note,counter:c.power};
 if(c.effect==='speed')attackDamage=Math.max(0,attackDamage-Math.ceil(c.power/2));
 p.flip.push(t);return {damage:attackDamage,note};}
export function apply(g,p,action){if(g.phase!=='play'||g.turn!==p||g.winner!==null)throw Error('Not your turn');let n=clone(g),me=n.players[p],enemy=n.players[1-p],info='';
 if(action.type==='play'){
  let index=me.hand.findIndex(c=>c.uid===action.uid);if(index<0)throw Error('Card not in hand');let card=me.hand[index],base=byId[card.id],payment=action.payment||[];
  if(payment.length!==base.cost||new Set(payment).size!==payment.length||payment.includes(action.uid))throw Error(`Select exactly ${base.cost} other cards to pay`);
  if(payment.some(uid=>!me.hand.some(c=>c.uid===uid)))throw Error('Invalid payment');
  let target=getTarget(me,enemy,action,base);
  if((base.kind==='modifier'||['heal','buffa','buffd','buffs'].includes(base.effect))&&!target)throw Error('Choose a friendly soldier');
  if(base.effect==='damage'&&enemy.board.length&&!target)throw Error('Choose an enemy soldier');
  const paidCards=payment.map(uid=>me.hand.find(c=>c.uid===uid));me.hand=me.hand.filter(c=>c.uid!==action.uid&&!payment.includes(c.uid));me.flip.push(...paidCards);
  if(base.kind==='soldier'){me.board.push({id:card.id,uid:card.uid,damage:0,attacked:false,mods:[]});me.hero=me.max;info=`${me.name} deployed ${label(base)} and restored hero hit counters to ${me.hero}/${me.max}.`;}
  else if(base.kind==='modifier'){target.mods.push(base.id);me.flip.push(card);info=`${me.name} attached ${label(base)}.`;}
  else if(base.kind==='trap'){me.traps.push(card);info=`${me.name} prepared a face-down trap.`;}
  else if(base.kind==='environment'){if(me.environment)me.flip.push(me.environment);me.environment=card;info=`${me.name} activated ${label(base)}.`;}
  else if(base.kind==='action'){
   info=`${me.name} used ${label(base)}.`;
   if(base.effect==='heal')target.damage=Math.max(0,target.damage-base.power);
   if(base.effect.startsWith('buff')){let stat=base.effect.at(-1);target.mods.push(`m${stat}${Math.min(5,base.power)}`);}
   if(base.effect==='damage'){if(target){target.damage+=base.power;if(target.damage>=stats(target,n,1-p).d)kill(n,1-p,target);}else {enemy.hero=Math.max(0,enemy.hero-base.power);if(enemy.hero===0)n.winner=p;}}
   if(base.effect==='draw')draw(me,Math.min(12,me.hand.length+base.power));
   if(base.effect==='strip'){let count=base.power;for(let u of enemy.board){while(u.mods.length&&count-->0)u.mods.pop();if(count<=0)break;}}
   if(base.effect==='recycle'){for(let i=0;i<base.power&&me.flip.length;i++)me.deck.unshift(me.flip.pop());}
   me.flip.push(card);
  }
 }else if(action.type==='attack'){
  let u=me.board.find(x=>x.uid===action.uid);if(!u||u.attacked)throw Error('This soldier cannot attack again this turn');
  if(enemy.board.length){let v=enemy.board.find(x=>x.uid===action.target);if(!v)throw Error('Choose an enemy soldier');info=fight(n,u,v,p);}
  else {let trap=consumeTrap(n,1-p,1,null);let damage=Math.min(1,Math.max(0,trap.damage));enemy.hero=Math.max(0,enemy.hero-damage);info=`${me.name} attacked ${enemy.name}'s hero for ${damage}.${trap.note}`;if(enemy.hero<=0)n.winner=p;}
  u.attacked=true;
 }else if(action.type==='end'){
  n.turn=1-p;if(n.turn===0)n.round++;let next=n.players[n.turn];for(let u of next.board){u.damage=0;u.attacked=false;}draw(next,7);info=`${me.name} ended their turn. ${next.name} restores soldier defense and draws to 7.`;
 }else throw Error('Unknown action');
 n.log.unshift(info);n.log=n.log.slice(0,100);if(n.winner!==null){n.phase='finished';n.log.unshift(`${n.players[n.winner].name} wins!`);}return n;
}
function fight(g,u,v,p){let a=stats(u,g,p),b=stats(v,g,1-p),first=a.s>=b.s,rounds=0,info=`${g.players[p].name}'s ${label(byId[u.id])} attacked ${g.players[1-p].name}'s ${label(byId[v.id])}. `;
 let trap=consumeTrap(g,1-p,a.a,v);info+=trap.note;
 if(trap.counter){u.damage+=trap.counter;if(u.damage>=a.d){kill(g,p,u);return info+'Countertrap destroyed attacker.';}}
 while(rounds++<100){if(first){v.damage+=rounds===1?trap.damage:a.a;if(v.damage>=b.d){kill(g,1-p,v);return info+'Defender destroyed.';}u.damage+=b.a;if(u.damage>=a.d){kill(g,p,u);return info+'Attacker destroyed.';}}
 else {u.damage+=b.a;if(u.damage>=a.d){kill(g,p,u);return info+'Attacker destroyed by faster defender.';}v.damage+=rounds===1?trap.damage:a.a;if(v.damage>=b.d){kill(g,1-p,v);return info+'Defender destroyed.';}}
 if(g.mode==='single')return info+'Both survived the exchange.';
 }throw Error('Combat exceeded safety limit');}
function kill(g,p,u){let pl=g.players[p];pl.board=pl.board.filter(x=>x.uid!==u.uid);pl.dead.push(u.id);pl.max=Math.max(0,pl.max-1);pl.hero=Math.min(pl.hero,pl.max);for(let mid of u.mods)pl.flip.push({id:mid,uid:`recovered-${g.round}-${pl.flip.length}-${mid}`});if(pl.hero<=0)g.winner=1-p;}
export function aiDraftId(g,player=1){let p=g.players[player],slot=p.draft.length,soldiers=p.draft.filter(id=>byId[id].kind==='soldier').length,target=Math.ceil(g.size*.48);if(soldiers<target&&(slot%3!==2||g.size-slot<=target-soldiers)){let cost=1+(Math.floor(slot/4)%5),role=ROLES[(slot+Math.floor(slot/3))%3],rarity=(slot%7===0)?2:(slot%4===0)?1:0;let c=SOLDIERS.find(c=>c.cost===cost&&c.role===role);return rarity?`${c.id}r${rarity}`:c.id;}
 let pool=[...MODIFIERS,...ATTACHMENTS,...ACTIONS,...TRAPS,...ENVIRONMENTS];return pool[(slot*17+Math.floor(slot/3))%pool.length].id;}
export function aiAction(g,p=1){let me=g.players[p],enemy=g.players[1-p];for(let u of me.board.filter(u=>!u.attacked)){let targets=enemy.board.map(v=>({v,win:predictKill(u,v,g.mode,g,p)}));targets.sort((a,b)=>Number(b.win)-Number(a.win)||byId[b.v.id].cost-byId[a.v.id].cost);return {type:'attack',uid:u.uid,target:targets[0]?.v.uid||null};}
 let plays=me.hand.filter(c=>byId[c.id].cost<=me.hand.length-1);plays.sort((a,b)=>{let x=byId[a.id],y=byId[b.id];return (x.kind==='soldier'?100:0)+x.cost-(y.kind==='soldier'?100:0)-y.cost;});
 for(let card of plays){let c=byId[card.id];if((c.kind==='modifier'||['heal','buffa','buffd','buffs'].includes(c.effect))&&!me.board.length)continue;if(c.kind==='trap'&&me.traps.length>=2)continue;
 let others=me.hand.filter(x=>x.uid!==card.uid);others.sort((a,b)=>{let x=byId[a.id],y=byId[b.id];return (x.kind==='modifier'?0:10)+x.cost-(y.kind==='modifier'?0:10)-y.cost;});
 let target=(c.effect==='damage'&&enemy.board.length)?enemy.board[0].uid:me.board[0]?.uid;
 return {type:'play',uid:card.uid,payment:others.slice(0,c.cost).map(x=>x.uid),target};}
 return {type:'end'};}
function predictKill(u,v,mode,g,p){let a=stats(u,g,p),b=stats(v,g,1-p);if(a.s>=b.s)return a.a>=b.d-v.damage;return b.a<a.d-u.damage&&a.a>=b.d-v.damage;}
export function autoDraft(g){let n=g;let guard=0;while(n.phase==='draft'&&guard++<200){let p=n.turn;let id=p===1?aiDraftId(n):SOLDIERS[(n.players[0].draft.length*3)%15].id;n=draft(n,p,id);}return n;}
export function evaluate(mode='single'){let rows=[];for(let x of SOLDIERS)for(let y of SOLDIERS)for(let init of [true,false])for(let stat of ['a','d','s'])for(let bonus=0;bonus<=5;bonus++){let a={id:x.id,mods:bonus?[`m${stat}${bonus}`]:[],damage:0},b={id:y.id,mods:[],damage:0};let sa=stats(a),sb=stats(b),h1=sa.d,h2=sb.d,first=init?sa.s>=sb.s:sa.s>sb.s,win='draw';for(let z=0;z<100;z++){if(first){h2-=sa.a;if(h2<=0){win='modified';break;}h1-=sb.a;if(h1<=0){win='opponent';break;}}else{h1-=sb.a;if(h1<=0){win='opponent';break;}h2-=sa.a;if(h2<=0){win='modified';break;}}if(mode==='single')break;}rows.push({mode,unit:x.id,enemy:y.id,initiates:init,stat,bonus,result:win});}return rows;}

// Reproducible AI-vs-AI smoke tests, not an equilibrium or strategic solver.
export function simulateBatch({matches=100,size=20,mode='single',seed=1234,maxStepsPerMatch=30000}={}){
 let state=seed>>>0;const random=()=>{state=(1664525*state+1013904223)>>>0;return state/4294967296;};
 let wins=[0,0],draws=0,turns=0,errors=0,heroDamage=0, maxRounds=0, maxSteps=0, stalled=[], roundList=[];
 for(let m=0;m<matches;m++){
  let game=newGame({size,mode,opponent:'ai'});game.phase='play';game.turn=m%2;game.log=[];
  for(let p=0;p<2;p++){let pl=game.players[p],ids=[];let soldierCount=Math.max(5,Math.round(size*(.3+random()*.45)));
   for(let i=0;i<soldierCount;i++)ids.push([...SOLDIERS,...VARIANTS][Math.floor(random()*(SOLDIERS.length+VARIANTS.length))].id);
   while(ids.length<size){let pool=[...MODIFIERS,...ATTACHMENTS,...ACTIONS,...TRAPS,...ENVIRONMENTS];ids.push(pool[Math.floor(random()*pool.length)].id);}
   for(let i=ids.length-1;i>0;i--){let j=Math.floor(random()*(i+1));[ids[i],ids[j]]=[ids[j],ids[i]];}
   pl.draft=ids;pl.deck=ids.map((id,i)=>({id,uid:`${p}-${m}-${i}`}));pl.max=soldierCount;pl.hero=soldierCount;draw(pl,7);
  }
  let steps=0;try{while(game.winner===null&&steps++<maxStepsPerMatch){let p=game.turn;let act=aiAction(game,p);let before=game.players[1-p].hero;game=apply(game,p,act);if(act.type==='attack')heroDamage+=Math.max(0,before-game.players[1-p].hero);}
   if(game.winner===null){draws++;stalled.push({match:m,round:game.round,steps,players:game.players.map(x=>({hero:x.hero,max:x.max,board:x.board.length,hand:x.hand.length,deck:x.deck.length,flip:x.flip.length,dead:x.dead.length,traps:x.traps.length}))});}else wins[game.winner]++;turns+=game.round;maxRounds=Math.max(maxRounds,game.round);maxSteps=Math.max(maxSteps,steps);roundList.push(game.round);
  }catch(e){errors++;draws++;}
 }return {matches,size,mode,wins,draws,errors,averageRounds:Number((turns/matches).toFixed(1)),maxRounds,maxSteps,stalled,roundList,heroDamage};
}
