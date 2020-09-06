const { app, ipcMain, BrowserWindow } = require("electron");

import installExtension, { REDUX_DEVTOOLS } from "electron-devtools-installer";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
    // eslint-disable-line global-require
    app.quit();
}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

ipcMain.on("atoll-close-app", (evt, avg) => {
    console.log("'atoll-close-app' received in main");
    mainWindow.close();
    app.quit();
});

ipcMain.on("atoll-maximize-app", (evt, avg) => {
    console.log("'atoll-maximize-app' received in main");
    mainWindow.maximize();
});

ipcMain.on("atoll-restore-app", (evt, avg) => {
    console.log("'atoll-restore-app' received in main");
    mainWindow.restore();
});

ipcMain.on("atoll-minimize-app", (evt, avg) => {
    console.log("'atoll-minimize-app' received in main");
    mainWindow.minimize();
});

const createWindow = () => {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            webSecurity: false
        },
        titleBarStyle: "hidden", // hides everything on Windows, but keeps "traffic light" window frame controls on Mac OS X
        frame: false
    });

    // this hides the menu
    mainWindow.setMenu(null);

    // and load the index.html of the app.
    mainWindow.loadURL(`file://${__dirname}/index.html`);

    // Open the DevTools.
    mainWindow.webContents.openDevTools();

    mainWindow.on("close", function(e) {
        e.preventDefault();
        mainWindow.destroy();
    });

    // Emitted when the window is closed.
    mainWindow.on("closed", () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", () => {
    createWindow();
    installExtension(REDUX_DEVTOOLS)
        .then((name) => console.log(`Added Extension:  ${name}`))
        .catch((err) => console.log("An error occurred: ", err));
});

// Quit when all windows are closed.
app.on("window-all-closed", () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
