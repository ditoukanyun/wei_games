import { WorkshopAssets } from './WorkshopAssets';
import { _decorator, Color, Component, director, EventTouch, find, Input, Label, Node, Quat, Sprite, tween, Tween, UITransform, Vec2, Vec3 } from 'cc';
import { HoleAction } from './HoleAction';
import { PinAction } from './PinAction';
import { ColorDate } from './ColorDate';

import { AudioManger } from './AudioManger';
import { Clips, events } from './Enums';
import { Tools } from './Tools';
import { Global } from './Global';
import { CatColorRules } from './CatColorRules';
const { ccclass, property } = _decorator;

@ccclass('CatAction')
export class CatAction extends Component {
    cat_color: ColorDate;
    default_position: Readonly<Vec3>;
    defalut_lock: boolean = false;//默认不锁
    @property({ type: Node })
    lock: Node;

    @property({ type: Sprite })
    box_1_img: Sprite;
    @property({ type: Sprite })
    box_2_img: Sprite;

    isLocked: boolean = false;


    is_flying:boolean = false;


    onLoad(): void {
        if (this.box_1_img) {
            const tray = this.box_1_img.node;
            tray.setPosition(0, 0);
            tray.setScale(1, 1, 1);
            WorkshopAssets.surface(tray, 2, 168, 124);
        }
        if (this.box_2_img) this.box_2_img.enabled = false;
        const holes = this.node.children.filter(child => !!child.getComponent(HoleAction));
        holes.forEach((hole, i) => hole.setPosition((i - 1) * 43, 0));
        this.lock.children.forEach(child => {
            const label = child.getComponent(Label);
            if (label) {
                child.active = child.name === 'Label';
                child.setPosition(0, 0);
                child.getComponent(UITransform)?.setContentSize(125, 45);
                label.string = '＋ 解锁'; label.fontSize = 25; label.lineHeight = 30;
                label.isBold = true;
            }
            if (child.getComponent(Sprite)) {
                child.setPosition(0, 0); child.setScale(1, 1, 1);
                const background = WorkshopAssets.surface(child, 2, 168, 124);
                background.color = new Color(48, 105, 99);
            }
        });
        //get default position
        this.default_position = this.node.getPosition().clone();
        //显示锁头
        this.defalut_lock = this.lock.active;
    }

    start() {

        this.node.on(Input.EventType.TOUCH_START, this.touch_start, this);
    }

    init_cat() {
        Tween.stopAllByTarget(this.node);
        this.node.active = true;
        this.cat_color = null;
        this.is_flying =false;
        // console.log("init>>>>>>> slot>>>>>>>>>defalut_lock>>",this.defalut_lock,this.isLocked);
        this.set_lock_unlock(this.defalut_lock);
        this.clear_pins();
        // console.log("init slot,",this.isLocked);

        this.node.setPosition(this.default_position.x, this.default_position.y);
        if (this.isLocked) {
            //默认有锁定的，让其出现在默认位置
            return;
        }
        //set slot color
        this.cat_color = CatColorRules.get_next_cat_color(CatColorRules.r_0());
        if (!this.cat_color) {
            this.node.active = false;
            return;
        }
        //set color
        this.set_img(this.cat_color, 255);
    }

    get_cat_color(): ColorDate {
        return this.cat_color;
    }

    set_lock_unlock(l: boolean) {
        if (l) {
            //lock
            this.isLocked = true;
            //隐藏 hole
            this.node.children.forEach(element => {
                if (element.getComponent(HoleAction)) {
                    element.active = false;
                }
            });
            //修改图颜色，黑色吧  
            if (this.box_1_img) this.box_1_img.color = Color.WHITE;
            this.lock.active = true;
            this.box_2_img.node.active = false;

        } else {
            this.isLocked = false;
            //隐藏 hole
            this.node.children.forEach(element => {
                if (element.getComponent(HoleAction)) {
                    element.active = true;
                }
            });
            this.lock.active = false;
            this.box_2_img.node.active = true;
        }
    }

    touch_start(e: EventTouch) {
        if (!this.isLocked) {
            return;
        }
        AudioManger.instance.playSound(Clips.btn_1);
        // AudioManger.instance.playSound(Clips.btn_1);
        Global.props_action.show_box(this);
    }

    

