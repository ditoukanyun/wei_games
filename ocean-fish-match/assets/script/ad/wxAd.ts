import { _decorator, Component, Node } from 'cc';
import { gameConfig } from '../data/gameConfig';
import { audioTool } from '../unitls/audioTool';
import { adConfig } from './adConfig';
const { ccclass, property } = _decorator;
const wx = window['wx'];
@ccclass('wxAd')
export class wxAd extends Component {
    // banner广告
    private bannerAd: any;
    // 格子广告
    private geziAd: any;
    // 视频广告
    private videoAd: any;
    // 单例
    static _ins: wxAd;
    static get ins() {
        if (this._ins) {
            return this._ins;
        }
        this._ins = new wxAd();
        return this._ins;
    }



    /**
 * banner广告
 */
    // 显示banner广告
    showBanner() {
        // 获取屏幕宽高
        let { screenWidth, screenHeight } = wx.getSystemInfoSync();
        // 创建 Banner 广告实例，提前初始化
        this.bannerAd = wx.createBannerAd({
            adUnitId: adConfig.wxBannerId,
            adIntervals: 30,
            style: {
                left: 0,
                top: 0,
                width: 350,
            },

        });
        // 广告位置
        this.bannerAd.onResize((res) => {
            this.bannerAd.style.left = (screenWidth - res.width) / 2;
            this.bannerAd.style.top = screenHeight - res.height;
            this.bannerAd.style.width = screenWidth;
        });
        // 监听 banner 广告错误事件
        this.bannerAd.onError((err) => {
            console.error(err.errMsg);
        });
        // 监听广告加载成功
        this.bannerAd.onLoad(res => {
            this.bannerAd.show();
        })
    }

    // 隐藏banner广告
    hideBanner() {
        if (this.bannerAd) {
            this.bannerAd.hide();
            this.bannerAd.destroy();
            this.bannerAd = null
        }
    }

    /**
      * 格子广告
      */
    showGezi() {
        // 获取屏幕宽高
        let { screenWidth, screenHeight } = wx.getSystemInfoSync();
        // 创建 原生模板 广告实例，提前初始化
        this.geziAd = wx.createCustomAd({
            adUnitId: adConfig.wxGeziId,
            style: {
                left: 0,
                top: 40,
                width: 350
            }
        })
        // 监听 原生模板 广告错误事件
        this.geziAd.onError((err) => {
            console.error(err.errMsg);
        });
        // 监听广告加载成功
        this.geziAd.onLoad(res => {
            this.geziAd.show();
        })
    }
    // 隐藏格子广告
    hideGezi() {
        if (this.geziAd) {
            this.geziAd.hide();
            this.geziAd.destroy();
            this.geziAd = null
        }
    }

    /**
     * 插屏广告
     */
    showChapingAd(delay) {
        // 延迟显示
        this.scheduleOnce(() => {
            // 定义插屏广告
            let interstitialAd = null
            // 创建插屏广告实例，提前初始化
            if (wx.createInterstitialAd) {
                interstitialAd = wx.createInterstitialAd({
                    adUnitId: adConfig.wxChaPingId
                })
            }
            // 在适合的场景显示插屏广告
            if (interstitialAd) {
                interstitialAd.show().catch((err) => {
                    console.error('插屏广告显示失败', err)
                })
            }
        }, delay)

    }
    /**
    * 激励视频广告
    */
    showVideoAd() {
        return new Promise((resolve, reject) => {
            // 创建激励视频广告实例，提前初始化
            this.videoAd = wx.createRewardedVideoAd({
                adUnitId: adConfig.wxVideoId
            });
            // 加载广告
            this.videoAd.onLoad(() => {
                console.log('激励视频 广告加载成功');
            });
            // 监听广告加载失败
            this.videoAd.onError((err) => {
                console.log(err);
            });
            // 用户触发广告后，显示激励视频广告
            this.videoAd.show().catch(() => {
                // 失败重试
                this.videoAd
                    .load()
                    .then(() => this.videoAd.show())
                    .catch((err) => {
                        console.error('激励视频 广告显示失败', err);
                        reject(err);
                    });
            });
            this.videoAd.onClose((res) => {
                if (!this.videoAd) return;
                this.videoAd.offClose();
                // 用户点击了【关闭广告】按钮
                if ((res && res.isEnded) || res === undefined) {
                    // 正常播放结束，可以下发游戏奖励
                    resolve(true)
                } else {
                    // 播放中途退出，不下发游戏奖励
                    resolve(false)
                }
            });
        })
    }

}


