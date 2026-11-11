import { _decorator, Component, Node } from 'cc';
import { PinAction } from './PinAction';
import { EmptyHoleAction } from './EmptyHoleAction';
const { ccclass, property } = _decorator;

@ccclass('LayerEmptyAction')
export class LayerEmptyAction extends Component {
    start() {

    }

    

    public get_pin_by_color(color_id: number, pin_arr: PinAction[]) {
        this.node.children.forEach(empty_hole => {
            empty_hole.getComponent(EmptyHoleAction)?.get_pin_arr_by_color_id(color_id, pin_arr);
        });
    }

    public get_pin_arr(arr:PinAction[] = null):PinAction[]{
        // let arr:PinAction[] = [];
        if(!arr){
            arr = [];
        }
        for(let i = this.node.children.length-1;i>=0;i--){
            let empty_hole = this.node.children[i];
            let empty_hole_action = empty_hole.getComponent(EmptyHoleAction);
            if(empty_hole_action){
                empty_hole_action.get_pin_arr(arr);
            }
        }
        return arr;
    }

    public get_lock_num():number{
        // let arr:PinAction[] = [];
        let num:number = 0;
        for(let i = this.node.children.length-1;i>=0;i--){
            let empty_hole_action = this.node.children[i].getComponent(EmptyHoleAction);
            if(empty_hole_action?.isLocked){
                num++;
            }
        }
        return num;
    }


    public put_pin(pin: PinAction) {
        for(let i = this.node.children.length-1;i>=0;i--){
            let empty_hole_action = this.node.children[i].getComponent(EmptyHoleAction);
            if(empty_hole_action?.can_able_put()){
                if (empty_hole_action?.put_pin(pin)) {
                    //放入成功，结束
                    break;
                }
            }
        }
    }

    //true = 满了
    public is_pin_full():boolean{
        let ret = true;
        for(let i = 0 ;i<this.node.children.length;i++){
            let empty_hole = this.node.children[i];
            let empty_hole_action = empty_hole.getComponent(EmptyHoleAction);
            if(!empty_hole_action){
                continue;
            }
            if(empty_hole_action?.can_able_put()){
                //还可以放入，结束了
                ret = false;
                break;
            }
        }
        return ret;
    }

    //check 获取上锁的个数
    get_unlock_num():number{
        let num = 0;
        for(let i = this.node.children.length-1;i>=0;i--){
            // console.log("unlock_empty_hole  i:",i);
            let empty_hole = this.node.children[i];
            let empty_hole_action = empty_hole.getComponent(EmptyHoleAction);
            if(empty_hole_action?.isLocked){
                num++
            }
        }
        return num;
    }

    
    // public get_pin_arr(arr:PinAction[] = null): PinAction[] {

    unlock_empty_hole(){
        for(let i = this.node.children.length-1;i>=0;i--){
            // console.log("unlock_empty_hole  i:",i);
            let empty_hole = this.node.children[i];
            let empty_hole_action = empty_hole.getComponent(EmptyHoleAction);
            if(empty_hole_action?.isLocked){
                empty_hole_action.unlock_hole(null);
                break;
            }
        }
    }



    public init_empty() {
        this.node.children.forEach(empty_hole => {
            empty_hole.getComponent(EmptyHoleAction)?.init_empty_hole();
        });
    }
}

