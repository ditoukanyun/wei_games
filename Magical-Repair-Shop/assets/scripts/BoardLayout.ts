export interface BoardRect { x: number; y: number; width: number; height: number; }
/** Uniformly fit authored bounds without enlarging dense stages. */
export function fitBoard(bounds: BoardRect, target: BoardRect) {
    const scale = Math.min(1, target.width / Math.max(1,bounds.width), target.height / Math.max(1,bounds.height));
    const clampZero=(low:number,high:number)=>Math.max(low,Math.min(0,high));
    return { scale,
        x:clampZero(target.x-bounds.x*scale,target.x+target.width-(bounds.x+bounds.width)*scale),
        y:clampZero(target.y-bounds.y*scale,target.y+target.height-(bounds.y+bounds.height)*scale) };
}
