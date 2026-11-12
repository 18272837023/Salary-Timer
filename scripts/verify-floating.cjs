/**
 * Browser regression for the floating salary timer.
 *
 * Uses native Document PiP in headless Chrome to verify background updates,
 * shared settings, cleanup, and unsupported/denied requests.
 *
 * Usage:
 *   npm run build
 *   npx serve out -l 8850        # or any static server
 *   npm run test:floating -- http://127.0.0.1:8850
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
const PORT = 9576;
const proc = spawn(CHROME, ['--headless=new', '--disable-gpu', '--no-sandbox', '--remote-debugging-port=' + PORT,
  '--window-size=1400,1000', '--lang=en-US',
  '--user-data-dir=' + path.join(os.tmpdir(), 'salarytimer-floating-' + Date.now()), 'about:blank']);
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


  const evalJS = async (expression, userGesture = false) => {
    const r = await send('Runtime.evaluate', { expression, userGesture, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
    return r.result.value;
  };
  const waitFor = async (expression, label) => {
    for (let i = 0; i < 60; i++) {
      if (await evalJS(expression)) return;
      await sleep(150);
    }
    throw new Error('Timed out: ' + label);
  };
  const must = (name, ok, detail) => {
    check(name, ok, detail);
    console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ' (' + detail + ')' : ''}`);
    if (!ok) throw new Error(name);
  };
  const pip = `window.documentPictureInPicture.window`;
  const amountExpr = `${pip}.document.querySelector('.float-amount').textContent`;
  const number = (s) => Number(s.replace(/[^0-9.-]/g, ''));

  await send('Page.navigate', { url: BASE + '/zh/' });
  await waitFor(`document.readyState === 'complete' && !!document.querySelector('.floating-launch') && !!document.querySelector('.panel')`, 'first mount');
  must('fresh visitor is asked to set pay before floating', await evalJS(`document.querySelector('.floating-launch').disabled && document.querySelector('.floating-entry').textContent.includes('先设置薪资')`));
  must('full-row control is named desktop live earnings', await evalJS(`document.querySelector('.floating-launch').textContent.trim() === '桌面实时计薪'`));
  must('desktop control is between the main tools and monthly income', await evalJS(`document.querySelector('.grid-main').nextElementSibling.classList.contains('floating-entry') && !!document.querySelector('.floating-entry').nextElementSibling.querySelector('.monthly-income')`));
  must('monthly income is a collapsed single row by default', await evalJS(`!document.querySelector('.monthly-income').open && document.querySelector('.monthly-income').offsetHeight < 85`));
  must('native Document PiP is available in this test browser', await evalJS(`!!window.documentPictureInPicture`));
  await evalJS(`(() => {
    const now = new Date();
    const minutes = now.getHours() * 60 + now.getMinutes();
    const time = (n) => { n = (n + 1440) % 1440; return String(Math.floor(n / 60)).padStart(2,'0') + ':' + String(n % 60).padStart(2,'0'); };
    localStorage.setItem('salarytimer.site.v2', JSON.stringify({
      mode:'hourly', amountCents:360000, currency:'USD', start:time(minutes-60), end:time(minutes+60),
      days:[0,1,2,3,4,5,6], breaks:[], payday:15, overtime:false, otMult:1.5,
      privacy:false, extras:[], unpaidDays:0, onboarded:true, v:3
    }));
    sessionStorage.setItem('st.qs.skip','1');
    window.__beforeFloatReload = true;
  })()`);
  await send('Page.reload');
  await waitFor(`!window.__beforeFloatReload && document.readyState === 'complete' && document.querySelector('.floating-launch')?.disabled === false`, 'saved settings hydrated');
  must('the whole row is the launch button', await evalJS(`Math.abs(document.querySelector('.floating-launch').getBoundingClientRect().width - document.querySelector('.floating-entry').getBoundingClientRect().width) < 2`));
  must('desktop button matches the set-pay button styling', await evalJS(`(() => {const a=getComputedStyle(document.querySelector('.floating-launch'));const b=getComputedStyle(document.querySelector('.app-actions .btn-ink'));return ['backgroundColor','color','borderRadius','fontFamily','fontSize','boxShadow'].every(k=>a[k]===b[k])})()`));
  must('only the progress-card countdown remains', await evalJS(`!document.querySelector('.clockout-bar') && document.querySelectorAll('.ring-card .cd').length===1`));
  await evalJS(`document.querySelector('.floating-entry').scrollIntoView({block:'center',behavior:'instant'})`);
  const controls = await evalJS(`(() => {const r=document.querySelector('.floating-entry').getBoundingClientRect();const m=document.querySelector('.monthly-income').getBoundingClientRect();return {x:r.left+scrollX,y:r.top+scrollY,width:r.width,height:m.bottom-r.top+3}})()`);
  const controlsShot = await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,clip:{...controls,scale:1}});
  fsx.mkdirSync(path.join(__dirname,'..','outputs'),{recursive:true});
  fsx.writeFileSync(path.join(__dirname,'..','outputs','desktop-live-earnings-controls.png'),Buffer.from(controlsShot.data,'base64'));
  await evalJS(`document.querySelector('.floating-launch').click()`, true);
  await waitFor(`!!${pip}?.document.querySelector('.float-card')`, 'native PiP content');
  must('native window contains Chinese status, earnings and countdown', await evalJS(`${pip}.document.documentElement.lang === 'zh-CN' && ${pip}.document.body.textContent.includes('今日已赚') && !!${pip}.document.querySelector('.float-countdown b')`));
  must('main and floating amounts agree', Math.abs(number(await evalJS(amountExpr)) - number(await evalJS(`document.querySelector('.ticker').textContent`))) < 2);
  const first = await evalJS(amountExpr);
  const background = await send('Target.createTarget', { url:'about:blank' });
  await send('Target.activateTarget', { targetId:background.targetId });
  await waitFor(`document.visibilityState === 'hidden'`, 'opener actually backgrounded');
  await sleep(2400);
  const second = await evalJS(amountExpr);
  must('earnings keep increasing while the source tab is hidden', number(second) > number(first), `${first} → ${second}`);

  await evalJS(`${pip}.document.querySelector('.float-privacy').click()`, true);
  must('PiP privacy control persists and updates the main page', await evalJS(`JSON.parse(localStorage.getItem('salarytimer.site.v2')).privacy === true && document.querySelector('.ticker').classList.contains('blurred')`));
  must('private amount is visually blurred and hidden from accessibility output', await evalJS(`${pip}.document.querySelector('.float-amount').classList.contains('float-hidden') && ${pip}.document.querySelector('.float-amount span').getAttribute('aria-hidden') === 'true'`));
  await evalJS(`document.querySelector('.app-actions .btn-ghost').click()`, true);
  must('main privacy control updates PiP', await evalJS(`!${pip}.document.querySelector('.float-amount').classList.contains('float-hidden')`));

  await send('Target.activateTarget', { targetId:target.id });
  const all = await getJSON('/json/list');
  const pipTarget = all.find(t => t.id !== target.id && t.id !== background.targetId && t.type === 'page');
  console.log('PiP target:', pipTarget ? pipTarget.type : 'not exposed');
  if (pipTarget?.webSocketDebuggerUrl) {
    const ps = new WebSocket(pipTarget.webSocketDebuggerUrl, { perMessageDeflate:false });
    await new Promise((r,j) => {ps.once('open',r);ps.once('error',j)});
    let picId = 0;
    const picPending = new Map();
    ps.on('message', raw => {
      const r = JSON.parse(raw);
      const p = picPending.get(r.id);
      if (!p) return;
      picPending.delete(r.id);
      r.error ? p.reject(new Error(r.error.message)) : p.resolve(r.result);
    });
    const picSend = (method,params) => new Promise((resolve,reject) => {
      const id = ++picId;
      picPending.set(id,{resolve,reject});
      ps.send(JSON.stringify({id,method,params}));
    });
    // Headless Chrome may choose a larger native window. Check the requested
    // compact viewport independently, without claiming a fixed desktop position.
    await picSend('Emulation.setDeviceMetricsOverride',{width:340,height:260,deviceScaleFactor:1,mobile:false});
    const layout = await picSend('Runtime.evaluate',{expression:'({fits:document.documentElement.scrollWidth<=innerWidth && document.documentElement.scrollHeight<=innerHeight})',returnByValue:true});
    must('compact 340×260 view fits without clipping or scrolling', layout.result.value.fits);
    const screenshot = await picSend('Page.captureScreenshot',{format:'png'});
    fsx.mkdirSync(path.join(__dirname,'..','outputs'),{recursive:true});
    fsx.writeFileSync(path.join(__dirname,'..','outputs','floating-timer.png'),Buffer.from(screenshot.data,'base64'));
    ps.close();
  }
  await evalJS(`document.querySelector('.app-actions .btn-ink').click()`, true);
  await waitFor(`!!document.querySelector('.panel.on')`, 'settings open');
  await evalJS(`(() => {
    const el=document.querySelector('#currencyInput');
    Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'value').set.call(el,'JPY');
    el.dispatchEvent(new Event('change',{bubbles:true}));
  })()`);
  await sleep(150);
  await evalJS(`document.querySelector('.panel-foot .btn-mint').click()`, true);
  await waitFor(`${amountExpr}.startsWith('¥')`, 'currency synced to PiP');
  must('zero-decimal currency is respected in PiP', !(await evalJS(amountExpr)).includes('.'));
  await evalJS(`document.querySelector('.floating-launch').click()`, true);
  must('repeated launch focuses the existing window', await evalJS(`!!${pip}.document.querySelector('.float-card')`));
  await evalJS(`${pip}.document.querySelector('.float-return').click()`, true);
  await waitFor(`!${pip} && document.querySelector('.floating-launch').getAttribute('aria-pressed') === 'false'`, 'return closes PiP');
  must('return to webpage resets the launch button', true);
  await evalJS(`document.querySelector('.floating-launch').click()`, true);
  await waitFor(`!!${pip}?.document.querySelector('.float-card')`, 'reopen');
  await evalJS(`${pip}.close()`, true);
  await waitFor(`document.querySelector('.floating-launch').getAttribute('aria-pressed') === 'false'`, 'native close cleanup');
  must('native close allows reopening', true);
  await evalJS(`document.querySelector('.floating-launch').click()`, true);
  await waitFor(`!!${pip}?.document.querySelector('.float-card')`, 'reopen for navigation');
  await evalJS(`document.querySelector('a[href="/learn/"]').click()`, true);
  await waitFor(`location.pathname === '/learn/' && !${pip}`, 'route-unmount cleanup');
  must('leaving the calculator closes its PiP window', true);

  const unsupported = await send('Page.addScriptToEvaluateOnNewDocument', {source:`Object.defineProperty(window,'documentPictureInPicture',{value:undefined,configurable:true})`});
  await send('Page.navigate',{url:BASE+'/zh/'});
  await waitFor(`document.querySelector('.floating-entry')?.textContent.includes('此浏览器暂不支持')`, 'unsupported browser explanation');
  must('unsupported browser gets an explanation and disabled control', await evalJS(`document.querySelector('.floating-launch').disabled`));
  await send('Page.removeScriptToEvaluateOnNewDocument',{identifier:unsupported.identifier});
  await send('Page.reload');
  await waitFor(`document.querySelector('.floating-launch')?.disabled === false`, 'supported again');
  await evalJS(`Object.defineProperty(window.documentPictureInPicture,'requestWindow',{configurable:true,value:()=>Promise.reject(new DOMException('Disabled','NotAllowedError'))})`);
  await evalJS(`document.querySelector('.floating-launch').click()`, true);
  await waitFor(`!!document.querySelector('.floating-error')`, 'denied request message');
  must('a rejected request shows a recoverable error', await evalJS(`!document.querySelector('.floating-launch').disabled && !${pip}`));
  await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
  await sleep(200);
  must('entry fits a mobile viewport', await evalJS(`document.documentElement.scrollWidth <= innerWidth`));
  must('no browser runtime exceptions', !logs.some(l=>l.startsWith('EXC:')), logs.join('; '));
  console.log(`${results.length}/${results.length} floating timer checks passed`);
  ws.close();proc.kill();process.exit(0);
})().catch(error=>{console.error(error);proc.kill();process.exit(1)});
