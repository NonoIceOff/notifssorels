const path = require('path');
const { app } = require('electron');

/**
 * Résout le chemin d'un asset en fonction de l'environnement (dev/prod)
 * @param {string} assetPath - Le chemin relatif de l'asset
 * @returns {string} Le chemin absolu de l'asset
 */
function getAssetPath(assetPath) {
    if (app.isPackaged) {
        // En production, les assets sont dans process.resourcesPath
        return path.join(process.resourcesPath, 'assets', assetPath);
    } else {
        // En développement, les assets sont dans le dossier assets du projet
        return path.join(__dirname, '../../assets', assetPath);
    }
}

module.exports = { getAssetPath };
