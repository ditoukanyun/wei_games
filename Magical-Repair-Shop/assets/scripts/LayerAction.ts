import { _decorator, Component, Node, Rect, tween, UIOpacity, UITransform, Vec2 } from 'cc';
import { PinAction } from './PinAction';
import { ElementAction } from './ElementAction';

import { ColorDate } from './ColorDate';
import { Global } from './Global';
import { DataModel } from './DataModel';
const { ccclass, property } = _decorator;

@ccclass('LayerAction')
export class LayerAction extends Component {
    layer_group_id = 0;
    layer_color: ColorDate = null;
    hide_status:number  = 0;// 0 =default,1=show,2=hide
    start() {
    }

    

    public get_hole_num(): number {
        let hole_num: number = 0;
        this.node.children.forEach(element_node => {
            hole_num += element_node.getComponent(ElementAction).get_hole_num();
        });
        return hole_num;
    }

    public init_layer() {
        this.layer_group_id = DataModel.get_new_group_index();
        this.layer_color = DataModel.get_layer_color();

        for(let i = this.node.children.length-1;i>=0;i--){
            let element_node = this.node.children[i];
            element_node.getComponent(ElementAction).init_element(this.layer_group_id, this.layer_color);
        }
    }
    

    public init_pin(color_pin_arr: ColorDate[]) {
        this.node.children.forEach(element_node => {
            element_node.getComponent(ElementAction).init_pin(this.layer_group_id, color_pin_arr);
        });
    }

    public init_hole() {
        this.node.children.forEach(element_node => {
            element_node.getComponent(ElementAction).init_hole();
        });
    }

    get_pin_color(arr: PinAction[]) {
        this.node.children.forEach(element_node => {
            element_node.getComponent(ElementAction)?.get_pin_color(arr);
        });
    }

    public get_element_num(): number {
        return this.node.children.length;
    }

    layer_status: number = 0;//1 = 
    public set_status(args: number) {  //0 =隐藏，1=显示,2=黑色模式
        switch (args) {
            case 0:
                {
                    this.node.active = false;
                    this.hide_layer();
                }
                break;
            case 1:
                this.node.active = true;
                this.show_layer();
                if (this.layer_status == 0) {
                    this.node.children.forEach(element_node => {
                        element_node.getComponent(ElementAction)?.flash_img();
                    });
                }
                if (this.layer_status == 2) {
                    this.node.children.forEach(element_node => {
                        element_node.getComponent(ElementAction)?.set_layer_bg_or_orgin(false);
                        element_node.getComponent(ElementAction)?.flash_img();
                    });
                }

                break;
            case 2:
                if (this.layer_status != 2) {
                    this.show_layer();
                    this.node.children.forEach(element_node => {
                        element_node.getComponent(ElementAction)?.set_layer_bg_or_orgin(true);
                    });
                    this.scheduleOnce(() => {
                        this.node.active = true;
                        this.node.children.forEach(element_node => {
                            element_node.getComponent(ElementAction)?.flash_img(0.5);
                        });
                    }, 1.6);
                }
                break;
        }
        this.layer_status = args;
    }


    public hide_layer() {
        if(this.hide_status!=2){
            this.hide_status = 2;
            this.node.children.forEach(element_node => {
                element_node.getComponent(ElementAction).hide_element();
                element_node.getComponent(ElementAction).hide_pin();  
            });
        }
       
    }

    public show_layer() {
        if(this.hide_status!=1){
            this.hide_status = 1;
            this.node.children.forEach(element_node => {
                element_node.getComponent(ElementAction).show_element();
            });
        }
    }

}

