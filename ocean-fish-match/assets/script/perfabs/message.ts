import { _decorator, Component, director, Label, Node, Tween, UIOpacity, v3 } from 'cc';
import { emits } from '../data/enume';
import { loadPool } from '../getRes/loadPool';
const { ccclass, property } = _decorator;

@ccclass('message')
export class message extends Component {
    // 文字
    @property(Label)
    text: Label = null;
    // 提示框主体的不透明度组件
    @property(UIOpacity)
    mess: UIOpacity = null;
    // 缓动
    tw = new Tween()
    onEnable(): void {
        // 监听弹窗事件
        director.on(emits.message, this.showMess, this);
        this.tw.target(this.mess);
        this.tw.to(0.8, { opacity: 255 }).delay(1.4).to(0.2, { opacity: 0 }).call(() => {
            loadPool.ins.huiShouNode(this.node)
        })
    }
    onDisable(): void {
        director.off(emits.message, this.showMess, this);
    }
    showMess(val) {
        this.text.string = val
        this.tw.start()
    }
}


