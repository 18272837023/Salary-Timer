import { LEGAL_UPDATED, type ClusterId } from "./site";

// Actual content changes, maintained explicitly. Never replace these with build time.
// Shared calculation/source notes were added to the listed guides on this date.
export const CONTENT_UPDATES: Readonly<Record<string, string>> = {
  "/": "2026-11-14",
  "/zh": "2026-11-14",
  "/hourly-rate-calculator": "2026-11-12",
  "/salary-per-second": "2026-11-14",
  "/paycheck-countdown": "2026-11-14",
  "/shift-worker-salary-timer": "2026-11-12",
  "/overtime-pay-calculator": "2026-11-12",
  "/learn/hourly-rate": "2026-11-12",
  "/learn/paid-time": "2026-11-12",
  "/learn/pay-schedule": "2026-11-12",
  "/learn/how-salary-timers-work": "2026-11-12",
  "/learn/hourly-rate-from-annual-salary": "2026-11-12",
  "/learn/2080-hours-in-a-year": "2026-11-12",
  "/learn/monthly-salary-to-hourly-rate": "2026-11-12",
  "/learn/are-lunch-breaks-paid": "2026-11-12",
  "/learn/how-overtime-is-calculated": "2026-11-12",
  "/learn/night-shift-pay": "2026-11-12",
  "/learn/twelve-hour-shift-pay": "2026-11-12",
  "/learn/salary-timer-for-shift-workers": "2026-11-12",
  "/learn/how-pay-periods-work": "2026-11-12",
  "/learn/why-is-my-first-paycheck-smaller": "2026-11-12",
  "/privacy": LEGAL_UPDATED,
  "/terms": LEGAL_UPDATED,
};

export function contentUpdated(href: string): string | undefined {
  return CONTENT_UPDATES[href.replace(/\/$/, "") || "/"];
}

export const SOURCES = {
  calculation: {
    label: "Salary Timer calculation implementation (product source code)",
    url: "https://github.com/18272837023/Salary-Timer/blob/main/lib/schedule.ts",
  },
  hours: {
    label: "US Department of Labor — Fact Sheet #22: hours worked under the FLSA",
    url: "https://www.dol.gov/agencies/whd/fact-sheets/22-flsa-hours-worked",
  },
  overtime: {
    label: "US Department of Labor — Fact Sheet #23: federal overtime requirements",
    url: "https://www.dol.gov/agencies/whd/fact-sheets/23-flsa-overtime-pay",
  },
  ukBreaks: {
    label: "GOV.UK — rest breaks at work and whether they are paid",
    url: "https://www.gov.uk/rest-breaks-work",
  },
  ukOvertime: {
    label: "GOV.UK — overtime pay and contractual rights",
    url: "https://www.gov.uk/overtime-your-rights",
  },
  night: {
    label: "US Department of Labor — FLSA questions, including night and weekend premiums",
    url: "https://www.dol.gov/agencies/whd/flsa/faq",
  },
};

export function sourcesFor(cluster?: ClusterId) {
  return cluster === "paid-time"
    ? [SOURCES.hours, SOURCES.overtime, SOURCES.ukBreaks, SOURCES.ukOvertime, SOURCES.night, SOURCES.calculation]
    : [SOURCES.calculation];
}
