import { DJ, DJ_TYPE } from "./Enums";


export class DjManger {
    private static dj_limit_ = [
        { c: 2, v: 5 },
        { c: 2, v: 5 },
        { c: 2, v: 5 },
        { c: 2, v: 5 },
        { c: 2, v: 5 },
    ];
    private static dj_cur_ = [
        { c: 0, v: 0 },
        { c: 0, v: 0 },
        { c: 0, v: 0 },
        { c: 0, v: 0 },
        { c: 0, v: 0 },
    ];

    static log_dj(){
        console.log("dj limit >>",DjManger.dj_limit_);
        console.log("dj our >>",DjManger.dj_cur_);
    }

    static use_dj(t: string, t_type: string) {
        let our_data = null;
        let limit_data = null;
        switch (t) {
            case DJ.Btn_1:
                our_data = DjManger.dj_cur_[0];
                limit_data = DjManger.dj_limit_[0];
                break;
            case DJ.Btn_2:
                our_data = DjManger.dj_cur_[1];
                limit_data = DjManger.dj_limit_[1];
                break;
            case DJ.Btn_3:
                our_data = DjManger.dj_cur_[2];
                limit_data = DjManger.dj_limit_[2];
                break;
            case DJ.Btn_4:
                our_data = DjManger.dj_cur_[3];
                limit_data = DjManger.dj_limit_[3];
                break;
            case DJ.Btn_5:
                our_data = DjManger.dj_cur_[4];
                limit_data = DjManger.dj_limit_[4];
                break;
        }
        if (!our_data || !limit_data) {
            return false;
        }
        let ret = false;
        switch (t_type) {
            case DJ_TYPE.Type_coin:
                if(our_data.c>=limit_data.c){
                    ret =  false;
                }else{
                    our_data.c = our_data.c + 1;
                    ret =  true;
                }
                break;
            case DJ_TYPE.Type_video:
                if(our_data.v>=limit_data.v){
                    ret =  false;
                }else{
                    our_data.v = our_data.v + 1;
                    ret =  true;
                }
                break;
        }
        return ret;
    }

    static return_used_dj(t: string, t_type: string) {
        let our_data = null;
        switch (t) {
            case DJ.Btn_1:
                our_data = DjManger.dj_cur_[0];
                break;
            case DJ.Btn_2:
                our_data = DjManger.dj_cur_[1];
                break;
            case DJ.Btn_3:
                our_data = DjManger.dj_cur_[2];
                break;
            case DJ.Btn_4:
                our_data = DjManger.dj_cur_[3];
                break;
            case DJ.Btn_5:
                our_data = DjManger.dj_cur_[4];
                break;
        }
        if (!our_data) {
            return false;
        }
        let ret = false;
        switch (t_type) {
            case DJ_TYPE.Type_coin:
                 our_data.c = our_data.c - 1;
                break;
            case DJ_TYPE.Type_video:
                our_data.v = our_data.v - 1;
                break;
        }
        return ret;
    }

    static reset_dj_cur_() {
        DjManger.dj_cur_.forEach(element => {
            element.c = 0;
            element.v = 0;
        });
        // DjManger.log_dj();
    }
}

