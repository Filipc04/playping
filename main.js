const { app, BrowserWindow, Tray, Notification, Menu } = require('electron');
const path = require('path');
const { ipcMain } = require('electron');

function isWin() {
  return process.platform === 'win32';
}


if (isWin()) {
  app.setAppUserModelId('PlayPing'); 
}

let win;
let tray;

function createWindow() {
  if (win) {
    
    win.show();
    return;
  }

  win = new BrowserWindow({
    width: 800,
    height: 600,
    icon: path.join(__dirname, 'logo.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    autoHideMenuBar: true
  });

  win.loadURL('http://localhost:3000');
  win.setMenu(null);

  win.on('close', (event) => {
    if (!app.isQuiting) {
      event.preventDefault();
      win.hide();
    } else {
      win = null; 
    }
  });
}


app.whenReady().then(() => {
  
  app.setLoginItemSettings({
    openAtLogin: true,
    path: process.execPath
  });

  ipcMain.on('show-session-created-notification', (_, message) => {
    new Notification({
      title: 'Your friends want to game!',
      body: 'Let them know if you’re available or not.',
      icon: path.join(__dirname, 'logo.png')
    }).show();
  });

  app.setName('PlayPing');

  createWindow();

  tray = new Tray(path.join(__dirname, 'logo.png'));
  tray.setToolTip('PlayPing');

  tray.on('click', () => {
    if (!win) {
      createWindow();  
    } else {
      win.isVisible() ? win.hide() : win.show();
    }
  });
  

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show/Hide',
      click: () => {
        if (!win) {
          createWindow();
        } else {
          win.isVisible() ? win.hide() : win.show();
        }
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
});


app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});


app.on('window-all-closed', (e) => {
  
  e.preventDefault();
});




