import { _decorator, Component, Node } from 'cc';
import { adConfig } from './adConfig';
import { gameConfig } from '../data/gameConfig';
import { system } from '../data/enume';
import { wxAd } from './wxAd';
import { dyAd } from './dyAd';
const { ccclass, property } = _decorator;

@ccclass('adMgr')
export class adMgr extends Component {
    /**
     * 显示banner广告
     */
    static showBanner() {
        // 判断是否显示广告
        if (!adConfig.isShowAd) return
        switch (gameConfig.system) {
            // 如果是微信平台
            case system.wx:
                wxAd.ins.showBanner()
                console.log('是微信平台');
                break;
            // 如果是抖音平台
            case system.dy:
                dyAd.ins.showBannerAd()
                console.log('是抖音平台');
                break;
        }
    }
    /**
     * 隐藏banner广告
     */
    static hideBanner() {
        // 判断是否显示广告
        if (!adConfig.isShowAd) return
        switch (gameConfig.system) {
            // 如果是微信平台
            case system.wx:
                wxAd.ins.hideBanner()
                console.log('是微信平台');
                break;
            // 如果是抖音平台
            case system.dy:
                dyAd.ins.hideBannerAd()
                console.log('是抖音平台');
                break;
        }

    }
    /**
    * 显示格子广告
    */
    static showGezi() {
        // 判断是否显示广告
        if (!adConfig.isShowAd) return
        switch (gameConfig.system) {
            // 如果是微信平台
            case system.wx:
                wxAd.ins.showGezi()
                console.log('是微信平台');
                break;
            // 如果是抖音平台
            case system.dy:
                console.log('是抖音平台');
                break;
        }

    }
    /**
   * 隐藏格子广告
   */
    static hideGezi() {
        // 判断是否显示广告
        if (!adConfig.isShowAd) return
        switch (gameConfig.system) {
            // 如果是微信平台
            case system.wx:
                wxAd.ins.hideGezi()
                console.log('是微信平台');
                break;
            // 如果是抖音平台
            case system.dy:
                console.log('是抖音平台');
                break;
        }

    }
    /**
  * 显示插屏广告
  */
    static showChaPing(delay = 0) {
        // 判断是否显示广告
        if (!adConfig.isShowAd) return
        switch (gameConfig.system) {
            // 如果是微信平台
            case system.wx:
                wxAd.ins.showChapingAd(delay)
                console.log('是微信平台');
                break;
            // 如果是抖音平台
            case system.dy:
                dyAd.ins.showChapingAd()
                console.log('是抖音平台');
                break;
        }

    }
    /**
* 显示视频激励广告
*/
    static async showVideo(callback?: Function) {
        // 判断是否显示广告
        if (!adConfig.isShowAd) return
        switch (gameConfig.system) {
            // 如果是微信平台
            case system.wx:
                try {
                    const isCompleted = await wxAd.ins.showVideoAd()
                    if (isCompleted) {
                        callback()
                        console.log('视频广告播放完成');
                    } else {
                        console.log('视频广告未播放完成');
                    }
                } catch (err) {
                    console.error('广告显示失败:', err);
                }
                console.log('是微信平台');
                break;
            // 如果是抖音平台
            case system.dy:
                try {
                    const isCompleted = await dyAd.ins.showVideoAd()
                    if (isCompleted) {
                        callback()
                        console.log('视频广告播放完成');
                    } else {
                        console.log('视频广告未播放完成');
                    }
                } catch (err) {
                    console.error('广告显示失败:', err);
                }
                console.log('是抖音平台');
                break;
        }
    }
}