    private get_hole_arr(): Node[] {
        let hole_arr = [];
        this.node.children.forEach(element => {
            if (element.getComponent(HoleAction)) {
                hole_arr.push(element);
            }
        });
        return hole_arr;
    }

    public get_pin_num(): number {
        let pin_num = 0;
        this.node.children.forEach(element => {
            if (element.getComponent(PinAction)) {
                pin_num++;
            }
        });
        return pin_num;
    }


    public check_able_put(pin: PinAction): boolean {
        if(this.is_flying){
            return false;
        }
        if (!this.cat_color) {
            return false;
        }
        if (this.isLocked) {
            return false;
        }
        if (pin.pin_color.id != this.cat_color.id) {
            return false;
        }
        let temp = this.get_temp_hole_num()
        if (temp > 0) {
            return true;
        } else {
            return false;
        }
    }

    //get temp hole num
    public get_temp_hole_num(): number {
        let pin_num = this.get_pin_num();
        let hole_arr = this.get_hole_arr();
        return hole_arr.length - pin_num;
    }

    private get_temp_position(): Vec3 {
        //钉子数量
        let pin_num = this.get_pin_num();
        let hole_arr = this.get_hole_arr();
        if (this.get_temp_hole_num() <= 0) {
            //钉子满了
            return null;
        }
        let target_hole_index = pin_num;

        return hole_arr[target_hole_index].position;
    }


    public put_pin(pin: PinAction,delay = 0): boolean {

        let target_hole_pos = this.get_temp_position();
        if (!target_hole_pos) {
            // 没找到孔的点
            // console.log("没找到孔的点");
            return false;
        }
        //
        let world_pos = pin.node.getWorldPosition();
        let target = this.node.getComponent(UITransform).convertToNodeSpaceAR(world_pos);
        this.node.addChild(pin.node);
        pin.node.setPosition(target);

        // let target = find("Canvas").getComponent(UITransform).convertToNodeSpaceAR(hole_world_pos);
        pin.clear_pin();

        //这里限制一下，防止多个钉子一起放进来，都执行结束动作，只准许最后一个钉子完成后执行结束动作
        let run_completed = false;
        if (this.get_temp_hole_num() <= 0) {
            run_completed = true;
        }

        this.tween_play(pin,run_completed,target_hole_pos,delay);
        return true;
    }

    
    private async tween_play(pin: PinAction,run_completed:boolean,target_hole_pos:Vec3,delay:number){

        let ret1 = new Vec3(pin.node.position.x, pin.node.position.y,pin.node.position.z).lerp(target_hole_pos, 0.1);
        // let ret2 = new Vec3(pin.node.position.x, pin.node.position.y,pin.node.position.z).lerp(target_hole_pos, 0.99);
        tween(pin.node)
        .delay(delay)
        .to(0.20, {scale: new Vec3(1.25,1.25,1),position:ret1,angle:360}, { easing: 'quadInOut' })
        .to(0.30, { position: target_hole_pos}, { easing: 'quadInOut' })
        .call(() => {
            if(pin.pos_hole){
                pin.pos_hole.hide();
            }
            AudioManger.instance.playSound(Clips.pin_2);
            if (run_completed) {
                //如果已经满了。
                this.full_complete();
            }
        })
        // .to(0.15, {position:target_hole_pos,scale: new Vec3(1, 1),angle:360}, { easing: 'quadInOut' })
        .to(0.20, {scale: new Vec3(0.9, 0.9, 1)}, { easing: 'quadInOut' })
       
        
        .start();
    }


