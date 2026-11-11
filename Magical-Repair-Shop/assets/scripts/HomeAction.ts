import { ResolutionPolicy, view } from 'cc';
import { WorkshopEnamel } from './WorkshopEnamel';
import { WorkshopAssets } from './WorkshopAssets';
import { WorkshopTheme } from './WorkshopTheme';
import { _decorator, Button, Component, director, game, instantiate, Node, Sprite, tween, Vec3 } from 'cc';
import ResourceManger from './ResourceManger';
import { AssetType, Clips } from './Enums';
import { AudioManger } from './AudioManger';
import { Tools } from './Tools';
import { Global } from './Global';
import { ResourcePool } from './ResourcePool';
import { LevelAction } from './LevelAction';
import { WxPlatform } from './ad/WxPlatform';
import { LayerAction } from './LayerAction';
import { ElementAction } from './ElementAction';
import { UnitAction } from './UnitAction';
import { BytePlantform } from './BytePlantform';
const { ccclass, property } = _decorator;

@ccclass('HomeAction')
export class HomeAction extends Component {

    @property({ type: Node })
    logo: Node = null;
    @property(Sprite)
    load: Sprite = null;
    @property({ type: Node })
    btns_layer: Node = null;

    @property({ type: Node })
    star: Node;

    @property({ type: Node })
    tip_node: Node;

    private isload = true;
    load_num = 0;

    @property({ type: String })
    ad_intersitial_id: string;
    @property({ type: String })
    ad_video_id: string;
    @property({ type: String })
    ad_banner_id: string;
    // @property({ type: String })
    // ad_custom_id: string;

    onLoad() {
        view.setDesignResolutionSize(640, 1280, ResolutionPolicy.SHOW_ALL);
        game.frameRate = 60;
        // if (this.tip_node) {
        //     this.tip_node.active = false;
        // }
    }

    async play_tip() {
        if (!this.tip_node) {
            return;
        }
        this.tip_node.active = true;
    }

    play_star(a: number) {
        if (!this.star || !this.star.activeInHierarchy) {
            return;
        }
        let self = this;
        tween(this.star).by(5, { angle: a }, { easing: 'quadInOut' }).call(() => {
            this.star.angle = 0;
            self.play_star(a * -1);
        }).start();
    }

    play_logo() {
        // if (!this.logo) {
        //     return;
        // }
        // this.logo.setScale(3.5, 3.5);
        // tween(this.logo)
        // .to(0.25, { scale: new Vec3(0.8, 0.8) }, { easing: 'quadInOut' })
        // .to(0.20, { scale: new Vec3(1.2, 1.2) }, { easing: 'quadInOut' })
        // .to(0.1, { scale: new Vec3(0.9, 0.9) }, { easing: 'quadInOut' })
        // .to(0.1, { scale: new Vec3(1.1, 1.1) }, { easing: 'quadInOut' })
        // .to(0.05, { scale: new Vec3(1, 1) }, { easing: 'quadInOut' })
        // .call(() => {
        // }).start();

        this.play_tip();
    }



    async start() {
        WorkshopTheme.apply(this.node, true);
        this.play_logo();
        this.play_star(360);
        this.btns_layer.active = false;
        Global.ad_intersitial_id = this.ad_intersitial_id;
        Global.ad_video_id = this.ad_video_id;
        Global.ad_banner_id = this.ad_banner_id;
        // Global.ad_custom_id = this.ad_custom_id;
        WxPlatform.ins.wechat_setting();
        BytePlantform.ins.bytedance_setting();
        await this.loadRes();

    }

    private ready = false;
    private entering = false;

    async loadRes() {
        Global.loading_rate = 0;
        this.ready = false;
        try {
            await Promise.all([
                WorkshopAssets.load(),
                WorkshopAssets.preloadScrew(),
                WorkshopEnamel.load(),
                new Promise<void>((resolve, reject) => {
                    director.preloadScene("main", (error) => error ? reject(error) : resolve());
                }),
                (async () => {
                    await ResourceManger.instance.load_bundle("bundle", 0.2);
                    await Promise.all([
                        ResourceManger.instance.load_resource("bundle", AssetType.Prefab, 0.6),
                        ResourceManger.instance.load_resource("bundle", AssetType.Sound, 0.2),
                    ]);
                })(),
            ]);
            if (!this.isValid) return;
            Global.loading_rate = 1;
            this.ready = true;
            this.show_btns();
        } catch (error) {
            console.error("游戏资源加载失败，请重新进入游戏", error);
            if (this.isValid) this.btns_layer.active = false;
        }
    }

