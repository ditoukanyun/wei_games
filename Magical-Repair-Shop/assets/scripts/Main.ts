import { ResolutionPolicy, view } from 'cc';
import { WorkshopChapter } from './WorkshopChapter';
import { PREVIEW } from 'cc/env';
import { isChapter } from './ChapterLayout';
import { Label } from 'cc';
import { FrameDiagnostics } from './FrameDiagnostics';
import { WorkshopTheme } from './WorkshopTheme';
import { _decorator, BoxCollider2D, CircleCollider2D, Component, director, EventTouch, Input, instantiate, log, Node, PolygonCollider2D, Prefab, RigidBody2D, Sprite } from 'cc';
import { LayerRootAction } from './LayerRootAction';
import { Global } from './Global';
import { LayerCatAction } from './LayerCatAction';
import { LayerEmptyAction } from './LayerEmptyAction';
import { Clips, events } from './Enums';
import { AudioManger } from './AudioManger';
import { CatAction } from './CatAction';
import { MenuAction } from './MenuAction';
import { ShowLevelAction } from './ShowLevelAction';
import { GameOverAction } from './GameOverAction';
import { CoinsAction } from './CoinsAction';
import { SuccessAction } from './SuccessAction';
import { LayerBtnAction } from './LayerBtnAction';
import { TipsAction } from './TipsAction';
import { BucketAction } from './BucketAction';
import { PropsAction } from './PropsAction';
import { DjManger } from './DjManger';
import { GuideAction } from './GuideAction';
import { LvLStorage } from './LvLStorage';
import { WxPlatform } from './ad/WxPlatform';
import { LoadingAction } from './LoadingAction';
import { BytePlantform } from './BytePlantform';
import { SiderPageAction } from './SiderPageAction';
const { ccclass, property } = _decorator;

@ccclass('Main')
export class Main extends Component {

    @property({type:LayerRootAction})
    layer_root:LayerRootAction
    @property({type:LayerCatAction})
    layer_cat:LayerCatAction
    @property({type:LayerEmptyAction})
    layer_empty:LayerEmptyAction
    @property({type:ShowLevelAction})
    Show_level_action:ShowLevelAction

    @property({type:MenuAction})
    menu:MenuAction
    @property({type:GameOverAction})
    game_over_action:GameOverAction
    @property({type:CoinsAction})
    coins_action:CoinsAction
    @property({type:SuccessAction})
    success_action:SuccessAction
    @property({type:LayerBtnAction})
    layer_btn_action:LayerBtnAction
    @property({type:TipsAction})
    tips_action:TipsAction;

    @property({type:BucketAction})
    bucket_action:BucketAction;

   

    @property({type:GuideAction})
    guide_action:GuideAction;

    @property({type:LoadingAction})
    loading_action:LoadingAction;

    @property({type:PropsAction})
    props_action:PropsAction;

    @property({type:Node})
    btn_sider:Node;

    @property({type:SiderPageAction})
    sider_page_action:SiderPageAction;
    

    
    // @property({type:Number,tooltip:"默认开始等级，一般填写1，如果填写3就是从第三关开始"})
    // default_start_lvl:number;

    @property({type:Number,tooltip:"基本扳手消耗，真是消耗是 lvl*need_coins"})
    need_coins:number;
    
    
    protected onLoad(): void {
        view.setDesignResolutionSize(640, 1280, ResolutionPolicy.SHOW_ALL);
        director.on(events.check_completed, this.next_lvlcheck_completed, this);
    }

    private levelRequest = 0;
    private levelComplete = false;
    private levelLoading = false;
    private checkingFailure = false;

