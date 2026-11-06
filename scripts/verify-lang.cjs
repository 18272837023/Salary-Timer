/**
 * Verify the route-driven language picker end to end in a real browser:
 * default English, dropdown state, EN -> English page, 中文 -> /zh Chinese page.
 *
 *   node scripts/verify-lang.cjs
 */
const http = require("http");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawn } = require("child_process");

const ROOT = path.join(__dirname, "..", "out");
const PORT = 8852;
const CDP = 9572;
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
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(ROOT, p, "index.html");
  if (!fs.existsSync(file)) return res.writeHead(404).end("not found");
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
  const base = `http://127.0.0.1:${PORT}`;
  await new Promise((r) => server.listen(PORT, r));
  const chrome = spawn(CHROME, [
    "--headless=new", "--disable-gpu", `--remote-debugging-port=${CDP}`,
    "--window-size=1400,1000",
    `--user-data-dir=${path.join(os.tmpdir(), "lang-verify-" + Date.now())}`,
    "about:blank",
  ]);

  let list = null;
  for (let i = 0; i < 40; i++) { try { list = await getJSON("/json/list"); if (list && list.length) break; } catch {} await sleep(300); }
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
    const r = await send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || "eval error");
    return r.result.value;
  };

  let bad = 0;
  const check = (name, ok, extra = "") => {
    if (!ok) bad++;
    console.log(`  ${ok ? "PASS" : "FAIL"}  ${name}${extra ? "  (" + extra + ")" : ""}`);
  };

  // 1. Default visit — must be English regardless of browser locale.
  await send("Page.navigate", { url: base + "/" });
  await sleep(2500);
  let s = JSON.parse(await evalJS(`JSON.stringify({
    path: location.pathname,
    htmlLang: document.documentElement.lang,
    firstNav: (document.querySelector('.nav-links a')||{}).textContent,
    btn: (document.querySelector('.lang-dd-btn')||{}).textContent,
    menuOpen: !!document.querySelector('.lang-dd-menu'),
    h2: (document.querySelector('main h2')||{}).textContent,
  })`));
  console.log("\n[1] 默认访问 /");
  check("默认英文页面", s.firstNav === "Live timer", `nav=${s.firstNav}`);
  check("<html lang> = en", s.htmlLang === "en", s.htmlLang);
  check("下拉按钮显示 EN", s.btn.includes("EN"), JSON.stringify(s.btn));
  check("菜单默认收起", s.menuOpen === false);

  // 2. Open the dropdown — both options, current one ticked.
  await evalJS(`document.querySelector('.lang-dd-btn').click()`);
  await sleep(300);
  s = JSON.parse(await evalJS(`JSON.stringify({
    open: !!document.querySelector('.lang-dd-menu'),
    opts: [...document.querySelectorAll('.lang-dd-menu .lang-dd-item')].map(x => ({
      text: x.textContent.trim(), selected: x.getAttribute('aria-selected'),
    })),
  })`));
  console.log("\n[2] 展开下拉");
  check("菜单弹出", s.open);
  check("两个选项 English / 简体中文", s.opts.length === 2 && s.opts.some(o => o.text.includes("English")) && s.opts.some(o => o.text.includes("简体中文")), JSON.stringify(s.opts.map(o => o.text)));
  check("当前 EN 被选中", s.opts.some(o => o.text.includes("English") && o.selected === "true"));

  // 3. Pick 简体中文 — must navigate to /zh and show Chinese.
  await evalJS(`[...document.querySelectorAll('.lang-dd-menu .lang-dd-item')].find(x=>x.textContent.includes('简体中文')).click()`);
  await sleep(3000);
  s = JSON.parse(await evalJS(`JSON.stringify({
    path: location.pathname,
    htmlLang: document.documentElement.lang,
    firstNav: (document.querySelector('.nav-links a')||{}).textContent,
    btn: (document.querySelector('.lang-dd-btn')||{}).textContent,
    h2: (document.querySelector('main h2')||{}).textContent,
    hasChinese: /[\\u4e00-\\u9fa5]/.test((document.querySelector('main h2')||{}).textContent||''),
  })`));
  console.log("\n[3] 选择 简体中文");
  check("跳转到 /zh", s.path.startsWith("/zh"), s.path);
  check("页面是中文", s.firstNav === "实时计时" && s.hasChinese, `nav=${s.firstNav}, h2=${s.h2}`);
  check("<html lang> = zh-CN", s.htmlLang === "zh-CN", s.htmlLang);
  check("下拉按钮显示 中", s.btn.includes("中"), JSON.stringify(s.btn));

  // 4. Switch back to EN — must return to / and English.
  await evalJS(`document.querySelector('.lang-dd-btn').click()`);
  await sleep(300);
  await evalJS(`[...document.querySelectorAll('.lang-dd-menu .lang-dd-item')].find(x=>x.textContent.includes('English')).click()`);
  await sleep(3000);
  s = JSON.parse(await evalJS(`JSON.stringify({
    path: location.pathname,
    htmlLang: document.documentElement.lang,
    firstNav: (document.querySelector('.nav-links a')||{}).textContent,
    btn: (document.querySelector('.lang-dd-btn')||{}).textContent,
  })`));
  console.log("\n[4] 切回 English");
  check("回到 /", s.path === "/", s.path);
  check("页面是英文", s.firstNav === "Live timer", s.firstNav);
  check("<html lang> = en", s.htmlLang === "en", s.htmlLang);
  check("下拉按钮显示 EN", s.btn.includes("EN"), JSON.stringify(s.btn));

  // 5. Direct visit to /zh — prerendered HTML must already be Chinese.
  await send("Page.navigate", { url: base + "/zh/" });
  await sleep(2000);
  s = JSON.parse(await evalJS(`JSON.stringify({
    path: location.pathname,
    htmlLang: document.documentElement.lang,
    firstNav: (document.querySelector('.nav-links a')||{}).textContent,
    btn: (document.querySelector('.lang-dd-btn')||{}).textContent,
  })`));
  console.log("\n[5] 直接访问 /zh/");
  check("中文页面", s.firstNav === "实时计时", s.firstNav);
  check("下拉显示 中", s.btn.includes("中") && !s.btn.includes("EN"), JSON.stringify(s.btn));
  check("<html lang> = zh-CN", s.htmlLang === "zh-CN", s.htmlLang);

  ws.close(); chrome.kill(); server.close();
  console.log(`\n结果: ${bad === 0 ? "全部通过 ✅" : bad + " 项失败 ❌"}`);
  process.exit(bad === 0 ? 0 : 1);
})().catch((e) => { console.error(e); process.exit(1); });
