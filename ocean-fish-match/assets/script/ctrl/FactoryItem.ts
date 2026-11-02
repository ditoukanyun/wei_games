import { _decorator, CCFloat, Component, director, instantiate, log, Node, NodePool, Prefab, Script, Sprite, SpriteFrame, tween, UITransform, v2, v3, Vec3 } from 'cc';
import { loadPool } from '../getRes/loadPool';
import { emits, musicName, perName } from '../data/enume';
import { gameConfig } from '../data/gameConfig';
import { audioTool } from '../unitls/audioTool';
import { Item } from '../perfabs/Item';
import { uiMain } from './uiMain';
import { gameInit } from './gameInit';
const { ccclass, property } = _decorator;
@ccclass('FactoryItem')
export class FactoryItem extends Component {
    // 元素预制体
    @property(Prefab)
    ItemPrefabs: Prefab
    // 元素类型数组
    @property(SpriteFrame)
    ColorList = []
    // 更换元素节点
    @property(Node) changePanel: Node
    // 每一列数量
    across: number = 10
    UIMian: Node
    //当前收益最大的数组
    _ItemMaxList = []
    // 冷却时间的计时器
    PromptCoolTime = 5
    constCoolTime = 3
    _PromptCoolTime = 2
    //选中的Item
    _CheckItem = []
    isGameOver = false
    _StartMoveDis = 300
    // 是否是重置状态
    isReset = false
    isRunMax = true
    _index = 0
    IsGameStart = false
    // 是否可以点击
    _IsTouch = false
    // 偏移量
    @property(CCFloat)
    Disx: number = 70;
    @property(CCFloat)
    Disy: number = 70;
    ItemLastCom = undefined
    _DetectionItem = []
    // 玩家可以消除
    isPutCanDesing = false
    // 道具类型,道具状态 ""：正常 "1"：锤子 "2":...
    // _TouchState = ''
    // 进度条
    @property(Node) barScoreNode: Node;
    // 用于存储垂直列表
    allVerticalList = new Array()
    // 元素生成的父节点
    @property(Node) ItemParent: Node;
    // 脚本
    uimainTs: uiMain
    gameInitTs: gameInit
    // ----------------------------------

    protected onLoad(): void {
        this.uimainTs = this.node.getChildByName('UImain').getComponent(uiMain)
        this.gameInitTs = this.node.parent.getComponent(gameInit)
        this._StartMoveDis = 1000;
    }
    start() {

    }

    /**
   * 用于在游戏中设置一些初始状态，并在一段时间后触发某些操作
   */
    GetDis() {
        var self = this;
        this.scheduleOnce(function () {
            // 设置 IsGameStart 为 true，表示游戏已经开始
            self.IsGameStart = true;
            // 表示可以响应触摸事件
            self._IsTouch = true;
            // 设置 _PromptCoolTime 为 constCoolTime，初始化提示冷却时间
            self._PromptCoolTime = self.constCoolTime;
            // 清空 _CheckItem 数组，表示清除检查项
            self._CheckItem.length = 0;
            //self.ChildrenRankCom.ShowOne();
        }, 1.5);
        // 置 isGameOver 为 false，表示游戏尚未结束
        this.isGameOver = false;
    }
    /**
     * 开局生成元素
     * @param {*} pos 生成位置
     * @param {*} num 编号
     * @param {*} index 颜色类型
     * @returns
     */
    CreatItem(pos, num, index) {
        // 检查 ItemParent 节点下的子节点数量是否达到 100 个
        // 如果已经达到 100 个，复用已有的项目（this.ItemParent.children[num]）
        // 否则，使用 cc.instantiate 方法创建一个新的项目实例
        let item = loadPool.ins.getPoolNode(perName.item)
        // 将项目节点设置为激活状态
        item.active = true;
        // 设置项目的位置，pos 是传入的位置，this._StartMoveDis 是初始移动距离。
        item.setPosition(v3(pos.x, pos.y + this._StartMoveDis, 0));
        // 将项目的缩放比例设置为 1。
        item.setScale(1, 1);
        // 将项目的父节点设置为 ItemParent。
        item.parent = this.ItemParent;
        // 获取项目节点上的 Item 组件。
        var ItemCom = item.getComponent(Item);
        // 设置项目的颜色类型为 index。
        ItemCom._ColorType = index;
        // 设置项目的 ID 为 num + 1。
        ItemCom._ID = num + 1;
        // 设置项目是否被销毁为 false。
        ItemCom._isDestory = false;
        // 获取项目节点上的 cc.Sprite 组件，并设置其精灵帧为 this.ColorList[index]。
        item.getComponent(Sprite).spriteFrame = this.ColorList[index];
        // 调用 ItemCom 的 HideLight 方法，隐藏项目的高亮效果。
        ItemCom.HideLight();
        //   分配竖列
        this.allocationVertical(num, item);
        return item;
    }

