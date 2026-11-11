import { _decorator, Component, Label, Node, Tween, tween, Vec3, Widget } from 'cc';
import { BasePage } from './BasePage';
import { Global } from './Global';
import { AudioManger } from './AudioManger';
import { Clips } from './Enums';
const { ccclass, property } = _decorator;

@ccclass('LoadingAction')
export class LoadingAction extends Component {

    @property({ type: Label })
    des: Label = null;


    onLoad() {
        // game.frameRate = 60;
        this.node.active = false;
    }

    start() {
        this.node.setPosition(0, -2200);
    }

    

    //show menu plant
    show(lvl: number) {
        this.unscheduleAllCallbacks();
        Tween.stopAllByTarget(this.des.node);
        {
            {
                this.node.active = true;
                this.node.setPosition(0, 0);
                if(this.node.getComponent(Widget)){
                    this.node.getComponent(Widget).right = 0;
                    this.node.getComponent(Widget).left = 0;
                    this.node.getComponent(Widget).top = 0;
                    this.node.getComponent(Widget).bottom = 0;  
                }
            }
        }
        this.des.string = "" + lvl + "  关";
        let self = this;
        // this.scheduleOnce(()=>{
        //     self.close();
        // },2)
        this.des.node.setPosition(1000, 0);
        AudioManger.instance.playSound(Clips.pin_3);
        tween(this.des.node)
        .to(0.18, { position: new Vec3(0, 0) }, { easing: 'quadInOut' })
        .start();
    }

    close(): void {
        let self = this;
        this.scheduleOnce(() => {
            AudioManger.instance.playSound(Clips.pin_3);
            tween(this.des.node)
                .to(0.18, { position: new Vec3(-1000, 0) }, { easing: 'quadInOut' })
                .call(() => {
                    self.close_2(false);
                })
                .start();
        }, 0.5)
    }
    private close_2(play_sound:boolean = true) {
        if(play_sound){
            AudioManger.instance.playSound(Clips.btn_1);
        }
        
        this.node.setPosition(-1000, 0);
        this.node.active = false;
        console.log("loading 关闭。。页面");
    }
}



