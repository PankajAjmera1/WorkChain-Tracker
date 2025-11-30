import { app, BrowserWindow } from 'electron';
import { WorkTracker } from './tracker';
import { TrayManager } from './tray';
import { setupIPC } from './ipc';

/**
 * Main Electron process
 * Initializes the work tracker and system tray
 */

let tracker: WorkTracker;
let trayManager: TrayManager;

// Ensure single instance
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    console.log('[Main] Another instance is already running');
    app.quit();
} else {
    app.on('second-instance', () => {
        console.log('[Main] Second instance attempted to launch');
    });

    // Initialize when app is ready
    app.whenReady().then(async () => {
        console.log('[Main] App ready, initializing...');

        // Create tracker
        tracker = new WorkTracker();
        await tracker.initialize(); // Initialize database

        // Setup IPC handlers for Angular dashboard
        setupIPC(tracker);

        // Create system tray
        trayManager = new TrayManager(tracker);
        trayManager.create();

        // Auto-start tracking
        tracker.start();
    });

    // Handle app activation (macOS)
    app.on('activate', () => {
        // On macOS, re-create window if clicked in dock
        if (BrowserWindow.getAllWindows().length === 0) {
            // Could open a dashboard window here
        }
    });
}

// Prevent app from quitting when all windows are closed (we run in tray)
app.on('window-all-closed', () => {
    // Don't quit - we want to run in the background
});

// Cleanup on quit
app.on('before-quit', () => {
    if (tracker) {
        tracker.cleanup();
    }
    if (trayManager) {
        trayManager.destroy();
    }
});
