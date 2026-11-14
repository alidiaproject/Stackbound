import {simulateBatch} from './engine.js';
const results=[];
for(const mode of ['single','death'])for(const size of [20,30,40]){
 const r=simulateBatch({matches:300,size,mode,seed:1234});
 const sorted=r.roundList.toSorted((a,b)=>a-b);
 const result={mode,size,matches:r.matches,wins:r.wins,unresolved:r.draws,errors:r.errors,averageRounds:r.averageRounds,medianRounds:sorted[Math.floor(sorted.length/2)],p95Rounds:sorted[Math.floor(sorted.length*.95)],maxRounds:r.maxRounds,maxSteps:r.maxSteps,stalled:r.stalled};
 results.push(result);console.log(JSON.stringify(result));
}
