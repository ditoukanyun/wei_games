const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('/Applications/Cocos/Creator/3.8.8/CocosCreator.app/Contents/Resources/resources/3d/engine/node_modules/typescript/lib/typescript.js');
function statsClass() {
 const source = fs.readFileSync('assets/scripts/FrameStats.ts','utf8');
 const js = ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2017}}).outputText;
 const module={exports:{}};new Function('module','exports',js)(module,module.exports);return module.exports.FrameStats;
}
test('frame report distinguishes steady 60fps from actual long frames',()=>{
 const Stats=statsClass(), stats=new Stats(120);
 for(let i=0;i<100;i++) stats.add(i<90?16.667:60);
 const report=stats.report();
 assert.equal(report.count,100);assert.equal(report.p95,60);assert.equal(report.longFrames,10);
 assert.ok(report.fps<60);assert.ok(report.p50<17);
});
test('frame samples remain bounded without hiding visible long stalls',()=>{
 const Stats=statsClass(), stats=new Stats(20);
 for(let i=0;i<100;i++) stats.add(20);
 stats.add(9000);stats.add(-1);stats.add(NaN);
 const report=stats.report();assert.equal(report.count,20);assert.equal(report.p95,20);assert.equal(report.max,9000);
});
test('session summary retains startup and interaction stalls after rolling samples expire',()=>{
 const Stats=statsClass(), stats=new Stats(20);
 stats.add(240);for(let i=0;i<100;i++)stats.add(16.667);
 const report=stats.report();
 assert.equal(report.longFrames,0);
 assert.equal(report.session.count,101);
 assert.equal(report.session.longFrames,1);
 assert.equal(report.session.max,240);
 assert.ok(report.session.fps<report.fps);
});
