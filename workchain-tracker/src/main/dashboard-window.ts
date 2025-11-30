import { BrowserWindow, app } from 'electron';
import path from 'path';

let dashboardWindow: BrowserWindow | null = null;

/**
 * Create or show the dashboard window
 */
export function createDashboardWindow(): void {
    // If window already exists, just show it
    if (dashboardWindow) {
        dashboardWindow.show();
        dashboardWindow.focus();
        return;
    }

    // Create the browser window
    dashboardWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        title: 'WorkChain Dashboard',
        frame: false, // Remove default window frame (removes all window controls)
        titleBarStyle: 'hidden',
        webPreferences: {
            preload: path.join(__dirname, '../preload/preload.js'),
            contextIsolation: true,
            nodeIntegration: false
        },
        icon: path.join(__dirname, '../../assets/icon.png')
    });

    // Load the Angular app
    // In development, load from ng serve
    // In production, load from built files
    const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

    if (isDev) {
        // Development: Load from Angular dev server
        dashboardWindow.loadURL('http://localhost:4200');

        // Open DevTools in development
        dashboardWindow.webContents.openDevTools();
    } else {
        // Production: Load from built files
        dashboardWindow.loadFile(path.join(__dirname, '../../dashboard/index.html'));
    }

    // Handle window close
    dashboardWindow.on('closed', () => {
        dashboardWindow = null;
    });

    console.log('[Dashboard] Window created (frameless)');
}

/**
 * Close the dashboard window
 */
export function closeDashboardWindow(): void {
    if (dashboardWindow) {
        dashboardWindow.close();
        dashboardWindow = null;
    }
}

/**
 * Check if dashboard window is open
 */
export function isDashboardWindowOpen(): boolean {
    return dashboardWindow !== null && !dashboardWindow.isDestroyed();
}
