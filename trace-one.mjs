import {newGame,draw,aiAction,apply,SOLDIERS,VARIANTS,MODIFIERS,ATTACHMENTS,ACTIONS,TRAPS,ENVIRONMENTS,byId} from './engine.js';
for(const mode of ['single','death'])for(const size of [20,30,40]){
 let state=1234>>>0;const random=()=>{state=(1664525*state+1013904223)>>>0;return state/4294967296;};let found=0;
 for(let m=0;m<300;m++){
 let g=newGame({size,mode,opponent:'ai'});g.phase='play';g.turn=m%2;g.log=[];
 for(let p=0;p<2;p++){let pl=g.players[p],ids=[];let soldierCount=Math.max(5,Math.round(size*(.3+random()*.45)));
 for(let i=0;i<soldierCount;i++)ids.push([...SOLDIERS,...VARIANTS][Math.floor(random()*(SOLDIERS.length+VARIANTS.length))].id);
 while(ids.length<size){let pool=[...MODIFIERS,...ATTACHMENTS,...ACTIONS,...TRAPS,...ENVIRONMENTS];ids.push(pool[Math.floor(random()*pool.length)].id);}
 for(let i=ids.length-1;i>0;i--){let j=Math.floor(random()*(i+1));[ids[i],ids[j]]=[ids[j],ids[i]];}
 pl.draft=ids;pl.deck=ids.map((id,i)=>({id,uid:`${p}-${m}-${i}`}));pl.max=soldierCount;pl.hero=soldierCount;draw(pl,7);
 }
 let init=g.players.map(p=>({hero:p.hero,hand:p.hand.map(c=>byId[c.id].name),soldiers:p.max}));let trace=[];let steps=0;
 try{while(g.winner===null&&steps++<500){let p=g.turn;let act=aiAction(g,p);g=apply(g,p,act);trace.push({player:p,action:act.type,card:act.uid&&byId[g.players[p].draft.find(id=>act.uid.endsWith(id))]?.name,log:g.log[0],hero:g.players.map(x=>x.hero),round:g.round});}}catch(e){trace.push({error:e.message})}
 if(g.round===1&&g.winner!==null){console.log(JSON.stringify({mode,size,match:m,startingPlayer:m%2,winner:g.winner,init,steps,trace}));if(++found>=2)break;}
 }
}
