"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { formatCents, formatRate, splitCents, symbolFor } from "@/lib/money";
import {
  breaksToday,
  compute,
  dateKey,
  daysUntilPayday,
  extrasThisMonth,
  formatClock,
  formatHM,
  nextShift,
  periodBases,
  toHHMM,
} from "@/lib/schedule";
import { useNow, useSettings, useToast } from "@/lib/store";
import type { Snapshot } from "@/lib/types";
import { track, trackOnce } from "@/lib/analytics";
import { QuickStart } from "./QuickStart";
import { SetupPanel } from "./SetupPanel";
import { SettlementModal } from "./SettlementModal";

function clampNumber(value: string, min: number, max: number): number | null {
  const n = Number.parseFloat(value);
  if (!Number.isFinite(n)) return null;
  return Math.min(max, Math.max(min, n));
}

/** 3725 → "1h 02m", 95 → "1m 35s" — how long until the next milestone. */
function untilLabel(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m ${pad2(s % 60)}s`;
  return `${Math.floor(s / 3600)}h ${pad2(Math.floor((s % 3600) / 60))}m`;
}

/** "Today 09:00" / "明天 09:00" / "周一 09:00" — never a hard-coded English day. */
function shiftWhen(
  dayOffset: number,
  start: string,
  now: Date,
  t: (key: string) => string,
): string {
  if (dayOffset === 0) return `${t("day.today")} ${start}`;
  if (dayOffset === 1) return `${t("day.tomorrow")} ${start}`;
  const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() + dayOffset);
  return `${t(`day.${day.getDay()}`)} ${start}`;
}

function pad2(n: number): string {
  return (n < 10 ? "0" : "") + n;
}

export function SalaryApp() {
  const { t } = useI18n();
  const { settings, hydrated, update } = useSettings();
  const { show } = useToast();
  const now = useNow(100);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const live = mounted && hydrated;

  const [panelOpen, setPanelOpen] = useState(false);
  const [settleOpen, setSettleOpen] = useState(false);
  const [qsOpen, setQsOpen] = useState(false);
  const [slack, setSlack] = useState({ on: false, startedAt: 0, totalSec: 0 });
  const [extraAmount, setExtraAmount] = useState("");

  const closePanel = useCallback(() => setPanelOpen(false), []);
    const closeSettle = useCallback(() => setSettleOpen(false), []);

  const busyRef = useRef(false);
  busyRef.current = panelOpen || settleOpen;

  /** Until the visitor saves their own pay there is nothing to count. */
  const onboarded = settings.onboarded;

  useEffect(() => {
    if (!live || onboarded) return;
    let dismissed = false;
    try {
      dismissed = sessionStorage.getItem("st.qs.skip") === "1";
    } catch {
      dismissed = false;
    }
    if (dismissed) return;
    const timer = setTimeout(() => {
      if (busyRef.current) return;
      setQsOpen(true);
      trackOnce("quickstart_shown");
    }, 12_000);
    return () => clearTimeout(timer);
  }, [live, onboarded]);

  const closeQuickStart = useCallback(() => {
    setQsOpen(false);
    try {
      sessionStorage.setItem("st.qs.skip", "1");
    } catch {
      /* private mode */
    }
  }, []);

  const dayKey = dateKey(now);
  const monthKey = `${now.getFullYear()}-${now.getMonth()}`;

  const raw = compute(settings, live ? now : new Date(2026, 0, 1, 9, 0, 0));

  /**
   * Empty state: before setup the app must not invent a salary. Everything
   * money-shaped reads zero and the clock stays idle, so the first screen
   * never shows a fake number ticking up.
   */
  const snapshot: Snapshot = onboarded
    ? raw
    : { ...raw, status: "before", paidElapsedMin: 0, overtimeMin: 0, earnedCents: 0, progress: 0 };

  const bases = useMemo(
    () => (onboarded ? periodBases(settings, new Date()) : {
      monthBeforeCents: 0,
      monthDays: 0,
      monthTotalDays: 0,
      yearBeforeCents: 0,
      yearDays: 0,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [settings, dayKey, onboarded],
  );

  const extrasCents = useMemo(
    () => extrasThisMonth(settings, new Date()),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [settings.extras, monthKey],
  );

  const derived = snapshot.derived;
  const sym = symbolFor(settings.currency);

  /**
   * Rates are derived from the saved pay, so before setup they must read zero.
   * Otherwise the page would advertise an hourly figure the visitor never gave.
   */
  const rateHour = onboarded ? derived.hourlyCents : 0;
  const rateMin = onboarded ? derived.perMinuteCents : 0;
  const rateSec = onboarded ? derived.perSecondCents : 0;

  const monthBaseCents = bases.monthBeforeCents + snapshot.earnedCents;
  const unpaidCents = settings.unpaidDays * derived.dailyCents;
  const monthTotalCents = monthBaseCents + extrasCents - unpaidCents;

  const slackSeconds =
    slack.totalSec + (slack.on ? Math.max(0, (now.getTime() - slack.startedAt) / 1000) : 0);

  // Status labels via i18n
  const STATUS_MAP: Record<string, { key: string; live: boolean }> = {
    working: { key: "status.working", live: true },
    break: { key: "status.break", live: false },
    overtime: { key: "status.overtime", live: true },
    before: { key: "status.before", live: false },
    done: { key: "status.done", live: false },
    dayoff: { key: "status.dayoff", live: false },
  };
  const statusInfo = !onboarded
    ? { label: t("status.unset"), live: false }
    : (() => {
        const s = STATUS_MAP[snapshot.status];
        return s ? { label: t(s.key), live: s.live } : { label: t("status.working"), live: true };
      })();
  const earning = Boolean(statusInfo.live);

  const upcoming = onboarded ? nextShift(settings, now) : null;

  // Countdown labels
  let cdLabel = t("cd.nextShift");
  let cdValue = "—";
  if (!onboarded) {
    // No schedule yet — a countdown would be counting down to nothing.
    cdLabel = t("cd.notSet");
    cdValue = "—";
  } else if (snapshot.status === "working" || snapshot.status === "break") {
    cdLabel = t("cd.clockOutIn");
    cdValue = formatClock((snapshot.shiftEndMin - snapshot.shiftMin) * 60);
  } else if (snapshot.status === "overtime") {
    cdLabel = t("cd.overtimeFor");
    cdValue = formatClock(snapshot.overtimeMin * 60);
  } else if (snapshot.status === "before") {
    cdLabel = t("cd.shiftStartsIn");
    cdValue = formatClock((derived.startMin - snapshot.nowMin) * 60);
  } else if (snapshot.status === "done") {
    cdLabel = t("cd.shiftComplete");
    cdValue = formatHM(derived.paidMin);
  } else {
    cdLabel = t("cd.nextShift");
    cdValue = upcoming ? shiftWhen(upcoming.dayOffset, upcoming.start, now, t) : "—";
  }

  /**
   * The hero card needs one number that keeps moving even while the clock is
   * stopped. Without it, "clocked out" and "day off" are a frozen figure with
   * nothing to wait for — and the visit ends right there.
   */
  let idle: { label: string; seconds: number; when: string } | null = null;
  if (live && onboarded && !earning) {
    if (snapshot.status === "break") {
      const active = breaksToday(settings).find(
        (b) => snapshot.shiftMin >= b.start && snapshot.shiftMin < b.end,
      );
      if (active) {
        idle = {
          label: t("tick.breakEndsIn"),
          seconds: Math.max(0, (active.end - snapshot.shiftMin) * 60),
          when: toHHMM(active.end % (24 * 60)),
        };
      }
    } else if (upcoming) {
      idle = {
        label: snapshot.status === "before" ? t("tick.shiftStartsIn") : t("tick.nextShiftIn"),
        seconds: upcoming.seconds,
        when: shiftWhen(upcoming.dayOffset, upcoming.start, now, t),
      };
    }
  }

  // Pause notes — only where the countdown alone doesn't explain the pause.
  let pauseNote: string | null = null;
  if (live && onboarded && snapshot.status === "dayoff") {
    pauseNote = t("pause.dayoff");
  }

  const ticker = splitCents(live ? snapshot.earnedCents : 0, settings.currency);
  const privacy = settings.privacy;
  const ringC = 2 * Math.PI * 62;

  const blur = privacy ? " blurred" : "";

  // Milestone
  //
  // The cadence matters more than the amount: this is the page's only reward
  // loop, and a visitor who leaves at 40s has to still have an event coming up.
  // The step is picked so the next milestone is ~20s away, and because every
  // ladder rung is at most 2.5× the one below, the worst case stays under 50s —
  // something is always inside the next minute.
  const MILE_LADDER = [1, 2, 5, 10, 25, 50, 100, 250, 500, 1_000, 2_500, 5_000, 10_000, 25_000, 50_000];
  const MILE_TARGET_SEC = 20;
  const mileMinStep = derived.perSecondCents * MILE_TARGET_SEC;
  const mileStepCents = MILE_LADDER.find((s) => s >= mileMinStep) ?? 100_000;
  const mileNextCents = (Math.floor(snapshot.earnedCents / mileStepCents) + 1) * mileStepCents;
  const mileRemainCents = Math.max(0, mileNextCents - snapshot.earnedCents);
  const mileSeconds = derived.perSecondCents > 0 ? mileRemainCents / derived.perSecondCents : 0;
  const mileProgress = Math.min(1, Math.max(0, 1 - mileRemainCents / mileStepCents));
  const mileDigits: 0 | 2 = mileStepCents < 100 ? 2 : 0;
  const mileIdx = Math.floor(snapshot.earnedCents / mileStepCents);

  const mileRef = useRef(-1);
  const popsRef = useRef(0);
  const [pop, setPop] = useState(false);

  useEffect(() => {
    if (!live || !earning) return;
    if (mileRef.current < 0) {
      mileRef.current = mileIdx;
      return;
    }
    if (mileIdx <= mileRef.current) return;
    mileRef.current = mileIdx;
    setPop(true);
    if (popsRef.current < 5) {
      popsRef.current += 1;
      track("milestone", { n: popsRef.current, step_cents: mileStepCents });
    }
    const timer = setTimeout(() => setPop(false), 900);
    return () => clearTimeout(timer);
  }, [mileIdx, live, earning, mileStepCents]);

  function addExtra() {
    const amount = clampNumber(extraAmount, -1_000_000, 1_000_000);
    if (amount === null || amount === 0) {
      show(t("month.enterAmount"));
      return;
    }
    update({
      extras: [
        ...settings.extras,
        {
          id: `e${Date.now()}`,
          label: t("month.extraPlaceholder"),
          amountCents: Math.round(amount * 100),
          ts: Date.now(),
        },
      ],
    });
    setExtraAmount("");
    show(t("toast.extraAdded"));
  }

  return (
    <div className="app-shell" id="timer">
      <div className="app">
        <div className="app-top">
          <div className={`status${statusInfo.live ? "" : " idle"}`}>
            <span className="dot" />
            <span>{live ? statusInfo.label : t("status.working")}</span>
          </div>
          <div className="app-actions">
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => {
                update({ privacy: !privacy });
                show(privacy ? t("toast.numbersVisible") : t("toast.numbersHidden"));
              }}
            >
              {privacy ? t("action.showNumbers") : t("action.hideNumbers")}
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => {
                track("settle_open");
                setSettleOpen(true);
              }}
            >
              {t("action.settle")}
            </button>
            <button
              type="button"
              className="btn btn-ink btn-sm"
              onClick={() => (onboarded ? setPanelOpen(true) : setQsOpen(true))}
            >
              {t("action.setPay")}
            </button>
          </div>
        </div>

        <div className="grid-main">
          <div className={`tick-card${earning ? "" : " paused"}`}>
            <div className="tick-label">{t("tick.earnedToday")}</div>
            <div className={`ticker${blur}${pop ? " pop" : ""}`}>
              <span className="cur">{sym}</span>
              <span>{ticker.whole}</span>
              {ticker.frac ? <span className="cents">{ticker.frac}</span> : null}
            </div>
            {live && earning && mileSeconds > 0 ? (
              <div className="next-mile">
                <span>{t("tick.nextMilestone")} {formatCents(mileNextCents, settings.currency, { digits: mileDigits })}</span>
                <span className="bar" aria-hidden="true">
                  <i style={{ width: `${(mileProgress * 100).toFixed(1)}%` }} />
                </span>
                <b>{untilLabel(mileSeconds)}</b>
              </div>
            ) : null}
            {pauseNote ? <div className="tick-pause">{pauseNote}</div> : null}

            {/* Clock-out countdown — gives users a reason to keep the tab open */}
            {live && snapshot.status === "working" && (() => {
              const remainSec = Math.max(0, (snapshot.shiftEndMin - snapshot.shiftMin) * 60);
              return (
                <div className="clockout-bar">
                  <span className="clockout-label">{t("tick.clockOutIn")}</span>
                  <span className="clockout-value">{untilLabel(remainSec)}</span>
                  <span className="clockout-time">{settings.end}</span>
                </div>
              );
            })()}
            {/* Stopped clock: the countdown to whatever happens next is the only
                thing still moving, so it takes the hero slot. */}
            {idle ? (
              <div className="clockout-bar idle">
                <span className="clockout-label">{idle.label}</span>
                <span className="clockout-value">{untilLabel(idle.seconds)}</span>
                <span className="clockout-time">{idle.when}</span>
              </div>
            ) : null}

            <div className="tick-sub">
              <span>
                {t("tick.atRate")} <b className={privacy ? "blurred" : undefined}>{formatRate(rateHour, settings.currency)}/hr</b>
              </span>
              <span className="sep" />
              <span>
                <b className={privacy ? "blurred" : undefined}>
                  {live ? formatHM(snapshot.paidElapsedMin) : "0h 00m"}
                </b>{" "}
                {t("tick.paidToday")}
              </span>
              <span className="sep" />
              <span>
                <b className={privacy ? "blurred" : undefined}>
                  {live ? formatCents(monthTotalCents, settings.currency) : formatCents(0, settings.currency)}
                </b>{" "}
                {t("tick.thisMonth")}
              </span>
              {(() => {
                const pd = daysUntilPayday(settings, now);
                if (pd === 0) return (
                  <>
                    <span className="sep" />
                    <span className="payday-today">{t("tick.paydayToday")}</span>
                  </>
                );
                return (
                  <>
                    <span className="sep" />
                    <span>
                      {t("tick.untilPayday")} <b>{t(pd === 1 ? "tick.dayLeft" : "tick.daysLeft", { n: pd })}</b>
                    </span>
                  </>
                );
              })()}
            </div>

            <div className="chip-row">
              <div className="chip">
                <div className="k">{t("tick.perMinute")}</div>
                <div className={`v${blur}`}>{formatRate(rateMin, settings.currency)}</div>
              </div>
              <div className="chip">
                <div className="k">{t("tick.perHour")}</div>
                <div className={`v${blur}`}>{formatRate(rateHour, settings.currency)}</div>
              </div>
              <div className="chip">
                <div className="k">{t("tick.perSecond")}</div>
                <div className={`v${blur}`}>{formatRate(rateSec, settings.currency, 4)}</div>
              </div>
            </div>
          </div>

          <div className="side-stack">
            <div className="ring-card">
              <div className="ring-wrap">
                <svg width="150" height="150" viewBox="0 0 150 150" aria-hidden="true">
                  <circle className="ring-bg" cx="75" cy="75" r="62" />
                  <circle
                    className="ring-fg"
                    cx="75"
                    cy="75"
                    r="62"
                    strokeDasharray={ringC.toFixed(1)}
                    strokeDashoffset={(ringC * (1 - (live ? snapshot.progress : 0))).toFixed(1)}
                  />
                </svg>
                <div className="ring-center">
                  <div className={`ring-pct${blur}`}>
                    {Math.round((live ? snapshot.progress : 0) * 100)}%
                  </div>
                  <div className="ring-cap">{t("tick.ofShift")}</div>
                </div>
              </div>
              <div className="cd">
                <div className="k">{cdLabel}</div>
                <div className="v">{cdValue}</div>
              </div>
            </div>

            <div className="slack-card">
              <div>
                <div className="k">
                  {slack.on ? t("slack.slackingFor") : slackSeconds > 5 ? t("slack.slackedToday") : t("slack.mode")}
                </div>
                <div className="v">
                  {slack.on
                    ? `${formatClock(slackSeconds)} · ${t("slack.clockPaused")}`
                    : slackSeconds > 5
                      ? `${formatClock(slackSeconds)} · ${t("slack.noPay")}`
                      : t("slack.tap")}
                </div>
              </div>
              <button
                type="button"
                className={`slack-btn${slack.on ? " on" : ""}`}
                onClick={() => {
                  track("slack_toggle", { on: !slack.on });
                  setSlack((prev) =>
                    prev.on
                      ? {
                          on: false,
                          startedAt: 0,
                          totalSec: prev.totalSec + (now.getTime() - prev.startedAt) / 1000,
                        }
                      : { on: true, startedAt: now.getTime(), totalSec: prev.totalSec },
                  );
                }}
              >
                {slack.on ? t("slack.backToWork") : t("slack.away")}
              </button>
            </div>
          </div>
        </div>

        <div className="grid-1">
          <div className="mod">
            <h3>{t("month.title")}</h3>
            <div className="hint">{t("month.hint")}</div>
            <div className="rowline">
              <span>{t("month.baseEarned")}</span>
              <b className={privacy ? "blurred" : undefined}>
                {formatCents(live ? monthBaseCents : 0, settings.currency)}
              </b>
            </div>
            <div className="rowline">
              <span>{t("month.extras")}</span>
              <b className={privacy ? "blurred" : undefined}>
                +{formatCents(extrasCents, settings.currency)}
              </b>
            </div>
            <div className="rowline">
              <span>{t("month.unpaidDays")}</span>
              <b className={privacy ? "blurred" : undefined}>
                −{formatCents(unpaidCents, settings.currency)}
              </b>
            </div>
            <div
              className="rowline"
              style={{ borderTop: "2px dashed var(--line)", marginTop: 4, paddingTop: 9 }}
            >
              <span>{t("month.total")}</span>
              <b
                className={privacy ? "blurred" : undefined}
                style={{ fontSize: 19 }}
              >
                {formatCents(live ? monthTotalCents : 0, settings.currency)}
              </b>
            </div>
            <div className="mini-form">
              {/* Plain text, not a field: only the amount is editable here. */}
              <span className="mini-form-label">{t("month.extraPlaceholder")}</span>
              <input
                type="number"
                placeholder="50"
                inputMode="decimal"
                value={extraAmount}
                onChange={(e) => setExtraAmount(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addExtra()}
                aria-label={t("month.extraPlaceholder")}
              />
              <button type="button" onClick={addExtra} aria-label={t("month.extraPlaceholder")}>
                +
              </button>
            </div>
            <div className="rowline" style={{ marginTop: 8 }}>
              <span>{t("month.unpaidThisMonth")}</span>
              <input
                type="number"
                min={0}
                max={31}
                value={settings.unpaidDays}
                onChange={(e) => {
                  const v = clampNumber(e.target.value, 0, 31);
                  update({ unpaidDays: v === null ? 0 : Math.round(v) });
                }}
                aria-label={t("month.unpaidThisMonth")}
                style={{ width: 64, padding: "6px 8px", fontSize: 13, textAlign: "center" }}
              />
            </div>
          </div>
        </div>
      </div>

      <SetupPanel open={panelOpen} onClose={closePanel} />
      <QuickStart open={qsOpen} onClose={closeQuickStart} />
      <SettlementModal
        open={settleOpen}
        onClose={closeSettle}
        snapshot={snapshot}
        settings={settings}
        paydayDays={daysUntilPayday(settings, now)}
      />
    </div>
  );
}
