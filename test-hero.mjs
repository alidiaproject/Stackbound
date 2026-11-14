import assert from 'node:assert/strict';
import {newGame,apply} from './engine.js';
for(const id of ['s1s','s5a','s5ar4']){
 let g=newGame();g.phase='play';g.turn=0;g.players[0].board=[{id,uid:'u',damage:0,attacked:false,mods:[]}];g.players[1].hero=8;g.players[1].max=8;
 let n=apply(g,0,{type:'attack',uid:'u'});
 assert.equal(n.players[1].hero,7,`${id} must do exactly 1 hero damage`);
}
console.log('PASS: direct attacks from weak, strong and legendary soldiers each deal exactly 1 hero HP');
