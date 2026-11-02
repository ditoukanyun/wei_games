import { adaptMobileWeb } from '../unitls/mobileAdaptation';
import { _decorator, Component, Node, Vec3 } from 'cc';
import { audioTool } from '../unitls/audioTool';
import { musicName, perName } from '../data/enume';
import { gameConfig } from '../data/gameConfig';
import { loadPool } from '../getRes/loadPool';
import { wxApi } from '../api/wxApi';
const { ccclass, property } = _decorator;

@ccclass('gameView')
export class gameView extends Component {
    start() {
        adaptMobileWeb();
        this.init()
    }

    init() {
        let zhezhao = this.node.getChildByName('zhezhao')
        zhezhao.active = true
        // 打开音乐
        audioTool.ins.playMusic(musicName.bgm)
        // 全局保存根节点
        gameConfig.nodeRoot = this.node
        // 开始提示
        loadPool.ins.getPoolNode(perName.levePop, gameConfig.nodeRoot, new Vec3(600, 0, 0))
        // 允许转发
        wxApi.ins.topZhuanfa()
        // BGM中断
        wxApi.ins.bgmZd(() => {
            audioTool.ins.playMusic(musicName.bgm)
        })
    }
}


