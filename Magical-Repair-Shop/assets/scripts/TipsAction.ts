import { _decorator, Component, Label, Node, tween, Vec3 } from 'cc';
import { Clips } from './Enums';
import { AudioManger } from './AudioManger';
import { Global } from './Global';
const { ccclass, property } = _decorator;

@ccclass('TipsAction')
export class TipsAction extends Component {
    @property({type:Label})
    level_label:Label = null;

    @property({type:Node})
    bs_img:Node = null;

    msg_list:MessageData[] = [];
    running = false;


    start() {
        this.set_default();
    }

    set_default(){
        this.node.setPosition(0,-1000)
    }

    

    public show_for_bs(str:string){
        this.msg_list.push(new MessageData(str,1));
        // console.log("TipsAction>>>",str,this.level_label);
        if(!this.running){
            this.play();
        }
    }

    public show(str:string){
        this.msg_list.push(new MessageData(str,2));
        // console.log("TipsAction>>>",str,this.level_label);
        if(!this.running){
            this.play();
        }
    }

    private play(){
        let self  = this;
        if(self.msg_list.length == 0){
            self.running = false;
            return;
        }
        self.running = true;

       let msg_data =  self.msg_list.shift()
        if(msg_data.type == 1){
            if(this.bs_img){
                this.bs_img.active = true;
            }
            self.level_label.string = msg_data.msg;
        }else{
            if(this.bs_img){
                this.bs_img.active = false;
            }
            self.level_label.string = msg_data.msg;
        }

        self.set_default();
        tween(self.node)
            .to(0.35,{position:new Vec3(0,0,0)},Global.our_easing)
            .delay(1)
            .to(0.1,{position:new Vec3(0,1000,0)},Global.our_easing)
            .call(()=>{
                AudioManger.instance.playSound(Clips.reng,0.2);
                // this.set_default();
                self.play();
            })
            .start();
    }
}

class MessageData{
    msg:string
    type:number

    constructor(m:string,t:number){
        this.msg = m;
        this.type = t;
    }
}

