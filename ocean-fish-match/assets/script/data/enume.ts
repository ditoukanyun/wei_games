import { _decorator, AudioClip, Component, Node, Prefab } from 'cc';
const { ccclass, property } = _decorator;

/**
 * 资源路径
 */
export const resPath = {
    item: { type: Prefab, path: 'Prefabs/item' },
    guliPop: { type: Prefab, path: 'Prefabs/guliPop' },
    UI: { type: Prefab, path: 'Prefabs/UI' },
    music: { type: AudioClip, path: 'music' },
};
/**
 * 生成预制体
 */
export const perName = {
    item: 'item',
    levePop: 'levePop',
    hammerTishi: 'hammerTishi',
    changeTishi: 'changeTishi',
    shibaiPop: 'shibaiPop',
    lizi: 'lizi',
    fuliPop: 'qiandaoPop',
    messages: 'messages',
    settingPop: 'settingPop',
    isJixu: 'isJixu',
    shopPop: 'shopPop',
    rankPop: 'rankPop',
};
/**
 * 事件监听
 */
export const emits = {
    nextLevel: 'nextLevel',
    daojuTishi: 'daojuTishi',
    daojuNum: 'daojuNum',
    jinbiNum: 'jinbiNum',
    chongxinGame: 'chongxinGame',
    message: 'message',
    initItem: 'initItem',
    isFuli: 'isFuli',
};
/**
 * 音乐名称
 */
export const musicName = {
    bgm: 'login',
    xiao: 'xiao',
    guopguan: 'guopguan',
};
/**
 * 本地存储
 */
export const local = {
    // 是否开启音量
    isSound: 'isSound',
    // 金币
    jinbi: 'jinbi',
    // 随机重置
    restNum: 'restNum',
    // 消除
    hammerNum: 'hammerNum',
    // 换色
    changeNum: 'changeNum',
    // 上一关分数
    LastScore: 'LastScore',
    // 需要的分数
    needScore: 'needScore',
    // 关卡
    level: 'level',
    // 上次领取时间的第二天的时间
    endTime: 'endTime',
    // 用户信息
    userInfo: 'userInfo',
    // 用户openid
    openIdKey: 'openIdKey',
};

/**
 * 所处平台
 */
export const system = {
    wx: 'WECHAT_GAME',
    dy: 'BYTEDANCE_MINI_GAME',
    qq: 'qq',
    oth: 'oth',
};

// 排名数据
export const rankData = [
    {
        playerInfo: {
            avatarUrl: '',
            nickName: '张三'
        },
        score: '987154'
    },
    {
        playerInfo: {
            avatarUrl: '',
            nickName: '张三'
        },
        score: '987154'
    },
    {
        playerInfo: {
            avatarUrl: '',
            nickName: '张三'
        },
        score: '987154'
    },
    {
        playerInfo: {
            avatarUrl: '',
            nickName: '张三'
        },
        score: '987154'
    },
    {
        playerInfo: {
            avatarUrl: '',
            nickName: '张三'
        },
        score: '987154'
    },
    {
        playerInfo: {
            avatarUrl: '',
            nickName: '张三'
        },
        score: '987154'
    },
    {
        playerInfo: {
            avatarUrl: '',
            nickName: '张三'
        },
        score: '987154'
    },
    {
        playerInfo: {
            avatarUrl: '',
            nickName: '张三'
        },
        score: '987154'
    },
    {
        playerInfo: {
            avatarUrl: '',
            nickName: '张三'
        },
        score: '987154'
    },
    {
        playerInfo: {
            avatarUrl: '',
            nickName: '张三'
        },
        score: '987154'
    },
    {
        playerInfo: {
            avatarUrl: '',
            nickName: '张三'
        },
        score: '987154'
    },
    {
        playerInfo: {
            avatarUrl: '',
            nickName: '张三'
        },
        score: '987154'
    },
    {
        playerInfo: {
            avatarUrl: '',
            nickName: '张三'
        },
        score: '987154'
    },
]

