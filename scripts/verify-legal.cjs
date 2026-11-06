/**
 * Static verification for the Privacy Policy and Terms of Use pages.
 *
 * Run after `npm run build`:  npm run test:legal
 *
 * The point is not just "do the files exist". These policies make concrete
 * claims about the implementation (localStorage key, GA events, no accounts),
 * so this checks that the shipped HTML actually contains those claims, that
 * both pages are reachable from every page on the site, and that no Chinese
 * policy pages were published by accident.
 */
const fs = require("fs");
const path = require("path");

const OUT = path.join(__dirname, "..", "out");
const CONTACT = "oiwagok@gmail.com";

let passed = 0;
let failed = 0;

function check(name, condition, detail = "") {
  if (condition) {
    passed += 1;
    console.log(`  PASS  ${name}${detail ? ` — ${detail}` : ""}`);
  } else {
    failed += 1;
    console.log(`  FAIL  ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

function read(rel) {
  const full = path.join(OUT, rel);
  return fs.existsSync(full) ? fs.readFileSync(full, "utf8") : "";
}

/** Strip scripts/styles/tags so word counts describe visible copy only. */
function visibleText(html) {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&quot;|&#x27;|&#39;|&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&ldquo;|&rdquo;/g, '"')
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function jsonLdGraphs(html) {
  const out = [];
  const re = /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    try {
      const parsed = JSON.parse(m[1]);
      const graphs = parsed["@graph"] ? parsed["@graph"] : [parsed];
      out.push(...graphs);
    } catch {
      /* ignore unrelated malformed blocks */
    }
  }
  return out;
}

function allIndexHtml(dir, base = "") {
  const found = [];
  if (!fs.existsSync(dir)) return found;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith("__next.") || entry.name.startsWith("_next")) continue;
    const rel = path.join(base, entry.name);
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) found.push(...allIndexHtml(abs, rel));
    else if (entry.name === "index.html") found.push(rel.split(path.sep).join("/"));
  }
  return found;
}

console.log("\n=== Legal pages: static output verification ===\n");

const privacy = read(path.join("privacy", "index.html"));
const terms = read(path.join("terms", "index.html"));
const sitemap = read("sitemap.xml");

console.log("[1] Files and metadata");
check("out/privacy/index.html is prerendered", privacy.length > 10000, `${privacy.length} bytes`);
check("out/terms/index.html is prerendered", terms.length > 10000, `${terms.length} bytes`);
check(
  "privacy canonical is absolute and self-referencing",
  /rel="canonical" href="https:\/\/salarytimer\.work\/privacy\/"/.test(privacy),
);
check(
  "terms canonical is absolute and self-referencing",
  /rel="canonical" href="https:\/\/salarytimer\.work\/terms\/"/.test(terms),
);
check("privacy og:url present", /property="og:url"[^>]*content="[^"]*\/privacy\/"/.test(privacy));
check("terms og:url present", /property="og:url"[^>]*content="[^"]*\/terms\/"/.test(terms));
check(
  "both pages declare English",
  /<html lang="en"/.test(privacy) && /<html lang="en"/.test(terms),
);

console.log("\n[2] Structured data");
const privacyGraphs = jsonLdGraphs(privacy);
const termsGraphs = jsonLdGraphs(terms);
check(
  "privacy: WebPage + BreadcrumbList in JSON-LD",
  privacyGraphs.some((g) => g["@type"] === "WebPage") &&
    privacyGraphs.some((g) => g["@type"] === "BreadcrumbList"),
);
check(
  "terms: WebPage + BreadcrumbList in JSON-LD",
  termsGraphs.some((g) => g["@type"] === "WebPage") &&
    termsGraphs.some((g) => g["@type"] === "BreadcrumbList"),
);
check(
  "WebPage dateModified matches the published update date",
  [privacyGraphs, termsGraphs].every((graphs) =>
    graphs.some((g) => g["@type"] === "WebPage" && g.dateModified === "2026-11-06"),
  ),
);
check(
  "breadcrumbs point back to the homepage",
  [privacyGraphs, termsGraphs].every((graphs) =>
    graphs.some(
      (g) =>
        g["@type"] === "BreadcrumbList" &&
        g.itemListElement?.[0]?.name === "Home" &&
        String(g.itemListElement[0].item).endsWith("salarytimer.work/"),
    ),
  ),
);

console.log("\n[3] Page content and internal links");
const privacyText = visibleText(privacy);
const termsText = visibleText(terms);
check(
  "privacy has substantive copy",
  privacyText.split(/\s+/).length > 700,
  `${privacyText.split(/\s+/).length} words`,
);
check(
  "terms has substantive copy",
  termsText.split(/\s+/).length > 600,
  `${termsText.split(/\s+/).length} words`,
);
check(
  "privacy uses thematic H2s",
  (privacy.match(/<h2>/g) || []).length >= 9,
  `${(privacy.match(/<h2>/g) || []).length} sections`,
);
check(
  "terms uses thematic H2s",
  (terms.match(/<h2>/g) || []).length >= 9,
  `${(terms.match(/<h2>/g) || []).length} sections`,
);
check(
  "both pages show a machine-readable Last updated date",
  /dateTime="2026-11-06"/.test(privacy) && /dateTime="2026-11-06"/.test(terms),
);
check(
  "both pages publish the official contact address as mailto",
  (privacy.match(new RegExp(`mailto:${CONTACT.replace(".", "\\.")}`, "g")) || []).length > 0 &&
    (terms.match(new RegExp(`mailto:${CONTACT.replace(".", "\\.")}`, "g")) || []).length > 0,
);
check(
  "both pages link to the homepage with descriptive anchor text",
  privacy.includes('href="/">free live salary timer</a>') &&
    terms.includes('href="/">free live salary timer</a>'),
);
check(
  "the two policies cross-link each other",
  terms.includes('href="/privacy/"') && privacy.includes('href="/terms/"'),
);

console.log("\n[4] Privacy claims match the shipped implementation");
for (const [label, needle] of [
  ["localStorage key is named", "salarytimer.site.v2"],
  ["sessionStorage flag is named", "st.qs.skip"],
  ["GA4 is named as the analytics provider", "Google Analytics 4"],
  ["GA cookies are disclosed", "_ga"],
  ["the milestone event is listed", "milestone"],
  ["the numeric step parameter is disclosed", "step_cents"],
  ["the setup event is listed", "setup_complete"],
  ["no-account claim is present", "no account"],
]) {
  check(label, privacyText.toLowerCase().includes(needle.toLowerCase()), needle);
}
check(
  "privacy states the numbers stay on the device",
  /stays on your device|stay on your device|Nothing .* uploaded|none of it is uploaded/i.test(
    privacyText,
  ),
);
check(
  "terms disclaims payroll / advice use",
  /not a payslip/i.test(termsText) && /not financial, legal or employment advice/i.test(termsText),
);
check("terms is provided as-is", /as is/i.test(termsText));

console.log("\n[5] Site-wide reachability");
const pages = allIndexHtml(OUT);
check("all prerendered pages were found", pages.length >= 25, `${pages.length} HTML pages`);
const missingFooter = pages.filter((rel) => {
  const html = read(rel);
  return !html.includes('href="/privacy/"') || !html.includes('href="/terms/"');
});
check(
  "every page links to both policies in the footer",
  missingFooter.length === 0,
  missingFooter.length ? missingFooter.join(", ") : `${pages.length} pages checked`,
);
const zh = read(path.join("zh", "index.html"));
check(
  "Chinese homepage uses localised labels but English policy URLs",
  zh.includes('href="/privacy/">隐私政策') && zh.includes('href="/terms/">使用条款'),
);
check(
  "no Chinese policy pages were published",
  !fs.existsSync(path.join(OUT, "zh", "privacy")) &&
    !fs.existsSync(path.join(OUT, "zh", "terms")) &&
    !sitemap.includes("/zh/privacy") &&
    !sitemap.includes("/zh/terms"),
);
check(
  "sitemap lists both policies with low priority",
  sitemap.includes("<loc>https://salarytimer.work/privacy/</loc>") &&
    sitemap.includes("<loc>https://salarytimer.work/terms/</loc>") &&
    (sitemap.match(/<priority>0\.3<\/priority>/g) || []).length === 2,
);

console.log(`\n=== ${passed} passed, ${failed} failed ===\n`);
process.exit(failed === 0 ? 0 : 1);
