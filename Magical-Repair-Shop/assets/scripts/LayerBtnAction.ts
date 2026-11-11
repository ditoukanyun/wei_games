import { _decorator, Button, Component, Node } from 'cc';
import { Global } from './Global';
const { ccclass, property } = _decorator;

@ccclass('LayerBtnAction')
export class LayerBtnAction extends Component {
    start() {
    }

    

    get_button_arr():Node[]{
        return this.node.children;
    }
}

