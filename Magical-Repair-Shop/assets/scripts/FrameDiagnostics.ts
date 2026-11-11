import { _decorator, Component, Label, Node, UITransform, Color, director, Director } from 'cc';
import { FrameStats } from './FrameStats';
const { ccclass } = _decorator;

/** Opt-in diagnostic: launch preview with ?profile=1. No production HUD cost. */
@ccclass('FrameDiagnostics')
export class FrameDiagnostics extends Component {
    private stats = new FrameStats();
    private previous = 0;
    private display: Label;
    private browserFrames = new FrameStats();
    private previousBrowserFrame = -1;
    private browserRequest: number = null;
    private sampleBrowser = (stamp: number) => {
        if(typeof document !== 'undefined' && document.hidden) this.previousBrowserFrame=-1;
        else {
            if(this.previousBrowserFrame>=0) this.browserFrames.add(stamp-this.previousBrowserFrame);
            this.previousBrowserFrame=stamp;
        }
        this.browserRequest=requestAnimationFrame(this.sampleBrowser);
    };
    private cpuFrame = new FrameStats();
    private cpuUpdate = new FrameStats();
    private cpuRender = new FrameStats();
    private frameStart = -1;
    private updateStart = -1;
    private renderStart = -1;
    private frameVisible = false;
    private beginFrame() {
        this.frameVisible = typeof document === 'undefined' || !document.hidden;
        this.frameStart = this.frameVisible ? performance.now() : -1;
        this.updateStart = this.renderStart = -1;
    }
    private beforeUpdate() { if(this.frameVisible) this.updateStart=performance.now(); }
    private afterUpdate() { if(this.updateStart>=0) this.cpuUpdate.add(performance.now()-this.updateStart); }
    private beforeDraw() { if(this.frameVisible) this.renderStart=performance.now(); }
    private afterDraw() { if(this.renderStart>=0) this.cpuRender.add(performance.now()-this.renderStart); }
    private endFrame() { if(this.frameStart>=0) this.cpuFrame.add(performance.now()-this.frameStart); }
    private subscriptions() {
        return [
            [Director.EVENT_BEGIN_FRAME,this.beginFrame], [Director.EVENT_END_FRAME,this.endFrame],
            [Director.EVENT_BEFORE_UPDATE,this.beforeUpdate], [Director.EVENT_AFTER_UPDATE,this.afterUpdate],
            [Director.EVENT_BEFORE_DRAW,this.beforeDraw], [Director.EVENT_AFTER_DRAW,this.afterDraw]
        ] as const;
    }
    onLoad() {
        this.previous = performance.now();
        if(typeof requestAnimationFrame === 'function') this.browserRequest=requestAnimationFrame(this.sampleBrowser);
        for(const [event,callback] of this.subscriptions()) director.on(event,callback,this);
    }
    onDestroy() {
        if(this.browserRequest !== null && typeof cancelAnimationFrame === 'function') cancelAnimationFrame(this.browserRequest);
        this.browserRequest=null;
        for(const [event,callback] of this.subscriptions()) director.off(event,callback,this);
    }
    start() {
        const n = new Node('FrameProfile'); n.layer = this.node.layer; this.node.addChild(n);
        n.setPosition(0, -335); n.addComponent(UITransform).setContentSize(620, 70);
        this.display = n.addComponent(Label); this.display.fontSize = 18; this.display.lineHeight = 23;
        this.display.color = new Color(255, 244, 210);
        this.schedule(() => this.report(), 5);
    }
    update() {
        const now = performance.now();
        if (typeof document !== 'undefined' && document.hidden) { this.previous = 0; return; }
        if (this.previous) this.stats.add(now - this.previous);
        this.previous = now;
    }
    private report() {
        const r = this.stats.report();
        const summary = (stats: FrameStats) => {
            const sample=stats.report();
            return {count:sample.count,p50:sample.p50,p95:sample.p95,p99:sample.p99,max:sample.max};
        };
        // CPU wall time around engine events; this is NOT a GPU completion measurement.
        const browser=this.browserFrames.report();
        const cpu={frame:summary(this.cpuFrame),update:summary(this.cpuUpdate),renderSubmit:summary(this.cpuRender)};
        this.display.string = `FPS ${r.fps.toFixed(1)} · P95 ${r.p95.toFixed(1)}ms · P99 ${r.p99.toFixed(1)}ms\n>33ms ${r.longFrames}/${r.count} · 全程 ${r.session.longFrames}/${r.session.count} · 最慢 ${r.session.max.toFixed(0)}ms\nRAF ${browser.fps.toFixed(1)} · JS P95 ${cpu.frame.p95.toFixed(1)}ms · 更新 ${cpu.update.p95.toFixed(1)}ms · 提交 ${cpu.renderSubmit.p95.toFixed(1)}ms`;
        console.info('[WorkshopProfile]', JSON.stringify({...r,cpu,browser}));
    }
}
