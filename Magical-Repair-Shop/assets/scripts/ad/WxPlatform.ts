import { _decorator, Component, Node, UITransform } from 'cc';
import { WECHAT } from 'cc/env';
import { Global } from '../Global';
import { Tools } from '../Tools';
const { ccclass, property } = _decorator;

@ccclass('WxPlatform')
export class WxPlatform {
    static _ins: WxPlatform;
    public wx = window["wx"];

    pic = [{
        id: "84l4VgDeQZ+R2QqpibSNYg==",
        url: "https://mmocgame.qpic.cn/wechatgame/ibbKY7Jv7ASqsSMBJA5KAYPQCrovmBCx5MyffGbiaAJQfDDSyoTKaZ8YhOMkqVLsju/0"
    },
    {
        id: "LhmP8rziRiew8PBc/lVJHg==",
        url: "https://mmocgame.qpic.cn/wechatgame/ibotg8KzdzXQIk1E3CZFqly1fkuT0LORZ0YACKMwiblytuj9Aj1a3pvzspOib2ciaHwZ/0"
    },
    {
        id: "eVHb33MsTOmvwkcFlaJc2Q==",
        url: "https://mmocgame.qpic.cn/wechatgame/VTGJ9sV7zbYzmMQumA2DvQHQmXs5sI750ZpEyU2Q3SKaPUneSfDGcVGyFXBCICn2/0"
    },
    {
        id: "aD9k2tmXRGyke+5sr+fzww==",
        url: "https://mmocgame.qpic.cn/wechatgame/vnZykRa9B0g18aIpbIDLXNCic1BvpPuJEIjc0Xjf5SwcGpxV0BcmPcWk4vRDjY5fP/0"
    },
    {
        id: "RNk8TJtgQJ+H6tylz8/6pw==",
        url: "https://mmocgame.qpic.cn/wechatgame/sESCWcr5Zlmu23YQWYQialPHG8dxLF7Tl4Hv7U0Lrs3wZnGkSrcEV3cpiauW4bibGyJ/0"
    },
    {
        id: "p1z1WUNNQN+oxq8nAQnW6w==",
        url: "https://mmocgame.qpic.cn/wechatgame/WicPqJpD3POQPHJbrEw6Kj9DpaFE3NGR12pR2kRoRdLdfJ1Bfibh9Mib2xMHicodVoTO/0"
    },
    {
        id: "l5Mu+ThoS0SU8tX980bOBg==",
        url: "https://mmocgame.qpic.cn/wechatgame/EEGZff8O4XHI5yvKibDK0xxvpcnQrrD3V3d3ljGia83ibLWfL2f1Za3xibicaq8RlsVeE/0"
    },
    {
        id: "/A+pksBIQLeRKsONIrzRYA==",
        url: "https://mmocgame.qpic.cn/wechatgame/a9b7WszNHJw8XibMu0BNfmuWWu2ar7yRutX4xpMic61DibKGYcHiczBJB4gAqiaQFVXvl/0"
    },
    {
        id: "eIKI6dB1ShuaWC29mjCc9g==",
        url: "https://mmocgame.qpic.cn/wechatgame/KFDCxibxcuJCqONcJmibzxKjHX18oib97hicJyjAvUBHMzLlzAwRjqibrW8QLnUFNSzCQ/0"
    },
    {
        id: "hG8PxOhmSPiiLtulY9zkHQ==",
        url: "https://mmocgame.qpic.cn/wechatgame/GwSdgKwvXxjxegwNUKejbR3I56DeIIqTmaCjsStUehknbCX0MFicCGePOvt5M2Oicib/0"
    },
    {
        id: "KP02lv/qSyOXOoCPh1I9gA==",
        url: "https://mmocgame.qpic.cn/wechatgame/9U34X6oRIQwwpyN760QAjljNZGs1WJQfrULfNnpK0fOmtm6hbv5KveV2xtp5xic8v/0"
    },
    {
        id: "qMWrC2W9Sr6aizsnTmMQVw==",
        url: "https://mmocgame.qpic.cn/wechatgame/x9tzjOhpWf78DrsnWpmv9hdpBr5LxicmZl71iaayD2nUvHOlsYMMvAXicwEL6ZuIneD/0"
    },
    {
        id: "++uQ5z6eQti7P4EUTNNPkg==",
        url: "https://mmocgame.qpic.cn/wechatgame/9aa5bdbJNB9eYrAmkOmFeqfOicjFQOYWRjLPI1ibjpMUjpJBpAZIMJY4ia4bOjFI5BL/0"
    },
    {
        id: "9AXEiRpSQ6ysrQjlekK12g==",
        url: "https://mmocgame.qpic.cn/wechatgame/WXIOCKvd6fZhTQicBcjm7jFhchPDhovFXHShWcXMKjdgibQlp2Md5gVVPNhdHFv3pF/0"
    }]

