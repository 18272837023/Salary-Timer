import type { BreakWindow, ExtraIncome, Settings, WishItem } from "./types";

const KEY = "salarytimer.site.v2";
const LEGACY_KEY = "salarytimer.site.v1";

export const DEMO_SALARY_CENTS = 7_800_000; // $78,000

let uid = 0;
export function makeId(prefix = "i"): string {
  uid += 1;
  return `${prefix}${Date.now().toString(36)}${uid.toString(36)}`;
}

export function defaultSettings(): Settings {
  return {
    mode: "annual",
    amountCents: DEMO_SALARY_CENTS,
    currency: "USD",
    start: "09:00",
    end: "17:30",
    days: [1, 2, 3, 4, 5],
    breaks: [{ id: "b1", start: "12:30", end: "13:00" }],
    payday: 15,
    overtime: false,
    otMult: 1.5,
    privacy: false,
    jarGoalCents: 200_000, // $2,000
    jarRate: 10,
    extras: [],
    unpaidDays: 0,
    wishlist: [
      { id: "w1", name: "Noise-cancelling headphones", priceCents: 18_000, emoji: "🎧" },
      { id: "w2", name: "Concert ticket", priceCents: 12_000, emoji: "🎫" },
      { id: "w3", name: "Weekend away", priceCents: 52_000, emoji: "🏝️" },
    ],
    onboarded: false,
  };
}

export type StorageStatus =
  | { ok: true }
  | { ok: false; reason: "unavailable" | "quota" | "unknown" };

function getStorage(): Storage | null {
  try {
    if (typeof window === "undefined") return null;
    const probe = "__salarytimer_probe__";
    window.localStorage.setItem(probe, "1");
    window.localStorage.removeItem(probe);
    return window.localStorage;
  } catch {
    return null;
  }
}

/** True when the browser will actually keep data (false in Safari private mode). */
export function isStorageAvailable(): boolean {
  return getStorage() !== null;
}

/**
 * Persist settings.
 *
 * The prototype swallowed storage errors in an empty catch block, which meant a
 * Safari-private-mode visitor would fill in the whole form, read "Saved", and
 * lose everything on refresh with no warning. This returns a status the UI has
 * to acknowledge.
 */
export function saveSettings(settings: Settings): StorageStatus {
  const store = getStorage();
  if (!store) return { ok: false, reason: "unavailable" };
  try {
    store.setItem(KEY, JSON.stringify(settings));
    return { ok: true };
  } catch (err) {
    const name = err instanceof Error ? err.name : "";
    return { ok: false, reason: name === "QuotaExceededError" ? "quota" : "unknown" };
  }
}

function toBreak(raw: unknown, index: number): BreakWindow | null {
  if (!raw || typeof raw !== "object") return null;
  const b = raw as Partial<BreakWindow>;
  if (typeof b.start !== "string" || typeof b.end !== "string") return null;
  return { id: typeof b.id === "string" ? b.id : `b${index}`, start: b.start, end: b.end };
}

function num(v: unknown, fallback: number): number {
  const n = typeof v === "string" ? Number.parseFloat(v) : Number(v);
  return Number.isFinite(n) ? n : fallback;
}

