import { _decorator, Component, Node ,sys} from 'cc';
const { ccclass, property } = _decorator;

@ccclass('CheckPlantform')
export class CheckPlantform extends Component {
    static check_plantform(callback: Function){
        const system = sys.platform;
        switch (system) {
            case sys.Platform.BYTEDANCE_MINI_GAME:
                callback(1);
                break;
            case sys.Platform.MOBILE_BROWSER:
                callback(0);
                break;
            case sys.Platform.DESKTOP_BROWSER:
                callback(0);
                break;
            default:
                callback(0);
                break;
        }
    }
}