    static get ins() {
        if (!this._ins) {
            this._ins = new WxPlatform();
        }
        return this._ins;
    }

    wechat_setting() {
        console.log("1 执行 wechat_setting", WECHAT);
        if (!WECHAT) {
            return;
        }
        this.wx.showShareMenu({
            withShareTicket: true,
            menus: ['shareAppMessage', 'shareTimeline']
        });
        //upgrade 
        const updateManager = this.wx.getUpdateManager()
        updateManager.onCheckForUpdate(function (res) {
            console.log("请求完新版本信息的回调", res.hasUpdate);
        })
        let self = this;
        updateManager.onUpdateReady(function () {
            self.wx.showModal({
                title: '更新提示',
                content: '新版本已经准备好，是否重启应用？',
                success(res) {
                    if (res.confirm) {
                        // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                        updateManager.applyUpdate()
                    }
                }
            })
        })
        
        updateManager.onUpdateFailed(function () {
            console.log("新版本下载失败")
        })
       
        this.wx.onShareAppMessage(function () {
            let pic_data = self.get_random_pic();
            return {
                title: '太难了吧',
                imageUrlId: pic_data.id, // 图片 id
                imageUrl: pic_data.url // 图片 URL
            }
        })

    }

    show_interstitial(delay = 0) {
        console.log("显示差评广告》〉》〉》〉》〉》〉》〉》");
        if (!WECHAT) {
            return;
        }
        let ad_video_id = Global.ad_intersitial_id;
        let interstitialAd = this.wx.createInterstitialAd({
            adUnitId: ad_video_id.trim(),
        });
        if (interstitialAd) {
            interstitialAd.load().then(() => {
                console.log('插屏广告加载成功');
            });
            interstitialAd.onClose(res => {
                console.log('关闭插屏广告', res);
            });
            interstitialAd.onError(err => {
                console.log('err:插屏广告加载失败', err);
            });

            setTimeout(() => {
                interstitialAd.show().catch((err) => {
                    console.log('插屏广告展示失败', err);
                });
            }, delay * 1000);
        }
    }

    rewardVideo: any;
    show_reward_video(callback: Function) {
        let my = this;
        let ad_video_id = Global.ad_video_id;
        if (my.rewardVideo != null) {
            my.rewardVideo.offClose(fun);
        }
        let rewardedVideoAd = this.wx.createRewardedVideoAd({
            adUnitId: ad_video_id.trim(),
        });
        my.rewardVideo = rewardedVideoAd;
        rewardedVideoAd.load().then(() => {
            this.wx.showToast({
                title: "看完视频领奖励",
                icon: 'success',
                duration: 1500,
                mask: false,
                success: function () { },
                fail: function () { },
                complete: function () { }

            })
            console.log('视频 广告加载成功');
            rewardedVideoAd.show();
        });   
        rewardedVideoAd.onError(err => {
            console.log('激励视频 广告显示失败', err);
            this.wx.showToast({
                title: "请稍后再试",
                icon: 'fail', 
                duration: 1500,
                mask: false,
                success: function () { },
                fail: function () { },
                complete: function () { }
            })
            callback(2);
        })
        var fun = function (res) {
            if (res && res.isEnded) {
                console.log('res:  ', res);
                callback(1);
                rewardedVideoAd.offClose(fun);
            } else {
                console.log('播放中退出');
                callback(0);
            }
        }
        rewardedVideoAd.onClose(fun);
    }


