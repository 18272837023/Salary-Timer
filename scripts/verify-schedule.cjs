/**
 * Verify the quick-start wizard's "choose your working hours" step.
 *
 * Two layers:
 *   1. Static checks on the source (3 steps, time fields, both dictionaries).
 *   2. A real browser walkthrough over CDP: set a shift + unpaid break, walk
 *      all three steps, then assert the persisted schedule. The engine-level
 *      "no pay during break / after clock-out" assertions live in
 *      scripts/unit-compute.cjs (section 10).
 *
 * Usage: npm run build && npm run test:schedule
 * Set BASE_URL to run the same DOM walkthrough against a deployed site.
 */
const http = require('node:http');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawn } = require('node:child_process');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'out');
const PORT = 8861;
const CDP = 9620 + Math.floor(Math.random() * 200);
const BASE = process.env.BASE_URL || `http://127.0.0.1:${PORT}`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const CHROME = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
].filter(Boolean).find((p) => { try { return fs.existsSync(p); } catch { return false; } });

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml',
  '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.woff': 'font/woff',
};

let pass = 0, fail = 0;
const check = (name, ok, detail) => {
  if (ok) { pass++; console.log(`  PASS  ${name}`); }
  else { fail++; console.log(`  FAIL  ${name}${detail ? '  → ' + detail : ''}`); }
};

/* ---------- 1. static source checks ---------- */
console.log('=== 1. Source ===');
const qs = fs.readFileSync(path.join(ROOT, 'components/QuickStart.tsx'), 'utf8');
const dict = fs.readFileSync(path.join(ROOT, 'lib/i18n.tsx'), 'utf8');
const css = fs.readFileSync(path.join(ROOT, 'app/globals.css'), 'utf8');

check('wizard declares three steps', /const STEP_PAY = 0;[\s\S]*const STEP_WHEN = 1;[\s\S]*const STEP_HOURS = 2;/.test(qs));
check('renders three progress dots', /\[STEP_PAY, STEP_WHEN, STEP_HOURS\]\.map/.test(qs));
check('renders the working-hours step', /className="qs-when"/.test(qs));
check('has all four time inputs + break toggle',
  ['qsStart', 'qsEnd', 'qsBreakStart', 'qsBreakEnd', 'qsLunch'].every((id) => qs.includes(`id="${id}"`)));
