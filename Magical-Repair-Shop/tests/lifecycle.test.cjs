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
test('level cleanup removes only its own event handler', () => {
  const calls = [];
  const Type = load('LevelAction', { director: { off: (...args) => calls.push(args) } });
  const level = new Type(); level.node = { children: [] };
  level.clear_lvl();
  assert.deepEqual(calls, [['layers', level.hide_layer, level]]);
});
test('destroying a level unregisters its layer handler', () => {
  const calls = [];
  const Type = load('LevelAction', { director: { off: (...args) => calls.push(args) } });
  const level = new Type();
  assert.equal(typeof level.onDestroy, 'function');
  level.onDestroy();
  assert.deepEqual(calls, [['layers', level.hide_layer, level]]);
});
test('destroying the collection layer unregisters its handler', () => {
  const calls = [];
  const Type = load('LayerCatAction', { director: { off: (...args) => calls.push(args) } });
  const layer = new Type();
  assert.equal(typeof layer.onDestroy, 'function');
  layer.onDestroy();
  assert.deepEqual(calls, [['holes', layer.check_empty_hole, layer]]);
});
test('atlas frames use their cell dimensions rather than the whole texture', async () => {
  class Rect { constructor(x,y,width,height) { Object.assign(this,{x,y,width,height}); } }
  class Size { constructor(width,height) { Object.assign(this,{width,height}); } }
  class SpriteFrame { constructor() { this.originalSize = new Size(1254,1254); } }
  const Type = load('WorkshopAssets', {
    Rect, Size, SpriteFrame, resources: { load: (_path,_type,callback) => callback(null, { width:1254 }) }
  });
  await Type.load();
  for (const frame of Type.frames) {
    assert.equal(frame.originalSize.width, frame.rect.width);
    assert.equal(frame.originalSize.height, frame.rect.height);
  }
});

test('destroying tutorial guidance releases its global subscription', () => {
 const calls=[];const Type=load('GuideAction',{director:{off:(...args)=>calls.push(args)}});
 const guide=new Type();assert.equal(typeof guide.onDestroy,'function');guide.onDestroy();
 assert.deepEqual(calls,[['guide',guide.check_guide_1,guide]]);
});

test('chapter plates remain held until their final screw has left',()=>{
 const body={type:'static'};const Type=load('ElementAction',{ERigidBody2DType:{Static:'static',Dynamic:'dynamic'}});
 const plate=new Type();plate.schedule=()=>{};plate.chapterPiece=true;plate.node={children:[{getComponent:()=>({})}],getComponent:()=>body};
 plate.change_regidbody_type_to_dynamic();assert.equal(body.type,'static');
 plate.node.children=[];plate.change_regidbody_type_to_dynamic();assert.equal(body.type,'dynamic');
});
test('progress starts empty and handles levels with zero initialized screws',()=>{
 const state={cur_lvl_pin_move_num:0,cur_lvl_pin_total:0};const bar={fillRange:1};
 const Type=load('ProgressAction',{}, {'./Global':{Global:state}});const meter=new Type();
 meter.level_progress={getComponent:()=>bar};meter.node={parent:null};
 meter.update(0.1);assert.equal(bar.fillRange,0);
 state.cur_lvl_pin_total=12;state.cur_lvl_pin_move_num=3;meter.update(0.1);assert.equal(bar.fillRange,0.25);
});

