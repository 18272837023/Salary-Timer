"use client";

import { useState } from "react";
import { formatCents, symbolFor } from "@/lib/money";
import { useSettings } from "@/lib/store";

/**
 * Hourly → annual converter, built for `/hourly-to-annual-salary`.
 *
 * The mirror image of SalaryConverter, not a copy of it: the input is the wage
 * people already know (an advert says "$25 an hour", not "$52,000 a year") and
 * the output is the figure they have to compare against a salaried offer.
 *
 *     annual = hourly × paid hours per week × paid weeks per year
 *
 * The paid-week count is a two-button choice rather than a text field because
 * that is the decision the page is about. 52 and 50 are not equally true: the
 * second one is what a year looks like when two weeks go unpaid, and the
 * comparison line says what those two weeks cost in money instead of percent.
 */
const WEEK_OPTIONS = [52, 50] as const;

export function HourlyToSalary() {
  const { settings } = useSettings();
  const [hourly, setHourly] = useState("25");
  const [hours, setHours] = useState("40");
  const [weeks, setWeeks] = useState<number>(52);

  const currency = settings.currency;
  const sym = symbolFor(currency);

  const hourlyNum = Number.parseFloat(hourly);
  const hourlyCents = Number.isFinite(hourlyNum) && hourlyNum > 0 ? Math.round(hourlyNum * 100) : 0;

  const hoursNum = Number.parseFloat(hours);
  const perWeek = Number.isFinite(hoursNum) && hoursNum > 0 ? hoursNum : 0;

  const weeklyCents = hourlyCents * perWeek;
  const annualCents = weeklyCents * weeks;
  const monthlyCents = annualCents / 12;
  const biweeklyCents = weeklyCents * 2;

  const ready = hourlyCents > 0 && perWeek > 0;

  // What the two unpaid weeks are worth at this wage — the number the toggle
  // exists to surface, so the visitor never has to compute it themselves.
  const unpaidWeeksCents = weeklyCents * 2;

  return (
    <div className="conv">
      <div className="conv-inputs">
        <label className="conv-field">
          <span>Your hourly wage</span>
          <span className="conv-money">
            <span className="cur" aria-hidden="true">
              {sym}
            </span>
            <input
              inputMode="decimal"
              value={hourly}
              onChange={(e) => setHourly(e.target.value)}
              aria-label="Hourly wage"
            />
          </span>
        </label>

        <div className="conv-row mixed">
          <label className="conv-field">
            <span>Hours per week</span>
            <input
              inputMode="decimal"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              aria-label="Paid hours per week"
            />
          </label>
          <div className="conv-field">
            <span id="weeks-label">Paid weeks per year</span>
            <div className="conv-period fill" role="group" aria-labelledby="weeks-label">
              {WEEK_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  aria-pressed={weeks === option}
                  onClick={() => setWeeks(option)}
                >
                  {option} weeks
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="conv-note">
          Gross pay, before tax. Unpaid breaks belong in the hours figure — a 9:00–17:30 shift with
          a 30-minute unpaid lunch is 8 hours, not 8.5.
        </p>
      </div>

      <div className="conv-out" aria-live="polite">
        <div className="conv-k">Over a year</div>
        <div className="conv-v">{formatCents(ready ? annualCents : 0, currency)}</div>
        <div className="conv-mini">
          <div>
            <span>Per month</span>
            <b>{formatCents(ready ? monthlyCents : 0, currency)}</b>
          </div>
          <div>
            <span>Per week</span>
            <b>{formatCents(ready ? weeklyCents : 0, currency)}</b>
          </div>
          <div>
            <span>Biweekly</span>
            <b>{formatCents(ready ? biweeklyCents : 0, currency)}</b>
          </div>
        </div>
        <div className="conv-cmp">
          {!ready ? (
            <>Enter an hourly wage and your weekly hours to see the year.</>
          ) : weeks === 52 ? (
            <>
              52 paid weeks assumes you are paid for holiday and take no unpaid leave. Two unpaid
              weeks would cost {formatCents(unpaidWeeksCents, currency)}.
            </>
          ) : (
            <>
              Two unpaid weeks cost {formatCents(unpaidWeeksCents, currency)} a year — 3.8% at the
              same hourly wage.
            </>
          )}
        </div>
      </div>
    </div>
  );
}
