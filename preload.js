const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  sendNotification: (message) => ipcRenderer.send('show-session-created-notification', message)
});
