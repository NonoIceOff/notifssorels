const { app, BrowserWindow, ipcMain, screen, Notification, shell, Tray, Menu } = require("electron");
const path = require("path");
const axios = require("axios");
const { updateElectronApp, UpdateSourceType } = require('update-electron-app')

updateElectronApp({
    updateSource: {
        type: UpdateSourceType.ElectronPublicUpdateService,
        repo: 'NonoIceOff/notifssorels'
    },
    updateInterval: '1 hour',
    logger: require('electron-log')
})

// Configuration du path du fichier .env selon l'environnement
const envPath = app.isPackaged
    ? path.join(process.resourcesPath, '.env')
    : path.join(process.cwd(), '.env');

console.log('Chemin .env:', envPath);
console.log('App packaged:', app.isPackaged);

const fs = require('fs');
if (fs.existsSync(envPath)) {
    console.log('Fichier .env trouvé !');
} else {
    console.log('ERREUR: Fichier .env non trouvé !');
}

require('dotenv').config({ path: envPath });

const isDev = !app.isPackaged;

let win;
let tray = null;
let notificationSent = false;

function createWindow() {
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width: screenWidth, height: screenHeight } = primaryDisplay.workArea;

    let winWidth = 180;
    let winHeight = 100;

    win = new BrowserWindow({
        width: winWidth,
        height: winHeight,
        x: 100,
        y: 100,
        frame: false,
        transparent: true,
        alwaysOnTop: true,
        resizable: false,
        skipTaskbar: false,
        show: false,
        webPreferences: {
            preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
            nodeIntegration: false,
            contextIsolation: true
        }
    });


    // IPC pour ajuster dynamiquement la taille de la fenêtre
    ipcMain.on("set-window-size", (event, { width, height }) => {
        if (win && typeof width === "number" && typeof height === "number") {
            const { height: screenHeight } = screen.getPrimaryDisplay().workArea;
            win.setBounds({
                x: 0,
                y: screenHeight - height,
                width,
                height
            });
        }
    });


    // S'assure que la fenêtre est toujours cliquable (pas de setIgnoreMouseEvents)

    win.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

    if (!app.isPackaged) {
        win.webContents.openDevTools({ mode: "detach" });
    }

    // Vérifie les 10 minutes et envoie la notification si nécessaire
    ipcMain.on("check-10-minutes", (event) => {
        const lastVisit = localStorage.getItem('lastVisit');
        const currentTime = Date.now();

        if (lastVisit && currentTime - lastVisit > 10 * 60 * 1000 && !notificationSent) {
            // Affichage de la notification
            const notification = new Notification({
                title: 'Mode Rappel activé',
                body: 'C’est le moment de votre rappel !'
            });

            notification.show();

            // Arrêter l’envoi de notifications pendant 2 secondes
            notificationSent = true;

            setTimeout(() => {
                notificationSent = false;
            }, 2000);
        }
    });

    // Handler sécurisé pour récupérer tous les FUPs côté main process
    ipcMain.handle('get-fups', async () => {
        try {
            console.log("Récupération FUPs côté main process...");
            const AIRTABLE_PAT = process.env.AIRTABLE_PAT;
            const AIRTABLE_BASE = process.env.AIRTABLE_BASE;
            const AIRTABLE_TABLE = process.env.AIRTABLE_TABLE;
            const AIRTABLE_BASEB = process.env.AIRTABLE_BASEB;
            const AIRTABLE_TABLEB = process.env.AIRTABLE_TABLEB;
            const urlBornes = `https://api.airtable.com/v0/${AIRTABLE_BASE}/${AIRTABLE_TABLE}?view=viwYSQHhIhDSCxjWa&filterByFormula=AND(NOT({FUP%20INTERRACTION%20}=''),{Je%20traite}=FALSE())&sort[0][field]=FUP%20INTERRACTION%20&sort[0][direction]=asc`;
            const urlBat = `https://api.airtable.com/v0/${AIRTABLE_BASEB}/${AIRTABLE_TABLEB}?view=viwnZpTSlapB9TP42&filterByFormula=AND(NOT({FUP%20Interraction}=''),{Je%20traite}=FALSE())&sort[0][field]=FUP%20Interraction&sort[0][direction]=asc`;
            const [resBornes, resBat] = await Promise.all([
                axios.get(urlBornes, { headers: { Authorization: `Bearer ${AIRTABLE_PAT}` } }),
                axios.get(urlBat, { headers: { Authorization: `Bearer ${AIRTABLE_PAT}` } }),
            ]);
            const bornesRecords = resBornes.data.records.map((r) => ({
                ...r,
                date: r.fields["FUP INTERRACTION "],
                source: "Borne",
                sourceEmoji: "⛽🔌"
            }));
            const batRecords = resBat.data.records.map((r) => ({
                ...r,
                date: r.fields["FUP Interraction"],
                source: "Batterie/Panneau",
                sourceEmoji: "🔋☀️"
            }));
            const records = [...bornesRecords, ...batRecords].filter(r => r.date);
            records.sort((a, b) => new Date(a.date) - new Date(b.date));
            return records;
        } catch (e) {
            return { error: e.message };
        }
    });

    // Handler sécurisé pour récupérer les commerciaux côté main process
    ipcMain.handle('get-commerciaux', async () => {
        try {
            console.log("Récupération commerciaux côté main process...");
            const AIRTABLE_PAT = process.env.AIRTABLE_PAT;
            const AIRTABLE_BASE = process.env.AIRTABLE_BASE;
            const AIRTABLE_TABLE_COMM = process.env.AIRTABLE_TABLE_COMM || "tbl88zJhSHXTUfsUv";
            const url = `https://api.airtable.com/v0/${AIRTABLE_BASE}/${AIRTABLE_TABLE_COMM}`;
            const res = await axios.get(url, { headers: { Authorization: `Bearer ${AIRTABLE_PAT}` } });
            return res.data.records;
        } catch (e) {
            return { error: e.message };
        }
    });

    // Handler sécurisé pour ouvrir des URLs externes
    ipcMain.handle('open-external', async (event, url) => {
        try {
            await shell.openExternal(url);
            return { success: true };
        } catch (e) {
            return { error: e.message };
        }
    });

    ipcMain.handle('declare-treatment', async (event, data) => {
        try {
            console.log("Déclaration de traitement:", data);
            const url = `${data.urlInterraction}`;
            const AIRTABLE_PAT = process.env.AIRTABLE_PAT;
            console.log("URL pour mise à jour:", url);
            const response = await axios.patch(
                url,
                {
                    fields: { "Je traite": true },
                    typecast: true
                },
                {
                    headers: {
                        Authorization: `Bearer ${AIRTABLE_PAT}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            console.log("Mise à jour réussie:");
            return { success: true, data: response.data };
        } catch (e) {
            if (e.response) {
                console.error("Airtable status:", e.response.status);
                console.error("Airtable error body:", e.response.data);
                return { error: e.response.data };
            } else if (e.request) {
                console.error("No response received:", e.request);
                return { error: "No response received" };
            } else {
                console.error("Error setting up request:", e.message);
                return { error: e.message };
            }
        }
    });

    // Handler pour ouvrir une fenêtre de notes
    ipcMain.handle('open-notes-window', async (event, data) => {
        try {
            const notesWindow = new BrowserWindow({
                width: 400,
                height: "auto",
                resizable: true,
                frame: true,
                title: data.title || 'Notes',
                webPreferences: {
                    nodeIntegration: false,
                    contextIsolation: true,
                    enableRemoteModule: false
                },
                parent: win,
                modal: false,
                show: false
            });

            // Contenu HTML simple pour afficher les notes
            const notesHtml = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>${data.title || 'Notes'}</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            margin: 0;
                            padding: 20px;
                            background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
                            color: #e2e8f0;
                            line-height: 1.6;
                        }
                        .container {
                            max-width: 100%;
                            margin: 0 auto;
                        }
                        .title {
                            font-size: 18px;
                            font-weight: 600;
                            margin-bottom: 16px;
                            padding-bottom: 8px;
                            border-bottom: 2px solid #475569;
                            color: #f1f5f9;
                        }
                        .notes-content {
                            background: rgba(255,255,255,0.1);
                            padding: 16px;
                            border-radius: 8px;
                            border: 1px solid rgba(255,255,255,0.2);
                            font-size: 14px;
                            text-align: justify;
                            word-wrap: break-word;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="title">${data.title || 'Notes'}</div>
                        <div class="notes-content">
                            ${(data.notes || 'Aucune note disponible').replace(/\n/g, '<br>')}
                        </div>
                    </div>
                </body>
                </html>
            `;

            notesWindow.loadURL(`data:text/html;charset=UTF-8,${encodeURIComponent(notesHtml)}`);
            
            notesWindow.once('ready-to-show', () => {
                notesWindow.show();
            });

            notesWindow.on('closed', () => {
                // Fenêtre fermée
            });

            return { success: true };
        } catch (error) {
            console.error('Erreur création fenêtre notes:', error);
            return { error: error.message };
        }
    });

    win.on("resize", () => {
        const [width, height] = win.getSize();
        const { height: screenHeight, width: screenWidth } = screen.getPrimaryDisplay().workArea;
        win.setBounds({ x: (screenWidth - width) / 2, y: 20, width, height });
    });

    win.once("ready-to-show", () => {
        win.show();
    });
}

function createTray() {
    // Crée une icône simple avec nativeImage
    const { nativeImage } = require('electron');

    // Crée une icône 16x16 simple
    const icon = nativeImage.createEmpty();

    // Ou utilise une icône par défaut si disponible
    try {
        // Essaie de créer une icône simple
        tray = new Tray(icon);
    } catch (error) {
        console.log('Erreur création tray:', error);
        return;
    }

    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'NotifsSorel',
            enabled: false
        },
        {
            type: 'separator'
        },
        {
            label: 'Retour à l\'accueil',
            click: () => {
                if (win) {
                    win.webContents.send('go-to-home');
                }
            }
        },
        {
            label: 'Désactiver mode rappel',
            click: () => {
                if (win) {
                    win.webContents.send('disable-rappel-mode');
                }
            }
        },
        {
            type: 'separator'
        },
        {
            label: 'Afficher/Masquer',
            click: () => {
                if (win) {
                    if (win.isVisible()) {
                        win.hide();
                    } else {
                        win.show();
                    }
                }
            }
        },
        {
            label: 'Quitter',
            click: () => {
                app.quit();
            }
        }
    ]);

    tray.setToolTip('NotifsSorel - Gestionnaire de rappels');
    tray.setContextMenu(contextMenu);

    // Double-clic pour afficher/masquer la fenêtre
    tray.on('double-click', () => {
        if (win) {
            if (win.isVisible()) {
                win.hide();
            } else {
                win.show();
            }
        }
    });
}

app.on("window-all-closed", () => {
    if (tray) {
        tray.destroy();
    }
    if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

app.whenReady().then(() => {
    createWindow();
    createTray();
});
