/**
 * Capture the three QuickStart wizard steps as PNGs for review.
 *
 * Self-contained: starts its own static server over ./out, drives headless
 * Chrome over CDP, and writes screenshots into ./outputs. A watchdog kills the
 * whole thing if anything stalls, so it can never hang a session.
 *
 * Usage:
 *   npm run build
 *   NODE_PATH=... node scripts/capture-wizard.cjs
 */
const http = require('http');
const { spawn } = require('child_process');
const fsx = require('fs');
const os = require('os');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'out');
const OUT_DIR = path.join(ROOT, 'outputs');
const PORT = 8851;
const CDP = 9561;

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
].filter(Boolean);
const CHROME = CHROME_CANDIDATES.find((p) => {
  try { return fsx.existsSync(p); } catch { return false; }
});
if (!CHROME) {
  console.error('No Chrome binary found. Set CHROME_PATH=/path/to/chrome');
  process.exit(2);
}
if (!fsx.existsSync(path.join(OUT, 'index.html')) && !process.env.CAPTURE_URL) {
  console.error('No build found at ./out — run `npm run build` first (or set CAPTURE_URL).');
  process.exit(2);
}

/** Set CAPTURE_URL to run the same checks against the deployed site. */
const BASE = process.env.CAPTURE_URL || `http://127.0.0.1:${PORT}`;

const TYPES = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon', '.txt': 'text/plain',
  '.woff': 'font/woff', '.woff2': 'font/woff2',
};

