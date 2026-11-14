import assert from 'node:assert/strict';
import {CATALOG,newGame,apply,byId,stats} from './engine.js';
assert.equal(CATALOG.length,151);
let g=newGame({size:20});g.phase='play';g.turn=0;
for(let p=0;p<2;p++){let x=g.players[p];x.max=5;x.hero=5;x.deck=[];x.hand=[];x.flip=[];x.board=[{id:'s2t',uid:`unit${p}`,damage:1,attacked:false,mods:[]}];}
function setHand(id,cost){g.players[0].hand=[{id,uid:'play'},...Array.from({length:cost},(_,i)=>({id:'s1a',uid:`pay${i}`}))];}
setHand('a0',1);g=apply(g,0,{type:'play',uid:'play',payment:['pay0'],target:'unit0'});assert.equal(g.players[0].board[0].damage,0);
setHand('e0',1);g=apply(g,0,{type:'play',uid:'play',payment:['pay0']});assert.equal(stats(g.players[0].board[0],g,0).a,5);
setHand('t0',1);g=apply(g,0,{type:'play',uid:'play',payment:['pay0']});assert.equal(g.players[0].traps.length,1);
setHand('a3',1);g=apply(g,0,{type:'play',uid:'play',payment:['pay0'],target:'unit1'});assert.equal(g.players[1].board[0].damage,3);
console.log('PASS 151 card definitions; healing, environment, trap, targeted action');
