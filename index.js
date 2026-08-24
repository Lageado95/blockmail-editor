const { app, BrowserWindow, dialog } = require('electron');
const { autoUpdater } = require('electron-updater');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 850,
    title: "BlockMail Editor",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // Oculta el menú feo por defecto de Windows
  mainWindow.setMenuBarVisibility(false);
  mainWindow.loadFile('index.html');
  
  // Buscar actualizaciones apenas la ventana está lista
  mainWindow.once('ready-to-show', () => {
    autoUpdater.checkForUpdatesAndNotify();
  });
}

app.whenReady().then(createWindow);

// Cerrar el programa cuando se cierran las ventanas
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// --- LÓGICA DE ACTUALIZACIONES AUTOMÁTICAS ---
autoUpdater.on('update-available', () => {
  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: '¡Actualización encontrada!',
    message: 'Hay una nueva versión de BlockMail Editor. Se está descargando en segundo plano...',
    buttons: ['Genial']
  });
});

autoUpdater.on('update-downloaded', () => {
  dialog.showMessageBox(mainWindow, {
    type: 'question',
    title: 'Actualización lista',
    message: 'La actualización ya está descargada. ¿Querés reiniciar la aplicación ahora para instalarla?',
    buttons: ['Reiniciar y Actualizar', 'Más tarde']
  }).then((result) => {
    if (result.response === 0) {
      autoUpdater.quitAndInstall();
    }
  });
});