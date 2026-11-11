import { PREVIEW } from 'cc/env';
import { WorkshopEnamel } from './WorkshopEnamel';
import { Global } from './Global';
import { LvLStorage } from './LvLStorage';
import { CatAction } from './CatAction';
import { ShowLevelAction } from './ShowLevelAction';
import { isChapter } from './ChapterLayout';
import { WorkshopAssets } from './WorkshopAssets';
import { BlockInputEvents, Button, Color, director, Graphics, Label, Node, resources, Sprite, SpriteFrame, UITransform, Widget } from 'cc';

/** Visual-only skin: existing buttons, physics and serialized references stay intact. */
export class WorkshopTheme {
    private static teal = new Color(48, 105, 99);
    private static brass = new Color(190, 148, 83);
    private static cream = new Color(242, 225, 188);

    private static panel(target: Node, fill: Color) {
        const size = target.getComponent(UITransform);
        if (!size || target.getChildByName('WorkshopSurface')) return;
        const sprite = target.getComponent(Sprite);
        if (sprite) sprite.enabled = false;
        const n = new Node('WorkshopSurface');
        n.layer = target.layer;
        target.addChild(n);
        n.setSiblingIndex(0);
        n.addComponent(UITransform).setContentSize(size.contentSize);
        const art = target.name === 'success_top' ? 3 : fill === this.teal ? 0 : size.height < 130 ? 1 : 2;
        if (art < 3) WorkshopAssets.surface(n, art, size.width, size.height);
        else WorkshopAssets.skin(n, art);

    }

    private static text(parent: Node, name: string, value: string, y: number, size: number, width = 560) {
        const n = new Node(name); n.layer = parent.layer; parent.addChild(n);
        n.setPosition(0, y);
        n.addComponent(UITransform).setContentSize(width, size * 2);
        const l = n.addComponent(Label); l.string = value; l.fontSize = size;
        l.lineHeight = size * 1.35; l.color = this.cream;
        l.horizontalAlign = Label.HorizontalAlign.CENTER;
        l.verticalAlign = Label.VerticalAlign.CENTER;
        return n;
    }

    private static iconControl(node: Node, art: number, visualSize = 70) {
        // Keep the painted icon independent from the larger finger target.
        const old = node.getComponent(Sprite);
        if (old) { old.enabled = false; old.color = Color.WHITE; }
        node.getComponent(UITransform)?.setContentSize(96, 96);
        let face = node.getChildByName('WorkshopIconFace');
        if (!face) { face = new Node('WorkshopIconFace'); face.layer = node.layer; node.addChild(face); face.addComponent(UITransform); }
        face.getComponent(UITransform).setContentSize(visualSize, visualSize);
        WorkshopAssets.skin(face, art);
    }

    private static button(parent: Node, name: string, title: string, x: number, y: number, width: number, height: number, art: number, action: () => void) {
        const n = new Node(name); n.layer = parent.layer; parent.addChild(n); n.setPosition(x,y);
        n.addComponent(UITransform).setContentSize(width,height);
        if (art >= 8 && art <= 11) this.iconControl(n, art, Math.min(width,height));
        else if(art<2) {
            const face=new Node('WorkshopButtonFace');face.layer=n.layer;n.addChild(face);
            face.addComponent(UITransform).setContentSize(width,height);
            WorkshopAssets.surface(face,art,width,height);
        } else WorkshopAssets.skin(n,art);
        const b = n.addComponent(Button); b.transition=Button.Transition.SCALE; b.zoomScale=0.96;
        if (title) this.text(n, `${name}Text`,title,0,28,width-20);
        n.on(Node.EventType.TOUCH_END,action);
        return n;
    }

    private static primaryAction(node: Node) {
        node.children.forEach(child => {
            const label = child.getComponent(Label);
            if (!label) return;
            child.setPosition(0,0);child.setScale(1,1,1);
            child.getComponent(UITransform)?.setContentSize(370,90);
            label.fontSize=60;label.lineHeight=75;label.isBold=true;
            label.color=this.cream;label.enableWrapText=false;label.overflow=Label.Overflow.SHRINK;
            label.enableOutline=true;label.outlineColor=new Color(99,63,30);label.outlineWidth=2;
        });
        [-1,1].forEach(side=>{
            const screw=new Node('WorkshopButtonRivet');screw.layer=node.layer;node.addChild(screw);
            screw.setPosition(side*225,0);screw.addComponent(UITransform).setContentSize(48,48);
            WorkshopAssets.skin(screw,6);
        });
    }

