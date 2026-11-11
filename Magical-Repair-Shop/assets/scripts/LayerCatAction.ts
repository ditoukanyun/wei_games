import { _decorator, Component, director, Node } from 'cc';
import { CatAction } from './CatAction';
import { PinAction } from './PinAction';
import { ColorDate } from './ColorDate';
import { events } from './Enums';
const { ccclass, property } = _decorator;

@ccclass('LayerCatAction')
export class LayerCatAction extends Component {

    onLoad(): void {
        director.on(events.check_empty_hole, this.check_empty_hole, this);
    }
    onDestroy(): void {
        director.off(events.check_empty_hole, this.check_empty_hole, this);
    }

    start() {

    }

    


    //put a pin to slot by pin_color
    public put_pin(pin:PinAction):boolean{
        let target:CatAction = this.preput_to_cat(pin);
        if(target){
            return target.put_pin(pin);
        }
        return false;
    }

    public preput_to_cat(pin:PinAction):CatAction{
        let can_move_arr:CatAction[] = [];
        this.node.children.forEach(slot => {
            if(slot.getComponent(CatAction).check_able_put(pin)){
                can_move_arr.push(slot.getComponent(CatAction));
            }
        });
        let target:CatAction = null;
        can_move_arr.forEach(element => {
            if(!target){
                target = element;
            }else{
                if(element.get_temp_hole_num()<target.get_temp_hole_num()){
                    target = element;
                }
            }
           
        });
        return target;
    }



    public has_pending_moves(): boolean {
        return this.node.children.some(slot => {
            const cat = slot.getComponent(CatAction);
            return cat && !cat.isLocked && !!cat.cat_color &&
                (cat.is_flying || cat.get_temp_hole_num() === 0);
        });
    }

    public init_cat(){
        this.node.children.forEach(slot => {
            slot.getComponent(CatAction)?.init_cat();
            // slot.getComponent(CatAction)?.into_scence();
        });
    }

    public get_cat_color_arr(){
        let arr:ColorDate[] = [];
        this.node.children.forEach(slot => {
            if(slot.getComponent(CatAction)){
               let color =  slot.getComponent(CatAction).get_cat_color();
               if(color){
                arr.push(color);
               }
            }
        });
        return arr;
    }

    //获取带所有的 cat
    public get_locked_cat():Node[]{
        let arr:Node[] = [];
        this.node.children.forEach(cat => {
            if(cat.getComponent(CatAction).isLocked){
                arr.push(cat);
            }
        });
        return arr;  
    }


    check_empty_hole(pin: PinAction){
        let cat = this.preput_to_cat(pin);
        if(cat){
            // console.log("收到消息，放入数据，，，");
            cat.load_pin();
        }
       
    }

    
}

