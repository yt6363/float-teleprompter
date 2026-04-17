const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  expand: () => ipcRenderer.send('expand'),
  collapse: () => ipcRenderer.send('collapse'),
  setIgnoreMouse: (ignore) => ipcRenderer.send('set-ignore-mouse', ignore),
  onToggleExpand: (cb) => ipcRenderer.on('toggle-expand', cb),
  onTogglePlay: (cb) => ipcRenderer.on('toggle-play', cb),
  onRestart: (cb) => ipcRenderer.on('restart', cb),
  onSpeedChange: (cb) => ipcRenderer.on('speed-change', (_, d) => cb(d)),
  onToggleControls: (cb) => ipcRenderer.on('toggle-controls', cb),
  moveWindow: (dx, dy) => ipcRenderer.send('move-window', dx, dy),
});