    CacheCreatItem(pos, num, _ColorType, _isDestory, _isHasBox) {
        var item =
            this.ItemParent.children.length == 100
                ? this.ItemParent.children[num]
                : instantiate(this.ItemPrefabs);
        item.setPosition(v3(pos.x, pos.y + this._StartMoveDis, 0));
        item.setScale(1, 1);
        item.parent = this.ItemParent;
        var index = _ColorType;
        var ItemCom = item.getComponent(Item);
        ItemCom._ColorType = index;
        ItemCom._ID = num + 1;
        item.getComponent(Sprite).spriteFrame = this.ColorList[index];
        ItemCom._isDestory = _isDestory;
        ItemCom.HideLight();
        this.allocationVertical(num, item);
        return item;
    }



    /**
     * 用于将（Item）分配到垂直列中
     * @param {*} num  编号
     * @param {*} myItem  节点
     * @returns
     */
    allocationVertical(num, myItem) {
        // 获取项目节点上的 Item 组件。
        var myItemCom = myItem.getComponent("Item");
        // 如果项目已经被销毁（_isDestory 为 true），直接返回，不执行后续逻辑
        if (myItemCom._isDestory) return;
        // 计算项目的索引。num 是项目的编号，this.across 是每行的item数量。index 表示项目在垂直列中的位置。
        var index = (num + 1) % this.across;
        // 检查 allVerticalList 是否为空。
        if (this.allVerticalList.length == 0) {
            // 如果为空，初始化 allVerticalList，创建 this.across 个空数组，每个数组代表一列。
            for (var i = 0; i < this.across; i++) {
                var _list = [];
                this.allVerticalList[i] = _list;
            }
        }
        // 遍历 allVerticalList 的每一个键（即每一列）。
        for (var key in this.allVerticalList) {
            // 计算实际的索引 _index。如果 index 为 0，则 _index 为 9；否则 _index 为 index - 1。
            var _index = index == 0 ? 9 : index - 1;
            // 如果当前列的键 key 等于 _index，将项目 myItem 添加到该列的数组中。
            if (Number(key) == _index) {
                this.allVerticalList[key].push(myItem);
            }
        }
    }
    /**
     * 用于设置所有项目在垂直列中的位置
     */
    setItemXY() {
        // 遍历 allVerticalList 的每一个键（即每一列）
        for (var key in this.allVerticalList) {
            // 遍历当前列中的每一个项目
            for (var i = 0; i < this.allVerticalList[key].length; i++) {
                // 获取当前项目的 Item 组件,传入当前列的索引 Number(key) 和项目在列中的索引 i
                this.allVerticalList[key][i].getComponent(Item).setXY(Number(key), i);
            }
        }
    }

    test() {
        var indexlist = [];
        var index = -1;
        for (var key in this.allVerticalList) {
            index++;
            if (this.allVerticalList[key].length == 0) {
                indexlist.push(index);
            }
        }
        for (var i = 0; i < indexlist.length; i++) {
            this.allVerticalList.splice(indexlist[i] - i, 1);
        }
        this.setItemXY();
    }

