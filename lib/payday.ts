/**
 * Payday arithmetic for `/payday-countdown`.
 *
 * Pure date functions, no React and no `Date.now()` inside: "today" is always
 * passed in, so the same inputs always produce the same countdown and the
 * component can stay a thin shell around them.
 *
 * Everything works on local calendar days at midnight. Subtracting two
 * midnights and rounding handles the 23- and 25-hour days that daylight saving
 * inserts twice a year — dividing by 86,400,000 without rounding would be off
 * by one day twice a year, which for a countdown is the only day that matters.
 */

export type PayCycle = "weekly" | "biweekly" | "semimonthly" | "monthly";

export interface PayCycleMeta {
  id: PayCycle;
  label: string;
  /** Paydays in a calendar year. The number this page is quietly about. */
  perYear: number;
  hint: string;
}

export const PAY_CYCLES: PayCycleMeta[] = [
  { id: "weekly", label: "Weekly", perYear: 52, hint: "every 7 days" },
  { id: "biweekly", label: "Every two weeks", perYear: 26, hint: "every 14 days" },
  { id: "semimonthly", label: "Twice a month", perYear: 24, hint: "the 15th and month end" },
  { id: "monthly", label: "Monthly", perYear: 12, hint: "same date every month" },
];

const DAY_MS = 86_400_000;

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

/** Add whole months from the original date, clamping to the shorter month
 *  instead of overflowing: 31 January + 1 month is 28 February, not 3 March. */
export function addMonthsClamped(date: Date, months: number): Date {
  const year = date.getFullYear();
  const month = date.getMonth() + months;
  const lastDay = new Date(year, month + 1, 0).getDate();
  return new Date(year, month, Math.min(date.getDate(), lastDay));
}

export function daysBetween(from: Date, to: Date): number {
  return Math.round((startOfDay(to).getTime() - startOfDay(from).getTime()) / DAY_MS);
}

export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

/** The Friday before a weekend payday. Payroll moves a date earlier, never
 *  later, because the money has to be in the account by the stated date. */
export function beforeWeekend(date: Date): Date {
  if (date.getDay() === 6) return addDays(date, -1);
  if (date.getDay() === 0) return addDays(date, -2);
  return date;
}

/** Parse `<input type="date">` value ("2026-12-04") as a local midnight date. */
export function parseDateInput(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  if (Number.isNaN(date.getTime())) return null;
  // Reject the dates the browser normalises away, e.g. 2026-02-31.
  if (date.getMonth() !== Number(match[2]) - 1 || date.getDate() !== Number(match[3])) return null;
  return date;
}

export function toDateInput(date: Date): string {
  const pad = (n: number) => (n < 10 ? `0${n}` : String(n));
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/**
 * Which two dates "twice a month" means, decided by the anchor the visitor
 * chose: a payday on or before the 15th implies the 1st-and-15th convention, a
 * later one implies the 15th-and-last-day convention. Both are common, and
 * inferring beats asking a second question — the card states which pattern it
 * picked, so a wrong inference is visible instead of silent.
 */
export function semimonthlyPattern(anchor: Date): "1st and 15th" | "15th and last day" {
  return anchor.getDate() <= 15 ? "1st and 15th" : "15th and last day";
}

function semimonthlyDays(pattern: "1st and 15th" | "15th and last day", year: number, month: number): Date[] {
  return pattern === "1st and 15th"
    ? [new Date(year, month, 1), new Date(year, month, 15)]
    : [new Date(year, month, 15), new Date(year, month + 1, 0)];
}

/**
 * The next `count` paydays on or after `from`, with the weekend rule applied
 * after the dates are generated and before they are filtered — a payday moved
 * back to Friday may fall before today, in which case the next one is the
 * answer, not a date in the past.
 */
export function upcomingPaydays({
  anchor,
  cycle,
  from,
  count = 3,
  moveWeekend = false,
}: {
  anchor: Date;
  cycle: PayCycle;
  from: Date;
  count?: number;
  moveWeekend?: boolean;
}): Date[] {
  const raw: Date[] = [];
  const horizon = count + 4;
  const today = startOfDay(from);

  if (cycle === "weekly" || cycle === "biweekly") {
    const step = cycle === "weekly" ? 7 : 14;
    // Skip whole periods already behind us, then generate a horizon's worth.
    // One extra period is generated because a weekend payday shifted back to
    // Friday can land before today, and the next one is then the answer.
    const behind = Math.floor(daysBetween(anchor, today) / step);
    const first = Math.max(0, behind - 1);
    for (let i = first; i < first + horizon; i += 1) raw.push(addDays(anchor, i * step));
  } else if (cycle === "monthly") {
    const monthsBehind =
      (today.getFullYear() - anchor.getFullYear()) * 12 + (today.getMonth() - anchor.getMonth());
    const first = Math.max(0, monthsBehind - 1);
    for (let i = first; i < first + horizon; i += 1) raw.push(addMonthsClamped(anchor, i));
  } else {
    const pattern = semimonthlyPattern(anchor);
    const start = anchor > today ? anchor : today;
    const startMonth = new Date(start.getFullYear(), start.getMonth() - 1, 1);
    let year = startMonth.getFullYear();
    let month = startMonth.getMonth();
    for (let guard = 0; guard < 14 && raw.length < horizon; guard += 1) {
      raw.push(...semimonthlyDays(pattern, year, month));
      month += 1;
      if (month > 11) {
        month = 0;
        year += 1;
      }
    }
  }

  const floor = today.getTime();
  const seen = new Set<number>();
  return raw
    .filter((date) => daysBetween(anchor, date) >= 0)
    .map((date) => (moveWeekend ? beforeWeekend(date) : date))
    .filter((date) => {
      const time = startOfDay(date).getTime();
      if (seen.has(time) || time < floor) return false;
      seen.add(time);
      return true;
    })
    .sort((a, b) => a.getTime() - b.getTime())
    .slice(0, count);
}

/** "1 week and 5 days", "12 days", "Payday today". */
export function describeWait(days: number): string {
  if (days <= 0) return "Payday today";
  if (days === 1) return "Tomorrow";
  if (days < 7) return `${days} days`;
  const weeks = Math.floor(days / 7);
  const rest = days % 7;
  const weekPart = weeks === 1 ? "1 week" : `${weeks} weeks`;
  if (rest === 0) return weekPart;
  return `${weekPart} and ${rest} ${rest === 1 ? "day" : "days"}`;
}

/**
 * Weekdays between `from` (exclusive) and `to` (inclusive).
 *
 * The number people actually feel: 18 calendar days is usually 12 or 13 days at
 * work, and the difference between those two is the weekend you get to skip.
 * Public holidays are deliberately not subtracted — the page states that the
 * only calendar rule it models is the weekend.
 */
export function workingDaysBetween(from: Date, to: Date): number {
  const end = startOfDay(to).getTime();
  let count = 0;
  for (let day = addDays(from, 1); day.getTime() <= end; day = addDays(day, 1)) {
    if (!isWeekend(day)) count += 1;
  }
  return count;
}
