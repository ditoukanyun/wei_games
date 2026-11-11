import { director, Game, ITweenOption, Node, PolygonCollider2D, Sprite } from "cc";
import { DJ, DJ_TYPE, Key } from "./Enums";
import { ColorDate } from "./ColorDate";
import { LayerCatAction } from "./LayerCatAction";
import { LayerRootAction } from "./LayerRootAction";
import { LayerEmptyAction } from "./LayerEmptyAction";
import { Main } from "./Main";
import { ShowLevelAction } from "./ShowLevelAction";
import { GameOverAction } from "./GameOverAction";
import { CoinsAction } from "./CoinsAction";
import { SuccessAction } from "./SuccessAction";
import { LayerBtnAction } from "./LayerBtnAction";
import { TipsAction } from "./TipsAction";
import { BucketAction } from "./BucketAction";
import { PropsAction } from "./PropsAction";
import { PinAction } from "./PinAction";
import { GuideAction } from "./GuideAction";
import { LoadingAction } from "./LoadingAction";

export class Global {

    static start = false;
    static loading_rate = 0;

    //
    static layer_cat_action: LayerCatAction;
    static layer_root_action: LayerRootAction;
    static layer_empty_action: LayerEmptyAction;
    static main_action: Main;
    static Show_level_action: ShowLevelAction;

    static game_over_action: GameOverAction;
    static coins_action: CoinsAction;
    static success_action: SuccessAction;
    static layer_btn_action: LayerBtnAction;
    static tips_action: TipsAction;
    static bucket_action: BucketAction;
    static props_action: PropsAction;

    static guide_action:GuideAction;
    static loading_action:LoadingAction;;


    private static polygon_arr:PolygonCollider2D[] = [];

    static polygon_push(p:PolygonCollider2D){
        Global.polygon_arr.push(p);
    }

    static polygon_clear(){
        Global.polygon_arr = [];
    }

    static polygon_get():PolygonCollider2D[]{
        return Global.polygon_arr;
    }



    static Pause(isPause = true) {
        director.emit(Key.Pause, isPause);
        Global.start = !isPause;
    }


    static cur_lvl_pin_total = 0;
    static cur_lvl_pin_move_num = 0;

    public static init_pin_info(total: number) {
        Global.cur_lvl_pin_total = total;
        Global.cur_lvl_pin_move_num = 0;
    }

    public static pin_prgress_computed(num: number) {
        Global.cur_lvl_pin_move_num += num;
    }


    public static next_level(): number {
        Global.cur_lvl++;
        return Global.cur_lvl;
    }

    static sound_switch = true;

    //当前获取的的金币
    static cur_coins = 0;
    //使用道具需要多少金币
      static need_coins = 30;

     public static get_need_coins():number{
        return Global.need_coins*Global.cur_lvl;
     }

    public static use_coins(c: number) {
        Global.cur_coins = Global.cur_coins - c;
        if (Global.cur_coins < 0) {
            Global.cur_coins = 0;
        }
    }



    //当前等级
    static cur_lvl = 0;
    //从头开始游戏,进行默认设置
    public static restart_default(lvl = 0) {
        Global.cur_lvl = lvl;
        Global.cur_coins = 0;
    }


    //每关开始前调用
    public static every_level_default() {
        Global.cur_lvl_pin_total = 0;
        Global.cur_lvl_pin_move_num = 0;
        //clear bucket container
        Global.bucket_action.clear_container();

        Global.guide_action.action_lvl_start_begin();
    }

    static our_easing: ITweenOption = { easing: 'quadInOut' }; //{ easing: 'quadInOut' };


    static ad_intersitial_id: string;
    static ad_video_id: string;
    static ad_banner_id: string;
    static ad_custom_id: string;

    static is_check_completed = false;

    //关卡等级
    static GATEPROGRESS:string = "GATEPROGRESS";
    //关卡硬币
    static GATECOINS:string = "GATECOINS";


    static gift_coins = 1000;
}

