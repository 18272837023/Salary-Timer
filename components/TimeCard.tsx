"use client";

import { useEffect, useRef, useState } from "react";
import { centsToInput, formatCents, symbolFor } from "@/lib/money";
import { derive } from "@/lib/schedule";
import { useSettings } from "@/lib/store";

/**
 * Multi-day time card for `/time-card-calculator`.
 *
 * This is the one page on the site that logs a row per day. The homepage counts
 * forward from a saved schedule and the stopwatch prices a single session; both
 * answer "what am I earning", and neither can answer "what did I actually work
 * this week". That is the whole reason this card is a table and not a clock —
 * and the reason it deliberately has no ticking number at the top. The planning
 * rule for the page forbids the homepage's counter from being the main event.
 *
 *     day hours   = clock out − clock in − unpaid break
 *     regular     = min(hours, 8) per day   or   min(hours, 40) per seven days
 *     overtime    = hours − regular
 *     gross       = regular × rate + overtime × rate × multiplier
 *
 * Two arithmetic details carry most of the weight:
 *
 *  1. **Overnight shifts.** An end time earlier than the start time is the next
 *     morning, not a negative number. 23:00 → 07:00 is 8 hours; subtracting
 *     naively gives −16 and poisons the whole week.
 *  2. **Two overtime rules.** Daily-over-8 and weekly-over-40 disagree on the
 *     same week, and neither is universally correct — it depends on the
 *     jurisdiction and the contract. The card offers both instead of picking
 *     one and being quietly wrong half the time.
 *
 * Gross only, and nothing is stored: a time card is payroll input, so the
 * export and the print button are the way it leaves the page.
 */

const MINUTES_PER_DAY = 24 * 60;
/** Daily overtime threshold: eight hours. */
const DAILY_OVERTIME = 8 * 60;
/** Weekly overtime threshold: forty hours per seven-day block. */
const WEEKLY_OVERTIME = 40 * 60;

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

type Rule = "daily" | "weekly";

interface Row {
  in: string;
  out: string;
  breakMin: string;
}

function emptyRow(): Row {
  return { in: "", out: "", breakMin: "" };
}

function filledRow(clockIn: string, clockOut: string, breakMin: string): Row {
  return { in: clockIn, out: clockOut, breakMin };
}

