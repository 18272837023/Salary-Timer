"use client";

import { useState } from "react";
import { Link } from "@/components/SmartLink";
import { formatCents, formatRate, symbolFor } from "@/lib/money";
import { useSettings } from "@/lib/store";

/**
 * Static pay-per-second calculator, built for `/pay-per-second-calculator`.
 *
 * The one rule this component exists to respect: the page must not open with a
 * ticking counter. Someone typing "how much do I make per second" wants a
 * number they can read, quote and close the tab on — not a clock they have to
 * start. So the result is a fixed figure that only moves when an input moves,
 * and the live timer is an offer at the bottom of the card, not the product.
 *
 *     per second = hourly rate ÷ 3,600
 *
 * Two ways in, because the query arrives in two shapes: "I earn $25 an hour"
 * and "I earn $52,000 a year" both mean "how much is a second". Switching the
 * period converts the amount rather than relabelling it — $25 typed as an
 * hourly rate becomes $52,000 when you switch to per year, so the rate behind
 * the number never silently changes by a factor of 2,080.
 */
const PERIODS = [
  { id: "hourly", label: "per hour" },
  { id: "annual", label: "per year" },
] as const;

type Period = (typeof PERIODS)[number]["id"];

const SECONDS_PER_HOUR = 3600;
/** Paid weeks a year. The 52-or-50 question belongs to the hourly→annual page;
 *  here it would be a second variable on a page about one division. */
const PAID_WEEKS = 52;

export function PayPerSecond() {
  const { settings } = useSettings();
  const [period, setPeriod] = useState<Period>("hourly");
  const [amount, setAmount] = useState("25");
  const [hours, setHours] = useState("40");
  const [days, setDays] = useState("5");

  const currency = settings.currency;
  const sym = symbolFor(currency);

  const amountNum = Number.parseFloat(amount);
  const cents = Number.isFinite(amountNum) && amountNum > 0 ? Math.round(amountNum * 100) : 0;

  const hoursNum = Number.parseFloat(hours);
  const perWeek = Number.isFinite(hoursNum) && hoursNum > 0 ? hoursNum : 0;

  const daysNum = Number.parseFloat(days);
  const perWeekDays = Number.isFinite(daysNum) && daysNum > 0 ? daysNum : 0;

  // Normalise to an hourly rate first: every unit below is a division of it, so
  // there is exactly one place where the annual→hourly assumption lives.
  const hourlyCents =
    period === "hourly" ? cents : perWeek > 0 ? cents / (perWeek * PAID_WEEKS) : 0;

  const perSecondCents = hourlyCents / SECONDS_PER_HOUR;
  const perMinuteCents = hourlyCents / 60;
  const hoursPerDay = perWeekDays > 0 ? perWeek / perWeekDays : 0;
  const perDayCents = hourlyCents * hoursPerDay;

  const ready = hourlyCents > 0;

  /** Seconds of work that pay for one unit of the currency — the number this
   *  page is quietly about, and the one people can actually use. */
  const secondsPerUnit = hourlyCents > 0 ? (100 * SECONDS_PER_HOUR) / hourlyCents : 0;

  // Keep the rate economically identical across the switch instead of leaving
  // "$25" labelled as a yearly salary.
  const choosePeriod = (next: Period) => {
    if (next === period) return;
    if (hourlyCents > 0) {
      const value =
        next === "hourly" ? hourlyCents / 100 : (hourlyCents * perWeek * PAID_WEEKS) / 100;
      setAmount(String(Math.round(value * 100) / 100));
    }
    setPeriod(next);
  };

  return (
    <div className="conv">
      <div className="conv-inputs">
        <div className="conv-period" role="group" aria-label="How your pay is quoted">
          {PERIODS.map((p) => (
            <button
              key={p.id}
              type="button"
              aria-pressed={period === p.id}
              onClick={() => choosePeriod(p.id)}
            >
              {p.label}
            </button>
          ))}
        </div>

        <label className="conv-field">
          <span>Your pay</span>
          <span className="conv-money">
            <span className="cur" aria-hidden="true">
              {sym}
            </span>
            <input
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              aria-label="Pay amount"
            />
          </span>
        </label>

        <div className="conv-row">
          <label className="conv-field">
            <span>Hours per week</span>
            <input
              inputMode="decimal"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              aria-label="Paid hours per week"
            />
          </label>
          <label className="conv-field">
            <span>Days per week</span>
            <input
              inputMode="decimal"
              value={days}
              onChange={(e) => setDays(e.target.value)}
              aria-label="Working days per week"
            />
          </label>
        </div>

        <p className="conv-note">
          Gross pay, before tax, over 52 paid weeks. Paid hours only — a 9:00–17:30 shift with a
          30-minute unpaid lunch is 8 hours, not 8.5.
        </p>
      </div>

      <div className="conv-out" aria-live="polite">
        <div className="conv-k">Every second</div>
        <div className="conv-v">{formatRate(perSecondCents, currency, 4)}</div>
        <div className="conv-mini">
          <div>
            <span>Per minute</span>
            <b>{formatRate(perMinuteCents, currency, 2)}</b>
          </div>
          <div>
            <span>Per hour</span>
            <b>{formatRate(hourlyCents, currency, 2)}</b>
          </div>
          <div>
            <span>Per workday</span>
            <b>{formatRate(perDayCents, currency, 2)}</b>
          </div>
        </div>
        <div className="conv-cmp">
          {!ready ? (
            <>Enter your pay and your weekly hours to see the second.</>
          ) : (
            <>
              A {formatCents(100, currency)} purchase costs {Math.round(secondsPerUnit)} seconds of
              work — {(secondsPerUnit / 60).toFixed(1)} minutes at this rate.
            </>
          )}
        </div>
        <p className="conv-cta-line">
          <Link className="conv-cta" href="/">
            Open the live salary timer →
          </Link>
        </p>
      </div>
    </div>
  );
}
