import { _decorator, Component, director, Label, Node, Color, Graphics, UITransform } from 'cc';
import { gameConfig } from '../data/gameConfig';
import { emits, local } from '../data/enume';
import { getDayTime, newDayTime, save } from '../unitls/tools';
import { donghuaTs } from './donghuaTs';
const { ccclass, property } = _decorator;

@ccclass('fuliShowTs')
export class fuliShowTs extends Component {
    // 礼包倒计时
    @property(Label) TimeLabel: Label
    // 领取礼包
    @property(Node) libaoLingqu: Node
    // 领取冷却
    @property(Node) libaoLengque: Node
    private getDayTime = null
    protected start(): void {
        this.init()
        director.on(emits.isFuli, this.init, this)
    }
    // 初始化
    init() {
        this.unscheduleAllCallbacks()
        this.TimeLabel.node.setPosition(0, -98, 0)
        this.TimeLabel.fontSize = 24
        this.TimeLabel.lineHeight = 34
        this.TimeLabel.enableWrapText = false
        this.TimeLabel.color = new Color(35, 92, 112)
        this.TimeLabel.node.getComponent(UITransform).setContentSize(154, 38)
        let plate = this.libaoLengque.getChildByName('countdownPlate')
        if (!plate) {
            plate = new Node('countdownPlate')
            plate.layer = this.node.layer
            this.libaoLengque.addChild(plate)
            plate.setSiblingIndex(0)
            plate.setPosition(0, -98, 0)
            plate.addComponent(UITransform).setContentSize(154, 38)
            const g = plate.addComponent(Graphics)
            g.fillColor = new Color(234, 255, 247, 245)
            g.roundRect(-77, -19, 154, 38, 16)
            g.fill()
        }
        if (gameConfig.isFuli) {
            this.libaoLingqu.active = true
            this.libaoLengque.active = false
            donghuaTs.ins.iconDh(this.libaoLingqu)
        } else {
            this.libaoLingqu.active = false
            this.libaoLengque.active = true
            this.getDayTime = getDayTime()
            this.leftDiv()
        }
    }
    /**
  * 用于计算并显示剩余时间的函数
  */
    leftDiv() {
        //   这行代码计算从当前时间到 this.endTime 的剩余时间（以毫秒为单位）
        let leftTime = this.getDayTime - newDayTime();
        //   计算剩余时间中的小时数，并取模 24，确保小时数在 0 到 23 之间
        let leftHours = this.addNumber(
            Math.floor((leftTime / 1000 / 60 / 60) % 24)
        );
        //   计算剩余时间中的分钟数，并取模 60，确保分钟数在 0 到 59 之间。
        let leftMinutes = this.addNumber(Math.floor((leftTime / 1000 / 60) % 60));
        //   计算剩余时间中的秒数，并取模 60，确保秒数在 0 到 59 之间。
        let leftSeconds = this.addNumber(Math.floor((leftTime / 1000) % 60));
        //   将计算好的剩余时间格式化为字符串，并更新 TimeLabel 的文本内容
        this.TimeLabel.string = leftHours + ":" + leftMinutes + ":" + leftSeconds;
        //   如果剩余时间大于 0，使用 setTimeout 每隔 1 秒递归调用 leftDiv 方法，更新剩余时间
        if (leftTime >= 0) {
            this.scheduleOnce(() => {
                this.leftDiv()
            }, 1)
        } else {
            // 如果剩余时间小于等于 0，表示时间已经结束
            this.libaoLingqu.active = true
            this.libaoLengque.active = false
            // 将 isFuli 的值设置为 "true"，表示用户可以再次领取礼物
            gameConfig.isFuli = 1
        }
    }
    //   如果数字小于 10，则在前面补零
    addNumber(num) {
        let num1 = num > 9 ? num : "0" + num;
        return num1;
    }
    protected onDestroy(): void {
        director.off(emits.isFuli, this.init, this)
        this.unscheduleAllCallbacks()
    }
}


