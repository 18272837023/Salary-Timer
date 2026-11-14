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
export const LEGAL_UPDATED = "2026-11-06";

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

/**
 * The three topics this site is actually about. Everything else — tools,
 * articles, hubs — hangs off one of them.
 *
 * A cluster is not a tag. It is a claim: "this site covers this topic, and here
 * is the page that defines it, plus every node underneath." Internal links are
 * derived from membership rather than hand-written, so a new page can never end
 * up orphaned by forgetting to add a link.
 */
export type ClusterId = "hourly-rate" | "paid-time" | "pay-schedule";

export interface Cluster {
  id: ClusterId;
  /** hub page that defines the topic */
  href: string;
  /** short label for nav / breadcrumbs */
  label: string;
  /** <title> of the hub page */
  title: string;
  /** meta description of the hub page */
  description: string;
  /** one-sentence definition — the thing a machine should quote */
  definition: string;
  /** the concrete questions this topic answers (query fan-out) */
  covers: string[];
  emoji: string;
}

export const CLUSTERS: Cluster[] = [
  {
    id: "hourly-rate",
    href: "/learn/hourly-rate",
    label: "What an hour is worth",
    title: "What an Hour of Your Time Is Worth — the real hourly rate",
    description:
      "Convert salary into hourly, daily or per-second estimates, and understand when a 2,080-hour annualized divisor fits your paid schedule.",
    definition:
      "An hourly equivalent divides pay by hours measured on the same basis: scheduled paid hours for an annualized estimate, or recorded hours for an effective-rate comparison.",
    covers: [
      "how to convert an annual salary into an hourly rate",
      "when a 2,080-hour annualized estimate is appropriate",
      "how an unpaid lunch or a 45-hour week changes the number",
      "what your time is worth per day, per minute and per second",
    ],
    emoji: "⏱️",
  },
  {
    id: "paid-time",
    href: "/learn/paid-time",
    label: "What counts as paid time",
    title: "What Counts as Paid Time — breaks, overtime and shift work",
    description:
      "Which hours are actually paid: unpaid meal breaks, overtime multipliers, night-shift differentials, 12-hour shifts and rotas that cross midnight.",
    definition:
      "Paid time is determined by applicable law and the employment arrangement; required duties, breaks and workday travel must be assessed under those rules.",
    covers: [
      "whether lunch and rest breaks are paid",
      "how overtime is calculated and which hours qualify",
      "what night-shift differentials add to an hourly rate",
      "how many hours of a 12-hour shift are actually paid",
    ],
    emoji: "🧾",
  },
  {
    id: "pay-schedule",
    href: "/learn/pay-schedule",
    label: "When the money arrives",
    title: "When the Money Arrives — pay periods, paydays and first paychecks",
    description:
      "How pay cycles work, why biweekly and semi-monthly are not the same thing, and why a first paycheck is almost always smaller than expected.",
    definition:
      "A pay period is the window of work a paycheck covers, and a payday is when that money lands — the gap between the two is usually one to three weeks.",
    covers: [
      "how weekly, biweekly, semi-monthly and monthly pay cycles differ",
      "how many paychecks you get in a year on each cycle",
      "why a first paycheck is smaller than the salary suggests",
      "how to work out what you have earned but not yet been paid",
    ],
    emoji: "📅",
  },
];

export interface ToolRoute {
  href: string;
  /** short label for the header / footer */
  label: string;
  /** <title> (no brand suffix — layout template adds “· Salary Timer”) */
  title: string;
  /** meta description of the landing page */
  description: string;
  /** one-line pitch used in cross-links */
  blurb: string;
  emoji: string;
  /** the topic this page belongs to — drives hub links and sibling links */
  cluster: ClusterId;
  /** matching Learn article for bidirectional internal links */
  relatedLearnHref?: string;
}

/**
 * The long-tail matrix. Each entry is a real page with its own H1, copy,
 * FAQ and structured data — not a redirect to the homepage. That is what
 * makes these pages rank instead of competing with each other.
 */
