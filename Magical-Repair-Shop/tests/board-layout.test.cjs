const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');
const ts=require('/Applications/Cocos/Creator/3.8.8/CocosCreator.app/Contents/Resources/resources/3d/engine/node_modules/typescript/lib/typescript.js');
const m={exports:{}};new Function('module','exports',ts.transpileModule(fs.readFileSync('assets/scripts/BoardLayout.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText)(m,m.exports);
const {fitBoard}=m.exports;
test('all rotated-board bounds remain inside the gameplay safe area',()=>{
 const target={x:-285,y:-350,width:570,height:635};
 for(const b of [{x:-320,y:-500,width:640,height:900},{x:-200,y:-350,width:400,height:600},{x:100,y:80,width:150,height:140}]){
  const f=fitBoard(b,target);assert.ok(f.scale<=1);
  assert.ok(b.x*f.scale+f.x>=target.x-1e-8);assert.ok(b.y*f.scale+f.y>=target.y-1e-8);
  assert.ok((b.x+b.width)*f.scale+f.x<=target.x+target.width+1e-8);
  assert.ok((b.y+b.height)*f.scale+f.y<=target.y+target.height+1e-8);
 }
});
test('already-safe authored layers keep their original arrangement',()=>{
 const fit=fitBoard({x:-120,y:-140,width:180,height:200},{x:-285,y:-350,width:570,height:635});
 assert.deepEqual(fit,{scale:1,x:0,y:0});
});
