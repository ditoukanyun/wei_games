const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');
const ts=require('/Applications/Cocos/Creator/3.8.8/CocosCreator.app/Contents/Resources/resources/3d/engine/node_modules/typescript/lib/typescript.js');
const code=ts.transpileModule(fs.readFileSync('assets/scripts/ChapterLayout.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
const m={exports:{}};new Function('module','exports',code)(m,m.exports);const {OWL_PIECES,isChapter,chapterPieces,level10ColorPlan}=m.exports;
function inside(point,poly){let hit=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++) {const a=poly[i],b=poly[j];if(((a[1]>point[1])!==(b[1]>point[1]))&&(point[0]<(b[0]-a[0])*(point[1]-a[1])/(b[1]-a[1])+a[0])) hit=!hit;}return hit;}
test('chapter geometry has complete triples and valid screw positions',()=>{
 assert.equal(OWL_PIECES.length,4);assert.equal(OWL_PIECES.reduce((n,p)=>n+p.holes.length,0),12);
 for(const p of OWL_PIECES){assert.equal(p.holes.length,3);for(const h of p.holes)assert.ok(inside(h,p.contour),`${p.name} screw ${h} outside plate`);}
});
test('every screw can be accessed without being permanently covered by a front plate',()=>{
 for(let i=0;i<OWL_PIECES.length;i++)for(const h of OWL_PIECES[i].holes){
  const p=OWL_PIECES[i],world=[p.x+h[0],p.y+h[1]];
  for(let j=i+1;j<OWL_PIECES.length;j++){const front=OWL_PIECES[j];assert.equal(inside([world[0]-front.x,world[1]-front.y],front.contour),false,`${p.name} is covered by ${front.name}`);}
 }
});
test('chapter cadence does not replace tutorial and normal intermediate stages',()=>{
 assert.equal(isChapter(1),true);assert.equal(isChapter(9),false);assert.equal(isChapter(10),true);assert.equal(isChapter(11),false);assert.equal(isChapter(0),false);
});

// Catches missing level isolation, clipped screw heads and unreachable lower plates.
test('level ten adds real layered plates while later chapters keep the old toy',()=>{
 assert.equal(typeof chapterPieces,'function');
 assert.equal(chapterPieces(1).length,8);assert.equal(chapterPieces(1).reduce((n,p)=>n+p.holes.length,0),24);
 assert.equal(chapterPieces(20),OWL_PIECES);
 const ids=chapterPieces(1).map(p=>p.id);assert.equal(new Set(ids).size,8);
});
test('layered owl has reachable full screw circles and reveals hidden lower fasteners',()=>{
 assert.equal(typeof chapterPieces,'function');
 const pieces=chapterPieces(1),remaining=new Set(pieces);let hidden=0,removed=0;
 function exposed(p,h){const w=[p.x+h[0],p.y+h[1]];return !pieces.some(q=>remaining.has(q)&&pieces.indexOf(q)>pieces.indexOf(p)&&inside([w[0]-q.x,w[1]-q.y],q.contour));}
 for(const p of pieces){assert.equal(p.holes.length,3);for(const h of p.holes){
  for(let a=0;a<Math.PI*2;a+=Math.PI/12)assert.ok(inside([h[0]+16*Math.cos(a),h[1]+16*Math.sin(a)],p.contour),`${p.id}: clipped screw ${h}`);
  if(!exposed(p,h))hidden++;
 }}
 assert.ok(hidden>0,'no actual layered reveal');
 while(remaining.size){const candidates=pieces.filter(p=>remaining.has(p)&&p.holes.every(h=>exposed(p,h)));assert.ok(candidates.length,'no complete dismantling route');for(const p of candidates){remaining.delete(p);removed++;}}
 assert.equal(removed,8);
});

test('level ten target queue can clear every tier without waiting for a hidden color',()=>{
 assert.equal(typeof level10ColorPlan,'function');
 const colors=['a','b','c','d','e','f','g','h'];const plan=level10ColorPlan(colors);
 assert.equal(plan.pins.length,24);assert.equal(plan.targets.length,8);
 for(const c of colors)assert.equal(plan.pins.filter(p=>p===c).length,3);
 // Runtime init order: three outer plates, four middle plates, then the back plate.
 const tiers=[plan.pins.slice(0,9),plan.pins.slice(9,21),plan.pins.slice(21)];
 let queue=plan.targets.slice(),active=queue.splice(0,2),collected={},reserve=[];
 for(const tier of tiers){let available=tier.slice();
  while(available.length){let i=available.findIndex(c=>active.includes(c));assert.notEqual(i,-1,'only hidden targets remain');const c=available.splice(i,1)[0];collected[c]=(collected[c]||0)+1;
   if(collected[c]===3){active=active.filter(x=>x!==c);if(queue.length)active.push(queue.shift());}
  }
 }
 assert.equal(queue.length,0);assert.equal(active.length,0);assert.deepEqual(reserve,[]);
 assert.throws(()=>level10ColorPlan(colors.slice(0,7)),/eight/i);
});
