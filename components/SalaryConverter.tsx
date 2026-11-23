"use client";

import { useState } from "react";
import { formatCents, formatRate, symbolFor } from "@/lib/money";
import { useSettings } from "@/lib/store";

/**
 * Salary → hourly converter, built for `/hourly-rate-calculator`.
 *
 * Deliberately NOT the shared SalaryApp: the person searching "salary to hourly
 * calculator" wants a number in, a number out, in five seconds. The live timer
 * answers a different question ("what am I earning right now") and is one click
 * away on the homepage.
 *
 * The arithmetic is the honest one the rest of the site argues for:
 *
 *     hourly = annual ÷ (hours per week × paid weeks per year)
 *
 * with 40 × 52 = 2,080 only as a *comparison*, never as a hidden default. When
 * the visitor's inputs happen to equal the standard year the comparison line
 * says so instead of manufacturing a difference.
 */
const PERIODS = [
  { id: "annual", label: "per year" },
  { id: "monthly", label: "per month" },
  { id: "weekly", label: "per week" },
] as const;

type Period = (typeof PERIODS)[number]["id"];

/** 2,080 = 40 h/week × 52 weeks — the divisor this whole site exists to question. */
const STANDARD_HOURS = 2080;

export function SalaryConverter() {
  const { settings } = useSettings();
  const [period, setPeriod] = useState<Period>("annual");
  const [amount, setAmount] = useState("60000");
  const [hours, setHours] = useState("40");
  const [weeks, setWeeks] = useState("52");

  const currency = settings.currency;
  const sym = symbolFor(currency);

  const amountNum = Number.parseFloat(amount);
  const cents = Number.isFinite(amountNum) && amountNum > 0 ? Math.round(amountNum * 100) : 0;

  const hoursNum = Number.parseFloat(hours);
  const weeksNum = Number.parseFloat(weeks);
  const perWeek = Number.isFinite(hoursNum) && hoursNum > 0 ? hoursNum : 0;
  const perYear = Number.isFinite(weeksNum) && weeksNum > 0 ? weeksNum : 0;

  // Normalise to an annual figure first, then divide by the hours actually paid.
  // A weekly figure multiplies by the paid weeks the visitor entered, not by a
  // hard-coded 52 — that number is theirs to get wrong or right, not ours.
  const annualCents =
    period === "annual"
      ? cents
      : period === "monthly"
        ? cents * 12
        : cents * perYear;

  const totalHours = perWeek * perYear;

  const hourlyCents = totalHours > 0 ? annualCents / totalHours : 0;
  const standardCents = annualCents / STANDARD_HOURS;
  const deltaPct = standardCents > 0 ? (hourlyCents / standardCents - 1) * 100 : 0;

  const weeklyCents = hourlyCents * perWeek;
  const monthlyCents = annualCents / 12;

  return (
    <div className="conv">
      <div className="conv-inputs">
        <div className="conv-period" role="group" aria-label="How often you are paid this amount">
          {PERIODS.map((p) => (
            <button
              key={p.id}
              type="button"
              aria-pressed={period === p.id}
              onClick={() => setPeriod(p.id)}
            >
              {p.label}
            </button>
          ))}
        </div>

        <label className="conv-field">
          <span>Your salary</span>
          <span className="conv-money">
            <span className="cur" aria-hidden="true">
              {sym}
            </span>
            <input
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              aria-label="Salary amount"
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
            <span>Paid weeks per year</span>
            <input
              inputMode="decimal"
              value={weeks}
              onChange={(e) => setWeeks(e.target.value)}
              aria-label="Paid weeks per year"
            />
          </label>
        </div>

        <p className="conv-note">
          Gross pay, before tax. Unpaid breaks belong in the hours figure — a 9:00–17:30 shift with
          a 30-minute unpaid lunch is 8 hours, not 8.5.
        </p>
      </div>

      <div className="conv-out" aria-live="polite">
        <div className="conv-k">Your real hourly rate</div>
        <div className="conv-v">{formatRate(hourlyCents, currency, 2)}</div>
        <div className="conv-sub">
          {perWeek > 0 ? (
            <>
              {formatRate(weeklyCents, currency, 2)} a week ·{" "}
            </>
          ) : null}
          {formatCents(monthlyCents, currency)} a month
        </div>
        <div className="conv-cmp">
          {totalHours === 0 ? (
            <>Enter your hours and paid weeks to see the rate.</>
          ) : Math.abs(deltaPct) < 0.1 ? (
            <>
              Salary ÷ 2,080 gives the same number — your week is the standard 40 × 52.
            </>
          ) : (
            <>
              Salary ÷ 2,080 would say {formatRate(standardCents, currency, 2)} —{" "}
              {Math.abs(deltaPct).toFixed(1)}% too {deltaPct > 0 ? "low" : "high"}.
            </>
          )}
        </div>
      </div>
    </div>
  );
}
