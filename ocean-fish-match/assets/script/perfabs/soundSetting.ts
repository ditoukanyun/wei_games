import { _decorator, Component, Node, NodeEventType } from 'cc';
import { gameConfig } from '../data/gameConfig';
import { audioTool } from '../unitls/audioTool';
import { save } from '../unitls/tools';
import { local } from '../data/enume';
const { ccclass, property } = _decorator;

@ccclass('soundSetting')
export class soundSetting extends Component {
    protected onEnable(): void {
        this.node.on(NodeEventType.TOUCH_START, this.setSoundBtn, this)
        this.soundStatu()
    }

    protected onDestroy(): void {
        this.node.off(NodeEventType.TOUCH_START, this.setSoundBtn, this)
    }
    /**
  * 设置音量
  */
    setSoundBtn() {
        audioTool.ins.playSound('btn1')
        if (gameConfig.isSound) {
            gameConfig.isSound = 0
        } else {
            gameConfig.isSound = 1
        }
        this.soundStatu()
        save(local.isSound, gameConfig.isSound)

    }
    soundStatu() {
        if (gameConfig.isSound == 1) {
            this.node.getChildByName('on').active = false
            this.node.getChildByName('off').active = true
            gameConfig.bgmVol = 0.8
            audioTool.ins.setVolume(0.8)
        } else {
            this.node.getChildByName('on').active = true
            this.node.getChildByName('off').active = false
            gameConfig.bgmVol = 0
            audioTool.ins.setVolume(0)
        }
    }
}


