/**
 * Shared domain types.
 *
 * Money is stored as **integer cents** everywhere in this app. That is the
 * single most important convention in the codebase: never store or accumulate
 * a currency amount as a float. Floats lose a cent roughly half the time when
 * you slice the decimal part off a running total (0.1 + 0.2 !== 0.3), which is
 * exactly the bug that made the first prototype display the wrong cent digit.
 */

export type PayMode = "annual" | "monthly" | "hourly";

export type CurrencyCode =
  | "USD"
  | "EUR"
  | "GBP"
  | "CAD"
  | "AUD"
  | "JPY"
  | "INR"
  | "SGD"
  | "BRL"
  | "MXN";

export interface BreakWindow {
  id: string;
  /** "HH:MM" 24h */
  start: string;
  /** "HH:MM" 24h, may be earlier than start for overnight breaks */
  end: string;
}

export interface ExtraIncome {
  id: string;
  label: string;
  amountCents: number;
  /** epoch ms */
  ts: number;
}

export interface WishItem {
  id: string;
  name: string;
  priceCents: number;
  emoji: string;
  /**
   * True when the visitor chose the emoji by hand. Without it the emoji is
   * re-derived from the name, which is how items saved under the old random
   * assignment get repaired.
   */
  emojiPicked?: boolean;
}

export interface Settings {
  mode: PayMode;
  /** annual / monthly salary or hourly rate, in integer cents */
  amountCents: number;
  currency: CurrencyCode;
  /** "HH:MM" */
  start: string;
  /** "HH:MM" */
  end: string;
  /** 0 = Sunday … 6 = Saturday */
  days: number[];
  breaks: BreakWindow[];
  /** 1–31, or "last" */
  payday: number | "last";
  overtime: boolean;
  otMult: number;
  /**
   * Manual overtime for one specific day ("YYYY-MM-DD"), in minutes. Lets the
   * visitor record overtime the clock could not see. The live counter still
   * takes over once it has counted more than this.
   */
  otOverride?: { day: string; min: number };
  privacy: boolean;
  jarGoalCents: number;
  /** percent of earnings routed to the jar */
  jarRate: number;
  extras: ExtraIncome[];
  unpaidDays: number;
  wishlist: WishItem[];
  /** false until the visitor saves their own numbers — drives demo mode */
  onboarded: boolean;
  /**
   * Schema version of the persisted payload. Absent on payloads written before
   * the overtime-default fix, which is how `normalize()` knows to run the
   * one-time migration that turns the inherited `overtime: true` back off.
   */
  v?: number;
}

export type ShiftStatus =
  | "working"
  | "break"
  | "overtime"
  | "before"
  | "done"
  | "dayoff";

export interface Derived {
  startMin: number;
  endMin: number;
  /** total minutes from start to end, wrapping past midnight */
  windowMin: number;
  breakMin: number;
  paidMin: number;
  dayCount: number;
  weeklyHours: number;
  annualHours: number;
  /** fractional cents per hour — rounded only at display time */
  hourlyCents: number;
  dailyCents: number;
  perMinuteCents: number;
  perSecondCents: number;
}

export interface Snapshot {
  derived: Derived;
  status: ShiftStatus;
  paidElapsedMin: number;
  overtimeMin: number;
  earnedCents: number;
  /** 0–1 */
  progress: number;
  /** minutes since midnight, fractional */
  nowMin: number;
  /** minutes since shift start, may exceed 1440 for overnight shifts */
  shiftMin: number;
  shiftEndMin: number;
  overnight: boolean;
  onBreak: boolean;
  shiftStartMin: number;
}

export interface PeriodBases {
  monthBeforeCents: number;
  monthDays: number;
  monthTotalDays: number;
  yearBeforeCents: number;
  yearDays: number;
}