    // Wait for the actual collection chain, including replacement boxes and
    // reserve screws still in flight. A fixed timeout can cut that chain short.
    check_failure() {
        if (this.checkingFailure || this.levelComplete || this.levelLoading) return;
        this.checkingFailure = true;
        Global.is_check_completed = true;
        const request = this.levelRequest;
        const check = () => {
            if (!this.isValid || request !== this.levelRequest || this.levelComplete) return;
            if (!Global.layer_empty_action.is_pin_full()) {
                this.checkingFailure = false;
                Global.is_check_completed = false;
                return;
            }
            if (Global.layer_cat_action.has_pending_moves() ||
                Global.layer_empty_action.get_pin_arr().some(pin => pin.is_flying())) {
                this.scheduleOnce(check, 0.1);
                return;
            }
            this.checkingFailure = false;
            Global.is_check_completed = false;
            Global.game_over_action.open();
        };
        check();
    }

    protected onDestroy(): void {
        this.levelRequest++;
        director.off(events.check_completed, this.next_lvlcheck_completed, this);
    }

    start() {
        if (typeof location !== 'undefined' && location.search.indexOf('profile=1') >= 0) this.node.addComponent(FrameDiagnostics);
        WorkshopTheme.apply(this.node, false);
       this.check_douyin();
        //set default need coin
       Global.need_coins = this.need_coins;
       //
       Global.layer_root_action = this.layer_root;
       Global.layer_cat_action = this.layer_cat;
       Global.layer_empty_action = this.layer_empty;
       Global.main_action = this;
       Global.Show_level_action = this.Show_level_action;
       Global.game_over_action = this.game_over_action;
       Global.coins_action = this.coins_action;
       Global.success_action = this.success_action;
       Global.layer_btn_action = this.layer_btn_action;
       Global.tips_action = this.tips_action;
       Global.bucket_action = this.bucket_action; 
       Global.props_action = this.props_action; 
       Global.guide_action = this.guide_action;
       Global.loading_action = this.loading_action;
       this.restart_game();

    }

    //从头开始游戏，1..max
    private previewStage = false;
    private previewResultShown = false;

    private launchRouteApplied = false;
    restart_game(targetLevel?: number){
        let lvl = targetLevel ?? (this.launchRouteApplied ? Global.cur_lvl : LvLStorage.get_cur_lvl());
        if (!this.launchRouteApplied && targetLevel === undefined && PREVIEW && typeof location !== 'undefined') {
            const match = /(?:[?&])previewLevel=(\d+)/.exec(location.search);
            if (match) {
                this.previewStage = true;
                lvl = Math.max(1, Math.min(150, Number(match[1])));
            }
        }
        this.launchRouteApplied = true;
        Global.restart_default(lvl); // 3
        this.start_lvl(lvl);
    }

    private failedLevel: number | null = null;

    retry_failed_level(): boolean {
        if (this.failedLevel === null) return false;
        const level = this.failedLevel;
        this.failedLevel = null;
        this.start_lvl(level);
        return true;
    }

    async start_lvl(_lvl:number){
        this.failedLevel = null;
        const request = ++this.levelRequest;
        this.levelLoading = true;
        this.levelComplete = false;
        this.checkingFailure = false;
        Global.is_check_completed = true;
        Global.loading_action.show(_lvl);
        try {
            if (isChapter(_lvl)) await WorkshopChapter.load(_lvl);
        } catch (error) {
            if (this.isValid && request === this.levelRequest) {
                this.failedLevel = _lvl;
                console.error('章节素材加载失败', error);
                Global.loading_action.close();
                Global.tips_action.show('玩具零件加载失败，点击继续游戏重试');
                this.menu.open();
            }
            return;
        }
        if (!this.isValid || request !== this.levelRequest) return;
        const profile = this.node.getChildByName('FrameProfile'); if (profile) profile.active = true;
        const task = this.node.getChildByName('WorkshopTaskLabel')?.getComponent(Label);
        if (task) task.string = isChapter(_lvl) ? '章节挑战 · 发条猫头鹰' : '维修中 · 发条零件盒';
        Global.is_check_completed = true;
        //记录等级信息
        if (!this.previewStage) LvLStorage.record_cur_lvl(_lvl);
        //重置 钉子,金币
        Global.every_level_default();
        Global.polygon_clear();
        DjManger.reset_dj_cur_();
        console.log("开始游戏  》〉》〉》〉 level >>>>",_lvl);
        this.layer_root.init_root(_lvl); 
        Global.Show_level_action.show_level();
        Global.coins_action.refrush_coins();
        // Global.layer_root_action.random_pin();
        Global.is_check_completed = false;

        this.levelLoading = false;
        Global.loading_action.close();
        // Editor-only visual route, scheduled after asynchronous chapter assets are ready.
        if (PREVIEW && this.previewStage && !this.previewResultShown && typeof location !== 'undefined' && /[?&]previewResult=(?:success|failure)(?:&|$)/.test(location.search)) {
            this.previewResultShown = true;
            this.scheduleOnce(() => {
                if (/[?&]previewResult=failure(?:&|$)/.test(location.search)) this.game_over_action.open();
                else this.success_action.open();
            }, 1);
        }
    }