    private full_complete() {

        this.is_flying = true;
        //获取奖励
        Global.coins_action.put_coins(this.get_pin_num(), this.node.getWorldPosition());

        let to_position_1 = this.node.getPosition().clone();
        let to_position = this.node.getPosition().clone();
        to_position.y = to_position.y + 300;
        tween(this.node)
            .to(0.05, { position: new Vec3(to_position_1.x+6,to_position_1.y) }, Global.our_easing)
            .to(0.05, { position: new Vec3(to_position_1.x-6,to_position_1.y) }, Global.our_easing)
            .to(0.05, { position: new Vec3(to_position_1.x+6,to_position_1.y) }, Global.our_easing)
            .to(0.05, { position: new Vec3(to_position_1.x-6,to_position_1.y) }, Global.our_easing)
            .to(0.05, { position: new Vec3(to_position_1.x+6,to_position_1.y) }, Global.our_easing)
            .to(0.05, { position: new Vec3(to_position_1.x-6,to_position_1.y) }, Global.our_easing)
            .to(0.05, { position: new Vec3(to_position_1.x+6,to_position_1.y) }, Global.our_easing)
            .to(0.05, { position: new Vec3(to_position_1.x-6,to_position_1.y) }, Global.our_easing)
            .to(0.05, { position: new Vec3(to_position_1.x,to_position_1.y) }, Global.our_easing)

            .to(0.15, { position: to_position }, Global.our_easing)
            .call(() => {
                AudioManger.instance.playSound(Clips.pin_3);
                this.cat_color = null;
                Global.pin_prgress_computed(this.get_pin_num());
                this.clear_pins();
                director.emit(events.check_completed, this);

            }).start();
    }

    public clear_pins() {
        this.node.children.forEach(child => {
            if (child.getComponent(PinAction)) Tween.stopAllByTarget(child);
        });
        Tools.clearFromParent(this.node, PinAction);

    }

    private set_img(c: ColorDate, a: number) {
        // let img = this.node.getChildByName("img").getComponent(Sprite);
        if(this.box_1_img){
            this.box_1_img.color = new Color(c.r, c.g, c.b, a);
        }
        
    }

    public async into_scence(pos: Vec2= new Vec2(-600, 0)) {
        this.node.active = true;
        if (this.isLocked) {
            //默认有锁定的，让其出现在默认位置
            this.node.setPosition(this.default_position.x, this.default_position.y);
            return;
        }
        this.is_flying = true;
        //set slot color
        switch (Global.cur_lvl) {
            case 1:
                this.cat_color = CatColorRules.get_next_cat_color(CatColorRules.r_0());
                break;
            case 2:
                this.cat_color = CatColorRules.get_next_cat_color(CatColorRules.r_0());
                break;
            case 3:
                this.cat_color = CatColorRules.get_next_cat_color(CatColorRules.r_1());
                break;
            case 4:
                this.cat_color = CatColorRules.get_next_cat_color(CatColorRules.r_2());
                break;
            case 5:
                this.cat_color = CatColorRules.get_next_cat_color(CatColorRules.r_3());
                break;
            case 6:
                this.cat_color = CatColorRules.get_next_cat_color(CatColorRules.r_3());
                break;
            default:
                this.cat_color = CatColorRules.get_next_cat_color(CatColorRules.r_4());
        }
        // console.log("into_scence ---->>>>>>>>> remain color:",this.cat_color,">" ,CatColorRules.cat_color_arr.length);
        if (!this.cat_color) {
            this.is_flying = false;
            this.node.active = false;
            return;
        }
        //set color
        this.set_img(this.cat_color, 255);

        this.node.setPosition(this.default_position.x + pos.x, this.default_position.y + pos.y);
        tween(this.node)
            .to(0.20, { position: this.default_position.clone() }, Global.our_easing)
            .call(() => {
                //飞到了自己的位置
                // let pin_arr: PinAction[] = [];
                // // bucket
                // Global.bucket_action.get_pin_arr_by_color_id(this.cat_color.id, pin_arr);
                // Global.layer_empty_action.get_pin_by_color(this.cat_color.id, pin_arr);
                // pin_arr.forEach(element => {
                //     if (this.check_able_put(element)) {
                //         this.put_pin(element,0.2);
                //     }
                // });
                this.is_flying = false;

                this.load_pin();

            })
            .start();
    }

    public load_pin(){
        if (!this.cat_color || this.isLocked || this.is_flying) return;
        let pin_arr: PinAction[] = [];
        // bucket
        Global.bucket_action.get_pin_arr_by_color_id(this.cat_color.id, pin_arr);
        Global.layer_empty_action.get_pin_by_color(this.cat_color.id, pin_arr);
        pin_arr.forEach(element => {
            if (this.check_able_put(element)) {
                this.put_pin(element,0.2);
            }
        });
    }
}

