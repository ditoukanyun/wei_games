import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('adConfig')
export class adConfig {
    // 是否开启广告
    static isShowAd = false
    // 微信banner广告id
    static wxBannerId = ''
    // 微信格子广告id
    static wxGeziId = ''
    //  微信插屏广告id
    static wxChaPingId = ''
    //  微信激励广告id
    static wxVideoId = ''
    // 抖音banner广告id
    static dyBannerId = ''
    // 抖音插屏广告id
    static dyChaPingId = ''
    // 抖音激励广告id
    static dyVideoId = ''
}


