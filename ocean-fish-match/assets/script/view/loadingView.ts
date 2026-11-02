import { adaptMobileWeb } from '../unitls/mobileAdaptation';
import { _decorator, Component, director, Node, profiler, ProgressBar, sys, Label, Color } from 'cc';
import { loadRes } from '../getRes/loadRes';
import { local, resPath } from '../data/enume';
import { getDayTime, load, newDayTime, save } from '../unitls/tools';
import { gameConfig } from '../data/gameConfig';
import { wxAd } from '../ad/wxAd';
const { ccclass, property } = _decorator;

@ccclass('loadingView')
export class loadingView extends Component {
    @property(ProgressBar)
    progre: ProgressBar = null;
    private progressLabel: Label;
    update() {
        if (this.progressLabel) this.progressLabel.string = Math.round(Math.min(1, this.progre.progress) * 100) + '%';
    }
    start() {
        const oldCaption = this.node.getChildByName('Sprite');
        if (oldCaption) oldCaption.active = false;
        const captionNode = new Node('loadingCaption');
        captionNode.layer = this.node.layer;
        this.node.addChild(captionNode);
        captionNode.setPosition(0, -462, 0);
        const caption = captionNode.addComponent(Label);
        caption.string = '正在潜入海底…';
        caption.fontFamily = 'Arial';
        caption.fontSize = 30;
        caption.lineHeight = 40;
        caption.isBold = false;
        caption.color = new Color(35, 92, 112);
        const text = new Node('loadingPercent');
        text.layer = this.node.layer;
        this.node.addChild(text);
        text.setPosition(0, -410, 0);
        this.progressLabel = text.addComponent(Label);
        this.progressLabel.fontSize = 38;
        this.progressLabel.isBold = true;
        this.progressLabel.color = new Color(35, 92, 112);

        adaptMobileWeb();
        this.init()
    }
    init() {
        this.resLoad()
        this.initData()
        this.startJindu()
        // 
        this.isLingquFuli()
    }
    /**
     * 资源加载
     */
    resLoad() {
        profiler.hideStats()
        loadRes.ins.loadBundle('bundles');
        loadRes.ins.resLoad(resPath.item);
        loadRes.ins.resLoad(resPath.guliPop);
        loadRes.ins.resLoad(resPath.UI);
        loadRes.ins.resLoad(resPath.music);
    }
    /**
     * 判断每日福利是否可以领取
     */
    isLingquFuli() {
        // 如果上次领取后的第二天时间减当前时间大于0，说明距离上次领取还没过24点
        let leftTime = gameConfig.endTime - newDayTime();
        if (leftTime >= 0) {
            gameConfig.isFuli = 0
        } else {
            gameConfig.isFuli = 1
        }
    }
    /**
     * 数据初始化
     */
    initData() {
        // 获取进入游戏时的时间(抖音插屏广告需要30秒后)
        gameConfig.goGameTime = new Date().getTime()
        // 判断当前平台
        gameConfig.system = sys.platform;
        // 音乐音量
        let isSound = load(local.isSound)
        if (isSound == null) {
            isSound = 1
            save(local.isSound, isSound)
        }
        gameConfig.isSound = isSound
        // 金币数量
        let jinbi = load(local.jinbi)
        if (jinbi == null) {
            jinbi = 50
            save(local.jinbi, jinbi)
        }
        gameConfig.jinbi = jinbi
        // 关卡
        let level = load(local.level)
        if (level == null) {
            level = 1
            save(local.level, level)
        }
        gameConfig.level = level
        // 重置道具
        let restNum = load(local.restNum)
        if (restNum == null) {
            restNum = 0
            save(local.restNum, restNum)
        }
        gameConfig.restNum = restNum
        // 消除道具
        let hammerNum = load(local.hammerNum)
        if (hammerNum == null) {
            hammerNum = 0
            save(local.hammerNum, hammerNum)
        }
        gameConfig.hammerNum = hammerNum
        // 换色道具
        let changeNum = load(local.changeNum)
        if (changeNum == null) {
            changeNum = 0
            save(local.changeNum, changeNum)
        }
        gameConfig.changeNum = changeNum
        // 上一关分数
        let LastScore = load(local.LastScore)
        if (LastScore == null) {
            LastScore = 0
            save(local.LastScore, LastScore)
        }
        gameConfig.LastScore = LastScore
        // 下一关需要的分数
        let needScore = load(local.needScore)
        if (needScore == null) {
            needScore = 1000
            save(local.needScore, needScore)
        }
        gameConfig.needScore = needScore
        // 上次领取福利后的第二天时间
        let endTime = load(local.endTime)
        if (endTime == null) {
            endTime = 0
            save(local.endTime, endTime)
        }
        gameConfig.endTime = endTime
    }
    /**
     * 进度条进度
     */
    startJindu() {
        // 将在 10 秒后开始计时，每 5 秒执行一次回调，重复 3 + 1 次
        this.schedule(function () {
            // 这里的 this 指向 component
            this.progre.progress += 0.1;
            if (this.progre.progress >= 0.5) {
                this.unschedule(this.schedule)
                this.jinduPause()
            }
        }, 0.06, 4, 0.2);
    }
    jinduPause() {
        this.scheduleOnce(() => {
            this.loadScene()
        }, 1)
    }
    loadScene() {
        this.schedule(function () {
            this.progre.progress += 0.1;
            if (this.progre.progress >= 1) {
                this.unschedule(this.schedule)
                director.loadScene("home")
            }
        }, 0.1, 5, 0.2);
    }
}


