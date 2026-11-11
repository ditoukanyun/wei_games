import { _decorator, Component, Node } from 'cc';
import { ColorDate } from './ColorDate';
import { Global } from './Global';
import { Tools } from './Tools';
const { ccclass, property } = _decorator;

@ccclass('DataModel')
export class DataModel {
    public static base_color_arr = [

        //粉色
        ColorDate.new_bean(224, 137, 119, 10001),
        //青色
        ColorDate.new_bean(65, 156, 147, 10002),
        //浅粉
        ColorDate.new_bean(222, 180, 199, 10003),
        //黄色
        ColorDate.new_bean(231, 181, 77, 10004),
        //灰色
        ColorDate.new_bean(182, 193, 180, 10005),
        //紫色
        ColorDate.new_bean(155, 128, 191, 10006),
        //红色
        ColorDate.new_bean(205, 86, 78, 10007),
        //绿
        ColorDate.new_bean(137, 172, 103, 10008),   
        //蓝色
        ColorDate.new_bean(91, 141, 194, 10009),
        //浅黄
        ColorDate.new_bean(239, 218, 144, 10010),
        //褐色
        ColorDate.new_bean(162, 117, 77, 10011),

        // //深青
        // ColorDate.new_bean(13, 105, 105, 10001),
        // //紫色	137，89，211
        // ColorDate.new_bean(137, 89, 211, 10002),
        // //171, 177, 187  灰白
        // ColorDate.new_bean(111, 111, 111, 10003),
        // //黄色	208,191,109
        // ColorDate.new_bean(208, 191, 109, 10004),
        // //粉色	211 , 139, 246
        // ColorDate.new_bean(211, 139, 246, 10005),
        // //绿色	140-214-115
        // ColorDate.new_bean(140, 214, 115, 10006),
        // //蓝色	36， 118-200
        // ColorDate.new_bean(36, 118, 200, 10007),
        // //绿黄
        // // ColorDate.new_bean(83, 108, 5, 10008),   
        // //青色
        // ColorDate.new_bean(17, 215, 215, 10008),   
        // //255, 87, 51 橘红
        // ColorDate.new_bean(239, 91, 122, 10009),
        
        

    ];

    private static lvl_color_arr = [];
    public static generate_lvl_color_arr(args: number) {
        console.log("generate_lvl_color_arr color number:",args);
        DataModel.lvl_color_arr = [];
        for (let i = 0; i < DataModel.base_color_arr.length; i++) {
            DataModel.lvl_color_arr.push(DataModel.base_color_arr[i].clone());
            if (DataModel.lvl_color_arr.length >= args) {
                break;
            }
        }
    }

    public static reset_lvl_color_index(){
        DataModel.lvl_color_index  = 0;
    }

    private static lvl_color_index: number = 0;
    public static get_lvl_color(): ColorDate {
        let ret = DataModel.lvl_color_arr[DataModel.lvl_color_index];
        DataModel.lvl_color_index += 1;
        if (DataModel.lvl_color_index >= DataModel.lvl_color_arr.length) {
            DataModel.lvl_color_index = 0;
        }
        if (ret == null) { // 线上错误，原因不知道。可能是以前版本问题。暂时这么处理
            let r = Tools.random_between_floor(1, 255);
            let g = Tools.random_between_floor(1, 255);
            let b = Tools.random_between_floor(1, 255);
            ret = ColorDate.new_bean(r, g, b, Tools.random_between_floor(20000, 150000));
            console.log("没找到对应的 color ",DataModel.lvl_color_index," ",DataModel.lvl_color_arr);
        }
        return ret;
    }

    private static layer_color_index: number = 0;
    public static get_layer_color(): ColorDate {
        // Plate enamel is decorative; screw matching retains its full distinct palette.
        const palette = [[62, 137, 130], [216, 135, 115], [235, 217, 181]];
        const rgb = palette[DataModel.layer_color_index];
        const ret = ColorDate.new_bean(rgb[0], rgb[1], rgb[2], 30001 + DataModel.layer_color_index);
        DataModel.layer_color_index += 1;
        if (DataModel.layer_color_index >= palette.length) {
            DataModel.layer_color_index = 0;
        }
        return ret;
    }

    public static random_base_color() {
        DataModel.base_color_arr.sort(() => {
            return 0.5 - Math.random();
        });
    }



    // group_index_arr = [];
    private static cur_group_index = 0;

    public static get_new_group_index() {
        let temp = 1 << DataModel.cur_group_index;
        DataModel.cur_group_index += 1;
        if (DataModel.cur_group_index > 30) {
            DataModel.cur_group_index = 0;
        }
        // console.log("group:::::",temp);
        return temp;
    }
}

