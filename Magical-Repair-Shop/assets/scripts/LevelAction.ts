import { WorkshopChapter } from './WorkshopChapter';
import { isChapter, level10ColorPlan } from './ChapterLayout';
import { _decorator, Component, director, instantiate, Node, Prefab } from 'cc';
import { ElementAction } from './ElementAction';

import { LayerAction } from './LayerAction';
import { Global } from './Global';
import { PinAction } from './PinAction';
import { DataModel } from './DataModel';
import { events } from './Enums';
import { CatColorRules } from './CatColorRules';
import { UnitAction } from './UnitAction';
import { ResourcePool } from './ResourcePool';
const { ccclass, property } = _decorator;

@ccclass('LevelAction')
export class LevelAction extends Component {
    onLoad(): void {
        director.on(events.show_hide_layer, this.hide_layer, this);
    }
    onDestroy(): void {
        director.off(events.show_hide_layer, this.hide_layer, this);
    }

    start() { 
    }

    

    get_lvl(): number {
        let arr = this.node.name.split("_");
        // console.log("split get_lvl>>>>>:", arr);
        return Number(arr[1].trim());
    }

    get_hole_num(): number {
        let hole_num: number = 0;
        this.node.children.forEach(layer_node => {
            let num = layer_node.getComponent(LayerAction).get_hole_num();
            hole_num += num;
        });
        return hole_num;
    }


    private get_lvl_unit_layer_arr(lvl:number):LayerAction[]{
        
        let unit_arr:Prefab[] = ResourcePool.instance.get_prefabs_for_unit();
        unit_arr.sort(() => {
            return 0.5 - Math.random();
        }); 
        let num = 1;
        if(lvl<15){
            num = 4;
        }else if (lvl<20){
            num = 5;
        }
        else if (lvl<25){
            num = 6;
        }else{
            num = 10;
        }

        let unit_pre_arr:Prefab[] = [];
        for(let i =0;i<num;i++){
            if(unit_arr.length>0){
                unit_pre_arr.push(unit_arr.shift())
            }
        }

        let arr:LayerAction[]= [];
        unit_pre_arr.forEach(unit_preb => {
            for(let i = unit_preb.data.children.length-1;i>=0;i--){
                let layer_node =  unit_preb.data.children[i];
                if(layer_node){
                    arr.push(instantiate(layer_node).getComponent(LayerAction));
                }
            }
        });
        return arr;
    }

    private genrate_lvl_base_data(lvl:number):LayerAction[]{
        if (isChapter(lvl)) return WorkshopChapter.layers(lvl);
        let level_prebab = ResourcePool.instance.get_prefab("lvl_" + lvl);
        if (!level_prebab) {
            console.log("没有这个关卡》〉》〉》", lvl);
            return  this.get_lvl_unit_layer_arr(lvl);
        }else{
            let arr:LayerAction[]= [];
            for(let i = level_prebab.data.children.length-1;i>=0;i--){
                // let unit_action = this.node.children[i].getComponent(UnitAction);
                let unit_node = level_prebab.data.children[i];
                for(let j = unit_node.children.length-1;j>=0;j--){
                    let layer_node = unit_node.children[j];
                    if(layer_node){
                        arr.push(instantiate(layer_node).getComponent(LayerAction));
                    }
                }
            }
           return arr;
        }
    }

