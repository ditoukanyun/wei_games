import { _decorator, Component, Node } from 'cc';
import { DataModel } from './DataModel';
import { LayerAction } from './LayerAction';
import { ColorDate } from './ColorDate';
import { PinAction } from './PinAction';
const { ccclass, property } = _decorator;

@ccclass('UnitAction')
export class UnitAction extends Component {
    start() {

    }

    
 
    get_hole_num(): number {
        let hole_num: number = 0;
        this.node.children.forEach(layer_node => {
            let num = layer_node.getComponent(LayerAction).get_hole_num();
            hole_num += num;
        });
        return hole_num;
    }


}