export const TOOLS: ToolRoute[] = [
  {
    href: "/hourly-rate-calculator",
    label: "Hourly rate calculator",
    title: "Hourly Rate Calculator — real pay per hour",
    description:
      "Turn an annual or monthly salary into your real hourly rate, using the hours you actually work. Unpaid lunch, overtime and a 4-day week all change the number.",
    blurb: "Convert salary using your scheduled paid hours.",
    emoji: "🧮",
    cluster: "hourly-rate",
    relatedLearnHref: "/learn/hourly-rate-from-annual-salary",
  },
  {
    href: "/salary-per-second",
    label: "Salary per second",
    title: "Salary Per Second — live earn rate",
    description:
      "Work out your salary per second, per minute and per hour, then watch it tick up live. Uses your scheduled paid hours, with a live earnings counter.",
    blurb: "Convert hourly or annual pay into earnings per second.",
    emoji: "⏱️",
    cluster: "hourly-rate",
    relatedLearnHref: "/learn/hourly-rate-from-annual-salary",
  },
  {
    href: "/paycheck-countdown",
    label: "Paycheck countdown",
    title: "Paycheck Countdown — days until payday",
    description:
      "Count calendar days until your next monthly payday. Choose a pay date or month-end, and track estimated gross earnings alongside the countdown.",
    blurb: "Count calendar days until your next monthly payday.",
    emoji: "📅",
    cluster: "pay-schedule",
    relatedLearnHref: "/learn/how-pay-periods-work",
  },
  {
    href: "/shift-worker-salary-timer",
    label: "Shift worker timer",
    // Transactional intent — keep “timer” tool framing; Learn page uses guide framing.
    title: "Shift Worker Salary Timer — nights & rotas",
    description:
      "A salary timer built for shift work: overnight shifts that cross midnight, rotating rotas, unpaid breaks and night-shift overtime, all counted correctly.",
    blurb: "Built for nights, rotas and 12-hour shifts.",
    emoji: "🌙",
    cluster: "paid-time",
    relatedLearnHref: "/learn/salary-timer-for-shift-workers",
  },
  {
    href: "/overtime-pay-calculator",
    label: "Overtime calculator",
    title: "Overtime Pay Calculator — 1.5× & 2×",
    description:
      "See what an extra hour is actually worth before you agree to it. Set your overtime multiplier and watch the extra pay accumulate in real time.",
    blurb: "What that extra hour is really worth.",
    emoji: "🌇",
    cluster: "paid-time",
    relatedLearnHref: "/learn/how-overtime-is-calculated",
  },
];

export const NAV_LINKS = [
  { href: "/#timer", label: "Live timer" },
  { href: "/#features", label: "Features" },
  { href: "/#who", label: "Who it's for" },
  { href: "/#faq", label: "FAQ" },
  { href: "/learn", label: "Learn" },
];

/**
 * Informational articles under `/learn/*`.
 *
 * Kept separate from TOOLS on purpose: tools are utility landing pages that
 * stay at the root (`/hourly-rate-calculator`), while Learn is the content
 * cluster for long-tail questions. Articles link across to the matching tool.
 */
export interface LearnArticle {
  /** full path, e.g. "/learn/how-salary-timers-work" */
  href: string;
  /** footer + breadcrumb label */
  label: string;
  /** <title> / og:title */
  title: string;
  /** meta description */
  description: string;
  /** one-line pitch on the /learn index */
  blurb: string;
  /** the topic this article belongs to; omitted only for the entry article */
  cluster?: ClusterId;
  /** related tool href, if any — used for cross-links */
  relatedToolHref?: string;
}

