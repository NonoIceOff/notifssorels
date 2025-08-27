const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  getCommerciaux: () => ipcRenderer.invoke("get-commerciaux"),
});
