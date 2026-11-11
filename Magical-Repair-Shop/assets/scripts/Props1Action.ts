import { _decorator, Component, Label, Node, tween, Vec3 } from 'cc';
import { Clips, DJ, DJ_TYPE } from './Enums';
import { AudioManger } from './AudioManger';
import { Global } from './Global';
import { PropsAction } from './PropsAction';
import { AdManger } from './ad/AdManger';
import { DjManger } from './DjManger';
const { ccclass, property } = _decorator;

@ccclass('Props1Action')
export class Props1Action extends Component {
    @property(Node)
    lock_img:Node ;

    @property({ type: Label })
    conis_label: Label;  

    @property({ type: Node })
    btn_v: Node = null;  

    start() {
        this.conis_label.string = Global.get_need_coins() + "";
    }

    dt:number = 0;
    times:number = 0;
    update(deltaTime: number) {
        if(!this.node.active){
            return;
        }
        if(this.times==0){
            this.times++;
            this.show_tween();
        }else{
            this.dt+=deltaTime;
            if(this.dt>=1.5){
                this.dt = 0;
                this.show_tween();
            }
        }
    }

    private show_tween(){    
        if(this.lock_img){
            this.lock_img.active = true;
            tween(this.lock_img)
            .to(0.25,{scale:new Vec3(1.2,1.2,1)},Global.our_easing)
            .to(0.35,{scale:new Vec3(0.8,0.8,1)},Global.our_easing)
            .to(0.15,{scale:new Vec3(1,1,1)},Global.our_easing)
            .call(()=>{
                this.lock_img.scale = new Vec3(1,1,1);
                this.lock_img.active = false;
            }).delay(0.3)
            .start();
           }
    }


    add_hole_coins(){
        AudioManger.instance.playSound(Clips.btn_1);
        if (Global.layer_empty_action.get_unlock_num() <= 0) {
            Global.tips_action.show("没有空位了");
            return;
        }
        if (Global.cur_coins < Global.get_need_coins()) {
            Global.tips_action.show_for_bs("扳手数量不够");
            return;
        }

        if (!DjManger.use_dj(DJ.Btn_1,DJ_TYPE.Type_coin)) {
            Global.tips_action.show("当前关卡次数已经用完");
            return;
        }
        //消耗
        Global.use_coins(Global.get_need_coins());
        Global.layer_empty_action.unlock_empty_hole();
        Global.coins_action.refrush_coins();

        this.node.parent.getComponent(PropsAction)?.close();
    }

    add_hole_videos(){
        AudioManger.instance.playSound(Clips.btn_1);
        if (Global.layer_empty_action.get_unlock_num() <= 0) {
            Global.tips_action.show("没有空位了");
            return;
        }

        if (!DjManger.use_dj(DJ.Btn_1,DJ_TYPE.Type_video)) {
            Global.tips_action.show("当前关卡次数已经用完");
            return;
        }
        
        AdManger.show_video((data) => {
            if (data == 1) {
                console.log("add_hole_videos 获取奖励成功");
                this.node.parent.getComponent(PropsAction)?.close();
                //解锁
                Global.layer_empty_action.unlock_empty_hole();
            } else {
                Global.tips_action.show("获取奖励失败");
                //退款
                DjManger.return_used_dj(DJ.Btn_1,DJ_TYPE.Type_video);
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

