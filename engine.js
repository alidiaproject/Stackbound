export const ROLES=['Attacker','Tank','Speedster'];
export const SOLDIERS=Array.from({length:5},(_,i)=>i+1).flatMap(cost=>[
 {id:`s${cost}a`,kind:'soldier',cost,role:'Attacker',a:2*cost+1,d:2*cost-1,s:2*cost},
 {id:`s${cost}t`,kind:'soldier',cost,role:'Tank',a:2*cost,d:2*cost+1,s:2*cost-1},
 {id:`s${cost}s`,kind:'soldier',cost,role:'Speedster',a:2*cost-1,d:2*cost,s:2*cost+1}
]);
export const MODIFIERS=['a','d','s'].flatMap(stat=>Array.from({length:5},(_,i)=>({id:`m${stat}${i+1}`,kind:'modifier',cost:Math.max(1,Math.ceil((i+1)/2)),stat,bonus:i+1})));
export const CATALOG=[...SOLDIERS,...MODIFIERS];
export const byId=Object.fromEntries(CATALOG.map(x=>[x.id,x]));
export const label=c=>c.kind==='soldier'?`C${c.cost} ${c.role}`:`+${c.bonus} ${ {a:'Attack',d:'Defense',s:'Speed'}[c.stat]}`;
const clone=x=>structuredClone(x);
export function newGame({size=20,mode='single',opponent='ai'}={}){return {version:1,phase:'draft',mode,size,opponent,turn:0,round:1,log:['Draft your ordered decks. Players alternate placing one card each.'],winner:null,players:[makePlayer('You'),makePlayer(opponent==='ai'?'Computer':'Player 2')]};}
function makePlayer(name){return {name,draft:[],deck:[],flip:[],hand:[],board:[],dead:[],hero:0,max:0};}
export function stats(unit){let base=byId[unit.id],o={a:base.a,d:base.d,s:base.s};for(let m of unit.mods){let c=byId[m];o[c.stat]+=c.bonus;}return o;}
export function availableDraft(g,p){return g.phase==='draft'&&g.turn===p&&g.players[p].draft.length<g.size;}
export function draft(g,p,id){if(!availableDraft(g,p))throw Error('Not your draft turn');if(!byId[id])throw Error('Unknown card');let n=clone(g),pl=n.players[p];pl.draft.push(id);n.log.unshift(`${pl.name} placed ${label(byId[id])} at position ${pl.draft.length}.`);if(n.players.every(x=>x.draft.length===n.size)){n.phase='play';n.turn=0;n.round=1;for(let x of n.players){x.deck=x.draft.map((id,i)=>({id,uid:`${i}-${id}`}));x.max=x.deck.filter(c=>byId[c.id].kind==='soldier').length;x.hero=x.max;draw(x,7);}n.log.unshift('Battle begins! Your decks retain their drafted order.');}else n.turn=1-p;return n;}
export function draw(pl,target=7){while(pl.hand.length<target&&(pl.deck.length||pl.flip.length)){if(!pl.deck.length){pl.deck=pl.flip.reverse();pl.flip=[];}pl.hand.push(pl.deck.shift());}}
export function apply(g,p,action){if(g.phase!=='play'||g.turn!==p||g.winner!==null)throw Error('Not your turn');let n=clone(g),me=n.players[p],enemy=n.players[1-p];let info='';
 if(action.type==='play'){
  let index=me.hand.findIndex(c=>c.uid===action.uid);if(index<0)throw Error('Card not in hand');let card=me.hand[index],base=byId[card.id];let payment=action.payment||[];
  if(payment.length!==base.cost||new Set(payment).size!==payment.length||payment.includes(action.uid))throw Error(`Select exactly ${base.cost} other cards to pay`);
  if(payment.some(uid=>!me.hand.some(c=>c.uid===uid)))throw Error('Invalid payment');
  if(base.kind==='modifier'&&!me.board.some(u=>u.uid===action.target))throw Error('Choose a friendly soldier to attach this to');
  const paidCards=payment.map(uid=>me.hand.find(c=>c.uid===uid));
  me.hand=me.hand.filter(c=>c.uid!==action.uid&&!payment.includes(c.uid));
  // Player controls currency order explicitly; first chosen goes to bottom, last chosen to top when flipped.
  for(let paid of paidCards)me.flip.push(paid);
  if(base.kind==='soldier'){me.board.push({id:card.id,uid:card.uid,damage:0,attacked:false,mods:[]});info=`${me.name} deployed ${label(base)}.`;}
  else {let u=me.board.find(u=>u.uid===action.target);u.mods.push(base.id);me.flip.push(card);info=`${me.name} attached ${label(base)} to ${label(byId[u.id])}.`;}
 }else if(action.type==='attack'){
  let u=me.board.find(x=>x.uid===action.uid);if(!u||u.attacked)throw Error('This soldier cannot attack again this turn');
  if(enemy.board.length){let v=enemy.board.find(x=>x.uid===action.target);if(!v)throw Error('Choose an enemy soldier');info=fight(n,u,v,p);}
  else {let damage=stats(u).a;enemy.hero=Math.max(0,enemy.hero-damage);info=`${me.name} attacked ${enemy.name}'s hero for ${damage}.`;if(enemy.hero<=0)n.winner=p;}
  u.attacked=true;
 }else if(action.type==='end'){
  n.turn=1-p;if(n.turn===0)n.round++;
  let next=n.players[n.turn];next.hero=next.max;for(let u of next.board){u.damage=0;u.attacked=false;}draw(next,7);
  info=`${me.name} ended their turn. ${next.name} recovers and draws to 7.`;
 }else throw Error('Unknown action');
 n.log.unshift(info);n.log=n.log.slice(0,100);if(n.winner!==null){n.phase='finished';n.log.unshift(`${n.players[n.winner].name} wins!`);}return n;
}
function cardFromUid(pl,uid){return pl.hand.find(c=>c.uid===uid);}
function fight(g,u,v,p){let attacker=g.players[p],defender=g.players[1-p],a=stats(u),b=stats(v),first=a.s>=b.s;let rounds=0;let info=`${attacker.name}'s ${label(byId[u.id])} attacked ${defender.name}'s ${label(byId[v.id])}. `;
 while(rounds++<100){if(first){v.damage+=a.a;if(v.damage>=b.d){kill(g,1-p,v);return info+'Defender destroyed before counterattack.';}u.damage+=b.a;if(u.damage>=a.d){kill(g,p,u);return info+'Attacker destroyed by counterattack.';}}
 else{u.damage+=b.a;if(u.damage>=a.d){kill(g,p,u);return info+'Attacker destroyed by faster defender.';}v.damage+=a.a;if(v.damage>=b.d){kill(g,1-p,v);return info+'Defender destroyed.';}}
 if(g.mode==='single')return info+'Both survived the exchange.';
 }throw Error('Combat exceeded safety limit');}
