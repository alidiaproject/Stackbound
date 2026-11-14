import {simulateBatch,CATALOG,SOLDIERS,VARIANTS,MODIFIERS,ATTACHMENTS,ACTIONS,TRAPS,ENVIRONMENTS} from './engine.js';
import fs from 'node:fs';
const results=[];
for(const mode of ['single','death'])for(const size of [20,30,40])for(const seed of [1234,98765]){
 const r=simulateBatch({matches:1000,size,mode,seed});results.push({...r,seed});console.log(JSON.stringify(results.at(-1)));
}
fs.mkdirSync('balance',{recursive:true});fs.writeFileSync('balance/simulation_v02.json',JSON.stringify({catalogCount:CATALOG.length,counts:{base:SOLDIERS.length,rarity:VARIANTS.length,modifiers:MODIFIERS.length,attachments:ATTACHMENTS.length,actions:ACTIONS.length,traps:TRAPS.length,environments:ENVIRONMENTS.length},results},null,2));