function serve() {
  const server = http.createServer((req, res) => {
    let p = decodeURIComponent(req.url.split('?')[0]);
    if (p === '/') p = '/index.html';
    const fp = path.join(OUT, p);
    if (!fp.startsWith(OUT)) { res.writeHead(403); res.end(); return; }
    const send = (file) => fsx.readFile(file, (err, data) => {
      if (err) { res.writeHead(404); res.end('Not found'); return; }
      res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
      res.end(data);
    });
    fsx.stat(fp, (err, st) => {
      if (err) return send(path.join(fp, 'index.html')); // trailingSlash directories
      if (st.isDirectory()) return send(path.join(fp, 'index.html'));
      return send(fp);
    });
  });
  return new Promise((resolve) => server.listen(PORT, '127.0.0.1', () => resolve(server)));
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const getJSON = (p) => new Promise((res, rej) => {
  http.get({ host: '127.0.0.1', port: CDP, path: p }, (r) => {
    let d = ''; r.on('data', (c) => (d += c)); r.on('end', () => { try { res(JSON.parse(d)); } catch (e) { rej(e); } });
  }).on('error', rej);
});

let server = null;
let proc = null;
const bail = (msg) => {
  console.error('capture failed:', msg);
  try { if (proc) proc.kill('SIGKILL'); } catch {}
  try { if (server) server.close(); } catch {}
  process.exit(1);
};
// Watchdog: this script must never hang the caller.
const watchdog = setTimeout(() => bail('watchdog timeout (60s)'), 60_000);
watchdog.unref?.();

(async () => {
  if (!process.env.CAPTURE_URL) server = await serve();

  proc = spawn(CHROME, [
    '--headless=new', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
    '--remote-debugging-port=' + CDP,
    '--window-size=1200,760',
    '--user-data-dir=' + path.join(os.tmpdir(), 'salarytimer-shot-' + Date.now()),
    'about:blank',
  ], { stdio: 'ignore' });

  let target = null;
  for (let i = 0; i < 50; i++) {
    try {
      const list = await getJSON('/json/list');
      target = list.find((t) => t.type === 'page');
      if (target) break;
    } catch { /* Chrome still booting */ }
    await sleep(200);
  }
  if (!target) bail('Chrome did not expose a page target');

  const WebSocket = require('ws');
  const ws = new WebSocket(target.webSocketDebuggerUrl, { perMessageDeflate: false });
  let id = 0;
  const pending = new Map();
  let connected = false;
  ws.on('open', () => { connected = true; });
  ws.on('close', () => {
    connected = false;
    for (const [, p] of pending) p.rej(new Error('CDP connection closed'));
    pending.clear();
  });
  const send = (method, params) => new Promise((res, rej) => {
    if (!connected) return rej(new Error('CDP not connected'));
    const i = ++id;
    pending.set(i, { res, rej });
    ws.send(JSON.stringify({ id: i, method, params: params || {} }), (err) => {
      if (err && pending.has(i)) { pending.delete(i); rej(err); }
    });
  });
  ws.on('message', (raw) => {
    const m = JSON.parse(raw);
    if (m.id && pending.has(m.id)) {
      const p = pending.get(m.id); pending.delete(m.id);
      m.error ? p.rej(new Error(JSON.stringify(m.error))) : p.res(m.result);
    }
  });
  await new Promise((resolve, reject) => {
    ws.once('open', resolve);
    ws.once('error', reject);
    ws.once('close', () => reject(new Error('CDP closed before opening')));
  });

  await send('Page.enable');
  await send('Runtime.enable');

  const evalJS = async (expr) => {
    const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || 'eval error');
    return r.result.value;
  };
  const click = (sel) => evalJS(`(()=>{const e=document.querySelector(${JSON.stringify(sel)}); if(!e) return 'MISS'; e.click(); return 'OK';})()`);
  const shot = async (name) => {
    const { data } = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    fsx.writeFileSync(path.join(OUT_DIR, name), Buffer.from(data, 'base64'));
    console.log('  ✓', name);
  };

  fsx.mkdirSync(OUT_DIR, { recursive: true });

  // `node scripts/capture-wizard.cjs month` → the "本月真实收入" card with the
  // now read-only label box, plus the setup row under the dashboard.
  if (process.argv[2] === 'month') {
    await send('Page.navigate', { url: `${BASE}/zh/` });
    await sleep(1200);
    await evalJS(`localStorage.setItem('salarytimer.site.v2', JSON.stringify({
        onboarded: true, v: 3, currency: 'CNY', mode: 'annual', amountCents: 151000000
      })); sessionStorage.setItem('st.qs.skip', '1')`);
    await send('Page.navigate', { url: `${BASE}/zh/` });
    let ready = false;
    for (let i = 0; i < 50; i++) {
      ready = await evalJS(`!!document.querySelector('.mini-form-label')`);
      if (ready) break;
      await sleep(200);
    }
    if (!ready) bail('month card never rendered');
    await send('Emulation.setDeviceMetricsOverride', { width: 1180, height: 900, deviceScaleFactor: 1, mobile: false });
    await sleep(400);
    await evalJS(`document.querySelector('.mini-form-label').scrollIntoView({ block: 'center' })`);
    await sleep(500);
    console.log('  label text:', JSON.stringify(await evalJS(`document.querySelector('.mini-form-label')?.textContent`)));
    await shot('本月卡片-奖金标签.png');
    // The setup button is back in the top action row.
    await evalJS(`window.scrollTo(0, 0)`);
    await sleep(500);
    await shot('设置入口-顶部按钮.png');
    ws.close(); proc.kill('SIGKILL'); if (server) server.close(); clearTimeout(watchdog);
    console.log('done');
    process.exit(0);
  }

  // `node scripts/capture-wizard.cjs home` → the first-visit screen (empty
  // state, no demo bar), desktop and mobile.
  if (process.argv[2] === 'home') {
    await send('Page.navigate', { url: `${BASE}/zh/` });
    await sleep(1200);
    await evalJS(`localStorage.removeItem('salarytimer.site.v2');
      sessionStorage.setItem('st.qs.skip', '1')`);
    await send('Page.navigate', { url: `${BASE}/zh/` });
    let ready = false;
    for (let i = 0; i < 50; i++) {
      ready = await evalJS(`!!document.querySelector('.ticker') && !!document.querySelector('.app-actions .btn-ink')`);
      if (ready) break;
      await sleep(200);
    }
    if (!ready) bail('app shell never hydrated');
    await sleep(700);
    // Taller viewport so the whole counter card is in frame, not just the hero.
    await send('Emulation.setDeviceMetricsOverride', { width: 1180, height: 900, deviceScaleFactor: 1, mobile: false });
    await sleep(400);
    console.log('  status:', JSON.stringify(await evalJS(`document.querySelector('.status')?.textContent`)));
    console.log('  ticker:', JSON.stringify(await evalJS(`document.querySelector('.ticker')?.textContent`)));
    console.log('  rate  :', JSON.stringify(await evalJS(`document.querySelector('.tick-sub b')?.textContent`)));
    await shot('首屏-未设置-桌面.png');
    await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
    await sleep(500);
    await evalJS(`window.scrollTo(0, 0)`);
    await shot('首屏-未设置-手机.png');
    ws.close(); proc.kill('SIGKILL'); if (server) server.close(); clearTimeout(watchdog);
    console.log('done');
    process.exit(0);
  }

  // `node scripts/capture-wizard.cjs panel` → the settings panel's currency
  // picker, plus a JPY zero-decimal sanity readout.
  if (process.argv[2] === 'panel') {
    await send('Page.navigate', { url: `${BASE}/zh/` });
    await sleep(1500);
    // Mark the app as set up first — before setup that button opens the wizard.
    await evalJS(`localStorage.setItem('salarytimer.site.v2', JSON.stringify({ onboarded: true, v: 3 }));
      sessionStorage.setItem('st.qs.skip', '1')`);
    await send('Page.navigate', { url: `${BASE}/zh/` });
    await sleep(1200);
    // `.panel` is portal-rendered only after React mounts, so its existence is
    // a real hydration signal. Clicking the server-rendered button earlier than
    // that silently does nothing (this is exactly what happened against the
    // deployed site, where hydration is slower than on localhost).
    let ready = false;
    for (let i = 0; i < 60; i++) {
      ready = await evalJS(`!!document.querySelector('#currencyInput')`);
      if (ready) break;
      await sleep(250);
    }
    if (!ready) bail('settings panel never mounted');
    for (let i = 0; i < 6; i++) {
      await evalJS(`document.querySelector('.app-actions .btn-ink')?.click()`);
      await sleep(300);
      if (await evalJS(`document.querySelector('.panel')?.classList.contains('on') === true`)) break;
    }
    for (let i = 0; i < 40; i++) {
      if (await evalJS(`document.querySelector('.panel')?.classList.contains('on') === true`)) break;
      await sleep(150);
    }
    if (!(await evalJS(`document.querySelector('.panel')?.classList.contains('on') === true`))) {
      bail('settings panel did not open');
    }
    await sleep(400);
    const codes = await evalJS(`[...document.querySelectorAll('#currencyInput option')].map(o => o.textContent.trim())`);
    console.log('  currency options:', codes.length, JSON.stringify(codes.slice(0, 8)));
    await shot('货币选择-桌面.png');

    // Zero-decimal currency: JPY must not show a ".00" tail.
    await evalJS(`(() => {
      const el = document.querySelector('#currencyInput');
      Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(el, 'JPY');
      el.dispatchEvent(new Event('change', { bubbles: true }));
    })()`);
    await sleep(300);
    // The panel edits a draft — commit it, then read the live ticker.
    await evalJS(`document.querySelector('.panel-foot .btn-mint')?.click()`);
    await sleep(900);
    const tickerAfter = await evalJS(`document.querySelector('.ticker')?.textContent`);
    console.log('  ticker after JPY:', JSON.stringify(tickerAfter));
    console.log('  hourly after JPY:', JSON.stringify(await evalJS(`document.querySelector('.tick-sub b')?.textContent`)));
    if (!String(tickerAfter || '').startsWith('¥')) bail('JPY did not reach the live ticker');
    await shot('货币选择-日元-桌面.png');

    // Reopen the panel for the narrow-screen shot.
    await evalJS(`document.querySelector('.app-actions .btn-ink')?.click()`);
    for (let i = 0; i < 30; i++) {
      if (await evalJS(`document.querySelector('.panel')?.classList.contains('on') === true`)) break;
      await sleep(150);
    }
    await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
    await sleep(500);
    await shot('货币选择-手机.png');
    ws.close(); proc.kill('SIGKILL'); if (server) server.close(); clearTimeout(watchdog);
    console.log('done');
    process.exit(0);
  }

  // Chinese wizard, fresh state. A token proves we are looking at the NEW
  // document — otherwise stale-DOM queries can fire before the reload commits.
  const token = 'cap-' + Date.now();
  await send('Page.addScriptToEvaluateOnNewDocument', {
    source: `window.__capToken = ${JSON.stringify(token)};`,
  });
  await send('Page.navigate', { url: `${BASE}/zh/` });
  await sleep(1200);
  await evalJS(`localStorage.removeItem('salarytimer.site.v2'); sessionStorage.removeItem('st.qs.skip')`);
  await send('Page.navigate', { url: `${BASE}/zh/` });
  for (let i = 0; i < 50; i++) {
    if (await evalJS(`window.__capToken === ${JSON.stringify(token)}`)) break;
    await sleep(200);
  }
  // The wizard is reached through the black "设置薪资" button before setup.
  let ready = false;
  for (let i = 0; i < 50; i++) {
    ready = await evalJS(`!!document.querySelector('.app-actions .btn-ink')`);
    if (ready) break;
    await sleep(200);
  }
  if (!ready) bail('app shell never hydrated');
  await sleep(600);
  await click('.app-actions .btn-ink');
  await sleep(600);

  let open = await evalJS(`document.querySelector('.qs')?.classList.contains('on') === true`);
  if (!open) {
    await click('.app-actions .btn-ink');
    await sleep(800);
    open = await evalJS(`document.querySelector('.qs')?.classList.contains('on') === true`);
  }
  if (!open) bail('wizard did not open');
  const opts = await evalJS(`[...document.querySelectorAll('.qs .qs-seg button')].map(b=>b.textContent.trim())`);
  console.log('  pay options:', JSON.stringify(opts));

  await shot('快速设置-第1步.png');
  await click('.qs-foot button:nth-child(2)');
  await sleep(350);
  await shot('快速设置-第2步.png');
  await click('.qs-foot button:nth-child(2)');
  await sleep(350);
  await shot('快速设置-第3步.png');

  // Mobile pass (390 × 844), reusing the same wizard.
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  await click('.qs-foot button:nth-child(1)');
  await sleep(200);
  await click('.qs-foot button:nth-child(1)');
  await sleep(300);
  const overflow = await evalJS(`document.documentElement.scrollWidth - window.innerWidth`);
  console.log('  mobile horizontal overflow:', overflow, 'px');
  await shot('快速设置-第1步-手机.png');
  await click('.qs-foot button:nth-child(2)');
  await sleep(300);
  await shot('快速设置-第2步-手机.png');
  await click('.qs-foot button:nth-child(2)');
  await sleep(300);
  await shot('快速设置-第3步-手机.png');

  ws.close();
  proc.kill('SIGKILL');
  if (server) server.close();
  clearTimeout(watchdog);
  console.log('done');
  process.exit(0);
})().catch((e) => bail(e.message));
