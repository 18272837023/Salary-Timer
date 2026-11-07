/**
 * Static verification for the agentic-browsing fixes.
 *
 * Run after `npm run build`:  npm run test:agentic
 *
 * Lighthouse 13.6 "Agentic Browsing" failed three audits on this site:
 *   llms-txt                  — Nginx's SPA fallback served index.html at /llms.txt
 *   ard-schema                — same fallback served HTML where JSON was expected
 *   agent-accessibility-tree  — a closed aria-hidden modal kept a focusable button
 *
 * This mirrors the *actual* Lighthouse checks (core/audits/agentic/llms-txt.js,
 * third-party/ard/ard.js) against the built output, so a regression fails the
 * build instead of quietly dropping the score back to 25.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "out");
const SITE = "https://salarytimer.work";

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

function read(rel, base = OUT) {
  const full = path.join(base, rel);
  return fs.existsSync(full) ? fs.readFileSync(full, "utf8") : "";
}

/** Resolve a published absolute URL to a file in `out/`. */
function localTarget(url) {
  const p = new URL(url).pathname;
  if (p.endsWith("/")) return path.join(OUT, p, "index.html");
  return path.join(OUT, p);
}

function allHtmlPages(dir = OUT, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) allHtmlPages(full, acc);
    else if (entry.name === "index.html") acc.push(full);
  }
  return acc;
}

console.log("Agentic browsing — built-output checks\n");

// ---------------------------------------------------------------- llms.txt
console.log("llms.txt (Lighthouse: H1 + Markdown link + >= 50 chars)");
const llms = read("llms.txt");
check("out/llms.txt was emitted", llms.length > 0);
check("has an H1 header", /^\s*#\s+.+/m.test(llms));
check("has at least one Markdown link", /\[.+\]\(.+\)/.test(llms));
check("is at least 50 characters", llms.length >= 50, `${llms.length} chars`);
check(
  "is not the SPA fallback HTML",
  !/<!DOCTYPE|<html|<head/i.test(llms),
);

const links = [...llms.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)].map((m) => ({
  label: m[1],
  url: m[2],
}));
check("contains a useful number of links", links.length >= 20, `${links.length} links`);
check(
  "every link is an absolute salarytimer.work URL",
  links.every((l) => l.url.startsWith(`${SITE}/`)),
);
const weakAnchors = links.filter(
  (l) => l.label.trim().length <= 8 || /^(here|link|click|this page|read more)$/i.test(l.label.trim()),
);
check(
  "every link has descriptive anchor text",
  weakAnchors.length === 0,
  weakAnchors.length ? weakAnchors.map((l) => `"${l.label}"`).join(", ") : "all anchors descriptive",
);
check("the English homepage is the first link", links[0]?.url === `${SITE}/`);
check("advertises the ARD manifest", links.some((l) => l.url === `${SITE}/ard.json`));

const missing = links.filter((l) => !fs.existsSync(localTarget(l.url)));
check(
  "every linked URL resolves to a built file (no dead links)",
  missing.length === 0,
  missing.length ? missing.map((l) => l.url).join(", ") : "all links resolve",
);

// ----------------------------------------------------------------- ard.json
console.log("\nard.json (ARD v0.91 conformance shape)");
const ardText = read("ard.json");
check("out/ard.json was emitted", ardText.length > 0);
let ard = null;
try {
  ard = JSON.parse(ardText);
} catch (e) {
  /* reported below */
}
check("parses as JSON", ard !== null);
check("root is an object with an entries array", !!ard && Array.isArray(ard.entries));
check("has at least one entry", !!ard && Array.isArray(ard.entries) && ard.entries.length > 0);
check("root has no deprecated `collections`", !!ard && !("collections" in ard));

const URN = /^urn:air:[a-zA-Z0-9.-]+(?::[a-zA-Z0-9._:-]+)?:[a-zA-Z0-9._-]+$/;
for (const [i, e] of (ard?.entries ?? []).entries()) {
  const tag = `entry[${i}]`;
  check(`${tag} identifier is a domain-anchored URN`, typeof e.identifier === "string" && URN.test(e.identifier), e.identifier);
  check(`${tag} has displayName`, typeof e.displayName === "string" && e.displayName.length > 0);
  check(`${tag} has a media type`, typeof e.type === "string" && /^[^/]+\/[^/]+/.test(e.type), e.type);
  check(`${tag} has exactly one of url/data`, ("url" in e) !== ("data" in e));
  check(`${tag} url is an absolute URI`, typeof e.url === "string" && /^https?:\/\//.test(e.url));
  check(
    `${tag} has 2–5 representativeQueries`,
    Array.isArray(e.representativeQueries) &&
      e.representativeQueries.length >= 2 &&
      e.representativeQueries.length <= 5 &&
      e.representativeQueries.every((q) => typeof q === "string"),
  );
  check(`${tag} trustManifest has identity`, !e.trustManifest || !!e.trustManifest.identity);
  if (e.url) {
    check(`${tag} url resolves to a built file`, fs.existsSync(localTarget(e.url)), e.url);
  }
}

// ------------------------------------------------------- discovery + modal
console.log("\nDiscovery signal and accessibility");
const pages = allHtmlPages();
check("found the prerendered pages", pages.length >= 25, `${pages.length} HTML pages`);
check(
  'every page advertises <link rel="ard" href="/ard.json">',
  pages.every((p) => /<link[^>]*rel="ard"[^>]*href="\/ard\.json"/.test(fs.readFileSync(p, "utf8"))),
);
check(
  'no page advertises a hidden /.well-known/ path it cannot deploy',
  pages.every((p) => !/rel="ard"[^>]*\.well-known/.test(fs.readFileSync(p, "utf8"))),
);

const modal = read("SettlementModal.tsx", path.join(ROOT, "components"));
check("SettlementModal keeps aria-hidden={!open}", modal.includes("aria-hidden={!open}"));
check(
  "SettlementModal adds inert when closed",
  modal.includes("inert={!open ? true : undefined}"),
);
for (const name of ["QuickStart.tsx", "SetupPanel.tsx"]) {
  check(`${name} still uses inert (no regression)`, read(name, path.join(ROOT, "components")).includes("inert={!open ? true : undefined}"));
}

const deploy = read("deploy.yml", path.join(ROOT, ".github", "workflows"));
check("deploy mirrors ard.json into /.well-known/", deploy.includes(".well-known/ard.json"));
check("deploy asserts the live llms.txt content", deploy.includes("Live /llms.txt is missing"));
check("deploy asserts the live ard.json content", deploy.includes("Live /ard.json is missing"));
check(
  "no public/.well-known directory that scp would skip",
  !fs.existsSync(path.join(ROOT, "public", ".well-known")),
);

console.log(`\n${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
