import screenshot from 'screenshot-desktop';
import crypto from 'crypto';

/**
 * Captures screenshots and generates SHA-256 hashes
 * Screenshots are NEVER stored - only hashes are kept
 */
export class ScreenshotHasher {
    private interval: NodeJS.Timeout | null = null;
    private readonly INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
    private lastHash: string | null = null;

    /**
     * Start periodic screenshot hashing
     * @param callback Called with hash and timestamp after each capture
     */
    start(callback: (hash: string, timestamp: number) => void): void {
        console.log('[ScreenshotHasher] Starting periodic captures every 5 minutes');

        // Capture immediately on start
        this.captureNow(callback);

        // Then capture every 5 minutes
        this.interval = setInterval(async () => {
            await this.captureNow(callback);
        }, this.INTERVAL_MS);
    }

    /**
     * Capture a screenshot hash immediately
     */
    async captureNow(callback: (hash: string, timestamp: number) => void): Promise<void> {
        try {
            console.log('[ScreenshotHasher] Capturing screenshot...');

            // Capture screenshot as PNG buffer
            const imgBuffer = await screenshot({ format: 'png' });

            // Generate SHA-256 hash
            const hash = crypto
                .createHash('sha256')
                .update(imgBuffer)
                .digest('hex');

            this.lastHash = hash;
            const timestamp = Date.now();

            console.log(`[ScreenshotHasher] Hash generated: ${hash.substring(0, 16)}... at ${new Date(timestamp).toISOString()}`);

            // Call callback with hash (screenshot buffer is discarded)
            callback(hash, timestamp);

        } catch (error) {
            console.error('[ScreenshotHasher] Screenshot capture failed:', error);
        }
    }

    /**
     * Stop periodic captures
     */
    stop(): void {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
            console.log('[ScreenshotHasher] Stopped');
        }
    }

    /**
     * Get the last captured hash
     */
    getLastHash(): string | null {
        return this.lastHash;
    }
}
