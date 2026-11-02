import { _decorator, Component, director, Node } from 'cc';
import { loadPool } from '../getRes/loadPool';
import { gameConfig } from '../data/gameConfig';
import { emits, local, perName } from '../data/enume';
import { save } from '../unitls/tools';
import { wxAd } from '../ad/wxAd';
import { donghuaTs } from '../ctrl/donghuaTs';
import { audioTool } from '../unitls/audioTool';
import { adConfig } from '../ad/adConfig';
import { adMgr } from '../ad/adMgr';
const { ccclass, property } = _decorator;

@ccclass('shopTs')
export class shopTs extends Component {
    @property(Node) UIPop: Node
    protected onEnable(): void {
        // 显示弹窗动画
        donghuaTs.ins.popJinDh(this.UIPop)
    }

    /**
    * 关闭弹窗
    */
    close() {
        audioTool.ins.playSound('btn1')
        // 关闭弹窗动画
        donghuaTs.ins.popchuDh(this.UIPop, this.node)
    }
    /**
     * 获取奖励
     */
    getJinbi() {
        if (adConfig.isShowAd) {
            adMgr.showVideo(() => {
                this.jinbi()
            })
        } else {
            this.jinbi()
        }
    }
    jinbi() {
        gameConfig.jinbi += 100
        // 通过对象池创建提示预制体
        loadPool.ins.getPoolNode(perName.messages, this.node.parent)
        director.emit(emits.jinbiNum)
        // 调用提示功能
        director.emit(emits.message, '获得100金币');
        // 关闭弹窗动画
        donghuaTs.ins.popchuDh(this.UIPop, this.node)
    }
}