    /**
     * 用于将（Item）添加到检查列表中，并根据需要执行动画效果
     * @param {*} checkItem
     * @param {*} isAnimation
     * @returns
     */
    AddCheckItem(checkItem, isAnimation = true) {
        // 初始化变量 Ishas 为 -1，用于标记项目是否已经在检查列表中
        var Ishas = -1;
        // 遍历 this._CheckItem 列表，检查 checkItem 是否已经存在于列表中
        for (var i = 0; i < this._CheckItem.length; i++) {
            // 如果存在，返回 Ishas，即 -1，表示项目已存在
            if (checkItem == this._CheckItem[i]) {
                return Ishas;
            }
        }
        // 调用 checkItem 的 Item 组件的 ShowLight 方法，显示光标效果
        checkItem.getComponent(Item).ShowLight();
        // 将 checkItem 添加到 this._CheckItem 列表中
        this._CheckItem.push(checkItem);
        // 如果 isAnimation 为 true，表示需要执行动画效果
        if (isAnimation) {
            var checkItemCom = checkItem.getComponent(Item);
            checkItemCom._isDestory = true;
        }
        // 回 this._CheckItem 列表的当前长度
        return this._CheckItem.length;
    }

    /**
     * 检查元素是否存在,是否检查过
     * @param checkItem
     * @returns
     */
    AddMaxItem(checkItem) {
        var Ishas = false;
        for (var i = 0; i < this._DetectionItem.length; i++) {
            if (checkItem == this._DetectionItem[i]) {
                Ishas = true;
            }
        }
        if (!Ishas) {
            this._DetectionItem.push(checkItem);
            checkItem.getComponent(Item)._isAlreadyDetection = true;
        }
        return Ishas;
    }

    CompareItemList() {
        if (this._DetectionItem.length != 0) {
            if (this._DetectionItem.length > this._ItemMaxList.length) {
                this._ItemMaxList.length = 0;
                for (var i = 0; i < this._DetectionItem.length; i++) {
                    this._ItemMaxList.push(this._DetectionItem[i]);
                }
            }
            this._DetectionItem.length = 0;
        }
    }
    /**
     * 销毁选中及相连的元素
     * @param IsSetValue
     */
    ClearCheckItem(IsSetValue = -1) {
        var self = this;
        //   取消所有已安排的回调函数，确保没有遗留的定时任务。
        this.unscheduleAllCallbacks();
        var count = this._CheckItem.length - 1;
        var index = -1;
        //   每隔 0.02 秒执行一次，总共执行 count 次，从 0 开始
        this.schedule(
            function () {
                index++;
                if (index < self._CheckItem.length) {
                    //  方法播放销毁动画
                    self._CheckItem[index].getComponent(Item).PlayDestoryAnimation();
                    // IsSetValue 为 -1，分数为 5 + 10 * index
                    if (IsSetValue == -1) {
                        var addScore = 5 + 10 * index;
                    } else {
                        var addScore = 10;
                    }
                    // 创建分数飞行动画
                    this.flyScore(index, addScore)
                    // 处理完所有项
                    if (index == count) {
                        if (IsSetValue == -1) {
                            self.ShowPromptUI(false);
                        } else {
                            self.ShowPromptUI(true);
                        }
                        self.ClearCheckItem2();
                    }
                }
            },
            0.08,
            count,
            0
        );
    }
    /**
    * 获得分数飞行动画
    */
    flyScore(index, val) {
        // 消除的元素坐标
        let pos = this._CheckItem[index].getPosition()
        // 分数飞行的目标位置（进度条的世界坐标）
        let bar = this.barScoreNode.getComponent(UITransform).convertToWorldSpaceAR(v3(0, 0, 0))
        // 将进度条的世界坐标转为元素父节点的节点坐标
        let newPos = gameConfig.itemNode.getComponent(UITransform).convertToNodeSpaceAR(new Vec3(bar.x, bar.y, 0))
        // 创建分数
        let fly = loadPool.ins.getPoolNode('flyItem', gameConfig.itemNode, pos)
        // 获取分数节点的脚本
        let flyTs: any = fly.getComponent('flyItemTs')
        flyTs.xiugaiScore(val)
        // 飞行动画
        tween(fly).delay(0.5).to(0.6, { position: newPos }).call(() => {
            loadPool.ins.huiShouNode(fly)
        }).start()
    }
    /**
     * 用于在游戏过程中显示得分提示U
     * @param {*} isSkill
     */
    ShowPromptUI(isSkill = false) {
        var lengths = this._CheckItem.length;
        // 消除后的得分
        this.uimainTs.ShowGetScoreUI(lengths, isSkill);
        // 连消个数
        var value = lengths - 5;
        if (value >= 4) {
            value = 3;
        }
        // 根据消除多少来播放鼓励词语
        if (value >= 0) {
            loadPool.ins.getPoolNode(String(value), gameConfig.nodeRoot, new Vec3(0, 350, 0))
            // SoundManage.Instance.playPromptSound(value); 调用 SoundManage 实例的 playPromptSound 方法来播放提示声音。value 参数同样决定了播放哪种声音效果。
            audioTool.ins.playSound(String(value))
        }
    }


