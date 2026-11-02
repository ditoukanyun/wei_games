import { _decorator, Component, director, find, game, Label, Node, NodeEventType, ProgressBar, Sprite, tween, v2, Vec3 } from 'cc';
import { gameConfig } from '../data/gameConfig';
import { emits, local, musicName, perName } from '../data/enume';
import { loadPool } from '../getRes/loadPool';
import { load, save } from '../unitls/tools';
import { audioTool } from '../unitls/audioTool';
import { FactoryItem } from './FactoryItem';
import { wxAd } from '../ad/wxAd';
import { adMgr } from '../ad/adMgr';
const { ccclass, property } = _decorator;
// gameInitTs 脚本
let gameInitTs = null
@ccclass('uiMain')
export class uiMain extends Component {
    // 每次消除的得分
    @property(Node) jiangli: Node = null
    // 奖励分数
    @property(Label) jiangliScore: Label = null
    // 换色道具提示节点
    @property(Node) changePanel: Node = null
    // 当前关卡
    @property(Label) level: Label = null
    // 当前总分
    @property(Label) score: Label = null
    // 目标分数
    @property(Label) needScore: Label = null
    // 目标进度条
    @property(ProgressBar) barScore: ProgressBar = null
    @property(Node) djTishi: Node
    private settled = false;
    FactoryItem: FactoryItem
    protected onLoad(): void {
        this.FactoryItem = find('Canvas/Gaming').getComponent(FactoryItem)
        gameInitTs = find('Canvas').getComponent('gameInit')
    }
    start() {
        this.init()
        this.initScore()
        director.on(emits.initItem, this.beginLevel, this)
        director.on(emits.chongxinGame, this.chongxinGame, this)
    }

    protected onDestroy(): void {
        director.off(emits.initItem, this.beginLevel, this)
        director.off(emits.chongxinGame, this.chongxinGame, this)
    }
    init() {
        // 获取重置按钮节点
        const rest = this.node.getChildByPath('topLayout/chongzhiBtn')
        rest.on(NodeEventType.TOUCH_START, this.restBtn, this)
        // 获取重置按钮节点
        const hammer = this.node.getChildByPath('topLayout/xiaochuBrn')
        hammer.on(NodeEventType.TOUCH_START, this.hammerBtn, this)
        // 获取重置按钮节点
        const change = this.node.getChildByPath('topLayout/huanseBtn')
        change.on(NodeEventType.TOUCH_START, this.changeBtn, this)
        // 获取重置按钮节点
        const setting = this.node.getChildByPath('topLayout/setting')
        setting.on(NodeEventType.TOUCH_START, this.settingBtn, this)
        // 矫正分数
        gameConfig.score = gameConfig.LastScore
    }
    /**
    * 显示连消次数和得分
    * @param count 
    * @param isSkill 
    */
    ShowGetScoreUI(count, isSkill) {
        var score = 0;
        if (isSkill == false) {
            for (var i = 0; i < count; i++) {
                score += 5 + 10 * i;
            }
        } else {
            score = count * 10;
        }
        // 增加当前关卡已获得的分数
        gameConfig.score += score
        // 更新分数
        this.initScore()
    }
    /**
     * 判断是否过关
     */
    beginLevel() {
        this.settled = false;
    }
    isNext() {
        if (this.settled) return;
        this.settled = true;
        this.hiedRemian()
        // 游戏未开始
        gameConfig.IsGameStart = false
        // 过关
        if (gameConfig.score < gameConfig.needScore) {
            gameConfig.itemNode.removeAllChildren()
            // 失败动画
            loadPool.ins.getPoolNode(perName.shibaiPop, gameConfig.nodeRoot, new Vec3(0, 0, 0))
            // 插屏广告
            adMgr.showChaPing()
        } else {
            // 胜利
            audioTool.ins.playSound(musicName.guopguan)
            gameConfig.itemNode.removeAllChildren()
            loadPool.ins.getPoolNode('shengliPop', gameConfig.nodeRoot, new Vec3(0, 0, 0))
            // 下一关
            this.nextLeve()
            // 插屏广告
            adMgr.showChaPing()
        }
    }
    /**
     * 下一关
     */
    nextLeve() {
        gameConfig.level += 1
        gameConfig.LastScore = gameConfig.score
        this.nextNeedScore()
        // 存储数据
        save(local.level, gameConfig.level)
        save(local.LastScore, gameConfig.score)
        save(local.needScore, gameConfig.needScore)
        // 实时顶部分数数据初始化
        this.initScore()
    }
    /**
* 下一关增加的分数
*/
    nextNeedScore() {
        if (gameConfig.level == 1) {
            gameConfig.needScore += 1000;
        } else if (gameConfig.level < 3) {
            gameConfig.needScore += 1500;
        } else if (gameConfig.level < 6) {
            gameConfig.needScore += 2000;
        } else if (gameConfig.level >= 6) {
            var differenceScore = 2500 + 50 * (gameConfig.level - 5);
            gameConfig.needScore += differenceScore;
        }
    }

