import { LEGAL_UPDATED } from "./site";

// Actual content updates, never the build date.
export const CONTENT_UPDATES: Readonly<Record<string, string>> = {
  "/": "2026-11-22",
  "/zh": "2026-11-15",
  "/about": "2026-11-22",
  "/privacy": LEGAL_UPDATED,
  "/terms": LEGAL_UPDATED,
};

export function contentUpdated(href: string): string | undefined {
  return CONTENT_UPDATES[href.replace(/\/$/, "") || "/"];
}
