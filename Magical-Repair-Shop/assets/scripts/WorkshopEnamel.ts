import { EffectAsset, Material, Node, resources, Sprite } from 'cc';

/** Shared enamel shading preserves the authored silhouette/physics correspondence. */
export class WorkshopEnamel {
    private static pending: { [key: string]: Promise<Material> } = {};
    static load(screw = false): Promise<Material> {
        const key = screw ? 'screw' : 'plate';
        if (this.pending[key]) return this.pending[key];
        this.pending[key] = new Promise<Material>((resolve, reject) => {
            resources.load('workshop/enamel', EffectAsset, (error, effectAsset) => {
                if (error) { delete this.pending[key]; reject(error); return; }
                const material = new Material();
                material.initialize({ effectAsset, defines: { USE_TEXTURE: true, SCREW_SURFACE: screw } });
                resolve(material);
            });
        });
        return this.pending[key];
    }
    static apply(node: Node, screw = false) {
        const sprite = node.getComponent(Sprite);
        if (!sprite) return;
        this.load(screw).then(material => {
            if (node.isValid) sprite.customMaterial = material;
        }).catch(error => console.error('搪瓷材质加载失败', error));
    }
}
