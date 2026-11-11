import { isChapter } from './ChapterLayout';
import { fitBoard } from './BoardLayout';
import { _decorator, BoxCollider2D, CircleCollider2D, Component, EventTouch, Input, instantiate, Node, PolygonCollider2D, Prefab, RigidBody2D, tween, UITransform, Vec2, Vec3 } from 'cc';
import { LayerAction } from './LayerAction';
import { ElementAction } from './ElementAction';
import { HoleAction } from './HoleAction';
import { PinAction } from './PinAction';

import { LevelAction } from './LevelAction';
import { ResourcePool } from './ResourcePool';
import { Tools } from './Tools';
import { ColorDate } from './ColorDate';
import { Global } from './Global';
const { ccclass, property } = _decorator;

@ccclass('LayerRootAction')
export class LayerRootAction extends Component {
    lvl_action:LevelAction
    

    private clear_lvl(){
        // Snapshot once: removeFromParent mutates the live children array.
        for (const lvl_node of this.node.children.slice()) {
            const lvl = lvl_node.getComponent(LevelAction);
            if (lvl) lvl.clear_lvl();
            lvl_node.removeFromParent();
            lvl_node.destroy();
        }
    }

    private fit_level(level: Node) {
        const root = this.node.getComponent(UITransform);
        const canvas = this.node.parent.getComponent(UITransform);
        if (!root || !canvas) return 1;
        let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;
        for(const plate of level.children) {
            if (!plate.getComponent(ElementAction)) continue;
            const image=plate.getChildByName('img')?.getComponent(UITransform);
            if(!image)continue;
            const rect=image.getBoundingBoxToWorld();
            for(const point of [new Vec3(rect.x,rect.y),new Vec3(rect.x+rect.width,rect.y+rect.height)]){
                const p=root.convertToNodeSpaceAR(point);
                minX=Math.min(minX,p.x);minY=Math.min(minY,p.y);maxX=Math.max(maxX,p.x);maxY=Math.max(maxY,p.y);
            }
        }
        if(!isFinite(minX))return 1;
        const lower=root.convertToNodeSpaceAR(canvas.convertToWorldSpaceAR(new Vec3(-285,-350)));
        const upper=root.convertToNodeSpaceAR(canvas.convertToWorldSpaceAR(new Vec3(285,285)));
        const fit=fitBoard({x:minX,y:minY,width:maxX-minX,height:maxY-minY},
            {x:lower.x,y:lower.y,width:upper.x-lower.x,height:upper.y-lower.y});
        level.setPosition(level.position.x*fit.scale+fit.x,level.position.y*fit.scale+fit.y);
        level.setScale(fit.scale,fit.scale,1);
        return fit.scale;
    }

    public init_root(lvl: number) {
        this.clear_lvl();
        //
        let level_x_prebab = ResourcePool.instance.get_prefab("lvl_x");
        let lvl_node = instantiate(level_x_prebab);
        this.lvl_action = lvl_node.getComponent(LevelAction)
        this.lvl_action.init_level(lvl);
        this.node.addChild(lvl_node);
        if (!isChapter(lvl)) for(const layer of lvl_node.children) this.fit_level(layer);
        const scale = 1;
        //
        // let t = 0.3
        this.lvl_action.node.setScale(scale*0.2,scale*0.2,1);
        tween(this.lvl_action.node)
        .to(0.24, { scale: new Vec3(scale*1.05,scale*1.05,1) }, Global.our_easing)
        .to(0.12, { scale: new Vec3(scale,scale,1) }, Global.our_easing)
        .call(()=>{
            lvl_node.setScale(scale,scale,1);
        }).start();
    }

    random_pin() {
        let arr: PinAction[] = [];
        if(this.lvl_action) {
           arr =  this.lvl_action.get_pin_color();
        }

        // Commit the permutation before input can move any of these screws.
        let arr_color: ColorDate[] = [];
        arr.forEach(element => {
            let c = element.pin_color;
            arr_color.push(c.clone());
        });
        arr_color.sort(() => {
            return 0.5 - Math.random();
        });
        if (arr.length == arr_color.length) {
            for (let i = 0; i < arr.length; i++) {
                let pin_color = arr[i].pin_color;
                let c = arr_color[i];
                pin_color.r = c.r;
                pin_color.g = c.g;
                pin_color.b = c.b;
                pin_color.id = c.id;
                arr[i].reset_img();
            }
        }

        let t = 0.05;
        let y = this.node.getPosition().y;
        tween(this.node)
            .to(t, { position: new Vec3(30, y,0) },Global.our_easing)
            .to(t, { position: new Vec3(-30, y,0) },Global.our_easing)
            .to(t, { position: new Vec3(30, y,0) },Global.our_easing)
            .to(t, { position: new Vec3(-30, y,0) },Global.our_easing)
            .to(t, { position: new Vec3(20, y,0) },Global.our_easing)
            .to(t, { position: new Vec3(-20, y,0) }, Global.our_easing)
            .to(t, { position: new Vec3(20, y,0) }, Global.our_easing)
            .to(t, { position: new Vec3(-20, y,0) },Global.our_easing)
            .to(t, { position: new Vec3(10, y,0) },Global.our_easing)
            .to(t, { position: new Vec3(-10, y,0) },Global.our_easing)
            .to(t, { position: new Vec3(2, y,0) },Global.our_easing)
            .to(t, { position: new Vec3(-2, y,0) },Global.our_easing)
            .to(t, { position: new Vec3(0, y,0) },Global.our_easing)
            .delay(0.3)
            .call(() => {
                this.node.setPosition(new Vec3(0, y,0));
            })
            .start();


    }

}

