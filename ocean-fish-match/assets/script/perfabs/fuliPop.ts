import { _decorator, Component, director, Node } from 'cc';
import { loadPool } from '../getRes/loadPool';
import { gameConfig } from '../data/gameConfig';
import { emits, local, perName } from '../data/enume';
import { getDayTime, save } from '../unitls/tools';
import { wxAd } from '../ad/wxAd';
import { donghuaTs } from '../ctrl/donghuaTs';
import { adConfig } from '../ad/adConfig';
import { adMgr } from '../ad/adMgr';
const { ccclass, property } = _decorator;

@ccclass('fuliPop')
export class fuliPop extends Component {
    @property(Node) UIPop: Node
    protected onEnable(): void {
        // 显示弹窗动画
        donghuaTs.ins.popJinDh(this.UIPop)
    }


    /**
     * 关闭弹窗
     */
    close() {
        // 关闭弹窗动画
        donghuaTs.ins.popchuDh(this.UIPop, this.node)
    }
    /**
     * 获取奖励
     */
    getFuli() {
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
    }
    /**
     * 获取双倍
     */
    getDoubFuli() {
        if (adConfig.isShowAd) {
            adMgr.showVideo(() => {
                this.fuli()
            })
        } else {
            this.fuli()
        }
    }
    fuli() {
        gameConfig.jinbi += 100
        // 消除道具
        gameConfig.hammerNum += 2
        // 换色道具
        gameConfig.changeNum += 2
        // 领取状态
        gameConfig.isFuli = 0
        let endTime = getDayTime()
        director.emit(emits.isFuli)
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
    }
}


