import { _decorator, Component, Label, Node, tween, Vec3 } from 'cc';
import { AudioManger } from './AudioManger';
import { Clips, DJ, DJ_TYPE } from './Enums';
import { Global } from './Global';
import { PropsAction } from './PropsAction';
import { AdManger } from './ad/AdManger';
import { DjManger } from './DjManger';

const { ccclass, property } = _decorator;

@ccclass('Props2Action')
export class Props2Action extends Component {
    @property([Node])
    pin_img_arr:Node[] = [];

    pos_:Vec3[]  = [];

    @property({ type: Label })
    conis_label: Label;  

    @property({ type: Node })
    btn_refresh_v: Node = null;  

    start() {
        this.conis_label.string = Global.get_need_coins() + "";
        if(this.pin_img_arr){
            this.pin_img_arr.forEach((ele)=>{
              if(ele){
                this.pos_.push(ele.getPosition().clone());
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
         this.pin_img_arr.sort(() => {
            return 0.5 - Math.random();
        });
        for(let i = 0;i<this.pin_img_arr.length;i++){
            this.play_tween(this.pin_img_arr[i],this.pos_[i]);
        }
    }

    private play_tween(pin:Node,pos:Vec3){
        
        tween(pin)
            .to(0.75, { position: pos },Global.our_easing)
            .call(() => {

            }).delay(0.3)
            .start();
    }


    random_pins_coins(){
        AudioManger.instance.playSound(Clips.btn_1);

        if (Global.cur_coins < Global.get_need_coins()) {
            Global.tips_action.show_for_bs("扳手数量不够");
            return;
        }

        if (!DjManger.use_dj(DJ.Btn_2,DJ_TYPE.Type_coin)) {
            Global.tips_action.show("当前关卡次数已经用完");
            return;
        }
        //消耗
        Global.use_coins(Global.get_need_coins());
        Global.layer_root_action.random_pin();
        Global.coins_action.refrush_coins();
       
        this.node.parent.getComponent(PropsAction)?.close();
    }

    random_pins_videos(){
        AudioManger.instance.playSound(Clips.btn_1);

        if (!DjManger.use_dj(DJ.Btn_2,DJ_TYPE.Type_video)) {
            Global.tips_action.show("当前关卡次数已经用完");
            return;
        }

        AdManger.show_video((data) => {
            if (data == 1) {
                console.log("random_pins_videos 获取奖励成功");
                this.node.parent.getComponent(PropsAction)?.close();
                //解锁
                Global.layer_root_action.random_pin();
            } else {
                Global.tips_action.show("获取奖励失败");
                //退款
                DjManger.return_used_dj(DJ.Btn_2,DJ_TYPE.Type_video);
            } 
        })
       
    }

    open(){
        this.conis_label.string = Global.get_need_coins() + "";
        if(this.btn_refresh_v){
            tween(this.btn_refresh_v)
            .by(0.3,{scale:new Vec3(0.1,0.1)},{ easing: 'quadInOut' })
            .by(0.3,{scale:new Vec3(-0.1,-0.1)},{ easing: 'quadInOut' })
            .by(0.3,{scale:new Vec3(0.1,0.1)},{ easing: 'quadInOut' })
            .by(0.3,{scale:new Vec3(-0.1,-0.1)},{ easing: 'quadInOut' })
            .by(0.3,{scale:new Vec3(0.1,0.1)},{ easing: 'quadInOut' })
            .by(0.3,{scale:new Vec3(-0.1,-0.1)},{ easing: 'quadInOut' })
            .call(()=>{
                this.btn_refresh_v.setScale(1,1);
                // this.btn_clear_v.active = false;
                console.log("xxxx 3");

            })
            .start();
        }
    }

}

