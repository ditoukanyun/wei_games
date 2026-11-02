import { _decorator, Component, Node } from "cc";
const { ccclass, property } = _decorator;

@ccclass("gameConfig")
export class gameConfig {
    // 元素总个数
    static yuansuNum = 100
    // 根节点
    static nodeRoot: Node = null;
    // 首页根节点
    static homeRoot: Node = null;
    // 元素生成节点
    static itemNode: Node = null;
    //道具状态 ""：正常 "1"：锤子 "2":...
    static touchState = ""
    //是否开始游戏
    static IsGameStart: boolean = false;
    //游戏是否结束
    static isGameOver: boolean = false;
    //统计数列的数组
    static allVerticalList = new Array();
    //当前关卡
    static level: number = 1;
    //剩余金币
    static jinbi: number = 50;
    //重置道具数量
    static restNum: number = 0;
    //消除道具数量
    static hammerNum: number = 0;
    //换色道具数量
    static changeNum: number = 0;
    //上一关所获得的分数
    static LastScore = 0
    //本关需要的分数
    static needScore = 1000
    //当前关卡已获得的分数
    static score = 0
    //是否显示过关
    static isShowPass = false
    //剩余重试次数
    static isResurtTimes = 0
    //是否显示技能提示
    static isShowSkill = 0
    //状态标志
    static is_status = 0
    //音量
    static bgmVol = 0.8
    //是否开启音量
    static isSound = 1
    //是否可以领取礼包
    static isFuli = 0
    // 上次领取时间的第二天的时间
    static endTime = 0
    // 进入游戏的时间
    static goGameTime = 0
    // 当前平台
    static system = null
}



