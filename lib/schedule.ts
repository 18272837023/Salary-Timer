import type {
  Derived,
  PeriodBases,
  Settings,
  Snapshot,
  ShiftStatus,
} from "./types";

const MINUTES_PER_DAY = 1440;
const WEEKS_PER_YEAR = 52;

export function pad2(n: number): string {
  return (n < 10 ? "0" : "") + n;
}

/** "09:30" → 570. Tolerates garbage input by falling back to 0. */
export function toMinutes(hhmm: string | undefined): number {
  if (!hhmm) return 0;
  const [h, m] = String(hhmm).split(":");
  return (Number.parseInt(h, 10) || 0) * 60 + (Number.parseInt(m, 10) || 0);
}

/** 570 → "09:30" */
export function toHHMM(minutes: number): string {
  const m = ((Math.round(minutes) % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  return pad2(Math.floor(m / 60)) + ":" + pad2(m % 60);
}

export function dateKey(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/** 95 → "1h 35m" */
export function formatHM(minutes: number): string {
  const m = Math.max(0, Math.floor(minutes));
  return `${Math.floor(m / 60)}h ${pad2(m % 60)}m`;
}

/** 3725 → "01:02:05" */
export function formatClock(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  return `${pad2(Math.floor(s / 3600))}:${pad2(Math.floor((s % 3600) / 60))}:${pad2(s % 60)}`;
}

/**
 * Turn raw settings into the numbers the UI needs: how long a shift is, how
 * much of it is paid, and what the hourly rate actually is once you account
 * for the real schedule (not the 2,080-hour fiction).
 */
export function derive(settings: Settings): Derived {
  const startMin = toMinutes(settings.start);
  const endMin = toMinutes(settings.end);

  let windowMin = endMin - startMin;
  if (windowMin <= 0) windowMin += MINUTES_PER_DAY;

  let breakMin = 0;
  for (const b of settings.breaks) {
    let b1 = toMinutes(b.start);
    let b2 = toMinutes(b.end);
    if (b2 <= b1) b2 += MINUTES_PER_DAY;
    breakMin += Math.max(0, Math.min(b2, startMin + windowMin) - Math.max(b1, startMin));
  }
  // A shift cannot be entirely break time.
  breakMin = Math.min(breakMin, windowMin - 5);

  const paidMin = Math.max(1, windowMin - breakMin);
  const dayCount = settings.days.length || 5;
  const weeklyHours = (paidMin / 60) * dayCount;
  const annualHours = weeklyHours * WEEKS_PER_YEAR;

  let hourlyCents: number;
  if (settings.mode === "hourly") {
    hourlyCents = settings.amountCents;
  } else if (settings.mode === "monthly") {
    hourlyCents = annualHours > 0 ? (settings.amountCents * 12) / annualHours : 0;
  } else {
    hourlyCents = annualHours > 0 ? settings.amountCents / annualHours : 0;
  }

  return {
    startMin,
    endMin,
    windowMin,
    breakMin,
    paidMin,
    dayCount,
    weeklyHours,
    annualHours,
    hourlyCents,
    dailyCents: (hourlyCents * paidMin) / 60,
    perMinuteCents: hourlyCents / 60,
    perSecondCents: hourlyCents / 3600,
  };
}

export function isWorkday(date: Date, days: number[]): boolean {
  return days.includes(date.getDay());
}

/**
 * Breaks that fall inside today's shift, expressed on the shift's own timeline
 * so an overnight shift (22:00 → 06:00) keeps its 02:00 break in the right place.
 */
export function breaksToday(settings: Settings): { start: number; end: number }[] {
  const { startMin, windowMin } = derive(settings);
  return settings.breaks
    .map((b) => {
      let b1 = toMinutes(b.start);
      let b2 = toMinutes(b.end);
      if (b2 <= b1) b2 += MINUTES_PER_DAY;
      if (b1 < startMin) b1 += MINUTES_PER_DAY;
      if (b2 < b1) b2 += MINUTES_PER_DAY;
      return { start: b1, end: b2 };
    })
    .filter((b) => b.end > startMin && b.start < startMin + windowMin)
    .sort((a, b) => a.start - b.start);
}

export interface ComputeOptions {
  /** Preview mode: start the clock 62% of the way through the shift. */
  demo?: boolean;
  /**
   * Epoch ms the demo preview started. The demo clock advances from there, so
   * the counter visibly ticks instead of freezing at a fixed point — the demo
   * bar promises "the clock is running", and it should be telling the truth.
   */
  demoStartMs?: number;
}

/**
 * The core calculation: where are we in the shift, and what has that earned?
 *
 * `earnedCents` is rounded once, at the very end, from an exact
 * minutes × cents-per-minute product. Nothing accumulates as a float.
 */
export function compute(
  settings: Settings,
  now: Date,
  options: ComputeOptions = {},
): Snapshot {
  const derived = derive(settings);
  const { startMin, windowMin, paidMin } = derived;
  const overnight = derived.endMin <= derived.startMin;
  const shiftEndMin = startMin + windowMin;

  const realMin =
    now.getHours() * 60 +
    now.getMinutes() +
    now.getSeconds() / 60 +
    now.getMilliseconds() / 60000;

  const demo = Boolean(options.demo);
  const demoStartMs = options.demoStartMs ?? now.getTime();
  const nowMin = demo
    ? startMin + windowMin * 0.62 + Math.max(0, (now.getTime() - demoStartMs) / 60000)
    : realMin;
  const shiftMin = overnight && nowMin < derived.endMin ? nowMin + MINUTES_PER_DAY : nowMin;
  const workday = demo ? true : isWorkday(now, settings.days);

  let status: ShiftStatus = "dayoff";
  let paidElapsedMin = 0;
  let overtimeMin = 0;
  let onBreak = false;

  if (!workday) {
    status = "dayoff";
  } else if (shiftMin < startMin) {
    // For overnight shifts the gap between end and start is ambiguous:
    // 06:30 could mean "just finished" or "not started yet".  Treat it as
    // done so a night-shift worker doesn't see "Shift hasn't started"
    // immediately after clocking out.
    status = overnight ? (settings.overtime ? "overtime" : "done") : "before";
  } else if (shiftMin <= shiftEndMin) {
    const breaks = breaksToday(settings);
    let elapsed = shiftMin - startMin;
    for (const b of breaks) {
      elapsed -= Math.max(0, Math.min(shiftMin, b.end) - Math.max(startMin, b.start));
    }
    paidElapsedMin = Math.max(0, Math.min(elapsed, paidMin));
    onBreak = breaks.some((b) => shiftMin >= b.start && shiftMin < b.end);
    status = onBreak ? "break" : "working";
  } else {
    paidElapsedMin = paidMin;
    if (settings.overtime) {
      overtimeMin = shiftMin - shiftEndMin;
      status = "overtime";
    } else {
      status = "done";
    }
  }

  // Manual adjustment for today. People know their real overtime better than
  // the schedule does — a shift that ran long, a late finish, or a day the
  // clock was never started. The clock still wins once it has counted more than
  // the typed value, so the number can never freeze below reality.
  const manual = settings.otOverride;
  if (settings.overtime && manual && manual.day === dateKey(now) && manual.min > overtimeMin) {
    overtimeMin = manual.min;
  }

  const earnedCents = Math.round(
    (paidElapsedMin / 60) * derived.hourlyCents +
      (overtimeMin / 60) * derived.hourlyCents * (settings.otMult || 1.5),
  );

  return {
    derived,
    status,
    paidElapsedMin,
    overtimeMin,
    earnedCents,
    progress: Math.max(0, Math.min(1, paidElapsedMin / paidMin)),
    nowMin,
    shiftMin,
    shiftEndMin,
    overnight,
    onBreak,
    shiftStartMin: startMin,
  };
}

/**
 * Everything earned before today, this month and this year. Recomputed only
 * when the schedule changes or the date rolls over.
 */
export function periodBases(settings: Settings, now: Date): PeriodBases {
  const derived = derive(settings);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  let monthBeforeCents = 0;
  let monthDays = 0;
  let monthTotalDays = 0;
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  for (let i = 1; i <= daysInMonth; i++) {
    const dt = new Date(now.getFullYear(), now.getMonth(), i);
    if (!isWorkday(dt, settings.days)) continue;
    monthTotalDays++;
    if (dt < today) {
      monthBeforeCents += derived.dailyCents;
      monthDays++;
    }
  }

  let yearBeforeCents = 0;
  let yearDays = 0;
  const jan1 = new Date(now.getFullYear(), 0, 1);
  for (let k = 0; k < 366; k++) {
    const dy = new Date(jan1.getFullYear(), jan1.getMonth(), jan1.getDate() + k);
    if (dy.getFullYear() !== now.getFullYear()) break;
    if (dy >= today) continue;
    if (isWorkday(dy, settings.days)) {
      yearBeforeCents += derived.dailyCents;
      yearDays++;
    }
  }

  return {
    monthBeforeCents,
    monthDays,
    monthTotalDays,
    yearBeforeCents,
    yearDays,
  };
}

export function extrasThisMonth(settings: Settings, now: Date): number {
  return settings.extras
    .filter((e) => {
      const dt = new Date(e.ts);
      return dt.getMonth() === now.getMonth() && dt.getFullYear() === now.getFullYear();
    })
    .reduce((sum, e) => sum + (Number(e.amountCents) || 0), 0);
}

export function nextPayday(settings: Settings, now: Date): Date {
  const daysInThisMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const wanted =
    settings.payday === "last" ? daysInThisMonth : Number(settings.payday) || 1;

  const thisMonth = new Date(
    now.getFullYear(),
    now.getMonth(),
    Math.min(wanted, daysInThisMonth),
  );
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (thisMonth >= today) return thisMonth;

  const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const daysInNext = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
  return new Date(next.getFullYear(), next.getMonth(), Math.min(wanted, daysInNext));
}

export function daysUntilPayday(settings: Settings, now: Date): number {
  const target = nextPayday(settings, now);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.max(0, Math.round((target.getTime() - today.getTime()) / 86400000));
}

export function nextShiftLabel(settings: Settings, now: Date): string {
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  for (let i = 0; i < 8; i++) {
    const dt = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
    if (!isWorkday(dt, settings.days)) continue;
    if (i === 0) {
      if (nowMinutes < toMinutes(settings.start)) return `Today ${settings.start}`;
      continue;
    }
    const name =
      i === 1 ? "Tomorrow" : dt.toLocaleDateString("en-US", { weekday: "long" });
    return `${name} ${settings.start}`;
  }
  return "—";
}
