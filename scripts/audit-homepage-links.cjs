/**
 * 首页入链质量审计：区分「面包屑/品牌」样板链接 与 「正文描述性锚文本」。
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
    } else if (e.name === "index.html") acc.push(p);
  }
  return acc;
}

function routeOf(f) {
  const rel = path.relative(OUT, f).replace(/\\/g, "/");
  const r = "/" + rel.replace(/\/?index\.html$/, "");
  return r.replace(/\/+$/, "") || "/";
}

function textOf(s) {
  return s.replace(/<[^>]+>/g, " ").replace(/&[a-z]+;/gi, " ").replace(/\s+/g, " ").trim();
}

const pages = walk(OUT).sort();
let totalContextual = 0;
const rows = [];

for (const f of pages) {
  const html = fs.readFileSync(f, "utf8");
  const route = routeOf(f);
  const headerEnd = html.indexOf("</header>");
  const footerStart = html.indexOf("<footer");
  const body = headerEnd > 0 && footerStart > headerEnd ? html.slice(headerEnd, footerStart) : html;

  // 标记面包屑区域，便于区分样板链接
  const crumbsStart = body.indexOf('class="crumbs"');
  const crumbsEnd = crumbsStart >= 0 ? body.indexOf("</nav>", crumbsStart) : -1;

  const re = /<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g;
  let m;
  const toHome = { breadcrumb: [], contextual: [] };
  while ((m = re.exec(body))) {
    const href = m[1];
    const abs = m.index;
    // 只关心指向首页的链接
    const target = href.split("#")[0].split("?")[0];
    if (target !== "/" && target !== "") continue;
    if (/^(https?:|mailto:)/.test(href)) continue;
    const txt = textOf(m[2]);
    const isCrumb = crumbsStart >= 0 && crumbsEnd > crumbsStart && abs >= crumbsStart && abs <= crumbsEnd;
    if (isCrumb) toHome.breadcrumb.push(txt);
    else toHome.contextual.push(txt);
  }

  totalContextual += toHome.contextual.length;
  rows.push({ route, ...toHome });
}

console.log("=== 指向首页 / 的链接（已剔除 header / footer 样板）===\n");
console.log("页面".padEnd(38) + "面包屑".padStart(8) + "正文描述性锚文本".padStart(16));
console.log("-".repeat(90));
for (const r of rows) {
  if (r.route === "/") continue;
  console.log(
    r.route.padEnd(38) +
      String(r.breadcrumb.length).padStart(8) +
      String(r.contextual.length).padStart(16) +
      (r.contextual.length ? "   " + [...new Set(r.contextual)].map((t) => `"${t}"`).join(" / ") : "   ← 无"),
  );
}

const without = rows.filter((r) => r.route !== "/" && r.contextual.length === 0);
console.log("\n=== 结论 ===");
console.log(`子页面总数: ${rows.length - 1}`);
console.log(`正文里有描述性锚文本指向首页的: ${rows.length - 1 - without.length}`);
console.log(`只有面包屑 "Home"、没有描述性锚文本的: ${without.length}`);
if (without.length) without.forEach((r) => console.log("  ✗ " + r.route));
console.log(`\n正文指向首页的链接总数: ${totalContextual}`);
