// electron/main.js
const { app, BrowserWindow, shell } = require('electron');
const path = require('node:path');
const isDev = require('electron-is-dev');
const getPort = require('get-port');
const { spawn } = require('node:child_process');

let win;
let nextProc;

async function startNextServer() {
  if (isDev && process.env.ELECTRON_START_URL) {
    return { url: process.env.ELECTRON_START_URL, proc: null };
  }

  const port = process.env.APP_PORT || await getPort({ port: getPort.makeRange(3000, 3999) });
  const nextBin = require.resolve('next/dist/bin/next');
  const nodeExec = process.execPath; 

  const mode = process.env.ELECTRON_NEXT_MODE || (isDev ? 'dev' : 'start');
  const args = [nextBin, mode, '-p', String(port)];
  const proc = spawn(nodeExec, args, { stdio: 'inherit', env: { ...process.env, PORT: String(port) } });

  proc.on('exit', (code) => {
    if (code !== 0) console.error(`next ${mode} exited with code`, code);
  });

  const wait = (ms) => new Promise(r => setTimeout(r, ms));
  for (let i = 0; i < 60; i++) { 
    try {
      const res = await fetch(`http://127.0.0.1:${port}/api/health?_=${Date.now()}`).catch(() => null);
      if (res && (res.ok || res.status === 404)) break;
    } catch {}
    await wait(1000);
  }

  return { url: `http://127.0.0.1:${port}`, proc };
}

async function createWindow() {
  const { url, proc } = await startNextServer();
  nextProc = proc;

  win = new BrowserWindow({
    width: 1280,
    height: 800,
    title: 'Egregore',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  await win.loadURL(url);

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
  win.webContents.on('will-navigate', (e, targetUrl) => {
    if (!targetUrl.startsWith('http://127.0.0.1') && !targetUrl.startsWith('http://localhost')) {
      e.preventDefault();
      shell.openExternal(targetUrl);
    }
  });

  if (isDev) win.webContents.openDevTools({ mode: 'detach' });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) void createWindow();
});

app.on('before-quit', () => {
  if (nextProc && !nextProc.killed) {
    try { nextProc.kill('SIGTERM'); } catch {}
  }
});
