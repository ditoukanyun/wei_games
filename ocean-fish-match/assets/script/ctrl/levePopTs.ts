import { _decorator, Component, director, Label, Node, tween, v3, Color, Graphics, UITransform } from 'cc';
import { gameConfig } from '../data/gameConfig';
import { emits, local } from '../data/enume';
import { loadPool } from '../getRes/loadPool';
import { save } from '../unitls/tools';
const { ccclass, property } = _decorator;

@ccclass('levePopTs')
export class levePopTs extends Component {
    @property(Label) level: Label = null
    @property(Label) mubiao: Label = null
    /**
     * 开始游戏及下一关分数
     */
    protected onEnable(): void {
        // Keep the entrance message readable against every board/background.
        let plate = this.node.getChildByName('contrastPlate');
        if (!plate) {
            plate = new Node('contrastPlate');
            plate.layer = this.node.layer;
            this.node.addChild(plate);
            plate.setPosition(0, -30, 0);
            plate.addComponent(UITransform).setContentSize(480, 190);
            const graphics = plate.addComponent(Graphics);
            graphics.fillColor = new Color(9, 63, 79, 238);
            graphics.strokeColor = new Color(169, 232, 225, 255);
            graphics.lineWidth = 3;
            graphics.roundRect(-240, -95, 480, 190, 28);
            graphics.fill();
            graphics.stroke();
            plate.setSiblingIndex(0);
        }
        this.level.color = new Color(255, 252, 238);
        this.level.fontSize = 44;
        this.level.node.setPosition(0, 8, 0);
        this.mubiao.color = new Color(255, 221, 135);
        this.mubiao.fontSize = 34;
        this.mubiao.node.setPosition(0, -62, 0);
        // 提示文字
        this.level.string = '第 ' + gameConfig.level + ' 关'
        this.mubiao.string = '目标分数  ' + gameConfig.needScore
        // 文字动画
        tween(this.node).to(0.5, { position: v3(0, 0, 0) }).delay(1.2).to(0.5, { position: v3(-700, 0, 0) }).call(() => {
            director.emit(emits.initItem)
            loadPool.ins.huiShouNode(this.node)
        }).start()
    }

}


