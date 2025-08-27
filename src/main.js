const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");


function createWindow() {
  const { screen } = require('electron');
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } = primaryDisplay.workArea;
  const winWidth = 250;
  const winHeight = 400;
  const win = new BrowserWindow({
    width: winWidth,
    height: winHeight,
    x: 16,
    y: screenHeight - winHeight - 16,
    frame: false,          // pas de bordures
    transparent: true,     // fenêtre transparente
    alwaysOnTop: true,     // reste au-dessus
    resizable: true,
    skipTaskbar: true,
    webPreferences: {
      preload: path.join(__dirname, "../../src/preload.js")
    }
  });

  // Charge la page React générée par Webpack
  win.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // S’ouvre quand le renderer a peint (évite un flash "vide")
  win.once("ready-to-show", () => {
    win.show();
    win.webContents.openDevTools({ mode: "detach" }); // console visible
  });
}


app.whenReady().then(createWindow);
