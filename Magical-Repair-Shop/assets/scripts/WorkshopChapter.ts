import { Color, ERigidBody2DType, Node, PolygonCollider2D, resources, RigidBody2D, Sprite, SpriteFrame, UITransform, Vec2 } from 'cc';
import { chapterPieces } from './ChapterLayout';
import { ElementAction } from './ElementAction';
import { HoleAction } from './HoleAction';
import { LayerAction } from './LayerAction';
import { WorkshopAssets } from './WorkshopAssets';

export class WorkshopChapter {
    private static frames: { [key: string]: SpriteFrame } = {};
    private static pending: { [asset: string]: Promise<void> } = {};
    static load(level: number): Promise<void> {
        const assets = [...new Set(chapterPieces(level).map(piece => piece.asset))];
        return Promise.all(assets.map(asset => {
            if (this.frames[asset]) return Promise.resolve();
            if (!this.pending[asset]) {
                this.pending[asset] = new Promise<void>((resolve,reject) => {
                    resources.load(`workshop/${asset}/spriteFrame`, SpriteFrame, (error,frame) => {
                        if (error) { reject(error); return; }
                        this.frames[asset] = frame; resolve();
                    });
                }).then(() => { delete this.pending[asset]; }, error => {
                    delete this.pending[asset]; throw error;
                });
            }
            return this.pending[asset];
        })).then(() => undefined);
    }
    static frame(asset: string): SpriteFrame { return this.frames[asset]; }
    static layers(level: number): LayerAction[] {
        const tiers = new Map<number, LayerAction>();
        const scale = level === 1 ? 1.16 : 1.18;
        const offsetY = level === 1 ? 75 : 0;
        chapterPieces(level).forEach(piece => {
            let action = tiers.get(piece.tier);
            if (!action) {
                const layer = new Node(`owl_layer_${piece.tier}`); layer.layer = 1 << 25;
                action = layer.addComponent(LayerAction); tiers.set(piece.tier, action);
            }
            const layer = action.node;
            const plate = new Node(`owl_${piece.id}`); plate.layer = layer.layer; layer.addChild(plate);
            plate.setPosition(piece.x * scale, piece.y * scale + offsetY);
            plate.setScale(scale, scale, 1);
            plate.addComponent(UITransform).setContentSize(piece.width, piece.height);
            plate.addComponent(RigidBody2D).type = ERigidBody2DType.Static;
            const collider = plate.addComponent(PolygonCollider2D);
            collider.points = piece.contour.map(point => new Vec2(point[0],point[1]));
            const element = plate.addComponent(ElementAction); element.chapterPiece = true;
            const image = new Node('img'); image.layer = layer.layer; plate.addChild(image);
            image.addComponent(UITransform).setContentSize(piece.width,piece.height);
            const sprite = image.addComponent(Sprite); sprite.sizeMode = Sprite.SizeMode.CUSTOM;
            WorkshopAssets.artwork(image, this.frames[piece.asset], piece.width, piece.height); sprite.color = Color.WHITE;
            if (piece.flip) image.setScale(-1,1,1);
            const cover = image.addComponent(PolygonCollider2D);
            cover.points = piece.contour.map(point => new Vec2(piece.flip ? -point[0] : point[0],point[1]));
            cover.enabled = false;
            piece.holes.forEach((position,index) => {
                const hole = new Node(`owl_hole_${index}`); hole.layer = layer.layer; plate.addChild(hole);
                hole.setPosition(position[0],position[1]); hole.addComponent(UITransform).setContentSize(40,40);
                hole.addComponent(HoleAction);
                const art = new Node('hole_bg'); art.layer = layer.layer; hole.addChild(art);
                art.addComponent(UITransform).setContentSize(40,40); WorkshopAssets.skin(art,7);
            });
        });
        // LevelAction initializes and displays layers from front to back.
        return [...tiers.values()].reverse();
    }
}
