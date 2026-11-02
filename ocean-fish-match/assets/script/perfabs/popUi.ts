import { _decorator, Component, director, Node } from 'cc';
import { emits } from '../data/enume';
import { loadPool } from '../getRes/loadPool';
const { ccclass, property } = _decorator;

@ccclass('popUi')
export class popUi extends Component {
    protected onEnable(): void {

    }
    chongxinBtn() {
        loadPool.ins.huiShouNode(this.node)
        director.emit(emits.chongxinGame)
    }
    backHomeBtn() {
        loadPool.ins.huiShouNode(this.node)
        director.loadScene('home')
    }
}


