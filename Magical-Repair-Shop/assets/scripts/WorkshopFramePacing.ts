import { game, sys, VERSION } from 'cc';
import { BrowserFramePacer } from './BrowserFramePacer';

interface PacerPort {
    targetFrameRate: number;
    onTick: (() => void) | null;
    start(): void;
    stop(): void;
}
const installed = new WeakSet<object>();

/** Project-local adapter for the pinned Creator 3.8.8 web pacer. */
export function installWorkshopFramePacing(): boolean {
    if(!sys.isBrowser || VERSION!=='3.8.8' || typeof requestAnimationFrame!=='function') return false;
    if(typeof location!=='undefined') {
        const options=new URLSearchParams(location.search);
        if(options.get('profile')==='1' && options.get('pacing')==='legacy') return false;
    }
    // The private integration point is version- and shape-guarded; no global engine files change.
    const port=(game as unknown as {_pacer?: PacerPort})._pacer;
    if(!port || installed.has(port) || typeof port.start!=='function' || typeof port.stop!=='function'
        || typeof port.targetFrameRate!=='number' || typeof port.onTick!=='function') return false;
    const originalStart=port.start;
    const originalStop=port.stop;
    const pacing=new BrowserFramePacer(()=>port.targetFrameRate,()=>port.onTick?.(),
        callback=>requestAnimationFrame(callback),request=>cancelAnimationFrame(request));
    originalStop.call(port);
    try {
        port.start=()=>pacing.start();
        port.stop=()=>pacing.stop();
        pacing.start();
        installed.add(port);
        return true;
    } catch(error) {
        pacing.stop();port.start=originalStart;port.stop=originalStop;
        originalStart.call(port);
        console.warn('[WorkshopPacing] Original frame scheduler restored',error);
        return false;
    }
}
