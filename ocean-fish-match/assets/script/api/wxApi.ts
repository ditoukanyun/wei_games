import { _decorator, Component, Node } from 'cc';
import { load, save } from '../unitls/tools';
import { local, system } from '../data/enume';
import { audioTool } from '../unitls/audioTool';
import { gameConfig } from '../data/gameConfig';
const { ccclass, property } = _decorator;
const wx = window['wx'];
@ccclass('wxApi')
export class wxApi extends Component {
    // 单例
    static _ins: wxApi;
    static get ins() {
        if (this._ins) {
            return this._ins;
        }
        this._ins = new wxApi();
        return this._ins;
    }

    /**
* 打开右上角转发功能
*/
    topZhuanfa() {
        // 如果不是微信环境，直接返回
        if (gameConfig.system !== system.wx) return
        wx.showShareMenu();
    }

    /**
* 转发
*/
    zhuanfa() {
        // 如果不是微信环境，直接返回
        if (gameConfig.system !== system.wx) return
        audioTool.ins.stopMusic()
        wx.shareAppMessage({
            title: '海底连连消',
        });
    }
    /**
     * 监听音频中断结束事件，如果中断恢复
     */
    bgmZd(callback: Function) {
        // 如果不是微信环境，直接返回
        if (gameConfig.system !== system.wx) return
        wx.onAudioInterruptionEnd(() => {
            callback()
        })
    }
}


