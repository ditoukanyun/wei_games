import { _decorator, Component, Label, Node } from 'cc';
import { Global } from './Global';
const { ccclass, property } = _decorator;

@ccclass('ShowLevelAction')
export class ShowLevelAction extends Component {

    @property({type:Label})
    level_label:Label = null;

    start() {

    }

    

    show_level(){
        this.level_label.string = `第 ${Global.cur_lvl} 关`;
    }
}

