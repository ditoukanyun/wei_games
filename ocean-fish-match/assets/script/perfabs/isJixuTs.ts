import { _decorator, Component, director, Node } from 'cc';
import { audioTool } from '../unitls/audioTool';
import { load, save } from '../unitls/tools';
import { local } from '../data/enume';
import { gameConfig } from '../data/gameConfig';
import { loadPool } from '../getRes/loadPool';
const { ccclass, property } = _decorator;

@ccclass('isJixuTs')
export class isJixuTs extends Component {
    // 继续
    yesBtn() {
        gameConfig.score = load(local.LastScore)
        audioTool.ins.stopMusic()
        director.loadScene('game')
        loadPool.ins.huiShouNode(this.node)
    }
    // 重新开始
    noBtn() {
        gameConfig.level = 1
        gameConfig.LastScore = 0
        gameConfig.needScore = 1000
        // 存储数据
        save(local.level, gameConfig.level)
        save(local.LastScore, gameConfig.LastScore)
        save(local.needScore, gameConfig.needScore)
        director.loadScene('game')
        loadPool.ins.huiShouNode(this.node)
    }
}


