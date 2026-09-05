const { app, BrowserWindow, shell, ipcMain } = require('electron');
const path = require('path');
const { createSteamClient } = require('./steamClient.cjs');
const { registerSteamIpcHandlers } = require('./steamIpc.cjs');

// TODO: Replace 480 with actual Steam App ID before release
if (!process.env.STEAM_APP_ID) process.env.STEAM_APP_ID = '480';

registerSteamIpcHandlers(ipcMain, { steamClient: createSteamClient() });

const GAME_CONTENT_WIDTH = 450;
const GAME_CONTENT_HEIGHT = 800;

function createWindow() {
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

  win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  win.setMenuBarVisibility(false);

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => app.quit());
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
