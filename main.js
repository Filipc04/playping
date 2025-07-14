const { app, BrowserWindow, Tray, Notification, Menu } = require('electron');
const path = require('path');

let win;
let tray;

function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    icon: path.join(__dirname, 'logo.png'), // Your app icon
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    },
    autoHideMenuBar: true
  });

  win.loadURL('http://localhost:3000');
  win.setMenu(null);
}

app.whenReady().then(() => {
  app.setName('PlayPing');  // Sets app name (used in notifications)

  createWindow();

  tray = new Tray(path.join(__dirname, 'logo.png'));
  tray.setToolTip('PlayPing');

  tray.on('click', () => {
    win.isVisible() ? win.hide() : win.show();
  });

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show/Hide',
      click: () => {
        win.isVisible() ? win.hide() : win.show();
      }
    },
    {
      label: 'Quit',
      click: () => {
        app.isQuiting = true;
        app.quit();
      }
    }
  ]);
  tray.setContextMenu(contextMenu);

  new Notification({
    title: 'Your friends want to game!',
    body: 'Let them know if youre available or not.'
  }).show();
});

// On macOS, recreate window if dock icon clicked and no windows open
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// Quit when all windows closed (except on macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
