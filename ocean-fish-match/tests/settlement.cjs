const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
function method(file,name,context){
 const source=fs.readFileSync(file,'utf8');const start=source.indexOf('    '+name+'(');assert.ok(start>=0);
 const open=source.indexOf('{',start);let cursor=open+1,depth=1;
 while(depth){if(source[cursor]==='{')depth++;if(source[cursor]==='}')depth--;cursor++;}
 return vm.runInNewContext('(function(){'+source.slice(open+1,cursor-1)+'})',context);
}
let wins=0,advances=0;
const config={score:1000,needScore:1000,itemNode:{removeAllChildren(){}},nodeRoot:{}};
const context={gameConfig:config,loadPool:{ins:{getPoolNode(){wins++;}}},audioTool:{ins:{playSound(){}}},musicName:{guopguan:'win'},Vec3:class{},adMgr:{showChaPing(){}}};
const next=method('assets/script/ctrl/uiMain.ts','isNext',context);
const reset=method('assets/script/ctrl/uiMain.ts','beginLevel',context);
const ui={settled:false,hiedRemian(){},nextLeve(){advances++;}};
next.call(ui);next.call(ui);assert.equal(wins,1);assert.equal(advances,1);
reset.call(ui);next.call(ui);assert.equal(wins,2);assert.equal(advances,2);
let schedules=0;
const factory={isGameOver:false,scheduleOnce(){schedules++;}};
const end=method('assets/script/ctrl/FactoryItem.ts','GameOverAni',{gameConfig:config,surplusList:[{}]});
end.call(factory,[{}]);end.call(factory,[{}]);assert.equal(schedules,1);assert.equal(factory.IsGameStart,false);
console.log('One settlement and one exhaustion animation per level; reset allows next level');
