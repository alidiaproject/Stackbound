import {newGame,draw,aiAction,apply,SOLDIERS,VARIANTS,MODIFIERS,ATTACHMENTS,ACTIONS,TRAPS,ENVIRONMENTS} from './engine.js';
import {readFileSync,writeFileSync} from 'node:fs';
const old=JSON.parse(readFileSync('balance/original_v03_simulation.json'));
const pool=[...MODIFIERS,...ATTACHMENTS,...ACTIONS,...TRAPS,...ENVIRONMENTS];
const soldierPool=[...SOLDIERS,...VARIANTS];
const results=[];
for(const batch of old){
 let state=1234>>>0;const random=()=>{state=(1664525*state+1013904223)>>>0;return state/4294967296;};
 const wanted=new Set(batch.stalled.map(x=>x.match));
 for(let m=0;m<30;m++){
  let game=newGame({size:batch.size,mode:batch.mode,opponent:'ai'});game.phase='play';game.turn=m%2;game.log=[];
  for(let p=0;p<2;p++){
   let pl=game.players[p],ids=[];let soldierCount=Math.max(5,Math.round(batch.size*(.3+random()*.45)));
   for(let i=0;i<soldierCount;i++)ids.push(soldierPool[Math.floor(random()*soldierPool.length)].id);
   while(ids.length<batch.size)ids.push(pool[Math.floor(random()*pool.length)].id);
   for(let i=ids.length-1;i>0;i--){let j=Math.floor(random()*(i+1));[ids[i],ids[j]]=[ids[j],ids[i]];}
   pl.draft=ids;pl.deck=ids.map((id,i)=>({id,uid:`${p}-${m}-${i}`}));pl.max=soldierCount;pl.hero=soldierCount;draw(pl,7);
  }
  if(!wanted.has(m))continue;
  let steps=0,first400=null,changes=0,heroHits=0,turns=0,lastProgress=0,previous='',repeat=0,repeatAt=null,reason='';
  let seen=new Map();
  try{
   while(game.winner===null && steps<1500){
    let p=game.turn,act=aiAction(game,p);let before=game.players.map(x=>[x.hero,x.max,x.board.length,x.dead.length]);
    game=apply(game,p,act);steps++;if(act.type==='end')turns++;
    if(before.some((x,i)=>x.some((v,j)=>v!==[game.players[i].hero,game.players[i].max,game.players[i].board.length,game.players[i].dead.length][j]))){changes++;lastProgress=steps;}
    if(steps===400)first400={round:game.round,hero:game.players.map(x=>x.hero)};
    // At start of a turn, compare canonical state including ordered piles and combat state, excluding logs and round.
    if(act.type==='end'){
      let key=JSON.stringify({turn:game.turn,players:game.players.map(pl=>({hero:pl.hero,max:pl.max,hand:pl.hand.map(c=>c.id),deck:pl.deck.map(c=>c.id),flip:pl.flip.map(c=>c.id),board:pl.board.map(u=>[u.id,u.damage,u.attacked,u.mods]),traps:pl.traps.map(c=>c.id),env:pl.environment?.id,dead:pl.dead}))});
      if(seen.has(key)){repeatAt={first:seen.get(key),again:steps};reason='exact repeated turn-start state';break;}seen.set(key,steps);
    }
   }
   if(game.winner!==null)reason='winner';else if(!reason)reason='1500-action diagnostic cap';
  }catch(e){reason='error: '+e.message;}
  results.push({mode:batch.mode,size:batch.size,match:m,reason,winner:game.winner,round:game.round,steps,changes,lastProgress,first400,players:game.players.map(pl=>({hero:pl.hero,max:pl.max,board:pl.board.length,hand:pl.hand.length,deck:pl.deck.length,flip:pl.flip.length,dead:pl.dead.length})),repeatAt});
 }
 console.log(batch.mode,batch.size,'done',results.length);
}
writeFileSync('balance/replayed_unresolved.json',JSON.stringify(results,null,2));
console.log(JSON.stringify({total:results.length,reasons:results.reduce((a,x)=>(a[x.reason]=(a[x.reason]||0)+1,a),{}),maxSteps:Math.max(...results.map(x=>x.steps)),maxRounds:Math.max(...results.map(x=>x.round))}));
