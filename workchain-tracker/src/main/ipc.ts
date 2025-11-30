import { ipcMain } from 'electron';
import { WorkTracker } from './tracker';

/**
 * Setup IPC handlers for communication with renderer process (Angular dashboard)
 */
export function setupIPC(tracker: WorkTracker): void {
    // Get current tracker status
    ipcMain.handle('tracker:getStatus', () => {
        return tracker.getStatus();
    });

    // Start tracking
    ipcMain.handle('tracker:start', () => {
        tracker.start();
        return { success: true };
    });

    // Stop tracking
    ipcMain.handle('tracker:stop', () => {
        tracker.stop();
        return { success: true };
    });

    // Get history
    ipcMain.handle('tracker:getHistory', () => {
        return tracker.getHistory();
    });

    console.log('[IPC] Handlers registered');
}
