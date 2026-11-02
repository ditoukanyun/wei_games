import { _decorator, Component, director, Node, Size, tween, UITransform, v2, Vec2 } from 'cc';
import { audioTool } from './audioTool';
const { ccclass, property } = _decorator;

@ccclass('tuichuDhTs')
export class tuichuDhTs extends Component {
    protected onEnable(): void {
        this.init()
    }

    init() {
        let size = this.node.getComponent(UITransform)
        tween(size).to(0.1, { contentSize: new Size(1900, 1900) }).to(0.5, { contentSize: new Size(0, 0) }).call(() => { this.tuichu() }).start()
    }
    tuichu() {
        audioTool.ins.stopMusic()
        director.loadScene("game")
    }
}


