import { Color, Node, Rect, Size, resources, Sprite, SpriteFrame, Texture2D, UITransform } from 'cc';
import { fitArtwork } from './ArtworkLayout';

/** One shared texture and cached frames: no per-button texture allocation. */
export class WorkshopAssets {
    private static pending: Promise<void>;
    private static frames: SpriteFrame[] = [];
    private static screwFrame: SpriteFrame;
    private static screwPending: Promise<void>;
    private static croppedFrames = new WeakMap<SpriteFrame, Map<string, SpriteFrame>>();

    static preloadScrew(): Promise<void> {
        if (this.screwPending) return this.screwPending;
        this.screwPending = new Promise<void>((resolve,reject) => {
            resources.load('workshop/screw-neutral/spriteFrame', SpriteFrame, (error,frame) => {
                if(error){this.screwPending=null;reject(error);return;}
                this.screwFrame=frame;resolve();
            });
        });
        return this.screwPending;
    }

    static screw(node: Node): Sprite {
        const sprite=node.getComponent(Sprite)||node.addComponent(Sprite);
        sprite.sizeMode=Sprite.SizeMode.CUSTOM;sprite.type=Sprite.Type.SIMPLE;sprite.customMaterial=null;
        if(this.screwFrame)sprite.spriteFrame=this.screwFrame;
        else this.preloadScrew().then(()=>{if(node.isValid)sprite.spriteFrame=this.screwFrame;}).catch(error=>console.error(error));
        return sprite;
    }

    static load(): Promise<void> {
        if (this.pending) return this.pending;
        this.pending = new Promise<void>((resolve, reject) => {
            resources.load('workshop/ui-kit/texture', Texture2D, (error, texture) => {
                if (error) { this.pending = null; reject(error); return; }
                const cell = texture.width / 4;
                for (let index = 0; index < 16; index++) {
                    const frame = new SpriteFrame();
                    frame.texture = texture;
                    const y = Math.floor(index / 4) * cell;
                    frame.rect = index < 2
                        ? new Rect((index % 4) * cell, cell * 0.31, cell, cell * 0.49)
                        : new Rect((index % 4) * cell, y, cell, cell);
                    frame.originalSize = new Size(frame.rect.width, frame.rect.height);
                    // All frames have transparent safe padding; keep the painted rim fixed.
                    frame.insetLeft = frame.insetRight = index < 2 ? frame.rect.height / 2 : 72;
                    frame.insetTop = frame.insetBottom = index < 2 ? 0 : 72;
                    this.frames[index] = frame;
                }
                resolve();
            });
        });
        return this.pending;
    }

    /** Decorative node only: scale borders uniformly, then extend the sliced center. */
    static surface(node: Node, index: number, width: number, height: number): Sprite {
        const sprite = this.skin(node, index);
        const apply = () => {
            if (!node.isValid || !this.frames[index]) return;
            const frame = this.frames[index];
            const scale = (index < 2 ? height : Math.min(width, height)) / frame.rect.height;
            node.getComponent(UITransform).setContentSize(width / scale, height / scale);
            node.setScale(scale, scale, 1);
            sprite.type = Sprite.Type.SLICED;
        };
        if (this.frames[index]) apply(); else this.load().then(apply).catch(error => console.error(error));
        return sprite;
    }

    static artwork(node: Node, frame: SpriteFrame, width: number, height: number, cover = false) {
        const size = fitArtwork(frame.rect.width, frame.rect.height, width, height, cover);
        let art = frame;
        if (cover) {
            const key = String(width / height);
            let crops = this.croppedFrames.get(frame);
            if (!crops) { crops = new Map(); this.croppedFrames.set(frame, crops); }
            art = crops.get(key);
            if (!art) {
                const cropWidth = frame.rect.width * width / size.width;
                const cropHeight = frame.rect.height * height / size.height;
                art = new SpriteFrame(); art.texture = frame.texture;
                art.rect = new Rect(frame.rect.x + (frame.rect.width - cropWidth) / 2,
                    frame.rect.y + (frame.rect.height - cropHeight) / 2, cropWidth, cropHeight);
                art.originalSize = new Size(cropWidth, cropHeight);
                crops.set(key, art);
            }
        }
        node.getComponent(UITransform)?.setContentSize(cover ? width : size.width, cover ? height : size.height);
        const sprite = node.getComponent(Sprite) || node.addComponent(Sprite);
        sprite.sizeMode = Sprite.SizeMode.CUSTOM; sprite.type = Sprite.Type.SIMPLE;
        sprite.spriteFrame = art;
        return sprite;
    }

    static skin(node: Node, index: number, sliced = false): Sprite {
        const sprite = node.getComponent(Sprite) || node.addComponent(Sprite);
        if (!node.getComponent(UITransform)) node.addComponent(UITransform);
        sprite.enabled = true;
        sprite.sizeMode = Sprite.SizeMode.CUSTOM;
        sprite.type = sliced && index >= 2 ? Sprite.Type.SLICED : Sprite.Type.SIMPLE;
        sprite.color = Color.WHITE;
        if (index >= 4) {
            const transform = node.getComponent(UITransform);
            const size = fitArtwork(1, 1, transform.width, transform.height);
            transform.setContentSize(size.width, size.height);
        }
        const assign = () => { if (node.isValid && this.frames[index]) sprite.spriteFrame = this.frames[index]; };
        if (this.frames[index]) assign();
        else this.load().then(assign).catch(error => console.error('修理铺素材加载失败', error));
        return sprite;
    }
}
