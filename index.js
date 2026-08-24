const { app, BrowserWindow, dialog } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');

let mainWindow;

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, 'icon.ico'), // Acá le inyectamos tu icono a la ventana
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  mainWindow.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();
  
  // Apenas abre la app, busca actualizaciones en GitHub
  autoUpdater.checkForUpdatesAndNotify();
});

// EVENTO 1: Cuando encuentra una actualización disponible
autoUpdater.on('update-available', () => {
  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: 'Actualización disponible',
    message: 'Hay una nueva versión de BlackMail Editor. Se está descargando en segundo plano...',
    buttons: ['Entendido']
  });
});

// EVENTO 2: Cuando termina de descargar la actualización
autoUpdater.on('update-downloaded', () => {
  dialog.showMessageBox(mainWindow, {
    type: 'question',
    title: 'Actualización lista',
    message: 'La nueva versión ya se descargó. ¿Querés reiniciar la aplicación ahora para instalarla?',
    buttons: ['Reiniciar y Actualizar', 'Más tarde']
  }).then((result) => {
    if (result.response === 0) {
      autoUpdater.quitAndInstall();
    }
  });
});

// EVENTO 3: Por si hay un error en la actualización
autoUpdater.on('error', (error) => {
  console.log('Error al actualizar: ', error);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});