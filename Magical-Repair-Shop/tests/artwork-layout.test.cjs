const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const ts=require('/Applications/Cocos/Creator/3.8.8/CocosCreator.app/Contents/Resources/resources/3d/engine/node_modules/typescript/lib/typescript.js');
const code=ts.transpileModule(fs.readFileSync('assets/scripts/ArtworkLayout.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
const moduleMock={exports:{}};new Function('module','exports',code)(moduleMock,moduleMock.exports);
const {fitArtwork}=moduleMock.exports;
test('round icon remains round inside a legacy rectangular button',()=>{
 const size=fitArtwork(313.5,313.5,99.84,70.716);
 assert.equal(size.width,size.height);assert.equal(size.height,70.716);
});
test('home, workshop and owl art preserve their source proportions',()=>{
 for(const [w,h,bw,bh] of [[887,1774,640,1280],[941,1672,640,1280],[1283,1204,135,225],[1258,1182,300,330]]){
  const size=fitArtwork(w,h,bw,bh);
  assert.ok(Math.abs(size.width/size.height-w/h)<1e-10);
  assert.ok(size.width<=bw+1e-8 && size.height<=bh+1e-8);
 }
});
test('background covers its viewport through cropping, without stretching',()=>{
 const size=fitArtwork(941,1672,640,1280,true);
 assert.ok(size.width>=640 && size.height>=1280);
 assert.ok(Math.abs(size.width/size.height-941/1672)<1e-10);
 assert.equal(size.height,1280);
});