function kill(g,p,u){let pl=g.players[p];pl.board=pl.board.filter(x=>x.uid!==u.uid);pl.dead.push(u.id);pl.max=Math.max(0,pl.max-1);pl.hero=Math.min(pl.hero,pl.max);for(let mid of u.mods)pl.flip.push({id:mid,uid:`recovered-${g.round}-${pl.flip.length}-${mid}`});if(pl.hero<=0)g.winner=1-p;}
export function aiDraftId(g,player=1){let p=g.players[player],soldiers=p.draft.filter(id=>byId[id].kind==='soldier').length;let slot=p.draft.length;let soldierTarget=Math.ceil(g.size*.45);if(soldiers<soldierTarget&&(slot%3!==2||g.size-slot<=soldierTarget-soldiers)){let cost=1+(Math.floor(slot/4)%5),role=ROLES[(slot+Math.floor(slot/3))%3];return SOLDIERS.find(c=>c.cost===cost&&c.role===role).id;}let stat=['a','s','d'][slot%3],bonus=1+(slot%5);return `m${stat}${bonus}`;}
export function aiAction(g,p=1){let me=g.players[p],enemy=g.players[1-p];let ready=me.board.filter(u=>!u.attacked);for(let u of ready){let targets=enemy.board.map(v=>({v,win:predictKill(u,v,g.mode)}));targets.sort((a,b)=>Number(b.win)-Number(a.win)||byId[b.v.id].cost-byId[a.v.id].cost);return {type:'attack',uid:u.uid,target:targets[0]?.v.uid||null};}
 let plays=me.hand.filter(c=>byId[c.id].cost<=me.hand.length-1);plays.sort((a,b)=>{let x=byId[a.id],y=byId[b.id];return (x.kind==='soldier'?100:0)+x.cost-(y.kind==='soldier'?100:0)-y.cost;});
 for(let card of plays){let c=byId[card.id];if(c.kind==='modifier'&&!me.board.length)continue;let others=me.hand.filter(x=>x.uid!==card.uid);others.sort((a,b)=>{let x=byId[a.id],y=byId[b.id];return (x.kind==='modifier'?0:10)+x.cost-(y.kind==='modifier'?0:10)-y.cost;});return {type:'play',uid:card.uid,payment:others.slice(0,c.cost).map(x=>x.uid),target:me.board[0]?.uid};}
 return {type:'end'};}
