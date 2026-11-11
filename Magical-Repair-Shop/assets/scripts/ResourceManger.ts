
import { assetManager } from "cc"

import { AssetType } from "./Enums";
import { Global } from "./Global";
import { ResourcePool } from "./ResourcePool";

export default class ResourceManger {
    private bundle_map: Object = {};
    public clip_map = {};

    private static rm: ResourceManger = null;
    public static get instance() {
        if (!this.rm) {
            this.rm = new ResourceManger();
        }
        return this.rm;
    }


    public async load_bundle(name: string, ratio: number = 0): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            assetManager.loadBundle(name, (e: any, bundle: any) => {
                if (e) {
                    reject(e);
                } else {
                    this.bundle_map[name] = bundle;
                    console.log(name + " load success");
                    Global.loading_rate = Global.loading_rate + ratio;
                    resolve && resolve();
                }
            })
        })
    }



    public async load_resource(name: string, type: any, ratio: number = 0): Promise<void> {
        let credited = 0;
        return new Promise<void>((resolve, reject) => {
            if (!this.bundle_map[name]) {
                reject(new Error("Bundle not loaded: " + name));
                return;
            }
            this.bundle_map[name].loadDir(type.path, type.type, (finished: number, total: number) => {
                const progress = total > 0 ? Math.min(1, finished / total) : 0;
                const next = Math.max(credited, ratio * progress);
                Global.loading_rate = Math.min(1, Global.loading_rate + next - credited);
                credited = next;
            }, (e: any, assets: any[]) => {
                try {
                    if (e) {
                        console.error("load_resource error >>>", name + ">>" + type.path, " err>", e, "assets>", assets);
                        reject(e);
                    } else {
                        assets?.forEach(element => {
                            switch (type) {
                                case AssetType.Prefab:
                                    ResourcePool.instance.set_prefab(element.data.name, element);
                                    // console.log("prefab>> " + element.data.name + " ")
                                    break;
                                case AssetType.Sound:
                                    this.clip_map[element.name] = element;
                                    // console.log("sound>> " + element.name + " ")
                                    break;
                            }
                        });
                        Global.loading_rate = Math.min(1, Global.loading_rate + ratio - credited);
                        credited = ratio;
                        console.log(name + ">>" + type.path + "loaded success")
                        resolve && resolve();
                    }
                } catch (error) {
                    reject(error);
                }
            })
        })
    }

    public get_clip(name: string) {
        return this.clip_map[name];
    }

}