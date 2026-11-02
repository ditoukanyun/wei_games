import { _decorator, Component, instantiate, Node, Prefab, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('shengyuTs')
export class shengyuTs extends Component {
    // 鱼预制体
    @property(Prefab) yuPre = []
    // 随机时间
    private randomTime: number = null
    // 随机类型
    private randomType: number = null
    start() {
        this.init()
    }

    init() {
        // 生成时间
        this.randomTime = Math.floor(Math.random() * (6 - 3) + 3)
        this.schedule(function () {
            // 随机位置
            const randomPosY = Math.floor(Math.random() * 620 - 440)
            // 随机生成时间
            this.randomTime = Math.floor(Math.random() * (8 - 4) + 4)
            // 随机飞行器类型
            this.randomFxq = Math.floor(Math.random() * (this.yuPre.length - 0) + 0)
            let yu = instantiate(this.yuPre[this.randomFxq])
            yu.parent = this.node
            yu.setPosition(new Vec3(0, randomPosY, 0))
        }, this.randomTime, 999999999, 1);
    }
    protected onDestroy(): void {
        this.unscheduleAllCallbacks()
    }
}


