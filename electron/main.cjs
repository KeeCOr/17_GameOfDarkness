const { app, BrowserWindow, shell, ipcMain } = require('electron');
const path = require('path');
const { createSteamClient } = require('./steamClient.cjs');
const { registerSteamIpcHandlers } = require('./steamIpc.cjs');
const { createStaticServer } = require('./staticServer.cjs');

registerSteamIpcHandlers(ipcMain, { steamClient: createSteamClient() });

const GAME_CONTENT_WIDTH = 450;
const GAME_CONTENT_HEIGHT = 800;
let serverPromise = null;
let closePromise = null;
let isQuitting = false;

function ensureStaticServer() {
  if (!serverPromise) {
    serverPromise = createStaticServer(path.join(__dirname, '..', 'dist'));
  }
  return serverPromise;
}

async function closeStaticServer() {
  if (!serverPromise) return;
  if (!closePromise) {
    closePromise = serverPromise.then(({ close }) => close()).finally(() => {
      serverPromise = null;
    });
  }
  await closePromise;
}

async function createWindow() {
  const server = await ensureStaticServer();
  const win = new BrowserWindow({
    width: GAME_CONTENT_WIDTH,
    height: GAME_CONTENT_HEIGHT,
    minWidth: GAME_CONTENT_WIDTH,
    minHeight: GAME_CONTENT_HEIGHT,
    useContentSize: true,
    title: 'Chess of Dark',
    backgroundColor: '#1a1a2e',
    resizable: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'steamPreload.cjs'),
    },
  });

  await win.loadURL(server.url);
  win.setMenuBarVisibility(false);
  win.webContents.setWindowOpenHandler(({ url }) => {
    void shell.openExternal(url);
    return { action: 'deny' };
  });
}

app.whenReady().then(createWindow).catch((error) => {
  console.error('[electron] startup failed', error);
  app.quit();
});
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) void createWindow();
});
app.on('window-all-closed', () => app.quit());
app.on('before-quit', (event) => {
  if (isQuitting || !serverPromise) return;
  event.preventDefault();
  void closeStaticServer().finally(() => {
    isQuitting = true;
    app.quit();
  });
});
