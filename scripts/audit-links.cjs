/**
 * 内链结构审计：解析 out/ 的静态 HTML，量化链接图谱。
 * 用法: node scripts/audit-links.cjs
 */
const fs = require("fs");
const path = require("path");

const OUT = path.join(__dirname, "..", "out");

function walk(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === "_next") continue;
      walk(p, acc);
    } else if (e.name === "index.html") {
      acc.push(p);
    }
  }
  return acc;
}

/** 从 HTML 中取 <a href="...">text</a>，忽略外链与锚点 */
function anchors(html) {
  const out = [];
  const re = /<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g;
  let m;
  while ((m = re.exec(html))) {
    const href = m[1];
    const text = m[2]
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    out.push({ href, text });
  }
  return out;
}

function normalizeHref(href) {
  if (!href) return null;
  if (/^(https?:|mailto:|tel:)/i.test(href)) return null;
  if (href.startsWith("#")) return null;
  let p = href.split("#")[0].split("?")[0];
  if (!p) return null;
  if (!p.startsWith("/")) return null;
  return p;
}

function toRoute(p) {
  let r = p.replace(/\/+$/, "");
  return r === "" ? "/" : r;
}

function textOf(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const files = walk(OUT).sort();
const pages = [];

for (const f of files) {
  const html = fs.readFileSync(f, "utf8");
  const rel = path.relative(OUT, f).replace(/\\/g, "/");
  const route = toRoute("/" + rel.replace(/\/?index\.html$/, ""));

  const headerEnd = html.indexOf("</header>");
  const footerStart = html.indexOf("<footer");
  const header = headerEnd > 0 ? html.slice(0, headerEnd) : "";
  const footer = footerStart > 0 ? html.slice(footerStart) : "";
  const body =
    headerEnd > 0 && footerStart > headerEnd
      ? html.slice(headerEnd, footerStart)
      : html;

  const all = anchors(html);
  const inNav = new Set(anchors(header).map((a) => a.href + "|" + a.text));
  const inFoot = new Set(anchors(footer).map((a) => a.href + "|" + a.text));

  const bodyAnchors = anchors(body).filter(
    (a) => !inNav.has(a.href + "|" + a.text) && !inFoot.has(a.href + "|" + a.text),
  );

  pages.push({
    route,
    title: (html.match(/<title>([^<]*)<\/title>/) || [, ""])[1],
    words: textOf(body).split(" ").filter(Boolean).length,
    h1: (body.match(/<h1\b/g) || []).length,
    h2: (body.match(/<h2\b/g) || []).length,
    h3: (body.match(/<h3\b/g) || []).length,
    bodyLinks: bodyAnchors,
    allLinks: all,
    hasFaqSchema: /"@type":"FAQPage"/.test(html),
    hasBreadcrumb: /BreadcrumbList/.test(html),
  });
}

const byRoute = new Map(pages.map((p) => [p.route, p]));

// ---- 入链统计（区分正文内链 / 全站导航） ----
const inbody = new Map(pages.map((p) => [p.route, []]));
const anywhere = new Map(pages.map((p) => [p.route, []]));

for (const p of pages) {
  for (const a of p.bodyLinks) {
    const t = normalizeHref(a.href);
    if (!t) continue;
    const r = toRoute(t);
    if (inbody.has(r)) inbody.get(r).push({ from: p.route, text: a.text });
  }
  for (const a of p.allLinks) {
    const t = normalizeHref(a.href);
    if (!t) continue;
    const r = toRoute(t);
    if (anywhere.has(r)) anywhere.get(r).push({ from: p.route, text: a.text });
  }
}

console.log("=== 页面规模 ===");
console.log(
  ["route", "words", "h2", "h3", "正文出链", "正文入链", "全站入链"]
    .map((s, i) => (i === 0 ? s.padEnd(34) : s.padStart(9)))
    .join(""),
);
for (const p of pages.sort((a, b) => a.route.localeCompare(b.route))) {
  console.log(
    p.route.padEnd(34) +
      String(p.words).padStart(9) +
      String(p.h2).padStart(9) +
      String(p.h3).padStart(9) +
      String(p.bodyLinks.length).padStart(9) +
      String(inbody.get(p.route).length).padStart(9) +
      String(anywhere.get(p.route).length).padStart(9),
  );
}

console.log("\n=== 正文入链来源（谁在正文里链向它） ===");
for (const p of pages) {
  const src = inbody.get(p.route).map((x) => x.from);
  const uniq = [...new Set(src)];
  console.log(`${p.route.padEnd(34)} ${uniq.length} 个来源: ${uniq.join(", ") || "（无正文入链）"}`);
}

console.log("\n=== 锚文本分布（同一目标的不同锚文本） ===");
for (const p of pages) {
  const texts = [...new Set(inbody.get(p.route).map((x) => x.text))];
  if (texts.length) console.log(`${p.route.padEnd(34)} ${texts.map((t) => `"${t}"`).join(" / ")}`);
}

console.log("\n=== 断链检查 ===");
let broken = 0;
for (const p of pages) {
  for (const a of p.allLinks) {
    const t = normalizeHref(a.href);
    if (!t) continue;
    const r = toRoute(t);
    if (!byRoute.has(r)) {
      console.log(`  ${p.route} → ${a.href}  (锚文本: "${a.text}")`);
      broken++;
    }
  }
}
if (!broken) console.log("  无断链");

console.log("\n=== 结构化数据覆盖 ===");
for (const p of pages) {
  console.log(
    `${p.route.padEnd(34)} FAQPage=${p.hasFaqSchema ? "Y" : "-"}  Breadcrumb=${p.hasBreadcrumb ? "Y" : "-"}`,
  );
}