export const LEARN: LearnArticle[] = [
  {
    href: "/learn/how-salary-timers-work",
    label: "How salary timers work",
    title: "How a Salary Timer Works — the live pay counter explained",
    description:
      "A salary timer turns your working hours into a live counter. Here's how the math works, what gets counted, and why watching money tick up changes how a shift feels.",
    blurb: "The idea, the math, and why the number moves.",
    relatedToolHref: "/",
  },
  {
    href: "/learn/hourly-rate-from-annual-salary",
    label: "Hourly rate from annual salary",
    title: "Hourly Rate from Annual Salary — formulas and paid-hour assumptions",
    description:
      "Convert gross annual salary into an annualized hourly estimate. See when 2,080 hours fits, how unpaid breaks are counted, and how effective and statutory rates differ.",
    blurb: "Choose an annual-hours divisor that matches your paid schedule.",
    cluster: "hourly-rate",
    relatedToolHref: "/hourly-rate-calculator",
  },
  {
    href: "/learn/2080-hours-in-a-year",
    label: "2,080 hours in a year",
    title: "2,080 Hours in a Year — where the number comes from, and who it fits",
    description:
      "2,080 is 40 paid hours × 52 weeks. Learn when that annualized divisor fits and how leave, part-time schedules and actual-hours comparisons differ.",
    blurb: "The default divisor, its arithmetic, and who it actually fits.",
    cluster: "hourly-rate",
    relatedToolHref: "/hourly-rate-calculator",
  },
  {
    href: "/learn/monthly-salary-to-hourly-rate",
    label: "Monthly salary to hourly rate",
    title: "Monthly Salary to Hourly Rate — the conversion without the guesswork",
    description:
      "Compare an annualized monthly-salary conversion with pay per hour for one specific month. Understand when the 173.33-hour monthly average is appropriate.",
    blurb: "Annualized monthly averages versus hours in a specific month.",
    cluster: "hourly-rate",
    relatedToolHref: "/hourly-rate-calculator",
  },
  {
    href: "/learn/are-lunch-breaks-paid",
    label: "Are lunch breaks paid?",
    title: "Are Lunch Breaks Paid? — unpaid time and your real rate",
    description:
      "Check when meal and rest breaks are paid under US federal and UK rules, then see how a genuinely unpaid lunch changes an annualized hourly estimate.",
    blurb: "Unpaid lunch, your real rate, and the pause that matters.",
    cluster: "paid-time",
    relatedToolHref: "/",
  },
  {
    href: "/learn/how-overtime-is-calculated",
    label: "How overtime is calculated",
    title: "How Overtime Is Calculated — the 1.5× rule, the base rate and the traps",
    description:
      "Overtime is a multiplier applied to a base rate, and both halves of that sentence are argued about more than they should be. Here is the arithmetic, plus the four places it goes wrong.",
    blurb: "The 1.5× rule, the base rate it multiplies, and the traps.",
    cluster: "paid-time",
    relatedToolHref: "/overtime-pay-calculator",
  },
  {
    href: "/learn/night-shift-pay",
    label: "Night shift pay",
    title: "Night Shift Pay — differentials, premiums and what nights are worth",
    description:
      "A night shift often pays more per hour than the same job by day. Here is how shift differentials work, what they are worth over a year, and why a flat hourly rate hides them.",
    blurb: "Differentials and premiums, and what nights are worth over a year.",
    cluster: "paid-time",
    relatedToolHref: "/shift-worker-salary-timer",
  },
  {
    href: "/learn/twelve-hour-shift-pay",
    label: "12-hour shift pay",
    title: "12-Hour Shift Pay — how many of those hours are actually paid",
    description:
      "Calculate paid hours in a 12-hour shift using genuinely unpaid breaks. Required handovers and travel during the workday may be compensable under applicable law.",
    blurb: "Handovers and breaks, and how many hours you are really paid for.",
    cluster: "paid-time",
    relatedToolHref: "/shift-worker-salary-timer",
  },
  {
    href: "/learn/salary-timer-for-shift-workers",
    label: "Salary timer for shift workers",
    // Informational intent — deliberately different from the tool page title.
    title: "Shift Work Guide — nights, rotas and cross-midnight pay",
    description:
      "Office-hour calculators break on night shifts. Learn how a salary timer should handle overnight work, rotating rotas, unpaid breaks and overtime for shift workers.",
    blurb: "Nights, rotas and 12-hour shifts explained.",
    cluster: "paid-time",
    relatedToolHref: "/shift-worker-salary-timer",
  },
  {
    href: "/learn/how-pay-periods-work",
    label: "How pay periods work",
    title: "How Pay Periods Work — weekly, biweekly, semi-monthly, monthly",
    description:
      "Four pay cycles, four different paycheck counts per year, and one common mistake: treating biweekly and semi-monthly as the same thing. They are not.",
    blurb: "Four cycles, four paycheck counts, one common mistake.",
    cluster: "pay-schedule",
    relatedToolHref: "/paycheck-countdown",
  },
  {
    href: "/learn/why-is-my-first-paycheck-smaller",
    label: "Why your first paycheck is smaller",
    title: "Why Your First Paycheck Is Smaller Than You Expected",
    description:
      "A first paycheck is usually short by a few days of work, then short again by tax and deductions. Here is exactly which part is missing and when it comes back.",
    blurb: "Which part is missing, and when it comes back.",
    cluster: "pay-schedule",
    relatedToolHref: "/paycheck-countdown",
  },
];

/** Look up a tool by its route so pages never repeat the copy. */
export function getTool(href: string): ToolRoute {
  const found = TOOLS.find((t) => t.href === href);
  if (!found) throw new Error(`Unknown tool route: ${href}`);
  return found;
}

/** Look up a Learn article by its route. */
export function getLearn(href: string): LearnArticle {
  const found = LEARN.find((a) => a.href === href);
  if (!found) throw new Error(`Unknown learn route: ${href}`);
  return found;
}

export function getCluster(id: ClusterId): Cluster {
  const found = CLUSTERS.find((c) => c.id === id);
  if (!found) throw new Error(`Unknown cluster: ${id}`);
  return found;
}

/** Every page belonging to one topic, tools first — used by hubs and /learn. */
export function clusterNodes(id: ClusterId): {
  tools: ToolRoute[];
  articles: LearnArticle[];
} {
  return {
    tools: TOOLS.filter((t) => t.cluster === id),
    articles: LEARN.filter((a) => a.cluster === id),
  };
}

/** The entry article, deliberately outside any cluster — it explains the whole idea. */
export function entryArticle(): LearnArticle | undefined {
  return LEARN.find((a) => a.cluster === undefined);
}
