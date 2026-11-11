/** Browser-only phase gate. Use animation timestamps, never callback execution time. */
export class BrowserFramePacer {
    private running = false;
    private request: number = null;
    private origin = -1;
    private nextFrame = 0;
    private rate = 0;
    constructor(private getRate: () => number, private tick: () => void,
        private requestFrame: (callback: (stamp: number) => void) => number,
        private cancelFrame: (request: number) => void) {}
    start() {
        if(this.running) return;
        this.running=true;this.origin=-1;this.nextFrame=0;
        this.request=this.requestFrame(this.advance);
    }
    stop() {
        this.running=false;
        if(this.request !== null) this.cancelFrame(this.request);
        this.request=null;this.origin=-1;
    }
    private advance = (stamp: number) => {
        if(!this.running) return;
        // Queue first so a pause during tick can cancel the next callback.
        this.request=this.requestFrame(this.advance);
        const requested=this.getRate();
        const rate=Number.isFinite(requested) && requested>0 ? requested : 60;
        if(this.origin<0 || stamp<this.origin || rate!==this.rate) {
            this.origin=stamp;this.nextFrame=0;this.rate=rate;
        }
        // Nearest phase tolerates normal display timestamp jitter without raising the cap.
        const frame=Math.round((stamp-this.origin)*rate/1000);
        if(frame<this.nextFrame) return;
        this.nextFrame=frame+1;
        this.tick();
    };
}
