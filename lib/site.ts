/**
 * Site-wide constants and the canonical list of long-tail landing pages.
 *
 * Everything that needs the production domain (canonical tags, Open Graph URLs,
 * sitemap, robots) reads it from here, so going live is a one-line change:
 * set NEXT_PUBLIC_SITE_URL at build time.
 */

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://salarytimer.work"
).replace(/\/+$/, "");

export const SITE_NAME = "Salary Timer";

/** The homepage <title>. Kept here so the tab title, og:title and twitter:title
 *  can never drift apart. */
/** The homepage <title>. Kept here so the tab title, og:title and twitter:title
 *  can never drift apart. */
export const SITE_TITLE = `${SITE_NAME} — Free Live Earnings Counter`;

export const SITE_DESCRIPTION =
  "Track your estimated earnings in real time with a free salary timer. Set your pay, work schedule and unpaid breaks. Includes a floating desktop counter.";

export const OG_IMAGE = "/og.png";
export const SOCIAL_IMAGE = {
  url: OG_IMAGE,
  width: 1200,
  height: 630,
  alt: "Salary Timer — a live earnings counter",
};

/**
 * Public profiles that describe the same entity. Fed to schema.org `sameAs` so
 * the site and the repo are understood as one thing, not two.
 */
export const SAME_AS = ["https://github.com/18272837023/Salary-Timer"];

/** Stable @id so WebSite / WebApplication can reference one Organization node. */
export const ORGANIZATION_ID = `${SITE_URL}/#organization`;

/**
 * One-sentence entity definition. Used verbatim on the homepage, in the FAQ and
 * in structured data — the whole point is that the machine never has to guess
 * what this site is.
 */
export const ENTITY_DEFINITION =
  "Salary Timer is a free web tool that shows your earnings ticking up in real time — per second, minute and hour — using your actual schedule, unpaid breaks and overtime rate.";

export const ZH_ENTITY_DEFINITION =
  "薪资计时器是一个免费的网页工具，按你的真实排班、无薪休息和加班倍率，实时显示你每秒、每分钟、每小时赚多少钱。";

/**
 * GA4 measurement ID. Page-view analytics only — the timer's numbers live in
 * localStorage and are never sent anywhere. Override with NEXT_PUBLIC_GA_ID
 * to point a staging build at a different property, or set it to an empty
 * string to switch analytics off entirely.
 */
export const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_ID === undefined
    ? "G-8T8JLTRSX9"
    : process.env.NEXT_PUBLIC_GA_ID;

/**
 * The one public inbox for privacy and terms questions. There is no account
 * system and no support desk, so the legal pages point here instead of
 * inventing a contact form that does not exist.
 */
export const CONTACT_EMAIL = "oiwagok@gmail.com";

/** Bump whenever either legal page changes — shown as "Last updated" on both. */
export const LEGAL_UPDATED = "2026-11-15";

export interface LegalPageRoute {
  href: string;
  label: string;
  /** i18n key for the footer link label */
  labelKey: string;
  /** <title> (layout adds "· Salary Timer") */
  title: string;
  description: string;
}

/**
 * Legal pages are English-only on purpose: `/zh` is a translated homepage, not
 * a translated site. The footer labels are localised, but the policies live at
 * exactly one URL each so there is never a second, drifting copy to maintain.
 *
 * The footer and the sitemap both read this list, so a page cannot be published
 * without being linked and indexed.
 */
export const LEGAL_PAGES: LegalPageRoute[] = [
  {
    href: "/privacy",
    label: "Privacy Policy",
    labelKey: "footer.privacy",
    title: "Privacy Policy — what Salary Timer stores",
    description:
      "Salary Timer has no account and no server-side database: your pay figures are calculated in your browser and stay on your device. Here is exactly what Google Analytics does collect.",
  },
  {
    href: "/terms",
    label: "Terms of Use",
    labelKey: "footer.terms",
    title: "Terms of Use — estimates, not advice",
    description:
      "Salary Timer is a free gross-pay estimator, not a payslip or financial advice. Read the terms for using the live counter, the limits of its estimates and where your settings are kept.",
  },
];

export function absoluteUrl(path = "/"): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Absolute URL of a landing page, with the trailing slash the site is built
 * with (`trailingSlash: true`). Canonical tags, sitemap entries and structured
 * data all have to agree on exactly one form.
 */
export function pageUrl(path: string): string {
  const absolute = absoluteUrl(path);
  return absolute.endsWith("/") ? absolute : `${absolute}/`;
}