    start_game() {
        if (!this.ready || this.entering) return;
        this.entering = true;
        director.loadScene("main", (error) => {
            if (error && this.isValid) {
                this.entering = false;
                console.error("进入游戏失败", error);
            }
        });
    }

    show_btns() {
        if (!this.ready) return;
        this.btns_layer.active = true;
        const loading = this.node.getChildByName("loading");
        if (loading) loading.active = false;
        const loadingLabel = this.node.getChildByName("loading_label");
        if (loadingLabel) loadingLabel.active = false;
        if (!this.btns_layer.children.some(btn => btn.active)) this.start_game();
    }

    update(deltaTime: number) {
        if (this.load) this.load.fillRange = Math.max(0, Math.min(1, Global.loading_rate));
    }

    check_lvl_data() {
        this._unit_data();
        this._lvl_data();

        let arr = ResourcePool.instance.get_prefabs_for_unit();
        console.log(">>>", arr);
    }
    _unit_data() {
        console.log("--------------------unit检查开始--------------------");
        let arr = ResourcePool.instance.get_prefabs_for_unit();
        arr.forEach(level_prebab => {

            let lvl_node = instantiate(level_prebab);
            let pin_total = lvl_node.getComponent(UnitAction).get_hole_num();
            let d = pin_total % 3;
            console.log(lvl_node.name, " >>>>>");
            let msg = "没问题"
            if (d == 1) {
                msg = "     数据错误，关卡钉子（空洞）多了1个";
            } else if (d == 2) {
                msg = "     数据错误，关卡钉子（空洞）多了2个";
            }
            console.log("      钉子总数：", pin_total, "取模:", pin_total % 3, "提示》 ", msg);
        });

    }
    _lvl_data() {
        console.log("--------------------等级数据安全性--------------------");
        for (let lvl = 1; lvl <= 150; lvl++) {
            console.log(lvl, " lvl>>>>>");
            let level_prebab = ResourcePool.instance.get_prefab("lvl_" + lvl);
            if (!level_prebab) {
                console.log(lvl, "      没有这个等级");
                break;
            }
            let lvl_node = instantiate(level_prebab);

            let pin_total = 0;
            lvl_node.children.forEach(element => {
                if (element.getComponent(UnitAction)) {
                    pin_total += element.getComponent(UnitAction)?.get_hole_num();
                }
                if (element.getComponent(LayerAction)) {
                    pin_total += element.getComponent(LayerAction)?.get_hole_num();
                }
            });

            let d = pin_total % 3;
            let msg = "没问题"
            if (d == 1) {
                msg = "     数据错误，关卡钉子（空洞）多了1个";
            } else if (d == 2) {
                msg = "     数据错误，关卡钉子（空洞）多了2个";
            }
            console.log("      钉子总数：", pin_total, "取模:", pin_total % 3, "提示》 ", msg);


            {
                lvl_node.children.forEach(unit_node => {
                    // console.log("init_level this.node>>>>>:", this.node);
                    console.log("      钉子总数：", unit_node.name, "       unit 检查");
                    let unit_action = unit_node.getComponent(UnitAction);
                    if (!unit_node.active) {
                        console.log("错误》〉", "  unit node  是隐藏的");
                    }
                    if (!unit_action) {
                        console.log("错误》〉", " unit action错误");
                    }

                    unit_node.children.forEach(layer_node => {
                        if (!layer_node.active) {
                            console.log("    ", layer_node.name, "layer ", "错误》〉", "layer_node>>是隐藏的");
                        }
                        let layer_action = layer_node.getComponent(LayerAction);
                        if (!layer_action) {
                            console.log("    ", layer_node.name, "layer ", "错误》〉", "layer aciont>> 错误");
                        }
                        {
                            layer_node.children.forEach(ele_node => {
                                if (!ele_node.active) {
                                    console.log("    ", layer_node.name, "layer ", "错误》〉", ele_node.name, " 是隐藏的");
                                }
                                if (!ele_node.getComponent(ElementAction)) {
                                    console.log("    ", layer_node.name, "layer ", "错误》〉", ele_node.name, " action 错误");
                                }
                            })
                        }
                    })
                    // console.log("获取钉子数量：",num,layer_node.active);
                });
            }
        }
    }


    btn_to_test() {
        AudioManger.instance.playSound(Clips.btn_1);
        director.loadScene("test");
    }
}

