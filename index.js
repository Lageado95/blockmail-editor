const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const fs = require('fs');

let mainWindow;
let isForceClose = false;

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, 'doc-logo.ico'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  mainWindow.loadFile('index.html');

  mainWindow.on('close', (e) => {
    if (!isForceClose) {
      e.preventDefault();
      mainWindow.webContents.send('request-app-close');
    }
  });

  mainWindow.webContents.on('did-finish-load', () => {
    const args = process.argv;
    if (args.length > 1) {
      const filePath = args[args.length - 1];
      if (filePath.endsWith('.bmail')) {
        if (fs.existsSync(filePath)) {
          mainWindow.webContents.send('open-external-file', filePath);
        } else {
          console.log("El archivo no existe más en el disco.");
        }
      }
    }
  });
}

app.whenReady().then(() => {
  createWindow();
  autoUpdater.checkForUpdatesAndNotify();
});

ipcMain.handle('show-save-dialog', async (event, options) => { return await dialog.showSaveDialog(mainWindow, options); });
ipcMain.handle('show-open-dialog', async (event, options) => { return await dialog.showOpenDialog(mainWindow, options); });
ipcMain.handle('get-user-data-path', () => { return app.getPath('userData'); });

// NUEVO: Enviar la versión de la app al frontend
ipcMain.handle('get-app-version', () => { return app.getVersion(); });

ipcMain.handle('read-file', (event, filePath) => {
  try { 
    if (!fs.existsSync(filePath)) return null;
    return fs.readFileSync(filePath, 'utf-8'); 
  } catch(e) { 
    return null; 
  }
});

ipcMain.handle('save-file', (event, filePath, content) => {
  try { fs.writeFileSync(filePath, content, 'utf-8'); return true; } catch(e) { return false; }
});

ipcMain.on('force-close-app', () => {
  isForceClose = true;
  app.quit();
});

autoUpdater.on('update-available', (info) => { if (mainWindow) mainWindow.webContents.send('update-available', info); });
autoUpdater.on('update-downloaded', (info) => { if (mainWindow) mainWindow.webContents.send('update-downloaded', info); });
autoUpdater.on('error', (error) => { if (mainWindow) mainWindow.webContents.send('update-error', error == null ? "Error desconocido" : (error.stack || error).toString()); });
ipcMain.on('restart-app', () => { autoUpdater.quitAndInstall(); });

app.on('second-instance', (event, commandLine, workingDirectory) => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
    const filePath = commandLine[commandLine.length - 1];
    if (filePath.endsWith('.bmail')) {
      if (fs.existsSync(filePath)) {
        mainWindow.webContents.send('open-external-file', filePath);
      }
    }
  }
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });