import { _decorator, Component, director, Node, Sprite, Label, Color, Graphics, UITransform } from 'cc';
import { emits } from '../data/enume';
import { loadPool } from '../getRes/loadPool';
const { ccclass } = _decorator;

@ccclass('daojuTishi')
export class daojuTishi extends Component {
    private dismiss = () => loadPool.ins.huiShouNode(this.node);
    protected onEnable(): void {
        const legacy = this.node.getComponent(Sprite);
        if (legacy) legacy.enabled = false;
        let plate = this.node.getChildByName('hintPlate');
        if (!plate) {
            plate = new Node('hintPlate');
            plate.layer = this.node.layer;
            this.node.addChild(plate);
            plate.addComponent(UITransform).setContentSize(480, 72);
            const graphics = plate.addComponent(Graphics);
            graphics.fillColor = new Color(15, 70, 86, 242);
            graphics.strokeColor = new Color(166, 225, 213);
            graphics.lineWidth = 2;
            graphics.roundRect(-240, -36, 480, 72, 22);
            graphics.fill();
            graphics.stroke();
            const text = new Node('hintText');
            text.layer = this.node.layer;
            this.node.addChild(text);
            text.setPosition(0, 0, 0);
            const label = text.addComponent(Label);
            label.fontSize = 26;
            label.lineHeight = 38;
            label.isBold = true;
            label.color = new Color(255, 249, 225);

        }
        this.node.getChildByName('hintText').getComponent(Label).string =
            this.node.name === 'changeTishi' ? '换色：点击一个伙伴' : '珊瑚锤：点击一个伙伴';
        director.on(emits.daojuTishi, this.dismiss, this);
    }
    protected onDisable(): void {
        director.off(emits.daojuTishi, this.dismiss, this);
    }
}
