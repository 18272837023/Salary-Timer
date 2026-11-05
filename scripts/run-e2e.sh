#!/bin/bash
# Start static server + run e2e tests in one process
set -e
cd "$(dirname "$0")/.."
PORT=8850

# Kill anything on the port
lsof -ti :$PORT 2>/dev/null | xargs kill -9 2>/dev/null || true

# Start static server in background
NODE_PATH=/Users/zhoujing/.workbuddy-ai/binaries/node/workspace/node_modules \
/Users/zhoujing/.workbuddy-ai/binaries/node/versions/22.22.2-6/bin/node -e "
const http = require('http');
const fs = require('fs');
const path = require('path');
const root = path.join(process.cwd(), 'out');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon', '.txt': 'text/plain', '.woff': 'font/woff', '.woff2': 'font/woff2' };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/index.html';
  const fp = path.join(root, p);
  if (!fp.startsWith(root)) { res.writeHead(403); res.end(); return; }
  fs.stat(fp, (err, stats) => {
    if (err) {
      // Try appending /index.html for directory URLs (trailingSlash: true)
      const dirIndex = path.join(fp, 'index.html');
      fs.readFile(dirIndex, (e2, d2) => {
        if (e2) { res.writeHead(404); res.end('Not found'); return; }
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(d2);
      });
      return;
    }
    if (stats.isDirectory()) {
      fs.readFile(path.join(fp, 'index.html'), (e2, d2) => {
        if (e2) { res.writeHead(404); res.end('Not found'); return; }
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(d2);
      });
      return;
    }
    fs.readFile(fp, (e3, data) => {
      if (e3) { res.writeHead(404); res.end('Not found'); return; }
      const ext = path.extname(fp);
      res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream' });
      res.end(data);
    });
  });
});
server.listen($PORT, '127.0.0.1', () => console.log('Server on $PORT'));
" &
SERVER_PID=$!
echo "Server PID: $SERVER_PID"

# Wait for server to be ready
for i in $(seq 1 10); do
  if curl -s -o /dev/null http://127.0.0.1:$PORT/; then
    echo "Server ready"
    break
  fi
  sleep 0.5
done

# Run e2e tests
NODE_PATH=/Users/zhoujing/.workbuddy-ai/binaries/node/workspace/node_modules \
/Users/zhoujing/.workbuddy-ai/binaries/node/versions/22.22.2-6/bin/node scripts/e2e.cjs
E2E_EXIT=$?

# Cleanup
kill $SERVER_PID 2>/dev/null || true
exit $E2E_EXIT
