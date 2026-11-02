import {
  _decorator,
  assetManager,
  AssetManager,
  AudioClip,
  Component,
  Node,
} from "cc";
import { resPath } from "../data/enume";
import { loadPool } from "./loadPool";
const { ccclass, property } = _decorator;

@ccclass("loadRes")
export class loadRes extends Component {
  // 资源是否加载完成
  isRes: boolean = false;
  // 存储加载的所有资源
  allBundleRes: { [key: string]: AssetManager.Bundle } = {};
  // 储存音乐
  allMusic: { [key: string]: AudioClip } = {};
  /**
   * 单例
   */
  private static _ins: loadRes = null;
  public static get ins() {
    if (!this._ins) {
      this._ins = new loadRes();
    }
    return this._ins;
  }
  /**
   * 加载bundle中的资源
   */
  async loadBundle(name: string) {
    assetManager.loadBundle(name, (err: string, budle: AssetManager.Bundle) => {
      if (budle) {
        this.allBundleRes[1] = budle;
        this.isRes = true;
      } else {
        console.log("资源加载失败" + err);
      }
    });
  }

  /**
   * 指定的资源包中加载不同类型的游戏资源，并将这些资源分配到相应的集合中进行管理和使用
   */
  async resLoad(type: { type: any; path: any }) {
    //新声明一个方法，方便自调用，用于判断需要的资源是否加载完成，没有的话重新调用
    const startLoad = () => {
      // isRes为true代表总资源包加载完成
      if (this.isRes) {
        try {
          this.allBundleRes[1].loadDir(
            type.path,
            type.type,
            (err: any, assets: any[]) => {
              if (assets) {
                let linShiAss = null;
                switch (type) {
                  // 玩家及场景元素预制体
                  case resPath.item:
                    for (let i = 0; i < assets.length; i++) {
                      linShiAss = assets[i];
                      const name = linShiAss.data.name as string;
                      loadPool.ins.setPrefab(name, linShiAss);
                    }
                    break;
                  // 消除提示语
                  case resPath.guliPop:
                    for (let i = 0; i < assets.length; i++) {
                      linShiAss = assets[i];
                      const name = linShiAss.data.name as string;
                      loadPool.ins.setPrefab(name, linShiAss);
                    }
                    break;
                  // UI弹窗一类
                  case resPath.UI:
                    for (let i = 0; i < assets.length; i++) {
                      linShiAss = assets[i];
                      const name = linShiAss.data.name as string;
                      loadPool.ins.setPrefab(name, linShiAss);
                    }
                    break;
                  // 音乐资源
                  case resPath.music:
                    for (let i = 0; i < assets.length; i++) {
                      linShiAss = assets[i];
                      if (!this.allMusic[linShiAss.name]) {
                        this.allMusic[linShiAss.name] = linShiAss;
                      }
                    }
                    break;
                }
              } else {
                console.log(err);
              }
            }
          );
        } catch (err) {
          console.log("分载资源问题：" + err);
        }
      } else {
        //1秒后调用
        this.scheduleOnce(() => {
          startLoad();
        }, 1);
      }
    };
    //第一次执行
    startLoad();
  }
  /**
   * 获取音乐数据
   */
  public getClip(name: string) {
    return this.allMusic[name];
  }
}
