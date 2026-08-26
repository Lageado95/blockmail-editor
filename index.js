const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, 'icon.ico'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  mainWindow.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();
  autoUpdater.checkForUpdatesAndNotify();
});

ipcMain.handle('show-save-dialog', async (event, options) => {
  return await dialog.showSaveDialog(mainWindow, options);
});

ipcMain.handle('show-open-dialog', async (event, options) => {
  return await dialog.showOpenDialog(mainWindow, options);
});

ipcMain.handle('get-user-data-path', () => {
  return app.getPath('userData');
});

autoUpdater.on('update-available', () => { if (mainWindow) mainWindow.webContents.send('update-available'); });
autoUpdater.on('update-downloaded', () => { if (mainWindow) mainWindow.webContents.send('update-downloaded'); });

autoUpdater.on('error', (error) => { 
  console.log('Error al actualizar: ', error);
  if (mainWindow) mainWindow.webContents.send('update-error', error == null ? "Error desconocido" : (error.stack || error).toString());
});

// Forzamos la instalación silenciosa y que se vuelva a abrir la app
ipcMain.on('restart-app', () => { 
  autoUpdater.quitAndInstall(true, true); 
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });