import { _decorator, Component, director, Node, Prefab, tween, UITransform, v3, Vec3 } from 'cc';
import { gameConfig } from '../data/gameConfig';
import { emits, perName } from '../data/enume';
import { FactoryItem } from './FactoryItem';
const { ccclass, property } = _decorator;
@ccclass('gameInit')
export class gameInit extends Component {
    // 所有元素的位置
    @property(Node) ItemLayout: Node;
    // 元素生成的父节点
    @property(Node) itemParent: Node;
    FactoryItem: FactoryItem
    protected onLoad(): void {
        this.startInit()
    }
    start() {
        // 游戏未开始
        gameConfig.IsGameStart = false
        // 游戏开始
        this.FactoryItem = this.node.getChildByName('Gaming').getComponent(FactoryItem)
        director.on(emits.initItem, this.Init, this)
    }

    protected onDestroy(): void {
        this.unscheduleAllCallbacks()
        director.off(emits.initItem, this.Init, this)
    }
    /**
     * 初始化
     */
    startInit() {
        gameConfig.itemNode = this.itemParent
    }
    /**
     * 游戏元素初始化
     * @param isEasy 
     */
    Init(isEasy = false) {
        // 获取游戏内元素预定位置。
        let ItemlayoutChildren = this.ItemLayout.children;
        // 初始化 allVerticalList 数组，用于存储垂直列表
        this.FactoryItem.allVerticalList = new Array()
        // 生成一个介于 0 到 3 之间的随机整数 WeightIndex，这个值可能用于后续计算中决定某些元素的权重。
        let WeightIndex = Math.floor(Math.random() * 4);
        // 生成一个 0 到 99 之间的随机整数 value
        var value = Math.floor(Math.random() * 100);
        //   遍历所有子节点，从 99 到 0
        for (var i = 99; i >= 0; i--) {
            //   worldPos1 获取子节点的世界坐标
            // var worldPos1 = ItemlayoutChildren[i].getComponent(UITransform).convertToWorldSpaceAR(
            //     v3(0, 0, 0)
            // );
            var worldPos1 = ItemlayoutChildren[i].position
            // // 将世界坐标的 x 和 y 值保留一位小数
            var numx = Number(worldPos1.x.toFixed(1));
            var numy = Number(worldPos1.y.toFixed(1));
            // //   创建一个新的 cc.v2 对象，表示世界坐标
            var worldPos = v3(numx, numy, 0);
            // 调用 LevelDiffcultValue 方法获取当前项的索引，根据难度进行调整
            var index = this.LevelDiffcultValue(WeightIndex, isEasy);
            //   调用 FactoryItem.Instance.CreatItem 方法创建一个新的游戏项
            var Item = this.FactoryItem.CreatItem(worldPos, i, index);
            //   获取游戏项的 Item 组件
            var ItemCom: any = Item.getComponent('Item');
            ItemCom.IsGameStart = false;
            // 生成动画
            var time = 0.01 * (100 - i) + 0.1;
            tween(Item).to(time, { position: worldPos }).start()
        }
        // 调用 setItemXY 和 GetDis 方法来完成最后的初始化工作。
        this.FactoryItem.setItemXY();
        this.FactoryItem.GetDis();
        this.scheduleOnce(() => { gameConfig.IsGameStart = true }, 1)
    }
    /**
 * 用来为游戏或其他应用程序生成具有一定概率分布的随机数
 */
    LevelDiffcultValue(WeightIndex, isEasy = false) {
        let DiffWeight = null
        let index = null
        if (isEasy) {
            DiffWeight = 0.25;
        } else {
            // 根据玩家的等级 (level) 设置 DiffWeight
            DiffWeight = 0.1;
            let level = gameConfig.level
            // 如果 level 小于等于 10，则 DiffWeight 为 0.2。
            if (level <= 10) {
                DiffWeight = 0.2;
            } else if (level > 10 && level <= 20) {
                // 如果 level 大于 10 且小于等于 20，则 DiffWeight 为 0.15。
                DiffWeight = 0.15;
            } else {
                // 如果 level 大于 20，则 DiffWeight 为 0.1。
                DiffWeight = 0.1;
            }
        }
        // WeightIndex 为 -1，则直接生成一个 [0, 4] 区间内的随机整数作为 index。
        if (WeightIndex == -1) {
            index = Math.floor(Math.random() * 5);
        } else {
            // 生成一个 [0, 1) 区间的随机浮点数 randomValue
            let randomValue = Math.random() * 1;
            // 如果 randomValue 小于 DiffWeight，则 index 设为 WeightIndex。
            if (randomValue < DiffWeight) {
                index = WeightIndex;
            } else if (randomValue >= DiffWeight && randomValue < 2 * DiffWeight) {
                // 如果 randomValue 大于等于 DiffWeight 且小于 2 * DiffWeight，则 index 设为 WeightIndex + 1。
                index = WeightIndex + 1;
            } else {
                // 否则，即当 randomValue 大于等于 2 * DiffWeight 或者 randomValue 不满足上述条件时，再次生成一个 [0, 4] 区间内的随机整数作为 index。
                index = Math.floor(Math.random() * 5);
            }
        }
        // 返回计算得到的 index 值。
        return index;
    }
}


