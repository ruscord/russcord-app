const fs = require('fs');
const path = require('path');
const { BrowserWindow, BrowserView, shell } = require('electron');
const { APP_ORIGIN, APP_DISPLAY_NAME, SESSION_PARTITION, TITLEBAR_HEIGHT } = require('./constants');
const { isRusscordUrl } = require('./permissions');

function preloadPath() {
  return path.join(__dirname, '../preload/preload.js');
}

function rendererPath(filename) {
  return path.join(__dirname, '../renderer', filename);
}

function windowIconPath() {
  const ico = path.join(__dirname, '../assets/icons/favicon.ico');
  return fs.existsSync(ico) ? ico : undefined;
}

function layoutBrowserView(win, view) {
  const { width, height } = win.getContentBounds();
  view.setBounds({
    x: 0,
    y: TITLEBAR_HEIGHT,
    width,
    height: Math.max(0, height - TITLEBAR_HEIGHT),
  });
}

function attachBrowserView(win) {
  const view = new BrowserView({
    webPreferences: {
      partition: SESSION_PARTITION,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      preload: preloadPath(),
    },
  });

  win.setBrowserView(view);
  layoutBrowserView(win, view);

  const relayout = () => layoutBrowserView(win, view);
  win.on('resize', relayout);
  win.on('maximize', relayout);
  win.on('unmaximize', relayout);

  view.webContents.setWindowOpenHandler(({ url }) => {
    if (isRusscordUrl(url)) {
      return { action: 'allow' };
    }
    shell.openExternal(url);
    return { action: 'deny' };
  });

  view.webContents.loadURL(APP_ORIGIN);

  return view;
}

function broadcastTitlebarState(win) {
  if (!win || win.isDestroyed()) return;
  win.webContents.send('titlebar:window-state', {
    isMaximized: win.isMaximized(),
  });
}

function broadcastTitlebarFocus(win, focused) {
  if (!win || win.isDestroyed()) return;
  win.webContents.send('titlebar:focus', focused);
}

function createMainWindow() {
  const icon = windowIconPath();
  const win = new BrowserWindow({
    title: APP_DISPLAY_NAME,
    ...(icon ? { icon } : {}),
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    frame: false,
    show: false,
    backgroundColor: '#1e1f22',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      preload: preloadPath(),
    },
  });

  attachBrowserView(win);

  win.on('maximize', () => broadcastTitlebarState(win));
  win.on('unmaximize', () => broadcastTitlebarState(win));

  win.on('focus', () => broadcastTitlebarFocus(win, true));
  win.on('blur', () => broadcastTitlebarFocus(win, false));

  win.loadFile(rendererPath('index.html'));

  win.once('ready-to-show', () => {
    win.show();
    broadcastTitlebarState(win);
    broadcastTitlebarFocus(win, win.isFocused());
  });

  return win;
}

module.exports = { createMainWindow };
