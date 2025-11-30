import { app, Tray, Menu, nativeImage } from 'electron';
import path from 'path';
import { WorkTracker } from './tracker';

/**
 * System tray manager
 * Provides UI controls and status display in the system tray
 */
export class TrayManager {
    private tray: Tray | null = null;
    private tracker: WorkTracker;
    private updateInterval: NodeJS.Timeout | null = null;

    constructor(tracker: WorkTracker) {
        this.tracker = tracker;
    }

    /**
     * Create system tray icon and menu
     */
    create(): void {
        try {
            // Try to load custom icon, fallback to default if not found
            let icon: Electron.NativeImage;
            try {
                const iconPath = path.join(__dirname, '../../assets/icon.png');
                icon = nativeImage.createFromPath(iconPath);
                if (icon.isEmpty()) {
                    throw new Error('Icon is empty');
                }
            } catch {
                // Create a simple icon programmatically
                icon = nativeImage.createEmpty();
            }

            this.tray = new Tray(icon.resize({ width: 16, height: 16 }));
            this.tray.setToolTip('WorkChain - Proof of Work Tracker');

            this.updateMenu();

            // Update menu every 30 seconds to show fresh stats
            this.updateInterval = setInterval(() => {
                this.updateMenu();
            }, 30000);

            console.log('[TrayManager] System tray created');
        } catch (error) {
            console.error('[TrayManager] Failed to create tray:', error);
        }
    }

    /**
     * Update tray menu with current status
     */
    private updateMenu(): void {
        if (!this.tray) return;

        const status = this.tracker.getStatus();
        const summary = status.todaySummary;

        const totalHours = summary ? Math.floor(summary.totalActiveMinutes / 60) : 0;
        const totalMinutes = summary ? Math.floor(summary.totalActiveMinutes % 60) : 0;

        const contextMenu = Menu.buildFromTemplate([
            {
                label: '⚡ WorkChain Tracker',
                enabled: false
            },
            { type: 'separator' },
            {
                label: status.isTracking ? '⏸️  Pause Tracking' : '▶️  Start Tracking',
                click: () => {
                    if (status.isTracking) {
                        this.tracker.stop();
                    } else {
                        this.tracker.start();
                    }
                    this.updateMenu();
                }
            },
            { type: 'separator' },
            {
                label: `📊 Today: ${totalHours}h ${totalMinutes}m active`,
                enabled: false
            },
            {
                label: `💻 Coding: ${Math.floor((summary?.codingMinutes || 0) / 60)}h ${Math.floor((summary?.codingMinutes || 0) % 60)}m`,
                enabled: false
            },
            {
                label: `📞 Meetings: ${Math.floor((summary?.meetingMinutes || 0) / 60)}h ${Math.floor((summary?.meetingMinutes || 0) % 60)}m`,
                enabled: false
            },
            {
                label: `🌐 Browser: ${Math.floor((summary?.browserMinutes || 0) / 60)}h ${Math.floor((summary?.browserMinutes || 0) % 60)}m`,
                enabled: false
            },
            {
                label: `📝 Productivity: ${Math.floor((summary?.productivityMinutes || 0) / 60)}h ${Math.floor((summary?.productivityMinutes || 0) % 60)}m`,
                enabled: false
            },
            {
                label: `📧 Communication: ${Math.floor((summary?.communicationMinutes || 0) / 60)}h ${Math.floor((summary?.communicationMinutes || 0) % 60)}m`,
                enabled: false
            },
            { type: 'separator' },
            {
                label: '📸 Last Screenshot Hash',
                enabled: false
            },
            {
                label: status.lastScreenshotHash
                    ? `   ${status.lastScreenshotHash.substring(0, 24)}...`
                    : '   Not captured yet',
                enabled: false
            },
            { type: 'separator' },
            {
                label: '📁 View Logs',
                click: () => {
                    // Open the database folder
                    const { shell } = require('electron');
                    const { app } = require('electron');
                    const path = require('path');
                    const dbPath = path.join(app.getPath('userData'));
                    shell.openPath(dbPath);
                }
            },
            {
                label: '⚙️  Settings',
                click: () => {
                    // TODO: Open settings window
                    console.log('Settings clicked');
                }
            },
            {
                label: '📊 View Dashboard',
                click: () => {
                    // Open dashboard in Electron window
                    const { createDashboardWindow } = require('./dashboard-window');
                    createDashboardWindow();
                }
            },
            { type: 'separator' },
            {
                label: '❌ Quit',
                click: () => {
                    this.tracker.cleanup();
                    app.quit();
                }
            }
        ]);

        this.tray.setContextMenu(contextMenu);

        // Update tooltip
        const statusText = status.isTracking ? 'Tracking' : 'Paused';
        this.tray.setToolTip(`WorkChain - ${statusText} | ${totalHours}h ${totalMinutes}m today`);
    }

    /**
     * Destroy tray icon
     */
    destroy(): void {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }

        if (this.tray) {
            this.tray.destroy();
            this.tray = null;
            console.log('[TrayManager] Destroyed');
        }
    }
}
