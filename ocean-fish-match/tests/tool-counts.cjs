const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const s=fs.readFileSync('assets/script/ctrl/daojuNum.ts','utf8');
for(const [method,field] of [['initRest','restNum'],['initHammer','hammerNum'],['initChange','changeNum']]){
 const body=s.match(new RegExp('    '+method+'\\(\\) \\{([\\s\\S]*?)\\n    \\}'))[1];
 for(const count of [0,1,3]){
  const obj={goumai:{},numNode:{},num:{}};vm.runInNewContext('(function(){'+body+'})',{gameConfig:{[field]:count}}).call(obj);
  assert.equal(obj.goumai.active,count===0);assert.equal(obj.numNode.active,count>0);if(count)assert.equal(obj.num.string,'×'+count);
 }
}
console.log('All three tools distinguish owned quantity from pearl purchase price');
