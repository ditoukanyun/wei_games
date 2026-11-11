import { _decorator, Color, Component, Graphics, Node, Sprite, Tween, tween, UITransform, Vec3 } from 'cc';
import { WorkshopChapter } from './WorkshopChapter';
import { WorkshopAssets } from './WorkshopAssets';
import { chapterPieces } from './ChapterLayout';
const { ccclass } = _decorator;

@ccclass('WorkshopCelebration')
export class WorkshopCelebration extends Component {
    private hero: Node;
    private stop(node: Node) { Tween.stopAllByTarget(node); node.children.forEach(child => this.stop(child)); }
    onDisable() { if (this.hero) this.stop(this.hero); }
    play(level: number) {
        if (this.hero) { this.stop(this.hero); this.hero.destroy(); }
        this.hero = new Node('RepairedOwl'); this.hero.layer = this.node.layer; this.node.addChild(this.hero);
        this.hero.setPosition(0, 20);
        const displayScale=level === 1 ? 1.05 : 1.15;
        const definitions=chapterPieces(level);
        const parts: { [id: string]: Node } = {};
        const assembled=definitions.map(p => {
            const n=new Node(`Repaired_${p.id}`);n.layer=this.node.layer;this.hero.addChild(n);
            n.setPosition(p.x*displayScale,p.y*displayScale);
            n.addComponent(UITransform).setContentSize(p.width*displayScale,p.height*displayScale);
            const image=new Node('Artwork');image.layer=n.layer;n.addChild(image);
            image.addComponent(UITransform).setContentSize(p.width*displayScale,p.height*displayScale);
            WorkshopAssets.artwork(image,WorkshopChapter.frame(p.asset),p.width*displayScale,p.height*displayScale);
            if(p.flip)image.setScale(-1,1,1);
            parts[p.id]=n;return n;
        });
        // Decorative restored fasteners use the same local hole positions as gameplay.
        definitions.forEach(p => {
            const position=p.holes[0];
            const n=new Node('RestoredFastener');n.layer=this.hero.layer;parts[p.id].addChild(n);
            n.setPosition(position[0]*displayScale,position[1]*displayScale);
            n.addComponent(UITransform).setContentSize(25*displayScale,25*displayScale);WorkshopAssets.skin(n,6);
        });
        // Each wing and its outer feather turn around a shared pivot, keeping their seam joined.
        const wingPivot=(side:string) => {
            const wing=parts[`${side}Wing`],feather=parts[`${side}Feather`];
            const pivot=new Node(`${side}WingPivot`);pivot.layer=this.hero.layer;this.hero.addChild(pivot);
            const x=wing.position.x,y=wing.position.y;pivot.setPosition(x,y);
            pivot.addChild(wing);wing.setPosition(0,0);
            if(feather){const fx=feather.position.x,fy=feather.position.y;pivot.addChild(feather);feather.setPosition(fx-x,fy-y);}
            return pivot;
        };
        const left=wingPivot('left'),right=wingPivot('right'),head=parts.face;
        const shine=new Node('RepairSparkles');shine.layer=this.hero.layer;this.hero.addChild(shine);
        const sparkle=shine.addComponent(Graphics);sparkle.fillColor=new Color(255,237,167);
        [[-230,165,17],[231,120,13],[-240,30,11],[228,-25,15]].forEach(([x,y,r])=>{
            sparkle.moveTo(x,y+r);sparkle.quadraticCurveTo(x+r*0.2,y+r*0.2,x+r,y);
            sparkle.quadraticCurveTo(x+r*0.2,y-r*0.2,x,y-r);
            sparkle.quadraticCurveTo(x-r*0.2,y-r*0.2,x-r,y);
            sparkle.quadraticCurveTo(x-r*0.2,y+r*0.2,x,y+r);sparkle.close();sparkle.fill();
        });
        assembled.forEach((n,index) => {
            const position = n.position.clone(); n.setPosition(position.x,position.y+65);
            tween(n).delay(index*0.08).to(0.28,{position},{easing:'backOut'}).start();
        });
        tween(left).delay(1.0).to(0.24,{angle:-10}).to(0.24,{angle:8}).to(0.24,{angle:0}).start();
        tween(right).delay(1.0).to(0.24,{angle:10}).to(0.24,{angle:-8}).to(0.24,{angle:0}).start();
        // Eyelids are separate UI geometry: animation never deforms the whole face.
        [-1,1].forEach(side => {
            const lid = new Node('Eyelid'); lid.layer=this.node.layer; head.addChild(lid);
            lid.setPosition(side*54*displayScale,-10*displayScale); lid.addComponent(UITransform).setContentSize(66,64);
            const g=lid.addComponent(Graphics); g.fillColor=new Color(248,229,191);
            g.ellipse(0,0,31,29);g.fill();g.strokeColor=new Color(94,58,28);g.lineWidth=3;
            g.moveTo(-23,-3);g.quadraticCurveTo(0,-16,23,-3);g.stroke();
            lid.setScale(displayScale,0,1);
            tween(lid).delay(1.65).to(0.08,{scale:new Vec3(displayScale,displayScale,1)}).delay(0.08).to(0.10,{scale:new Vec3(displayScale,0,1)}).start();
        });
    }
}
