import { _decorator, Button, Component, Label, Node } from 'cc';
import { Props3Action } from './Props3Action';
import { Props1Action } from './Props1Action';
import { AudioManger } from './AudioManger';
import { Clips } from './Enums';
import { Props2Action } from './Props2Action';
import { BasePage } from './BasePage';
import { Props4Action } from './Props4Action';
import { CatAction } from './CatAction';
import { Global } from './Global';
import { AdManger } from './ad/AdManger';
const { ccclass, property } = _decorator;

@ccclass('PropsAction')
export class PropsAction extends BasePage {

    @property(Props3Action)
    props3_Action: Props3Action = null;

    @property(Props1Action)
    props1_Action: Props1Action = null;

    @property(Props2Action)
    props2_Action: Props2Action = null;

    @property(Props4Action)
    props4_Action: Props4Action = null;

    @property(Label)
    coins_label: Label = null;



    @property(Node)
    btn_close: Node = null;
    @property(Node)
    btn_continue: Node = null;

    // @property([Node])
    // btn_arr:Node[] = [];

    @property({type:[Node]})
    btns_arr:Node[] = [];


    start() {
        super.start();
    }

    

    //show menu 
    open(btn_num: number = 0) {
        super.open();
        this.set_child_active_false();
        switch (btn_num) {
            case 1:
                this.props1_Action.node.active = true;
                this.props1_Action.open();
                break;
            case 2:
                this.props2_Action.node.active = true;
                this.props2_Action.open();
                break;
            case 3:
                this.props3_Action.node.active = true;
                this.props3_Action.open();
                break;
            case 4:
                this.props4_Action.node.active = true;
                this.props4_Action.open();
                break;
        }
        this.coins_label.string = Global.cur_coins+"";
        //
        this.unscheduleAllCallbacks();
        if (this.btn_close) this.btn_close.active = true;
        if (this.btn_continue) this.btn_continue.active = true;
        this.btns_arr?.forEach(btn => btn.active = true);
    }

    show_box(cat_action:CatAction){
        this.open(4);
        this.props4_Action.show_box(cat_action);
    }

    private set_child_active_false() {
        this.props1_Action.node.active = false;
        this.props2_Action.node.active = false;
        this.props3_Action.node.active = false;
        this.props4_Action.node.active = false;
    }


    close() {
        this.set_child_active_false();
        super.close();
        AdManger.show_interstial();
    }
}

