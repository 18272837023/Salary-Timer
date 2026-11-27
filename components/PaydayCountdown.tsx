"use client";

import { useEffect, useState } from "react";
import {
  PAY_CYCLES,
  daysBetween,
  describeWait,
  parseDateInput,
  semimonthlyPattern,
  startOfDay,
  toDateInput,
  upcomingPaydays,
  workingDaysBetween,
  type PayCycle,
} from "@/lib/payday";

/**
 * The payday countdown for `/payday-countdown`.
 *
 * A date card, not a money card. The planning rule for this page is that it
 * leads with the countdown rather than with a wage figure, so there is no
 * earnings number anywhere in here — the homepage already owns that question
 * and this page would only dilute it.
 *
 * "Today" is read on mount rather than at build time: the site is a static
 * export, and a countdown baked at build time would be wrong the day after the
 * deploy. The server renders the same skeleton the first client render does
 * (empty date, a dash), so hydration stays quiet and the layout does not jump
 * when the real number arrives.
 */

const LONG_DATE = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric",
});

const SHORT_DATE = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });

/** The next 15th on or after `day` — a recognisable payday to start from. */
function nextFifteenth(day: Date): Date {
  const thisMonth = new Date(day.getFullYear(), day.getMonth(), 15);
  return thisMonth >= day ? thisMonth : new Date(day.getFullYear(), day.getMonth() + 1, 15);
}

export function PaydayCountdown() {
  const [cycle, setCycle] = useState<PayCycle>("monthly");
  const [anchorValue, setAnchorValue] = useState("");
  const [moveWeekend, setMoveWeekend] = useState(true);
  const [today, setToday] = useState<Date | null>(null);

  useEffect(() => {
    const now = startOfDay(new Date());
    setToday(now);
    setAnchorValue(toDateInput(nextFifteenth(now)));
  }, []);

  const anchor = anchorValue ? parseDateInput(anchorValue) : null;

  const paydays =
    anchor && today
      ? upcomingPaydays({ anchor, cycle, from: today, count: 3, moveWeekend })
      : [];
  const next = paydays[0] ?? null;
  const days = next && today ? daysBetween(today, next) : null;
  const working = next && today ? workingDaysBetween(today, next) : 0;

  // The unshifted date, so the card can say when the weekend rule actually did
  // something instead of silently changing the answer.
  const unsifted =
    anchor && today && moveWeekend
      ? upcomingPaydays({ anchor, cycle, from: today, count: 1, moveWeekend: false })[0] ?? null
      : null;
  const moved = !!(unsifted && next && unsifted.getTime() !== next.getTime());

  const pattern = anchor ? semimonthlyPattern(anchor) : null;

  return (
    <div className="conv">
      <div className="conv-inputs">
        <div className="conv-period" role="group" aria-label="How often you are paid">
          {PAY_CYCLES.map((option) => (
            <button
              key={option.id}
              type="button"
              aria-pressed={cycle === option.id}
              onClick={() => setCycle(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>

        <label className="conv-field pd-date">
          <span>Your next payday</span>
          <input
            type="date"
            value={anchorValue}
            onChange={(e) => setAnchorValue(e.target.value)}
            aria-label="Your next payday"
          />
        </label>

        <label className="pd-check">
          <input
            type="checkbox"
            checked={moveWeekend}
            onChange={(e) => setMoveWeekend(e.target.checked)}
          />
          <span>Move a weekend payday back to the Friday before</span>
        </label>

        <p className="pd-hint">
          {cycle === "semimonthly" && pattern
            ? `Twice a month here means the ${pattern} of each month, counted from the first of those on or after your date.`
            : "The countdown starts from the payday you enter and repeats on that cycle."}
        </p>

        <p className="conv-note">
          Dates only — this page will not estimate what the payday is worth. Public holidays vary by
          country, so the weekend rule is the only adjustment it makes.
        </p>
      </div>

      <div className="conv-out" aria-live="polite">
        <div className="conv-k">Days until payday</div>
        <div className="conv-v big">{days === null ? "—" : days}</div>
        <div className="conv-sub">{next ? LONG_DATE.format(next) : "Pick your next payday"}</div>

        {paydays.length > 1 ? (
          <div className="conv-mini">
            {paydays.map((date, index) => {
              const wait = today ? daysBetween(today, date) : 0;
              return (
                <div key={date.getTime()}>
                  <span>{SHORT_DATE.format(date)}</span>
                  <b>{index === 0 && wait === 0 ? "today" : describeWait(wait)}</b>
                </div>
              );
            })}
          </div>
        ) : null}

        <div className="conv-cmp">
          {days === null ? (
            <>Enter the payday you already know to start the countdown.</>
          ) : moved && unsifted && next ? (
            <>
              {LONG_DATE.format(unsifted)} falls on a weekend, so it moves back to{" "}
              {SHORT_DATE.format(next)} — payroll pays early, never late.
            </>
          ) : days === 0 ? (
            <>That is today. The next one is already listed below.</>
          ) : days === 1 ? (
            <>Tomorrow. After that the cycle takes over.</>
          ) : (
            <>
              {days} days to go, and {working} {working === 1 ? "working day" : "working days"} —
              weekends do not count.
            </>
          )}
        </div>
      </div>
    </div>
  );
}
