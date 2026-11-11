
import { AudioClip, AudioSourceComponent, _decorator } from "cc";
import ResourceManger from "./ResourceManger";
import { Global } from "./Global";
import { Clips } from "./Enums";

const { ccclass, property } = _decorator;

@ccclass("AudioManger")
export class AudioManger {
    private asc: AudioSourceComponent = null;
    private static am: AudioManger = null!;
    public static get instance() {
        if (!this.am) {
            this.am = new AudioManger();
            this.am.asc = new AudioSourceComponent();
            this.am.asc.loop = true;
        }
        return this.am;
    }

    public async playSound(audio: string, volumeScale = 0.7) {
        if (!Global.sound_switch) {
            return;
        }

        switch (audio) {
            case Clips.reng:
                volumeScale = 0.3;
                break;
            case Clips.btn_1:
                volumeScale = 0.5;
                break;
                break;
            case Clips.complete_1:
                volumeScale = 0.3;
                break;
            case Clips.warn:
                volumeScale = 0.2;
                break;
            case Clips.fail:
                volumeScale = 0.4;
                break;
        }


        let clip = await ResourceManger.instance.get_clip(audio);
        if (!clip) {
            console.log("声音播放错误，audio:", audio);
        } else {
            this.asc
            this.asc.playOneShot(clip, volumeScale);
        }

    }
}