test('tool dialogs expose close and actions immediately without delayed callbacks',()=>{
 const Base=class{open(){}};const Type=load('PropsAction',{}, {'./BasePage':{BasePage:Base},'./Global':{Global:{cur_coins:0}}});
 const dialog=new Type();const panel=()=>({node:{active:false},open(){}});
 dialog.props1_Action=panel();dialog.props2_Action=panel();dialog.props3_Action=panel();dialog.props4_Action=panel();
 dialog.coins_label={string:''};dialog.btn_close={active:false};dialog.btn_continue={active:false};dialog.btns_arr=[{active:false}];
 const delayed=[];dialog.scheduleOnce=fn=>delayed.push(fn);dialog.unscheduleAllCallbacks=()=>{};
 dialog.open(1);assert.equal(dialog.btn_close.active,true);assert.equal(dialog.btn_continue.active,true);assert.equal(dialog.btns_arr[0].active,true);assert.equal(delayed.length,0);
});

 test('continue retries the failed chapter instead of exposing a locked board',async()=>{
 const state={loading_action:{show(){},close(){}},tips_action:{show(){}}};
 const Type=load('Main',{}, {'./Global':{Global:state},'./ChapterLayout':{isChapter:()=>true},'./WorkshopChapter':{WorkshopChapter:{load:async()=>{throw Error('offline')}}}});
 const main=new Type();main.isValid=true;main.menu={open(){}};
 const oldError=console.error;console.error=()=>{};
 try{await main.start_lvl(10);}finally{console.error=oldError;}
 const attempts=[];main.start_lvl=lvl=>attempts.push(lvl);
 assert.equal(main.retry_failed_level(),true);assert.deepEqual(attempts,[10]);
 assert.equal(main.retry_failed_level(),false);
 const Menu=load('MenuAction',{}, {'./BasePage':{BasePage:class{}},'./Global':{Global:{main_action:main}},'./AdManger':{AdManger:{}} ,'./ad/AdManger':{AdManger:{show_interstial(){}}}});
 const menu=new Menu();menu.close=()=>{};let retries=0;main.retry_failed_level=()=>{retries++;return true};menu.btn_continue_game();assert.equal(retries,1);
 });

test('reserve-hole lock art uses a separate renderer node',()=>{
 class Sprite{};class Graphics{roundRect(){}circle(){}fill(){}stroke(){}moveTo(){}lineTo(){}quadraticCurveTo(){}};class Color{};
 class Node{constructor(){this.children=[];this.active=true;this.layer=7;}addChild(n){this.children.push(n);}getComponent(type){return type===Sprite?this.sprite:null;}addComponent(type){if(this.sprite)throw Error('duplicate renderer');return new type();}}
 const Type=load('EmptyHoleAction',{Node,Sprite,Graphics,Color});const hole=new Type();hole.node=new Node();hole.lock=new Node();hole.lock.sprite=new Sprite();hole.node.children.push(hole.lock);const oldLock=new Node();oldLock.sprite=new Sprite();oldLock.sprite.enabled=true;hole.lock.addChild(oldLock);
 hole.onLoad();assert.equal(oldLock.sprite.enabled,false,'legacy lock must not overlap new lock');assert.equal(hole.lock.sprite.enabled,false);assert.equal(hole.lock.children.length,2);assert.equal(hole.lock.children[1].layer,7);assert.equal(hole.defalut_lock,true);
});

test('falling plates start one low-frequency cleanup check and retire it exactly once',()=>{
 const body={type:'static'};const calls=[];let y=0;let callback;
 const Type=load('ElementAction',{ERigidBody2DType:{Static:'static',Dynamic:'dynamic'},view:{getVisibleSize:()=>({height:1280})},director:{emit:()=>{calls.push('reveal');callback();}}});
 const plate=new Type();plate.node={children:[],getComponent:()=>body,getPosition:()=>({y}),removeFromParent:()=>calls.push('detach'),destroy:()=>calls.push('destroy')};
 plate.hide_element=()=>calls.push('hide');plate.schedule=(fn,interval)=>{calls.push(['schedule',interval]);callback=()=>fn.call(plate)};plate.unschedule=()=>calls.push('unschedule');
 plate.change_regidbody_type_to_dynamic();plate.change_regidbody_type_to_dynamic();
 assert.deepEqual(calls,[['schedule',1]]);callback();assert.deepEqual(calls,[['schedule',1]]);
 y=-700;callback();callback();assert.deepEqual(calls,[['schedule',1],'unschedule','detach','reveal','hide','destroy']);
});

