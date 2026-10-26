import type { CurrencyCode } from "./types";

/**
 * Currency formatting.
 *
 * Two different kinds of number are formatted here and they must not be
 * confused:
 *
 *  1. **Balances** — integer cents that a person is watching tick up. These
 *     are split with integer arithmetic (`Math.trunc` / `%`), never by
 *     subtracting a float and multiplying by 100. That guarantees the cents
 *     digit is exactly right, every render, for every rate.
 *
 *  2. **Rates** — "you earn $0.0096 per second". These are inherently
 *     fractional, so they go through Intl with an explicit digit count. A
 *     rounding difference here is invisible and harmless.
 */

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  CAD: "CA$",
  AUD: "A$",
  JPY: "¥",
  INR: "₹",
  SGD: "S$",
  BRL: "R$",
  MXN: "MX$",
};

export const CURRENCIES = Object.keys(CURRENCY_SYMBOLS) as CurrencyCode[];

export function symbolFor(currency: string): string {
  return CURRENCY_SYMBOLS[currency as CurrencyCode] ?? "$";
}

function group(value: number, digits: number): string {
  try {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(value);
  } catch {
    return value.toFixed(digits);
  }
}

/** Format an integer cent balance. Exact — no float rounding involved. */
export function formatCents(
  cents: number,
  currency: string,
  options: { digits?: 0 | 2 } = {},
): string {
  const safe = Number.isFinite(cents) ? Math.round(cents) : 0;
  const digits = options.digits ?? 2;
  const sign = safe < 0 ? "-" : "";
  const abs = Math.abs(safe);

  if (digits === 0) {
    return sign + symbolFor(currency) + group(Math.round(abs / 100), 0);
  }
  const whole = Math.trunc(abs / 100);
  const frac = abs % 100;
  return (
    sign +
    symbolFor(currency) +
    group(whole, 0) +
    "." +
    (frac < 10 ? "0" : "") +
    frac
  );
}

/** Split a cent balance for the big ticker: integer part + ".cc". */
export function splitCents(cents: number): { whole: string; frac: string } {
  const safe = Number.isFinite(cents) ? Math.max(0, Math.round(cents)) : 0;
  const whole = Math.trunc(safe / 100);
  const frac = safe % 100;
  return {
    whole: group(whole, 0),
    frac: "." + (frac < 10 ? "0" : "") + frac,
  };
}

/**
 * Format a per-hour cent rate into a display string.
 * `digits` controls currency decimals (4 for per-second, 2 otherwise).
 */
export function formatRate(
  centsPerUnit: number,
  currency: string,
  digits = 2,
): string {
  const value = Number.isFinite(centsPerUnit) ? centsPerUnit / 100 : 0;
  return symbolFor(currency) + group(value, digits);
}

/** Parse a user-typed amount into integer cents. Returns null when invalid. */
export function parseAmountToCents(input: string): number | null {
  const cleaned = input.replace(/[^0-9.\-]/g, "");
  if (!cleaned || cleaned === "-" || cleaned === ".") return null;
  const value = Number.parseFloat(cleaned);
  if (!Number.isFinite(value) || value < 0) return null;
  return Math.round(value * 100);
}

/** Format integer cents as a plain editable number ("78000" or "78000.50"). */
export function centsToInput(cents: number): string {
  if (!Number.isFinite(cents)) return "";
  const whole = Math.trunc(cents / 100);
  const frac = Math.abs(cents % 100);
  return frac === 0 ? String(whole) : `${whole}.${frac < 10 ? "0" : ""}${frac}`;
}
