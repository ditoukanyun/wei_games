import { _decorator, Component, Label, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('flyItemTs')
export class flyItemTs extends Component {
    // 飞行分数显示
    @property(Label) scoreLab: Label
    start() {
    }
    xiugaiScore(val: any) {
        this.scoreLab.string = val + ''
    }
}


