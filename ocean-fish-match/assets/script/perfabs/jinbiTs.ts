import { _decorator, Component, director, Label, Node, Vec3 } from 'cc';
import { gameConfig } from '../data/gameConfig';
import { emits, local, perName } from '../data/enume';
import { save } from '../unitls/tools';
import { loadPool } from '../getRes/loadPool';
const { ccclass, property } = _decorator;

@ccclass('jinbiTs')
export class jinbiTs extends Component {
    @property(Label) jinbiNum: Label = null
    protected onEnable(): void {
        this.init()
        director.on(emits.jinbiNum, this.init, this)
    }
    protected onDestroy(): void {
        director.off(emits.jinbiNum, this.init, this)
    }
    init() {
        // 更新金币显示并缓存
        this.jinbiNum.string = String(gameConfig.jinbi)
        save(local.jinbi, gameConfig.jinbi)
    }
    /**
    * 购买金币
    */
    byJinbi() {
        loadPool.ins.getPoolNode(perName.shopPop, this.node.parent)
    }
}