test('frame diagnostics distinguish engine CPU work and release their subscriptions',()=>{
 const clock=global.performance;let now=10;const listeners={};const removed=[];
 const Director={EVENT_BEGIN_FRAME:'begin',EVENT_END_FRAME:'end',EVENT_BEFORE_UPDATE:'beforeUpdate',EVENT_AFTER_UPDATE:'afterUpdate',EVENT_BEFORE_DRAW:'beforeDraw',EVENT_AFTER_DRAW:'afterDraw'};
 const statsType=load('FrameStats');const Type=load('FrameDiagnostics',{Director,director:{on:(event,fn,target)=>{listeners[event]=()=>fn.call(target)},off:(event,fn,target)=>removed.push([event,fn,target])}},{'./FrameStats':{FrameStats:statsType}});
 global.performance={now:()=>now};
 try{const meter=new Type();meter.onLoad();assert.equal(Object.keys(listeners).length,6);
 listeners.begin();now=11;listeners.beforeUpdate();now=14;listeners.afterUpdate();now=15;listeners.beforeDraw();now=17;listeners.afterDraw();now=18;listeners.end();
 assert.equal(meter.cpuFrame.report().p95,8);assert.equal(meter.cpuUpdate.report().p95,3);assert.equal(meter.cpuRender.report().p95,2);
 meter.onDestroy();assert.equal(removed.length,6);assert.ok(removed.every(x=>x[2]===meter));
 }finally{global.performance=clock;}
});

test('frame diagnostics sample browser callbacks separately and cancel them on teardown',()=>{
 const raf=global.requestAnimationFrame,caf=global.cancelAnimationFrame;const queued=[];const cancelled=[];
 global.requestAnimationFrame=callback=>{queued.push(callback);return queued.length};global.cancelAnimationFrame=id=>cancelled.push(id);
 const Director={EVENT_BEGIN_FRAME:'begin',EVENT_END_FRAME:'end',EVENT_BEFORE_UPDATE:'beforeUpdate',EVENT_AFTER_UPDATE:'afterUpdate',EVENT_BEFORE_DRAW:'beforeDraw',EVENT_AFTER_DRAW:'afterDraw'};
 const Type=load('FrameDiagnostics',{Director,director:{on(){},off(){}}},{'./FrameStats':{FrameStats:load('FrameStats')}});
 try{const meter=new Type();meter.onLoad();assert.equal(queued.length,1);queued[0](10);queued[1](26.667);queued[2](43.334);
 assert.equal(meter.browserFrames.report().count,2);assert.ok(Math.abs(meter.browserFrames.report().fps-60)<0.01);
 meter.onDestroy();assert.deepEqual(cancelled,[4]);}finally{global.requestAnimationFrame=raf;global.cancelAnimationFrame=caf;}
});

test('preview routing applies only on launch, while restart and return-to-one honor navigation',()=>{
 const previous=global.location;global.location={search:'?previewLevel=10'};const starts=[];
 const state={cur_lvl:1,restart_default:level=>{state.cur_lvl=level}};
 const Type=load('Main',{}, {'./Global':{Global:state},'./LvLStorage':{LvLStorage:{get_cur_lvl:()=>1}},'cc/env':{PREVIEW:true},'./LevelRoute':{LevelRoute:{previewLevel:()=>10}}});
 try{const main=new Type();main.start_lvl=level=>starts.push(level);main.restart_game();state.cur_lvl=11;main.restart_game();main.restart_game(1);assert.deepEqual(starts,[10,11,1]);}finally{global.location=previous;}
});
test('return-to-first-level passes an explicit target instead of reapplying preview URL',()=>{
 const starts=[];const Type=load('MenuAction',{}, {'./BasePage':{BasePage:class{}},'./Global':{Global:{main_action:{restart_game:level=>starts.push(level)}}},'./ad/AdManger':{AdManger:{show_video:callback=>callback(1),show_interstial(){}}},'./LvLStorage':{LvLStorage:{record_cur_lvl(){}}}});
 const menu=new Type();menu.close=()=>{};menu.go_lvl_1();assert.deepEqual(starts,[1]);
});
