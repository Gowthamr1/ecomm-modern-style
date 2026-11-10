const { app, BrowserWindow } = require("electron");
const path = require("path");

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: "Forma Spices — Windows Inventory Console",
    backgroundColor: "#1B3329",
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Default to the local Vite dev server inventory console route
  const startUrl = process.env.ELECTRON_START_URL || "http://localhost:5173/inventory";

  win.loadURL(startUrl);
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
