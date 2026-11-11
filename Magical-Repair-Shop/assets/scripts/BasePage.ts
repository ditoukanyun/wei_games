import { _decorator, Component, director, Node, Sprite, tween, Vec3, Widget } from 'cc';
import { AudioManger } from './AudioManger';
import { Clips } from './Enums';
import { AdManger } from './ad/AdManger';
const { ccclass, property } = _decorator;

@ccclass('BasePage')
export class BasePage extends Component {

    onLoad() {
        // game.frameRate = 60;
        this.node.active = false;
    }

    start() {
        this.node.setPosition(0, -2200);
    }
    
    //show menu panel
    open() {
        this.node.active = true;
        this.node.setPosition(0, 0);
        if(this.node.getComponent(Widget)){
            this.node.getComponent(Widget).right = 0;
            this.node.getComponent(Widget).left = 0;
            this.node.getComponent(Widget).top = 0;
            this.node.getComponent(Widget).bottom = 0;  
        }

        AdManger.show_banner();
    }

    close(play_sound:boolean = true) {
        if(play_sound){
            AudioManger.instance.playSound(Clips.btn_1);
        }
        
        this.node.setPosition(-1000, 0);
        this.node.active = false;

        AdManger.close_ad();

        console.log("关闭。。页面");
    }

}

