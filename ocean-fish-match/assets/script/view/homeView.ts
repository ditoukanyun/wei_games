import { adaptMobileWeb } from '../unitls/mobileAdaptation';
import { _decorator, Component, director, Label, Node, profiler, Vec3, view, Widget } from 'cc';
import { emits, musicName, perName, resPath, system } from '../data/enume';
import { audioTool } from '../unitls/audioTool';
import { loadPool } from '../getRes/loadPool';
import { gameConfig } from '../data/gameConfig';
import { wxApi } from '../api/wxApi';
import { dyAd } from '../ad/dyAd';
import { adMgr } from '../ad/adMgr';
const { ccclass, property } = _decorator;

@ccclass('home')
export class home extends Component {
    // 转场遮罩
    @property(Node)
    zhezhao: Node
    // 排行按钮
    @property(Node)
    paihangBtn: Node
    start() {
        adaptMobileWeb();
        this.layoutHeader();
        view.on('canvas-resize', this.layoutHeader, this);
        profiler.hideStats();
        this.init()
    }

    /** Anchor the utility row to the usable browser viewport, not the centered board. */
    layoutHeader() {
        const coin = this.node.getChildByName('diamond');
        const music = this.node.getChildByPath('leftIcon/musicSetting') || this.node.getChildByName('musicSetting');
        const y = view.getCanvasSize().height / view.getScaleY() / 2 - 68;
        if (coin) {
            const widget = coin.getComponent(Widget);
            if (widget) widget.enabled = false;
            coin.setPosition(coin.position.x, y, 0);
        }
        if (music) {
            music.setParent(this.node);
            music.setPosition(290, y, 0);
        }
    }
    onDestroy() {
        view.off('canvas-resize', this.layoutHeader, this);
    }

    init() {
        audioTool.ins.playMusic(musicName.bgm)
        gameConfig.homeRoot = this.node
        // 允许转发
        wxApi.ins.topZhuanfa()
        // 展示banner广告
        adMgr.showBanner()
        adMgr.showChaPing()
        // BGM中断
        wxApi.ins.bgmZd(() => {
            audioTool.ins.playMusic(musicName.bgm)
        })
    }
    /**
     * 开始游戏
     */
    startGame() {
        audioTool.ins.playSound('btn1')
        if (gameConfig.level > 1) {
            loadPool.ins.getPoolNode(perName.isJixu, this.node, new Vec3(0, 0, 0))
        } else {
            this.zhezhao.active = true
        }

    }
    /**
     * 查看排行
     */
    lookPaihang() {
        audioTool.ins.playSound('btn1')
        this.node.getChildByName('rankPop').active = true
    }

    /**
     * 领取福利
     */
    getFuli() {
        audioTool.ins.playSound('btn1')
        if (gameConfig.isFuli) {
            if (gameConfig.system == system.dy) {
                //判断抖音是否支持侧边栏
                dyAd.ins.checkSidebar(() => {
                    //如果支持，打开侧边栏
                    loadPool.ins.getPoolNode('cebianPop', this.node)
                }, () => {
                    //如果不支持，直接打开福利
                    loadPool.ins.getPoolNode(perName.fuliPop, this.node)
                })
            } else {
                loadPool.ins.getPoolNode(perName.fuliPop, this.node)
            }
        } else {
            // 通过对象池创建提示预制体
            loadPool.ins.getPoolNode(perName.messages, gameConfig.homeRoot)
            // 调用提示功能
            director.emit(emits.message, '今日礼包已领取');
        }
    }

}


