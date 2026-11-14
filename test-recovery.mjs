import {newGame,apply,SOLDIERS,draw} from './engine.js';
import assert from 'node:assert/strict';
let g=newGame({size:20,mode:'single',opponent:'ai'});g.phase='play';g.turn=0;g.players[0].max=7;g.players[0].hero=2;g.players[0].hand=[{id:SOLDIERS[0].id,uid:'soldier'},...Array.from({length:6},(_,i)=>({id:SOLDIERS[0].id,uid:`pay${i}`}))];
g=apply(g,0,{type:'play',uid:'soldier',payment:['pay0']});assert.equal(g.players[0].hero,7);
g.players[1].max=5;g.players[1].hero=2;g=apply(g,0,{type:'end'});assert.equal(g.players[1].hero,2);console.log('PASS: soldier deployment instantly heals hero; turn start does not');
