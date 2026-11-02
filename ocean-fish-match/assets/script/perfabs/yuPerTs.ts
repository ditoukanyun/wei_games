import { _decorator, Component, Node, tween, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('yuPerTs')
export class yuPerTs extends Component {

    protected onEnable(): void {
        this.init()
    }
    init() {
        tween(this.node).by(10, { position: new Vec3(-900, 0, 0) }).call(() => (this.node.destroy())).start()
    }
}


