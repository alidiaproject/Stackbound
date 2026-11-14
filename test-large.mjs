import {simulateBatch} from './engine.js';
import fs from 'node:fs';
let results=[];
for(const mode of ['single','death'])for(const size of [20,30,40])for(const seed of [1234,98765]){
 const r=simulateBatch({matches:1000,size,mode,seed});
 const sorted=r.roundList.toSorted((a,b)=>a-b);
 const row={mode,size,seed,matches:r.matches,wins:r.wins,unresolved:r.draws,errors:r.errors,averageRounds:r.averageRounds,medianRounds:sorted[500],p95Rounds:sorted[950],maxRounds:r.maxRounds,maxSteps:r.maxSteps,stalled:r.stalled};
 results.push(row);console.log(JSON.stringify(row));
}
fs.writeFileSync('uncapped_report.json',JSON.stringify(results,null,2));
