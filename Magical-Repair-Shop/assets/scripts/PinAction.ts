import { WorkshopEnamel } from './WorkshopEnamel';
import { WorkshopAssets } from './WorkshopAssets';
import { _decorator, BoxCollider2D, CircleCollider2D, Color, Component, director, EventTouch, find, Input, instantiate, Node, PolygonCollider2D, Rect, RigidBody2D, Sprite, tween, UIOpacity, UITransform, Vec2, Vec3 } from 'cc';
import { ElementAction } from './ElementAction';
import { LayerRootAction } from './LayerRootAction';
import { Clips, events } from './Enums';
import { AudioManger } from './AudioManger';
import { LayerCatAction } from './LayerCatAction';
import { ColorDate } from './ColorDate';
import { Global } from './Global';
import { HoleAction } from './HoleAction';
import { Tools } from './Tools';
const { ccclass, property } = _decorator;

@ccclass('PinAction')
export class PinAction extends Component {
    pin_color: ColorDate = null;
    @property({ type: Sprite })
    pin_img: Sprite

    pos_hole: HoleAction = null;


    flying: boolean = false;


    is_hide = false;

    start() {

    }

    

    public is_flying(): boolean {
        return this.flying;
    }

    public set_flyinng(f: boolean) {
        this.flying = f;
    }

    public init_date(group_id: number, pin_color: ColorDate, hole: HoleAction) {
        this.pos_hole = hole;
        this.node.getComponent(RigidBody2D).group = group_id;
        this.node.getComponents(BoxCollider2D).forEach(element => {
            element.group = group_id;
        });
        this.node.getComponents(CircleCollider2D).forEach(element => {
            element.group = group_id;
        });
        this.node.getComponents(PolygonCollider2D).forEach(element => {
            element.group = group_id;
        });
        this.pin_color = pin_color;
        //set color
        this.reset_img();
    }

    play(){
        let t = 0.05;
        // let orgin_x = this.pin_img.node.getPosition().x;
        // let orgin_y = this.pin_img.node.getPosition().y;
        tween(this.pin_img.node)
            .to(t, { position: new Vec3(5, 0,0) },Global.our_easing)
            .to(t, { position: new Vec3(-5, 0,0) },Global.our_easing)
            .to(t, { position: new Vec3(5, 0,0) },Global.our_easing)
            .to(t, { position: new Vec3(-5, 0,0) },Global.our_easing)
            .to(t, { position: new Vec3(5, 0,0) },Global.our_easing)
            .to(t, { position: new Vec3(-5, 0,0) },Global.our_easing)
            .call(() => {
                this.pin_img.node.setPosition(new Vec3(0, 0,0));
            })
            .start();
    }

    touch_start(e: EventTouch) {
        if (Global.is_check_completed) {
            console.log("---    is_check_completed  ---");
            AudioManger.instance.playSound(Clips.warn);
            return;
        }

        let can_touch = true;
        {
            let e_action = this.node.parent.getComponent(ElementAction);
            let arr = Global.polygon_get();
            if(e_action.get_img_polygon()){
                for (let i = 0; i < arr.length; i++) {
                    let p = arr[i];
                    if(e_action.get_img_polygon() == p){
                        // console.log("判断结束，循环到自己了");
                        break;
                    }
                    if(!p.isValid){
                        continue;
                    }
                    // console.log("polygon_arr>", element.isValid, );
                    if(Tools.checkPolygonCoversCircle(this.node.getComponent(CircleCollider2D),p)){
                        // console.log("被覆盖");
                        can_touch = false;
                        break;
                    }
                }
            }
        }
        if(can_touch){
            AudioManger.instance.playSound(Clips.pin_1);
        }else{
            AudioManger.instance.playSound(Clips.warn);
            
            this.play();

            return;
        }




        let parent = this.node.getParent();
        // ret?boolean ,return put result,true=success,false=failure
        if (Global.layer_cat_action.put_pin(this)) {
            // 需要检查，关卡是否结束
            director.emit(events.check_guide, this);
            if (parent && parent.getComponent(ElementAction)) {
                parent.getComponent(ElementAction).change_regidbody_type_to_dynamic();
            }
            return;
        }
        Global.layer_empty_action.put_pin(this);

        if (parent && parent.getComponent(ElementAction)) {
            parent.getComponent(ElementAction).change_regidbody_type_to_dynamic();
        }

        if (Global.layer_empty_action.is_pin_full()) {
            Global.main_action.check_failure();
        }
        director.emit(events.check_guide, this);
    }

    reset_img() {
        if (!this.pin_color) {
            return;
        }
        // let img = this.node.getComponent(Sprite);
        // let img = this.node.getComponent(Sprite);
        // Neutral brass head tinted consistently with the existing match color.
        WorkshopAssets.screw(this.pin_img.node);
        // Preserve readable matching colors with the standard shared sprite material.
        this.pin_img.customMaterial = null;
        this.pin_img.color = new Color(this.pin_color.r, this.pin_color.g, this.pin_color.b, 255);
    }


    public remove_collider() {
        this.node.getComponent(RigidBody2D).enabled = false;
        this.node.getComponent(CircleCollider2D).enabled = false;
        this.node.off(Input.EventType.TOUCH_START);
    }

    public clear_pin() {
        this.node.getComponent(RigidBody2D).enabled = false;
        this.node.getComponent(CircleCollider2D).enabled = false;
        this.node.off(Input.EventType.TOUCH_START);
    }

    public hide_pin() {
        this.is_hide = true;
        this.clear_pin();
    }

    public show_pin() {
        this.is_hide = false;
        this.node.off(Input.EventType.TOUCH_START);
        this.node.on(Input.EventType.TOUCH_START, this.touch_start, this);
        this.node.getComponent(RigidBody2D).enabled = true;
        this.node.getComponent(CircleCollider2D).enabled = true;
    }


}

