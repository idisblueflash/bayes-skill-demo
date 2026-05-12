const http = require('http');
const fs = require('fs');
const path = require('path');

const STATE_FILE = path.join(__dirname, 'bayes_state.json');
const PUBLIC_DIR = path.join(__dirname, 'public');
const PORT = 3000;

const clients = new Set();

function readState() {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  } catch {
    return null;
  }
}

function broadcast(state) {
  const msg = `data: ${JSON.stringify(state)}\n\n`;
  for (const res of clients) {
    try { res.write(msg); } catch { clients.delete(res); }
  }
}

// Watch the directory so atomic writes (rename) are caught too
let watchTimeout;
fs.watch(path.dirname(STATE_FILE), (event, filename) => {
  if (filename !== path.basename(STATE_FILE)) return;
  clearTimeout(watchTimeout);
  watchTimeout = setTimeout(() => {
    const state = readState();
    if (state) broadcast(state);
  }, 150);
});

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css' };

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  if (url.pathname === '/events') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    });
    res.write(':ok\n\n');
    clients.add(res);

    const state = readState();
    if (state) res.write(`data: ${JSON.stringify(state)}\n\n`);

    req.on('close', () => clients.delete(res));
    return;
  }

  const filePath = path.join(PUBLIC_DIR, url.pathname === '/' ? 'index.html' : url.pathname);
  const ext = path.extname(filePath);
  try {
    const content = fs.readFileSync(filePath);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(content);
  } catch {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(PORT, () => {
  console.log(`\n  Bayes Live Viz  →  http://localhost:${PORT}\n`);
});