    private static currencyText(label: Label) {
        label.color = new Color(255, 238, 175);
        label.isBold = true;
        label.enableOutline = true;
        label.outlineColor = new Color(73, 59, 31);
        label.outlineWidth = 2;
    }

    static homeEntry(button: Node, level: number) {
        button.children.forEach(child => {
            const label=child.getComponent(Label);
            if(label) label.string=level>1?'继续维修':'开始维修';
        });
    }

    static soundControl(control: Node, enabled: boolean) {
        let row = control.getChildByName('WorkshopSoundRow');
        if (!row) {
            const old = control.getComponent(Sprite); if (old) old.enabled = false;
            control.children.forEach(child => child.active = false);
            control.getComponent(UITransform)?.setContentSize(320,82);
            row = new Node('WorkshopSoundRow'); row.layer=control.layer;control.addChild(row);
            row.addComponent(UITransform).setContentSize(320,82);
            const paper=row.addComponent(Graphics);paper.fillColor=new Color(247,229,195);
            paper.strokeColor=new Color(211,181,128);paper.lineWidth=2;
            paper.roundRect(-160,-41,320,82,18);paper.fill();paper.stroke();
            const title=this.text(row,'WorkshopSoundTitle','音效',0,26,85);
            title.setPosition(-90,0);title.getComponent(Label).color=new Color(83,52,29);title.getComponent(Label).isBold=true;
            this.text(row,'WorkshopSoundStatus','',0,22,80).setPosition(2,0);
            const track=new Node('WorkshopSoundSwitch');track.layer=control.layer;row.addChild(track);
            track.setPosition(95,0);track.addComponent(UITransform).setContentSize(90,44);track.addComponent(Graphics);
        }
        const state=row.getChildByName('WorkshopSoundStatus').getComponent(Label);
        state.string=enabled?'已开启':'已关闭';state.color=enabled?this.teal:new Color(115,117,101);
        const g=row.getChildByName('WorkshopSoundSwitch').getComponent(Graphics);g.clear();
        g.fillColor=enabled?this.teal:new Color(164,169,148);g.strokeColor=new Color(146,127,87);g.lineWidth=2;
        g.roundRect(-45,-22,90,44,22);g.fill();g.stroke();
        g.fillColor=new Color(255,246,222);g.strokeColor=new Color(209,175,111);
        g.circle(enabled?22:-22,0,17);g.fill();g.stroke();
    }

    private static homeHeader(canvas: Node) {
        const resource = new Node('WorkshopHomeResources'); resource.layer=canvas.layer;canvas.addChild(resource);
        resource.setPosition(125,555);resource.addComponent(UITransform).setContentSize(165,65);this.panel(resource,this.teal);
        const coin=new Node('WorkshopCoin');coin.layer=canvas.layer;resource.addChild(coin);coin.setPosition(-48,0);
        coin.addComponent(UITransform).setContentSize(48,48);WorkshopAssets.skin(coin,15);
        const amount=this.text(resource,'WorkshopAmount',String(Global.cur_coins),0,26,100);
        amount.setPosition(20,0);const amountLabel=amount.getComponent(Label);this.currencyText(amountLabel);
        amountLabel.enableWrapText=false;amountLabel.overflow=Label.Overflow.SHRINK;
        const modal=new Node('WorkshopHomeSettings');modal.layer=canvas.layer;canvas.addChild(modal);
        modal.addComponent(UITransform).setContentSize(960,1600);modal.addComponent(BlockInputEvents);
        const dim=modal.addComponent(Graphics);dim.fillColor=new Color(0,0,0,150);dim.rect(-600,-900,1200,1800);dim.fill();
        const panel=new Node('SettingsPaper');panel.layer=canvas.layer;modal.addChild(panel);
        panel.addComponent(UITransform).setContentSize(530,480);WorkshopAssets.skin(panel,2,true);
        this.text(panel,'SettingsTitle','修理铺设置',145,38,440).getComponent(Label).color=new Color(83,52,29);
        const sound=this.button(panel,'SoundToggle','',0,25,360,94,0,()=>{
            Global.sound_switch=!Global.sound_switch;this.soundControl(sound,Global.sound_switch);
        });
        this.soundControl(sound,Global.sound_switch);
        this.button(panel,'SettingsDone','完成',0,-110,340,100,0,()=>modal.active=false);
        this.button(panel,'SettingsClose','',205,175,60,60,10,()=>modal.active=false);
        modal.active=false;
        this.button(canvas,'WorkshopHomeSettingsButton','',250,555,70,70,8,()=>{this.soundControl(sound,Global.sound_switch);modal.active=true;modal.setSiblingIndex(canvas.children.length-1);});
    }

