import { _decorator, Color, Component, Label, Node, Sprite, tween, Vec2, Vec3 } from 'cc';

import { Global } from './Global';
import { PropsAction } from './PropsAction';
import { Clips } from './Enums';
import { AudioManger } from './AudioManger';
import { CatAction } from './CatAction';
import { DataModel } from './DataModel';
import { AdManger } from './ad/AdManger';
const { ccclass, property } = _decorator;

@ccclass('Props4Action')
export class Props4Action extends Component {

    @property(Node)
    target:Node = null;

    @property(Sprite)
    cat_img:Sprite = null;

    color_arr = [];

    color_arr_index = 0;

    cat_action:CatAction

    @property({ type: Node })
    btn_v: Node = null;  

    @property({ type: Label })
    conis_label: Label;  

    start() {
        this.conis_label.string = Global.get_need_coins() + "";
        for(let i = 0;i<DataModel.base_color_arr.length;i++){
            this.color_arr.push(DataModel.base_color_arr[i].clone());
        }
    }


    dt:number = 0;
    times:number = 0;
    update(deltaTime: number) {
        if(!this.node.active){
            return;
        }
        if(this.times==0){
            this.times++;
            this.play_tween();
        }else{
            this.dt+=deltaTime;
            if(this.dt>=1){
                this.dt = 0;
                this.play_tween();
            }
        }
    }

    private play_tween(){
        this.color_arr_index++;
        if(this.color_arr_index>=this.color_arr.length){
            this.color_arr_index = 0;
        }
        let c = this.color_arr[this.color_arr_index];
        this.cat_img.color = new Color(c.r,c.g,c.b,255);
    }


    show_box(cat_action:CatAction){
        this.cat_action = cat_action;
    }

    //开启一个盒子
    open_box_coins(){
        if (!this.cat_action || !this.cat_action.isLocked) return;
        AudioManger.instance.playSound(Clips.btn_1);

        if(Global.cur_coins<Global.get_need_coins()){
            Global.tips_action.show_for_bs("扳手数量不够");
            return;
        }

         //消耗
         Global.use_coins(Global.get_need_coins());
         {
            //解开
            this.cat_action.set_lock_unlock(false);
            this.cat_action.into_scence(new Vec2(0,400));
         }
         Global.coins_action.refrush_coins(); 

        this.node.parent.getComponent(PropsAction)?.close();
    }

    open_box_video(){
        AudioManger.instance.playSound(Clips.btn_1);
        if(!this.cat_action || !this.cat_action.isLocked){
            return;
        }
        //检查上锁情况
        // if (!Global.used_cur_level_props_(4)) {
        //     Global.tips_action.show("当前关卡次数已经用完");
        //     return;
        // }
        
        AdManger.show_video((data) => {
            if (data == 1) {
                if (!this.cat_action || !this.cat_action.isLocked) return;
                console.log("open_box_video 获取奖励成功");
                this.node.parent.getComponent(PropsAction)?.close();
                //解锁
                this.cat_action.set_lock_unlock(false);
                this.cat_action.into_scence(new Vec2(0,400));
            } else {
                Global.tips_action.show("获取奖励失败");
                //退款
                // Global.return_used_cur_level_props_(4);
            } 
        })

        
       
    }

    open(){
        this.conis_label.string = Global.get_need_coins() + "";
        if(this.btn_v){
            tween(this.btn_v)
            .by(0.3,{scale:new Vec3(0.1,0.1)},{ easing: 'quadInOut' })
            .by(0.3,{scale:new Vec3(-0.1,-0.1)},{ easing: 'quadInOut' })
            .by(0.3,{scale:new Vec3(0.1,0.1)},{ easing: 'quadInOut' })
            .by(0.3,{scale:new Vec3(-0.1,-0.1)},{ easing: 'quadInOut' })
            .by(0.3,{scale:new Vec3(0.1,0.1)},{ easing: 'quadInOut' })
            .by(0.3,{scale:new Vec3(-0.1,-0.1)},{ easing: 'quadInOut' })
            .call(()=>{
                this.btn_v.setScale(1,1);
                // this.btn_clear_v.active = false;
                console.log("xxxx 3");

            })
            .start();
        }
    }

}

