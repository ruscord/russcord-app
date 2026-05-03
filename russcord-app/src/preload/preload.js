const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('russcordShell', {
  version: process.versions.electron,
  minimize: () => ipcRenderer.send('shell:window', 'minimize'),
  maximize: () => ipcRenderer.send('shell:window', 'maximize'),
  close: () => ipcRenderer.send('shell:window', 'close'),
  getWindowState: () => ipcRenderer.invoke('shell:get-window-state'),
  onWindowState: (callback) => {
    const listener = (_event, payload) => {
      callback(payload);
    };
    ipcRenderer.on('titlebar:window-state', listener);
    return () => ipcRenderer.removeListener('titlebar:window-state', listener);
  },
  onTitlebarFocus: (callback) => {
    const listener = (_event, focused) => {
      callback(focused);
    };
    ipcRenderer.on('titlebar:focus', listener);
    return () => ipcRenderer.removeListener('titlebar:focus', listener);
  },
});
