// Regression checks against shipped HTML: crawlability, visible evidence,
// schema/content agreement and accurate modification dates. Run after build.
const fs = require("fs");
const path = require("path");
const assert = require("node:assert/strict");
const root = path.join(__dirname, "..", "out");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const decode = (s) => s.replace(/&(?:amp|quot|apos|lt|gt|nbsp);|&#(?:x[0-9a-f]+|\d+);/gi, (v) => {
  const named = { "&amp;": "&", "&quot;": '"', "&apos;": "'", "&lt;": "<", "&gt;": ">", "&nbsp;": " " };
  return named[v] ?? String.fromCodePoint(v[2].toLowerCase() === "x" ? parseInt(v.slice(3), 16) : parseInt(v.slice(2), 10));
});
const text = (html) => decode(html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
  .replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();
const jsonLd = (html) => [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)]
  .flatMap((m) => JSON.parse(m[1]));
const pages = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "_next") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name === "index.html") pages.push(full);
  }
}
walk(root);
// The allowlist is a tripwire, not a law: a page may only be published if it is
// added here on purpose. Homepages and policies were the whole site; /about is
// the one editorial page that answers "who is behind this", and it is allowed
// because it adds a Person entity rather than a second surface competing for
// the same query. /hourly-rate-calculator was retired with the content cluster
// and brought back on its own, so its return is an explicit decision here rather
// than a side effect of a restore. Anything else still fails the build.
const allowed = new Set(["https://salarytimer.work/", "https://salarytimer.work/zh/", "https://salarytimer.work/about/", "https://salarytimer.work/hourly-rate-calculator/", "https://salarytimer.work/privacy/", "https://salarytimer.work/terms/"]);
assert(pages.length >= 4, "Missing retained routes");
const sitemap = read("sitemap.xml");
const modified = new Map([...sitemap.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((m) => [
  m[1].match(/<loc>(.*?)<\/loc>/)[1], m[1].match(/<lastmod>(.*?)<\/lastmod>/)?.[1].slice(0, 10),
]));
let guides = 0;
let published = 0;
for (const file of pages) {
  const html = fs.readFileSync(file, "utf8");
  if (/<meta[^>]*name="robots"[^>]*content="[^"]*noindex/.test(html)) continue;
  published++;
  const visible = text(html);
  const canonical = html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]*)"/)?.[1];
  assert(canonical && canonical.endsWith("/"), `${file}: canonical missing or inconsistent`);
  assert(allowed.has(canonical), `${file}: retired or unexpected page exported`);
  assert(modified.has(canonical), `${file}: absent from sitemap`);
  assert.equal((html.match(/<h1\b/g) || []).length, 1, `${file}: expected one main heading`);
  const nodes = jsonLd(html);
  const faq = nodes.find((node) => node["@type"] === "FAQPage");
  if (faq) {
    for (const question of faq.mainEntity) {
      assert(visible.includes(question.name), `${file}: schema-only question`);
      assert(visible.includes(question.acceptedAnswer.text), `${file}: FAQ schema answer differs from visible text`);
    }
  }
  const article = nodes.find((node) => node["@type"] === "Article");
  if (article) {
    guides++;
    assert(visible.includes("Published and maintained by Salary Timer"), `${file}: missing responsibility`);
    const date = html.match(/<time dateTime="([^"]*)"/)?.[1];
    assert.equal(article.dateModified, date, `${file}: visible date differs from schema`);
    assert.equal(date, modified.get(canonical), `${file}: sitemap date differs from article`);
    assert(article.publisher["@id"].endsWith("/#organization"), `${file}: disconnected publisher`);
    assert(visible.includes("Calculation method and sources"), `${file}: missing methodology`);
    const withoutScripts = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
    for (const source of article.citation) {
      assert(withoutScripts.includes(`href="${source}"`), `${file}: schema citation not linked in body`);
    }
  }
}
assert.equal(published, modified.size, "Published route count differs from sitemap");
console.log(`PASS: ${published} published routes: canonical, sitemap, headings and visible FAQ/schema agreement`);
console.log(`PASS: ${guides} guides: responsibility, sources and matching visible/schema/sitemap dates`);
const zh = read("zh/index.html");
assert.match(zh, /<html[^>]*lang="zh-CN"/);
assert.match(read("index.html"), /<html[^>]*lang="en"/);
assert(!text(zh).includes("Salary Timer is a free web tool"), "English entity definition leaked into Chinese content");
assert.equal(jsonLd(zh).find((n) => n["@type"] === "WebSite").inLanguage, "zh-CN");
console.log("PASS: Chinese language and definition are correct before JavaScript");
assert.equal(published, 6, "Only homepages, the about page, the tool page and policies may be published");
assert.equal(modified.size, 6, "Sitemap must list only retained pages");
for (const rel of ["learn", "salary-per-second", "paycheck-countdown", "shift-worker-salary-timer", "overtime-pay-calculator"]) {
  assert(!fs.existsSync(path.join(root, rel)), `Retired export still exists: ${rel}`);
}
for (const file of pages) {
  const html = fs.readFileSync(file, "utf8").replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
  for (const link of html.matchAll(/href="(\/[^"#?]*)(?:[?#][^"]*)?"/g)) {
    const url = link[1];
    assert(fs.existsSync(path.join(root, url)) || fs.existsSync(path.join(root, url, "index.html")), `${file}: dead link ${url}`);
  }
}
console.log("PASS: retired routes absent, six-page sitemap and remaining internal links");
const config = fs.readFileSync(path.join(__dirname, "..", "nginx.conf"), "utf8");
assert(!/try_files[^;]*\/index\.html\s*;/.test(config), "Homepage fallback still enabled");
assert.match(config, /try_files\s+\$uri\s+\$uri\/\s+\$uri\.html\s+=404;/);
assert(fs.existsSync(path.join(root, "404.html")), "Missing exported 404 page");
assert.match(read("404.html"), /name="robots" content="[^"]*noindex/);
assert(read("404.html").includes('href="/"'), "404 page needs a route back home");
assert(!fs.readFileSync(path.join(__dirname, "..", "app", "sitemap.ts"), "utf8").includes("new Date()"));
console.log("PASS: 404 configuration, error artifact and stable content dates");
