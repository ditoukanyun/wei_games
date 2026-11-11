import { _decorator, Component, Label, Node, tween, Vec2, Vec3 } from 'cc';

import { Global } from './Global';
import { PropsAction } from './PropsAction';
import { Clips, DJ, DJ_TYPE } from './Enums';
import { AudioManger } from './AudioManger';
import { Tools } from './Tools';
import { AdManger } from './ad/AdManger';
import { DjManger } from './DjManger';
const { ccclass, property } = _decorator;

@ccclass('Props3Action')
export class Props3Action extends Component {

    @property([Node])
    pin_img_arr:Node[] = [];

    @property(Node)
    bucket:Node = null;

    pos_pin  = [];

    @property({ type: Label })
    conis_label: Label;  

    @property({ type: Node })
    btn_clear_v: Node = null;  

    start() {
        this.conis_label.string = Global.get_need_coins() + "";
        if(this.pin_img_arr){
            this.pin_img_arr.forEach((ele)=>{
              if(ele){
                this.pos_pin.push({pos:ele.getPosition().clone(),pin:ele});
              }
            });
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
        this.pos_pin.forEach((ele)=>{
            this.play_tween(ele.pos,ele.pin);
          });
    }

    private play_tween(pos:Vec3,pin:Node){
        {
            //set pos default
            pin.setPosition(pos.x,pos.y,pos.z);
        }
        let target_pos = this.bucket.position.clone();
        target_pos.x = target_pos.x+ Tools.random_between(-20,20);
        target_pos.y = target_pos.y+ Tools.random_between(-20,20);
        tween(pin)
            .to(0.75, { position: target_pos },Global.our_easing)
            .call(() => {
            }).delay(0.3)
            .start();
    }


    clear_pins_coins(){
        AudioManger.instance.playSound(Clips.btn_1);
        if (Global.cur_coins < Global.get_need_coins()) {
            Global.tips_action.show_for_bs("扳手数量不够");
            return;
        }
        let pin_arr = Global.layer_empty_action.get_pin_arr();
        if (pin_arr.length == 0) {
            Global.tips_action.show("没有可清理的钉子");
            return;
        }
        if (!DjManger.use_dj(DJ.Btn_3,DJ_TYPE.Type_coin)) {
            Global.tips_action.show("当前关卡次数已经用完");
            return;
        }
        //消耗
        Global.use_coins(Global.get_need_coins());
        Global.bucket_action.put_pins(pin_arr);
        Global.coins_action.refrush_coins();
        this.node.parent.getComponent(PropsAction)?.close();
    }

    clear_pins_videos(){
        AudioManger.instance.playSound(Clips.btn_1);
        let pin_arr = Global.layer_empty_action.get_pin_arr();
        if (pin_arr.length == 0) {
            Global.tips_action.show("没有可清理的钉子");
            return;
        }
        if (!DjManger.use_dj(DJ.Btn_3,DJ_TYPE.Type_video)) {
            Global.tips_action.show("当前关卡次数已经用完");
            return;
        }
        
        AdManger.show_video((data) => {
            if (data == 1) {
                console.log("clear_pins_videos 获取奖励成功");
                this.node.parent.getComponent(PropsAction)?.close();
                //解锁
                Global.bucket_action.put_pins(pin_arr);
            } else {
                Global.tips_action.show("获取奖励失败");
                //退款
                DjManger.return_used_dj(DJ.Btn_3,DJ_TYPE.Type_video);
            } 
        })
    }

    open(){
        this.conis_label.string = Global.get_need_coins() + "";
        if(this.btn_clear_v){
            tween(this.btn_clear_v)
            .by(0.3,{scale:new Vec3(0.1,0.1)},{ easing: 'quadInOut' })
            .by(0.3,{scale:new Vec3(-0.1,-0.1)},{ easing: 'quadInOut' })
            .by(0.3,{scale:new Vec3(0.1,0.1)},{ easing: 'quadInOut' })
            .by(0.3,{scale:new Vec3(-0.1,-0.1)},{ easing: 'quadInOut' })
            .by(0.3,{scale:new Vec3(0.1,0.1)},{ easing: 'quadInOut' })
            .by(0.3,{scale:new Vec3(-0.1,-0.1)},{ easing: 'quadInOut' })
            .call(()=>{
                this.btn_clear_v.setScale(1,1);
            })
            .start();
        }
    }

}

