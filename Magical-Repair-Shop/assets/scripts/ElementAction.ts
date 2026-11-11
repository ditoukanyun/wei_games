import { WorkshopEnamel } from './WorkshopEnamel';
import { _decorator, BoxCollider2D, CircleCollider2D, Color, Component, director, ERigidBody2DType, instantiate, Material, Node, PolygonCollider2D, Prefab, Rect, RigidBody2D, Sprite, tween, UIOpacity, UIRenderer, UITransform, Vec4, view } from 'cc';
import { HoleAction } from './HoleAction';
import { PinAction } from './PinAction';
import { ResourcePool } from './ResourcePool';
import { ColorDate } from './ColorDate';
import { Global } from './Global';
import { events } from './Enums';
const { ccclass, property } = _decorator;

@ccclass('ElementAction')
export class ElementAction extends Component {
    // cur_color:ColorDate = null;
    chapterPiece = false;
    ele_color: ColorDate

    is_hide = false;

    is_removed:boolean = false;


    copy_img_node:Node = null;

    img_polyon:PolygonCollider2D = null;

    start() {
        
    }

    private checkOffscreen() {
        if (this.is_removed) return;
        if (this.node.getPosition().y >= -view.getVisibleSize().height / 2) return;
        // Stop before notifying the level: revealing layers can re-enter game logic.
        this.is_removed = true;
        this.unschedule(this.checkOffscreen);
        this.node.removeFromParent();
        director.emit(events.show_hide_layer, this.node);
        this.hide_element();
        this.node.destroy();
    }

    onDestroy() {
        this.unschedule(this.checkOffscreen);
    }

    change_regidbody_type_to_dynamic(){
        if (this.chapterPiece && this.node.children.some(child => !!child.getComponent(PinAction))) return;
        const body = this.node.getComponent(RigidBody2D);
        if (body && body.type === ERigidBody2DType.Static) {
            body.type = ERigidBody2DType.Dynamic;
            // Fixed plates cannot leave the screen; only moving plates need polling.
            this.schedule(this.checkOffscreen, 1);
        }
    }

    public get_hole_num(): number {
        let hole_num: number = 0;
        this.node.children.forEach(element => {
            if (element.getComponent(HoleAction)) {
                hole_num++;
            }
        });
        return hole_num;
    }


    public init_element(group_id: number, ele_color: ColorDate) {
        this.ele_color = ele_color;
        this.node.getComponent(RigidBody2D).group = group_id;
        this.node.getComponent(RigidBody2D).type = ERigidBody2DType.Static;
        this.node.getComponents(BoxCollider2D).forEach(element => {
            element.group = group_id;
        });
        this.node.getComponents(CircleCollider2D).forEach(element => {
            element.group = group_id;
        });
        this.node.getComponents(PolygonCollider2D).forEach(element => {
            element.group = group_id;
        });
        //set img color
        this.set_img_color(ele_color,185);
        this.set_img_collider();
    }

    private set_img_collider(){
        this.node.children.forEach(element => {
            if (element.name == "img") {
               this.img_polyon =  element.getComponent(PolygonCollider2D);
               if(this.img_polyon){
                this.img_polyon.enabled = false;
                Global.polygon_push(this.img_polyon);
               }
            }
        });
    }

    public get_img_polygon():PolygonCollider2D{
        return this.img_polyon;
    }

    

    private set_img_color(_color: ColorDate,a:number){
        this.node.children.forEach(element => {
            if (element.name == "img" && _color) {
                let img = element.getComponent(Sprite);
                if (this.chapterPiece) {
                    img.color = _color.id === 0 ? new Color(90,90,90,145) : Color.WHITE;
                } else {
                    img.color = new Color(_color.r, _color.g, _color.b, _color.id === 0 ? 145 : 255);
                    WorkshopEnamel.apply(element);
                }
                //
                // let material: Material = element.getComponent(UIRenderer)!.getSharedMaterial(0)!;
                // material.setProperty("glowColorSize", 0.04904829356293903);
                // material.setProperty("glowColor", new Vec4(1,1,1,1));
                // material.setProperty("glowThreshold", 0.04113169278722911);
                //  console.log("update img....",element.getComponent(UIRenderer).getSharedMaterial(0));
            }
        });
    }

    public init_pin(group_id: number, color_pin_arr: ColorDate[]) {
        //获取 hole
        this.node.children.forEach(element => {
            if (element.getComponent(HoleAction)) {      
                let new_pin = instantiate(ResourcePool.instance.get_prefab("pin"));
                this.node.addChild(new_pin);
                new_pin.setPosition(element.position);
                new_pin.getComponent(PinAction).init_date(group_id, color_pin_arr.shift(),element.getComponent(HoleAction));
            }
        });
    }

