import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ColorDate')
export class ColorDate  {
    r:number;
    g:number;
    b:number;
    id:number;

    public static new_bean(r:number,g:number,b:number,id:number){
        let ret = new ColorDate();
        ret.r = r;
        ret.g = g;
        ret.b = b;
        ret.id = id;
        return ret;
    }

    public clone():ColorDate{
        return ColorDate.new_bean(this.r,this.g,this.b,this.id);
    }
}

