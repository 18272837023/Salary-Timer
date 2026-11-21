import { GA_MEASUREMENT_ID } from "./site";

export type Feature = "settings" | "privacy" | "settlement" | "slack" | "desktop_timer"
  | "monthly_income" | "extra_income" | "unpaid_days" | "work_schedule" | "unpaid_breaks"
  | "payday" | "overtime" | "language";
type Action = "open" | "close" | "save" | "update" | "add" | "enable" | "disable"
  | "start" | "stop" | "focus" | "return" | "open_failed" | "available" | "unavailable";
export type EntryPoint = "inline_setup" | "settings_panel" | "quickstart"
  | "dashboard" | "desktop" | "restored" | "header";
type EventName = "setup_view" | "setup_start" | "setup_complete" | "quickstart_shown"
  | "timer_view" | "timer_engaged" | "feature_use" | "feature_availability"
  | "milestone" | "settle_open" | "slack_toggle";

// Allowlisted structural parameters keep pay amounts and form values out of events.
interface EventParams {
  feature?: Feature;
  action?: Action;
  entry_point?: EntryPoint;
  mode?: "annual" | "monthly" | "daily" | "hourly";
  storage_result?: "saved" | "unavailable";
  n?: number;
  on?: boolean;
}

type GtagFn = (command: string, ...args: unknown[]) => void;

function gtag(): GtagFn | undefined {
  if (typeof window === "undefined") return undefined;
  const fn = (window as unknown as { gtag?: GtagFn }).gtag;
  return typeof fn === "function" ? fn : undefined;
}

export function track(event: EventName, params: EventParams = {}): boolean {
  try {
    if (process.env.NODE_ENV !== "production" || !GA_MEASUREMENT_ID) return false;
    const fn = gtag();
    if (!fn) return false;
    fn("event", event, { ...params, send_to: GA_MEASUREMENT_ID });
    return true;
  } catch {
    // A blocked or unavailable analytics tag must not interrupt the timer.
    return false;
  }
}

export function trackFeature(feature: Feature, action: Action, entry_point: EntryPoint = "dashboard"): void {
  track("feature_use", { feature, action, entry_point });
}

const fired = new Set<string>();

/** Fire at most once per page load. For events that describe the visit, not a click. */
export function trackOnce(event: EventName, params: EventParams = {}): void {
  if (fired.has(event)) return;
  if (track(event, params)) fired.add(event);
}
