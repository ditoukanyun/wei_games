import { _decorator, Component, Label, Node, Widget } from 'cc';
import { BytePlantform } from './BytePlantform';
import { LvLStorage } from './LvLStorage';
import { Global } from './Global';
const { ccclass, property } = _decorator;

@ccclass('SiderPageAction')
export class SiderPageAction extends Component {

    @property({ type: Label })
    btn_label: Label;  

    @property({ type: Label })
    gift_coins_label: Label;

    onLoad() {
        // game.frameRate = 60;
        this.node.active = false;
    }

    start() {

    }

    

    show(){
        this.node.active = true;
        this.node.setPosition(0, 0);
        if(this.node.getComponent(Widget)){
            this.node.getComponent(Widget).right = 0;
            this.node.getComponent(Widget).left = 0;
            this.node.getComponent(Widget).top = 0;
            this.node.getComponent(Widget).bottom = 0;  
        }
        this.refrush_data();
    }

    refrush_data(){
        this.gift_coins_label.string = "+"+Global.gift_coins+"";
        if(LvLStorage.get_gift() == 0){
            //0 =default,1=添加了。2=领取奖励
            this.btn_label.string = "跳转侧边栏"
         }else if(LvLStorage.get_gift() == 1){
            //0 =default,1=添加了。2=领取奖励
            this.btn_label.string = "领取奖励"
         }else{
             this.btn_label.string = "跳转侧边栏"
         }
    }

    btn_run(){
        console.log("btn_run");
        if(LvLStorage.get_gift() == 0){
            this.add_siderbar();
         }else if(LvLStorage.get_gift() == 1){
            this.get_gift();
         }else{
            this.add_siderbar();
         }
    }

    private get_gift(){
        Global.tips_action.show_for_bs("获取奖励"+Global.gift_coins);
        LvLStorage.record_gift(2);
        Global.coins_action.put_coins(Global.gift_coins,this.btn_label.node.getWorldPosition(),true);
        this.close_page();
        Global.main_action.show_gift_btn();
    }

    close_page(){
        this.node.setPosition(-1000, 0);
        this.node.active = false;
    }

    private add_siderbar() {
        // BytePlantform.ins.side_bar();
         // 调用SDK接口
         console.log("开始添加 add_siderbar");
         BytePlantform.ins.navigate_to_douyin((success: boolean) => {
            if (success) {
                // this.node.active = false;
                console.log('add_siderbar 添加侧边栏跳转成功');
                // if(LvLStorage.get_gift()<1){
                //     LvLStorage.record_gift(1);
                //     console.log('add_siderbar 添加侧边栏跳转成功,记录数据 1');
                // }
            } else {
                console.log('add_siderbar 跳转失败');
            }
        });
    }
}

