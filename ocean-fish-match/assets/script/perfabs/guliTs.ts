import { _decorator, Component, Node, tween, Vec3, UIOpacity, Tween } from 'cc';
import { loadPool } from '../getRes/loadPool';
const { ccclass, property } = _decorator;

@ccclass('guliTs')
export class guliTs extends Component {
    protected onEnable(): void {
        this.init()
    }

    init() {
        const opacity = this.node.getComponent(UIOpacity) || this.node.addComponent(UIOpacity);
        Tween.stopAllByTarget(this.node);
        Tween.stopAllByTarget(opacity);
        opacity.opacity = 255;
        this.node.setScale(0.65, 0.65, 1);
        tween(this.node).to(0.16, { scale: new Vec3(1.1, 1.1, 1) }, { easing: 'backOut' }).to(0.1, { scale: new Vec3(1, 1, 1) }).start();
        tween(opacity).delay(0.65).to(0.25, { opacity: 0 }).call(() => {
            loadPool.ins.huiShouNode(this.node);
        }).start();
    }
}


