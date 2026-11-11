import { WorkshopAssets } from './WorkshopAssets';
import { _decorator, Component, Node, Sprite, UIOpacity, UITransform } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('HoleAction')
export class HoleAction extends Component {

    @property({type:Node})
    holering:Node

    start() {
        this.node.children.forEach(child => {
            const sprite = child.getComponent(Sprite);
            if (sprite) sprite.enabled = false;
        });
        const art = new Node('WorkshopHole'); art.layer = this.node.layer; this.node.addChild(art);
        art.addComponent(UITransform).setContentSize(40,40);
        WorkshopAssets.skin(art, 7);
        //自动隐藏外圈
    }

    

    hide_holering(){
        if(this.holering){
            this.holering.active = false;
         }
    }

    hide(){
        if(this.node&&this.node.isValid&&this.node.getComponent(UIOpacity)){
            this.node.getComponent(UIOpacity).opacity = 0;
         }
         if(!this.node){
            // console.log("没这个光圈");
         }
    }
}

