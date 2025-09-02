const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
    allowClicks: () => ipcRenderer.send("allow-clicks"),
    ignoreClicks: () => ipcRenderer.send("ignore-clicks"),
    setWindowSize: ({ width, height }) => ipcRenderer.send("set-window-size", { width, height }),
    invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args),
    openExternal: (url) => ipcRenderer.invoke("open-external", url),
    declareTreatment: (data) => ipcRenderer.invoke("declare-treatment", data)
});
