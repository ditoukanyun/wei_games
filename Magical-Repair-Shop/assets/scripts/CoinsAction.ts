import { _decorator, Component, easing, instantiate, Label, Node, tween, UITransform, Vec3 } from 'cc';
import { ResourcePool } from './ResourcePool';

import { Global } from './Global';
import { Clips } from './Enums';
import { AudioManger } from './AudioManger';
import { Tools } from './Tools';
const { ccclass, property } = _decorator;

@ccclass('CoinsAction')
export class CoinsAction extends Component {
    @property({type:Label})
    level_label:Label = null;

    start() {
        this.refrush_coins();
    }

    

    refrush_coins(){
        this.level_label.string =  Global.cur_coins+"";
    }

    async put_coins(num:number,world_pos:Vec3,play_sound:boolean = true){
        //记录
        Global.cur_coins = Global.cur_coins+num;
        let prefab = ResourcePool.instance.get_prefab("coin");
      
        for(let i =0;i<num;i++){
            let coin = instantiate(prefab);
            let local = this.node.getComponent(UITransform).convertToNodeSpaceAR(world_pos);
            this.node.addChild(coin);
            local.x = local.x + Tools.random_between(-30,80);
            local.y = local.y + Tools.random_between(0,150);
            coin.setPosition(local);
            let show = false;
            if(num-1 == i){
                show = true;
            }
            let z_ = 1;
            if(Math.random()>0.5){
                z_ = -1;
            }
            tween(coin)
            .to(Tools.random_between(0.7,0.9),{position:new Vec3(0,0,0),angle:360*z_},Global.our_easing)
            .call(()=>{
                if(Global.cur_coins>0 && play_sound && show){
                    AudioManger.instance.playSound(Clips.coins);

                }
            })
            .to(0.4,{scale:new Vec3(0.2,0.2,0.2)},Global.our_easing)
            .call(()=>{
                if(show){
                    this.refrush_coins();
                }
            })
            
            .removeSelf()
            .start();
        }
    }
        

}

