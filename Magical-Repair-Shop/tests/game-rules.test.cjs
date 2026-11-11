const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('/Applications/Cocos/Creator/3.8.8/CocosCreator.app/Contents/Resources/resources/3d/engine/node_modules/typescript/lib/typescript.js');
function load(name, overrides = {}, dependencies = {}) {
  const output = ts.transpileModule(fs.readFileSync(`assets/scripts/${name}.ts`, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, experimentalDecorators: true, target: ts.ScriptTarget.ES2017 }
  }).outputText;
  const result = { exports: {} };
  const identity = () => target => target;
  const cc = { _decorator: { ccclass: identity, property: () => () => undefined }, Component: class {}, ...overrides };
  const requireMock = id => dependencies[id] || (id === 'cc' ? cc : id === './Enums' ? { events: { show_hide_layer: 'layers', check_empty_hole: 'holes', check_guide: 'guide' } } : new Proxy({}, { get: (_, key) => class {} }));
  new Function('require', 'module', 'exports', output)(requireMock, result, result.exports);
  return result.exports[name];
}

const audio = { './AudioManger': { AudioManger: { instance: { playSound() {} } } }, './Enums': { Clips: {}, events: {} } };
class Vec3 { constructor(x=0,y=0,z=0){Object.assign(this,{x,y,z});} clone(){return new Vec3(this.x,this.y,this.z);} }

test('failure return-to-one restarts the first level explicitly',()=>{
 const starts=[];const Type=load('GameOverAction',{}, {'./BasePage':{BasePage:class{}},'./Global':{Global:{main_action:{restart_game:n=>starts.push(n)}}},'./ad/AdManger':{AdManger:{show_video:cb=>cb(1),show_interstial(){}}},'./LvLStorage':{LvLStorage:{record_cur_lvl(){}}}});
 const page=new Type();page.close=()=>{};page.go_lvl_1();assert.deepEqual(starts,[1]);
});
test('full reserve waits for all collection transitions, then releases input if a slot clears',()=>{
 let full=true,pending=true,failures=0;const state={layer_empty_action:{is_pin_full:()=>full,get_pin_arr:()=>[]},layer_cat_action:{has_pending_moves:()=>pending},game_over_action:{open:()=>failures++}};
 const Type=load('Main',{}, {'./Global':{Global:state}});const main=new Type();main.isValid=true;const queue=[];main.scheduleOnce=fn=>queue.push(fn);
 assert.equal(typeof main.check_failure,'function');main.check_failure();assert.equal(failures,0);assert.equal(state.is_check_completed,true);
 queue.shift()();assert.equal(failures,0);full=false;pending=false;queue.shift()();assert.equal(state.is_check_completed,false);assert.equal(failures,0);
 full=true;main.check_failure();assert.equal(failures,1);
});
test('completion cannot win an empty level or present the same result twice',()=>{
 let wins=0,entries=0;const state={cur_lvl_pin_total:0,cur_lvl_pin_move_num:0,success_action:{open:()=>wins++}};
 const Type=load('Main',{}, {'./Global':{Global:state}});const main=new Type();const cat={into_scence:()=>entries++};
 main.next_lvlcheck_completed(cat);assert.equal(wins,0);state.cur_lvl_pin_total=3;state.cur_lvl_pin_move_num=3;
 main.next_lvlcheck_completed(cat);main.next_lvlcheck_completed(cat);assert.equal(wins,1);assert.equal(state.is_check_completed,true);
});
test('reinitializing a collection box cancels old animations and forgets its old color',()=>{
 const stopped=[];const Type=load('CatAction',{Tween:{stopAllByTarget:n=>stopped.push(n)}},{'./CatColorRules':{CatColorRules:{r_0:()=>[],get_next_cat_color:()=>null}}});
 const box=new Type();box.node={setPosition(){}};box.default_position={x:0,y:0};box.defalut_lock=true;box.cat_color={id:9};box.set_lock_unlock=lock=>box.isLocked=lock;box.clear_pins=()=>{};
 box.init_cat();assert.ok(stopped.includes(box.node));assert.equal(box.cat_color,null);
});
test('collection activity includes a full box before its departure animation starts',()=>{
 const Type=load('LayerCatAction');const layer=new Type();const cat={cat_color:{id:1},isLocked:false,is_flying:false,get_temp_hole_num:()=>0};layer.node={children:[{getComponent:()=>cat}]};
 assert.equal(typeof layer.has_pending_moves,'function');assert.equal(layer.has_pending_moves(),true);cat.get_temp_hole_num=()=>2;assert.equal(layer.has_pending_moves(),false);cat.is_flying=true;assert.equal(layer.has_pending_moves(),true);cat.cat_color=null;assert.equal(layer.has_pending_moves(),false);
});
test('shuffle finishes changing colors before players can remove a screw',()=>{
 const callbacks=[];const chain={to(){return this},delay(){return this},call(fn){callbacks.push(fn);return this},start(){return this}};
 const Type=load('LayerRootAction',{Vec3,tween:()=>chain});const root=new Type();root.node={getPosition:()=>({y:0}),setPosition(){}};
 let paints=0;const pins=[1,2,3].map(id=>({pin_color:{id,r:id,g:0,b:0,clone(){return {...this}}},reset_img(){paints++}}));root.lvl_action={get_pin_color:()=>pins};
 root.random_pin();assert.equal(paints,3);pins[0].pin_color.id=99;callbacks.forEach(fn=>fn());assert.equal(pins[0].pin_color.id,99);
});
test('already unlocked collection boxes cannot charge coins again',()=>{
 let spent=0;const state={cur_coins:100,get_need_coins:()=>30,use_coins:()=>spent++,coins_action:{refrush_coins(){}}};
 const Type=load('Props4Action',{Vec2:Vec3},{...audio,'./Global':{Global:state}});const tool=new Type();tool.cat_action={isLocked:false,set_lock_unlock(){},into_scence(){}};tool.node={parent:{getComponent:()=>({close(){}})}};
 tool.open_box_coins();assert.equal(spent,0);
});

