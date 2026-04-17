const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('overlayAPI', {
  onUpdate: (cb) => ipcRenderer.on('update', (_, data) => cb(data)),
});
