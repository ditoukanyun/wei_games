import { _decorator, Component, director, find, Node, NodeEventType, Sprite, UITransform, Vec3 } from 'cc';
import { gameConfig } from '../data/gameConfig';
import { emits, local } from '../data/enume';
import { save } from '../unitls/tools';
import { FactoryItem } from './FactoryItem';
import { uiMain } from './uiMain';
import { Item } from '../perfabs/Item';
const { ccclass, property } = _decorator;
@ccclass('changePanel')
export class changePanel extends Component {
    // 显示选择的4个元素节点
    @property(Node) uiItem: Node[] = []
    FactoryItem: FactoryItem
    UiMainTs: uiMain
    // 当前选中的元素
    Item = null
    protected onLoad(): void {
        this.FactoryItem = find('Canvas/Gaming').getComponent(FactoryItem)
        this.UiMainTs = find('Canvas/Gaming/UImain').getComponent(uiMain)
    }
    start() {
        this.init()
    }

    init() {
        // 可选元素1
        this.uiItem[0].on(NodeEventType.TOUCH_START, () => { this.EventUI(0) }, this)
        // 可选元素2
        this.uiItem[1].on(NodeEventType.TOUCH_START, () => { this.EventUI(1) }, this)
        // 可选元素3
        this.uiItem[2].on(NodeEventType.TOUCH_START, () => { this.EventUI(2) }, this)
        // 可选元素4
        this.uiItem[3].on(NodeEventType.TOUCH_START, () => { this.EventUI(3) }, this)
    }
    /**
     * 显示选择UI
     * @param item 
     */
    ShowUI(Item) {
        this.node.active = true;
        this.Item = Item;
        let colorType: any = Item.getComponent('Item')._ColorType;
        let ImgList = this.FactoryItem.ColorList;
        var index = -1;
        for (var i = 0; i < ImgList.length; i++) {
            if (colorType == i) {
                continue;
            }
            index++;
            this.uiItem[index].getComponent(Sprite).spriteFrame = ImgList[i];
            this.uiItem[index].m_ID = i;
        }

        var pos = Item.getComponent(UITransform).convertToWorldSpaceAR(new Vec3(-375, -677, 0));
        if (pos.x > 110) {
            pos.x = 110;
        } else if (pos.x < -130) {
            pos.x = -130;
        }
        pos.y -= 500;
        this.node.setPosition(pos);
    }
    /**
     * 选择元素
     * @param index 
     */
    EventUI(index: number) {
        //   更新项目的图标
        this.Item.getComponent(Sprite).spriteFrame =
            this.uiItem[index].getComponent(Sprite).spriteFrame;
        //   更新项目的颜色类型
        this.Item.getComponent("Item")._ColorType = this.uiItem[index].m_ID;
        //   隐藏当前节点
        this.node.active = false;
        //   重置触摸状态:
        gameConfig.touchState = "";
        if (gameConfig.changeNum > 0) {
            gameConfig.changeNum -= 1
            director.emit(emits.daojuNum)
            save(local.changeNum, gameConfig.changeNum)
        } else {
            if (gameConfig.jinbi >= 50) {
                gameConfig.jinbi -= 50
                director.emit(emits.jinbiNum)
            } else {
                console.log('金币不够');
            }
        }
        this.UiMainTs.CancelProps()
    }
    /**
     * 取消显示
     */
    hidden() {
        this.UiMainTs.CancelProps()
        this.node.active = false
    }
}


