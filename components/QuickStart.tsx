"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useI18n } from "@/lib/i18n";
import { track } from "@/lib/analytics";
import { SETTINGS_VERSION } from "@/lib/defaults";
import { CURRENCIES, currencyName, formatRate, symbolFor } from "@/lib/money";
import { derive, toHHMM, toMinutes } from "@/lib/schedule";
import { useSettings, useToast } from "@/lib/store";
import type { CurrencyCode, PayMode, Settings } from "@/lib/types";

const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0]; // Monday … Sunday
const DAY_OPTIONS = [3, 4, 5, 6];
const MINUTES_PER_DAY = 1440;
type QuickPayMode = Exclude<PayMode, "hourly">;
const PAY_OPTIONS: Record<QuickPayMode, { label: string; unit: string; max: number; step: number }> = {
  annual: { label: "qs.step1.perYear", unit: "qs.step1.yearUnit", max: 250_000, step: 500 },
  monthly: { label: "qs.step1.perMonth", unit: "qs.step1.monthUnit", max: 30_000, step: 100 },
  daily: { label: "qs.step1.perDay", unit: "qs.step1.dayUnit", max: 2_000, step: 10 },
};

/** pay → working hours → working days / paid hours */
const STEP_PAY = 0;
const STEP_WHEN = 1;
const STEP_HOURS = 2;
const LAST_STEP = STEP_HOURS;

type TimeField = "start" | "end" | "bStart" | "bEnd";
const TIME_FALLBACK: Record<TimeField, string> = {
  start: "09:00",
  end: "17:30",
  bStart: "12:30",
  bEnd: "13:00",
};

function daysFor(count: number): number[] {
  return DAY_ORDER.slice(0, Math.min(7, Math.max(1, count))).sort((a, b) => a - b);
}

/** Length of a shift between two wall-clock times; supports overnight shifts. */
function shiftWindow(startMin: number, endMin: number): number {
  let w = endMin - startMin;
  if (w <= 0) w += MINUTES_PER_DAY;
  return Math.max(30, w);
}

/**
 * Keep the unpaid break inside the shift. `wanted` is a wall-clock minute and
 * may belong to the next day (a 02:00 break on a 22:00 → 06:00 shift). If it
 * no longer fits after the shift changes, centre it instead of silently
 * dropping it — the visitor always sees the pause they are actually getting.
 */
function placeBreak(startMin: number, win: number, wanted: number, len: number) {
  const size = Math.max(0, Math.min(len, win - 10));
  if (size <= 0) return { start: startMin, end: startMin, size: 0 };
  const endAbs = startMin + win;
  let s = wanted <= startMin ? wanted + MINUTES_PER_DAY : wanted;
  if (s < startMin || s + size > endAbs) s = startMin + Math.round((win - size) / 2);
  s = Math.max(startMin + 5, Math.min(s, endAbs - 5 - size));
  return { start: s, end: s + size, size };
}

/**
 * Normalise the four time fields as a group. Every edit goes through here so
 * the break can never end up outside the shift (which would make the counter
 * keep running through a "break" that the schedule does not actually contain).
 */
function fitTimes(start: string, end: string, bStart: string, bEnd: string) {
  const s = toMinutes(start);
  let e = toMinutes(end);
  if (e === s) e = (s + 8 * 60) % MINUTES_PER_DAY;
  const win = shiftWindow(s, e);

  let b1 = toMinutes(bStart);
  let b2 = toMinutes(bEnd);
  if (b2 <= b1) b2 += MINUTES_PER_DAY;
  let len = b2 - b1;
  // A 23-hour "break" is a mistyped time, not an intentional overnight pause.
  if (len > 4 * 60) len = 30;

  const placed = placeBreak(s, win, b1, len);
  return {
    start,
    end: toHHMM(e),
    bStart: toHHMM(placed.start),
    bEnd: toHHMM(placed.end),
    breakStartAbs: placed.start,
    breakEndAbs: placed.end,
    windowMin: win,
    breakMin: placed.size,
  };
}

function hoursLabel(hours: number): string {
  const rounded = Math.round(hours * 10) / 10;
  return Number.isInteger(rounded) ? `${rounded} h` : `${rounded.toFixed(1)} h`;
}

