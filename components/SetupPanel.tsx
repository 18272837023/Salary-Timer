"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useI18n } from "@/lib/i18n";
import { CURRENCIES, centsToInput, currencyName, formatCents, formatRate, parseAmountToCents } from "@/lib/money";
import { compute, dateKey, derive, formatHM } from "@/lib/schedule";
import { makeId } from "@/lib/defaults";
import { useNow, useSettings, useToast } from "@/lib/store";
import type { PayMode, Settings } from "@/lib/types";

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

/** Preset multipliers offered in the dropdown; anything else renders as custom. */
const OT_PRESETS = [1.25, 1.5, 1.75, 2];

function multLabel(mult: number): string {
  return Number.isInteger(mult) ? String(mult) : String(Math.round(mult * 100) / 100);
}

export function SetupPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { t, lang } = useI18n();
  const { settings, replace, demo } = useSettings();
  const { show } = useToast();
  const [draft, setDraft] = useState<Settings>(settings);
  const [amountText, setAmountText] = useState(centsToInput(settings.amountCents, settings.currency));
  const [otHoursText, setOtHoursText] = useState<string | null>(null);
  const [otHoursEditing, setOtHoursEditing] = useState(false);
  const amountRef = useRef<HTMLInputElement>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    setDraft(settings);
    setAmountText(centsToInput(settings.amountCents, settings.currency));
    setOtHoursText(null);
    setOtHoursEditing(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

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

  const preview = useMemo(() => derive(draft), [draft]);

  const now = useNow(open ? 1000 : 30000);
  const minuteKey = Math.floor(now.getTime() / 60_000);
  const overtimeMin = useMemo(
    () => (draft.overtime ? compute(draft, new Date(), { demo: false }).overtimeMin : 0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [draft, minuteKey],
  );

  const locale = lang === "zh" ? "zh-CN" : "en-US";

  const modeLabel: Record<PayMode, string> = {
    annual: t("panel.yearly"),
    monthly: t("panel.monthly"),
    daily: t("panel.daily"),
    hourly: t("panel.hourly"),
  };
  const amountLabel: Record<PayMode, string> = {
    annual: t("panel.annualLabel"),
    monthly: t("panel.monthlyLabel"),
    daily: t("panel.dailyLabel"),
    hourly: t("panel.hourlyLabel"),
  };

  function patch(next: Partial<Settings>) {
    setDraft((prev) => ({ ...prev, ...next }));
  }

  function changePayMode(mode: PayMode) {
    if (mode === draft.mode) return;
    const cents = parseAmountToCents(amountText);
    if (cents === null) {
      patch({ mode });
      return;
    }
    const current = derive({ ...draft, amountCents: cents });
    const annualCents = current.hourlyCents * current.annualHours;
    const nextCents = Math.max(0, Math.round(
      mode === "annual" ? annualCents
        : mode === "monthly" ? annualCents / 12
          : mode === "daily" ? current.dailyCents : current.hourlyCents,
    ));
    patch({ mode, amountCents: nextCents });
    setAmountText(centsToInput(nextCents, draft.currency));
  }

  /**
   * Currency is a label, not a conversion: there are no exchange rates in a
   * static offline app, so the typed number is kept and only the symbol
   * changes. The help text under the picker says so explicitly.
   */
  function changeCurrency(code: Settings["currency"]) {
    patch({ currency: code });
    const cents = parseAmountToCents(amountText);
    setAmountText(cents === null ? amountText : centsToInput(cents, code));
  }

  const todayKey = dateKey(new Date());
  const manualOt =
    draft.otOverride && draft.otOverride.day === todayKey ? draft.otOverride : undefined;

  function commitOtHours() {
    if (otHoursText === null) return;
    const typed = Number.parseFloat(otHoursText.replace(/[^0-9.]/g, ""));
    setOtHoursEditing(false);
    if (!Number.isFinite(typed) || typed < 0) return;
    const min = Math.min(24 * 60, Math.round(typed * 60));
    const clockMin = compute({ ...draft, otOverride: undefined }, new Date(), {
      demo: false,
    }).overtimeMin;
    if (min <= clockMin) {
      show(
        clockMin > 0
          ? t("panel.clockAlready", { time: formatHM(clockMin) })
          : t("panel.enterOt"),
      );
      patch({ otOverride: undefined });
      return;
    }
    patch({ otOverride: { day: todayKey, min } });
  }

  function toggleDay(day: number) {
    setDraft((prev) => {
      const has = prev.days.includes(day);
      const days = has ? prev.days.filter((d) => d !== day) : [...prev.days, day];
      return { ...prev, days: days.sort((a, b) => a - b) };
    });
  }

  function save() {
    const cents = parseAmountToCents(amountText);
    if (cents === null || cents <= 0) {
      show(t("panel.addPayFirst"));
      amountRef.current?.focus();
      return;
    }
    if (draft.days.length === 0) {
      show(t("panel.pickDay"));
      return;
    }
    const next: Settings = { ...draft, amountCents: cents, onboarded: true };
    replace(next);
    onClose();

    const snap = compute(next, new Date(), { demo: false });
    if (snap.status === "working" || snap.status === "overtime") {
      show(demo ? t("panel.savedRunning") : t("panel.savedUpdated"));
    } else if (snap.status === "break") {
      show(t("panel.savedBreak"));
    } else if (snap.status === "before") {
      show(t("panel.savedBefore", { time: next.start }));
    } else if (snap.status === "done") {
      show(t("panel.savedDone"));
    } else {
      show(t("panel.savedDayoff"));
    }
  }

  if (!mounted) return null;

  // Overtime name mapping
  const otNameKey = draft.otMult === 1.5 ? "panel.timeHalf" : draft.otMult === 2 ? "panel.doubleTime" : null;

  return createPortal(
    <>
      <div
        className={`scrim${open ? " on" : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`panel${open ? " on" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={t("panel.title")}
        aria-hidden={!open}
        inert={!open ? true : undefined}
      >
        <div className="panel-head">
          <h3>{t("panel.title")}</h3>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>
            {t("panel.close")}
          </button>
        </div>

        <div className="panel-body">
          <div className="field">
            <label>{t("panel.howPaid")}</label>
            <div className="seg seg-pay">
              {(["annual", "monthly", "daily", "hourly"] as PayMode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  className={draft.mode === m ? "on" : undefined}
                  onClick={() => changePayMode(m)}
                >
                  {modeLabel[m]}
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <label htmlFor="amountInput">{amountLabel[draft.mode]}</label>
            <input
              ref={amountRef}
              id="amountInput"
              type="number"
              min={0}
              step="any"
              inputMode="decimal"
              placeholder="78000"
              value={amountText}
              onChange={(e) => {
                const next = e.target.value;
                setAmountText(next);
                const cents = parseAmountToCents(next);
                if (cents !== null) patch({ amountCents: cents });
              }}
            />
          </div>

          <div className="field">
            <label htmlFor="currencyInput">{t("panel.currency")}</label>
            <select
              id="currencyInput"
              className="currency-select"
              value={draft.currency}
              onChange={(e) => changeCurrency(e.target.value as Settings["currency"])}
            >
              {CURRENCIES.map((code) => (
                <option key={code} value={code}>
                  {code} · {currencyName(code, locale)}
                </option>
              ))}
            </select>
            <div className="help">{t("panel.currencyHelp")}</div>
          </div>

          <div className="field">
            <label>{t("panel.workingDays")}</label>
            <div className="days">
              {DAY_LABELS.map((label, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={t(`day.${i}`)}
                  aria-pressed={draft.days.includes(i)}
                  className={draft.days.includes(i) ? "on" : undefined}
                  onClick={() => toggleDay(i)}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="help">{t("panel.daysHelp")}</div>
          </div>

          <div className="field">
            <div className="row2">
              <div>
                <label htmlFor="startInput">{t("panel.shiftStarts")}</label>
                <input
                  id="startInput"
                  type="time"
                  value={draft.start}
                  onChange={(e) => patch({ start: e.target.value || "09:00" })}
                />
              </div>
              <div>
                <label htmlFor="endInput">{t("panel.shiftEnds")}</label>
                <input
                  id="endInput"
                  type="time"
                  value={draft.end}
                  onChange={(e) => patch({ end: e.target.value || "17:30" })}
                />
              </div>
            </div>
          </div>

          <div className="field">
            <label>{t("panel.unpaidBreaks")}</label>
            <div className="break-list">
              {draft.breaks.map((b, i) => (
                <div className="break-item" key={b.id}>
                  <input
                    type="time"
                    aria-label={`${t("panel.unpaidBreaks")} ${i + 1}`}
                    value={b.start}
                    onChange={(e) =>
                      patch({
                        breaks: draft.breaks.map((x) =>
                          x.id === b.id ? { ...x, start: e.target.value || "12:00" } : x,
                        ),
                      })
                    }
                  />
                  <span style={{ color: "var(--faint)", fontWeight: 800 }}>→</span>
                  <input
                    type="time"
                    aria-label={`${t("panel.unpaidBreaks")} ${i + 1}`}
                    value={b.end}
                    onChange={(e) =>
                      patch({
                        breaks: draft.breaks.map((x) =>
                          x.id === b.id ? { ...x, end: e.target.value || "12:30" } : x,
                        ),
                      })
                    }
                  />
                  <button
                    type="button"
                    className="x"
                    aria-label={`${t("panel.unpaidBreaks")} ${i + 1}`}
                    onClick={() => patch({ breaks: draft.breaks.filter((x) => x.id !== b.id) })}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              className="add-link"
              onClick={() =>
                patch({ breaks: [...draft.breaks, { id: makeId("b"), start: "15:00", end: "15:15" }] })
              }
            >
              {t("panel.addBreak")}
            </button>
          </div>

          <div className="field">
            <label htmlFor="paydaySelect">{t("panel.payday")}</label>
            <select
              id="paydaySelect"
              value={String(draft.payday)}
              onChange={(e) =>
                patch({ payday: e.target.value === "last" ? "last" : Number(e.target.value) })
              }
            >
              {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                <option key={d} value={d}>
                  {t("panel.dayOfMonth", { d })}
                </option>
              ))}
              <option value="last">{t("panel.lastDay")}</option>
            </select>
            <div className="help">{t("panel.paydayHelp")}</div>
          </div>

          <div className="field">
            <div className="switch-row" style={{ paddingTop: 0 }}>
              <div>
                <div style={{ fontFamily: "var(--display)", fontWeight: 800, fontSize: 14 }}>
                  {t("panel.overtime")}
                </div>
                <div className="help" style={{ marginTop: 1 }}>
                  {t("panel.overtimeHelp")}
                </div>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={draft.overtime}
                  onChange={(e) => patch({ overtime: e.target.checked })}
                  aria-label={t("panel.overtime")}
                />
                <span className="track" />
              </label>
            </div>
            {draft.overtime && (
              <div style={{ marginTop: 4 }}>
                <select
                  aria-label={t("panel.otMult")}
                  value={String(draft.otMult)}
                  onChange={(e) => patch({ otMult: Number(e.target.value) })}
                >
                  <option value="1.25">1.25× {t("panel.overtime")}</option>
                  <option value="1.5">1.5× {t("panel.overtime")}</option>
                  <option value="1.75">1.75× {t("panel.overtime")}</option>
                  <option value="2">2× {t("panel.overtime")}</option>
                  {!OT_PRESETS.includes(draft.otMult) && (
                    <option value={String(draft.otMult)}>{multLabel(draft.otMult)}× {t("panel.overtime")}</option>
                  )}
                </select>
                <div className="ot-note">
                  {otNameKey ? `${t(otNameKey)} — ` : `${t("panel.otRate")} `}
                  <b>
                    {formatRate(preview.hourlyCents * draft.otMult, draft.currency)}
                    <span>/hr</span>
                  </b>
                </div>
                <div className="ot-pay">
                  <div className="ot-row">
                    <span className="ot-k">
                      {t("panel.otToday")}
                      {manualOt ? <span className="ot-badge">{t("panel.otManual")}</span> : null}
                    </span>
                    <span className="ot-v-sm">
                      {otHoursEditing ? (
                        <>
                          <input
                            className="ot-input ot-input-sm"
                            inputMode="decimal"
                            autoFocus
                            aria-label={t("panel.otToday")}
                            value={otHoursText ?? ""}
                            onChange={(e) => setOtHoursText(e.target.value)}
                            onFocus={(e) => e.currentTarget.select()}
                            onBlur={commitOtHours}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                commitOtHours();
                              }
                              if (e.key === "Escape") {
                                setOtHoursText(null);
                                setOtHoursEditing(false);
                              }
                            }}
                          />
                          <span className="ot-unit">h</span>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            className="ot-edit ot-edit-sm"
                            title={t("panel.otClickHint")}
                            onClick={() => {
                              setOtHoursText((overtimeMin / 60).toFixed(2));
                              setOtHoursEditing(true);
                            }}
                          >
                            {overtimeMin > 0 ? formatHM(overtimeMin) : t("panel.otNone")}
                          </button>
                          {manualOt ? (
                            <button
                              type="button"
                              className="ot-reset"
                              title={t("panel.otReset")}
                              aria-label={t("panel.otClearManual")}
                              onClick={() => patch({ otOverride: undefined })}
                            >
                              {t("panel.otReset")}
                            </button>
                          ) : null}
                        </>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="field">
            <div className="switch-row" style={{ paddingTop: 0 }}>
              <div>
                <div style={{ fontFamily: "var(--display)", fontWeight: 800, fontSize: 14 }}>
                  {t("panel.privacyMode")}
                </div>
                <div className="help" style={{ marginTop: 1 }}>
                  {t("panel.privacyHelp")}
                </div>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={draft.privacy}
                  onChange={(e) => patch({ privacy: e.target.checked })}
                  aria-label={t("panel.privacyMode")}
                />
                <span className="track" />
              </label>
            </div>
          </div>

          <div className="field">
            <label>{t("panel.jar")}</label>
            <div className="row2">
              <input
                type="number"
                min={0}
                step={50}
                placeholder={t("panel.jarGoal")}
                aria-label={t("panel.jarGoal")}
                value={centsToInput(draft.jarGoalCents, draft.currency)}
                onChange={(e) => {
                  const cents = parseAmountToCents(e.target.value);
                  patch({ jarGoalCents: cents ?? 0 });
                }}
              />
              <select
                aria-label={t("panel.jar")}
                value={String(draft.jarRate)}
                onChange={(e) => patch({ jarRate: Number(e.target.value) })}
              >
                {[5, 10, 15, 20, 30].map((r) => (
                  <option key={r} value={r}>
                    {t("panel.saveRate", { r })}
                  </option>
                ))}
              </select>
            </div>
            <div className="help">{t("panel.jarHelp")}</div>
          </div>

          <div className="preview">
            <div className="k">{t("panel.preview")}</div>
            <div className="v">{formatRate(preview.hourlyCents, draft.currency)}</div>
            <div className="s">
              {formatCents(preview.dailyCents, draft.currency)} {t("panel.previewPerDay")} ·{" "}
              {Math.round(preview.annualHours).toLocaleString(locale)} {t("panel.previewHoursYear")} ·{" "}
              {preview.dayCount} {t("panel.previewDaysWeek")} · {formatHM(preview.paidMin)} {t("panel.previewPaidShift")}
            </div>
          </div>
        </div>

        <div className="panel-foot">
          <button type="button" className="btn btn-mint" style={{ width: "100%" }} onClick={save}>
            {t("panel.startClock")}
          </button>
        </div>
      </div>
    </>,
    document.body,
  );
}