    private static toolPanels(canvas: Node) {
        const popup=canvas.getChildByName('props'); if (!popup) return;
        const currency=popup.getChildByName('coins_label');
        if (currency) {currency.setPosition(155,195);currency.getComponent(UITransform)?.setContentSize(95,40);const label=currency.getComponent(Label);if(label){label.fontSize=23;label.color=new Color(83,52,29);label.horizontalAlign=Label.HorizontalAlign.CENTER;label.verticalAlign=Label.VerticalAlign.CENTER;label.enableWrapText=false;label.overflow=Label.Overflow.SHRINK;}}
        const currencyIcon=popup.getChildByName('bs');
        if (currencyIcon) {currencyIcon.setPosition(100,195);currencyIcon.getComponent(UITransform)?.setContentSize(32,32);}
        const done=popup.getChildByName('btn_continue');
        if (done) {done.setPosition(0,-295);done.getComponent(UITransform)?.setContentSize(330,70);const surface=done.getChildByName('WorkshopSurface');if(surface)WorkshopAssets.surface(surface,0,330,70);}
        const hideIllustration=(node: Node) => {
            const sprite=node.getComponent(Sprite);if(sprite)sprite.enabled=false;
            node.children.forEach(hideIllustration);
        };
        ['props_1','props_2','props_3','props_4'].forEach((name,index)=>{
            const panel=popup.getChildByName(name);if(!panel)return;panel.setPosition(0,0);
            panel.children.forEach(child=>{
                if(child.name==='des') {child.setPosition(0,235);return;}
                if(child.name==='des2') {
                    child.setPosition(0,-10);child.getComponent(UITransform)?.setContentSize(430,95);
                    const label=child.getComponent(Label);if(label){label.fontSize=25;label.lineHeight=32;label.enableWrapText=true;label.string=['增加一个螺丝暂存孔位','随机重排场上螺丝颜色','将暂存螺丝收进工具桶','收纳盘颜色与剩余螺丝匹配'][index];}
                    return;
                }
                if(child.name.indexOf('btn_')===0){
                    const video=child.name.indexOf('video')>=0;
                    child.setPosition(0,video?-195:-90);child.getComponent(UITransform)?.setContentSize(340,85);
                    const surface=child.getChildByName('WorkshopSurface');if(surface)WorkshopAssets.surface(surface,0,340,85);
                    if(video){
                        child.children.forEach(n=>{const label=n.getComponent(Label);if(label){n.setPosition(0,0);label.string='观看视频使用';label.fontSize=27;}if(n.name==='video')n.active=false;});
                    } else {
                        child.children.forEach(n=>{
                            const label=n.getComponent(Label);
                            if(label){n.setPosition(-65,0);n.getComponent(UITransform)?.setContentSize(150,50);label.string=['加孔','重排','收起','解锁'][index];label.fontSize=30;label.lineHeight=40;label.horizontalAlign=Label.HorizontalAlign.CENTER;label.verticalAlign=Label.VerticalAlign.CENTER;label.enableWrapText=false;label.overflow=Label.Overflow.SHRINK;}
                            else if(n.name==='coin-001'||n.name==='coin') {
                                n.setPosition(55,0);n.setScale(1,1,1);n.getComponent(UITransform)?.setContentSize(110,50);
                                n.children.forEach(part=>{
                                    const price=part.getComponent(Label);
                                    if(price){part.setPosition(20,0);part.setScale(1,1,1);part.getComponent(UITransform)?.setContentSize(72,50);price.fontSize=28;price.lineHeight=40;price.horizontalAlign=Label.HorizontalAlign.CENTER;price.verticalAlign=Label.VerticalAlign.CENTER;price.enableWrapText=false;price.overflow=Label.Overflow.SHRINK;price.enableOutline=false;price.color=this.cream;}
                                    else if(part.name==='bs'){part.active=true;part.setPosition(-29,0);part.setScale(1,1,1);part.getComponent(UITransform)?.setContentSize(32,32);WorkshopAssets.skin(part,15);}
                                    else part.active=false;
                                });
                            }
                        });
                    }
                    return;
                }
                child.active=false;
                hideIllustration(child);
            });
            const art=new Node('WorkshopToolIllustration');art.layer=canvas.layer;panel.addChild(art);
            art.setPosition(0,110);art.addComponent(UITransform).setContentSize(130,130);
            WorkshopAssets.skin(art,[13,12,14,1][index]);
        });
    }

