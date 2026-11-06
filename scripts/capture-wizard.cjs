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

  // `node scripts/capture-wizard.cjs panel` → the settings panel's currency
  // picker, plus a JPY zero-decimal sanity readout.
  if (process.argv[2] === 'panel') {
    await send('Page.navigate', { url: `${BASE}/zh/` });
    await sleep(1500);
    await evalJS(`sessionStorage.setItem('st.qs.skip', '1')`);
    let ready = false;
    for (let i = 0; i < 50; i++) {
      ready = await evalJS(`!!document.querySelector('.app-actions .btn-ink')`);
      if (ready) break;
      await sleep(200);
    }
    if (!ready) bail('app shell never hydrated');
    await evalJS(`document.querySelector('.app-actions .btn-ink').click()`);
    for (let i = 0; i < 40; i++) {
      if (await evalJS(`document.querySelector('.panel')?.classList.contains('on') === true`)) break;
      await sleep(150);
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
    console.log('  ticker after JPY:', JSON.stringify(await evalJS(`document.querySelector('.ticker')?.textContent`)));
    console.log('  hourly after JPY:', JSON.stringify(await evalJS(`document.querySelector('.tick-sub b')?.textContent`)));
    await shot('货币选择-日元-桌面.png');

    await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
    await sleep(400);
    await shot('货币选择-手机.png');
    ws.close(); proc.kill('SIGKILL'); if (server) server.close(); clearTimeout(watchdog);
    console.log('done');
    process.exit(0);
  }

  // `node scripts/capture-wizard.cjs demo` → annotated screenshot of the
  // yellow demo bar that opens the wizard, for "where do I click" questions.
  if (process.argv[2] === 'demo') {
    await send('Page.navigate', { url: `${BASE}/zh/` });
    await sleep(1500);
    await evalJS(`localStorage.removeItem('salarytimer.site.v2'); sessionStorage.setItem('st.qs.skip', '1')`);
    await send('Page.navigate', { url: `${BASE}/zh/` });
    let ready = false;
    for (let i = 0; i < 50; i++) {
      ready = await evalJS(`(() => { const el = document.querySelector('.demo-bar'); return !!el && getComputedStyle(el).display === 'flex'; })()`);
      if (ready) break;
      await sleep(200);
    }
    if (!ready) bail('demo bar is not visible');
    await sleep(400);
    // Re-runnable: clears any previous annotation, then spotlights the bar.
    const annotate = () => evalJS(`(() => {
      document.querySelectorAll('[data-cap-anno]').forEach((n) => n.remove());
      const bar = document.querySelector('.demo-bar');
      const r = bar.getBoundingClientRect();
      const style = document.createElement('style');
      style.setAttribute('data-cap-anno', '1');
      style.textContent = '.demo-bar{position:relative;z-index:2147483000;' +
        'box-shadow:0 0 0 3px #E5484D,0 0 0 9999px rgba(24,18,12,.42);border-radius:18px}';
      document.head.appendChild(style);
      const tag = document.createElement('div');
      tag.setAttribute('data-cap-anno', '1');
      tag.textContent = '① 点这个黄色条，弹窗立刻出现';
      const narrow = window.innerWidth < 500;
      // Narrow screens have no free space above the bar (the action buttons sit
      // there), so the callout docks to the bottom instead of covering them.
      tag.style.cssText = narrow
        ? 'position:fixed;left:16px;right:16px;bottom:24px;z-index:2147483001;background:#E5484D;color:#fff;' +
          'font:700 15px/1.35 -apple-system,BlinkMacSystemFont,sans-serif;text-align:center;padding:14px 16px;' +
          'border-radius:12px;box-shadow:0 10px 26px rgba(0,0,0,.32)'
        : 'position:fixed;left:' + Math.max(8, Math.round(r.left)) + 'px;top:' + Math.max(10, Math.round(r.top) - 48) + 'px;' +
          'z-index:2147483001;background:#E5484D;color:#fff;font:700 15px/1 -apple-system,BlinkMacSystemFont,sans-serif;' +
          'padding:10px 14px;border-radius:10px;box-shadow:0 6px 18px rgba(0,0,0,.28);white-space:nowrap';
      document.body.appendChild(tag);
      if (!narrow) {
        const arrow = document.createElement('div');
        arrow.setAttribute('data-cap-anno', '1');
        arrow.style.cssText = 'position:fixed;left:' + Math.round(r.left + 26) + 'px;top:' + Math.round(r.top - 12) + 'px;' +
          'width:0;height:0;border-left:8px solid transparent;border-right:8px solid transparent;' +
          'border-top:12px solid #E5484D;z-index:2147483001';
        document.body.appendChild(arrow);
      }
      return JSON.stringify({ top: Math.round(r.top), left: Math.round(r.left), w: Math.round(r.width) });
    })()`);
    console.log('  demo bar box:', await annotate());
    await shot('示例条位置-桌面.png');
    await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
    await sleep(500);
    await evalJS(`window.scrollTo(0, 0)`);
    console.log('  demo bar box (mobile):', await annotate());
    await sleep(300);
    await shot('示例条位置-手机.png');
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
  let demoReady = false;
  for (let i = 0; i < 50; i++) {
    demoReady = await evalJS(`!!document.querySelector('.demo-bar.on button')`);
    if (demoReady) break;
    await sleep(200);
  }
  if (!demoReady) bail('demo bar never appeared');
  await sleep(600);
  await click('.demo-bar.on button');
  await sleep(600);

  let open = await evalJS(`document.querySelector('.qs')?.classList.contains('on') === true`);
  if (!open) {
    await click('.demo-bar.on button');
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
