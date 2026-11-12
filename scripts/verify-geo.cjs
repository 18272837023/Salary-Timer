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
assert(pages.length >= 24, "Missing exported routes");
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
const lunch = read("learn/are-lunch-breaks-paid/index.html");
assert(text(lunch).includes("$1.70"));
assert(!lunch.includes("$3–4"));
assert(text(read("learn/monthly-salary-to-hourly-rate/index.html")).includes("valid annualized convention"));
assert(text(read("learn/how-overtime-is-calculated/index.html")).includes("covered, nonexempt"));
console.log("PASS: corrected lunch example, monthly average and overtime scope are exported");
const config = fs.readFileSync(path.join(__dirname, "..", "nginx.conf"), "utf8");
assert(!/try_files[^;]*\/index\.html\s*;/.test(config), "Homepage fallback still enabled");
assert.match(config, /try_files\s+\$uri\s+\$uri\/\s+\$uri\.html\s+=404;/);
assert(fs.existsSync(path.join(root, "404.html")), "Missing exported 404 page");
assert.match(read("404.html"), /name="robots" content="[^"]*noindex/);
assert(read("404.html").includes('href="/"'), "404 page needs a route back home");
assert(!fs.readFileSync(path.join(__dirname, "..", "app", "sitemap.ts"), "utf8").includes("new Date()"));
console.log("PASS: 404 configuration, error artifact and stable content dates");
