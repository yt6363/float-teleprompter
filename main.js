const { app, BrowserWindow, globalShortcut, ipcMain } = require('electron');
const path = require('path');

let win;
let clickThrough = true;

function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 200,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    hasShadow: false,
    skipTaskbar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
    },
  });

  win.loadFile('index.html');
  win.setIgnoreMouseEvents(true, { forward: true });

  // Renderer tells us when mouse enters/leaves interactive zones
  ipcMain.on('set-ignore-mouse', (_, ignore) => {
    if (!clickThrough) return; // if user toggled full interactive, don't override
    if (ignore) {
      win.setIgnoreMouseEvents(true, { forward: true });
    } else {
      win.setIgnoreMouseEvents(false);
    }
  });

  // Cmd+Shift+T = toggle full click-through vs full interactive
  globalShortcut.register('CommandOrControl+Shift+T', () => {
    clickThrough = !clickThrough;
    if (clickThrough) {
      win.setIgnoreMouseEvents(true, { forward: true });
    } else {
      win.setIgnoreMouseEvents(false);
    }
    win.webContents.send('click-through-changed', clickThrough);
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

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  app.quit();
});
