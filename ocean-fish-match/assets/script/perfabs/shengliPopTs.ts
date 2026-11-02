import { _decorator, Component, director, Label, Node, Vec3 } from 'cc';
import { gameConfig } from '../data/gameConfig';
import { loadPool } from '../getRes/loadPool';
import { local, perName } from '../data/enume';
import { wxAd } from '../ad/wxAd';
import { audioTool } from '../unitls/audioTool';
import { save } from '../unitls/tools';
import { donghuaTs } from '../ctrl/donghuaTs';
import { adMgr } from '../ad/adMgr';
const { ccclass, property } = _decorator;

@ccclass('shengliPopTs')
export class shengliPopTs extends Component {
    @property(Label) score: Label
    @property(Node) UIPop: Node
    protected onEnable(): void {
        // 显示弹窗动画
        donghuaTs.ins.popJinDh(this.UIPop)
        // 显示格子广告
        adMgr.showGezi()
        this.score.string = '分数:' + gameConfig.score
    }
    // 返回首页
    backHome() {
        audioTool.ins.playSound('btn1')
        // 隐藏格子广告
        adMgr.hideGezi()
        // 存储分数
        save(local.level, gameConfig.level)
        save(local.LastScore, gameConfig.score)
        audioTool.ins.stopMusic()
        // 关闭弹窗动画
        donghuaTs.ins.popchuDh(this.UIPop, this.node)
        director.loadScene('home')

    }
    // 继续游戏
    jixuBtn() {
        audioTool.ins.playSound('btn1')
        // 隐藏格子广告
        adMgr.hideGezi()
        // 关闭弹窗动画
        donghuaTs.ins.popchuDh(this.UIPop, this.node)
        loadPool.ins.getPoolNode(perName.levePop, gameConfig.nodeRoot, new Vec3(600, 0, 0))
    }
}


