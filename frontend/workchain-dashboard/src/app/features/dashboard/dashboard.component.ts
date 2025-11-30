import { Component, computed, inject, signal, effect, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatListModule } from '@angular/material/list';
import { TrackerService } from '../../core/services/tracker.service';
import { AptosService } from '../../core/services/aptos.service';
import { StatsCardComponent } from '../stats/stats-card.component';
import { ActivityChartComponent } from '../stats/activity-chart.component';
import { AppCategory, DailySummary } from '../../core/models/tracker.model';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatToolbarModule,
        MatSlideToggleModule,
        MatListModule,
        StatsCardComponent,
        ActivityChartComponent
    ],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
    trackerService = inject(TrackerService);
    aptosService = inject(AptosService);

    // Dark theme toggle
    isDarkTheme = signal(false);
    isConnecting = signal(false);
    walletAddress = this.aptosService.address;
    walletBalance = this.aptosService.balance;

    // Reactive state from service
    status = this.trackerService.status;

    // Computed values
    totalHours = computed(() => {
        const status = this.trackerService.status();
        const summary = status?.todaySummary;
        if (!summary) return 0;
        return Math.floor((summary.totalActiveMinutes || 0) / 60);
    });

    totalMinutes = computed(() => {
        const status = this.trackerService.status();
        const summary = status?.todaySummary;
        if (!summary) return 0;
        return Math.floor((summary.totalActiveMinutes || 0) % 60);
    });

    codingTime = computed(() => {
        const status = this.trackerService.status();
        const summary = status?.todaySummary;
        return summary ? this.trackerService.formatMinutes(summary.codingMinutes || 0) : '0m';
    });

    meetingTime = computed(() => {
        const status = this.trackerService.status();
        const summary = status?.todaySummary;
        return summary ? this.trackerService.formatMinutes(summary.meetingMinutes || 0) : '0m';
    });

    browserTime = computed(() => {
        const status = this.trackerService.status();
        const summary = status?.todaySummary;
        return summary ? this.trackerService.formatMinutes(summary.browserMinutes || 0) : '0m';
    });

    communicationTime = computed(() => {
        const status = this.trackerService.status();
        const summary = status?.todaySummary;
        return summary ? this.trackerService.formatMinutes(summary.communicationMinutes || 0) : '0m';
    });

    categoryStats = signal<any[]>([]);
    activityChartData: any;

    // History data
    history = signal<DailySummary[]>([]);
    selectedDate = signal<DailySummary | null>(null);

    constructor() {
        // Setup effect to update charts when status changes
        effect(() => {
            const status = this.trackerService.status();
            if (status?.todaySummary) {
                this.updateCharts(status.todaySummary);
            }
        });
    }

    ngOnInit() {
        this.loadHistory();
    }

    async loadHistory() {
        if (typeof window !== 'undefined' && (window as any).electronAPI?.getHistory) {
            try {
                const history = await (window as any).electronAPI.getHistory();
                this.history.set(history);
            } catch (error) {
                console.error('Failed to load history:', error);
            }
        } else {
            // Fallback: Use empty history for web-only mode
            console.log('Running in web mode - history not available');
            this.history.set([]);
        }
    }

    selectDate(summary: DailySummary) {
        this.selectedDate.set(summary);
        this.updateCharts(summary);
    }

    toggleTracking() {
        const isTracking = this.trackerService.status()?.isTracking;
        if (isTracking) {
            this.trackerService.stopTracking();
        } else {
            this.trackerService.startTracking();
        }
    }

    toggleTheme() {
        this.isDarkTheme.update(v => !v);
        document.documentElement.setAttribute('data-theme', this.isDarkTheme() ? 'dark' : 'light');
    }

    closeWindow() {
        if (typeof window !== 'undefined' && (window as any).electronAPI) {
            window.close();
        }
    }

    async connectWallet() {
        console.log('Connect Wallet button clicked');
        this.isConnecting.set(true);
        try {
            const success = await this.aptosService.connectWallet();
            if (success) {
                await this.trackerService.stopTracking();
            }
        } finally {
            this.isConnecting.set(false);
        }
    }

    private updateCharts(summary: DailySummary) {
        const stats = this.trackerService.getCategoryStats(summary);

        this.activityChartData = {
            labels: stats.map(s => s.category),
            datasets: [{
                data: stats.map(s => s.minutes),
                backgroundColor: stats.map(s => s.color),
                borderWidth: 0
            }]
        };

        this.categoryStats.set(stats);
    }
}
