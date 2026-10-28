/**
 * 临时验证脚本：确认 GA4 标签在静态产物里真的执行了。
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
  await new Promise((r) => server.listen(PORT, r));
  const chrome = spawn(CHROME, [
    "--headless=new", "--disable-gpu", `--remote-debugging-port=${CDP}`,
    "--window-size=1400,1000",
    `--user-data-dir=${path.join(os.tmpdir(), "ga-verify-" + Date.now())}`,
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

  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/` });
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

  // SPA 导航是否补发 page_view
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/` });
  await sleep(2500);
  const before = await evalJS(`(window.dataLayer||[]).length`);
  const pathBefore = await evalJS(`location.pathname`);
  const clicked = await evalJS(`(() => {
    const links = [...document.querySelectorAll('a')];
    const a = links.find(x => (x.getAttribute('href')||'').replace(/\\/$/,'') === '/learn');
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

  ws.close(); chrome.kill(); server.close();
  console.log(`\n结果: ${bad === 0 ? "全部通过" : bad + " 项失败"}`);
  process.exit(bad === 0 ? 0 : 1);
})();
