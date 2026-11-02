const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('assets/script/ctrl/FactoryItem.ts', 'utf8');
const method = source.match(/    IsDeath\(\) \{([\s\S]*?)\n    Move|    IsDeath\(\) \{([\s\S]*?)\n    \/\*\*/);
// Extract the method with balanced braces so the test executes the production logic.
const start = source.indexOf('    IsDeath() {');
let end = source.indexOf('{', start), depth = 1, cursor = end + 1;
while (depth) { if(source[cursor]==='{')depth++; if(source[cursor]==='}')depth--; cursor++; }
const body = source.slice(end + 1,cursor - 1);
function run(score, target, finished=false) {
 const config={score,needScore:target,IsGameStart:true};let wins=0,falls=0;
 const obj={isGameOver:finished,isPutCanDesing:false,IsGameStart:true,_IsTouch:true,
 GetNotDestoryItem(){return [];}, unscheduleAllCallbacks(){},ItemParent:{children:[]},uimainTs:{CancelProps(){},isNext(){wins++;}},GameOverAni(){falls++;}};
 vm.runInNewContext('(function(){'+body+'})', {gameConfig:config,Item:class {}}).call(obj);
 return {obj,wins,falls};
}
assert.equal(run(999,1000).wins,0);
for(const score of [1000,1200]) {
 const r=run(score,1000);assert.equal(r.wins,1);assert.equal(r.falls,0);
 assert.equal(r.obj.IsGameStart,false);assert.equal(r.obj._IsTouch,false);
}
assert.equal(run(1200,1000,true).wins,0);
console.log('Target score boundary, overflow, input lock and duplicate settlement checks passed');
