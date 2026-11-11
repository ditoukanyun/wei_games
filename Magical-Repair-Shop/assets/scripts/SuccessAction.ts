import { isChapter } from './ChapterLayout';
import { WorkshopCelebration } from './WorkshopCelebration';
import { _decorator, Component, instantiate, Label, Node, tween, UITransform, Vec2, Vec3 } from 'cc';
import { Global } from './Global';
import { Clips } from './Enums';
import { AudioManger } from './AudioManger';
import { BasePage } from './BasePage';
import { AdManger } from './ad/AdManger';
import { Tools } from './Tools';
import { ResourcePool } from './ResourcePool';
const { ccclass, property } = _decorator;

@ccclass('SuccessAction')
export class SuccessAction extends BasePage {

    @property({ type: Label })
    level_label: Label = null;

    @property({ type: Label })
    coins_label: Label = null;

    @property({ type: Node })
    coins_img: Node = null;

    @property({ type: Node })
    get_coins_btn: Node = null;

    @property({ type: Node })
    next_btn: Node = null;

    @property({ type: Label })
    v_getcoins_label: Label = null;

    start() {
        super.start();
    }

    

    private get_free_coins():Vec2{
        return new Vec2(Global.cur_lvl*15,Global.cur_lvl*50);
    }

    //show menu plant
    open() {
        this.unscheduleAllCallbacks();
        super.open();
        if (this.get_coins_btn) {
            this.get_coins_btn.active = true;
        }
        AudioManger.instance.playSound(Clips.complete_2);
        this.level_label.string = Global.cur_lvl + "";

        let free = this.get_free_coins();
        console.log("v_getcoins_label>>>",this.v_getcoins_label,free);
        this.v_getcoins_label.string = free.x+" ~ "+ free.y;

        this.coins_label.string = "" + Global.cur_coins + " ";
        this.coins_label.node.scale = new Vec3(3, 3, 0);
        tween(this.coins_label.node)
            .to(0.5, { scale: new Vec3(1, 1, 0) }, Global.our_easing)
            .start();

        const resource=this.node.getChildByPath('WorkshopHomeResources/WorkshopAmount')?.getComponent(Label);
        if(resource) resource.string=String(Global.cur_coins);
        const chapter = isChapter(Global.cur_lvl);
        ['panel_bg','bs','coins_label','Label','Label-001','lvl','btn_get_coins'].forEach(name => {
            const node = this.node.getChildByName(name);
            if (node) node.active = !chapter;
        });
        const caption = this.node.getChildByName('WorkshopRepairedCaption');
        if (caption) caption.active = chapter;
        const captionPaper = this.node.getChildByName('WorkshopCaptionPaper');
        if (captionPaper) captionPaper.active = chapter;
        const profile = this.node.parent.getChildByName('FrameProfile');
        if (profile) profile.active = false;
        let celebration = this.node.getComponent(WorkshopCelebration);
        if (chapter) {
            if (!celebration) celebration = this.node.addComponent(WorkshopCelebration);
            celebration.play(Global.cur_lvl);
        } else {
            const hero = this.node.getChildByName('RepairedOwl'); if (hero) hero.active = false;
        }
        if (this.next_btn) this.next_btn.active = true;

    }

    btn_next() {
        AudioManger.instance.playSound(Clips.btn_1);
        if (this.get_coins_btn) {
            this.get_coins_btn.active = false;
        }
        this.close();
        AdManger.show_interstial();
        // Global.reset_level_default();
        // Global.main_action.next_lvl();
        Global.main_action.start_lvl(Global.next_level());
    }

    private play_add_gift_tween(num: number, world_pos: Vec3, callBack: Function) {
        let prefab = ResourcePool.instance.get_prefab("coin");
        let temp = 0;
        for (let i = 0; i < num; i++) {
            let coin = instantiate(prefab);
            let local = this.coins_img.getComponent(UITransform).convertToNodeSpaceAR(world_pos);
            this.coins_img.addChild(coin);
            local.x = local.x + Tools.random_between(-30, 80);
            local.y = local.y + Tools.random_between(0, 150);
            coin.setPosition(local);
            tween(coin)
                .to(Tools.random_between(0.5, 1.2), { position: new Vec3(0, 0, 0) }, Global.our_easing)
                .call(() => {
                    temp++;
                    this.coins_label.string = "" + (Global.cur_coins + temp);
                    AudioManger.instance.playSound(Clips.coins);
                    if (temp >= num) {
                        if (callBack) {
                            callBack();
                            callBack = null;
                        }
                        this.coins_label.string = "" + Global.cur_coins;
                    }
                })
                .removeSelf()
                .start();
        }
    }

    get_one_bag_coins() {
        if (this.get_coins_btn) {
            this.get_coins_btn.active = false;
        } else {
            return;
        }
        AudioManger.instance.playSound(Clips.btn_1);
        AdManger.show_video((data) => {
            if (data == 1) {
                console.log("get_one_bag_coins 获取奖励成功");
                let free = this.get_free_coins();
                let num = Tools.random_between_floor(free.x,free.y);
                // console.log(" random data num :",num);
                this.play_add_gift_tween(num,this.get_coins_btn.getWorldPosition(),()=>{
                    Global.coins_action.put_coins(num,this.coins_img.getWorldPosition(),false);
                });

            } else {
                Global.tips_action.show("获取奖励失败");
            } 
        })

        // console.log("get_one_bag_coins 获取奖励成功");
        // let num = Tools.random_between_floor(15, 46);
        // // console.log(" random data num :",num);
        // this.play_add_gift_tween(num, this.get_coins_btn.getWorldPosition(), () => {
        //     Global.coins_action.put_coins(num, this.coins_img.getWorldPosition(), false);
        // });

    }
}