/** Merge unknown stored JSON onto the defaults, discarding anything malformed. */
export function normalize(raw: unknown): Settings | null {
  if (!raw || typeof raw !== "object") return null;
  const input = raw as Record<string, unknown>;
  const base = defaultSettings();

  const mode = input.mode;
  const currency = input.currency;
  const days = Array.isArray(input.days)
    ? input.days.map((d) => Number(d)).filter((d) => Number.isInteger(d) && d >= 0 && d <= 6)
    : base.days;

  const breaks = Array.isArray(input.breaks)
    ? input.breaks.map(toBreak).filter((b): b is BreakWindow => b !== null)
    : base.breaks;

  const extras: ExtraIncome[] = Array.isArray(input.extras)
    ? (input.extras as Record<string, unknown>[])
        .filter((e) => e && typeof e === "object")
        .map((e, i) => ({
          id: typeof e.id === "string" ? e.id : makeId("e"),
          label: typeof e.label === "string" ? e.label : `Extra ${i + 1}`,
          amountCents: Math.round(num(e.amountCents, 0)),
          ts: num(e.ts, Date.now()),
        }))
        .filter((e) => e.amountCents !== 0)
    : [];

  const wishlist: WishItem[] = Array.isArray(input.wishlist)
    ? (input.wishlist as Record<string, unknown>[])
        .filter((w) => w && typeof w === "object")
        .map((w, i) => ({
          id: typeof w.id === "string" ? w.id : makeId("w"),
          name: typeof w.name === "string" ? w.name.slice(0, 60) : `Item ${i + 1}`,
          priceCents: Math.max(0, Math.round(num(w.priceCents, 0))),
          emoji: typeof w.emoji === "string" && w.emoji ? w.emoji : "🎁",
        }))
        .filter((w) => w.name.trim().length > 0)
    : base.wishlist;

  return {
    mode: mode === "monthly" || mode === "hourly" || mode === "annual" ? mode : base.mode,
    amountCents: Math.max(0, Math.round(num(input.amountCents, base.amountCents))),
    currency: (typeof currency === "string" ? currency : base.currency) as Settings["currency"],
    start: typeof input.start === "string" ? input.start : base.start,
    end: typeof input.end === "string" ? input.end : base.end,
    days: days.length ? days : base.days,
    breaks,
    payday:
      input.payday === "last"
        ? "last"
        : Math.min(31, Math.max(1, Math.round(num(input.payday, 15)))),
    overtime: input.overtime === true,
    otMult: Math.min(3, Math.max(1, num(input.otMult, 1.5))),
    privacy: input.privacy === true,
    jarGoalCents: Math.max(0, Math.round(num(input.jarGoalCents, base.jarGoalCents))),
    jarRate: Math.min(100, Math.max(0, num(input.jarRate, 10))),
    extras,
    unpaidDays: Math.min(31, Math.max(0, Math.round(num(input.unpaidDays, 0)))),
    wishlist,
    onboarded: input.onboarded === true,
  };
}

/** Read settings from the prototype's v1 format (dollars, no ids) and upgrade. */
function migrateV1(raw: unknown): Settings | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const breaks = Array.isArray(o.breaks)
    ? o.breaks.map((b, i) => {
        const item = b as { start?: string; end?: string };
        return {
          id: `b${i}`,
          start: typeof item.start === "string" ? item.start : "12:30",
          end: typeof item.end === "string" ? item.end : "13:00",
        };
      })
    : undefined;

  return normalize({
    ...o,
    amountCents: Math.round(num(o.amount, 0) * 100),
    jarGoalCents: Math.round(num(o.jarGoal, 2000) * 100),
    breaks,
    extras: Array.isArray(o.extras)
      ? (o.extras as Record<string, unknown>[]).map((e, i) => ({
          id: typeof e.id === "string" ? e.id : `e${i}`,
          label: typeof e.label === "string" ? e.label : "Extra",
          amountCents: Math.round(num(e.amount, 0) * 100),
          ts: num(e.ts, Date.now()),
        }))
      : [],
    wishlist: Array.isArray(o.wishlist)
      ? (o.wishlist as Record<string, unknown>[]).map((w, i) => ({
          id: typeof w.id === "string" ? w.id : `w${i}`,
          name: typeof w.name === "string" ? w.name : "Item",
          priceCents: Math.round(num(w.price, 0) * 100),
          emoji: typeof w.emoji === "string" ? w.emoji : "🎁",
        }))
      : undefined,
    onboarded: true,
  });
}

/** Returns null when there is nothing stored (first visit). */
export function loadSettings(): Settings | null {
  const store = getStorage();
  if (!store) return null;

  try {
    const current = store.getItem(KEY);
    if (current) return normalize(JSON.parse(current));
  } catch {
    /* corrupt payload — fall through to a fresh start */
  }

  try {
    const legacy = store.getItem(LEGACY_KEY);
    if (legacy) {
      const migrated = migrateV1(JSON.parse(legacy));
      if (migrated) {
        saveSettings(migrated);
        return migrated;
      }
    }
  } catch {
    /* ignore */
  }

  return null;
}

export function clearSettings(): void {
  const store = getStorage();
  if (!store) return;
  try {
    store.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

export { KEY as STORAGE_KEY };
