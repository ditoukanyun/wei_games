const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');
const ts=require('/Applications/Cocos/Creator/3.8.8/CocosCreator.app/Contents/Resources/resources/3d/engine/node_modules/typescript/lib/typescript.js');
function source(name,deps){const m={exports:{}};const code=ts.transpileModule(fs.readFileSync(`assets/scripts/${name}.ts`,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,experimentalDecorators:true,target:ts.ScriptTarget.ES2017}}).outputText;new Function('require','module','exports',code)(id=>deps[id],m,m.exports);return m.exports;}
const layout=source('ChapterLayout',{});
class UITransform{setContentSize(w,h){this.width=w;this.height=h;}}
class Node{constructor(name){this.name=name;this.children=[];this.components=[];this.position={x:0,y:0,clone(){return {...this}}};}addChild(n){if(n.parent)n.parent.children=n.parent.children.filter(c=>c!==n);n.parent=this;this.children.push(n);}addComponent(T){const c=new T();c.node=this;this.components.push(c);return c;}getComponent(T){return this.components.find(c=>c instanceof T);}setPosition(x,y){this.position=typeof x==='object'?x:{x,y,clone(){return {...this}}};}setScale(x,y,z){this.scale={x,y,z};}destroy(){this.destroyed=true;}}
class LayerAction{}class ElementAction{}class HoleAction{}class Sprite{static SizeMode={CUSTOM:0}}class SpriteFrame{}class RigidBody2D{}class PolygonCollider2D{}class Vec2{constructor(x,y){Object.assign(this,{x,y});}}
function chapter(load){return source('WorkshopChapter',{'cc':{Node,UITransform,Sprite,SpriteFrame,RigidBody2D,PolygonCollider2D,Vec2,Color:{WHITE:'white'},ERigidBody2DType:{Static:'static'},resources:{load}},'./ChapterLayout':layout,'./LayerAction':{LayerAction},'./ElementAction':{ElementAction},'./HoleAction':{HoleAction},'./WorkshopAssets':{WorkshopAssets:{artwork(){},skin(){}}}}).WorkshopChapter;}
test('first chapter builds eight independent plates across three visible tiers; later chapters retain four',async()=>{
 const C=chapter((path,type,cb)=>cb(null,{path}));await C.load(1);
 const layers=C.layers(1);assert.equal(layers.length,3);
 const plates=layers.flatMap(l=>l.node.children);assert.equal(plates.length,8);assert.equal(new Set(plates.map(p=>p.name)).size,8);
 assert.equal(plates.reduce((n,p)=>n+p.children.filter(h=>h.getComponent(HoleAction)).length,0),24);
 assert.ok(plates.every(p=>p.getComponent(RigidBody2D).type==='static'&&p.getComponent(ElementAction).chapterPiece));
 await C.load(20);assert.equal(C.layers(20).flatMap(l=>l.node.children).length,4);
});
test('chapter asset loading deduplicates concurrent requests and retries failed assets',async()=>{
 const requests=[];const C=chapter((path,type,cb)=>requests.push({path,cb}));
 const a=C.load(1),b=C.load(1);assert.equal(requests.length,6);
 const failed=Promise.allSettled([a,b]);requests.forEach((r,i)=>r.cb(i===0?Error('offline'):null,{path:r.path}));
 assert.ok((await failed).every(r=>r.status==='rejected'));
 const before=requests.length;const retry=C.load(1);assert.equal(requests.length-before,1);requests.at(-1).cb(null,{path:requests.at(-1).path});await retry;
 const count=requests.length;await C.load(1);assert.equal(requests.length,count);
 const later=C.load(20);assert.equal(requests.length-count,1);requests.at(-1).cb(null,{path:requests.at(-1).path});await later;
});

test('completion uses all eight chapter parts and clears previous animation owners on replay',()=>{
 const stopped=[];class Graphics{moveTo(){}quadraticCurveTo(){}close(){}fill(){}ellipse(){}stroke(){}}
 class Color{}class Vec3{constructor(x,y,z){Object.assign(this,{x,y,z});}}
 const chain={delay(){return this},to(){return this},start(){return this}};
 const C=source('WorkshopCelebration',{'cc':{_decorator:{ccclass:()=>T=>T},Component:class{},Node,UITransform,Graphics,Color,Vec3,Tween:{stopAllByTarget:n=>stopped.push(n)},tween:()=>chain},'./ChapterLayout':layout,'./WorkshopChapter':{WorkshopChapter:{frame:asset=>({asset})}},'./WorkshopAssets':{WorkshopAssets:{artwork(n,frame){n.asset=frame.asset},skin(){}}}}).WorkshopCelebration;
 const show=new C();show.node=new Node('success');show.play(1);const first=show.node.children.at(-1);
 const descendants=n=>n.children.flatMap(c=>[c,...descendants(c)]);const parts=descendants(first).filter(n=>n.name.startsWith('Repaired_'));assert.equal(parts.length,8);assert.equal(new Set(parts.map(n=>n.name)).size,8);
 assert.ok(parts.some(n=>n.children.some(c=>c.asset==='owl10-crown')));assert.ok(parts.some(n=>n.children.some(c=>c.asset==='owl10-face')));
 show.play(20);assert.equal(first.destroyed,true);assert.ok(stopped.includes(first));
 assert.equal(descendants(show.node.children.at(-1)).filter(n=>n.name.startsWith('Repaired_')).length,4);
});
