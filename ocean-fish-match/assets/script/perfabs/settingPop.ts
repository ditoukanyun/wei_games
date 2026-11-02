import { _decorator, Component, director, Node } from 'cc';
import { loadPool } from '../getRes/loadPool';
import { audioTool } from '../unitls/audioTool';
import { wxAd } from '../ad/wxAd';
import { donghuaTs } from '../ctrl/donghuaTs';
import { adMgr } from '../ad/adMgr';
const { ccclass, property } = _decorator;

@ccclass('settingPop')
export class settingPop extends Component {
    @property(Node) UIPop: Node
    protected onEnable(): void {
        // 显示格子广告
        adMgr.showGezi()
        // 显示弹窗动画
        donghuaTs.ins.popJinDh(this.UIPop)
    }
    /**
    * 关闭弹窗
    */
    close() {
        audioTool.ins.playSound('btn1')
        audioTool.ins.playSound('btn1')
        // 关闭格子广告
        adMgr.hideGezi()
        // 关闭弹窗动画
        donghuaTs.ins.popchuDh(this.UIPop, this.node)
    }
    /**
     * 返回首页
     */
    backHome() {
        audioTool.ins.stopMusic()
        // 关闭格子广告
        adMgr.hideGezi()
        // 关闭弹窗动画
        donghuaTs.ins.popchuDh(this.UIPop, this.node)
        director.loadScene('home')
    }
}


