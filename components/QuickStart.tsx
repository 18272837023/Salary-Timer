"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useI18n } from "@/lib/i18n";
import { track } from "@/lib/analytics";
import { SETTINGS_VERSION } from "@/lib/defaults";
import { formatRate, symbolFor } from "@/lib/money";
import { derive, toHHMM } from "@/lib/schedule";
import { useSettings, useToast } from "@/lib/store";
import type { BreakWindow, PayMode, Settings } from "@/lib/types";

const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0]; // Monday … Sunday
const GOALS = [500, 1000, 2500, 5000];
const DAY_OPTIONS = [3, 4, 5, 6];

function daysFor(count: number): number[] {
  return DAY_ORDER.slice(0, Math.min(7, Math.max(1, count))).sort((a, b) => a - b);
}

function shiftFor(hours: number): { start: string; end: string; breaks: BreakWindow[] } {
  const paidMin = Math.round(hours * 60);
  const lunch = hours >= 6;
  const startMin = 9 * 60;
  const windowMin = paidMin + (lunch ? 30 : 0);
  return {
    start: toHHMM(startMin),
    end: toHHMM(startMin + windowMin),
    breaks: lunch ? [{ id: "b1", start: "12:30", end: "13:00" }] : [],
  };
}

function hoursLabel(hours: number): string {
  return Number.isInteger(hours) ? `${hours} h` : `${hours.toFixed(1)} h`;
}

