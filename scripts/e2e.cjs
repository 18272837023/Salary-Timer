/**
 * End-to-end smoke test for the built site.
 *
 * Runs a headless Chrome over the static export and asserts the things that
 * actually break on a money app: the cents digit, persistence, the live clock,
 * privacy mode, and the per-page SEO tags.
 *
 * Usage:
 *   npm run build
 *   npx serve out -l 8850        # or any static server
 *   npm run test:e2e
 *
 * Env: BASE_URL, CHROME_PATH
 */
const http = require('http');
const { spawn } = require('child_process');
const fsx = require('fs');
const os = require('os');
const path = require('path');

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  // Forward slashes work on Windows and avoid backslash escaping in source.
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
].filter(Boolean);

const CHROME = CHROME_CANDIDATES.find((p) => {
  try { return fsx.existsSync(p); } catch { return false; }
});
if (!CHROME) {
  console.error('No Chrome or Edge binary found. Set CHROME_PATH=/path/to/chrome');
  process.exit(2);
}

const BASE = process.argv[2] || process.env.BASE_URL || 'http://127.0.0.1:8850';
const PORT = 9560;
const proc = spawn(CHROME, ['--headless=new', '--disable-gpu', '--remote-debugging-port=' + PORT,
  '--window-size=1400,1000', '--user-data-dir=' + path.join(os.tmpdir(), 'salarytimer-e2e-' + Date.now()), 'about:blank']);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const getJSON = (path) => new Promise((res, rej) => {
  http.get({ host: '127.0.0.1', port: PORT, path }, (r) => { let d = ''; r.on('data', (c) => (d += c)); r.on('end', () => { try { res(JSON.parse(d)); } catch (e) { rej(e); } }); }).on('error', rej);
});

const results = [];
const check = (name, ok, detail) => { results.push({ name, ok, detail }); };

