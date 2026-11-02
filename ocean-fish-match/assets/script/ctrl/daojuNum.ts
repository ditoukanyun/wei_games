import { _decorator, CCFloat, Component, director, Label, Node, Graphics, Color, UITransform } from 'cc';
import { gameConfig } from '../data/gameConfig';
import { emits } from '../data/enume';
const { ccclass, property } = _decorator;

@ccclass('daojuNum')
export class daojuNum extends Component {
    @property(Node) numNode: Node = null
    @property(Node) goumai: Node = null
    @property(Label) num: Label
    @property(CCFloat) daojuType: number;
    protected onEnable(): void {
        this.init()
        director.on(emits.daojuNum, this.init, this)
        director.on(emits.jinbiNum, this.init, this)
    }
    protected onDestroy(): void {
        director.off(emits.daojuNum, this.init, this)
        director.off(emits.jinbiNum, this.init, this)
    }
    init() {
        this.updateAppearance()
        switch (this.daojuType) {
            case 1:
                this.initRest()
                break
            case 2:
                this.initHammer()
                break
            case 3:
                this.initChange()
                break
        }
    }
    updateAppearance() {
        // Counts belong to the icon; the lower line is reserved for purchase price.
        this.numNode.setPosition(48, 48, 0);
        this.numNode.getComponent(UITransform).setContentSize(66, 44);
        let background = this.numNode.getChildByName('countBadge');
        if (!background) {
            background = new Node('countBadge');
            background.layer = this.node.layer;
            this.numNode.addChild(background);
            background.setSiblingIndex(0);
            background.addComponent(UITransform).setContentSize(66, 44);
            background.addComponent(Graphics);
        }
        const badge = background.getComponent(Graphics);
        badge.clear();
        badge.fillColor = new Color(255, 236, 190);
        badge.strokeColor = new Color(255, 250, 225);
        badge.lineWidth = 3;
        badge.roundRect(-33, -22, 66, 44, 22);
        badge.fill(); badge.stroke();
        this.num.fontSize = 26;
        this.num.lineHeight = 34;
        this.num.isBold = true;
        this.num.color = new Color(52, 100, 111);
        let ring = this.node.getChildByName('selectedTool');
        if (!ring) {
            ring = new Node('selectedTool');
            ring.layer = this.node.layer;
            this.node.addChild(ring);
            ring.setSiblingIndex(0);
            ring.addComponent(UITransform).setContentSize(140, 140);
            const g = ring.addComponent(Graphics);
            g.fillColor = new Color(255, 191, 85, 70);
            g.strokeColor = new Color(255, 213, 114);
            g.lineWidth = 6;
            g.circle(0, 0, 65);
            g.fill(); g.stroke();
        }
        ring.active = (this.daojuType === 2 && gameConfig.touchState === '1') ||
            (this.daojuType === 3 && gameConfig.touchState === '2');
        const scale = ring.active ? 1.06 : 1;
        this.node.setScale(scale, scale, 1);
    }
    initRest() {
        if (gameConfig.restNum > 0) {
            this.goumai.active = false
            this.numNode.active = true
            this.num.string = '×' + gameConfig.restNum
        } else {
            this.goumai.active = true
            this.numNode.active = false
        }
    }
    initHammer() {
        if (gameConfig.hammerNum > 0) {
            this.goumai.active = false
            this.numNode.active = true
            this.num.string = '×' + gameConfig.hammerNum
        } else {
            this.goumai.active = true
            this.numNode.active = false
        }
    }
    initChange() {
        if (gameConfig.changeNum > 0) {
            this.goumai.active = false
            this.numNode.active = true
            this.num.string = '×' + gameConfig.changeNum
        } else {
            this.goumai.active = true
            this.numNode.active = false
        }
    }
}


