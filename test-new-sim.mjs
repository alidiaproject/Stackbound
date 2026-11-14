import {simulateBatch} from './engine.js';
import {writeFileSync} from 'node:fs';
let results=[];
for(const mode of ['single','death'])for(const size of [20,30,40]){
 const r=simulateBatch({matches:30,size,mode,seed:1234,maxStepsPerMatch:400});
 let rounds=r.roundList.filter((_,i)=>!r.stalled.some(x=>x.match===i));
 let o={mode,size,matches:r.matches,wins:r.wins,unresolved:r.draws,errors:r.errors,avgRoundsAll:r.averageRounds,avgCompleted:rounds.length?+(rounds.reduce((a,b)=>a+b,0)/rounds.length).toFixed(2):null,fastestCompleted:rounds.length?Math.min(...rounds):null,longestCompleted:rounds.length?Math.max(...rounds):null,maxSteps:r.maxSteps,stalled:r.stalled};
 results.push(o);console.log(JSON.stringify({...o,stalled:o.stalled.length}));
}
writeFileSync('balance/corrected_hero_simulation.json',JSON.stringify(results,null,2));