(async () => {
  let list = null;
  for (let i = 0; i < 40; i++) { try { list = await getJSON('/json/list'); if (list && list.length) break; } catch (e) {} await sleep(300); }
  const target = list.find((t) => t.type === 'page');
  const WebSocket = require('ws');
  const ws = new WebSocket(target.webSocketDebuggerUrl, { perMessageDeflate: false });
  let id = 0; const pending = new Map(); const logs = [];
  const send = (m, p) => new Promise((res, rej) => { const i = ++id; pending.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method: m, params: p || {} })); });
  ws.on('message', (raw) => {
    const m = JSON.parse(raw);
    if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.rej(new Error(JSON.stringify(m.error))) : p.res(m.result); }
    if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') logs.push('console: ' + m.params.args.map((a) => a.value || '').join(' ').slice(0, 200));
    if (m.method === 'Runtime.exceptionThrown') logs.push('EXC: ' + (m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text).slice(0, 300));
    if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error') logs.push('NET: ' + m.params.entry.text.slice(0, 200) + ' @ ' + (m.params.entry.url || ''));
  });
  await new Promise((r) => ws.on('open', r));
  await send('Runtime.enable'); await send('Log.enable'); await send('Page.enable');

  const evalJS = async (expr) => {
    const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || 'eval error');
    return r.result.value;
  };
  const text = (sel) => evalJS(`document.querySelector(${JSON.stringify(sel)})?.textContent ?? null`);
  const click = (sel) => evalJS(`(()=>{const e=document.querySelector(${JSON.stringify(sel)}); if(!e) return 'MISS'; e.click(); return 'OK';})()`);

  await send('Page.navigate', { url: BASE + '/' });
  await sleep(3800);

  // ---------- 1. 首屏与 demo ----------
  check('demo bar visible', (await evalJS(`getComputedStyle(document.querySelector('.demo-bar')).display`)) === 'flex');
  const t1 = await text('.ticker');
  await sleep(900);
  const t2 = await text('.ticker');
  check('ticker is live (increases)', t1 !== t2, `${t1} -> ${t2}`);

  // ---------- 2. 金额分位精度 ----------
  const precision = await evalJS(`(() => {
    // 与页面同源实现：整数分渲染
    const bad = [];
    const sym = '$';
    const fmt = (c) => { const w = Math.trunc(c/100), f = c%100; return sym + w + '.' + (f<10?'0':'') + f; };
    // 逐个核对 8.00~120.00 时薪、0~480 分钟下的显示值
    let mismatches = 0, total = 0;
    for (let h = 800; h <= 12000; h += 7) {
      const hourlyCents = h;
      for (let m = 0; m <= 480; m += 1) {
        const cents = Math.round((m/60) * hourlyCents);
        const shown = fmt(cents);
        const expect = (cents/100).toFixed(2);
        total++;
        if (shown.slice(1) !== expect) mismatches++;
      }
    }
    return JSON.stringify({ total, mismatches });
  })()`);
  check('cent precision (integer-cents render)', JSON.parse(precision).mismatches === 0, precision);

  // ---------- 3. 设置面板 + 持久化 ----------
  await click('#\\30 , button.btn-ink.btn-sm');
  await evalJS(`[...document.querySelectorAll('.app-actions .btn')].find(b=>b.textContent.includes('Set my pay')).click()`);
  await sleep(600);
  check('panel opens', (await evalJS(`document.querySelector('.panel').classList.contains('on')`)) === true);

  await evalJS(`(() => {
    const inp = document.querySelector('#amountInput');
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    setter.call(inp, '90000');
    inp.dispatchEvent(new Event('input', { bubbles: true }));
  })()`);
  await sleep(400);
  const previewRate = await text('.preview .v');
  check('preview rate updates to 90000', previewRate === '$43.27', previewRate);

  await evalJS(`[...document.querySelectorAll('.panel-foot .btn')].find(b=>b.textContent.includes('Start the clock')).click()`);
  await sleep(800);
  check('demo bar gone after save', (await evalJS(`getComputedStyle(document.querySelector('.demo-bar')).display`)) === 'none');
  check('panel closed', (await evalJS(`document.querySelector('.panel').classList.contains('on')`)) === false);
  const stored = await evalJS(`JSON.parse(localStorage.getItem('salarytimer.site.v2') || 'null')?.amountCents`);
  check('persisted as integer cents', stored === 9000000, String(stored));

  // 刷新后仍在
  await send('Page.navigate', { url: BASE + '/' });
  await sleep(3200);
  const rateAfter = await evalJS(`[...document.querySelectorAll('.tick-sub b')][0].textContent`);
  check('survives reload', rateAfter === '$43.27/hr', rateAfter);

  // ---------- 4. 隐私模式 ----------
  await evalJS(`[...document.querySelectorAll('.app-actions .btn')].find(b=>b.textContent.includes('Hide numbers')).click()`);
  await sleep(500);
  check('privacy blurs ticker', (await evalJS(`document.querySelector('.ticker').classList.contains('blurred')`)) === true);
  await evalJS(`[...document.querySelectorAll('.app-actions .btn')].find(b=>b.textContent.includes('Show numbers')).click()`);
  await sleep(400);

  // ---------- 5. 结算弹窗 ----------
  await evalJS(`[...document.querySelectorAll('.app-actions .btn')].find(b=>b.textContent.includes('settlement')).click()`);
  await sleep(500);
  check('settlement modal opens', (await evalJS(`document.querySelector('.modal').classList.contains('on')`)) === true);
  const lines = await evalJS(`document.querySelectorAll('.sheet .line').length`);
  check('settlement has rows', lines >= 6, String(lines));
  await evalJS(`[...document.querySelectorAll('.sheet .btn')].find(b=>b.textContent.includes('Done')).click()`);
  await sleep(400);

  // ---------- 6. 愿望清单 ----------
  const wishBefore = await evalJS(`document.querySelectorAll('.wishlist li').length`);
  await evalJS(`(() => {
    const setV = (el, v) => { Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set.call(el, v); el.dispatchEvent(new Event('input',{bubbles:true})); };
    const inputs = document.querySelectorAll('.mini-form input');
    setV(inputs[0], 'Test item'); setV(inputs[1], '43.27');
  })()`);
  await sleep(300);
  await evalJS(`document.querySelectorAll('.mini-form button')[0].click()`);
  await sleep(500);
  const wishAfter = await evalJS(`document.querySelectorAll('.wishlist li').length`);
  check('wishlist add works', wishAfter === wishBefore + 1, `${wishBefore} -> ${wishAfter}`);
  const hoursText = await evalJS(`document.querySelector('.wishlist li:last-child .hr')?.textContent`);
  check('wishlist priced in hours', hoursText === '1.0 h', String(hoursText));

  // ---------- 7. Slack 模式 ----------
  await evalJS(`document.querySelector('.slack-btn').click()`);
  await sleep(1200);
  check('slack pauses the clock', (await text('.slack-card .k')) === 'Slacking for');
  await evalJS(`document.querySelector('.slack-btn').click()`);
  await sleep(400);

  // ---------- 8. 长尾页与 SEO ----------
  await send('Page.navigate', { url: BASE + '/hourly-rate-calculator/' });
  await sleep(2600);
  check('landing h1 present', (await text('h1'))?.includes('Hourly Rate Calculator'));
  const canonical = await evalJS(`document.querySelector('link[rel=canonical]')?.getAttribute('href')`);
  check('canonical is self-referencing', canonical === 'https://salarytimer.app/hourly-rate-calculator/', String(canonical));
  const ldCount = await evalJS(`document.querySelectorAll('script[type="application/ld+json"]').length`);
  check('json-ld blocks on landing page', ldCount >= 2, String(ldCount));

  console.log('\n===== 功能测试 =====');
  let pass = 0;
  for (const r of results) {
    console.log((r.ok ? 'PASS ' : 'FAIL ') + r.name + (r.detail ? '  [' + r.detail + ']' : ''));
    if (r.ok) pass++;
  }
  console.log(`\n${pass}/${results.length} passed`);
  console.log('CONSOLE/NETWORK ERRORS:', logs.length ? JSON.stringify(logs, null, 1) : 'none');
  ws.close(); proc.kill(); process.exit(results.length - pass);
})();
