import { _decorator, Component, Node, sys } from 'cc';
import { WxPlatform } from './WxPlatform';
import { Global } from '../Global';
import { BytePlantform } from '../BytePlantform';
const { ccclass, property } = _decorator;

@ccclass('AdManger')
export class AdManger {

    static show_interstial(delay = 0) {
        const system = sys.platform;
        switch (system) {
            case sys.Platform.WECHAT_GAME:
                // WxPlatform.ins.show_interstitial(delay);
                WxPlatform.ins.show_interstitial(1);
                break;
            case sys.Platform.BYTEDANCE_MINI_GAME:
                // WxPlatform.ins.show_interstitial(delay);
                BytePlantform.ins.show_interstitial(1);
                break;
        }
    }
    //视频激励广告
    static show_video(callback: Function) {
        const system = sys.platform;
        switch (system) {
            case sys.Platform.WECHAT_GAME:
                WxPlatform.ins.show_reward_video((data) => {
                    if (data == 1) {
                        callback(data);
                        console.log("show_video 获取奖励成功");
                    } else {
                        callback(data);
                        //  Global.Pause(false);
                        console.log("show_video 获取奖励失败");
                    }
                })
                break;
            case sys.Platform.BYTEDANCE_MINI_GAME:
                BytePlantform.ins.ShowAdvertisements((data) => {
                    if (data == 1) {
                        callback(data);
                        console.log("show_video 获取奖励成功");
                    } else {
                        callback(data);
                        //  Global.Pause(false);
                        console.log("show_video 获取奖励失败");
                    }
                })
                break;
            case sys.Platform.MOBILE_BROWSER:
                callback(1);
                break;
            case sys.Platform.DESKTOP_BROWSER:
                callback(1);
                break;
            default:
                callback(0);
                break;
        }
    }

    static show_banner() {
        // const system = sys.platform;
        // switch (system) {
        //     case sys.Platform.WECHAT_GAME:
        //         WxPlatform.ins.show_banner();
        //         break;
        //     case sys.Platform.BYTEDANCE_MINI_GAME:
        //         BytePlantform.ins.show_banner();
        //         break;
        // }
    }

    static close_ad() {
        const system = sys.platform;
        switch (system) {
            case sys.Platform.WECHAT_GAME:
                WxPlatform.ins.hide_banner();
                break;
            case sys.Platform.BYTEDANCE_MINI_GAME:
                BytePlantform.ins.hide_banner();
                break;
        }
    }
}