export function QuickStart({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t, lang } = useI18n();
  const { settings, replace } = useSettings();
  const { show } = useToast();

  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState<PayMode>("annual");
  const [annual, setAnnual] = useState(78_000);
  const [hourly, setHourly] = useState(32);
  const [days, setDays] = useState(5);
  const [hours, setHours] = useState(8);
  const [goal, setGoal] = useState(2_000);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    setStep(0);
    setMode(settings.mode === "hourly" ? "hourly" : "annual");
    setAnnual(settings.mode === "hourly" ? Math.round((settings.amountCents / 100) * 2000) : Math.round(settings.amountCents / 100));
    setHourly(settings.mode === "hourly" ? Math.round(settings.amountCents / 100) : 32);
    setDays(settings.days.length || 5);
    setHours(8);
    setGoal(Math.max(100, Math.round(settings.jarGoalCents / 100)));
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

  const draft = useMemo<Settings>(() => {
    const shift = shiftFor(hours);
    return {
      ...settings,
      mode,
      amountCents: Math.max(0, Math.round((mode === "annual" ? annual : hourly) * 100)),
      start: shift.start,
      end: shift.end,
      days: daysFor(days),
      breaks: shift.breaks,
      jarGoalCents: Math.round(goal * 100),
      onboarded: true,
      v: SETTINGS_VERSION,
    };
  }, [settings, mode, annual, hourly, days, hours, goal]);

  const preview = useMemo(() => derive(draft), [draft]);
  const sym = symbolFor(settings.currency);
  const locale = lang === "zh" ? "zh-CN" : "en-US";

  const goalCents = Math.round(goal * 100);
  const goalHours = preview.hourlyCents > 0 ? goalCents / preview.hourlyCents : 0;
  const weeklyPayCents = (preview.hourlyCents * preview.weeklyHours) || 0;
  const weeksToGoal =
    weeklyPayCents > 0 && settings.jarRate > 0
      ? goalCents / ((weeklyPayCents * settings.jarRate) / 100)
      : 0;

  function switchMode(next: PayMode) {
    if (next === mode) return;
    const hoursPerYear = preview.annualHours > 0 ? preview.annualHours : 2_080;
    if (next === "hourly") {
      setHourly(Math.max(1, Math.round((annual / hoursPerYear) * 100) / 100));
    } else {
      setAnnual(Math.max(1, Math.round((hourly * hoursPerYear) / 500) * 500));
    }
    setMode(next);
  }

  function finish() {
    if (draft.amountCents <= 0) {
      show(t("qs.addPayFirst"));
      setStep(0);
      return;
    }
    replace(draft);
    track("setup_complete", {
      mode,
      days: days,
      hours: hours,
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
        role="dialog"
        aria-modal="true"
        aria-label={t("qs.title")}
        aria-hidden={!open}
        inert={!open ? true : undefined}
      >
        <div className="qs-head">
          <div className="qs-dots" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <span key={i} className={`qs-dot${i <= step ? " on" : ""}`} />
            ))}
          </div>
          <button type="button" className="qs-skip" onClick={onClose}>
            {step === 2 ? t("qs.notNow") : t("qs.skip")}
          </button>
        </div>

        <div className="qs-body">
          {step === 0 ? (
            <>
              <h3>{t("qs.step1.title")}</h3>
              <p className="qs-sub">{t("qs.step1.sub")}</p>

              <div className="qs-seg">
                <button
                  type="button"
                  className={mode === "annual" ? "on" : ""}
                  onClick={() => switchMode("annual")}
                >
                  {t("qs.step1.perYear")}
                </button>
                <button
                  type="button"
                  className={mode === "hourly" ? "on" : ""}
                  onClick={() => switchMode("hourly")}
                >
                  {t("qs.step1.perHour")}
                </button>
              </div>

              <div className="qs-amount">
                <span className="cur">{sym}</span>
                <input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step="any"
                  value={mode === "annual" ? annual : hourly}
                  onChange={(e) => {
                    const v = Number.parseFloat(e.target.value);
                    const next = Number.isFinite(v) ? Math.max(0, v) : 0;
                    if (mode === "annual") setAnnual(next);
                    else setHourly(next);
                  }}
                  aria-label={mode === "annual" ? t("qs.annualLabel") : t("qs.hourlyLabel")}
                />
                <span className="unit">{mode === "annual" ? t("qs.step1.yearUnit") : t("qs.step1.hourUnit")}</span>
              </div>

              <input
                className="qs-range"
                type="range"
                min={mode === "annual" ? 20_000 : 8}
                max={mode === "annual" ? 250_000 : 150}
                step={mode === "annual" ? 500 : 1}
                value={mode === "annual" ? annual : hourly}
                onChange={(e) => {
                  const v = Number.parseFloat(e.target.value);
                  if (mode === "annual") setAnnual(v);
                  else setHourly(v);
                }}
                aria-label={t("qs.dragAdjust")}
              />
            </>
          ) : null}

          {step === 1 ? (
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
                  {t("qs.step2.hoursDay")} <b>{hoursLabel(hours)}</b>
                </div>
                <input
                  className="qs-range"
                  type="range"
                  min={4}
                  max={12}
                  step={0.5}
                  value={hours}
                  onChange={(e) => setHours(Number.parseFloat(e.target.value))}
                  aria-label={t("qs.step2.hoursDay")}
                />
              </div>

              <div className="qs-fact">
                {t("qs.step2.fact", {
                  hours: Math.round(preview.annualHours).toLocaleString(locale),
                  rate: formatRate(preview.hourlyCents, settings.currency),
                })}
              </div>
            </>
          ) : null}

          {step === 2 ? (
            <>
              <h3>{t("qs.step3.title")}</h3>
              <p className="qs-sub">{t("qs.step3.sub", { rate: settings.jarRate })}</p>

              <div className="qs-goals">
                {GOALS.map((g) => (
                  <button
                    key={g}
                    type="button"
                    className={goal === g ? "on" : ""}
                    onClick={() => setGoal(g)}
                  >
                    {sym}
                    {g.toLocaleString(locale)}
                  </button>
                ))}
              </div>

              <div className="qs-amount">
                <span className="cur">{sym}</span>
                <input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step="any"
                  value={goal}
                  onChange={(e) => {
                    const v = Number.parseFloat(e.target.value);
                    setGoal(Number.isFinite(v) ? Math.max(0, v) : 0);
                  }}
                  aria-label={t("qs.savingsGoal")}
                />
                <span className="unit">{t("qs.step3.goalUnit")}</span>
              </div>

              <div className="qs-fact">
                {goalHours > 0 ? (
                  <>
                    {t("qs.step3.factHours", { hours: goalHours.toFixed(1) })}
                    {weeksToGoal > 0 ? (
                      <>
                        {" "}
                        {t("qs.step3.factWeeks", { weeks: Math.ceil(weeksToGoal), rate: settings.jarRate })}
                      </>
                    ) : (
                      "."
                    )}
                  </>
                ) : (
                  t("qs.step3.addPay")
                )}
              </div>
            </>
          ) : null}

          <div className="qs-preview">
            <div>
              <div className="k">{t("qs.preview.earn")}</div>
              <div className="v">
                {formatRate(preview.perSecondCents, settings.currency, 4)}
                <span className="u">{t("qs.preview.sec")}</span>
              </div>
            </div>
            <div className="qs-preview-r">
              {formatRate(preview.hourlyCents, settings.currency)}
              <span className="u">{t("qs.preview.hr")}</span>
            </div>
          </div>
        </div>

        <div className="qs-foot">
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => (step === 0 ? onClose() : setStep(step - 1))}
          >
            {step === 0 ? t("qs.cancel") : t("qs.back")}
          </button>
          <button
            type="button"
            className="btn btn-ink"
            onClick={() => {
              if (step < 2) {
                setStep(step + 1);
                return;
              }
              finish();
            }}
          >
            {step < 2 ? t("qs.next") : t("qs.startClock")}
          </button>
        </div>
      </div>
    </>,
    document.body,
  );
}
