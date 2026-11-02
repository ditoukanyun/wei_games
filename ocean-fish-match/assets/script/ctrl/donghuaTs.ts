import { _decorator, Component, Node, ParticleSystem2D, tween, UITransform, v2, Vec2, Vec3 } from 'cc';
import { loadPool } from '../getRes/loadPool';
import { perName } from '../data/enume';
import { gameConfig } from '../data/gameConfig';
const { ccclass, property } = _decorator;

@ccclass('donghuaTs')
export class donghuaTs extends Component {
    /**
      * 单例
      */
    private static _ins: donghuaTs = null;
    public static get ins() {
        if (!this._ins) {
            this._ins = new donghuaTs();
        }
        return this._ins;
    }
    /**
     * 显示消除时的粒子
     */
    xiaoChuLizi(pos, type) {
        // 生成粒子节点
        let liziNode = loadPool.ins.getPoolNode(perName.lizi, gameConfig.itemNode, pos)
        // 获取粒子组件
        let lizi = liziNode.getComponent(ParticleSystem2D)
        // 粒子贴纸样式修改
        lizi.spriteFrame = type
        // 获取粒子系统的生命周期（持续时间）
        // let time = lizi.life;
        // // 粒子持续时间结束后销毁
        // this.scheduleOnce(function () {
        //     loadPool.ins.huiShouNode(liziNode)
        // }, time);
    }

    /**
    * 图标摆动
    */
    iconDh(node) {
        tween(node).to(0.03, { eulerAngles: new Vec3(0, 0, 12) }).to(0.03, { eulerAngles: new Vec3(0, 0, -12) }).to(0.03, { eulerAngles: new Vec3(0, 0, 0) }).union().repeat(3).by(0.3, { scale: v2(0.2, 0.2) }).by(0.3, { scale: v2(-0.2, - 0.2) }).delay(2).union().repeatForever().start()
    }
    /**
   * 弹窗显示
   */
    popJinDh(node: Node) {
        node.setScale(0, 0)
        tween(node).to(0.2, { scale: new Vec3(1, 1, 1) }).start()
    }
    /**
      * 弹窗关闭
      */
    popchuDh(node: Node, bgNode: Node) {
        tween(node).to(0.2, { scale: new Vec3(0, 0, 0) }).call(() => {
            loadPool.ins.huiShouNode(bgNode)
        }).start()
    }


    /**
     * 组件销毁
     */
    protected onDestroy(): void {
        this.unscheduleAllCallbacks()
    }
}


