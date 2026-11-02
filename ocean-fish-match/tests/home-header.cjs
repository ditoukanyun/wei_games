const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('assets/script/view/homeView.ts','utf8');
const body=source.match(/    layoutHeader\(\) \{([\s\S]*?)\n    \}/)[1];
for(const [w,h] of [[375,667],[390,844],[360,800],[414,896],[768,1024]]){
 const scale=Math.min(w/720,h/1280),widget={enabled:true};
 const coin={position:{x:-194},getComponent(){return widget},setPosition(x,y){this.y=y}};
 const music={setParent(){},setPosition(x,y){this.y=y}};
 const node={getChildByName:n=>n==='diamond'?coin:music,getChildByPath:()=>music};
 vm.runInNewContext('(function(){'+body+'})',{view:{getCanvasSize:()=>({height:h}),getScaleY:()=>scale},Widget:class{}}).call({node});
 const rowPx=h/2-coin.y*scale;
 assert.ok(Math.abs(rowPx-68*scale)<.01);
 assert.equal(coin.y,music.y);assert.equal(widget.enabled,false);
 console.log(`${w}x${h}: header center ${rowPx.toFixed(1)}px from usable top`);
}
