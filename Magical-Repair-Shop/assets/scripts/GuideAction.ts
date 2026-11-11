import { _decorator, Component, director, Node, tween, UITransform } from 'cc';
import { events } from './Enums';
import { Global } from './Global';
import { Tools } from './Tools';
import { BtnAction } from './BtnAction';
const { ccclass, property } = _decorator;

@ccclass('GuideAction')
export class GuideAction extends Component {
    @property({ type: Node })
    guide: Node


    show_time: number = 0;

    touch_time: number = 0;

    guide_1_times: number = 0;

    start() {
        this.default_pos();
        director.on(events.check_guide, this.check_guide_1, this);
    }


    onDestroy(): void {
        director.off(events.check_guide, this.check_guide_1, this);
    }

    action_lvl_start_begin() {
        this.show_time = 0;
        this.touch_time = 0;
        this.guide_1_times = 0;
        this.dt = 0;
        this.default_pos();
    }

    dt = 0;
    update(deltaTime: number) {
        this.dt += deltaTime;
        if (this.dt >= 10) {
            let now = new Date().valueOf();
            if ((now - this.touch_time) < 15000) {
                return;
            }

            this.check_guide_2();
            // console.log("time_show ret>>>",this.dt);
            this.dt = 0;
        }
    }


    check_guide_2() {
        // console.log("check_guide_2");
        let button_arr = Global.layer_btn_action.get_button_arr();

        let arr = [];
        let slot_pin_arr = Global.layer_empty_action.get_pin_arr();
        let slot_lock_num = Global.layer_empty_action.get_lock_num();

        button_arr.forEach(btn => {
            if (btn.getComponent(BtnAction)) {
                let ba = btn.getComponent(BtnAction);
                switch (ba.index) {
                    case 1:
                        if (slot_lock_num > 0) {
                            arr.push(btn);
                        } else {
                            //continue
                            // console.log("跳过，开孔 按钮");
                        }
                        break;
                    case 2:
                        arr.push(btn);
                        break;
                    case 3:
                        if (slot_pin_arr.length > 0) {
                            arr.push(btn);
                        } else {
                            //continue
                            // console.log("跳过，清理按钮");
                        }
                        break;
                    default:
                        arr.push(btn);
                }

            }
        });


        try {
            let locked_cat_arr = Global.layer_cat_action.get_locked_cat();
            if (locked_cat_arr.length > 0) {
                arr.push(locked_cat_arr[0]);
            }
            if (arr.length == 0) {
                return;
            }
            let r = Tools.random_between_floor(0, arr.length);
            this.show_guide(arr[r]);
        } catch (error) {
            console.log("time_show errors:", error);
        }
    }

    check_guide_1() {
        this.touch_time = new Date().valueOf();
        if (this.guide_1_times > 2) {
            if ((this.touch_time - this.show_time) < 30000) {
                return;
            }
        }

        // console.log(" check_guide_1 ",this.show_time, "/", this.touch_time , ">>", this.touch_time  - this.show_time);

        let locked_cat_arr = Global.layer_cat_action.get_locked_cat();
        if (locked_cat_arr.length == 0) {
            return;
        }
        let down = false;
        let slot_pin_arr = Global.layer_empty_action.get_pin_arr();
        if (this.show_time == 0 && slot_pin_arr.length == 2 && Global.cur_lvl == 1) {
            //刚刚进入游戏
            down = true;
        }
        if (slot_pin_arr.length >= 4) {
            down = true;
        }
        if (down) {
            this.guide_1_times++;
            this.show_time = new Date().valueOf();
            this.show_guide(locked_cat_arr[0]);
        }
    }

    private show_guide(target: Node) {
        // console.log("show_guide>>>");
        if (!this.guide) {
            return;
        }

        let world_pos = target.getWorldPosition();
        let local_pos = this.node.getComponent(UITransform).convertToNodeSpaceAR(world_pos);
        this.guide.setPosition(local_pos);
        this.scheduleOnce(() => {
            this.default_pos();
        }, 3);
    }

    private default_pos() {
        this.guide.setPosition(0, -2000, 0);
    }
}

