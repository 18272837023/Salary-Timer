/**
 * Browser regression for GA4 initialization, product events and SPA page views.
 * Google collection endpoints are blocked so synthetic interactions stay local.
 * 用法: node scripts/verify-ga.cjs
 */
const http = require("http");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawn } = require("child_process");

const ROOT = path.join(__dirname, "..", "out");
const PORT = 8851;
const CDP = 9571;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webmanifest": "application/manifest+json",
  ".woff2": "font/woff2",
  ".xml": "application/xml",
  ".txt": "text/plain",
};

const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]);
  if (p.endsWith("/")) p += "index.html";
  let file = path.join(ROOT, p);
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    file = path.join(ROOT, p, "index.html");
  }
  if (!fs.existsSync(file)) {
    res.writeHead(404).end("not found");
    return;
  }
  res.writeHead(200, { "content-type": MIME[path.extname(file)] || "application/octet-stream" });
  fs.createReadStream(file).pipe(res);
});

const CHROME = [
  process.env.CHROME_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
].filter(Boolean).find((p) => { try { return fs.existsSync(p); } catch { return false; } });

if (!CHROME) { console.error("找不到 Chrome/Edge，请设置 CHROME_PATH"); process.exit(2); }

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const getJSON = (p) => new Promise((res, rej) => {
  http.get({ host: "127.0.0.1", port: CDP, path: p }, (r) => {
    let d = ""; r.on("data", (c) => (d += c)); r.on("end", () => { try { res(JSON.parse(d)); } catch (e) { rej(e); } });
  }).on("error", rej);
});