    banner: any;
    banner_show_status: boolean = false;
    hide_banner() {
        this.banner_show_status = false;
        if (this.banner != null) {
            this.banner.destroy();
            this.banner = null;
            console.log('关闭 banner...');
        }
    }

    show_banner(style = 2) {
        if (!WECHAT) {
            return;
        }
        if (this.banner != null) {
            this.banner.destroy();
            this.banner = null;
            return;
        }
        this.banner_show_status = true;

        let ad_banner_id = Global.ad_banner_id;
        console.log('showBanner start ad_banner_id::', ad_banner_id);
        let winSize = this.wx.getSystemInfoSync();
        let bannerAd = this.wx.createBannerAd({
            adUnitId: ad_banner_id,
            adIntervals: 30,
            style: {
                left: 0,
                top: 500,
                width: 300,
            }
        })
        let left;
        if (style == 1) {
            left = winSize.windowWidth - bannerAd.style.realWidth;
        }
        else if (style == 2) {
            left = winSize.windowWidth / 2 - bannerAd.style.realWidth / 2;
        }
        else {
            left = 0;
        }
        bannerAd.onResize(res => {
            bannerAd.style.top = winSize.windowHeight - bannerAd.style.realHeight;
            bannerAd.style.left = left;
        })
        bannerAd.onLoad(() => {
            console.log('banner 广告加载成功');
            this.banner = bannerAd;
            if (!this.banner_show_status) {
                //不应该显示，需要隐藏
                this.hide_banner();
                console.log('错误出发，关闭bannner');
                // this.wx.showToast({
                //     title: "错误出发，关闭bannner",
                //     icon: 'success',
                //     duration: 1500,
                //     mask: false,
                //     success: function () { },
                //     fail: function () { },
                //     complete: function () { }

                // })
            }
        })
        bannerAd.onError(err => {
            console.log('banner 广告加载错误', err);
        })
        bannerAd.show();
    }


    custom: any;
    show_custom_ad(callback: Function) {
        if (!WECHAT) {
            return;
        }
        let ad_custom_id = Global.ad_custom_id;
        let winSize = this.wx.getSystemInfoSync();
        let style = {
            // width: winSize.screenWidth ,
            left: winSize.screenWidth - 70,
            top: winSize.screenHeight / 2 - 150,
            fixed: true,
        }
        if (this.custom) {
            this.custom.show();
            return;
        }
        let custom_ad = this.wx.createCustomAd({
            adUnitId: ad_custom_id,
            style: style
        });
        custom_ad.onLoad(() => {
            console.log('原生模板 广告加载成功');
            callback(1);
            custom_ad.show().then(() => console.log('原生模板 广告显示成功')).catch((err) => {
                console.log("原生模板 广告显示失败", err)
                callback(0);
            })
            this.custom = custom_ad;
        })
        custom_ad.onClose(res => {
            console.log('关闭原生模板广告', res);
            this.custom.destroy();
            this.custom = null;
            // this.wx.showToast({
            //     title: "原生模板关闭",
            //     // icon: 'success',
            //     duration: 1500,
            //     mask: false,
            //     success: function () { },
            //     fail: function () { },
            //     complete: function () { }
            // })
        });
        custom_ad.onError(err => {
            console.log('原生模板CustomAd 广告加载失败：', err);
            callback(0);
        });
    }


    show_share() {
        let pic_data = this.get_random_pic();
        console.log("分享开始");
        if (WECHAT) {
            this.wx.shareAppMessage({
                title: "听说集齐七颗龙珠就能召唤神龙",
                imageUrlId: pic_data.id, // 图片 id
                imageUrl: pic_data.url // 图片 URL
            })
        }
    }

    get_random_pic() {
        let pic_data = null;
        try {
            pic_data = this.pic[Tools.random_between_floor(0, this.pic.length)];
        } catch (e) {
            console.log("get_random_pic error:", e);
        }
        if (!this.pic) {
            pic_data = this.pic[0];
        }
        return pic_data;
    }


}

