/**
 * Ad-hoc verification for the quick-start wizard + milestone line.
 * Serves ./out on 8850, drives headless Chrome over CDP, saves screenshots.
 */
const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');

const ROOT = path.join(__dirname, '..', 'out');
const PORT = 8851;
const CDP = 9600 + Math.floor(Math.random() * 300);
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml', '.ico': 'image/x-icon',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp',
};

const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  let file = path.join(ROOT, p);
  try {
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
    if (!fs.existsSync(file)) file = path.join(ROOT, p + '.html');
    if (!fs.existsSync(file)) file = path.join(ROOT, '404.html');
    const body = fs.readFileSync(file);
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
    res.end(body);
  } catch (e) {
    res.writeHead(500); res.end('err');
  }
});

(async () => {
  await new Promise((r) => server.listen(PORT, '127.0.0.1', r));

  const proc = spawn(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars',
    '--remote-debugging-port=' + CDP, '--window-size=1280,1100',
    '--user-data-dir=' + path.join(os.tmpdir(), 'st-qs-' + Date.now()), 'about:blank']);

  const getJSON = (p) => new Promise((res, rej) => {
    http.get({ host: '127.0.0.1', port: CDP, path: p }, (r) => {
      let d = ''; r.on('data', (c) => (d += c)); r.on('end', () => { try { res(JSON.parse(d)); } catch (e) { rej(e); } });
    }).on('error', rej);
  });

  let list = null;
  for (let i = 0; i < 60; i++) { try { list = await getJSON('/json/list'); if (list && list.length) break; } catch (e) {} await sleep(300); }
  const target = list.find((t) => t.type === 'page');
  const WebSocket = require('ws');
  const ws = new WebSocket(target.webSocketDebuggerUrl, { perMessageDeflate: false });

  let id = 0; const pending = new Map();
  const send = (m, p) => new Promise((res, rej) => { const i = ++id; pending.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method: m, params: p || {} })); });
  ws.on('message', (raw) => {
    const m = JSON.parse(raw);
    if (m.id && pending.has(m.id)) { const { res, rej } = pending.get(m.id); pending.delete(m.id); m.error ? rej(new Error(JSON.stringify(m.error))) : res(m.result); }
  });
  await new Promise((r) => ws.on('open', r));

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 1100, deviceScaleFactor: 2, mobile: false });

  const evalJs = async (expr) => {
    const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails));
    return r.result.value;
  };

  const shot = async (name) => {
    const r = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('/tmp/' + name, Buffer.from(r.data, 'base64'));
    console.log('  screenshot → /tmp/' + name);
  };

  const out = [];
  const check = (name, ok, detail) => { out.push({ name, ok, detail }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  ' + detail : ''}`); };

  await send('Page.navigate', { url: `http://127.0.0.1:${PORT}/` });
  await sleep(3000);

  // milestone line should already be visible on the demo
  console.log('   debug tick-card:', await evalJs(`document.querySelector('.tick-card')?.innerHTML.slice(0,320) || 'MISSING'`));
  check('next-mile visible on demo', await evalJs(`!!document.querySelector('.next-mile')`));
  const mileText = await evalJs(`document.querySelector('.next-mile')?.textContent || ''`);
  console.log('   milestone line:', mileText);

  // wizard should auto-open at ~12s
  await sleep(11_000);
  check('wizard auto-opens after ~12s', await evalJs(`!!document.querySelector('.qs.on')`));
  await shot('qs-step1.png');

  // step 1 → 2
  await evalJs(`document.querySelectorAll('.qs-foot button')[1].click()`);
  await sleep(400);
  check('step 2 reached (days picker)', await evalJs(`!!document.querySelector('.qs-days')`));
  // pick 4 days
  await evalJs(`[...document.querySelectorAll('.qs-days button')].find(b=>b.textContent.trim()==='4').click()`);
  await sleep(300);
  await shot('qs-step2.png');

  // step 2 is the last step now — the same button finishes
  await evalJs(`document.querySelectorAll('.qs-foot button')[1].click()`);
  await sleep(1200);
  check('wizard closed after finish', await evalJs(`!document.querySelector('.qs.on')`));
  const stored = await evalJs(`localStorage.getItem('salarytimer.site.v2') || ''`);
  let parsed = {};
  try { parsed = JSON.parse(stored); } catch (e) {}
  check('onboarded persisted', parsed.onboarded === true, `days=${JSON.stringify(parsed.days)}`);
  check('demo bar gone', await evalJs(`!document.querySelector('.demo-bar.on')`));

  // Right now the local clock is outside the shift, so the counter is paused and
  // the milestone line is correctly hidden. Move the shift around "now" and
  // reload to prove the line appears when money is actually moving.
  const window2 = await evalJs(`(() => {
    const k = 'salarytimer.site.v2';
    const s = JSON.parse(localStorage.getItem(k));
    const n = new Date();
    const p = (x) => String(x).padStart(2, '0');
    s.days = [n.getDay()];
    s.start = p(Math.max(0, n.getHours() - 1)) + ':00';
    s.end = p(Math.min(23, n.getHours() + 2)) + ':00';
    s.breaks = [];
    localStorage.setItem(k, JSON.stringify(s));
    return s.start + ' → ' + s.end;
  })()`);
  await send('Page.reload');
  await sleep(2500);
  const mile = await evalJs(`document.querySelector('.next-mile')?.textContent || ''`);
  check('milestone line during a live shift', /Next \$/.test(mile), `${window2} | ${mile}`);
  const rate2 = await evalJs(`document.querySelector('.chip-row .chip:nth-child(2) .v')?.textContent || ''`);
  console.log('   hourly chip:', rate2);
  await shot('qs-done.png');

  // console errors?
  const errs = await evalJs(`(window.__errs||[]).length`);
  console.log('   console errors captured:', errs);

  const failed = out.filter((r) => !r.ok).length;
  console.log(`\n${out.length - failed} passed, ${failed} failed`);

  ws.close();
  try { proc.kill('SIGKILL'); } catch (e) {}
  server.close();
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error('ERROR', e); process.exit(2); });
