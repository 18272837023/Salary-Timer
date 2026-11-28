import { LEGAL_UPDATED } from "./site";

// Actual content updates, never the build date.
export const CONTENT_UPDATES: Readonly<Record<string, string>> = {
  "/": "2026-11-27",
  "/zh": "2026-11-15",
  "/about": "2026-11-28",
  "/hourly-rate-calculator": "2026-11-28",
  "/hourly-to-annual-salary": "2026-11-28",
  "/pay-per-second-calculator": "2026-11-28",
  "/salary-stopwatch": "2026-11-28",
  "/time-card-calculator": "2026-11-28",
  "/payday-countdown": "2026-11-28",
  "/biweekly-pay-calculator": "2026-11-28",
  "/privacy": LEGAL_UPDATED,
  "/terms": LEGAL_UPDATED,
};

export function contentUpdated(href: string): string | undefined {
  return CONTENT_UPDATES[href.replace(/\/$/, "") || "/"];
}