/** "09:00", "9:00" and "09:00:00" all mean the same minute of the day. */
function parseClock(value: string): number | null {
  const match = /^(\d{1,2}):(\d{2})(?::\d{2})?$/.exec(value.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}

function hoursLabel(minutes: number): string {
  return (minutes / 60).toFixed(2);
}

/**
 * A plausible first week, so the card answers something before it is touched:
 * five 9:00–17:30 days with a half-hour lunch are exactly 40 regular hours.
 * Someone who adds a Saturday immediately sees the two overtime rules split.
 */
function defaultRows(): Row[] {
  const rows = Array.from({ length: 14 }, emptyRow);
  for (let index = 0; index < 5; index += 1) {
    rows[index] = filledRow("09:00", "17:30", "30");
  }
  return rows;
}

export function TimeCard() {
  const { settings, hydrated } = useSettings();
  const [rate, setRate] = useState("25");
  const [multiplier, setMultiplier] = useState("1.5");
  const [days, setDays] = useState<7 | 14>(7);
  const [rule, setRule] = useState<Rule>("daily");
  const [rows, setRows] = useState<Row[]>(defaultRows);

  const currency = settings.currency;
  const sym = symbolFor(currency);

  // Prefill once from the saved pay, then leave the field alone — retyping a
  // rate the visitor just corrected is the worst kind of helpful.
  //
  // Gated on `onboarded`: the unsaved demo salary would otherwise drop $37.50
  // into a payroll field and make the card disagree with the worked examples in
  // the article below it, which are all quoted at $25 an hour.
  const prefilled = useRef(false);
  useEffect(() => {
    if (!hydrated || prefilled.current) return;
    prefilled.current = true;
    if (!settings.onboarded) return;
    const { hourlyCents } = derive(settings);
    if (hourlyCents > 0) setRate(centsToInput(Math.round(hourlyCents), settings.currency));
  }, [hydrated, settings]);

  const update = (index: number, patch: Partial<Row>) => {
    setRows((current) => current.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  const worked = rows.slice(0, days).map((row) => {
    const start = parseClock(row.in);
    const end = parseClock(row.out);
    if (start === null || end === null) {
      return { minutes: 0, breakMinutes: 0, overnight: false };
    }
    // An end earlier than the start is tomorrow morning. This branch is the
    // difference between an 8-hour night shift and a −16-hour week.
    const overnight = end < start;
    const span = overnight ? end + MINUTES_PER_DAY - start : end - start;
    const requested = Number.parseFloat(row.breakMin);
    // A break longer than the shift is a typo, not negative work.
    const breakMinutes = Number.isFinite(requested)
      ? Math.min(Math.max(requested, 0), span)
      : 0;
    return { minutes: span - breakMinutes, breakMinutes, overnight };
  });

  const split = worked.map((entry, index) => {
    if (rule === "daily") {
      const regular = Math.min(entry.minutes, DAILY_OVERTIME);
      return { ...entry, regular, overtime: entry.minutes - regular };
    }
    // Weekly rule: attribute hours to the seven-day block they fall in, in
    // order, so the overtime lands on the row that crossed the fortieth hour.
    const blockStart = index - (index % 7);
    let before = 0;
    for (let i = blockStart; i < index; i += 1) before += worked[i].minutes;
    const regular = Math.min(entry.minutes, Math.max(0, WEEKLY_OVERTIME - before));
    return { ...entry, regular, overtime: entry.minutes - regular };
  });

  const regularMinutes = split.reduce((sum, entry) => sum + entry.regular, 0);
  const overtimeMinutes = split.reduce((sum, entry) => sum + entry.overtime, 0);
  const totalMinutes = regularMinutes + overtimeMinutes;
  const daysWorked = worked.filter((entry) => entry.minutes > 0).length;

  const rateNum = Number.parseFloat(rate);
  const rateCents = Number.isFinite(rateNum) && rateNum > 0 ? rateNum * 100 : 0;
  const multiplierNum = Number.parseFloat(multiplier);
  const overtimeMultiplier =
    Number.isFinite(multiplierNum) && multiplierNum > 0 ? multiplierNum : 1.5;

  const grossCents = Math.round(
    (regularMinutes / 60) * rateCents +
      (overtimeMinutes / 60) * rateCents * overtimeMultiplier,
  );

  const periodLabel = days === 14 ? "two weeks" : "week";

  const exportCsv = () => {
    const header = ["Day", "Clock in", "Clock out", "Break (min)", "Hours", "Overtime hours"];
    const body = split.map((entry, index) => [
      days === 14
        ? `${DAY_NAMES[index % 7]} (week ${index < 7 ? 1 : 2})`
        : DAY_NAMES[index],
      rows[index].in,
      rows[index].out,
      String(entry.breakMinutes),
      hoursLabel(entry.minutes),
      hoursLabel(entry.overtime),
    ]);
    const summary = [
      [],
      ["Regular hours", hoursLabel(regularMinutes)],
      ["Overtime hours", hoursLabel(overtimeMinutes)],
      ["Total hours", hoursLabel(totalMinutes)],
      ["Overtime rule", rule === "daily" ? "Daily over 8 hours" : "Weekly over 40 hours"],
      ["Overtime multiplier", `x${overtimeMultiplier}`],
      ["Gross pay, before tax", formatCents(grossCents, currency)],
    ];
    const csv = [header, ...body, ...summary]
      .map((line) => line.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\r\n");
    // The BOM is what stops Excel reading a UTF-8 file as mojibake.
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = days === 14 ? "time-card-two-weeks.csv" : "time-card-week.csv";
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="tc">
      <div className="tc-top">
        <label className="conv-field">
          <span>Hourly rate</span>
          <span className="conv-money">
            <span className="cur" aria-hidden="true">
              {sym}
            </span>
            <input
              inputMode="decimal"
              value={rate}
              onChange={(event) => setRate(event.target.value)}
              aria-label="Hourly rate"
            />
          </span>
        </label>

        <label className="conv-field">
          <span>Overtime rate</span>
          <input
            inputMode="decimal"
            value={multiplier}
            onChange={(event) => setMultiplier(event.target.value)}
            aria-label="Overtime multiplier"
          />
        </label>

        <div className="tc-switch">
          <span className="tc-label">Card length</span>
          <div className="conv-period fill" role="group" aria-label="Length of the time card">
            <button type="button" aria-pressed={days === 7} onClick={() => setDays(7)}>
              7 days
            </button>
            <button type="button" aria-pressed={days === 14} onClick={() => setDays(14)}>
              14 days
            </button>
          </div>
        </div>

        <div className="tc-switch">
          <span className="tc-label">Overtime after</span>
          <div className="conv-period fill" role="group" aria-label="Overtime rule">
            <button type="button" aria-pressed={rule === "daily"} onClick={() => setRule("daily")}>
              Daily over 8h
            </button>
            <button type="button" aria-pressed={rule === "weekly"} onClick={() => setRule("weekly")}>
              Weekly over 40h
            </button>
          </div>
        </div>
      </div>

      <div className="tc-scroll">
        <table className="tc-table">
          <thead>
            <tr>
              <th scope="col">Day</th>
              <th scope="col">In</th>
              <th scope="col">Out</th>
              <th scope="col">Break (min)</th>
              <th scope="col">Hours</th>
              <th scope="col">OT</th>
            </tr>
          </thead>
          <tbody>
            {split.map((entry, index) => {
              const empty = rows[index].in === "" && rows[index].out === "";
              return (
                <tr key={index}>
                  <th scope="row">
                    <b>{DAY_NAMES[index % 7]}</b>
                    {days === 14 ? <i>wk {index < 7 ? 1 : 2}</i> : null}
                    {entry.overnight ? <span className="tc-on">+1 day</span> : null}
                  </th>
                  <td>
                    <input
                      type="time"
                      value={rows[index].in}
                      onChange={(event) => update(index, { in: event.target.value })}
                      aria-label={`${DAY_NAMES[index % 7]} clock in`}
                    />
                  </td>
                  <td>
                    <input
                      type="time"
                      value={rows[index].out}
                      onChange={(event) => update(index, { out: event.target.value })}
                      aria-label={`${DAY_NAMES[index % 7]} clock out`}
                    />
                  </td>
                  <td>
                    <input
                      inputMode="decimal"
                      value={rows[index].breakMin}
                      placeholder="0"
                      onChange={(event) => update(index, { breakMin: event.target.value })}
                      aria-label={`${DAY_NAMES[index % 7]} unpaid break in minutes`}
                    />
                  </td>
                  <td className="tc-num">{empty ? "—" : hoursLabel(entry.minutes)}</td>
                  <td className="tc-num">
                    {entry.overtime > 0 ? hoursLabel(entry.overtime) : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="tc-sum" aria-live="polite">
        <div>
          <div className="conv-k">Gross pay for the {periodLabel}</div>
          <div className="conv-v">{formatCents(grossCents, currency)}</div>
        </div>
        <div className="conv-mini tc-mini">
          <div>
            <span>Regular</span>
            <b>{hoursLabel(regularMinutes)} h</b>
          </div>
          <div>
            <span>Overtime</span>
            <b>{hoursLabel(overtimeMinutes)} h</b>
          </div>
          <div>
            <span>Total hours</span>
            <b>{hoursLabel(totalMinutes)} h</b>
          </div>
          <div>
            <span>Days worked</span>
            <b>
              {daysWorked} of {days}
            </b>
          </div>
        </div>
      </div>

      <div className="tc-foot">
        <div className="tc-actions">
          <button type="button" className="tc-btn" onClick={() => window.print()}>
            Print
          </button>
          <button type="button" className="tc-btn" onClick={exportCsv}>
            Export CSV
          </button>
          <button
            type="button"
            className="tc-btn ghost"
            onClick={() => setRows(Array.from({ length: 14 }, emptyRow))}
          >
            Clear the card
          </button>
        </div>
        <p className="conv-note">
          Gross pay, before tax — this page does not estimate deductions. Nothing is saved in the
          browser: reloading clears the card, so print or export it if you need the record.
        </p>
      </div>
    </div>
  );
}
