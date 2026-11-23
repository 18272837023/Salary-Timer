import { LEGAL_UPDATED } from "./site";

// Actual content updates, never the build date.
export const CONTENT_UPDATES: Readonly<Record<string, string>> = {
  "/": "2026-11-23",
  "/zh": "2026-11-15",
  "/about": "2026-11-23",
  // Retired with the content cluster, then rebuilt as a standalone converter
  // and republished — so the date is the republication, not the first draft.
  "/hourly-rate-calculator": "2026-11-23",
  "/privacy": LEGAL_UPDATED,
  "/terms": LEGAL_UPDATED,
};

export function contentUpdated(href: string): string | undefined {
  return CONTENT_UPDATES[href.replace(/\/$/, "") || "/"];
}