export function QuickStart({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t, lang } = useI18n();
  const { settings, replace } = useSettings();
  const { show } = useToast();

  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(STEP_PAY);
  const [mode, setMode] = useState<QuickPayMode>("annual");
  const [currency, setCurrency] = useState<CurrencyCode>("USD");
  const [amount, setAmount] = useState(78_000);
  const [days, setDays] = useState(5);

  /**
   * The schedule is the single source of truth. The paid-hours slider in the
   * last step writes back to `end` rather than keeping a competing value, so
   * going back a step never shows a stale clock-out time.
   */
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("17:30");
  const [lunchOn, setLunchOn] = useState(true);
  const [lunchStart, setLunchStart] = useState("12:30");
  const [lunchEnd, setLunchEnd] = useState("13:00");

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    setStep(STEP_PAY);
    const saved = derive(settings);
    // Keep existing hourly accounts compatible: show equivalent pay per working day.
    setMode(settings.mode === "hourly" ? "daily" : settings.mode);
    setCurrency(settings.currency);
    setAmount(settings.mode === "hourly" ? Math.round(saved.dailyCents) / 100 : settings.amountCents / 100);
    setDays(settings.days.length || 5);

    const first = settings.breaks[0];
    setLunchOn(Boolean(first));
    const fitted = fitTimes(
      settings.start,
      settings.end,
      first?.start ?? "12:30",
      first?.end ?? "13:00",
    );
    setStart(fitted.start);
    setEnd(fitted.end);
    setLunchStart(fitted.bStart);
    setLunchEnd(fitted.bEnd);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseRef.current();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  const times = useMemo(
    () => fitTimes(start, end, lunchStart, lunchEnd),
    [start, end, lunchStart, lunchEnd],
  );

  const draft = useMemo<Settings>(
    () => ({
      ...settings,
      mode,
      currency,
      amountCents: Math.max(0, Math.round(amount * 100)),
      start: times.start,
      end: times.end,
      days: daysFor(days),
      breaks:
        lunchOn && times.breakMin > 0
          ? [{ id: "qs-lunch", start: times.bStart, end: times.bEnd }]
          : [],
      // This wizard promises the counter stops at clock-out. Overtime is a
      // separate, explicit choice in the full settings panel.
      overtime: false,
      onboarded: true,
      v: SETTINGS_VERSION,
    }),
    [settings, mode, currency, amount, days, lunchOn, times],
  );

  const preview = useMemo(() => derive(draft), [draft]);
  const sym = symbolFor(currency);
  const locale = lang === "zh" ? "zh-CN" : "en-US";

  const timeline = useMemo(() => {
    const s = toMinutes(times.start);
    if (!lunchOn || times.breakMin <= 0) return [{ key: "paid", min: times.windowMin }];
    return [
      { key: "paid", min: Math.max(0, times.breakStartAbs - s) },
      { key: "paused", min: Math.max(0, times.breakEndAbs - times.breakStartAbs) },
      { key: "paid", min: Math.max(0, s + times.windowMin - times.breakEndAbs) },
    ].filter((seg) => seg.min > 0);
  }, [times, lunchOn]);

  function changeTime(field: TimeField, value: string) {
    if (!value) return;
    const next = { start, end, bStart: lunchStart, bEnd: lunchEnd };
    next[field] = value;
    const fitted = fitTimes(next.start, next.end, next.bStart, next.bEnd);
    setStart(fitted.start);
    setEnd(fitted.end);
    setLunchStart(fitted.bStart);
    setLunchEnd(fitted.bEnd);
  }

  function switchMode(next: QuickPayMode) {
    if (next === mode) return;
    // Use the chosen workweek (52 weeks/year), never a fixed 30-day month.
    const annualCents = preview.hourlyCents * preview.annualHours;
    const nextCents = next === "annual"
      ? annualCents
      : next === "monthly"
        ? annualCents / 12
        : preview.dailyCents;
    setAmount(Math.round(nextCents) / 100);
    setMode(next);
  }

  /** Slider → clock-out time. Paid hours stay derived from the real schedule. */
  function setPaidHours(h: number) {
    const delta = Math.round(h * 60) - preview.paidMin;
    const win = Math.max(60, Math.min(23 * 60, preview.windowMin + delta));
    const fitted = fitTimes(start, toHHMM(toMinutes(start) + win), lunchStart, lunchEnd);
    setEnd(fitted.end);
    setLunchStart(fitted.bStart);
    setLunchEnd(fitted.bEnd);
  }

  function finish() {
    if (draft.amountCents <= 0) {
      show(t("qs.addPayFirst"));
      setStep(STEP_PAY);
      return;
    }
    replace(draft);
    track("setup_complete", {
      mode,
      currency,
      days: days,
      hours: preview.paidMin / 60,
      annual_hours: Math.round(preview.annualHours),
    });
    onClose();
    show(t("qs.saved"));
  }

  if (!mounted) return null;

  return createPortal(
    <>
      <div className={`scrim${open ? " on" : ""}`} onClick={onClose} aria-hidden="true" />
      <div
        className={`qs${open ? " on" : ""}`}
        data-step={step}
        role="dialog"
        aria-modal="true"
        aria-label={t("qs.title")}
        aria-hidden={!open}
        inert={!open ? true : undefined}
      >
        <div className="qs-head">
          <div className="qs-dots" aria-hidden="true">
            {[STEP_PAY, STEP_WHEN, STEP_HOURS].map((i) => (
              <span key={i} className={`qs-dot${i <= step ? " on" : ""}`} />
            ))}
          </div>
          <button type="button" className="qs-skip" onClick={onClose}>
            {step === LAST_STEP ? t("qs.notNow") : t("qs.skip")}
          </button>
        </div>

        <div className="qs-body">
          {step === STEP_PAY ? (
            <>
              <h3>{t("qs.step1.title")}</h3>
              <p className="qs-sub">{t("qs.step1.sub")}</p>

              <div className="qs-seg" role="group" aria-label={t("panel.howPaid")}>
                {(["annual", "monthly", "daily"] as QuickPayMode[]).map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={mode === option ? "on" : ""}
                    aria-pressed={mode === option}
                    onClick={() => switchMode(option)}
                  >
                    {t(PAY_OPTIONS[option].label)}
                  </button>
                ))}
              </div>

              <div className="qs-cur-row">
                <label htmlFor="qsCurrency">{t("panel.currency")}</label>
                <select
                  id="qsCurrency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                >
                  {CURRENCIES.map((code) => (
                    <option key={code} value={code}>
                      {code} · {currencyName(code, locale)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="qs-amount">
                <span className="cur">{sym}</span>
                <input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step="any"
                  value={amount}
                  onChange={(e) => {
                    const v = Number.parseFloat(e.target.value);
                    setAmount(Number.isFinite(v) ? Math.max(0, v) : 0);
                  }}
                  aria-label={t(`qs.${mode}Label`)}
                />
                <span className="unit">{t(PAY_OPTIONS[mode].unit)}</span>
              </div>

              <input
                className="qs-range"
                type="range"
                min={0}
                max={Math.max(PAY_OPTIONS[mode].max, amount)}
                step={PAY_OPTIONS[mode].step}
                value={amount}
                onChange={(e) => setAmount(Number.parseFloat(e.target.value))}
                aria-label={t("qs.dragAdjust")}
              />

              <p className="qs-pay-hint">{t("qs.step1.conversionHint")}</p>
            </>
          ) : null}

          {step === STEP_WHEN ? (
            <div className="qs-when">
              <h3>{t("qs.when.title")}</h3>
              <p className="qs-sub">{t("qs.when.sub")}</p>

              <div className="qs-field">
                <div className="qs-k">{t("qs.when.shift")}</div>
                <div className="qs-time-row">
                  <label className="qs-time" htmlFor="qsStart">
                    <span>{t("qs.when.start")}</span>
                    <input
                      id="qsStart"
                      type="time"
                      value={times.start}
                      onChange={(e) => changeTime("start", e.target.value || TIME_FALLBACK.start)}
                    />
                  </label>
                  <span className="qs-time-arrow" aria-hidden="true">→</span>
                  <label className="qs-time" htmlFor="qsEnd">
                    <span>{t("qs.when.end")}</span>
                    <input
                      id="qsEnd"
                      type="time"
                      value={times.end}
                      onChange={(e) => changeTime("end", e.target.value || TIME_FALLBACK.end)}
                    />
                  </label>
                </div>
              </div>

              <div className="qs-field">
                <div className="qs-switch-row">
                  <div>
                    <div className="qs-k">{t("qs.when.lunch")}</div>
                    <div className="qs-help">{t("qs.when.lunchHelp")}</div>
                  </div>
                  <label className="switch">
                    <input
                      id="qsLunch"
                      type="checkbox"
                      checked={lunchOn}
                      onChange={(e) => setLunchOn(e.target.checked)}
                      aria-label={t("qs.when.lunch")}
                    />
                    <span className="track" />
                  </label>
                </div>
                {lunchOn ? (
                  <div className="qs-time-row qs-time-row-lunch">
                    <label className="qs-time" htmlFor="qsBreakStart">
                      <span>{t("qs.when.breakStart")}</span>
                      <input
                        id="qsBreakStart"
                        type="time"
                        value={times.bStart}
                        onChange={(e) => changeTime("bStart", e.target.value || TIME_FALLBACK.bStart)}
                      />
                    </label>
                    <span className="qs-time-arrow" aria-hidden="true">→</span>
                    <label className="qs-time" htmlFor="qsBreakEnd">
                      <span>{t("qs.when.breakEnd")}</span>
                      <input
                        id="qsBreakEnd"
                        type="time"
                        value={times.bEnd}
                        onChange={(e) => changeTime("bEnd", e.target.value || TIME_FALLBACK.bEnd)}
                      />
                    </label>
                  </div>
                ) : null}
              </div>

              <div className="qs-k qs-tl-title">
                <span>{t("qs.when.timeline")}</span>
                <b>{hoursLabel(preview.paidMin / 60)} {t("qs.when.paidShort")}</b>
              </div>
              <div className="qs-timeline" aria-hidden="true">
                {timeline.map((seg, i) => (
                  <span key={i} className={`qs-tl-${seg.key}`} style={{ flex: seg.min }} />
                ))}
              </div>
              <div className="qs-tl-legend">
                <span><i className="qs-tl-paid-dot" />{t("qs.when.paid")}</span>
                <span><i className="qs-tl-pause-dot" />{t("qs.when.paused")}</span>
              </div>

              <div className="qs-when-note">{t("qs.when.pauseNote")}</div>
            </div>
          ) : null}

          {step === STEP_HOURS ? (
            <>
              <h3>{t("qs.step2.title")}</h3>
              <p className="qs-sub">{t("qs.step2.sub")}</p>

              <div className="qs-field">
                <div className="qs-k">{t("qs.step2.daysWeek")}</div>
                <div className="qs-days">
                  {DAY_OPTIONS.map((d) => (
                    <button
                      key={d}
                      type="button"
                      className={days === d ? "on" : ""}
                      onClick={() => setDays(d)}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div className="qs-field">
                <div className="qs-k">
                  {t("qs.step2.hoursDay")} <b>{hoursLabel(preview.paidMin / 60)}</b>
                </div>
                <input
                  className="qs-range"
                  type="range"
                  min={1}
                  max={16}
                  step={0.25}
                  value={preview.paidMin / 60}
                  onChange={(e) => setPaidHours(Number.parseFloat(e.target.value))}
                  aria-label={t("qs.step2.hoursDay")}
                />
                <p className="qs-hours-hint">{t("qs.when.hoursHint")}</p>
              </div>

              <div className="qs-fact">
                {t("qs.step2.fact", {
                  hours: Math.round(preview.annualHours).toLocaleString(locale),
                  rate: formatRate(preview.hourlyCents, currency),
                })}
              </div>
            </>
          ) : null}
        </div>

        {/*
          Keep the rate card outside the scrolling body. Step 2 is the tallest
          step; if the card scrolled with it, a short laptop viewport would
          clip exactly the number the visitor is trying to sanity-check.
        */}
        <div className="qs-preview">
          <div>
            <div className="k">{t("qs.preview.earn")}</div>
            <div className="v">
              {formatRate(preview.perSecondCents, currency, 4)}
              <span className="u">{t("qs.preview.sec")}</span>
            </div>
          </div>
          <div className="qs-preview-r">
            {formatRate(preview.hourlyCents, currency)}
            <span className="u">{t("qs.preview.hr")}</span>
          </div>
        </div>

        <div className="qs-foot">
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => (step === STEP_PAY ? onClose() : setStep(step - 1))}
          >
            {step === STEP_PAY ? t("qs.cancel") : t("qs.back")}
          </button>
          <button
            type="button"
            className="btn btn-ink"
            onClick={() => {
              if (step < LAST_STEP) {
                setStep(step + 1);
                return;
              }
              finish();
            }}
          >
            {step < LAST_STEP ? t("qs.next") : t("qs.startClock")}
          </button>
        </div>
      </div>
    </>,
    document.body,
  );
}
