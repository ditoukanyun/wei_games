import { _decorator, Component, Label, Node } from 'cc';
import { Clips } from './Enums';
import { AudioManger } from './AudioManger';
import { Global } from './Global';
const { ccclass, property } = _decorator;

@ccclass('BtnAction')
export class BtnAction extends Component {
    @property({type:Number})
    index:number;
    start() {
    }

    

    //开启一个空位
    unlock_empty_hole() {
        AudioManger.instance.playSound(Clips.btn_1);
        Global.props_action.open(1);
    }

    random_pin() {
        AudioManger.instance.playSound(Clips.btn_1);
        Global.props_action.open(2);

    }

    clear_slot() {
        AudioManger.instance.playSound(Clips.btn_1);
        Global.props_action.open(3);

    }
}