    ClearCheckLight() {
        for (var i = 0; i < this._CheckItem.length; i++) {
            var itemComm = this._CheckItem[i].getComponent(Item);
            itemComm.LightUI.active = false;
            itemComm._isDestory = false;
        }
        this._CheckItem.length = 0;
        this._IsTouch = true;
    }
    /**
     * 用于在游戏中清除检查列表中的项目，并处理项目的移动和动画效果
     */
    ClearCheckItem2() {
        // 遍历 this.allVerticalList 中的每一个键
        for (var key in this.allVerticalList) {
            // 初始化变量 step 为 0，用于记录连续需要销毁的项目数量
            var step = 0;
            if (this.allVerticalList[key] == null) continue;
            var indexlist = [];
            for (var i = 0; i < this.allVerticalList[key].length; i++) {
                var _Item = this.allVerticalList[key][i].getComponent(Item);
                if (_Item._isDestory) {
                    step++;
                    indexlist.push(i);
                    //this.allVerticalList[key].splice(i,1);
                } else if (step > 0) {
                    this.MoveDownItem(step, this.allVerticalList[key][i]);
                }
            }
            for (var i = 0; i < indexlist.length; i++) {
                this.allVerticalList[key].splice(indexlist[i] - i, 1);
            }
        }
        var self = this;
        this.scheduleOnce(function () {
            var isleftAni = self.LeftClear();
            var timer = isleftAni == true ? 0.1 : 0;
            self.scheduleOnce(function () {
                // 检查游戏是否完成
                self.IsDeath();
                self._IsTouch = self.IsGameStart && !self.isGameOver;
            }, timer);
        }, 0.4);

        this._CheckItem.length = 0;
    }

    /**
     * 清除左边
     */
    LeftClear() {
        var isleftAni = false;
        var leftstep = 0;
        var index = -1;
        var indexlist = [];
        for (var _key1 in this.allVerticalList) {
            index++;
            if (
                this.allVerticalList[_key1] != null &&
                this.allVerticalList[_key1].length == 0
            ) {
                leftstep++;
                this.allVerticalList[_key1] = null;
                indexlist.push(index);
            } else if (leftstep > 0 && this.allVerticalList[_key1] != null) {
                for (var i = 0; i < this.allVerticalList[_key1].length; i++) {
                    this.MoveleftItem(leftstep, this.allVerticalList[_key1][i]);
                    if (!isleftAni) isleftAni = true;
                }
            }
        }
        for (var i = 0; i < indexlist.length; i++) {
            this.allVerticalList.splice(indexlist[i] - i, 1);
        }
        return isleftAni;
    }
    /**
     * 元素向下移动
     */
    MoveDownItem(step, item) {
        item.getComponent(Item)._Y -= step;
        var pos = item.getPosition();
        var numx = Number(pos.x.toFixed(1));
        var numy = Number(pos.y.toFixed(1));
        var targetPos = v3(numx, numy - this.Disy * step, 0);
        tween(item).to(0.15, { position: targetPos }).by(0.09, { position: v3(0, 20, 0) }).by(0.05, { position: v3(0, -20, 0) }).start()
    }
    /**
     * 元素向左移动
     */
    MoveleftItem(step, item) {
        item.getComponent(Item)._X -= step;
        var pos = item.getPosition();
        var numx = Number(pos.x.toFixed(1));
        var numy = Number(pos.y.toFixed(1));
        var targetPos = v3(numx - this.Disx * step, numy, 0);
        tween(item).to(0.15, { position: targetPos }).by(0.09, { position: v3(10, 0, 0) }).by(0.05, { position: v3(-10, 0, 0) }).start()
    }
    /**
     * 检查游戏是否结束
     * @returns
     */
    IsDeath() {
        if (this.isGameOver) return;
        // Score is committed after the selected group has finished clearing.
        if (gameConfig.score >= gameConfig.needScore) {
            this.isGameOver = true;
            this.unscheduleAllCallbacks();
            this.IsGameStart = false;
            this._IsTouch = false;
            gameConfig.IsGameStart = false;
            this.uimainTs.CancelProps();
            this.uimainTs.isNext();
            return;
        }

        //   如果 isPutCanDesing 为 true 且 IsGameStart 为 false，则直接返回，不执行后续逻辑
        if (this.isPutCanDesing && this.IsGameStart == false) {
            return;
        }
        //   初始化 isdeath 变量为 true，表示游戏结束
        var isdeath = true;
        for (var i = 0; i < this.ItemParent.children.length; i++) {
            var ItemCom = this.ItemParent.children[i].getComponent(Item);
            // 如果项目未被销毁（_isDestory 为 false），调用 detectionSameItem 方法检测是否有相同的项目可以消除
            if (ItemCom && ItemCom._isDestory == false) {
                isdeath = ItemCom.detectionSameItem(true, true);
                //   如果检测到有可消除的项目，将 isdeath 设置为 false 并跳出循环
                if (isdeath == false) {
                    break;
                }
            }
        }
        //   isdeath 仍为 true，表示没有可消除的项目
        if (isdeath != false) {
            // GetNotDestoryItem 方法获取所有未被销毁的项目列表
            var surplusList = this.GetNotDestoryItem();
            this.GameOverAni(surplusList)
        }
    }