    public init_hole() {
        //获取 hole
        this.node.children.forEach(element => {
            if (element.getComponent(HoleAction)) {      
                element.getComponent(HoleAction).hide_holering();
            }
        });
    }

    get_pin_color(arr:PinAction[]){
        this.node.children.forEach(pin_node => {
            // pin_node.getComponent(PinAction)?.get_pin_color(arr);
            let pin_action = pin_node.getComponent(PinAction)
            if(pin_action&&pin_action.pin_color){  
                arr.push(pin_node.getComponent(PinAction));
            }
        });
    }


    public flash_img(t:number = 0.3) {
        this.node.children.forEach(element => {
            if (element.name == "img") {
                if(element.getComponent(UIOpacity)){
                    let t:number=0.3
                    let opc_1 = 100;
                    let opc_2 = 200;
                    element.getComponent(UIOpacity).opacity = 100;
                    tween(element.getComponent(UIOpacity))
                    // .to(t, { opacity: opc_1 },Global.our_easing)
                    // .to(t, { opacity: opc_2 },Global.our_easing)
                    // .to(t, { opacity: opc_1 },Global.our_easing)
                    .to(t, { opacity: opc_2 },Global.our_easing)
                    .to(t, { opacity: opc_1 },Global.our_easing)
                    .to(t, { opacity: opc_2 },Global.our_easing)
                    .to(t, { opacity: opc_1 },Global.our_easing)
                    .to(t, { opacity: 255 },Global.our_easing)
                    .call(()=>{
                        element.getComponent(UIOpacity).opacity = 255;
                    })
                    .start();
                }     
            }
        });
    }

    // this this layer is black color,but don't show pin for shows
    public set_layer_bg_or_orgin(is_bg:boolean){
        if(is_bg){
            this.node.children.forEach(element => {
                //默认都不显示
                element.active = false;
                if (element.name == "img") {
                    element.active = true;
                    //只设置图片颜色
                    this.set_img_color(ColorDate.new_bean(0,0,0,0),180);
                }
            });
        }else{
            this.node.children.forEach(element => {
                //默认都不显示
                element.active = true;
            });
            this.set_img_color(this.ele_color,180);
        }
        
    }


    public hide_element() {
        this.is_hide = true;
        this.node.getComponent(RigidBody2D).enabled = false;
        this.node.getComponents(BoxCollider2D).forEach(element => {
            element.enabled = false;
        });
        this.node.getComponents(CircleCollider2D).forEach(element => {
            element.enabled = false;
        });
        this.node.getComponents(PolygonCollider2D).forEach(element => {
            element.enabled = false;
        });

    }

    public hide_pin(){
        this.node.children.forEach(pin_node => {
            // pin_node.getComponent(PinAction)?.get_pin_color(arr);
            let pin_action = pin_node.getComponent(PinAction)
            if(pin_action){  
                pin_action.hide_pin();
            }
        });
    }
    

    public show_element() {
        this.is_hide = false;
        this.node.getComponent(RigidBody2D).enabled = true;
        this.node.getComponents(BoxCollider2D).forEach(element => {
            element.enabled = true;
        });
        this.node.getComponents(CircleCollider2D).forEach(element => {
            element.enabled = true;
        });
        this.node.getComponents(PolygonCollider2D).forEach(element => {
            element.enabled = true;
        });
        
        //hide pin
        this.node.children.forEach(pin_node => {
            // pin_node.getComponent(PinAction)?.get_pin_color(arr);
            let pin_action = pin_node.getComponent(PinAction)
            if(pin_action){  
                pin_action.show_pin();
            }
        });

        // Enamel surface supplies its own highlight, avoiding a cloned renderer per plate.
        this.node.children.forEach(child => {
            if (child.name.indexOf('_ring') >= 0) {
                const rim = child.getComponent(Sprite);
                if (rim) {
                    rim.color = new Color(193, 151, 87, 255);
                    WorkshopEnamel.apply(child);
                }
            }
        });
       
    }


    private set_copy_node_img(){
        if(!this.copy_img_node){
            this.node.children.forEach(element => {
                if (element.name == "img") {
                    if(!this.copy_img_node){
                        this.copy_img_node =  instantiate(element);
                        this.copy_img_node.name = "copy_img_node";
                        let img = this.copy_img_node.getComponent(Sprite);
                        img.color = new Color(255, 255, 255, 30);
                        this.node.addChild(this.copy_img_node);
                        this.copy_img_node.setSiblingIndex(element.getSiblingIndex()+1);
                    }
                    
                }
            });
            // console.log("show_element.>",this.copy_img_node,this.node.children);
        }
    }


}