function predictKill(u,v,mode){let a=stats(u),b=stats(v);if(a.s>=b.s)return a.a>=b.d-v.damage;return b.a<a.d-u.damage&&a.a>=b.d-v.damage;}
export function autoDraft(g){let n=g;let guard=0;while(n.phase==='draft'&&guard++<200){let p=n.turn;let id=p===1?aiDraftId(n):SOLDIERS[(n.players[0].draft.length*3)%15].id;n=draft(n,p,id);}return n;}
export function evaluate(mode='single'){let rows=[];for(let x of SOLDIERS)for(let y of SOLDIERS)for(let init of [true,false])for(let stat of ['a','d','s'])for(let bonus=0;bonus<=5;bonus++){let a={id:x.id,mods:bonus?[`m${stat}${bonus}`]:[],damage:0},b={id:y.id,mods:[],damage:0};let sa=stats(a),sb=stats(b),h1=sa.d,h2=sb.d,first=init?sa.s>=sb.s:sa.s>sb.s,win='draw';for(let z=0;z<100;z++){if(first){h2-=sa.a;if(h2<=0){win='modified';break;}h1-=sb.a;if(h1<=0){win='opponent';break;}}else{h1-=sb.a;if(h1<=0){win='opponent';break;}h2-=sa.a;if(h2<=0){win='modified';break;}}if(mode==='single')break;}rows.push({mode,unit:x.id,enemy:y.id,initiates:init,stat,bonus,result:win});}return rows;}

// Reproducible AI-vs-AI smoke tests, not an equilibrium or strategic solver.
export function simulateBatch({matches=100,size=20,mode='single',seed=1234}={}){
 let state=seed>>>0;const random=()=>{state=(1664525*state+1013904223)>>>0;return state/4294967296;};
 let wins=[0,0],draws=0,turns=0,errors=0,heroDamage=0;
 for(let m=0;m<matches;m++){
  let game=newGame({size,mode,opponent:'ai'});game.phase='play';game.turn=m%2;game.log=[];
  for(let p=0;p<2;p++){let pl=game.players[p],ids=[];let soldierCount=Math.max(5,Math.round(size*(.3+random()*.45)));
   for(let i=0;i<soldierCount;i++)ids.push(SOLDIERS[Math.floor(random()*SOLDIERS.length)].id);
   while(ids.length<size)ids.push(MODIFIERS[Math.floor(random()*MODIFIERS.length)].id);
   for(let i=ids.length-1;i>0;i--){let j=Math.floor(random()*(i+1));[ids[i],ids[j]]=[ids[j],ids[i]];}
   pl.draft=ids;pl.deck=ids.map((id,i)=>({id,uid:`${p}-${m}-${i}`}));pl.max=soldierCount;pl.hero=soldierCount;draw(pl,7);
  }
  let steps=0;try{while(game.winner===null&&game.round<=80&&steps++<2000){let p=game.turn;let act=aiAction(game,p);let before=game.players[1-p].hero;game=apply(game,p,act);if(act.type==='attack')heroDamage+=Math.max(0,before-game.players[1-p].hero);}
   if(game.winner===null)draws++;else wins[game.winner]++;turns+=game.round;
  }catch(e){errors++;draws++;}
 }return {matches,size,mode,wins,draws,errors,averageRounds:Number((turns/matches).toFixed(1)),heroDamage};
}
