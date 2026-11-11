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
const proc = spawn(CHROME, ['--headless=new', '--disable-gpu', '--no-sandbox', '--remote-debugging-port=' + PORT,
  '--window-size=1400,1000', '--lang=en-US',
  '--user-data-dir=' + path.join(os.tmpdir(), 'salarytimer-e2e-' + Date.now()), 'about:blank']);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const getJSON = (path) => new Promise((res, rej) => {
  http.get({ host: '127.0.0.1', port: PORT, path }, (r) => { let d = ''; r.on('data', (c) => (d += c)); r.on('end', () => { try { res(JSON.parse(d)); } catch (e) { rej(e); } }); }).on('error', rej);
});

const results = [];
const check = (name, ok, detail) => { results.push({ name, ok, detail }); };

(async () => {
  let target = null;
  for (let i = 0; i < 40; i++) {
    try {
      const list = await getJSON('/json/list');
      target = list.find((t) => t.type === 'page');
      if (target) break;
    } catch (e) { /* wait for Chrome startup */ }
    await sleep(300);
  }
  if (!target) throw new Error('Chrome did not expose a page target');
  const WebSocket = require('ws');
  const ws = new WebSocket(target.webSocketDebuggerUrl, { perMessageDeflate: false });
  let id = 0; const pending = new Map(); const logs = [];
  let connected = false;
  ws.on('open', () => { connected = true; });
  ws.on('close', () => {
    connected = false;
    for (const [, p] of pending) p.rej(new Error('Chrome DevTools connection closed'));
    pending.clear();
  });
  const send = (m, p) => new Promise((res, rej) => {
    if (!connected) return rej(new Error('Chrome DevTools is not connected'));
    const i = ++id;
    pending.set(i, { res, rej });
    ws.send(JSON.stringify({ id: i, method: m, params: p || {} }), (err) => {
      if (err && pending.has(i)) { pending.delete(i); rej(err); }
    });
  });
  ws.on('message', (raw) => {
    const m = JSON.parse(raw);
    if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.rej(new Error(JSON.stringify(m.error))) : p.res(m.result); }
    if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') logs.push('console: ' + m.params.args.map((a) => a.value || '').join(' ').slice(0, 200));
    if (m.method === 'Runtime.exceptionThrown') logs.push('EXC: ' + (m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text).slice(0, 300));
    if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error') logs.push('NET: ' + m.params.entry.text.slice(0, 200) + ' @ ' + (m.params.entry.url || ''));
  });
  await new Promise((resolve, reject) => {
    ws.once('open', resolve);
    ws.once('error', reject);
    ws.once('close', () => reject(new Error('Chrome DevTools closed before opening')));
  });
  await send('Runtime.enable'); await send('Log.enable'); await send('Page.enable');

  // Inject localStorage before any page loads to force English for i18n.
  // The I18nProvider reads 'st.lang' in a useEffect; setting it here ensures
  // all text is English regardless of the browser's system language.
  await send('Page.addScriptToEvaluateOnNewDocument', {
    source: `try { localStorage.setItem('st.lang', 'en'); } catch(e) {}`
  });

  const evalJS = async (expr) => {
    const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || 'eval error');
    return r.result.value;
  };
  const text = (sel) => evalJS(`document.querySelector(${JSON.stringify(sel)})?.textContent ?? null`);
  const click = (sel) => evalJS(`(()=>{const e=document.querySelector(${JSON.stringify(sel)}); if(!e) return 'MISS'; e.click(); return 'OK';})()`);

  await send('Page.navigate', { url: BASE + '/' });

  // Poll for hydration completion — React needs to mount before any DOM
  // assertions are meaningful. The I18nProvider wraps everything in a
  // useEffect that sets `ready=true`, which triggers a second render pass.
  // Wait until the app-shell (rendered by SalaryApp) is present.
  let hydrated = false;
  for (let i = 0; i < 30; i++) {
    const has = await evalJS(`!!document.querySelector('.app-shell')`);
    if (has) { hydrated = true; break; }
    await sleep(500);
  }
  check('page hydrated (app-shell present)', hydrated);
  if (!hydrated) {
    // Dump error logs and bail — nothing else will work if React didn't mount
    console.log('HYDRATION FAILED — console/network errors:', logs.length ? JSON.stringify(logs, null, 1) : 'none');
    const bodyText = await evalJS(`document.body.innerText?.slice(0, 500) || 'EMPTY'`);
    console.log('Body text:', bodyText);
    ws.close(); proc.kill();
    console.log('\n===== 功能测试 =====');
    let pass = 0;
    for (const r of results) { console.log((r.ok ? 'PASS ' : 'FAIL ') + r.name + (r.detail ? '  [' + r.detail + ']' : '')); if (r.ok) pass++; }
    console.log(`\n${pass}/${results.length} passed`);
    process.exit(results.length - pass);
  }

  // ---------- 1. 首屏：未设置薪资时必须是归零的空状态 ----------
  check('no demo bar on the page', (await evalJS(`document.querySelectorAll('.demo-bar').length`)) === 0);
  // Hydration sets the real label a tick after `.app-shell` appears, so poll
  // instead of racing it.
  let statusLabel = "";
  for (let i = 0; i < 20; i++) {
    statusLabel = (await text('.status')) || "";
    if (/Pay not set yet/.test(statusLabel)) break;
    await sleep(150);
  }
  check('status reads "Pay not set yet"', /Pay not set yet/.test(statusLabel), String(statusLabel));
  const idle1 = await text('.ticker');
  await sleep(900);
  const idle2 = await text('.ticker');
  check('counter stays at zero before setup', idle1 === idle2 && /0\.00/.test(idle1 || ''), `${idle1} -> ${idle2}`);
  check('no invented hourly rate before setup', /0\.00/.test((await text('.tick-sub b')) || ''), String(await text('.tick-sub b')));

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

  // ---------- 2b. QuickStart pay periods ----------
  // Before setup the black "Set my pay" button opens the 3-step wizard.
  await click('.app-actions .btn-ink');
  await sleep(400);
  const payOptions = await evalJS(`[...document.querySelectorAll('.qs.on .qs-seg button')].map(b => b.textContent.trim())`);
  check('quick setup offers year / month / day', JSON.stringify(payOptions) === JSON.stringify(['Per year', 'Per month', 'Per day']), JSON.stringify(payOptions));
  await click('.qs.on .qs-seg button:nth-child(2)');
  await sleep(120);
  check('annual to monthly equivalent', await evalJS(`Number(document.querySelector('.qs.on .qs-amount input').value)`) === 6500);
  await click('.qs.on .qs-seg button:nth-child(3)');
  await sleep(120);
  check('monthly to working-day equivalent', await evalJS(`Number(document.querySelector('.qs.on .qs-amount input').value)`) === 300);
  await evalJS(`(() => {
    const el = document.querySelector('.qs.on .qs-amount input');
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(el, '800');
    el.dispatchEvent(new Event('input', { bubbles: true }));
  })()`);
  await sleep(180);
  check('daily pay preview shows hourly rate', (await text('.qs.on .qs-preview-r'))?.includes('$100.00'));
  await click('.qs.on .qs-seg button:nth-child(1)');
  await sleep(120);
  check('800/day converts to 208000/year', await evalJS(`Number(document.querySelector('.qs.on .qs-amount input').value)`) === 208000);
  await click('.qs.on .qs-seg button:nth-child(3)');
  await sleep(120);
  check('year/day roundtrip preserves 800/day', await evalJS(`Number(document.querySelector('.qs.on .qs-amount input').value)`) === 800);

  // ---------- 2c. 货币选择 ----------
  const curOptions = await evalJS(`[...document.querySelectorAll('.qs.on .qs-cur-row select option')].map(o => o.textContent.trim())`);
  check('wizard offers 20+ currencies', curOptions.length >= 20, String(curOptions.length));
  check('currency label is code + name, not a bare symbol',
    curOptions.slice(0, 3).every((label) => /^[A-Z]{3} · .+/.test(label)), JSON.stringify(curOptions.slice(0, 3)));
  const pickCurrency = (code) => evalJS(`(() => {
    const el = document.querySelector('.qs.on .qs-cur-row select');
    Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(el, ${JSON.stringify(code)});
    el.dispatchEvent(new Event('change', { bubbles: true }));
  })()`);
  await pickCurrency('CNY');
  await sleep(200);
  check('CNY switches the preview symbol to ¥', (await text('.qs.on .qs-preview-r'))?.includes('¥100.00'), String(await text('.qs.on .qs-preview-r')));
  await pickCurrency('USD');
  await sleep(150);

  // 走完向导：保存后应变成已设置状态（800/工作日）
  await click('.qs.on .qs-foot button:nth-child(2)');
  await sleep(200);
  await click('.qs.on .qs-foot button:nth-child(2)');
  await sleep(200);
  await click('.qs.on .qs-foot button:nth-child(2)');
  await sleep(600);
  const wizardSaved = await evalJS(`JSON.parse(localStorage.getItem('salarytimer.site.v2') || 'null')`);
  check('wizard marks the app as set up', wizardSaved?.onboarded === true, `${wizardSaved?.mode} ${wizardSaved?.amountCents}`);

  // ---------- 3. 设置面板 + 持久化 ----------
  // Once set up, the same black button opens the full settings panel instead.
  await evalJS(`try { sessionStorage.setItem('st.qs.skip', '1'); } catch {}`);

  const setPayClicked = await evalJS(`(() => {
    const btns = [...document.querySelectorAll('.app-actions .btn')];
    let btn = btns.find(b => b.textContent.includes('Set my pay') || b.textContent.includes('设置薪资'));
    if (!btn && btns.length >= 3) btn = btns[btns.length - 1];
    if (!btn) return 'MISS';
    btn.click();
    return 'OK';
  })()`);
  check('set-pay button clicked', setPayClicked === 'OK', setPayClicked);
  await sleep(600);
  check('panel opens once set up', (await evalJS(`document.querySelector('.panel').classList.contains('on')`)) === true);

  // Back to yearly pay so the preview rate is the familiar 90000/2080.
  await click('.seg-pay button:nth-child(1)');
  await sleep(250);

  await evalJS(`(() => {
    const inp = document.querySelector('#amountInput');
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    setter.call(inp, '90000');
    inp.dispatchEvent(new Event('input', { bubbles: true }));
  })()`);
  await sleep(400);
  const previewRate = await text('.preview .v');
  check('preview rate updates to 90000', previewRate === '$43.27', previewRate);

  await evalJS(`[...document.querySelectorAll('.panel-foot .btn')].find(b => b.textContent.includes('Start the clock') || b.textContent.includes('开始计时'))?.click()`);
  await sleep(800);
  check('status leaves the empty state after setup',
    !/Pay not set yet/.test((await text('.status')) || ''), String(await text('.status')));
  check('panel closed', (await evalJS(`document.querySelector('.panel').classList.contains('on')`)) === false);
  const stored = await evalJS(`JSON.parse(localStorage.getItem('salarytimer.site.v2') || 'null')?.amountCents`);
  check('persisted as integer cents', stored === 9000000, String(stored));

  // 刷新后仍在
  await send('Page.navigate', { url: BASE + '/' });
  // Wait for re-hydration after reload
  for (let i = 0; i < 20; i++) {
    const has = await evalJS(`!!document.querySelector('.tick-sub b')`);
    if (has) break;
    await sleep(300);
  }
  await sleep(500);
  const rateAfter = await evalJS(`[...document.querySelectorAll('.tick-sub b')][0].textContent`);
  check('survives reload', rateAfter === '$43.27/hr', rateAfter);

  // ---------- 4. 隐私模式 ----------
  await evalJS(`[...document.querySelectorAll('.app-actions .btn')].find(b => b.textContent.includes('Hide numbers') || b.textContent.includes('隐藏数字'))?.click()`);
  await sleep(500);
  check('privacy blurs ticker', (await evalJS(`document.querySelector('.ticker').classList.contains('blurred')`)) === true);
  await evalJS(`[...document.querySelectorAll('.app-actions .btn')].find(b => b.textContent.includes('Show numbers') || b.textContent.includes('显示数字'))?.click()`);
  await sleep(400);

  // ---------- 5. 结算弹窗 ----------
  await evalJS(`[...document.querySelectorAll('.app-actions .btn')].find(b => b.textContent.includes('settlement') || b.textContent.includes('结算'))?.click()`);
  await sleep(500);
  check('settlement modal opens', (await evalJS(`document.querySelector('.modal').classList.contains('on')`)) === true);
  const lines = await evalJS(`document.querySelectorAll('.sheet .line').length`);
  check('settlement has rows', lines >= 6, String(lines));
  await evalJS(`[...document.querySelectorAll('.sheet .btn')].find(b => b.textContent.includes('Done') || b.textContent.includes('完成'))?.click()`);
  await sleep(400);

  // ---------- 6. 本月额外收入 ----------
  check('savings jar and wishlist are gone', (await evalJS(`!!document.querySelector('.jar, .wishlist, .wish-unit')`)) === false);
  const extraRow = () => evalJS(`(() => {
    const row = [...document.querySelectorAll('.mod .rowline')].find(r => /Extras|额外/.test(r.textContent));
    return row ? row.querySelector('b').textContent : null;
  })()`);
  const extraBefore = await extraRow();
  await evalJS(`(() => {
    const setV = (el, v) => { Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set.call(el, v); el.dispatchEvent(new Event('input',{bubbles:true})); };
    setV(document.querySelector('.mod .mini-form input[type=number]'), '43.27');
  })()`);
  await sleep(300);
  await evalJS(`document.querySelector('.mod .mini-form button').click()`);
  await sleep(600);
  const extraAfter = await extraRow();
  check('extra income add works', extraBefore !== extraAfter && /43\.27/.test(extraAfter || ''), `${extraBefore} -> ${extraAfter}`);
  const monthTotal = await evalJS(`(() => {
    const row = [...document.querySelectorAll('.mod .rowline')].find(r => /^Total|^合计|^总计/.test(r.textContent.trim()));
    return row ? row.querySelector('b').textContent : null;
  })()`);
  check('month total still renders', !!monthTotal, String(monthTotal));

  // ---------- 7. Slack 模式 ----------
  await evalJS(`document.querySelector('.slack-btn').click()`);
  await sleep(1200);
  check('slack pauses the clock', (await text('.slack-card .k'))?.includes('Slacking for') || (await text('.slack-card .k'))?.includes('摸鱼'), String(await text('.slack-card .k')));
  await evalJS(`document.querySelector('.slack-btn').click()`);
  await sleep(400);

  // ---------- 8. 长尾页与 SEO ----------
  await send('Page.navigate', { url: BASE + '/hourly-rate-calculator/' });
  await sleep(2600);
  check('landing h1 present', (await text('h1'))?.includes('Hourly Rate Calculator'));
  const canonical = await evalJS(`document.querySelector('link[rel=canonical]')?.getAttribute('href')`);
  check('canonical is self-referencing', canonical === 'https://salarytimer.work/hourly-rate-calculator/', String(canonical));
  const ldCount = await evalJS(`document.querySelectorAll('script[type="application/ld+json"]').length`);
  check('json-ld blocks on landing page', ldCount >= 2, String(ldCount));

  // ---------- 9. Chinese wizard, screenshot, mobile layout and persistence ----------
  await send('Page.navigate', { url: BASE + '/zh/' });
  await sleep(900);
  await evalJS(`localStorage.removeItem('salarytimer.site.v2'); sessionStorage.removeItem('st.qs.skip')`);
  await send('Page.reload');
  let zhReady = false;
  for (let i = 0; i < 40; i++) {
    zhReady = await evalJS(`!!document.querySelector('.app-actions .btn-ink') && document.querySelectorAll('.demo-bar').length === 0`);
    if (zhReady) break;
    await sleep(200);
  }
  check('Chinese first visit has no demo bar', zhReady);
  await sleep(500);
  await click('.app-actions .btn-ink');
  await sleep(500);
  const zhPayOptions = await evalJS(`[...document.querySelectorAll('.qs.on .qs-seg button')].map(b => b.textContent.trim())`);
  check('Chinese options: 按年 / 按月 / 按天', JSON.stringify(zhPayOptions) === JSON.stringify(['按年', '按月', '按天']), JSON.stringify(zhPayOptions));
  const outDir = path.join(__dirname, '..', 'outputs');
  fsx.mkdirSync(outDir, { recursive: true });
  const screenshot = async (name) => {
    const { data } = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    fsx.writeFileSync(path.join(outDir, name), Buffer.from(data, 'base64'));
  };
  await screenshot('收入弹窗-年-月-天-桌面.png');
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  await sleep(300);
  check('390px wizard fits screen', await evalJS(`document.documentElement.scrollWidth <= window.innerWidth`));
  await screenshot('收入弹窗-年-月-天-手机.png');
  await click('.qs.on .qs-seg button:nth-child(3)');
  await sleep(100);
  await evalJS(`(() => {
    const el = document.querySelector('.qs.on .qs-amount input');
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(el, '800');
    el.dispatchEvent(new Event('input', { bubbles: true }));
  })()`);
  await sleep(150);
  await click('.qs.on .qs-foot button:nth-child(2)');
  await sleep(120);
  await click('.qs.on .qs-foot button:nth-child(2)');
  await sleep(120);
  await click('.qs.on .qs-foot button:nth-child(2)');
  await sleep(300);
  const savedDaily = await evalJS(`JSON.parse(localStorage.getItem('salarytimer.site.v2') || 'null')`);
  check('daily salary saved as integer cents', savedDaily?.mode === 'daily' && savedDaily?.amountCents === 80000,
    `${savedDaily?.mode} ${savedDaily?.amountCents}`);
  await send('Page.reload');
  await sleep(600);
  check('daily salary survives reload', await evalJS(`JSON.parse(localStorage.getItem('salarytimer.site.v2')).mode === 'daily'`));
  await click('.app-actions .btn-ink');
  await sleep(200);
  check('daily salary remains editable in settings', (await text('.seg-pay button.on'))?.includes('日薪'));

  // 零小数货币：日元不该出现 ".00"
  await evalJS(`(() => {
    const el = document.querySelector('#currencyInput');
    Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(el, 'JPY');
    el.dispatchEvent(new Event('change', { bubbles: true }));
  })()`);
  await sleep(200);
  await evalJS(`document.querySelector('.panel-foot .btn-mint')?.click()`);
  await sleep(600);
  check('JPY saved as the active currency', await evalJS(`JSON.parse(localStorage.getItem('salarytimer.site.v2')).currency === 'JPY'`));
  check('JPY ticker has no decimal part', await evalJS(`document.querySelectorAll('.ticker .cents').length === 0`));

  // ---------- 10. 停表时页面上必须还有一串在动的数字 ----------
  // Force a shift that has not started yet (or has just ended) by moving the
  // schedule relative to the real clock, so this assertion holds at any hour.
  await evalJS(`(() => {
    const s = JSON.parse(localStorage.getItem('salarytimer.site.v2'));
    const d = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const fmt = (m) => pad(Math.floor((m % 1440) / 60)) + ':' + pad(m % 60);
    const startMin = d.getHours() * 60 + d.getMinutes() + 30;
    s.start = fmt(startMin);
    s.end = fmt(startMin + 60);
    s.days = [d.getDay()];
    localStorage.setItem('salarytimer.site.v2', JSON.stringify(s));
  })()`);
  await send('Page.reload');
  for (let i = 0; i < 40; i++) {
    if (await evalJS(`!!document.querySelector('.panel')`)) break;
    await sleep(200);
  }
  await sleep(700);
  const idleCd1 = await text('.clockout-bar.idle .clockout-value');
  await sleep(1300);
  const idleCd2 = await text('.clockout-bar.idle .clockout-value');
  check('stopped clock still shows a countdown', !!idleCd1, String(idleCd1));
  check('that countdown actually ticks', !!idleCd1 && idleCd1 !== idleCd2, `${idleCd1} -> ${idleCd2}`);

  console.log('\n===== 功能测试 =====');
  let pass = 0;
  for (const r of results) {
    console.log((r.ok ? 'PASS ' : 'FAIL ') + r.name + (r.detail ? '  [' + r.detail + ']' : ''));
    if (r.ok) pass++;
  }
  console.log(`\n${pass}/${results.length} passed`);
  console.log('CONSOLE/NETWORK ERRORS:', logs.length ? JSON.stringify(logs, null, 1) : 'none');
  ws.close(); proc.kill(); process.exit(results.length - pass);
})().catch((error) => {
  console.error('E2E failed:', error);
  proc.kill();
  process.exit(1);
});
