import { _decorator, Component, Node } from 'cc';
import { Global } from './Global';
import { CheckPlantform } from './CheckPlantform';
import { BYTEDANCE, WECHAT } from 'cc/env';
import { WxPlatform } from './ad/WxPlatform';

const { ccclass, property } = _decorator;

@ccclass('BytePlantform')
export class BytePlantform extends Component {
    static _ins: BytePlantform;
    public tt = window["tt"];
    static get ins() {
        if (!this._ins) {
            this._ins = new BytePlantform();
        }
        return this._ins;
    }

    is_douyin(): boolean {
        if (typeof BYTEDANCE !== 'undefined') {
            return BYTEDANCE;
        }
        return this.tt !== null && this.tt !== undefined;
    }

     listen_douyin(onResult: (success: boolean) => void, target?: any) {
        if (!this.is_douyin()) {
            onResult?.call(target, false);
            return;
        }
        this.tt.onShow((res: any) => {
            console.log('onShow data  res:', res);
            if (res.scene === '021036') {
                onResult?.call(target, true);
            } else {
                onResult?.call(target, false);
            }
        });
        let options = this.tt.getLaunchOptionsSync();
        if (options && options.scene === '021036') {
            onResult?.call(target, true);
        }
    }

   check_side_bar(onResult: (success: boolean) => void, target?: any) {
        if (!this.is_douyin()) {
            onResult?.call(target, false);
            return;
        }
        this.tt.checkScene({
            scene: "sidebar",
            success: (res: any) => {
                console.log("check scene success: ",res, res.isExist);
                onResult?.call(target, <boolean>res.isExist);
            },
            fail: (res: any) => {
                console.log("check scene fail:",res, res);
                onResult?.call(target, false);
            }
        });
    }

    /**
     * 跳转到抖音侧边栏
     * @param onResult 包含一个boolean参数的函数
     * @param target 上述函数的拥有者，如果是类的成员函数，需要传入this。普通或匿名函数忽略即可。
     * @returns 
     */
    navigate_to_douyin(onResult: (success: boolean) => void, target?: any) {
        if (!this.is_douyin()) {
            console.log("not douyin platform!");
            onResult?.call(target, false);
            return;
        }
        this.tt.navigateToScene({
            scene: "sidebar",
            success: () => {
                console.log("navigate success");
                onResult?.call(target, true);
            },
            fail: (res: any) => {
                console.log("navigate failed reason:", res);
                onResult?.call(target, false);
            },
        });
    }


    bytedance_setting() {
        console.log("1 执行 BYTEDANCE_setting", BYTEDANCE);
        if (!BYTEDANCE) {
            return;
        }
        const updateManager = this.tt.getUpdateManager();
        let self = this;
        updateManager.onUpdateReady((res) => {
            this.tt.showModal({
                title: "更新提示",
                content: "新版本已经准备好，是否重启小游戏？",
                success: (res) => {
                    if (res.confirm) {
                        // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                        updateManager.applyUpdate();
                    }
                },
            });
        });
        // updateManager.onCheckForUpdate((res) => {
        //     // 请求完新版本信息的回调
        //     if (!res.hasUpdate) {
        //       this.tt.showToast({
        //         title: "无可用更新版本",
        //         icon: "none",
        //       });
        //     }
        //   });

        updateManager.onUpdateFailed((err) => {
            // 新的版本下载失败
            console.log("版本下载失败原因", err);
            this.tt.showToast({
                title: "新版本下载失败，请稍后再试",
                icon: "none",
            });
        });


        this.tt.getSystemInfo({
            success(res) {
              console.log("getSystemInfo success ",res);
            },
            fail(res) {
              console.log(`getSystemInfo 调用失败`,res);
            },
            complete(res) {
                console.log(`getSystemInfo complete`,res);
              },
          });

         this.tt.onShareAppMessage(function (res) {
            //当监听到用户点击了分享或者拍抖音等按钮后，会执行该函数
            console.log("分享开始1L",res.channel);
            // let pic_data = WxPlatform.ins.get_random_pic();
            // console.log("分享开始2L",pic_data);
            // do something
            return {
              //执行函数后，这里是需要该函数返回的对象
              title: "这也太难了吧",
              imageUrl: '',//pic_data.url,
              query: "k1=v1&k2=v2",
              success() {
                console.log("分享成功");
              },
              fail(e) {
                console.log("分享失败", e);
              },
            }; //返回的对象会传入tt.shareAppMessage进行最终分享
          });

    }


