export class FrameStats {
    private samples: number[] = [];
    private cursor = 0;
    private totalCount = 0;
    private totalMilliseconds = 0;
    private totalLongFrames = 0;
    private longestFrame = 0;
    constructor(private capacity = 600) {}
    add(milliseconds: number) {
        // Visibility filtering belongs to the sampler; retain real long visible stalls.
        if (!(milliseconds > 0) || !isFinite(milliseconds)) return;
        this.totalCount++; this.totalMilliseconds += milliseconds;
        if (milliseconds > 33.34) this.totalLongFrames++;
        this.longestFrame = Math.max(this.longestFrame, milliseconds);
        if (this.samples.length < this.capacity) this.samples.push(milliseconds);
        else { this.samples[this.cursor] = milliseconds; this.cursor = (this.cursor + 1) % this.capacity; }
    }
    report() {
        const sorted = this.samples.slice().sort((a, b) => a - b);
        const percentile = (p: number) => sorted[Math.max(0, Math.ceil(sorted.length * p) - 1)] || 0;
        const mean = sorted.reduce((total, sample) => total + sample, 0) / Math.max(1, sorted.length);
        return { count: sorted.length, fps: mean > 0 ? 1000 / mean : 0, p50: percentile(0.5),
            p95: percentile(0.95), p99: percentile(0.99), longFrames: sorted.filter(sample => sample > 33.34).length, max: percentile(1),
            session: { count: this.totalCount, durationMs: this.totalMilliseconds,
                fps: this.totalMilliseconds > 0 ? 1000 * this.totalCount / this.totalMilliseconds : 0,
                longFrames: this.totalLongFrames, max: this.longestFrame } };
    }
}
