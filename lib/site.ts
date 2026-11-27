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
 * GA4 measurement ID for page views and structural product interactions.
 * Pay amounts stay in localStorage. Override with NEXT_PUBLIC_GA_ID
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
export const LEGAL_UPDATED = "2026-11-21";

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

export interface SitePageRoute {
  href: string;
  label: string;
  /** <title> (the layout appends "· Salary Timer", so never repeat the brand) */
  title: string;
  description: string;
}

/**
 * The one non-legal editorial page. Not a legal route — it carries no "last
 * updated" line and no policy cross-links — but it follows the same rule: the
 * footer and the sitemap read it from here, so it cannot be published without
 * being reachable.
 */
export const ABOUT_PAGE: SitePageRoute = {
  href: "/about",
  label: "About",
  title: "About this site — the person behind the timer",
  description:
    "Who builds Salary Timer, why the counter follows your real schedule instead of dividing by 2,080, what happens to the figures you type in, and how to report a mistake.",
};

/**
 * Tool pages: single-purpose utilities that live at the root.
 *
 * Kept as a list rather than loose constants because four things have to agree
 * on the same copy — the page's own <title>/description, the Tools menu in the
 * header, the footer link, and the sitemap entry. Reading all of them from here
 * means a tool cannot ship with a menu entry that calls it something else.
 */
export interface ToolRoute extends SitePageRoute {
  /** Short label for the header menu, sized to fit one dropdown row. */
  menuLabel: string;
  /** The line under the menu label: what goes in, what comes out. */
  menuHint: string;
}

export const TOOL_PAGES: ToolRoute[] = [
  {
    // The finest unit first, then the two directions of the same division. The
    // page is static on purpose: "how much do I make per second" is a lookup,
    // not a request for a clock, so it must not compete with the homepage.
    href: "/pay-per-second-calculator",
    label: "Pay per second calculator",
    menuLabel: "Pay per second",
    menuHint: "Hourly or annual pay → second, minute, workday",
    title: "Pay Per Second Calculator — per second, minute and workday",
    description:
      "Turn an hourly wage or an annual salary into pay per second, per minute, per hour and per workday. Static figures you can read at a glance, with a link to the live counter.",
  },
  {
    // Manual mode, and only allowed to exist because it is manual: the page
    // ships its own start/pause/resume/reset watch rather than borrowing the
    // schedule-driven timer from the homepage.
    href: "/salary-stopwatch",
    label: "Salary stopwatch",
    menuLabel: "Salary stopwatch",
    menuHint: "Start, pause and price a single session",
    title: "Salary Stopwatch — start, pause and price a session",
    description:
      "A manual salary stopwatch: press start, pause for an unpaid break, and watch the paid time and earnings for that session. Reset to log it and start the next.",
  },
  {
    // The only page here that logs a row per day. It exists because the two
    // neighbours above deliberately refuse this job: the stopwatch prices one
    // session and the biweekly page is one number for a fortnight, with no
    // per-day grid at all. The hero is a table, never the live counter — the
    // planning rule for this page forbids the homepage's ticker from being the
    // main event, and the build asserts the grid is still there.
    href: "/time-card-calculator",
    label: "Time card calculator",
    menuLabel: "Time card",
    menuHint: "Clock in and out per day → hours, overtime, pay",
    title: "Time Card Calculator — weekly and biweekly hours",
    description:
      "Log clock-in and clock-out for each day, subtract unpaid breaks, and total regular hours, overtime hours and gross pay across a 7 or 14-day card. Overnight shifts, print and CSV export.",
  },
  {
    href: "/hourly-rate-calculator",
    label: "Salary to hourly calculator",
    menuLabel: "Salary to hourly",
    menuHint: "Annual, monthly or weekly pay → your real hourly rate",
    title: "Salary to Hourly Calculator — real hourly rate",
    description:
      "Turn a yearly, monthly or weekly salary into a real hourly rate using the hours you actually work. Unpaid lunch, overtime and a 4-day week all change the number.",
  },
  {
    // The inverse direction, and deliberately not a rewrite of the page above:
    // that one answers "what is my rate", this one answers "what is my year".
    // The copy never uses the phrase "salary to hourly calculator" — the two
    // pages would then compete for the same query instead of splitting it.
    href: "/hourly-to-annual-salary",
    label: "Hourly to annual salary calculator",
    menuLabel: "Hourly to annual",
    menuHint: "Hourly wage → year, month, week and biweekly pay",
    title: "Hourly to Annual Salary Calculator — year, month, week",
    description:
      "Turn an hourly wage into annual, monthly, weekly and biweekly pay, with a 52 or 50 paid-week switch. Includes what $20 and $25 an hour come to in a year.",
  },
  {
    // Sits next to the hourly→annual page because it is the same arithmetic
    // stopped one step earlier: that page answers "what is my year", this one
    // answers "what is one paycheck". The copy never says "hourly to annual".
    href: "/biweekly-pay-calculator",
    label: "Biweekly pay calculator",
    menuLabel: "Biweekly pay",
    menuHint: "Salary or wage → one two-week paycheck",
    title: "Biweekly Pay Calculator — what one paycheck comes to",
    description:
      "Turn an annual salary or an hourly wage into the gross amount of one biweekly paycheck, with the semi-monthly comparison and the 26-check year behind it.",
  },
  {
    // The only page here that answers with a date instead of an amount. Kept
    // last in the menu because it is a different kind of question, and kept
    // money-free because the homepage already owns the "what is it worth" one.
    href: "/payday-countdown",
    label: "Payday countdown",
    menuLabel: "Payday countdown",
    menuHint: "Days until your next paycheck, any pay cycle",
    title: "Payday Countdown — days until your next paycheck",
    description:
      "Count the days to your next payday on a weekly, biweekly, semi-monthly or monthly cycle, with a weekend rule and the next three dates. A date countdown, not a wage estimate.",
  },
];

/** Throws rather than returning undefined: a page asking for a tool that is not
 *  in the list is a build-time mistake, not something to paper over at runtime. */
export function getTool(href: string): ToolRoute {
  const tool = TOOL_PAGES.find((entry) => entry.href === href);
  if (!tool) throw new Error(`Unknown tool route: ${href}`);
  return tool;
}

/**
 * Open Graph fields a page-level `openGraph` must carry.
 *
 * Next replaces the parent `openGraph` object wholesale instead of deep-merging
 * it, so a page that only sets `title`/`url` loses the image, the site name and
 * the type — the share card then renders blank. Spread this first.
 */
export const OG_DEFAULTS = {
  type: "website" as const,
  siteName: SITE_NAME,
  locale: "en_US",
  images: [SOCIAL_IMAGE],
};

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
