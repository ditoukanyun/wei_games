import { _decorator, Component, Node } from 'cc';
import { adConfig } from './adConfig';
import { gameConfig } from '../data/gameConfig';
import { isGoGameTime } from '../unitls/tools';
const { ccclass, property } = _decorator;
const tt = window['tt']
@ccclass('dyAd')
export class dyAd extends Component {
    //banner广告
    private bannerAd: any
    // 插屏广告
    private chaPingAd: any
    // 插屏广告
    private videoAd: any
    // 单例
    static _ins: dyAd;
    static get ins() {
        if (this._ins) {
            return this._ins;
        }
        this._ins = new dyAd();
        return this._ins;
    }
    /**
     *  判断用户是否支持侧边栏进入功能，有些旧版的抖音没有侧边栏，
     */
    checkSidebar(callback1, callback2) {
        tt.checkScene({
            scene: "sidebar",
            success: (res) => {
                console.log("check scene 成功: ", res.isExist);
                if (res.isExist) {
                    callback1();
                } else {
                    callback2();
                }
            },
            fail: (res) => {
                callback2();
            }
        });
    }
    // --------------------------------------------------------------------------------------------
    /**
     * 显示Banner广告
     */

    showBannerAd() {
        if (adConfig.isShowAd) {
            // 获取系统信息
            let sysInfo = tt.getSystemInfoSync();
            // 创建 Banner 广告实例，提前初始化
            let width = sysInfo.screenWidth;
            this.bannerAd = tt.createBannerAd({
                // 广告单元 ID
                adUnitId: adConfig.dyBannerId,
                // 广告自动刷新的间隔时间
                adIntervals: 30,
                // 广告位区域，包括left、top、width字段
                style: {
                    left: sysInfo.screenWidth / 2 - width / 2,
                    top: sysInfo.screenHeight,
                    width: width
                }
            })
            // 监听广告尺寸变化
            this.bannerAd.onResize(res => {
                this.bannerAd.style.top = sysInfo.screenHeight - this.bannerAd.style.realHeight;
            })
            // 监听广告加载失败
            this.bannerAd.onError(err => {
                console.log(err)
            })
            // 监听广告加载成功
            this.bannerAd.onLoad(res => {
                this.bannerAd.show();
            })
        }
    }
    // 隐藏广告
    hideBannerAd() {
        if (adConfig.isShowAd) {
            this.bannerAd.hide();
            this.bannerAd.destroy();
            this.bannerAd = null;
        }
    }
    // ----------------------------------------------------------------------------------------------
    /**
 * 显示插屏广告
 */
    showChapingAd() {
        if (!adConfig.isShowAd) return
        console.log('进入游戏时间', isGoGameTime());
        if (isGoGameTime()) {
            // 创建插屏广告
            this.createChapingAd()
            if (this.chaPingAd) {
                // 显示插屏广告
                this.chaPingAd.load()
                    .then(() => {
                        this.chaPingAd.show().then(() => {
                            console.log("插屏广告展示成功");
                        });
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            }
        } else {
            console.log('进入游戏时间小于30秒');
        }

    }
    // 创建插屏广告
    createChapingAd() {
        // 创建插屏广告实例，提前初始化
        if (tt.createInterstitialAd && !this.chaPingAd) {
            this.chaPingAd = tt.createInterstitialAd({
                adUnitId: adConfig.dyChaPingId
            })
            // 监听插屏广告关闭事件。
            this.chaPingAd.onClose(res => {
                // 关闭插屏的时间，单位为毫秒，计算下次触发插屏间隔是否大于30s
                gameConfig.goGameTime = new Date().getTime()
                console.log('插屏关闭');
                this.chaPingAd = null;
            })
            this.chaPingAd.onError(({ errCode, errMsg }) => {
                console.log('监听到插屏错误', errCode, errMsg)
            })
        }
    }
    // --------------------------------------------------------------------------------------------------------------------
    /**
     * 播放激励视频广告
     */
    showVideoAd() {
        return new Promise((resolve, reject) => {
            this.videoAd = tt.createRewardedVideoAd({
                adUnitId: adConfig.dyVideoId,
                // 是否开启再得广告模式
                multiton: false,
                // 再得广告的奖励文案，玩家每看完一个广告都会展示
                multitonRewardMsg: ['更多奖励1', '更多奖励2', '更多奖励3'],
                // 额外观看广告的次数
                multitonRewardTimes: 3,
                // 是否开启进度提醒，开启时广告文案为【再看N个获得xx】
                progressTip: false,
            });
            //拉取异常处理
            this.videoAd.onError((err) => {
                console.log(err);
            })
            // 用户触发广告后，显示激励视频广告
            this.videoAd.show().catch(() => {
                // 失败重试
                this.videoAd.load()
                    .then(() => this.videoAd.show())
                    .catch(err => {
                        reject(err);
                        console.log('激励视频 广告显示失败')
                    })
            })
            // 用户点击了【关闭广告】按钮
            this.videoAd.onClose((res) => {
                if (!this.videoAd) return;
                //需要清除回调，否则第N次广告会一次性给N个奖励
                this.videoAd.offClose();
                //关闭
                if (res && res.isEnded || res === undefined) {
                    //正常播放结束，需要下发奖励
                    resolve(true)
                } else {
                    //播放退出，不下发奖励
                    resolve(false)
                }
            })
        })
    }
}


