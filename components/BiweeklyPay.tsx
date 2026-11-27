"use client";

import { useState } from "react";
import { formatCents, formatRate, symbolFor } from "@/lib/money";
import { useSettings } from "@/lib/store";

/**
 * Biweekly pay converter for `/biweekly-pay-calculator`.
 *
 * The product is one number — the gross amount of a single two-week paycheck —
 * not a year, not a rate. That is what keeps this page distinct from
 * `/hourly-to-annual-salary`, which answers "what does an hour add up to in a
 * year" and shows a biweekly figure only as one row among four.
 *
 *     biweekly = annual ÷ 26            (26 paychecks, not 24)
 *     biweekly = hourly × paid hours in the two weeks
 *
 * Gross only, deliberately. Tax is not a percentage you can apply to a salary
 * and be right about: it depends on the jurisdiction, the filing status, the
 * deductions and the year. Guessing it would put a confident wrong number where
 * a visitor expects their paycheck, so the card stops at gross and says so.
 *
 * Not a time card either: there is one hours field for the whole period, no
 * per-day rows and no shift logging — that is a different tool.
 */
const PERIODS = [
  { id: "annual", label: "per year" },
  { id: "hourly", label: "per hour" },
] as const;

type Period = (typeof PERIODS)[number]["id"];

/** 52 weeks ÷ 2 — the number this whole page exists to defend. */
const CHECKS_PER_YEAR = 26;
/** Semi-monthly pay runs 24 times, which is why the two are not interchangeable. */
const SEMIMONTHLY_CHECKS = 24;

export function BiweeklyPay() {
  const { settings } = useSettings();
  const [period, setPeriod] = useState<Period>("annual");
  const [amount, setAmount] = useState("52000");
  const [hours, setHours] = useState("80");

  const currency = settings.currency;
  const sym = symbolFor(currency);

  const amountNum = Number.parseFloat(amount);
  const cents = Number.isFinite(amountNum) && amountNum > 0 ? Math.round(amountNum * 100) : 0;

  const hoursNum = Number.parseFloat(hours);
  const perPeriod = Number.isFinite(hoursNum) && hoursNum > 0 ? hoursNum : 0;

  const annualCents = period === "annual" ? cents : cents * perPeriod * CHECKS_PER_YEAR;
  const checkCents = annualCents / CHECKS_PER_YEAR;
  const semimonthlyCents = annualCents / SEMIMONTHLY_CHECKS;
  const impliedRateCents = perPeriod > 0 ? checkCents / perPeriod : 0;

  const ready = cents > 0;

  // Keep the money identical across the switch: $52,000 a year becomes $25 an
  // hour, not the same 52,000 relabelled as an hourly rate.
  const choosePeriod = (next: Period) => {
    if (next === period) return;
    if (cents > 0 && perPeriod > 0) {
      const value = next === "annual" ? annualCents / 100 : checkCents / perPeriod / 100;
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
          <span>{period === "annual" ? "Your annual salary" : "Your hourly wage"}</span>
          <span className="conv-money">
            <span className="cur" aria-hidden="true">
              {sym}
            </span>
            <input
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              aria-label={period === "annual" ? "Annual salary" : "Hourly wage"}
            />
          </span>
        </label>

        <label className="conv-field">
          <span>Paid hours in the two weeks</span>
          <input
            inputMode="decimal"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            aria-label="Paid hours in the two-week period"
          />
        </label>

        <p className="conv-note">
          Gross pay, before tax — this page does not estimate deductions. Unpaid breaks belong in the
          hours figure: a full-time fortnight is 80 paid hours, not 84.
        </p>
      </div>

      <div className="conv-out" aria-live="polite">
        <div className="conv-k">One biweekly paycheck</div>
        <div className="conv-v">{formatCents(ready ? checkCents : 0, currency)}</div>
        <div className="conv-mini">
          <div>
            <span>Per year</span>
            <b>{formatCents(ready ? annualCents : 0, currency)}</b>
          </div>
          <div>
            <span>Semi-monthly</span>
            <b>{formatCents(ready ? semimonthlyCents : 0, currency)}</b>
          </div>
          <div>
            <span>Per hour</span>
            <b>{perPeriod > 0 ? formatRate(impliedRateCents, currency, 2) : "—"}</b>
          </div>
        </div>
        <div className="conv-cmp">
          {!ready ? (
            <>Enter your pay to see what one paycheck comes to.</>
          ) : (
            <>
              26 paychecks a year, not 24. Dividing by 24 would overstate every check by 8.3% — that
              is the semi-monthly figure above, not this one.
            </>
          )}
        </div>
      </div>
    </div>
  );
}
