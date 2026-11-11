import { _decorator, Component, director, Label, Node, Sprite, tween, Vec3, Widget } from 'cc';
import { AudioManger } from './AudioManger';
import { Clips, DJ, DJ_TYPE } from './Enums';
import { Global } from './Global';
import { BasePage } from './BasePage';
import { AdManger } from './ad/AdManger';
import { DjManger } from './DjManger';
import { LvLStorage } from './LvLStorage';
const { ccclass, property } = _decorator;

@ccclass('GameOverAction')
export class GameOverAction extends BasePage {
    @property({ type: Node })
    title: Node
    @property({ type: Node })
    history_lvl_img: Node

    @property({ type: Node })
    btn_continue: Node

    @property({ type: Node })
    btn_replay: Node

    @property({ type: Node })
    btn_go_lvl_1: Node

    @property({ type: Label })
    histroy_level_label: Label = null;

    start() {
        super.start();
    }

    

    //show menu panel
    open() {
        if (this.node.position.x == 0 && this.node.position.y == 0) {
            //console.log("打开中，跳过");
            return;
        }
        super.open();

        this.title.scale = new Vec3(2, 2, 0);
        tween(this.title)
            .to(0.4, { scale: new Vec3(1, 1, 0) }, Global.our_easing)
            .call(() => {
            })
            .start();

        this.history_lvl_img.scale = new Vec3(0.1, 0.1, 0);
        tween(this.history_lvl_img)
            .to(0.5, { scale: new Vec3(1, 1, 0) }, Global.our_easing)
            .call(() => {
            }).start();

        if (this.histroy_level_label) {
            this.histroy_level_label.string = LvLStorage.get_history_lvl()+"";
        }



        AudioManger.instance.playSound(Clips.fail);

        this.unscheduleAllCallbacks();
        if (this.btn_replay) this.btn_replay.active = true;
        if (this.btn_go_lvl_1) this.btn_go_lvl_1.active = true;

        // test
        // this.btn_restart_game();ss 
    }


    btn_go_home() {
        this.close();
        director.loadScene("home");
        AdManger.show_interstial();
    }

    btn_restart_game() {
        this.close();
        Global.main_action.restart_game();
        AdManger.show_interstial();
    }


    clear_pins_videos() {

        let pin_arr = Global.layer_empty_action.get_pin_arr();
        if (pin_arr.length == 0) {
            AudioManger.instance.playSound(Clips.btn_1);
            Global.tips_action.show("没有可清理的钉子");
            return;
        }
        if (!DjManger.use_dj(DJ.Btn_5, DJ_TYPE.Type_video)) {
            AudioManger.instance.playSound(Clips.btn_1);
            Global.tips_action.show("当前关卡次数已经用完");
            return;
        }

        // Global.log_dj();
        // this.close();
        // Global.log_dj();


        AdManger.show_video((data) => {
            if (data == 1) {
                console.log("clear_pins_videos 获取奖励成功");
                this.close();
                //解锁
                Global.bucket_action.put_pins(pin_arr);
            } else {
                Global.tips_action.show("获取奖励失败");
                //退款
                DjManger.return_used_dj(DJ.Btn_5, DJ_TYPE.Type_video);
            }
        })
    }

    go_lvl_1() {
        AdManger.show_video((data) => {
            if (data == 1) {
                console.log("go_lvl_1 获取奖励成功");
                this.close();
                //解锁
                AdManger.show_interstial();

                //重新记录等级。
                LvLStorage.record_cur_lvl(1);
                Global.main_action.restart_game(1);
            } else {
                Global.tips_action.show("返回失败,需要看完视频");
            }
        })
    }
}