    GetNotDestoryItem() {
        var surplusList = [];
        var itemchildren = this.ItemParent.children;
        for (var i = 0; i < itemchildren.length; i++) {
            let item = itemchildren[i].getComponent(Item)
            if (item && item._isDestory == false) {
                surplusList.push(itemchildren[i]);
            }
        }
        return surplusList;
    }
    /**
     * 用于在游戏结束时显示动画效果，并处理剩余方块的得分和动画
     * @param {*} surplusList 表示剩余的方块列表
     */
    GameOverAni(surplusList) {
        if (this.isGameOver) return;
        this.isGameOver = true;
        this.IsGameStart = false;
        this._IsTouch = false;
        gameConfig.IsGameStart = false;
        //   表示游戏已经结束
        gameConfig.isGameOver = true;
        //   表示游戏没有重置
        this.isReset = false;
        //  存储剩余方块的数量
        var count = surplusList.length;
        if (count > 0) {
            // 迟 0.5 秒后执行动画
            this.scheduleOnce(() => {
                //   遍历所有剩余方块，为每个方块添加闪烁动画
                for (var i = 0; i < count; i++) {
                    tween(surplusList[i]).to(0.02, { scale: v3(0, 0, 0) }).delay(0.2).to(0.02, { scale: v3(1, 1, 1) }).delay(0.2).union().repeat(2).start()
                    // 对每个剩余方块执行 Blink 动画（闪烁）和显示光效。
                    surplusList[i].getComponent(Item).ShowLight();
                }
                //   初始化 index 为 -1，用于记录当前处理的方块索引
                let val = -1;
                this.schedule(
                    () => {
                        val = val + 1;
                        // 额外奖励分数
                        var scoreValue = 2000 - (val + 1) * (val + 1) * 20;
                        if (scoreValue < 0) {
                            scoreValue = 0;
                        }
                        this.uimainTs.showRemian(scoreValue)
                        surplusList[val].getComponent(Item).PlayDestoryAnimation();
                        surplusList[val].getComponent(Item)._isDestory = true;
                        if (val == count - 1) {
                            gameConfig.score += scoreValue
                            this.scheduleOnce(() => {
                                this.uimainTs.isNext()
                            }, 0.5)
                            console.log('游戏结束');
                        }
                    },
                    0.04,
                    count - 1,
                    1
                );
            }, 0.5);
        } else {
            gameConfig.score += 2000
            this.uimainTs.showRemian(2000)
            this.scheduleOnce(() => {
                this.uimainTs.isNext()
            }, 0.5)
        }
    }