    next_lvlcheck_completed(catAction:CatAction){
        if (this.levelLoading || this.levelComplete || Global.cur_lvl_pin_total <= 0) return;
        if(Global.cur_lvl_pin_move_num>= Global.cur_lvl_pin_total){
            this.levelComplete = true;
            Global.is_check_completed = true;
            // console.log(" check is completed  success");
            Global.success_action.open();
        }else{
            catAction.into_scence();
        }
    }

    
    btn_open_menu(){
        AudioManger.instance.playSound(Clips.btn_1);
        this.menu.open();
    }

    

    

    btn_share(){
        WxPlatform.ins.show_share();
    }

    btn_checkSideBar(){
        console.log("开始检查 检查侧边栏");
        BytePlantform.ins.check_side_bar((success: boolean) => {
            if (success) {
                console.log('checkSideBar 检查侧边栏 success');
            } else {
                console.log('checkSideBar 跳转失败 fail');
            }
        });
    }

    open_side_page() {
        // BytePlantform.ins.side_bar();
        this.sider_page_action.show();
    }

    check_douyin(){
        //奖励按钮隐藏
         this.show_gift_btn();
         let self = this;
         BytePlantform.ins.check_side_bar((success: boolean) => {
            if (success) {
                console.log('check_douyin 检查侧边栏 success,可以使用侧边栏');
                self.listenFromDouyi();
            } else {
                console.log('check_douyin 跳转失败 fail,结束判断');
            }
        });

    }

    show_gift_btn(){
        this.btn_sider.active = false;
        let self = this;
        if(LvLStorage.get_gift()==2){
            this.btn_sider.active = false;
            console.log('show_gift_btn 领取过奖励 不显示 ');
        }else{
            //没领取过奖励
            BytePlantform.ins.check_side_bar((success: boolean) => {
                if (success) {
                    console.log('show_gift_btn 检查侧边栏 success显示 ');
                    self.btn_sider.active = true;
                } else {
                    console.log('show_gift_btn 检查侧边栏  fail ');
                    self.btn_sider.active = false;
                }
            });
        }
    }

    private listenFromDouyi(){
        if(LvLStorage.get_gift()==2){
            //0 =default,1=添加了。2=领取奖励
            console.log('check_douyin2 侧边栏奖励领取过，直接返回');
            return;
         }
        let self = this;
        BytePlantform.ins.listen_douyin((success: boolean) => {
            if (success) {
                //TODO 在这里完成你的奖励逻辑
                console.log('main 从侧边栏调过来，可以奖励用户了！');
                if(LvLStorage.get_gift()<1){
                    LvLStorage.record_gift(1);
                    console.log('add_siderbar 添加侧边栏跳转成功,记录数据 1');
                    //更新页面
                   self.sider_page_action.refrush_data();
                }
            } else {
                console.log('main 不是从侧边栏调过来');
            }
        });
    }
}

