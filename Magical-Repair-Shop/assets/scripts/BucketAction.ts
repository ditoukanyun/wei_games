import { _decorator, Component, Node, tween, UITransform, Vec3 } from 'cc';
import { PinAction } from './PinAction';
import { AudioManger } from './AudioManger';
import { Clips } from './Enums';
import { Tools } from './Tools';
import { Global } from './Global';

const { ccclass, property } = _decorator;

@ccclass('BucketAction')
export class BucketAction extends Component {
    
    @property({type:Node})
    container:Node

    start() {
    }

    

    clear_container(){
        this.container.removeAllChildren();
    }

    public put_pins(pin: PinAction[]) {
        pin.forEach(element => {
            this.put_pin(element);
        });
    }

    public put_pin(pin: PinAction) {
        let target_hole_pos = new Vec3(Tools.random_between(-20,20),Tools.random_between(-30,30),1);
        //
        let world_pos = pin.node.getWorldPosition();
        let target = this.container.getComponent(UITransform).convertToNodeSpaceAR(world_pos);
        this.container.addChild(pin.node);
        pin.node.setPosition(target);

        pin.clear_pin();

        tween(pin.node)
            .to(0.25, { position: target_hole_pos },Global.our_easing)
            .call(() => {
                // AudioManger.instance.playSound(Clips.close_screw);
            })
            .start();
    }

    public get_pin_arr_by_color_id(color_id:number,pin_arr:PinAction[]){
        this.container.children.forEach(element => {
            if (element.getComponent(PinAction)) {
                let pin_action = element.getComponent(PinAction);
                if(pin_action.pin_color&&pin_action.pin_color.id == color_id){
                     pin_arr.push(pin_action);
                }
            }
        });
    }

    public get_pin_arr(pin_arr:PinAction[]){
        this.container.children.forEach(element => {
            if (element.getComponent(PinAction)) {
                let pin_action = element.getComponent(PinAction);
                if(pin_action.pin_color){
                     pin_arr.push(pin_action);
                }
            }
        });
    }
}

