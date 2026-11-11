import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('LvLStorage')
export class LvLStorage {
    
    public static get_cur_lvl():number{
        let cur_lvl = localStorage.getItem("cur_lvl");
        if(!cur_lvl){
            localStorage.setItem("cur_lvl",1+"");
            return 1;
        }else{
            let l:number = Number(cur_lvl);
            return l;
        } 
    }

    public static get_history_lvl():number{
        let history_lvl = localStorage.getItem("history_lvl");
        if(!history_lvl){
            localStorage.setItem("history_lvl",1+"");
            return 1;
        }else{
            let l:number = Number(history_lvl);
            return l;
        } 
    }

    public static record_cur_lvl(lvl:number){
        localStorage.setItem("cur_lvl",lvl+"");
        //
        let history_lvl = localStorage.getItem("history_lvl");
            if(!history_lvl){
                localStorage.setItem("history_lvl",lvl+"");
            }else{
                let hs:number = Number(history_lvl);
                if(lvl>hs){
                    localStorage.setItem("history_lvl",lvl+"");
                }
            }
    }

    public static get_gift():number{
        let gift = localStorage.getItem("gift");
        if(!gift){
            localStorage.setItem("gift","0");
            return 0;
        }else{
            let l:number = Number(gift);
            return l;
        } 
    }

    public static record_gift(gift:number){
        localStorage.setItem("gift",gift+"");
    }
}

