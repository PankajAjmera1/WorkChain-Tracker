import { Injectable, signal, inject } from '@angular/core';
import { TrackerStatus, DailySummary, CategoryStats, AppCategory } from '../models/tracker.model';
import { AptosService } from './aptos.service';

@Injectable({
    providedIn: 'root'
})
export class TrackerService {
    private aptosService = inject(AptosService);

    // Signals for reactive state
    private statusSignal = signal<TrackerStatus | null>(null);

    // Public readonly signals
    readonly status = this.statusSignal.asReadonly();

    constructor() {
        // Listen for updates from Electron
        if (typeof window !== 'undefined' && (window as any).electronAPI) {
            (window as any).electronAPI.onStatsUpdate((status: TrackerStatus) => {
                console.log('TrackerService received status:', status);
                this.statusSignal.set(status);
            });

            // Initial load
            this.loadStatus();
        }
    }

    async loadStatus() {
        if (typeof window !== 'undefined' && (window as any).electronAPI) {
            const status = await (window as any).electronAPI.getStatus();
            this.statusSignal.set(status);
        }
    }

    async startTracking() {
        if (typeof window !== 'undefined' && (window as any).electronAPI) {
            const status = await (window as any).electronAPI.startTracking();
            this.statusSignal.set(status);
        }
    }

    async stopTracking() {
        if (typeof window !== 'undefined' && (window as any).electronAPI) {
            const status = await (window as any).electronAPI.stopTracking();
            this.statusSignal.set(status);

            // Submit proof to Aptos if we have a wallet connected
            if (this.aptosService.isConnected() && status.todaySummary.totalActiveMinutes > 0) {
                try {
                    console.log('Submitting proof to Aptos...');
                    const minutes = status.todaySummary.totalActiveMinutes;
                    const hash = status.lastScreenshotHash || '0x0'; // Fallback if no hash

                    const durationSeconds = minutes * 60;
                    const timestamp = Date.now();
                    const appName = "WorkChain Tracker";
                    const windowTitle = "Daily Summary";

                    await this.aptosService.submitProof(appName, windowTitle, durationSeconds, timestamp, hash);

                    // Refresh balance to show rewards
                    await this.aptosService.refreshBalance();

                    console.log('Proof submitted successfully!');
                } catch (error) {
                    console.error('Failed to submit proof:', error);
                }
            }
        }
    }

    formatMinutes(minutes: number): string {
        if (minutes < 60) {
            return `${minutes}m`;
        }
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return `${h}h ${m}m`;
    }

    getCategoryStats(summary: any) {
        if (!summary) return [];

        const stats = [
            { category: 'coding', minutes: summary.codingMinutes, color: '#8b5cf6', percentage: 0 },
            { category: 'browser', minutes: summary.browserMinutes, color: '#6366f1', percentage: 0 },
            { category: 'meeting', minutes: summary.meetingMinutes, color: '#ec4899', percentage: 0 },
            { category: 'communication', minutes: summary.communicationMinutes, color: '#10b981', percentage: 0 },
            { category: 'other', minutes: summary.otherMinutes, color: '#94a3b8', percentage: 0 }
        ].filter(s => s.minutes > 0);

        const total = stats.reduce((acc, curr) => acc + curr.minutes, 0);
        return stats.map(s => ({
            ...s,
            percentage: total > 0 ? (s.minutes / total) * 100 : 0
        })).sort((a, b) => b.minutes - a.minutes);
    }
}