    public init_level(lvl:number) {
        //每次开始把基础颜色打乱
        DataModel.random_base_color();
        let color_num = 3;
        {
            if(Global.cur_lvl==1){
                color_num = 3;
            }else if(Global.cur_lvl == 2){
                color_num = 5;
            }else if(Global.cur_lvl< 6){
                color_num = 5;
            }else if(Global.cur_lvl< 8){
                color_num = 6;
            }else if(Global.cur_lvl< 10){
                color_num = 8;
            }else{
                color_num = Global.cur_lvl;
            }
            console.log(Global.cur_lvl," >lvl, color_num>",color_num);
        }
        DataModel.generate_lvl_color_arr(lvl === 1 ? 8 : color_num);
        DataModel.reset_lvl_color_index(); 

        //重组 layer
        let layer_arr =  this.genrate_lvl_base_data(lvl);//this.get_all_layer_from_unit();
        //删除原来的unit
        this.node.removeAllChildren();
        {
            layer_arr.forEach(layer_action => {       
                layer_action.init_layer();
            });
        }
        {
            //@Date 6-30 add
            
        }
        {
            //重新把layer 加入到 this
            for(let i = layer_arr.length-1;i>=0;i--){
                let layer_ = layer_arr[i];
                layer_.node.setParent(this.node);
            }
        }
        
        //
        let color_pin_arr = [];
        let color_cat_arr = [];
        let total_hole_num = this.get_hole_num();
        let need_slot_num = total_hole_num / 3;
        for (let i = 0; i < need_slot_num; i++) {
            let base = DataModel.get_lvl_color();
            color_pin_arr.push(base.clone());
            color_pin_arr.push(base.clone());
            color_pin_arr.push(base.clone());
            color_cat_arr.push(base);
        }
        if (lvl === 1) {
            const plan = level10ColorPlan(color_cat_arr);
            color_pin_arr = plan.pins.map(color => color.clone());
            color_cat_arr = plan.targets;
        } else {
        color_pin_arr.sort(() => {
            return 0.5 - Math.random();
        });
        color_cat_arr.sort(() => {
            return 0.5 - Math.random();
        });
        }
        console.log(" current lvl pin num：", color_pin_arr.length);
        console.log(" current lvl solt num：", color_cat_arr.length);
        
        //init pin
        layer_arr.forEach(layer_action => {
            layer_action.init_pin(color_pin_arr);
        });
       
        // hide all layer
        layer_arr.forEach(layer_action => {       
            layer_action.hide_layer();
        });
 
        // init hole
        layer_arr.forEach(layer_action => {
            layer_action.init_hole();
        });
    
        // console.log("need pin  num：",need_slot_num);
        CatColorRules.set_cat_color(color_cat_arr);
        Global.layer_empty_action.init_empty();
        Global.layer_cat_action.init_cat();

        //本关，钉子总数
        Global.init_pin_info(total_hole_num);
        //默认隐藏一些
        this.set_default_layer();
    }
    
    private set_default_layer(){
        //默认都是不显示的
        // let layer_arr = this.get_all_layer_from_unit();
        this.node.children.forEach(layer_node => {
            // layer_action.node.active = false;
            layer_node.getComponent(LayerAction)?.set_status(0);
        });
        this.hide_layer(this.node);
    }

    private get_all_layer_from_this():LayerAction[]{
        let arr:LayerAction[]= [];
        //默认都是不显示的
        for(let i = this.node.children.length-1;i>=0;i--){
            let layer_action = this.node.children[i].getComponent(LayerAction);
            if(layer_action){
                arr.push(layer_action);
            }
        }
        return arr;
    }


    private async hide_layer(n:Node){
        let default_show_layer_num = 4;
        let show_num = 0;
        let layer_arr = this.get_all_layer_from_this();
        for(let i = 0;i<layer_arr.length;i++){
            let layer_action = layer_arr[i];
            if(layer_action.get_element_num()<=0){
                continue;
            }
            show_num++;
            if(show_num<=default_show_layer_num){
                // layer_action.set_layer_bg_or_orgin(false);
                // layer_action.layer_active(true);
                layer_action.set_status(1);
            }else if(show_num==(default_show_layer_num+1)){
                // layer_action.set_layer_bg_or_orgin(true);
                layer_action.set_status(2);
            } else{
                // layer_action.layer_active(false);
                layer_action.set_status(0);
            }
        }
    }

    get_pin_color():PinAction[]{
        let arr: PinAction[] = [];
        for(let i = this.node.children.length-1;i>=0;i--){
            let layer_action = this.node.children[i].getComponent(LayerAction);
            layer_action?.get_pin_color(arr);
        }
        return arr
    }


    clear_lvl(){
        this.node.children.forEach(layer_node => {       
            layer_node.getComponent(LayerAction).hide_layer();
        });
        director.off(events.show_hide_layer, this.hide_layer, this);
    }
}

