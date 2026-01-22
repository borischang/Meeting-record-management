
const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  // 创建浏览器窗口
  const mainWindow = new BrowserWindow({
    width: 1366,
    height: 900,
    title: "会议记录管理系统",
    webPreferences: {
      // 保持与网页版一致的渲染逻辑
      contextIsolation: true,
      nodeIntegration: false,
      // 允许加载远程 ESM 模块 (针对 index.html 中的 esm.sh)
      webSecurity: false 
    },
    // 设置窗口在屏幕中央
    center: true,
    // 使用应用标题
    autoHideMenuBar: true
  });

  // 加载本地的 index.html
  mainWindow.loadFile('index.html');

  // 开发环境下可开启调试工具
  // mainWindow.webContents.openDevTools();
}

// Electron 完成初始化后触发
app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    // 在 macOS 上，当点击图标且没有其他窗口打开时，重新创建一个窗口
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// 当所有窗口关闭时退出应用
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
