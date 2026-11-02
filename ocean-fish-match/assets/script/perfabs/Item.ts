import {
    _decorator,
    CCFloat,
    Component,
    director,
    find,
    Node,
    NodeEventType,
    SpriteFrame,
    tween,
    UITransform,
    v2,
    Vec2,
    Vec3,
} from "cc";
import { gameConfig } from "../data/gameConfig";
import { emits, local, musicName, perName } from "../data/enume";
import { audioTool } from "../unitls/audioTool";
import { loadPool } from "../getRes/loadPool";
import { save } from "../unitls/tools";
import { FactoryItem } from "../ctrl/FactoryItem";
import { donghuaTs } from "../ctrl/donghuaTs";
const { ccclass, property } = _decorator;
@ccclass("Item")
export class Item extends Component {
    Horizontal = 10
    Vertical = 10
    // 消除粒子样式
    // 元素类型数组
    @property(SpriteFrame)
    liziStyleList = []
    @property(Node) LightUI: Node
    _isHasBox = false
    _OtherItemList = []
    _ID = -1
    _ColorType = -1
    _isDestory = false
    _isAlreadyDetection = false
    LUDRList = []
    _X = null
    _Y = null
    FactoryItem: FactoryItem
    onEnable(): void {
        this.FactoryItem = find('Canvas/Gaming').getComponent(FactoryItem)
        this.node.on(NodeEventType.TOUCH_START, this.ItemClick, this);
    }

    start() {
        this.node.on(NodeEventType.TOUCH_START, this.ItemClick, this)
    }
    /**
     * 用于处理项目（Item）的点击事件
     */
    ItemClick() {
        var self = this;
        // FactoryItem.Instance._IsTouch 是否为 true，表示可以响应触摸事件
        // 检查 FactoryItem.Instance.IsGameStart 是否为 true，表示游戏已经开始
        if (this.FactoryItem._IsTouch && this.FactoryItem.IsGameStart) {
            // 表示暂时禁用触摸响应
            this.FactoryItem._IsTouch = false;
            // 方法停止提示动画
            this.FactoryItem.StopPromptAnimation();
            switch (gameConfig.touchState) {
                case "":
                    self.TouchNormal();
                    break;
                case "1":
                    self.TouchHammer(this.node);
                    break;
                case "2":
                    self.TouchChange(this.node);
                    break;
                default:
                    this.FactoryItem._IsTouch = true;
                    break;
            }
        }
    }
    /**
     * 处理普通的触摸事件
     */
    TouchNormal() {
        //   创建两个 scaleTo 动作，使物品节点缩小到 0.8 倍的原始大小，然后恢复到原始大小。
        tween(this.node)
            .to(0.05, { scale: new Vec3(0.8, 0.8, 0.8) })
            .to(0.05, { scale: new Vec3(1, 1, 2) })
            .call(() => {
                this.FindSameItem(true)
            })
            .start();
    }


    /**
     * 使用道具消除一个元素
     */
    TouchHammer(item) {
        director.emit(emits.daojuTishi)
        //   调用 HammerProps 方法来应用锤子道具的效果。
        this.FactoryItem.HammerProps(item);
        //   重置 _TouchState。
        if (gameConfig.hammerNum > 0) {
            gameConfig.hammerNum -= 1
            // 销毁提示
            director.emit(emits.daojuNum)
            save(local.hammerNum, gameConfig.hammerNum)
        } else {
            if (gameConfig.jinbi >= 50) {
                gameConfig.jinbi -= 50
                director.emit(emits.jinbiNum)
            } else {
                console.log('金币不够');
            }
        }
        this.FactoryItem._IsTouch = true;
    }
    /**
   * 使用道具更换一个元素的颜色类型
   */
    TouchChange(item) {
        director.emit(emits.daojuTishi)
        //   调用 HammerProps 方法来应用锤子道具的效果。
        this.FactoryItem.ChangeProps(item);
        this.FactoryItem._IsTouch = true;
    }
    /**
     * 元素索引
     * @param X 
     * @param Y 
     */
    setXY(X, Y) {
        this._X = X;
        this._Y = Y;
    }

