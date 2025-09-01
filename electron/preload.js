// electron/preload.js
const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('desktop', {
  ping: () => 'pong'
});
