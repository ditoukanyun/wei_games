const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('assets/script/ctrl/uiMain.ts','utf8');
function setup(overrides={}){
 const gameConfig={IsGameStart:true,jinbi:200,restNum:0,hammerNum:0,changeNum:0,touchState:'',...overrides},messages=[];
 const obj={FactoryItem:{PropsRest(){}},djTishi:{},changePanel:{},CancelProps(){gameConfig.touchState=''}};
 const scope={gameConfig,console:{log(){}},director:{emit:(e,m)=>{if(e==='message')messages.push(m)}},emits:new Proxy({},{get:(_,k)=>k}),perName:{},loadPool:{ins:{getPoolNode(){}}},Vec3:class{},save(){},local:{}};
 for(const method of ['restBtn','hammerBtn','changeBtn'])obj[method]=vm.runInNewContext('(function(){'+source.match(new RegExp('    '+method+'\\(\\) \\{([\\s\\S]*?)\\n    \\}'))[1]+'})',scope);
 return {obj,gameConfig,messages};
}
let t=setup();t.obj.hammerBtn();t.obj.hammerBtn();assert.deepEqual(t.messages,[],'repeat selection must not claim insufficient pearls');assert.equal(t.gameConfig.jinbi,200);assert.equal(t.gameConfig.touchState,'','repeat click cancels selected tool');
t=setup({touchState:'1'});t.obj.changeBtn();assert.equal(t.gameConfig.touchState,'2');assert.deepEqual(t.messages,[]);
t=setup({jinbi:0,changeNum:1});t.obj.changeBtn();assert.equal(t.gameConfig.touchState,'2','owned recolor must use recolor count');
t=setup({jinbi:0,hammerNum:1});t.obj.changeBtn();assert.deepEqual(t.messages,['珍珠不足']);
t=setup({touchState:'2'});t.obj.restBtn();assert.equal(t.gameConfig.jinbi,150);assert.equal(t.gameConfig.touchState,'');
t=setup({jinbi:49});t.obj.hammerBtn();assert.deepEqual(t.messages,['珍珠不足']);
console.log('Tool selection, switching, owned recolor and pearl boundaries pass');
// Exercise the production spending paths, not the displayed price.
for(const [file,method,field] of [['assets/script/perfabs/Item.ts','TouchHammer','hammerNum'],['assets/script/ctrl/changePanel.ts','EventUI','changeNum']]){
 const text=fs.readFileSync(file,'utf8');
 let body=text.match(new RegExp('    '+method+'\\([^)]*\\) \\{([\\s\\S]*?)\\n    \\}'))[1];
 for(const owned of [0,1]){
  const config={jinbi:200,[field]:owned};
  const component={};const sprite={spriteFrame:'fish',m_ID:2,getComponent(){return component}};
  const context={FactoryItem:{HammerProps(){}},Item:sprite,uiItem:[sprite],node:{},UiMainTs:{CancelProps(){}}};
  vm.runInNewContext('(function(index){let item=index;'+body+'})',{gameConfig:config,director:{emit(){}},emits:{},save(){},local:{},Sprite:class{},console}).call(context,0);
  assert.equal(config.jinbi,owned?200:150,method+' charges exactly 50 only without owned tools');
  assert.equal(config[field],0);
 }
}
console.log('Hammer and recolor consume owned items first, otherwise exactly 50 pearls');
