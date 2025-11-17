import { app, BrowserWindow, nativeTheme } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Force light theme
nativeTheme.themeSource = 'light';

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), // Optional: for more advanced features later
      nodeIntegration: true,
      contextIsolation: false,
    },
    autoHideMenuBar: true,
    icon: path.join(__dirname, '../dist/vite.svg') // Assumes vite.svg is in your public/dist folder
  });

  // Load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));

  // Open the DevTools for debugging (optional)
  // mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