    static apply(canvas: Node, home: boolean) {
        WorkshopAssets.load().catch(error => console.error(error));
        if (!home) {
            ['menu', 'props', 'game_over', 'success', 'slider_page'].forEach(name => {
                const popup = canvas.getChildByName(name);
                if (!popup) return;
                const panel = popup.getChildByName('panel_bg');
                if (panel) { panel.setPosition(0, 0); panel.getComponent(UITransform)?.setContentSize(550, 820); }
                const title = popup.getChildByName('title');
                if (title) { title.setPosition(0, 250); const label = title.getComponent(Label); if(label){label.fontSize=44;label.lineHeight=56;} }
                if(name === 'game_over') {
                    const history = popup.getChildByName('history');
                    if(history){ history.setPosition(0,145);
                        const description=history.getChildByName('history_des')?.getComponent(Label);
                        if(description){description.fontSize=30;description.lineHeight=40;}
                        const number=history.getChildByName('history_lvl_label')?.getComponent(Label);
                        if(number){number.fontSize=56;number.lineHeight=65;}
                    }
                }
                const close = popup.getChildByName('btn_close');
                if (close) close.setPosition(220, 290);
                const positions: Record<string, number> = { btn_restart: -30, btn_go_lvl_1: -155, btn_continue: -280, btn_conintue: -280 };
                Object.keys(positions).forEach(key => {
                    const button = popup.getChildByName(key);
                    if (!button) return;
                    button.setPosition(0, positions[key]);
                    button.getComponent(UITransform)?.setContentSize(355, 95);
                });
                const banner = popup.getChildByName('success_top');
                if (banner) { banner.setPosition(0,360); banner.getComponent(UITransform)?.setContentSize(550,160); }
                const next = popup.getChildByName('btn_next');
                if (next) { next.setPosition(0, -425); next.getComponent(UITransform)?.setContentSize(550, 120); }
                const sound = popup.getChildByName('btn_sound');
                if (sound) { sound.setPosition(0, 130); WorkshopAssets.skin(sound, 11); }
            });
        }
        const bg = canvas.getChildByName('bg');
        if (bg) {
            bg.children.forEach(n => n.active = false);
            const n = new Node('WorkshopBackdrop'); n.layer = canvas.layer; bg.addChild(n);
            n.addComponent(UITransform).setContentSize(640, 1280);
            const sprite = n.addComponent(Sprite); sprite.sizeMode = Sprite.SizeMode.CUSTOM;
            resources.load(home ? 'workshop/home-background/spriteFrame' : 'workshop/workbench/spriteFrame', SpriteFrame, (error, frame) => {
                if (!n.isValid) return;
                if (error) { console.error('Workshop background unavailable', error); return; }
                WorkshopAssets.artwork(n, frame, 640, 1280, true);
            });
        }
        const visit = (node: Node) => {
            // Snapshot excludes newly inserted decorative surfaces.
            const children = node.children.slice();
            const art: Record<string, number> = { bucket_img: 14, bs: 15, bs_bg: 2,
                bs_coins_bg: 1, lock_logo: 13, xxx: 10 };
            if (node.getComponent(Sprite) && art[node.name] !== undefined) WorkshopAssets.skin(node, art[node.name]);
            if (node.name === 'video' && node.getComponent(Sprite)) {
                node.getComponent(Sprite).enabled = false;
                node.setPosition(135,0);node.setScale(1,1,1);node.angle=0;
                this.text(node, 'WorkshopVideoIcon', '▶', 0, 20, 24);
            }
            const legacy = node.getComponent(Sprite);
            if (legacy) {
                if (home && node.parent?.name === 'loadbg') {
                    const type=legacy.type, fillType=legacy.fillType, fillRange=legacy.fillRange;
                    WorkshopAssets.skin(node,0);legacy.type=type;legacy.fillType=fillType;legacy.fillRange=fillRange;
                }
                if (home && node.name === 'loadbg') WorkshopAssets.skin(node,1);
                if (/^(hole|holering)(-|$)/.test(node.name) || node.name === 'target') WorkshopAssets.skin(node, 7);
                if (/^pin(?:-|$)/.test(node.name)) {
                    const tint = legacy.color.clone(); WorkshopAssets.skin(node, 6); legacy.color = tint;
                    WorkshopEnamel.apply(node, true);
                }
                if (/^element_/.test(node.name)) WorkshopEnamel.apply(node);
                // CatAction owns tray art. Re-enabling box_4 resurrects the old second base.
                if (node.name === 'box_4') legacy.enabled = false;
                if (/^gift_bg_/.test(node.name)) WorkshopAssets.skin(node, 2, true);
                if (node.name === 'gift_c' || node.name === 'btn_silder') WorkshopAssets.skin(node, 15);
                if (node.name === 'zkbdw_logo') {
                    legacy.enabled = false;
                    this.text(node, 'WorkshopBrand', '奇妙修理铺', 0, 36, 420);
                }
                if (node.name === 'f1' || node.name === 'f2') {
                    resources.load('workshop/cursor/spriteFrame', SpriteFrame, (error, frame) => {
                        if (!error && node.isValid) { const size=node.getComponent(UITransform); WorkshopAssets.artwork(node,frame,size.width,size.height); legacy.color = Color.WHITE; }
                    });
                }
            }
            const label = node.getComponent(Label);
            if (label) {
                let parent = node.parent;
                let onButton = false, onPaper = false;
                while (parent && parent !== canvas) {
                    if (parent.getComponent(Button)) onButton = true;
                    if (['menu', 'props', 'game_over', 'success', 'slider_page', 'tips'].indexOf(parent.name) >= 0) onPaper = true;
                    parent = parent.parent;
                }
                label.color = onPaper && !onButton ? new Color(83, 54, 30) : this.cream;
                const copy: Record<string, string> = {
                    '开始游戏': '继续维修', '加载中': '正在整理工作台…',
                    '挑战成功': '维修完成', '挑战失败': '再试一次吧',
                    '刷新钉子': '重排螺丝', '清理钉子': '收起螺丝',
                    '继续游戏': '继续维修', '重新挑战': '重新维修',
                };
                if (copy[label.string]) label.string = copy[label.string];
                const button=node.parent?.getComponent(Button);
                if(button && node.parent.children.filter(child=>child.getComponent(Label)?.string.trim()).length===1) {
                    const bounds=node.parent.getComponent(UITransform),textBounds=node.getComponent(UITransform);
                    if(bounds && textBounds) {textBounds.setAnchorPoint(0.5,0.5);textBounds.setContentSize(Math.max(40,bounds.width-64),Math.max(30,bounds.height-20));}
                    node.setPosition(0,0);node.setScale(1,1,1);node.angle=0;
                    label.horizontalAlign=Label.HorizontalAlign.CENTER;label.verticalAlign=Label.VerticalAlign.CENTER;
                    label.enableWrapText=false;label.overflow=Label.Overflow.SHRINK;
                }
            }
            if (node.getComponent(Button)) {
                const hasText = node.children.some(child => {
                    const label = child.getComponent(Label);
                    return !!label && label.string.trim().length > 0;
                });
                // Icon-only controls retain their original live sprite state (sound, close).
                if (hasText) this.panel(node, this.teal);
                if (node.name === 'setting') this.iconControl(node, 8);
                if (node.name === 'btn_close') this.iconControl(node, 10, 60);
                const b = node.getComponent(Button);
                b.transition = Button.Transition.SCALE;
                b.zoomScale = 0.96;
            } else if (['panel_bg', 'bg_panel', 'level_bg', 'success_top'].indexOf(node.name) >= 0) {
                this.panel(node, new Color(109, 76, 48));
            }
            children.forEach(visit);
        };
        const startButton = canvas.getChildByPath('btns_layer/start_btn');
        if (home && startButton) startButton.getComponent(UITransform)?.setContentSize(560, 130);
        visit(canvas);
        if (home && startButton) this.primaryAction(startButton);
        if (!home) this.toolPanels(canvas);
        const setting = canvas.getChildByName('setting');

        if (!home) {
            const settings=canvas.getChildByName('menu');
            if(settings){
                const paper=settings.getChildByName('panel_bg');
                if(paper){paper.getComponent(UITransform)?.setContentSize(550,680);const face=paper.getChildByName('WorkshopSurface');if(face)WorkshopAssets.surface(face,2,550,680);}
                const title=settings.getChildByName('title');if(title){title.setPosition(0,180);const label=title.getComponent(Label);if(label){label.fontSize=40;label.isBold=true;}}
                const close=settings.getChildByName('btn_close');if(close)close.setPosition(200,240);
                const sound=settings.getChildByName('btn_sound');if(sound){sound.setPosition(0,90);this.soundControl(sound,Global.sound_switch);}
                ['btn_restart','btn_go_lvl_1','btn_continue'].forEach((name,index)=>settings.getChildByName(name)?.setPosition(0,-35-index*95));
            }
            const back = this.button(canvas,'WorkshopBack','',-265,555,70,70,9,()=>director.loadScene('home'));
            back.setSiblingIndex(canvas.getChildByName('setting').getSiblingIndex());
            const catLayer = canvas.getChildByName('layer_cat');
            if (catLayer) {
                catLayer.setPosition(0, 360);
                catLayer.children.forEach((slot, i) => {
                    const cat = slot.getComponent(CatAction);
                    if (!cat) return;
                    slot.setPosition(-225 + i * 150, 0);
                    cat.default_position = slot.position.clone();
                });
            }
            const parking = canvas.getChildByName('layer_empty');
            if (parking) {
                parking.setPosition(0, -430);
                parking.children.forEach((hole, i) => hole.setPosition(-250 + i * (500 / Math.max(1, parking.children.length - 1)), 0));
            }
            const head = canvas.getChildByName('showlevel');
            if (head) {
                const widget = head.getComponent(Widget); if (widget) widget.enabled = false;
                head.setPosition(-112, 555);
                head.getComponent(UITransform)?.setContentSize(220, 82);
                const badge = head.getChildByName('level_bg');
                if (badge) {
                    badge.setPosition(0, 0); badge.setScale(1, 1, 1);
                    badge.getComponent(UITransform)?.setContentSize(220, 82);
                    const old = badge.getComponent(Sprite); if (old) { old.enabled = false; old.color = Color.WHITE; }
                    const surface = badge.getChildByName('WorkshopSurface');
                    if (surface) { surface.active = true; WorkshopAssets.surface(surface, 0, 220, 82); }
                }
                const number = head.getComponent(ShowLevelAction)?.level_label;
                head.children.forEach(child => {
                    const label = child.getComponent(Label);
                    if (label && label !== number) child.active = false;
                });
                if (number) {
                    number.node.setPosition(0, 0); number.node.setScale(1, 1, 1);
                    number.node.getComponent(UITransform)?.setContentSize(200, 65);
                    number.fontSize = 35; number.lineHeight = 44; number.isBold = true;
                    number.enableWrapText = false; number.overflow = Label.Overflow.SHRINK;
                    number.color = new Color(255, 242, 206);
                }
            }
            if (setting) { const widget = setting.getComponent(Widget); if (widget) widget.enabled = false; setting.setPosition(250, 555); }
            const coins = canvas.getChildByName('coins');
            if (coins) {
                coins.setPosition(120, 555);
                const back = coins.getChildByName('bs_coins_bg');
                if (back) { back.setPosition(0, 0); back.getComponent(UITransform)?.setContentSize(165, 65); this.panel(back,this.teal); }
                const icon = coins.getChildByName('Node');
                if (icon) {
                    icon.setPosition(-48, 0);
                    icon.children.forEach(child => {
                        child.active = child.name === 'bs'; child.setPosition(0, 0);
                        if (child.name === 'bs') child.getComponent(UITransform)?.setContentSize(48, 48);
                    });
                }
                const amount = coins.getChildByName('Label');
                if (amount) { amount.setPosition(17, 0); amount.getComponent(UITransform)?.setContentSize(95,50); const label = amount.getComponent(Label); if (label) { this.currencyText(label); label.fontSize = 26;label.horizontalAlign=Label.HorizontalAlign.CENTER;label.verticalAlign=Label.VerticalAlign.CENTER;label.enableWrapText=false;label.overflow=Label.Overflow.SHRINK; } }
            }
            const bucket = canvas.getChildByName('bucket');
            if (bucket) { bucket.setPosition(-260, -325); bucket.setScale(0.65, 0.65, 1); }
            // Keep the tool's storage container alive; only retire the stray decoration.
            const bucketIcon = bucket?.getChildByName('bucket_img');
            if (bucketIcon) bucketIcon.active = false;
            const meter = canvas.getChildByName('load');
            if (meter) {
                meter.setPosition(0, 442); WorkshopAssets.skin(meter, 1);
                const fill = meter.getChildByName('loadfill');
                if (fill) {
                    const sprite = WorkshopAssets.skin(fill, 0);
                    sprite.type = Sprite.Type.FILLED; sprite.fillType = Sprite.FillType.HORIZONTAL;
                    sprite.fillStart = 0; sprite.fillRange = 0;
                }
                const particle = meter.getChildByName('Node'); if (particle) particle.active = false;
            }
            const taskPaper = new Node('WorkshopTaskPaper'); taskPaper.layer = canvas.layer;
            canvas.addChild(taskPaper); taskPaper.setPosition(0, 485);
            taskPaper.addComponent(UITransform).setContentSize(570, 115);
            resources.load('workshop/task-header/spriteFrame',SpriteFrame,(error,frame)=>{
                if(!error && taskPaper.isValid) WorkshopAssets.artwork(taskPaper,frame,570,115);
            });
            taskPaper.setSiblingIndex(canvas.getChildByName('guide').getSiblingIndex());
            const taskLabel = this.text(canvas, 'WorkshopTaskLabel', '维修中 · 发条零件盒', 485, 27);
            taskLabel.getComponent(Label).color = new Color(83, 52, 29);
            taskLabel.setSiblingIndex(taskPaper.getSiblingIndex() + 1);
            taskLabel.setPosition(-65, 485); taskLabel.getComponent(UITransform).setContentSize(365,60);
            const badge = new Node('WorkshopProgressBadge'); badge.layer=canvas.layer; canvas.addChild(badge);
            badge.setPosition(210,485);badge.addComponent(UITransform).setContentSize(118,46);
            const badgeArt=badge.addComponent(Graphics);badgeArt.fillColor=new Color(172,76,48);
            badgeArt.strokeColor=new Color(229,186,120);badgeArt.lineWidth=2;
            badgeArt.roundRect(-59,-23,118,46,18);badgeArt.fill();badgeArt.stroke();
            badge.setSiblingIndex(taskLabel.getSiblingIndex()+1);
            const count = this.text(canvas, 'WorkshopProgressCount', '0 / 0', 485, 24, 112);
            count.setPosition(210,485);const countLabel=count.getComponent(Label);
            countLabel.color = new Color(255,242,209);countLabel.isBold=true;
            countLabel.enableWrapText=false;countLabel.overflow=Label.Overflow.SHRINK;
            count.setSiblingIndex(badge.getSiblingIndex()+1);
            const bg = canvas.getChildByName('bg');
            if (bg) {
                const tray = new Node('WorkshopParkingTray'); tray.layer = canvas.layer; bg.addChild(tray);
                tray.setPosition(0, -430); tray.addComponent(UITransform).setContentSize(600, 120);
                WorkshopAssets.surface(tray, 2, 600, 90);
            }
            const success = canvas.getChildByName('success');
            if (success) {
                const nextButton=success.getChildByName('btn_next');if(nextButton)this.primaryAction(nextButton);
                const banner = success.getChildByName('success_top');
                if (banner) {
                    banner.getComponent(UITransform)?.setContentSize(550, 190);
                    const surface = banner.getChildByName('WorkshopSurface');
                    if (surface) resources.load('workshop/completion-banner/spriteFrame', SpriteFrame, (error, frame) => {
                        if (!error && surface.isValid) {
                            surface.setScale(1,1,1);
                            WorkshopAssets.artwork(surface, frame, 550, 190);
                        }
                    });
                    const title = banner.getChildByName('title');
                    if (title) { title.setPosition(0,-20); const text=title.getComponent(Label); if(text){text.fontSize=60;text.lineHeight=72;text.isBold=true;} }
                }
                const scene = new Node('WorkshopSuccessBackdrop'); scene.layer = canvas.layer;
                success.addChild(scene); scene.setSiblingIndex(1);
                scene.addComponent(UITransform).setContentSize(640, 1280);
                const image = scene.addComponent(Sprite); image.sizeMode = Sprite.SizeMode.CUSTOM;
                resources.load('workshop/completion-background/spriteFrame', SpriteFrame, (error, frame) => {
                    if (!error && scene.isValid) WorkshopAssets.artwork(scene, frame, 640, 1280, true);
                });
                this.homeHeader(success);
                const caption = this.text(success, 'WorkshopRepairedCaption', '又能转动啦！', -280, 34);
                caption.getComponent(Label).color = new Color(83, 52, 29);
                caption.getComponent(Label).isBold = true;
                const paper = new Node('WorkshopCaptionPaper'); paper.layer = canvas.layer; success.addChild(paper);
                paper.setPosition(0,-280); paper.addComponent(UITransform).setContentSize(430,90);
                const shape=paper.addComponent(Graphics); shape.fillColor=new Color(247,225,184);shape.strokeColor=new Color(170,126,69);shape.lineWidth=2;
                shape.moveTo(-210,-39);shape.lineTo(-216,-21);shape.lineTo(-208,-7);shape.lineTo(-215,12);shape.lineTo(-208,38);
                shape.lineTo(209,40);shape.lineTo(215,20);shape.lineTo(208,3);shape.lineTo(216,-18);shape.lineTo(208,-40);shape.close();shape.fill();shape.stroke();
                paper.setSiblingIndex(caption.getSiblingIndex());
            }
            const tools = canvas.getChildByName('layer_btn');
            tools?.children.forEach(button => {
                button.getComponent(UITransform)?.setContentSize(180, 96);
                button.setPosition(button.position.x === 0 ? 0 : button.position.x < 0 ? -195 : 195, 0);
                const oldSurface = button.getChildByName('WorkshopSurface'); if (oldSurface) oldSurface.active = false;
                const box = button.getChildByName('box_1');
                if (box) {
                    box.active = true;
                    box.getComponent(UITransform)?.setContentSize(180, 90);
                    this.panel(box, this.cream);
                    const original = box.getComponent(Sprite); if (original) original.enabled = false;
                    const surface = box.getChildByName('WorkshopSurface');
                    if (surface) { surface.active = true; WorkshopAssets.surface(surface, 1, 180, 90); }
                }
                const icons: Record<string, number> = { refresh_pin: 12, add_hole_logo: 13, clear_logo: 14 };
                button.children.forEach(child => {
                    if (icons[child.name] !== undefined) {
                        child.setPosition(-45, 0); child.setScale(1, 1, 1); child.angle = 0;
                        child.getComponent(UITransform)?.setContentSize(34, 34);
                        WorkshopAssets.skin(child, icons[child.name]);
                    }
                    const label = child.getComponent(Label);
                    if (label) {
                        child.setPosition(21, 0);
                        child.getComponent(UITransform)?.setContentSize(88, 40);
                        label.fontSize = 22; label.lineHeight = 30; label.isBold = true;
                        label.horizontalAlign=Label.HorizontalAlign.CENTER;label.verticalAlign=Label.VerticalAlign.CENTER;
                        label.enableWrapText=false;label.overflow=Label.Overflow.SHRINK;
                        label.color = new Color(83, 52, 29);
                        label.enableOutline = false;
                    }
                });
            });
        }
        if (home) {
            this.homeHeader(canvas);
            const footer = canvas.getChildByName('Node');
            if (footer) {
                const modal = canvas.getChildByName('WorkshopHomeSettings');
                if (modal) footer.setParent(modal);
                footer.setPosition(0, -345); footer.setScale(0.55, 0.55, 1);
            }
            const logo = canvas.getChildByName('logo2'); if (logo) logo.active = false;
            const title = new Node('WorkshopTitle');
            title.layer = canvas.layer; canvas.addChild(title); title.setPosition(0, 390);
            title.addComponent(UITransform);
            title.getComponent(UITransform).setContentSize(550, 250);
            const sign = new Node('WorkshopSurface'); sign.layer=title.layer; title.addChild(sign);
            sign.addComponent(UITransform);
            resources.load('workshop/title-sign/spriteFrame', SpriteFrame, (error, frame) => {
                if (!error && title.isValid) WorkshopAssets.artwork(sign,frame,550,250);
            });
            const heading = this.text(title, 'WorkshopTitleText', '奇妙修理铺', 12, 76, 470);
            heading.getComponent(Label).isBold=true;
            const headingLabel=heading.getComponent(Label);headingLabel.enableOutline=true;headingLabel.outlineWidth=2;headingLabel.outlineColor=new Color(123,84,39);
            this.text(canvas, 'WorkshopSubtitle', '让旧时光，重新转动', 270, 24);
            const route=PREVIEW && typeof location!=='undefined' ? /[?&]previewLevel=(\d+)/.exec(location.search) : null;
            const homeLevel=route ? Math.max(1,Math.min(150,Number(route[1]))) : LvLStorage.get_cur_lvl();
            const ticket = new Node('WorkshopRepairTicket'); ticket.layer = canvas.layer;
            canvas.addChild(ticket); ticket.setPosition(0, 165);
            ticket.addComponent(UITransform).setContentSize(260, 260);
            WorkshopAssets.skin(ticket, 3);
            this.text(ticket, 'WorkshopTicket', `第 ${homeLevel} 关`, -5, 48, 240).getComponent(Label).color = new Color(89, 55, 29);
            this.text(ticket,'WorkshopTicketTask',isChapter(homeLevel)?'发条猫头鹰':'发条零件盒',-56,22,230).getComponent(Label).color=new Color(112,77,42);
            this.text(canvas, 'WorkshopWelcome', '一颗螺丝，一点小小的奇迹', -530, 21);
            const buttons = canvas.getChildByName('btns_layer');
            if (buttons) {
                buttons.setPosition(0, -440);
                const start = buttons.getChildByName('start_btn');
                if (start) {
                    start.active = true;
                    this.homeEntry(start,homeLevel);
                }
                const check = buttons.getChildByName('check_btn'); if (check) check.active = false;
            }
        }
    }
}
