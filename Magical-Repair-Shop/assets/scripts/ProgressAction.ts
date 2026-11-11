import { _decorator, Component, Label, Node, Sprite } from 'cc';
import { Global } from './Global';
const { ccclass, property } = _decorator;

@ccclass('ProgressAction')
export class ProgressAction extends Component {
    @property({type:Node}) level_progress: Node;
    @property({type:Node}) particle: Node;
    private dt = 0;
    private previous = -1;
    private previousTotal = -1;
    update(deltaTime: number) {
        this.dt += deltaTime;
        if (this.dt < 0.1) return;
        this.dt = 0;
        const total = Global.cur_lvl_pin_total;
        const moved = Global.cur_lvl_pin_move_num;
        const ratio = total > 0 ? Math.max(0, Math.min(1, moved / total)) : 0;
        if (ratio === this.previous && total === this.previousTotal) return;
        this.previous = ratio;
        this.previousTotal = total;
        const bar = this.level_progress?.getComponent(Sprite);
        if (bar) bar.fillRange = ratio;
        const counter = this.node.parent?.getChildByName('WorkshopProgressCount')?.getComponent(Label);
        if (counter) counter.string = `${moved} / ${total}`;
    }
}
