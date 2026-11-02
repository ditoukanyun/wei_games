import { _decorator, Component, Node, ParticleSystem, ParticleSystem2D } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('touchLizi')
export class touchLizi extends Component {
    touchLizi: ParticleSystem2D
    start() {
        this.touchLizi = this.node.getComponent(ParticleSystem2D);
        console.log(this.touchLizi);
    }

    update(deltaTime: number) {

    }
}