test('a pending failure check from the previous level cannot unlock or fail a new level',()=>{
 let failures=0;const state={layer_empty_action:{is_pin_full:()=>true,get_pin_arr:()=>[]},layer_cat_action:{has_pending_moves:()=>true},game_over_action:{open:()=>failures++}};
 const Type=load('Main',{}, {'./Global':{Global:state}});const main=new Type();main.isValid=true;const queue=[];main.scheduleOnce=fn=>queue.push(fn);
 main.check_failure();main.levelRequest++;state.layer_cat_action.has_pending_moves=()=>false;queue.shift()();
 assert.equal(failures,0);assert.equal(state.is_check_completed,true);
});
test('reserve arrival must finish before declaring a loss',()=>{
 let flying=true,failures=0;const state={layer_empty_action:{is_pin_full:()=>true,get_pin_arr:()=>[{is_flying:()=>flying}]},layer_cat_action:{has_pending_moves:()=>false},game_over_action:{open:()=>failures++}};
 const Type=load('Main',{}, {'./Global':{Global:state}});const main=new Type();main.isValid=true;const queue=[];main.scheduleOnce=fn=>queue.push(fn);
 main.check_failure();assert.equal(failures,0);flying=false;queue.shift()();assert.equal(failures,1);
});
test('exhausted collection boxes disappear instead of remaining at the top edge',async()=>{
 const state={cur_lvl:1};const Type=load('CatAction',{Vec2:Vec3},{'./Global':{Global:state},'./CatColorRules':{CatColorRules:{r_0:()=>[],get_next_cat_color:()=>null}}});
 const box=new Type();box.node={active:true};box.isLocked=false;await box.into_scence();assert.equal(box.node.active,false);
});
