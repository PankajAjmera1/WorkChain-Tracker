import { ScreenshotHasher } from './screenshot';
import { ActivityMonitor } from './activity';
import { Encryptor } from './encryption';
import { WorkDatabase } from './database';
import { ShelbyService } from './shelby.service';
import { ActivitySnapshot, AppCategory, TrackerStatus, DailySummary } from './types';

/**
 * Main tracker orchestrator
 * Coordinates screenshot hashing, activity monitoring, encryption, and database storage
 */
export class WorkTracker {
    private screenshotHasher: ScreenshotHasher;
    private activityMonitor: ActivityMonitor;
    private encryptor: Encryptor;
    private db: WorkDatabase;
    private shelbyService: ShelbyService;
    private isTracking = false;
    private uploadQueue: DailySummary[] = [];

    constructor() {
        console.log('[WorkTracker] Initializing...');

        this.screenshotHasher = new ScreenshotHasher();
        this.activityMonitor = new ActivityMonitor();
        this.encryptor = new Encryptor();
        this.db = new WorkDatabase();
        this.shelbyService = new ShelbyService();

        // Test encryption
        if (!this.encryptor.test()) {
            console.error('[WorkTracker] Encryption test failed!');
        } else {
            console.log('[WorkTracker] Encryption test passed');
        }
    }

    /**
     * Initialize the tracker (must be called before start)
     */
    async initialize(): Promise<void> {
        await this.db.initialize();
        console.log('[WorkTracker] Ready');
    }

    /**
     * Start tracking work activity
     */
    start(): void {
        if (this.isTracking) {
            console.log('[WorkTracker] Already tracking');
            return;
        }

        console.log('[WorkTracker] Starting work tracking...');
        this.isTracking = true;

        // Start screenshot hashing (every 5 minutes)
        this.screenshotHasher.start((hash, timestamp) => {
            this.db.insertScreenshotHash(hash, timestamp);
            console.log(`[WorkTracker] Screenshot hash saved: ${hash.substring(0, 16)}...`);
        });

        // Start activity monitoring (every 30 seconds)
        this.activityMonitor.start((snapshot: ActivitySnapshot) => {
            // Encrypt the snapshot data
            const encryptedData = this.encryptor.encrypt(JSON.stringify(snapshot));

            // Store in database
            this.db.insertActivity(snapshot, encryptedData);

            // Update daily summary
            this.updateDailySummary(snapshot);
        });

        console.log('[WorkTracker] ✅ Tracking started');
    }

    /**
     * Stop tracking
     */
    stop(): void {
        if (!this.isTracking) {
            console.log('[WorkTracker] Not currently tracking');
            return;
        }

        console.log('[WorkTracker] Stopping work tracking...');

        this.screenshotHasher.stop();
        this.activityMonitor.stop();
        this.isTracking = false;

        console.log('[WorkTracker] ⏸ Tracking stopped');
    }

    /**
     * Update daily summary with new activity data
     */
    private updateDailySummary(snapshot: ActivitySnapshot): void {
        console.log(`[WorkTracker] 🔄 Updating daily summary (active: ${snapshot.isActive})`);

        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const today = `${year}-${month}-${day}`;

        // Get existing summary or create new one
        let summary = this.db.getDailySummary(today);

        if (!summary) {
            summary = {
                date: today,
                totalActiveMinutes: 0,
                codingMinutes: 0,
                meetingMinutes: 0,
                browserMinutes: 0,
                communicationMinutes: 0,
                productivityMinutes: 0,
                submittedToChain: false
            };
        }

        // Only count active time (30 second intervals = 0.5 minutes)
        if (snapshot.isActive) {
            summary.totalActiveMinutes += 0.5;

            // Update category-specific minutes
            switch (snapshot.appCategory) {
                case AppCategory.CODING:
                    summary.codingMinutes += 0.5;
                    break;
                case AppCategory.MEETING:
                    summary.meetingMinutes += 0.5;
                    break;
                case AppCategory.BROWSER:
                    summary.browserMinutes += 0.5;
                    break;
                case AppCategory.COMMUNICATION:
                    summary.communicationMinutes += 0.5;
                    break;
                case AppCategory.PRODUCTIVITY:
                    summary.productivityMinutes += 0.5;
                    break;
            }

            // Save updated summary
            this.db.updateDailySummary(today, summary);

            // Upload to Shelby on every update (for testing)
            // TODO: Change back to batching after testing (% 5 === 0)
            console.log(`[WorkTracker] Triggering Shelby upload (total: ${summary.totalActiveMinutes}m)`);
            this.uploadToShelby(summary);
        }
    }

    /**
     * Upload daily summary to Shelby Protocol
     */
    private async uploadToShelby(summary: DailySummary): Promise<void> {
        try {
            console.log(`[WorkTracker] Uploading summary to Shelby for ${summary.date}...`);
            const blobId = await this.shelbyService.uploadDailySummary(summary);

            // Update database with blob ID
            summary.shelbyBlobId = blobId;
            this.db.updateDailySummary(summary.date, summary);

            console.log(`[WorkTracker] ✅ Uploaded to Shelby: ${blobId}`);
        } catch (error) {
            console.error('[WorkTracker] Failed to upload to Shelby:', error);
            // Continue tracking even if upload fails
        }
    }

    /**
     * Get current tracker status
     */
    getStatus(): TrackerStatus {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const today = `${year}-${month}-${day}`;
        const todaySummary = this.db.getDailySummary(today);
        const lastHash = this.screenshotHasher.getLastHash();

        return {
            isTracking: this.isTracking,
            todaySummary,
            lastScreenshotHash: lastHash || undefined,
            lastActivityTime: Date.now()
        };
    }

    /**
     * Get summary for a specific date
     */
    getSummaryForDate(date: string): DailySummary | null {
        return this.db.getDailySummary(date);
    }

    /**
     * Get screenshot hashes for a specific date
     */
    getScreenshotHashes(date: string): Array<{ hash: string; timestamp: number }> {
        return this.db.getScreenshotHashesForDate(date);
    }

    /**
     * Get history of daily summaries
     */
    getHistory(limit: number = 7): DailySummary[] {
        return this.db.getRecentSummaries(limit);
    }

    /**
     * Cleanup resources
     */
    cleanup(): void {
        console.log('[WorkTracker] Cleaning up...');
        this.stop();
        this.db.close();
        console.log('[WorkTracker] Cleanup complete');
    }
}
