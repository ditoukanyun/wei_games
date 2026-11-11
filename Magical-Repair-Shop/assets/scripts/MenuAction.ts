import { _decorator, Component, director, Node, tween } from 'cc';
import { Global } from './Global';
import { Clips } from './Enums';
import { AudioManger } from './AudioManger';
import { BasePage } from './BasePage';
import { AdManger } from './ad/AdManger';
import { WorkshopTheme } from './WorkshopTheme';
const { ccclass, property } = _decorator;

@ccclass('MenuAction')
export class MenuAction extends BasePage {

    @property({ type: Node })
    xxx_node: Node

    start() {
        super.start();
    }

    

    private set_xxx() {
        if (this.xxx_node) this.xxx_node.active = false;
        const control = this.node.getChildByName('btn_sound');
        if (control) WorkshopTheme.soundControl(control, Global.sound_switch);
    }

    on_off_sound() {
        AudioManger.instance.playSound(Clips.btn_1);
        Global.sound_switch = !Global.sound_switch;
        this.set_xxx();
    }

    //show menu plant
    open() {
        super.open();
        //show interstial
        this.set_xxx();
    }

    btn_go_home() {
        this.close();
        director.loadScene("home");
        AdManger.show_interstial();
    }

    btn_continue_game() {
        this.close();
        if (Global.main_action.retry_failed_level()) return;
        AdManger.show_interstial();
    }

    btn_restart_game() {
        this.close();
        Global.main_action.restart_game();
    }

    go_lvl_1(){
        AdManger.show_video((data) => {
            if (data == 1) {
                console.log("go_lvl_1 获取奖励成功");
                this.close();
                //解锁
                AdManger.show_interstial();

                //重新记录等级。
                Global.main_action.restart_game(1);
            } else {
                Global.tips_action.show("返回失败,需要看完视频");
            } 
        })
    }
}

