const { app, BrowserWindow, globalShortcut, ipcMain, screen } = require('electron');
const path = require('path');

let win;
let collapsed = true;
const PILL_W = 180;
const PILL_H = 52;
const EXPANDED_W = 1200;
const EXPANDED_H = 600;

function createWindow() {
  const { width: screenW } = screen.getPrimaryDisplay().workAreaSize;

  win = new BrowserWindow({
    width: PILL_W,
    height: PILL_H,
    x: Math.round(screenW / 2 - PILL_W / 2),
    y: 60,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    hasShadow: false,
    skipTaskbar: true,
    resizable: false,
    minWidth: PILL_W,
    minHeight: PILL_H,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      webviewTag: true,
    },
  });

  win.loadFile('index.html');
  // Pill starts fully interactive
  win.setIgnoreMouseEvents(false);

  ipcMain.on('expand', () => {
    collapsed = false;
    const bounds = win.getBounds();
    win.setResizable(true);
    win.setBounds({
      x: Math.max(0, bounds.x - Math.round((EXPANDED_W - PILL_W) / 2)),
      y: bounds.y,
      width: EXPANDED_W,
      height: EXPANDED_H,
    }, true);
    // Expanded: click-through by default, hover zones override
    setTimeout(() => {
      win.setIgnoreMouseEvents(true, { forward: true });
    }, 300);
  });

  ipcMain.on('collapse', () => {
    collapsed = true;
    const bounds = win.getBounds();
    // Pill: always interactive
    win.setIgnoreMouseEvents(false);
    win.setBounds({
      x: bounds.x + Math.round((bounds.width - PILL_W) / 2),
      y: bounds.y,
      width: PILL_W,
      height: PILL_H,
    }, true);
    win.setResizable(false);
  });

  // JS-based window drag
  ipcMain.on('move-window', (_, dx, dy) => {
    const bounds = win.getBounds();
    win.setBounds({ x: bounds.x + dx, y: bounds.y + dy, width: bounds.width, height: bounds.height });
  });

  // Renderer hover zones toggle click-through
  ipcMain.on('set-ignore-mouse', (_, ignore) => {
    if (collapsed) return; // pill is always interactive
    if (ignore) {
      win.setIgnoreMouseEvents(true, { forward: true });
    } else {
      win.setIgnoreMouseEvents(false);
    }
  });

  // Global hotkeys
  globalShortcut.register('CommandOrControl+Shift+T', () => {
    win.webContents.send('toggle-expand');
  });
  globalShortcut.register('CommandOrControl+Shift+P', () => {
    win.webContents.send('toggle-play');
  });
  globalShortcut.register('CommandOrControl+Shift+R', () => {
    win.webContents.send('restart');
  });
  globalShortcut.register('CommandOrControl+Shift+Up', () => {
    win.webContents.send('speed-change', 10);
  });
  globalShortcut.register('CommandOrControl+Shift+Down', () => {
    win.webContents.send('speed-change', -10);
  });
  globalShortcut.register('CommandOrControl+Shift+H', () => {
    win.webContents.send('toggle-controls');
  });
  globalShortcut.register('CommandOrControl+Shift+Q', () => {
    app.quit();
  });
}

app.whenReady().then(createWindow);
app.on('will-quit', () => globalShortcut.unregisterAll());
app.on('window-all-closed', () => app.quit());
