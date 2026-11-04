/**
 * GA4 event helper.
 *
 * The site only ever sent `page_view` (see `RouteAnalytics`), which means every
 * question worth asking — did they finish setup? did they add a wish? how long
 * did they actually stay? — was unanswerable. These are the five events that
 * make the funnel visible.
 *
 * Two rules:
 *  1. Never throw. Analytics must not be able to break the clock: gtag may not
 *     be loaded yet (blocked by an ad blocker, offline, still downloading), and
 *     the counter re-renders ten times a second.
 *  2. Never send money. Salary figures stay in localStorage; events carry
 *     structural facts only (mode, day count, hours), never amounts.
 */

type EventParams = Record<string, string | number | boolean>;

type GtagFn = (command: string, ...args: unknown[]) => void;

function gtag(): GtagFn | undefined {
  if (typeof window === "undefined") return undefined;
  const fn = (window as unknown as { gtag?: GtagFn }).gtag;
  return typeof fn === "function" ? fn : undefined;
}

export function track(event: string, params: EventParams = {}): void {
  const fn = gtag();
  if (!fn) return;
  try {
    fn("event", event, params);
  } catch {
    /* ignore — see rule 1 */
  }
}

const fired = new Set<string>();

/** Fire at most once per page load. For events that describe the visit, not a click. */
export function trackOnce(event: string, params: EventParams = {}): void {
  if (fired.has(event)) return;
  fired.add(event);
  track(event, params);
}
