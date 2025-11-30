import activeWin from 'active-win';
import crypto from 'crypto';
import { ActivitySnapshot, AppCategory } from './types';

/**
 * Monitors active windows and user activity
 */
export class ActivityMonitor {
    private lastWindowHash: string | null = null;
    private lastActivityTime: number = Date.now();
    private interval: NodeJS.Timeout | null = null;
    private readonly CHECK_INTERVAL_MS = 30 * 1000; // 30 seconds
    private readonly IDLE_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes of no window changes = idle

    /**
     * Categorize application based on its name
     */
    private categorizeApp(appName: string): AppCategory {
        const name = appName.toLowerCase();

        // Coding tools
        if (name.includes('code') || name.includes('visual studio') ||
            name.includes('intellij') || name.includes('pycharm') ||
            name.includes('webstorm') || name.includes('rider') ||
            name.includes('sublime') || name.includes('atom') ||
            name.includes('vim') || name.includes('emacs') ||
            name.includes('cursor') || name.includes('antigravity')) {
            return AppCategory.CODING;
        }

        // Meeting/Video conferencing
        if (name.includes('teams') || name.includes('zoom') ||
            name.includes('meet') || name.includes('slack') ||
            name.includes('webex') || name.includes('skype') ||
            name.includes('discord')) {
            return AppCategory.MEETING;
        }

        // Web browsers
        if (name.includes('chrome') || name.includes('firefox') ||
            name.includes('edge') || name.includes('safari') ||
            name.includes('brave') || name.includes('opera') ||
            name.includes('browser')) {
            return AppCategory.BROWSER;
        }

        // Communication
        if (name.includes('outlook') || name.includes('mail') ||
            name.includes('thunderbird') || name.includes('telegram') ||
            name.includes('whatsapp') || name.includes('messenger')) {
            return AppCategory.COMMUNICATION;
        }

        // Productivity
        if (name.includes('excel') || name.includes('word') ||
            name.includes('powerpoint') || name.includes('notion') ||
            name.includes('obsidian') || name.includes('onenote') ||
            name.includes('evernote') || name.includes('trello') ||
            name.includes('asana') || name.includes('jira') ||
            name.includes('office')) {
            return AppCategory.PRODUCTIVITY;
        }

        return AppCategory.OTHER;
    }

    /**
     * Hash a string using SHA-256
     */
    private hashString(input: string): string {
        return crypto.createHash('sha256').update(input).digest('hex');
    }

    /**
     * Check if user is active based on window changes
     * If the active window hasn't changed in IDLE_THRESHOLD_MS, consider user idle
     */
    private checkActivity(currentWindowHash: string): boolean {
        const now = Date.now();

        // If window changed, user is definitely active
        if (currentWindowHash !== this.lastWindowHash) {
            this.lastWindowHash = currentWindowHash;
            this.lastActivityTime = now;
            return true;
        }

        // If same window but within idle threshold, still consider active
        const timeSinceLastActivity = now - this.lastActivityTime;
        return timeSinceLastActivity < this.IDLE_THRESHOLD_MS;
    }

    /**
     * Start monitoring activity
     */
    async start(callback: (snapshot: ActivitySnapshot) => void): Promise<void> {
        console.log('[ActivityMonitor] Starting activity monitoring every 30 seconds');

        this.interval = setInterval(async () => {
            try {
                const window = await activeWin();

                if (!window) {
                    console.log('[ActivityMonitor] No active window detected');
                    return;
                }

                const windowTitleHash = this.hashString(window.title);
                const isActive = this.checkActivity(windowTitleHash);

                const snapshot: ActivitySnapshot = {
                    timestamp: Date.now(),
                    windowTitleHash,
                    appName: window.owner.name,
                    appCategory: this.categorizeApp(window.owner.name),
                    isActive
                };

                console.log(`[ActivityMonitor] ${window.owner.name} (${snapshot.appCategory}) - Active: ${isActive}`);

                callback(snapshot);
            } catch (error) {
                console.error('[ActivityMonitor] Activity monitoring failed:', error);
            }
        }, this.CHECK_INTERVAL_MS);
    }

    /**
     * Stop monitoring
     */
    stop(): void {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
            console.log('[ActivityMonitor] Stopped');
        }
    }
}
