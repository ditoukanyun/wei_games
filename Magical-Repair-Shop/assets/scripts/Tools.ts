import { _decorator, CircleCollider2D, Component, ImageAsset, Node, PolygonCollider2D, Sprite, SpriteFrame, Texture2D, UITransform, Vec2, Vec3 } from 'cc';
import { PinAction } from './PinAction';
const { ccclass, property } = _decorator;

export class Tools {

    static clearFromParent(node: Node, co: any) {
        let arr = [];
        node.children.forEach(element => {
            if (element.getComponent(co)) {
                arr.push(element);
            }
        });
        arr.forEach((element) => {
            element.removeFromParent();
            element.destroy();
        });

    }

    public static random_between(min: number, max: number): number {
        return Math.random() * (max - min) + min;
    }


    //向下取整，如：min=0,max=10,结果：0，1，2，3，4，5，6，7，8，9
    public static random_between_floor(min: number, max: number): number {
        let ret = Math.random() * (max - min) + min;
        return  Math.floor(ret)
    }


    public static checkPolygonCoversCircle(circleCollider:CircleCollider2D, polygonCollider: PolygonCollider2D):boolean{
        let circlePos = circleCollider.node.position;

        let uiTransform = circleCollider.node.parent.getComponent(UITransform);
        circlePos =  uiTransform.convertToWorldSpaceAR(new Vec3(circlePos.x,circlePos.y,0))
        const circleRadius = circleCollider.radius;

        const polygonVertsWorld = Tools.convertPolygonColliderPointsToWorld(polygonCollider);

        if (Tools.isPolygonCoveringCircle(new Vec2(circlePos.x, circlePos.y), circleRadius, polygonVertsWorld)) {
        
            return true;

        } else {

            return false
        }
    }

    /**
     * 将PolygonCollider2D的本地顶点转换为世界坐标
     * @param collider PolygonCollider2D实例
     * @returns 世界坐标下的顶点数组
     */
    private static convertPolygonColliderPointsToWorld(collider: PolygonCollider2D): Vec3[] {
        const node = collider.node.getComponent(UITransform);
        const localPoints = collider.points;
        const worldPoints: Vec3[] = [];

        for (let i = 0; i < localPoints.length; i++) {
            // 创建一个临时Vec2对象以避免直接修改原始数组中的元素
            const worldPoint = node.convertToWorldSpaceAR(new Vec3(localPoints[i].x,localPoints[i].y,0));
            worldPoints.push(worldPoint);
        }

        return worldPoints;
    }

    // 辅助函数：判断多边形与圆形是否有交叉
    private static  isPolygonCoveringCircle(circlePos: Vec2, circleRadius: number, polygonVertsWorld: Vec3[]): boolean {
        
        // 1. 确保圆心在多边形内
        if (Tools.isPointInsidePolygon(circlePos, polygonVertsWorld)) {
            return true;
        }
        

        // 2. 检查圆心到多边形每条边的最短距离
        for (let i = 0; i < polygonVertsWorld.length; i++) {
            const p1 = polygonVertsWorld[i];
            const p2 = polygonVertsWorld[(i + 1) % polygonVertsWorld.length];
            const dist = Tools.pointToLineDistance(new Vec2(circlePos.x, circlePos.y), new Vec2(p1.x,p1.y) , new Vec2(p2.x,p2.y));
            if (dist < circleRadius) {
                return true; // 圆与多边形边有交叉
            }
        }

        return false; // 圆与多边形没有交叉
    }

    // 辅助函数：计算点到线段的最短距离
    private static  pointToLineDistance(point: Vec2, lineStart: Vec2, lineEnd: Vec2): number {

        let centerPoint = new Vec2((lineStart.x + lineEnd.x)/ 2, (lineStart.y + lineEnd.y)/2);

        const distanceVector = point.subtract(centerPoint);

        return distanceVector.length();

    }

     // 辅助函数：判断点是否在多边形内（射线法）
     private static isPointInsidePolygon(point: Vec2, polygonVerts: Vec3[]): boolean {
        let intersections = 0;

        for (let i = 0; i < polygonVerts.length; i++) {
            const v1 = polygonVerts[i];
            const v2 = polygonVerts[(i + 1) % polygonVerts.length];

            // 如果射线与当前边平行或共线，跳过
            if ((v1.y === point.y && v2.y === point.y) || (v1.x === point.x && v2.x === point.x)) continue;

            // 计算交点
            if (((v1.y > point.y) !== (v2.y > point.y)) && 
                (point.x < (v2.x - v1.x) * (point.y - v1.y) / (v2.y - v1.y) + v1.x)) {
                intersections++;
            }
        }

        return intersections % 2 === 1; // 奇数次交点表示点在多边形内部
    }
   
}