    show_interstitial(delay = 0) {

        let ad_intersitial_id = Global.ad_intersitial_id;
        console.log("显示插屏广告》〉》〉》〉》〉》〉》〉》", ad_intersitial_id);
        let interstitialAd = this.tt.createInterstitialAd({
            adUnitId: ad_intersitial_id.trim(),
        });
        if (interstitialAd) {
            interstitialAd.load()
                .then(() => {
                    interstitialAd.show().then(() => {
                        console.log("插屏广告展示成功");
                    });
                })
                .catch((err) => {
                    console.log(err);
                });
            setTimeout(() => {
                interstitialAd.show().catch((err) => {
                    console.log('插屏广告展示失败', err);
                });
            }, delay * 1000);
        }
    }

    /**看完广告后要回调的函数 */
    ShowAdvertisements(callback: Function) {
        let ad_video_id = Global.ad_video_id;
        console.log("显示视频广告》〉》〉》〉》〉》〉》〉》", ad_video_id);
        const videoAd = this.tt.createRewardedVideoAd({
            adUnitId: ad_video_id.trim(),
        });
        videoAd.onClose(listener);
        videoAd.show()?.then(() => {
            console.log("视频广告展示");
        });
        videoAd.onError()?.then(() => {
            console.log("广告无法播放");
            callback(2);
        });
        function listener(res) {
            if (res.isEnded) {
                callback(1);
                console.log("注销广告关闭监听1 ");
                // 注销广告关闭监听
                videoAd.offClose(listener);
            } else {
                console.log("注销广告关闭监听0 ");
                callback(0);
            }
        }
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

        if (this.banner != null) {
            this.banner.destroy();
            this.banner = null;
            return;
        }
        this.banner_show_status = true;

        let ad_banner_id = Global.ad_banner_id;

        // let winSize = this.tt.getSystemInfoSync();
        const { windowWidth, windowHeight } = this.tt.getSystemInfoSync();
        // const targetBannerAdWidth = 200;
        console.log('showBanner start ad_banner_id::', ad_banner_id.trim(), windowWidth, windowHeight);
        {
            const { windowWidth, windowHeight } = this.tt.getSystemInfoSync();
            const targetBannerAdWidth = 200;

            // 创建一个居于屏幕底部正中的广告
            let bannerAd = this.tt.createBannerAd({
                adUnitId: ad_banner_id.trim(),
                style: {
                    width: targetBannerAdWidth,
                    top: 0//windowHeight - (targetBannerAdWidth / 16) * 9, // 根据系统约定尺寸计算出广告高度
                  },
            });
            // 也可以手动修改属性以调整广告尺寸
            bannerAd.style.left = (windowWidth - targetBannerAdWidth) / 2;
            // console.log('showBanner bannerAd.style 1:', bannerAd.style);
            // console.log('showBanner windowHeight - (targetBannerAdWidth / 16) * 9:', windowHeight - (targetBannerAdWidth / 16) * 9);
            // bannerAd.style.top = windowHeight - bannerAd.style.realHeight;

            bannerAd.onResize((size) => {
                // good
                console.log(size.width, size.height);
                bannerAd.style.top = windowHeight - size.height;
                bannerAd.style.left = (windowWidth - size.width) / 2;
              
                // bad，会触发死循环
                // bannerAd.style.width++;
              });
            let self = this;
            bannerAd.onLoad(() => {
                console.log('banner 222 广告加载成功');
                this.banner = bannerAd;
                if (!this.banner_show_status) {
                    //不应该显示，需要隐藏
                    console.log('错误出发，关闭bannner');
                    this.hide_banner();
                }else{
                    bannerAd
                    .show()
                    .then(() => {
                        console.log("广告显示成功");
                        setTimeout(() => {
                            // bannerAd.hide();
                            self.hide_banner();
                            console.log("广告隐藏");
                          }, 2000);
                    })
                    .catch((err) => {
                        console.log("广告组件出现问题", err);
                    });
                } 
            });
            bannerAd.onError(err => {
                console.log('banner 广告加载错误', err);
            })
        }
    }
}

