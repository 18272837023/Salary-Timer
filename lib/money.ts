import type { CurrencyCode } from "./types";

/**
 * Currency formatting.
 *
 * Two different kinds of number are formatted here and they must not be
 * confused:
 *
 *  1. **Balances** — integer minor units that a person is watching tick up.
 *     These are split with integer arithmetic (`Math.trunc` / `%`), never by
 *     subtracting a float and multiplying by 100. That guarantees the minor
 *     digit is exactly right, every render, for every rate.
 *
 *  2. **Rates** — "you earn $0.0096 per second". These are inherently
 *     fractional, so they go through Intl with an explicit digit count. A
 *     rounding difference here is invisible and harmless.
 *
 * Storage is always 1/100 of the currency unit ("cents"), even for currencies
 * whose real minor unit is 1 (yen, won). `decimals` only controls display, so
 * adding a currency never requires a data migration.
 */

interface CurrencyMeta {
  symbol: string;
  /** Display decimals. 0 for currencies normally written without a fraction. */
  decimals: 0 | 2;
}

/**
 * Order matters: it is the order of the picker. The six most-used currencies
 * come first, the rest follow alphabetically by ISO code.
 */
export const CURRENCY_CODES: CurrencyCode[] = [
  "USD",
  "EUR",
  "CNY",
  "GBP",
  "JPY",
  "KRW",
  "AED",
  "AUD",
  "BRL",
  "CAD",
  "CHF",
  "HKD",
  "IDR",
  "INR",
  "MXN",
  "MYR",
  "NOK",
  "NZD",
  "PHP",
  "PLN",
  "RUB",
  "SAR",
  "SEK",
  "SGD",
  "THB",
  "TRY",
  "TWD",
  "VND",
  "ZAR",
];

export const CURRENCY_META: Record<CurrencyCode, CurrencyMeta> = {
  USD: { symbol: "$", decimals: 2 },
  EUR: { symbol: "€", decimals: 2 },
  CNY: { symbol: "¥", decimals: 2 },
  GBP: { symbol: "£", decimals: 2 },
  JPY: { symbol: "¥", decimals: 0 },
  KRW: { symbol: "₩", decimals: 0 },
  AED: { symbol: "AED", decimals: 2 },
  AUD: { symbol: "A$", decimals: 2 },
  BRL: { symbol: "R$", decimals: 2 },
  CAD: { symbol: "CA$", decimals: 2 },
  CHF: { symbol: "CHF", decimals: 2 },
  HKD: { symbol: "HK$", decimals: 2 },
  IDR: { symbol: "Rp", decimals: 0 },
  INR: { symbol: "₹", decimals: 2 },
  MXN: { symbol: "MX$", decimals: 2 },
  MYR: { symbol: "RM", decimals: 2 },
  NOK: { symbol: "kr", decimals: 2 },
  NZD: { symbol: "NZ$", decimals: 2 },
  PHP: { symbol: "₱", decimals: 2 },
  PLN: { symbol: "zł", decimals: 2 },
  RUB: { symbol: "₽", decimals: 2 },
  SAR: { symbol: "SAR", decimals: 2 },
  SEK: { symbol: "kr", decimals: 2 },
  SGD: { symbol: "S$", decimals: 2 },
  THB: { symbol: "฿", decimals: 2 },
  TRY: { symbol: "₺", decimals: 2 },
  TWD: { symbol: "NT$", decimals: 2 },
  VND: { symbol: "₫", decimals: 0 },
  ZAR: { symbol: "R", decimals: 2 },
};

export const CURRENCIES = CURRENCY_CODES;

/** Kept for callers that only need the glyph. */
export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = Object.fromEntries(
  (Object.keys(CURRENCY_META) as CurrencyCode[]).map((code) => [code, CURRENCY_META[code].symbol]),
) as Record<CurrencyCode, string>;

export function isCurrencyCode(value: unknown): value is CurrencyCode {
  return typeof value === "string" && value in CURRENCY_META;
}

export function symbolFor(currency: string): string {
  return CURRENCY_META[currency as CurrencyCode]?.symbol ?? "$";
}

export function decimalsFor(currency: string): 0 | 2 {
  return CURRENCY_META[currency as CurrencyCode]?.decimals ?? 2;
}

/**
 * Localized currency name ("人民币" / "Chinese Yuan"). Uses the platform's own
 * CLDR data so we do not have to maintain 29 translations by hand.
 */
export function currencyName(code: string, locale: string): string {
  try {
    const names = new Intl.DisplayNames([locale], { type: "currency" });
    return names.of(code) ?? code;
  } catch {
    return code;
  }
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
  const digits = options.digits ?? decimalsFor(currency);
  const sign = safe < 0 ? "-" : "";
  const abs = Math.abs(safe);

  if (digits === 0) {
    // Truncate, never round up: a balance must not show money you have not
    // earned yet, and the month total must never exceed the live ticker.
    return sign + symbolFor(currency) + group(Math.trunc(abs / 100), 0);
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

/**
 * Split a cent balance for the big ticker: integer part + ".cc".
 * Zero-decimal currencies return an empty `frac` so the ticker never shows a
 * fraction the currency does not use (¥1,234.00 → ¥1,234).
 */
export function splitCents(
  cents: number,
  currency = "USD",
): { whole: string; frac: string } {
  const safe = Number.isFinite(cents) ? Math.max(0, Math.round(cents)) : 0;
  const whole = Math.trunc(safe / 100);
  if (decimalsFor(currency) === 0) {
    return { whole: group(whole, 0), frac: "" };
  }
  const frac = safe % 100;
  return {
    whole: group(whole, 0),
    frac: "." + (frac < 10 ? "0" : "") + frac,
  };
}

/**
 * Format a per-hour cent rate into a display string.
 * `digits` controls decimals (4 for per-second, currency default otherwise).
 */
export function formatRate(
  centsPerUnit: number,
  currency: string,
  digits?: number,
): string {
  const value = Number.isFinite(centsPerUnit) ? centsPerUnit / 100 : 0;
  return symbolFor(currency) + group(value, digits ?? decimalsFor(currency));
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
export function centsToInput(cents: number, currency = "USD"): string {
  if (!Number.isFinite(cents)) return "";
  const whole = Math.trunc(cents / 100);
  if (decimalsFor(currency) === 0) return String(whole);
  const frac = Math.abs(cents % 100);
  return frac === 0 ? String(whole) : `${whole}.${frac < 10 ? "0" : ""}${frac}`;
}