(async () => {
  // BASE_URL 指向线上站点时跳过本地静态服务器，直接验证真实部署。
  const REMOTE = process.env.BASE_URL || null;
  const base = REMOTE || `http://127.0.0.1:${PORT}`;
  if (!REMOTE) await new Promise((r) => server.listen(PORT, r));
  const chrome = spawn(CHROME, [
    "--headless=new", "--disable-gpu", `--remote-debugging-port=${CDP}`,
    "--window-size=1400,1000",
    `--user-data-dir=${path.join(os.tmpdir(), "ga-verify-" + Date.now())}`,
    "about:blank",
  ], {windowsHide: true});

  let list = null;
  for (let i = 0; i < 40; i++) { try { list = await getJSON("/json/list"); if (list && list.length) break; } catch {} await sleep(300); }
  if (!list?.some(t => t.type === "page")) {
    chrome.kill(); server.close();
    throw new Error("Chrome DevTools did not start. Check browser execution permissions.");
  }
  const target = list.find((t) => t.type === "page");
  const WebSocket = require("ws");
  const ws = new WebSocket(target.webSocketDebuggerUrl, { perMessageDeflate: false });
  let id = 0; const pending = new Map();
  const send = (m, p) => new Promise((res, rej) => { const i = ++id; pending.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method: m, params: p || {} })); });
  ws.on("message", (raw) => {
    const m = JSON.parse(raw);
    if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.rej(new Error(JSON.stringify(m.error))) : p.res(m.result); }
  });
  await new Promise((r) => ws.on("open", r));
  await send("Runtime.enable");
  await send("Page.enable");

  const evalJS = async (expr) => {
    const r = await send("Runtime.evaluate", { expression: expr, userGesture: true, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || "eval error");
    return r.result.value;
  };

  await send("Network.enable");
  await send("Network.setBlockedURLs", { urls: ["*googletagmanager.com/*", "*google-analytics.com/*"] });
  await send("Page.navigate", { url: base + "/" });
  await send("Page.bringToFront");
  await sleep(3000);

  const report = await evalJS(`(() => {
    const s = document.querySelector('script[src*="googletagmanager"]');
    const cmds = (window.dataLayer || []).map((a) => Array.from(a)[0] + ":" + JSON.stringify(Array.from(a).slice(1)));
    return JSON.stringify({
      gtagType: typeof window.gtag,
      dataLayerLen: (window.dataLayer || []).length,
      cmds,
      scriptEl: s ? s.src : null,
    });
  })()`);

  const r = JSON.parse(report);
  const hasConfig = r.cmds.some((c) => c.includes("G-8T8JLTRSX9"));
  const hasJs = r.cmds.some((c) => c.startsWith("js:"));

  const rows = [
    ["window.gtag 是函数", r.gtagType === "function"],
    ["dataLayer 已建立", r.dataLayerLen > 0],
    ["已发送 gtag('js', ...)", hasJs],
    ["已发送 gtag('config', 'G-8T8JLTRSX9')", hasConfig],
    ["gtag.js <script> 已注入 DOM", Boolean(r.scriptEl)],
  ];
  let bad = 0;
  for (const [name, ok] of rows) { if (!ok) bad++; console.log(`  ${ok ? "PASS" : "FAIL"}  ${name}`); }
  console.log(`\n  dataLayer 内容: ${r.cmds.join(" | ")}`);
  console.log(`  script src: ${r.scriptEl}`);

  const check = (label, ok) => {
    if (!ok) bad++;
    console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}`);
  };
  const events = () => evalJS(`(window.dataLayer || []).map(a => Array.from(a)).filter(a => a[0] === 'event').map(a => ({name: a[1], params: a[2] || {}}))`);
  const hasEvent = async (name, params = {}) => (await events()).some(event =>
    event.name === name && Object.entries(params).every(([key, value]) => event.params[key] === value));
  const setInput = async (selector, value) => {
    await evalJS(`(() => {
      const input = document.querySelector(${JSON.stringify(selector)});
      input.focus();
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, ${JSON.stringify(value)});
      input.dispatchEvent(new Event('input', {bubbles: true}));
      input.dispatchEvent(new Event('change', {bubbles: true}));
    })()`);
    await sleep(100);
  };

  check("Initial setup view is recorded once", (await events()).filter(e => e.name === "setup_view").length === 1);
  await setInput('.start-amount input', '987654.32');
  await setInput('.start-amount input', '987654.33');
  check("Setup start is deduplicated across field interactions", (await events()).filter(e => e.name === "setup_start").length === 1);
  await evalJS(`document.querySelector('.start-submit').click()`);
  await sleep(500);
  check("Successful initial setup carries storage result", await hasEvent("setup_complete", {entry_point: "inline_setup", storage_result: "saved"}));
  check("Newly configured timer is recorded", await hasEvent("timer_view", {entry_point: "dashboard"}));

  await evalJS(`document.querySelector('.app-actions button').click()`);
  check("Privacy toggle is recorded", await hasEvent("feature_use", {feature: "privacy", action: "enable"}));
  await evalJS(`document.querySelectorAll('.app-actions button')[1].click()`);
  await sleep(100);
  check("Settlement keeps its existing event name", await hasEvent("settle_open", {feature: "settlement", action: "open"}));
  await evalJS(`document.querySelector('.modal .sheet > button').click(); document.querySelector('.slack-btn').click()`);
  await sleep(100);
  await evalJS(`document.querySelector('.slack-btn').click()`);
  check("Slack start and stop are distinguishable", await hasEvent("slack_toggle", {action: "start"}) && await hasEvent("slack_toggle", {action: "stop"}));

  await evalJS(`document.querySelector('.month-summary').click()`);
  await sleep(150);
  check("Monthly income expansion is recorded", await hasEvent("feature_use", {feature: "monthly_income", action: "open"}));
  await setInput('.mini-form input', '321.09');
  await evalJS(`document.querySelector('.mini-form button').click()`);
  check("Adding extra income is recorded", await hasEvent("feature_use", {feature: "extra_income", action: "add"}));
  await setInput('.month-body .rowline input', '3');
  await evalJS(`document.querySelector('.month-body .rowline input').blur()`);
  check("Unpaid-day edits are recorded on blur", await hasEvent("feature_use", {feature: "unpaid_days", action: "update"}));
  await evalJS(`document.querySelector('.month-summary').click()`);
  await sleep(150);
  check("Monthly income collapse is recorded", await hasEvent("feature_use", {feature: "monthly_income", action: "close"}));

  await evalJS(`document.querySelectorAll('.app-actions button')[2].click()`);
  await sleep(150);
  check("Opening settings is recorded", await hasEvent("feature_use", {feature: "settings", action: "open"}));
  await evalJS(`document.querySelector('.panel-foot button').click()`);
  await sleep(150);
  check("Settings updates carry their entry point", await hasEvent("feature_use", {feature: "settings", action: "save", entry_point: "settings_panel"}));
  check("Editing saved settings does not repeat initial conversion", (await events()).filter(e => e.name === "setup_complete").length === 1);

  const pipSupported = await evalJS(`Boolean(window.documentPictureInPicture?.requestWindow)`);
  if (pipSupported) {
    await evalJS(`window.__pipApi = window.documentPictureInPicture;
      Object.defineProperty(window, 'documentPictureInPicture', {configurable: true, value: {requestWindow: async () => {throw new Error('Denied')}}});
      document.querySelector('.floating-launch').click()`);
    await sleep(150);
    check("Desktop window failures are recorded separately", await hasEvent("feature_use", {feature: "desktop_timer", action: "open_failed"}));
    await evalJS(`Object.defineProperty(window, 'documentPictureInPicture', {configurable: true, value: window.__pipApi}); document.querySelector('.floating-launch').click()`);
    await sleep(500);
    check("Desktop window success is recorded after opening", await hasEvent("feature_use", {feature: "desktop_timer", action: "open"}));
    await evalJS(`window.documentPictureInPicture.window.document.querySelector('.float-privacy').click()`);
    check("Desktop privacy controls report their entry point", await hasEvent("feature_use", {feature: "privacy", action: "disable", entry_point: "desktop"}));
    await evalJS(`window.documentPictureInPicture.window.document.querySelector('.float-return').click()`);
    await sleep(150);
    check("Desktop return and close are recorded", await hasEvent("feature_use", {feature: "desktop_timer", action: "return"}) && await hasEvent("feature_use", {feature: "desktop_timer", action: "close"}));
    // Restore the privacy state expected by the following persistence check.
    await evalJS(`document.querySelector('.app-actions button').click()`);
  }

  const queued = await events();
  const allowed = new Set(['feature', 'action', 'entry_point', 'mode', 'storage_result', 'n', 'on', 'send_to']);
  check("Event parameters contain only structural fields", queued.every(e => Object.keys(e.params).every(key => allowed.has(key))));
  check("Pay and extra-income inputs stay out of events", !JSON.stringify(queued).includes('987654') && !JSON.stringify(queued).includes('321.09') && !JSON.stringify(queued).includes('step_cents'));

  await send("Page.reload");
  await sleep(1500);
  check("Saved settings restore the timer without another setup conversion", await hasEvent("timer_view", {entry_point: "restored"}) && !(await hasEvent("setup_complete")));
  await evalJS(`window.__savedGtag = window.gtag; window.gtag = () => {throw new Error('Analytics unavailable')}; document.querySelector('.app-actions button').click()`);
  check("A failing analytics tag does not block privacy controls", await evalJS(`JSON.parse(localStorage.getItem('salarytimer.site.v2')).privacy === false`));
  await evalJS(`window.gtag = window.__savedGtag`);

  const background = await send('Target.createTarget', {url: 'about:blank'});
  await send('Target.activateTarget', {targetId: background.targetId});
  await sleep(200);
  check("Engagement test actually backgrounds the timer", await evalJS('document.hidden'));
  await evalJS(`window.__realNow = performance.now.bind(performance); window.__clockOffset = 0;
    performance.now = () => window.__realNow() + window.__clockOffset; window.__clockOffset += 61000`);
  await sleep(1100);
  check("Background time does not trigger timer engagement", !(await hasEvent('timer_engaged')));
  await send('Page.bringToFront');
  await sleep(150);
  await evalJS(`window.__clockOffset += 61000`);
  await sleep(1100);
  check("60 seconds of foreground use triggers engagement", await hasEvent('timer_engaged'));
  await evalJS(`window.__clockOffset += 61000`);
  await sleep(1100);
  check("Engagement is recorded once per page load", (await events()).filter(e => e.name === 'timer_engaged').length === 1);
  await evalJS(`performance.now = window.__realNow`);
  await send('Target.closeTarget', {targetId: background.targetId});

  // SPA 导航是否补发 page_view
  await send("Page.navigate", { url: base + "/" });
  await sleep(2500);
  const before = await evalJS(`(window.dataLayer||[]).length`);
  const pathBefore = await evalJS(`location.pathname`);
  const clicked = await evalJS(`(() => {
    const links = [...document.querySelectorAll('a')];
    const a = links.find(x => (x.getAttribute('href')||'').replace(/\\/$/,'') === '/privacy');
    if (!a) return 'NO_LINK:' + links.map(x=>x.getAttribute('href')).join(',');
    a.click();
    return 'CLICKED';
  })()`);
  await sleep(2500);
  const after = await evalJS(`(window.dataLayer||[]).length`);
  const pathAfter = await evalJS(`location.pathname`);
  const spaOk = after > before && pathAfter !== pathBefore;
  console.log(`  ${spaOk ? "PASS" : "FAIL"}  SPA 导航补发 page_view (dataLayer ${before} → ${after}, path ${pathBefore} → ${pathAfter}, click=${clicked})`);
  if (!spaOk) bad++;

  await send('Page.navigate', {url: base + '/'});
  await sleep(1000);
  await evalJS(`localStorage.removeItem('salarytimer.site.v2')`);
  await send('Page.reload');
  await sleep(1000);
  await evalJS(`document.querySelector('.start-advanced').click()`);
  await sleep(150);
  await setInput('#amountInput', '456789.12');
  await setInput('.panel input[type="time"]', '08:00');
  await evalJS(`document.querySelector('.panel .switch-row input[type="checkbox"]').click();
    document.querySelector('.panel .add-link').click();
    const payday = document.querySelector('#paydaySelect');
    payday.value = payday.value === '15' ? '16' : '15';
    payday.dispatchEvent(new Event('change', {bubbles: true}));`);
  await sleep(100);
  await evalJS(`document.querySelector('.panel-foot button').click()`);
  await sleep(150);
  check('First setup through advanced settings is a conversion', await hasEvent('setup_complete', {entry_point: 'settings_panel', storage_result: 'saved'}));
  for (const feature of ['work_schedule', 'unpaid_breaks', 'payday', 'overtime']) {
    check('Saving advanced feature is recorded: ' + feature, await hasEvent('feature_use', {feature, entry_point: 'settings_panel'}));
  }

  await evalJS(`localStorage.removeItem('salarytimer.site.v2')`);
  await send('Page.reload');
  await sleep(1000);
  await setInput('.start-amount input', '123456.78');
  await evalJS(`window.__originalSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = () => {throw new DOMException('Blocked', 'SecurityError')};
    document.querySelector('.start-submit').click()`);
  await sleep(150);
  check('Storage failures are distinguishable from saved setups', await hasEvent('setup_complete', {storage_result: 'unavailable'}));
  check('The timer still opens when browser storage fails', await evalJS(`Boolean(document.querySelector('.earnings-dashboard'))`));
  await evalJS(`Storage.prototype.setItem = window.__originalSetItem`);

  ws.close(); chrome.kill(); server.close();
  console.log(`\n结果: ${bad === 0 ? "全部通过" : bad + " 项失败"}`);
  process.exit(bad === 0 ? 0 : 1);
})();
