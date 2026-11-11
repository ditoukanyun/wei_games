const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');
const ts=require('/Applications/Cocos/Creator/3.8.8/CocosCreator.app/Contents/Resources/resources/3d/engine/node_modules/typescript/lib/typescript.js');
class Node{constructor(name){this.name=name;this.layer=7;this.active=true;this.children=[];this.components=[];}addChild(n){n.parent=this;this.children.push(n);}getChildByName(name){return this.children.find(n=>n.name===name);}addComponent(T){const c=new T();c.node=this;this.components.push(c);return c;}getComponent(T){return this.components.find(c=>c instanceof T);}setPosition(x,y){this.position={x,y};}setScale(){}}
class UITransform{setContentSize(w,h){this.width=w;this.height=h;}}
class Label{static HorizontalAlign={CENTER:1};static VerticalAlign={CENTER:1};}
class Sprite{}class Color{constructor(...values){this.values=values;}}
class Graphics{constructor(){this.circles=[];}clear(){this.circles=[];}roundRect(){}fill(){}stroke(){}circle(x,y,r){this.circles.push({x,y,r});}}
const state={sound_switch:true};
function load(name,extra={}){const m={exports:{}};const cc={Node,UITransform,Label,Sprite,Color,Graphics,_decorator:{ccclass:()=>T=>T,property:()=>()=>{}},...extra};const code=ts.transpileModule(fs.readFileSync(`assets/scripts/${name}.ts`,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2017,experimentalDecorators:true}}).outputText;new Function('require','module','exports',code)(id=>id==='cc'?cc:id==='cc/env'?{PREVIEW:false}:id==='./Global'?{Global:state}:extra[id]||{},m,m.exports);return m.exports[name];}
test('sound setting shows off/on text and opposite knob positions without old crossed artwork',()=>{
 const Theme=load('WorkshopTheme'),button=new Node('btn_sound'),legacy=new Node('xxx');button.addChild(legacy);button.addComponent(Sprite);
 assert.equal(typeof Theme.soundControl,'function');Theme.soundControl(button,false);
 assert.equal(legacy.active,false);assert.equal(button.getComponent(Sprite).enabled,false);
 const row=button.getChildByName('WorkshopSoundRow'),status=row.getChildByName('WorkshopSoundStatus').getComponent(Label),track=row.getChildByName('WorkshopSoundSwitch').getComponent(Graphics);
 assert.equal(status.string,'已关闭');assert.equal(track.circles.at(-1).x,-22);
 Theme.soundControl(button,true);assert.equal(status.string,'已开启');assert.equal(track.circles.at(-1).x,22);assert.equal(button.children.filter(n=>n.name==='WorkshopSoundRow').length,1);
});
test('menu toggle refreshes the visible control and keeps legacy mute cross hidden on reopen',()=>{
 const Theme=load('WorkshopTheme');const Menu=load('MenuAction',{'./WorkshopTheme':{WorkshopTheme:Theme},'./BasePage':{BasePage:class{open(){}}},'./AudioManger':{AudioManger:{instance:{playSound(){}}}},'./Enums':{Clips:{btn_1:'click'}}});
 const menu=new Menu();menu.node=new Node('menu');const button=new Node('btn_sound');menu.node.addChild(button);menu.xxx_node=new Node('xxx');state.sound_switch=true;
 menu.on_off_sound();assert.equal(state.sound_switch,false);assert.equal(menu.xxx_node.active,false);
 assert.equal(button.getChildByName('WorkshopSoundRow').getChildByName('WorkshopSoundStatus').getComponent(Label).string,'已关闭');
 menu.open();assert.equal(menu.xxx_node.active,false);menu.on_off_sound();assert.equal(state.sound_switch,true);
});

test('home entry starts fresh at level one, resumes later levels, and resets its copy on return to one',()=>{
 const Theme=load('WorkshopTheme'),button=new Node('start_btn'),text=new Node('Label');button.addChild(text);const label=text.addComponent(Label);label.string='继续维修';
 assert.equal(typeof Theme.homeEntry,'function');Theme.homeEntry(button,1);assert.equal(label.string,'开始维修');
 Theme.homeEntry(button,12);assert.equal(label.string,'继续维修');
 Theme.homeEntry(button,1);assert.equal(label.string,'开始维修');
});