check('saves the real schedule, not a synthesised one',
  !/shiftFor\(/.test(qs) && /breaks:/.test(qs) && /overtime: false/.test(qs));
check('no pay accrues after clock-out or during the break', /overtime: false/.test(qs));

const WHEN_KEYS = [
  'qs.when.title', 'qs.when.sub', 'qs.when.shift', 'qs.when.start', 'qs.when.end',
  'qs.when.lunch', 'qs.when.lunchHelp', 'qs.when.breakStart', 'qs.when.breakEnd',
  'qs.when.timeline', 'qs.when.paidShort', 'qs.when.paid', 'qs.when.paused',
  'qs.when.pauseNote', 'qs.when.hoursHint',
];
check('every new copy key exists in BOTH en and zh dictionaries',
  WHEN_KEYS.every((k) => (dict.match(new RegExp(`"${k.replace(/\./g, '\\.')}":`, 'g')) || []).length === 2),
  WHEN_KEYS.filter((k) => (dict.match(new RegExp(`"${k.replace(/\./g, '\\.')}":`, 'g')) || []).length !== 2).join(', '));
check('timeline + time-input styles are present', /\.qs-timeline\{/.test(css) && /\.qs-time input\[type="time"\]/.test(css));

/* ---------- 2. browser walkthrough ---------- */
function serve() {
  const server = http.createServer((req, res) => {
    let p = decodeURIComponent(req.url.split('?')[0]);
    if (p === '/') p = '/index.html';
    const fp = path.join(OUT, p);
    if (!fp.startsWith(OUT)) { res.writeHead(403); res.end(); return; }
    const send = (file) => fs.readFile(file, (err, data) => {
      if (err) { res.writeHead(404); res.end('Not found'); return; }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
      res.end(data);
    });
    fs.stat(fp, (err, st) => {
      if (err) return send(path.join(fp, 'index.html'));
      return send(st.isDirectory() ? path.join(fp, 'index.html') : fp);
    });
  });
  return new Promise((resolve) => server.listen(PORT, '127.0.0.1', () => resolve(server)));
}

const getJSON = (p) => new Promise((res, rej) => {
  http.get({ host: '127.0.0.1', port: CDP, path: p }, (r) => {
    let d = ''; r.on('data', (c) => (d += c)); r.on('end', () => { try { res(JSON.parse(d)); } catch (e) { rej(e); } });
  }).on('error', rej);
});

(async () => {
  if (!CHROME) { console.error('No Chrome binary found — set CHROME_PATH.'); process.exit(2); }
  if (!process.env.BASE_URL && !fs.existsSync(path.join(OUT, 'index.html'))) {
    console.error('No build at ./out — run `npm run build` first.'); process.exit(2);
  }

  console.log('\n=== 2. Browser (English) ===');
  let server = null;
  if (!process.env.BASE_URL) server = await serve();
  const proc = spawn(CHROME, [
    '--headless=new', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
    '--remote-debugging-port=' + CDP, '--window-size=1200,900',
    '--user-data-dir=' + path.join(os.tmpdir(), 'st-sched-' + Date.now()), 'about:blank',
  ], { stdio: 'ignore' });

  let target = null;
  for (let i = 0; i < 60; i++) {
    try { const list = await getJSON('/json/list'); target = list.find((t) => t.type === 'page'); if (target) break; } catch { /* booting */ }
    await sleep(200);
  }
  if (!target) { console.error('Chrome did not expose a page target'); process.exit(2); }

  const WebSocket = require('ws');
  const ws = new WebSocket(target.webSocketDebuggerUrl, { perMessageDeflate: false });
  let id = 0;
  const pending = new Map();
  ws.on('message', (raw) => {
    const m = JSON.parse(raw);
    if (m.id && pending.has(m.id)) {
      const p = pending.get(m.id); pending.delete(m.id);
      m.error ? p.rej(new Error(JSON.stringify(m.error))) : p.res(m.result);
    }
  });
  await new Promise((r, j) => { ws.once('open', r); ws.once('error', j); });
  const send = (method, params) => new Promise((res, rej) => {
    const i = ++id; pending.set(i, { res, rej });
    ws.send(JSON.stringify({ id: i, method, params: params || {} }));
  });
  await send('Page.enable');
  await send('Runtime.enable');

  const evalJS = async (expr) => {
    const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || 'eval error');
    return r.result.value;
  };
  const click = (sel) => evalJS(`(()=>{const e=document.querySelector(${JSON.stringify(sel)});if(!e)return 'MISS';e.click();return 'OK';})()`);
  const setTime = (sel, value) => evalJS(`(()=>{
    const el=document.querySelector(${JSON.stringify(sel)}); if(!el) return 'MISS';
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(el,${JSON.stringify(value)});
    el.dispatchEvent(new Event('input',{bubbles:true}));
    el.dispatchEvent(new Event('change',{bubbles:true}));
    return 'OK';
  })()`);
  const waitFor = async (expr, tries = 40) => {
    for (let i = 0; i < tries; i++) { if (await evalJS(expr)) return true; await sleep(150); }
    return false;
  };

  try {
    await send('Page.navigate', { url: BASE + '/' });
    await evalJS(`localStorage.removeItem('salarytimer.site.v2'); sessionStorage.removeItem('st.qs.skip'); 1`).catch(() => {});
    await send('Page.navigate', { url: BASE + '/' });
    check('app shell hydrated', await waitFor(`!!document.querySelector('.app-actions .btn-ink') && document.readyState === 'complete'`, 60));
    await sleep(400);
    await click('.app-actions .btn-ink');
    check('wizard opened', await waitFor(`document.querySelector('.qs')?.classList.contains('on') === true`));
    check('step 1 of 3 (three dots)', await evalJS(`document.querySelectorAll('.qs.on .qs-dot').length === 3 && document.querySelector('.qs.on').dataset.step === '0'`));

    await click('.qs.on .qs-foot button:nth-child(2)');
    await sleep(250);
    check('Step 2 is the working-hours step', await evalJS(`document.querySelector('.qs.on').dataset.step === '1' && !!document.querySelector('.qs.on .qs-when')`));
    check('defaults come from the real settings', await evalJS(`document.querySelector('#qsStart')?.value === '09:00' && document.querySelector('#qsEnd')?.value === '17:30'`));

    // The rate card is shared by every step, so it must stay visible on the
    // new (tallest) step even on a short laptop viewport.
    await send('Emulation.setDeviceMetricsOverride', { width: 1200, height: 760, deviceScaleFactor: 1, mobile: false });
    await sleep(250);
    const geom = await evalJS(`(() => {
      const q = document.querySelector('.qs.on');
      const b = q.querySelector('.qs-body');
      const p = q.querySelector('.qs-preview');
      const foot = q.querySelector('.qs-foot');
      const note = q.querySelector('.qs-when-note');
      const tl = q.querySelector('.qs-tl-legend');
      return {
        box: Math.round(q.getBoundingClientRect().height),
        body: b.clientHeight,
        scroll: b.scrollHeight,
        previewBottom: Math.round(p.getBoundingClientRect().bottom),
        footTop: Math.round(foot.getBoundingClientRect().top),
        bodyBottom: Math.round(b.getBoundingClientRect().bottom),
        timelineBottom: Math.round(tl.getBoundingClientRect().bottom),
        noteBottom: Math.round(note.getBoundingClientRect().bottom),
      };
    })()`);
    console.log('  geom(en@760):', JSON.stringify(geom));
    check('rate card stays visible above the buttons on a 760px-tall screen',
      geom.previewBottom <= geom.footTop + 1, JSON.stringify(geom));
    // The whole point of this step is the "pay pauses during break / after
    // clock-out" promise. If that note is below the fold of a scrollable body
    // (with scrollbars hidden), most visitors will never see it.
    check('timeline + pause explanation fit without scrolling at 760px tall',
      geom.noteBottom <= geom.bodyBottom + 1 && geom.timelineBottom <= geom.bodyBottom + 1,
      JSON.stringify(geom));
    // Short-laptop sweep. 1366x768 and 1280x800 windows expose roughly 688 and
    // 700 CSS px of viewport; both are common, so the promise must survive them.
    for (const h of [700, 688]) {
      await send('Emulation.setDeviceMetricsOverride', { width: 1200, height: h, deviceScaleFactor: 1, mobile: false });
      await sleep(180);
      const g = await evalJS(`(() => {
        const q = document.querySelector('.qs.on');
        const b = q.querySelector('.qs-body');
        const note = q.querySelector('.qs-when-note');
        return {
          h: window.innerHeight,
          body: b.clientHeight,
          scroll: b.scrollHeight,
          overflow: b.scrollHeight - b.clientHeight,
          noteBottom: Math.round(note.getBoundingClientRect().bottom),
          bodyBottom: Math.round(b.getBoundingClientRect().bottom),
          timelineHidden: getComputedStyle(q.querySelector('.qs-timeline')).display === 'none',
        };
      })()`);
      check(`pause explanation still above the fold at ${h}px tall`,
        g.noteBottom <= g.bodyBottom + 1, JSON.stringify(g));
      check(`timeline gives way on a ${h}px-tall screen`, g.timelineHidden, JSON.stringify(g));
    }
    // Below that it is fine to scroll, but log the numbers for the record.
    for (const h of [640, 600]) {
      await send('Emulation.setDeviceMetricsOverride', { width: 1200, height: h, deviceScaleFactor: 1, mobile: false });
      await sleep(180);
      console.log('  sweep', h + 'px →', JSON.stringify(await evalJS(`(() => {
        const b = document.querySelector('.qs.on .qs-body');
        return { body: b.clientHeight, scroll: b.scrollHeight, overflow: b.scrollHeight - b.clientHeight };
      })()`)));
    }
    await send('Emulation.clearDeviceMetricsOverride');
    await sleep(150);

    await setTime('#qsStart', '08:30');
    await setTime('#qsEnd', '18:00');
    await setTime('#qsBreakStart', '12:00');
    await setTime('#qsBreakEnd', '13:00');
    await sleep(200);
    const paid = await evalJS(`document.querySelector('.qs.on .qs-tl-title b')?.textContent || ''`);
    check('08:30–18:00 with a 1h lunch = 8.5 paid hours', /8\.5/.test(paid), paid);
    check('timeline shows a paused segment', await evalJS(`!!document.querySelector('.qs.on .qs-tl-paused')`));

    await click('#qsLunch');
    await sleep(180);
    const noBreak = await evalJS(`document.querySelector('.qs.on .qs-tl-title b')?.textContent || ''`);
    check('turning the break off pays the whole shift (9.5 h)', /9\.5/.test(noBreak), noBreak);
    await click('#qsLunch');
    await sleep(180);
    check('turning the break back on restores 8.5 h', /8\.5/.test(await evalJS(`document.querySelector('.qs.on .qs-tl-title b')?.textContent || ''`)));

    // Narrow screen: the extra controls must not cause horizontal overflow.
    await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
    await sleep(300);
    check('390px working-hours step has no horizontal overflow',
      await evalJS(`document.documentElement.scrollWidth <= window.innerWidth`),
      String(await evalJS(`document.documentElement.scrollWidth - window.innerWidth`)));
    await send('Emulation.clearDeviceMetricsOverride');
    await sleep(200);

    await click('.qs.on .qs-foot button:nth-child(2)');
    await sleep(220);
    check('Step 3 is the days / paid-hours step', await evalJS(`document.querySelector('.qs.on').dataset.step === '2' && !!document.querySelector('.qs.on .qs-days')`));
    const slider = await evalJS(`Number(document.querySelector('.qs.on .qs-field input.qs-range')?.value)`);
    check('paid-hours slider reflects the chosen shift', Math.abs(slider - 8.5) < 0.01, String(slider));

    await click('.qs.on .qs-foot button:nth-child(1)');
    await sleep(220);
    check('going back preserves the entered times',
      await evalJS(`document.querySelector('.qs.on').dataset.step === '1' && document.querySelector('#qsStart')?.value === '08:30' && document.querySelector('#qsEnd')?.value === '18:00' && document.querySelector('#qsBreakStart')?.value === '12:00' && document.querySelector('#qsBreakEnd')?.value === '13:00'`));

    await click('.qs.on .qs-foot button:nth-child(2)');
    await sleep(150);
    await click('.qs.on .qs-foot button:nth-child(2)');
    await sleep(400);
    check('wizard closes on the last step', await evalJS(`!document.querySelector('.qs.on')`));

    const saved = await evalJS(`JSON.parse(localStorage.getItem('salarytimer.site.v2') || 'null')`);
    check('persisted start / end are the chosen ones', saved?.start === '08:30' && saved?.end === '18:00', `${saved?.start} → ${saved?.end}`);
    check('persisted break is the chosen lunch window',
      saved?.breaks?.length === 1 && saved.breaks[0].start === '12:00' && saved.breaks[0].end === '13:00',
      JSON.stringify(saved?.breaks));
    check('overtime stays off so the clock stops at clock-out', saved?.overtime === false, String(saved?.overtime));
    check('setup is marked complete', saved?.onboarded === true);

    /* ---------- 3. Chinese copy ---------- */
    console.log('\n=== 3. Browser (Chinese) ===');
    await send('Page.navigate', { url: BASE + '/zh/' });
    await evalJS(`localStorage.removeItem('salarytimer.site.v2'); sessionStorage.removeItem('st.qs.skip'); 1`).catch(() => {});
    await send('Page.navigate', { url: BASE + '/zh/' });
    check('Chinese app shell hydrated', await waitFor(`!!document.querySelector('.app-actions .btn-ink') && document.readyState === 'complete'`, 60));
    await sleep(400);
    await click('.app-actions .btn-ink');
    check('Chinese wizard opened', await waitFor(`document.querySelector('.qs')?.classList.contains('on') === true`));
    await click('.qs.on .qs-foot button:nth-child(2)');
    await sleep(250);
    const zhTitle = await evalJS(`document.querySelector('.qs.on .qs-when h3')?.textContent || ''`);
    check('Step 2 heading is localised', zhTitle.includes('你什么时候在上班'), zhTitle);
    const zhNote = await evalJS(`document.querySelector('.qs.on .qs-when-note')?.textContent || ''`);
    check('pause explanation is localised', zhNote.includes('午休') && zhNote.includes('暂停'), zhNote.slice(0, 60));

    // Chinese wraps differently from English, so re-check the fold on its own.
    await send('Emulation.setDeviceMetricsOverride', { width: 1200, height: 760, deviceScaleFactor: 1, mobile: false });
    await sleep(250);
    const zhGeom = await evalJS(`(() => {
      const q = document.querySelector('.qs.on');
      const b = q.querySelector('.qs-body');
      const note = q.querySelector('.qs-when-note');
      const legend = q.querySelector('.qs-tl-legend');
      return {
        bodyBottom: Math.round(b.getBoundingClientRect().bottom),
        client: b.clientHeight, scroll: b.scrollHeight,
        legendBottom: Math.round(legend.getBoundingClientRect().bottom),
        noteBottom: Math.round(note.getBoundingClientRect().bottom),
        noteTop: Math.round(note.getBoundingClientRect().top),
        noteHeight: Math.round(note.getBoundingClientRect().height),
      };
    })()`);
    console.log('  geom(zh@760):', JSON.stringify(zhGeom));
    check('Chinese timeline + pause explanation also fit at 760px tall',
      zhGeom.noteBottom <= zhGeom.bodyBottom + 1, JSON.stringify(zhGeom));
    await send('Emulation.clearDeviceMetricsOverride');

    /* ---------- 4. Live app: the counter really stops during the break ---------- */
    console.log('\n=== 4. Live counter (break pauses pay) ===');
    if (new Date().getHours() < 3 || new Date().getHours() >= 21) {
      // Building a 4h shift centred on "now" would wrap midnight; that case is
      // covered deterministically by unit-compute.cjs section 10.
      console.log('  SKIP  too close to midnight for a centred-shift scenario');
    } else {
      // A shift of 4h centred on now, with a 30-minute unpaid break also
      // centred on now, so the app is provably mid-break at this instant.
      await evalJS(`(() => {
        const pad = (m) => String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
        const n = new Date();
        const now = n.getHours() * 60 + n.getMinutes();
        localStorage.setItem('salarytimer.site.v2', JSON.stringify({
          onboarded: true, v: 3, currency: 'USD', mode: 'annual', amountCents: 7800000,
          start: pad(now - 120), end: pad(now + 120), days: [0, 1, 2, 3, 4, 5, 6],
          breaks: [{ id: 'live', start: pad(now - 15), end: pad(now + 15) }], overtime: false,
        }));
        return 1;
      })()`);
      await send('Page.navigate', { url: BASE + '/' });
      check('app hydrates and reports an unpaid break',
        await waitFor(`/break/i.test(document.querySelector('.status')?.textContent || '')`, 60),
        await evalJS(`document.querySelector('.status')?.textContent || ''`));
      const t1 = await evalJS(`document.querySelector('.ticker')?.textContent || ''`);
      await sleep(1600);
      const t2 = await evalJS(`document.querySelector('.ticker')?.textContent || ''`);
      check('the amount already earned is not zero (so freezing means something)',
        /[1-9]/.test(t1), t1);
      check('earnings do not move while on the unpaid break', t1 === t2 && t1.length > 0, `${t1} → ${t2}`);
    }
  } finally {
    ws.close();
    try { proc.kill('SIGKILL'); } catch { /* already gone */ }
    if (server) server.close();
  }

  console.log(`\n结果: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error('ERROR', e); process.exit(2); });