    /**
    * 实时顶部分数数据初始化
    */
    initScore() {
        this.level.string = '第' + gameConfig.level + '关'
        this.score.string = gameConfig.score + ' / ' + gameConfig.needScore
        this.needScore.string = String(gameConfig.needScore)
        // 进度条
        let value = gameConfig.score / gameConfig.needScore
        this.barScore.progress = value > 1 ? 1 : value;
    }
    /**
     * 重新开始
     */
    chongxinGame() {
        this.beginLevel();
        gameConfig.score = load(local.LastScore)
        gameConfig.needScore = load(local.needScore)
        this.initScore()
        gameInitTs.Init()
    }
    /**
     * 显示结算奖励分数
     */
    showRemian(awardScore) {
        this.jiangli.active = true
        this.jiangliScore.string = "奖励分数：" + awardScore;
    }
    // 关闭结算奖励分数
    hiedRemian() {
        this.jiangli.active = false
    }

    /**
   * 道具功能
   */
    restBtn() {
        console.log('重置道具');
        if (!gameConfig.IsGameStart) return
        this.CancelProps()
        if (gameConfig.restNum > 0 && gameConfig.touchState == '') {
            this.FactoryItem.PropsRest()
            gameConfig.restNum -= 1
            director.emit(emits.daojuNum)
            save(local.restNum, gameConfig.restNum)
        } else {
            if (gameConfig.jinbi >= 50 && gameConfig.touchState == '') {
                this.FactoryItem.PropsRest()
                gameConfig.jinbi -= 50
                director.emit(emits.jinbiNum)
            } else {
                // 通过对象池创建提示预制体
                loadPool.ins.getPoolNode(perName.messages, gameConfig.nodeRoot)
                // 调用提示功能
                director.emit(emits.message, '珍珠不足');
                console.log('珍珠不足');
            }
        }
    }
    hammerBtn() {
        console.log('消除一个');
        if (!gameConfig.IsGameStart) return
        if (gameConfig.touchState === '1') {
            this.CancelProps()
            return
        }
        this.CancelProps()
        if (gameConfig.hammerNum > 0 && gameConfig.touchState == '') {
            gameConfig.touchState = '1'
            director.emit(emits.daojuNum)
            loadPool.ins.getPoolNode(perName.hammerTishi, this.djTishi, new Vec3(0, 0, 0))
        } else {
            if (gameConfig.jinbi >= 50 && gameConfig.touchState == '') {
                gameConfig.touchState = '1'
                director.emit(emits.daojuNum)
                loadPool.ins.getPoolNode(perName.hammerTishi, this.djTishi, new Vec3(0, 0, 0))
            } else {
                // 通过对象池创建提示预制体
                loadPool.ins.getPoolNode(perName.messages, gameConfig.nodeRoot)
                // 调用提示功能
                director.emit(emits.message, '珍珠不足');
                console.log('珍珠不足');
            }
        }
    }
    changeBtn() {
        console.log('更换颜色');
        if (!gameConfig.IsGameStart) return
        if (gameConfig.touchState === '2') {
            this.CancelProps()
            return
        }
        this.CancelProps()
        if (gameConfig.changeNum > 0 && gameConfig.touchState == '') {
            gameConfig.touchState = '2'
            director.emit(emits.daojuNum)
            loadPool.ins.getPoolNode(perName.changeTishi, this.djTishi, new Vec3(0, 0, 0))
        } else {
            if (gameConfig.jinbi >= 50 && gameConfig.touchState == '') {
                gameConfig.touchState = '2'
                director.emit(emits.daojuNum)
                loadPool.ins.getPoolNode(perName.changeTishi, this.djTishi, new Vec3(0, 0, 0))
            } else {
                // 通过对象池创建提示预制体
                loadPool.ins.getPoolNode(perName.messages, gameConfig.nodeRoot)
                // 调用提示功能
                director.emit(emits.message, '珍珠不足');
                console.log('珍珠不足');
            }
        }
    }
    /**
     * 设置按钮
     */
    settingBtn() {
        loadPool.ins.getPoolNode(perName.settingPop, gameConfig.nodeRoot)
    }

    /**
     * 重置触摸状态
     */
    CancelProps(IsState = true) {
        director.emit(emits.daojuTishi)
        if (IsState) {
            gameConfig.touchState = "";
        }
        if (this.FactoryItem.ItemLastCom != undefined) {
            this.FactoryItem.ItemLastCom.HideLight();
            this.FactoryItem.ItemLastCom = undefined;
        }
        this.changePanel.active = false;
        director.emit(emits.daojuNum)
    }
}


