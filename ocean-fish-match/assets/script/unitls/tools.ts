import { _decorator, Component, Node, sys } from 'cc';
import { gameConfig } from '../data/gameConfig';
const { ccclass, property } = _decorator;

/**
 * @description: 存储本地数据
 * @return {*}
 */
export function save(key: string, val: string | number | object | any): any {
    if (typeof val === 'number') {
        val = ('' + val) as string;
    }
    if (typeof val === 'object') {
        val = JSON.stringify(val)
    }
    sys.localStorage.setItem(key, val || '');
}

/**
 * @description: 加载获取本地数据
 * @return {*}
 */
export function load(key: string, type: 0 | 1 | 2 = 1): any {
    let res: any = sys.localStorage.getItem(key);
    if (res) {
        switch (type) {
            case 0:
                break;
            case 1:
                res = Number(res);
                break;
            case 2:
                res = JSON.parse(res);
                break;
        }
        return res;
    } else {
        return null;
    }
}
/**
* 计算第二天的日期
*/
export function getDayTime() {
    //   获取当前日期的年份
    let endYear = new Date().getFullYear();
    //   获取当前日期的月份
    let endMonth = new Date().getMonth();
    //   获取当前日期的天数并加 1,获取明天的日期
    let endDay = new Date().getDate() + 1;
    //   创建明天的日期对象
    let time = new Date(endYear, endMonth, endDay)
    return time.getTime();
}
/**
* 获取当前时间
*/
export function newDayTime() {
    return new Date().getTime()
}

/**
 * 检查当前对象值是否为{},如果是则返回false
 */
export function isObjectEmpty(obj: object): boolean {
    return Object.keys(obj).length !== 0
}

/**
 * 判断进入游戏的时间是否大于30秒，抖音插屏需要
 */
export function isGoGameTime() {
    let nowTime = new Date().getTime();
    let gotime = nowTime - gameConfig.goGameTime
    if (gotime > 30000) {
        return true
    } else {
        return false
    }
}

