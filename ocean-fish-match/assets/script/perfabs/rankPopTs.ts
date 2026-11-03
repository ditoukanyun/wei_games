import { _decorator, assetManager, Component, ImageAsset, instantiate, Label, Node, Prefab, resources, ScrollView, Sprite, SpriteFrame, Texture2D, tween, UITransform, Vec3 } from 'cc';
import { donghuaTs } from '../ctrl/donghuaTs';
import { local } from '../data/enume';
import { load, save } from '../unitls/tools';
import { gameConfig } from '../data/gameConfig';
const { ccclass, property } = _decorator;
const wx = window['wx'];

@ccclass('rankPopTs')
export class rankPopTs extends Component {
    // 滚动视图组件
    @property(ScrollView)
    scrollView: ScrollView;
    // 弹窗
    @property(Node) UIPop: Node
    // 排行榜项的预制体
    @property(Prefab) leaderboardItem: Prefab
    // 排行榜内容的容器节点
    @property(Node) content: Node = null;
    // 加载显示
    @property(Node) loading: Node = null;
    // 个人id
    private playId = null
    // 个人名次
    private index = null
    protected onEnable(): void {
        this.init()
    }
    async init() {
        // 显示弹窗动画
        donghuaTs.ins.popJinDh(this.UIPop)
        // 加载显示
        this.loading.active = true
        this.content.removeAllChildren()
        // 滚动视图滚动到顶部
        this.scrollView.scrollToTop(0);
        // 本机最高分；没有远端服务时不伪造其他玩家。
        this.playId = 'local-player';
        this.index = null;
        const score = Math.max(Number(load('bestScore')) || 0, gameConfig.score || 0, Number(load(local.LastScore)) || 0);
        save('bestScore', score);
        const user = load(local.userInfo, 2) || {};
        const me = { playerId: this.playId, playerInfo: { avatarUrl: user.avatarUrl || '', nickName: user.nickName || '我（本机）' }, score: String(score) };
        const rankData = score > 0 ? [me] : [];
        // 获取数据后更新滚动视图高度
        let hei = (100 + 0) * rankData.length
        this.content.getComponent(UITransform).setContentSize(513, hei)

        const rankList = rankData
        if (rankList) {
            // 加载显示
            this.loading.active = false
            for (let i = 0; i < rankList.length; i++) {
                this.updateRankList(rankList[i], i)
            }
        }
        this.updateUseScore(me, this.index)
    }
    /**
    * 更新个人排名
    */
    updateUseScore(data?, index?) {
        // 获取个人分数节点
        let node = this.node.getChildByPath('popUI/PlayerItem')
        node.getChildByName('rank').active = index != null && index < 3;
        node.getChildByName('rankLabel').getComponent(Label).string = '';
        if (index != null) {
            switch (index) {
                // 根据排行榜项的索引设置排名图标
                case 0: this.loadResourceSprite(node.getChildByName('rank').getComponent(Sprite), 'pop/排行/1/spriteFrame')
                    break;
                case 1: this.loadResourceSprite(node.getChildByName('rank').getComponent(Sprite), 'pop/排行/2/spriteFrame')
                    break;
                case 2: this.loadResourceSprite(node.getChildByName('rank').getComponent(Sprite), 'pop/排行/3/spriteFrame')
                    break;
                default: node.getChildByName('rankLabel').getComponent(Label).string = String(index + 1)
                    node.getChildByName('rank').active = false;
                    break;
            }
        } else {
            node.getChildByName('rankLabel').getComponent(Label).string = '未上榜'
            node.getChildByName('rank').active = false;
        }
        // 通过请求远端服务器获取图像
        if (data?.playerInfo.avatarUrl) {
            assetManager.loadRemote<ImageAsset>(data.playerInfo.avatarUrl, { ext: '.png' }, (err, imageAsset) => {
                if (err) {
                    console.log('加载远程图片失败');
                    return;
                }
                const spriteFrame = new SpriteFrame();
                const texture = new Texture2D();
                texture.image = imageAsset;
                spriteFrame.texture = texture;
                //节点spriteFrame替换成获取到的图片
                node.getChildByPath("userInfo/mask/avator").getComponent(Sprite).spriteFrame = spriteFrame
            });
            // 设置玩家昵称标签的文本。
            node.getChildByPath("userInfo/name").getComponent(Label).string = data.playerInfo.nickName;
            //设置分数标签的文本
            node.getChildByPath("scoreNode/score").getComponent(Label).string = data.score;
        } else {
            // 设置玩家昵称标签的文本。
            node.getChildByPath("userInfo/name").getComponent(Label).string = data?.playerInfo.nickName || "我（本机）";
            //设置分数标签的文本
            node.getChildByPath("scoreNode/score").getComponent(Label).string = data?.score || '0';
        }
    }
    /**
    * 更新游戏排行榜行数据
    */
    updateRankList(data: any, index: number) {
        // 实例化排行榜项预制体
        const node = instantiate(this.leaderboardItem);
        // 将生成的排行榜项节点添加到 content 节点下
        node.parent = this.content
        // 设置排行榜项节点的初始位置
        node.position = new Vec3(-510, -60 - index * 100, 0)
        // 排行前三
        switch (index) {
            // 根据排行榜项的索引设置排名图标
            case 0: this.loadResourceSprite(node.getChildByName('rank').getComponent(Sprite), 'pop/排行/1/spriteFrame')
                break;
            case 1: this.loadResourceSprite(node.getChildByName('rank').getComponent(Sprite), 'pop/排行/2/spriteFrame')
                break;
            case 2: this.loadResourceSprite(node.getChildByName('rank').getComponent(Sprite), 'pop/排行/3/spriteFrame')
                break;
            default: node.getChildByName('rankLabel').getComponent(Label).string = String(index + 1)
                node.getChildByName('rank').active = false;
                break;
        }
        // 通过请求远端服务器获取图像
        if (data.playerInfo.avatarUrl) {
            assetManager.loadRemote<ImageAsset>(data.playerInfo.avatarUrl, { ext: '.png' }, (err, imageAsset) => {
                if (err) {
                    console.log('加载远程图片失败');
                    return;
                }
                const spriteFrame = new SpriteFrame();
                const texture = new Texture2D();
                texture.image = imageAsset;
                spriteFrame.texture = texture;
                //节点spriteFrame替换成获取到的图片
                node.getChildByPath("userInfo/mask/avator").getComponent(Sprite).spriteFrame = spriteFrame
            });
        }
        // 如果当前排行榜项是当前玩家的信息，则设置玩家信息
        if (data && this.playId != null && data.playerId === this.playId) {
            // 设置玩家昵称标签的文本。
            node.getChildByPath("userInfo/name").getComponent(Label).string = data.playerInfo.nickName || "我";
            // 加载背景资源并设置到背景精灵组件上。
            this.loadResourceSprite(node.getChildByName('bg').getComponent(Sprite), 'pop/排行/inrank_item_bg/spriteFrame')
            //设置分数标签的文本
            node.getChildByPath("scoreNode/score").getComponent(Label).string = (data && data.score) ? data.score : 0;
            // 如果在100名内，获取本人名次
            this.index = index
        } else {
            // 如果当前排行榜项不是当前玩家的信息，则设置其他玩家信息。
            node.getChildByPath("userInfo/name").getComponent(Label).string = (data && data.playerInfo?.nickName) ? data?.playerInfo?.nickName : "";
            node.getChildByPath("scoreNode/score").getComponent(Label).string = (data && data.score) ? data.score : 0;
        }
        tween(node).to(1 * index * 0.1, { position: new Vec3(0, -60 - index * 100, 0) }).start()
    }
    /**
     * 关闭弹窗
     */
    calback() {
        // 关闭弹窗动画
        tween(this.UIPop).to(0.2, { scale: new Vec3(0, 0, 0) }).call(() => {
            this.node.active = false
        }).start()
    }
    /**
    * 加载本地资源
    * @param sprite 
    * @param path 
    */
    loadResourceSprite(sprite: Sprite, path: string) {
        // 加载指定路径的资源
        resources.load(path, SpriteFrame, (err, spriteframe) => {
            if (err) {
                console.log(err)
                return
            }
            // 如果加载成功，将资源设置到精灵组件上
            sprite.spriteFrame = spriteframe
        })
    }
}


