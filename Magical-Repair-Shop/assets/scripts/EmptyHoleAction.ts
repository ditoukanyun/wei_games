import { WorkshopAssets } from './WorkshopAssets';
import { Color, Graphics, Sprite } from 'cc';
import { _decorator, Component, director, EventTouch, Input, Node, tween, UITransform, Vec3 } from 'cc';
import { AudioManger } from './AudioManger';
import { Clips, events } from './Enums';
import { Global } from './Global';
import { PinAction } from './PinAction';
import { Tools } from './Tools';
const { ccclass, property } = _decorator;

@ccclass('EmptyHoleAction')
export class EmptyHoleAction extends Component {
    @property({type:Node})
    lock:Node;
    defalut_lock:boolean = false;//默认不锁
    isLocked:boolean = false;
    onLoad(): void {
        this.node.children.forEach(child => {
            if (child.getComponent(Sprite) && child !== this.lock) WorkshopAssets.skin(child, 7);
        });
        if (this.lock) {
            // The serialized lock has its Sprite on a nested child, not on this.lock.
            const hideLegacy = (node: Node) => {
                const sprite = node.getComponent(Sprite); if (sprite) sprite.enabled = false;
                node.children.forEach(hideLegacy);
            };
            hideLegacy(this.lock);
            const face = new Node('WorkshopLockFace');
            face.layer = this.lock.layer; this.lock.addChild(face);
            const lockArt = face.addComponent(Graphics);
            lockArt.fillColor = new Color(255,237,196); lockArt.strokeColor = new Color(184,132,57); lockArt.lineWidth = 2;
            lockArt.roundRect(-26,-26,52,52,15); lockArt.fill(); lockArt.stroke();
            lockArt.strokeColor = new Color(47,94,88); lockArt.lineWidth = 4;
            lockArt.moveTo(-9,7);lockArt.lineTo(-9,14);lockArt.quadraticCurveTo(0,27,9,14);lockArt.lineTo(9,7);lockArt.stroke();
            lockArt.fillColor = new Color(47,94,88);
            lockArt.roundRect(-14,-16,28,23,4); lockArt.fill();
            lockArt.fillColor = new Color(255,237,196);
            lockArt.circle(0,-3,3);lockArt.fill();lockArt.roundRect(-1.5,-10,3,7,1);lockArt.fill();
        }
        //显示锁头
        this.defalut_lock = this.lock.active;
    }
    start() {
        // this.node.on(Input.EventType.TOUCH_START, this.unlock_hole, this);
    }

    set_lock_unlock(l:boolean){
        this.isLocked = l;
        if(this.lock){
            tween(this.lock)
            .to(0.25,{scale:new Vec3(1.2,1.2,1)},Global.our_easing)
            .to(0.45,{scale:new Vec3(0.8,0.8,1)},Global.our_easing)
            .to(0.25,{scale:new Vec3(1,1,1)},Global.our_easing)
            .call(()=>{
                this.lock.scale = new Vec3(1,1,1);
                this.lock.active = l;
            })
            .start();
           }
    }

    init_empty_hole(){
        this.set_lock_unlock(this.defalut_lock);
        this.clear_pins();
    }

    unlock_hole(e: EventTouch) {
        // console.log("开始。。。empty ",this.isLocked);
        if(!this.isLocked){
            return;
        }
        this.set_lock_unlock(false);
    }

    

    //获取钉子
    public get_pin_arr(arr:PinAction[] = null): PinAction[] {
        if(!arr){
            arr = [];
        }
        this.node.children.forEach(element => {
            if (element.getComponent(PinAction)) {
                arr.push(element.getComponent(PinAction));
            }
        });
        return arr;
    }

    public get_pin_arr_by_color_id(color_id:number,pin_arr:PinAction[]){
        this.node.children.forEach(element => {
            if (element.getComponent(PinAction)) {
                let pin_action = element.getComponent(PinAction);
                if(pin_action.pin_color&&pin_action.pin_color.id == color_id &&!pin_action.is_flying()){
                     pin_arr.push(pin_action);
                }
            }
        });
    }



    private get_temp_position(): Vec3 {
        //钉子数量
        let pin_arr = this.get_pin_arr();
        if(pin_arr.length>0){
            //有钉子了
            return null;
        }
        return new Vec3(0,0,0);
    }

    private clear_pins(){
        // this.node.children.forEach(element => {
        //     if (element.getComponent(PinAction)) {
        //         Tools.clearUI(element);
        //     }
        // });
        Tools.clearFromParent(this.node,PinAction);
    }

    public can_able_put():boolean{
        if(this.isLocked){
            return false;
        }
        let target_hole_pos = this.get_temp_position();
        if (target_hole_pos) {
            return true;
        }else{
            return false;
        }
    }

    public put_pin(pin: PinAction):boolean {

        let target_hole_pos = this.get_temp_position();
        if (!target_hole_pos) {
            // 没找到孔的点
            return false;
        }
        //
        let world_pos = pin.node.getWorldPosition();
        let target = this.node.getComponent(UITransform).convertToNodeSpaceAR(world_pos);
        //
        pin.set_flyinng(true);

        this.node.addChild(pin.node);
        pin.node.setPosition(target);

        // let target = find("Canvas").getComponent(UITransform).convertToNodeSpaceAR(hole_world_pos);
        pin.clear_pin();

    
        this.tween_play(pin,target_hole_pos);
        return true;
    }

    async tween_play(pin: PinAction,target_hole_pos:Vec3){
        let ret1 = new Vec3(pin.node.position.x, pin.node.position.y,pin.node.position.z).lerp(target_hole_pos, 0.1);
        tween(pin.node)
        .to(0.20, {scale: new Vec3(2,2),position:ret1,angle:360}, { easing: 'quadInOut' })
        // .to(0.35, { position: target_hole_pos,scale: new Vec3(1, 1) },Global.our_easing)
        .to(0.25, { position: target_hole_pos}, { easing: 'quadInOut' })
        .call(() => {
            // AudioManger.instance.playSound(Clips.close_screw);
            // pin.node.setScale(1,1);
            if(pin.pos_hole){
                pin.pos_hole.hide();
            }
            // if (this.get_temp_hole_num()<=0) {
            //     //如果已经满了。
            //     this.full_complete();
            // }
            pin.set_flyinng(false);
            director.emit(events.check_empty_hole, pin);
        })
        .to(0.20, {scale: new Vec3(1, 1)}, { easing: 'quadInOut' })
        .start();
    }
}

