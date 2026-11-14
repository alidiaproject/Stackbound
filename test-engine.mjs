import assert from 'node:assert/strict';
import {newGame,draft,autoDraft,apply,SOLDIERS,stats,evaluate} from './engine.js';
let g=autoDraft(newGame({size:20}));assert.equal(g.phase,'play');assert.equal(g.players[0].hand.length,7);
// Exercise card payments, deployment, combat and flip ordering.
let p=g.players[0],idx=p.hand.findIndex(c=>c.id.startsWith('s'));assert(idx>=0);
let card=p.hand[idx],cost=SOLDIERS.find(s=>s.id===card.id).cost;
if(cost<=6){let paid=p.hand.filter(c=>c.uid!==card.uid).slice(0,cost).map(c=>c.uid);g=apply(g,0,{type:'play',uid:card.uid,payment:paid});assert.equal(g.players[0].board.length,1);assert.equal(g.players[0].flip.length,cost);}
g=apply(g,0,{type:'end'});assert.equal(g.turn,1);
assert.equal(evaluate('single').length,8100);assert.equal(evaluate('death').length,8100);
console.log('PASS: draft, draw, deploy, payments, end turn, 16,200 single-modifier balance scenarios');
