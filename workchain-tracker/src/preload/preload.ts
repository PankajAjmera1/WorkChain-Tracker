const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
    getStatus: () => ipcRenderer.invoke('tracker:getStatus'),
    startTracking: () => ipcRenderer.invoke('tracker:start'),
    stopTracking: () => ipcRenderer.invoke('tracker:stop'),
    onStatsUpdate: (callback: (stats: any) => void) => {
        ipcRenderer.on('stats:update', (_event: any, stats: any) => callback(stats));
    }
});
