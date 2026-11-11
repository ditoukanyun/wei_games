const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');
const ts=require('/Applications/Cocos/Creator/3.8.8/CocosCreator.app/Contents/Resources/resources/3d/engine/node_modules/typescript/lib/typescript.js');
function load(name,deps={}){const code=ts.transpileModule(fs.readFileSync(`assets/scripts/${name}.ts`,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2017}}).outputText;const m={exports:{}};new Function('require','module','exports',code)(id=>deps[id],m,m.exports);return m.exports;}
function harness(){const {BrowserFramePacer}=load('BrowserFramePacer');let rate=60,id=0;const queue=new Map(),ticks=[];let current=0;
 const pacer=new BrowserFramePacer(()=>rate,()=>ticks.push(current),fn=>{queue.set(++id,fn);return id},key=>queue.delete(key));
 return{pacer,queue,ticks,setRate:v=>rate=v,step:stamp=>{current=stamp;const [key,fn]=queue.entries().next().value;queue.delete(key);fn(stamp)}};}
test('60Hz browser callbacks with sub-millisecond jitter do not lose game frames',()=>{const h=harness();h.pacer.start();for(let i=1;i<=600;i++)h.step(i*1000/60+(i%2?.3:0));assert.equal(h.ticks.length,600);for(let i=1;i<h.ticks.length;i++)assert.ok(h.ticks[i]-h.ticks[i-1]<20);});
test('120Hz displays remain capped near 60 game ticks without catch-up bursts',()=>{const h=harness();h.pacer.start();for(let i=1;i<=1200;i++)h.step(i*1000/120);assert.ok(Math.abs(h.ticks.length-600)<=1);assert.equal(new Set(h.ticks).size,h.ticks.length);});
test('slow browsers run once per available frame and never replay missed frames',()=>{const h=harness();h.pacer.start();for(let i=1;i<=300;i++)h.step(i*1000/30);assert.equal(h.ticks.length,300);});
test('pause cancels the callback and resume resets the deadline',()=>{const h=harness();h.pacer.start();h.pacer.start();assert.equal(h.queue.size,1);h.step(10);h.pacer.stop();assert.equal(h.queue.size,0);h.pacer.start();h.step(10000);assert.equal(h.ticks.length,2);h.pacer.stop();assert.equal(h.queue.size,0);});
test('changing the public target rate takes effect without a second loop',()=>{const h=harness();h.pacer.start();for(let i=1;i<=600;i++)h.step(i*1000/60);const count=h.ticks.length;h.setRate(30);for(let i=601;i<=1200;i++)h.step(i*1000/60);assert.ok(Math.abs(h.ticks.length-count-300)<=1);assert.equal(h.queue.size,1);});
test('project adapter is guarded and preserves pause/resume through the existing port',()=>{
 const raf=global.requestAnimationFrame,caf=global.cancelAnimationFrame;const queue=new Map();let id=0,ticks=0,stops=0;
 global.requestAnimationFrame=fn=>{queue.set(++id,fn);return id};global.cancelAnimationFrame=key=>queue.delete(key);
 const port={targetFrameRate:60,onTick:()=>ticks++,start(){throw Error('original loop restarted')},stop(){stops++}};
 const cc={VERSION:'3.8.8',sys:{isBrowser:true},game:{_pacer:port}};
 const {installWorkshopFramePacing}=load('WorkshopFramePacing',{'cc':cc,'./BrowserFramePacer':load('BrowserFramePacer')});
 try{assert.equal(installWorkshopFramePacing(),true);assert.equal(stops,1);assert.equal(queue.size,1);assert.equal(installWorkshopFramePacing(),false);assert.equal(queue.size,1);
 port.stop();assert.equal(queue.size,0);port.start();assert.equal(queue.size,1);const [key,fn]=queue.entries().next().value;queue.delete(key);fn(20);assert.equal(ticks,1);port.stop();assert.equal(queue.size,0);
 const unsupported=load('WorkshopFramePacing',{'cc':{...cc,VERSION:'3.9.0'},'./BrowserFramePacer':load('BrowserFramePacer')});assert.equal(unsupported.installWorkshopFramePacing(),false);
 }finally{global.requestAnimationFrame=raf;global.cancelAnimationFrame=caf;}
});