    StopPromptAnimation() {
        for (var j = 0; j < this._ItemMaxList.length; j++) {
            this._ItemMaxList[j].getComponent(Item).StopPromptAnimation();
        }
        this._PromptCoolTime = this.constCoolTime;
        this.isRunMax = true;
        this._ItemMaxList.length = 0;
        this._DetectionItem.length = 0;
    }

    ShowItemLight(_ItemCom) {
        if (this.ItemLastCom != undefined) {
            this.ItemLastCom.HideLight();
        }
        _ItemCom.ShowLight();
        this.ItemLastCom = _ItemCom;
    }
    /**
     * 元素刷新对游戏中的垂直列表进行随机重排，并更新每个项目的颜色和位置
     */
    PropsRest() {
        this.StopPromptAnimation();
        // 存储索引
        var IndexList = [];
        // 存储有效的垂直列表
        var Vlist = [];
        // 存储每个垂直列表的 x 坐标
        var VlistX = [];
        // 存储每个垂直列表的键
        var KeyList = [];
        // 用于计数
        var _index = -1;
        // 遍历 allVerticalList，检查每个键对应的值是否不为 null
        for (var key in this.allVerticalList) {
            // 如果不为 null，则将该垂直列表、其 x 坐标、索引和键分别添加到 Vlist、VlistX、IndexList 和 KeyList 中
            if (this.allVerticalList[key] != null) {
                _index++;
                Vlist.push(this.allVerticalList[key]);
                VlistX.push(this.allVerticalList[key][0].getPosition().x);
                IndexList.push(_index);
                KeyList.push(key);
            }
        }
        // 创建一个空对象 alllist 用于存储重排后的垂直列表
        var alllist = {};
        for (var i = 0; i < Vlist.length; i++) {
            var value = Math.floor(Math.random() * IndexList.length);
            var real = IndexList[value];
            IndexList.splice(value, 1);

            var posX = VlistX[i];

            alllist[i] = Vlist[real];
            for (var j = 0; j < Vlist[real].length; j++) {
                var startPOS = Vlist[real][j].getPosition();
                tween(Vlist[real][j]).to(0.2, { position: new Vec3(0, 0, 0) }).to(0.3, { position: new Vec3(posX, startPOS.y, 0) }).start()
                // Vlist[real][j].setPosition(v3(posX, startPOS.y, 0));
            }
        }
        var _i = -1;
        for (var key in this.allVerticalList) {
            _i++;
            if (alllist[_i] != undefined) {
                this.allVerticalList[key] = alllist[_i];
                for (var j = 0; j < this.allVerticalList[key].length; j++) {
                    var Item = this.allVerticalList[key][j];
                    var ItemCom: any = Item.getComponent("Item");
                    // 如果项目未被销毁（_isDestory 为 false），则随机选择一个颜色索引 Indexs，并更新项目的精灵帧和颜色类型
                    if (!ItemCom._isDestory) {
                        var Indexs = Math.floor(Math.random() * 5);
                        Item.getComponent(Sprite).spriteFrame = this.ColorList[Indexs];
                        ItemCom._ColorType = Indexs;
                        // var keyValue = Number(key) + 1;
                    }
                }
            } else {
                this.allVerticalList[key] = null;
            }

        }
        this.setItemXY();
        this.isReset = true;
        this.IsDeath();
    }

    /**
     * 锤子道具
     * @param Item 
     */
    HammerProps(Item) {
        this._CheckItem.push(Item);
        Item.getComponent("Item")._isDestory = true;
        this.ClearCheckItem();
        gameConfig.touchState = "";
    }
    /**
     * 改变颜色道具
     * @param Item 
     */
    ChangeProps(Item) {
        let changePanel: any = this.changePanel.getComponent('changePanel')
        // 调用changePanel下的ShowUI方法
        changePanel.ShowUI(Item);
        //this.UIMianCom.CancelProps(false);
        this.ShowItemLight(Item.getComponent("Item"));
    }
    // 销毁组件
    protected onDestroy(): void {
        this.unscheduleAllCallbacks()
    }
}


