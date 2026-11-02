import { _decorator, Component, director, Label, Node } from 'cc';
import { audioTool } from '../unitls/audioTool';
import { emits } from '../data/enume';
import { loadPool } from '../getRes/loadPool';
import { wxAd } from '../ad/wxAd';
import { gameConfig } from '../data/gameConfig';
import { donghuaTs } from '../ctrl/donghuaTs';
import { adMgr } from '../ad/adMgr';
const { ccclass, property } = _decorator;

@ccclass('shibaiPopTs')
export class shibaiPopTs extends Component {
    @property(Label) score: Label
    @property(Node) UIPop: Node
    protected onEnable(): void {
        // 显示弹窗动画
        donghuaTs.ins.popJinDh(this.UIPop)
        // 显示格子广告
        adMgr.showGezi()
        this.score.string = '分数:' + gameConfig.score
    }
    // 重新开始
    chongxinBtn() {
        audioTool.ins.playSound('btn1')
        // 隐藏格子广告
        adMgr.hideGezi()
        director.emit(emits.chongxinGame)
        // 关闭弹窗动画
        donghuaTs.ins.popchuDh(this.UIPop, this.node)
    }
    // 返回首页
    backBtn() {
        audioTool.ins.playSound('btn1')
        // 隐藏格子广告
        adMgr.hideGezi()
        // 关闭弹窗动画
        donghuaTs.ins.popchuDh(this.UIPop, this.node)
        director.loadScene('home')
    }
}


