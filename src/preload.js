const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
    allowClicks: () => ipcRenderer.send("allow-clicks"),
    ignoreClicks: () => ipcRenderer.send("ignore-clicks"),
    setWindowSize: ({ width, height }) => ipcRenderer.send("set-window-size", { width, height }),
    invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args),
    openExternal: (url) => ipcRenderer.invoke("open-external", url),
    declareTreatment: (data) => ipcRenderer.invoke("declare-treatment", data),
    onMessage: (channel, callback) => {
        const validChannels = ['go-to-home', 'disable-rappel-mode'];
        if (validChannels.includes(channel)) {
            ipcRenderer.on(channel, callback);
        }
    },
    removeListener: (channel, callback) => {
        const validChannels = ['go-to-home', 'disable-rappel-mode'];
        if (validChannels.includes(channel)) {
            ipcRenderer.removeListener(channel, callback);
        }
    }
});
