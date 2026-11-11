
import { ColorDate } from "./ColorDate";
import { PinAction } from "./PinAction";
import { Global } from "./Global";

export class CatColorRules {

    public static cat_color_arr: ColorDate[];
    public static set_cat_color(color_arr: ColorDate[]) {
        CatColorRules.cat_color_arr = color_arr;
    }

    public static r_0():PinAction[]{
        let pin_arr:PinAction[] = [];
        Global.bucket_action.get_pin_arr(pin_arr);
        Global.layer_empty_action.get_pin_arr(pin_arr);
        let layer_pin_colors_arr = Global.layer_root_action.lvl_action.get_pin_color();
        layer_pin_colors_arr.forEach(element => {
            pin_arr.push(element);
        });
        return pin_arr;
    }
    public static r_1():PinAction[]{
        let pin_arr:PinAction[] = [];
        Global.bucket_action.get_pin_arr(pin_arr);
        Global.layer_empty_action.get_pin_arr(pin_arr);
        return pin_arr;
    }
    public static r_2():PinAction[]{
        let pin_arr:PinAction[] = [];
        Global.layer_empty_action.get_pin_arr(pin_arr);
        return pin_arr;
    }
   
    public static r_3():PinAction[]{
        let pin_arr:PinAction[] = [];
        Global.bucket_action.get_pin_arr(pin_arr);
        return pin_arr;
    }
    
    public static r_4():PinAction[]{
        let pin_arr:PinAction[] = [];
        return pin_arr;
    }

    public static get_next_cat_color(pin_arr:PinAction[]): ColorDate {
        // console.log("获取cat 颜色》〉》〉》〉");
        let cat_color_arr = Global.layer_cat_action.get_cat_color_arr();
    
        let ret: ColorDate = null;
        for (let i = 0; i < pin_arr.length; i++) {
            let pin = pin_arr[i];
            if (!pin) {
                continue;
            }
            if (!pin.pin_color) {
                continue;
            }
            let color_same = false;
            for (let j = 0; j < cat_color_arr.length; j++) {
                if (cat_color_arr[j].id == pin.pin_color.id) {
                    color_same = true;
                    break;
                }
            }
            if (color_same) {
                continue;
            }
            // cat 颜色 和 现又的钉子不相同，去数组里面找到这个颜色取出来
            ret = CatColorRules.get_the_color(pin.pin_color);
            if (ret) {
                // console.log("获取》〉》〉》〉得到应新色：", ret.id);
                break;
            }
        }
        if (!ret) {
            ret = CatColorRules.get_shift_color();
        }
        return ret;
    }

    //取出来特定颜色
    public static get_the_color(the_color: ColorDate): ColorDate {
        let temp = [];
        let ret: ColorDate = null;
        for (let i = 0; i < CatColorRules.cat_color_arr.length; i++) {
            let c = CatColorRules.cat_color_arr[i];
            if (ret == null) {
                if (c.id == the_color.id) {
                    ret = c;
                } else {
                    temp.push(c);
                }
            } else {
                temp.push(c);
            }
        }
        if (ret != null) {
            CatColorRules.set_cat_color(temp);
        }
        return ret;
    }

    //弹出来一个
    private static get_shift_color(): ColorDate {
        return CatColorRules.cat_color_arr.shift();
    }
}

