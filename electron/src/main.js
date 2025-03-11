const { app, BrowserWindow } = require('electron')
const path = require('path')
const serve = require('electron-serve')
const { loadEnvConfig } = require('./utils/envConfig')
const { startPythonProcess, cleanup } = require('./services/pythonService')
const setupIpcHandlers = require('./handlers/ipcHandlers')

let mainWindow

const appServe = app.isPackaged ? serve({
  directory: path.join(__dirname, "../../out")
}) : null;

const createWindow = async () => {
  // Load environment variables
  loadEnvConfig()
  
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    },
    show: false
  });

  // Start Python process
  try {
    await startPythonProcess(mainWindow)
  } catch (error) {
    console.error('Failed to start Python process:', error)
    mainWindow?.webContents.send('python-error', {
      type: 'startup-error',
      error: error.message
    })
  }

  // Setup IPC handlers
  setupIpcHandlers(mainWindow)

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  if (app.isPackaged) {
    appServe(mainWindow).then(() => {
      mainWindow.loadURL("app://-");
    });
  } else {
    mainWindow.loadURL("http://localhost:3000");
    mainWindow.webContents.openDevTools();
    mainWindow.webContents.on("did-fail-load", () => {
      mainWindow.webContents.reloadIgnoringCache();
    });
  }

  mainWindow.webContents.on('ipc-message', (event, channel, ...args) => {
    console.log('IPC message:', channel, args);
  });
};

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  cleanup()
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
}); 