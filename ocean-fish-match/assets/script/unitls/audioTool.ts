import { _decorator, AudioSourceComponent, Component, Node } from 'cc';
import { loadRes } from '../getRes/loadRes';
import { gameConfig } from '../data/gameConfig';
const { ccclass, property } = _decorator;

@ccclass('audioTool')
export class audioTool {

    private soundComp: AudioSourceComponent = null;
    private bgmComp: AudioSourceComponent = null;

    /**
     * 单例
     */
    private static _ins: audioTool = null!;
    public static get ins() {
        if (!this._ins) {
            this._ins = new audioTool();
            this._ins.initAudio();
        }
        return this._ins;
    }
    /**
 * 初始化音频组件
 */
    private initAudio() {
        //   用于单次播放的音效
        this.soundComp = new AudioSourceComponent();
        this.soundComp.loop = false;
        //  用于循环播放的背景音乐
        this.bgmComp = new AudioSourceComponent();
        this.bgmComp.loop = true;
    }
    /**
  * 停止背景音乐
  */
    public stopMusic() {
        this.bgmComp.stop();
    }
    /**
   * 设置音量
   */
    public setVolume(val) {
        this.bgmComp.volume = val
    }
    /**
     * 播放音乐
     * @param audio 音乐名
     */
    public async playMusic(audio: string) {
        // 即使音频组件已有 clip，我们也需要更换到新的音频
        let clip = await loadRes.ins.getClip(audio);
        // 设置音频组件的音量和 clip
        this.bgmComp.volume = gameConfig.bgmVol;
        this.bgmComp.clip = clip;
        // 确保音频组件停止当前播放，再开始新的播放
        this.bgmComp.play();
    }
    /**
    * 播放一次性音效
    */
    public async playSound(audio: string) {
        let clip = await loadRes.ins.getClip(audio);
        this.soundComp.playOneShot(clip, gameConfig.bgmVol);
    }
}