    //得到上下左右
    GetLUDR(IshasMyself = true) {
        this.LUDRList = [];

        var _itemList = this.FactoryItem.allVerticalList;

        var i = this._X;
        var j = this._Y;

        if (_itemList[i][j] == this.node) {
            if (IshasMyself) {
                this.LUDRList.push(this.node);
            }
            if (i - 1 >= 0) {
                var left = _itemList[i - 1][j];
                if (left != null) this.LUDRList.push(left);
            }
            if (_itemList.length > i + 1) {
                var Right = _itemList[i + 1][j];
                if (Right != null) this.LUDRList.push(Right);
            }
            if (j - 1 >= 0) {
                var Up = _itemList[i][j - 1];
                if (Up != null) this.LUDRList.push(Up);
            }

            if (_itemList[i].length > j + 1) {
                var Down = _itemList[i][j + 1];
                if (Down != null) {
                    this.LUDRList.push(Down);
                }
            }
        } else {
            console.log("获取相邻物品失败", _itemList[i][j]);
        }
    }
    /**
     * 查找具有相同颜色类型的物品
     * @param {*} IsMianItem
     * @returns
     */
    FindSameItem(IsMianItem = false) {
        // 检查游戏是否已经开始，如果游戏尚未开始，直接返回，不执行后续逻辑
        if (this.FactoryItem.IsGameStart == false) return;
        // 调用 GetLUDR 方法获取当前项目的上下左右相邻项目，并将它们存储在 this.LUDRList 中。
        this.GetLUDR();
        // 遍历 this.LUDRList 中的每一个相邻项目
        for (var i = 0; i < this.LUDRList.length; i++) {
            // 获取相邻项目的 Item 组件
            var ItemCom = this.LUDRList[i].getComponent("Item");
            // 检查相邻项目的颜色类型是否与当前项目相同
            if (ItemCom._ColorType == this._ColorType) {
                // 如果颜色类型相同，调用 FactoryItem.Instance.AddCheckItem 方法将相邻项目添加到检查列表中，并获取当前检查列表的长度
                var count = this.FactoryItem.AddCheckItem(this.LUDRList[i]);
                // 如果检查列表的长度大于等于 2，递归调用 ItemCom.FindSameItem 方法继续查找相同的项目。
                if (count >= 2) {
                    ItemCom.FindSameItem();
                }
            }
        }
        // 如果 IsMianItem 为 true，表示当前项目是主项目
        if (IsMianItem) {
            // 如果长度大于等于 2，调用 FactoryItem.Instance.ClearCheckItem 方法清除检查列表。
            if (this.FactoryItem._CheckItem.length >= 2) {
                this.FactoryItem.ClearCheckItem();
            } else {
                // 否则，调用 FactoryItem.Instance.ClearCheckLight 方法清除检查光标
                this.FactoryItem.ClearCheckLight();
            }
        }
    }

    //检查相同的Item
    detectionSameItem(IsMianItem = true, isOnlydetection = false) {
        if (this.FactoryItem.IsGameStart == false) return;
        this.GetLUDR(false);
        for (var i = 0; i < this.LUDRList.length; i++) {
            var ItemCom = this.LUDRList[i].getComponent("Item");
            if (ItemCom._ColorType == this._ColorType) {
                if (isOnlydetection && this.LUDRList[i] != this.node) {
                    return false;
                }
                if (!this.FactoryItem.AddMaxItem(this.LUDRList[i])) {
                    ItemCom.detectionSameItem(false);
                }
            }
        }
        if (IsMianItem) {
            this.FactoryItem.CompareItemList();
        }
    }

    //提示星星的动画
    PromptAnimation() {
        console.log('提示动画');
    }
    //停止提示星星的动画
    StopPromptAnimation() {
        console.log('停止提示动画');
    }

    //星星消失动画
    PlayDestoryAnimation(isplayEffect = true) {
        audioTool.ins.playSound(musicName.xiao)
        if (isplayEffect) {
            donghuaTs.ins.xiaoChuLizi(this.node.position, this.liziStyleList[this._ColorType])
        }
        this.node.active = false;
    }

    ShowLight() {
        this.LightUI.active = true;
    }
    /**
     * 用于隐藏项目（Item）的高亮效果和盒子效果
     */
    HideLight() {
        // 隐藏高亮效果
        this.LightUI.active = false;
    }

}
