const { app, BrowserWindow, ipcMain, session } = require('electron');
const { APP_DISPLAY_NAME, APP_USER_MODEL_ID, SESSION_PARTITION } = require('./constants');
const { registerAppPermissions } = require('./permissions');
const { createMainWindow } = require('./window');

app.setName(APP_DISPLAY_NAME);
process.title = APP_DISPLAY_NAME;

if (process.platform === 'win32') {
  app.setAppUserModelId(APP_USER_MODEL_ID);
}

function registerWindowChromeIpc() {
  ipcMain.handle('shell:get-window-state', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win || win.isDestroyed()) {
      return { isMaximized: false };
    }
    return { isMaximized: win.isMaximized() };
  });

  ipcMain.on('shell:window', (_event, action) => {
    const win = BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0];
    if (!win) return;

    if (action === 'minimize') {
      win.minimize();
    } else if (action === 'maximize') {
      if (win.isMaximized()) {
        win.unmaximize();
      } else {
        win.maximize();
      }
    } else if (action === 'close') {
      win.close();
    }
  });
}

app.whenReady().then(() => {
  const russcordSession = session.fromPartition(SESSION_PARTITION);
  registerAppPermissions(russcordSession);
  registerWindowChromeIpc();
  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
