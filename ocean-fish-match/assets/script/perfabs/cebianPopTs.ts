import { _decorator, Component, director, Node, NodeEventType } from 'cc';
import { loadPool } from '../getRes/loadPool';
import { gameConfig } from '../data/gameConfig';
import { getDayTime, save } from '../unitls/tools';
import { emits, local, perName } from '../data/enume';
import { donghuaTs } from '../ctrl/donghuaTs';
const { ccclass, property } = _decorator;
const tt = window['tt'];
@ccclass('cebianPopTs')
export class cebianPopTs extends Component { // 是否可以点击
    private isTouch: boolean = true;
    // 侧边栏按钮
    @property(Node)
    private cebian: Node;
    // 领取奖励按钮
    @property(Node)
    private lignqu: Node;
    // 关闭弹窗按钮
    @property(Node)
    private close: Node;
    // UI弹窗
    @property(Node)
    private UIPop: Node;
    // 是否从侧边栏进入
    private isFromSidebar: boolean = false;
    protected start(): void {
        // 侧边栏按钮事件
        this.cebian.on(NodeEventType.TOUCH_START, this.cebianBtn, this)
        // 领取按钮事件
        this.lignqu.on(NodeEventType.TOUCH_START, this.lignquBtn, this)
        // 关闭弹窗事件
        this.close.on(NodeEventType.TOUCH_START, this.closeBtn, this)
        // 判断是否从侧边栏进入
        tt.onShow((res) => {
            //判断用户是否是从侧边栏进来的
            this.isFromSidebar = (res.launch_from == 'homepage' && res.location == 'sidebar_card')
            if (this.isFromSidebar) {
                console.log('是从侧边栏进入', this.isFromSidebar);
                //如果是从侧边栏进来的，显示“领取奖励”按钮，隐藏“去侧边栏”
                this.lignqu.active = true
                this.cebian.active = false
            } else {
                console.log('不是从侧边栏进入', this.isFromSidebar);
                //如果是从侧边栏进来的，显示“领取奖励”按钮，隐藏“去侧边栏”
                this.lignqu.active = false
                this.cebian.active = true
            }
        })
    }
    // 点击自动跳转到侧边栏
    cebianBtn() {
        tt.navigateToScene({
            scene: 'sidebar',
            success: (res) => {
                console.log("check scene success: ", res);
            },
            fail: (res) => {
                console.log("check scene fail:", res);
            }
        })
    }
    // 领取按钮
    lignquBtn() {
        // 是否可以点击
        if (!this.isTouch) return
        this.isTouch = false
        //领取福利逻辑
        gameConfig.jinbi += 50
        // 消除道具
        gameConfig.hammerNum += 1
        // 换色道具
        gameConfig.changeNum += 1
        // 领取状态
        gameConfig.isFuli = 0
        // 获取第二天的时间戳
        let endTime = getDayTime()
        // 全局事件（已经领取福利）
        director.emit(emits.isFuli)
        // 本地存储时间
        save(local.endTime, endTime)
        // 关闭弹窗动画
        donghuaTs.ins.popchuDh(this.UIPop, this.node)
        // 通过对象池创建提示预制体
        loadPool.ins.getPoolNode(perName.messages, gameConfig.homeRoot)
        director.emit(emits.jinbiNum)
        // 调用提示功能
        director.emit(emits.message, '领取成功');
        save(local.hammerNum, gameConfig.hammerNum)
        save(local.changeNum, gameConfig.changeNum)
        this.isTouch = true
    }
    // 关闭按钮
    closeBtn() {
        loadPool.ins.huiShouNode(this.node)
    }
}


