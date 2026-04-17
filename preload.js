const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  onTogglePlay: (cb) => ipcRenderer.on('toggle-play', cb),
  onRestart: (cb) => ipcRenderer.on('restart', cb),
  onSpeedChange: (cb) => ipcRenderer.on('speed-change', (_, delta) => cb(delta)),
  onToggleControls: (cb) => ipcRenderer.on('toggle-controls', cb),
  onClickThroughChanged: (cb) => ipcRenderer.on('click-through-changed', (_, val) => cb(val)),
  setIgnoreMouse: (ignore) => ipcRenderer.send('set-ignore-mouse', ignore),
});
