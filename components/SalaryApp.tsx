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
  nextShiftLabel,
  periodBases,
  toHHMM,
} from "@/lib/schedule";
import { useNow, useSettings, useToast } from "@/lib/store";
import { EMOJI_PALETTE, pickWishEmoji } from "@/lib/wish";
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

function pad2(n: number): string {
  return (n < 10 ? "0" : "") + n;
}

export function SalaryApp() {
  const { t } = useI18n();
  const { settings, demo, hydrated, update } = useSettings();
  const { show } = useToast();
  const now = useNow(100);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const live = mounted && hydrated;

  const [panelOpen, setPanelOpen] = useState(false);
  const [settleOpen, setSettleOpen] = useState(false);
  const [qsOpen, setQsOpen] = useState(false);
  const [slack, setSlack] = useState({ on: false, startedAt: 0, totalSec: 0 });
  const [wishName, setWishName] = useState("");
  const [wishPrice, setWishPrice] = useState("");
  const [wishUnit, setWishUnit] = useState<"price" | "hours">("price");
  const [extraLabel, setExtraLabel] = useState("");
  const [extraAmount, setExtraAmount] = useState("");

  const closePanel = useCallback(() => setPanelOpen(false), []);
  const openPanel = useCallback(() => setPanelOpen(true), []);
  const closeSettle = useCallback(() => setSettleOpen(false), []);

  const busyRef = useRef(false);
  busyRef.current = panelOpen || settleOpen;

  useEffect(() => {
    if (!live || !demo) return;
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
  }, [live, demo]);

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

  const demoStartRef = useRef(Date.now());

  const snapshot = compute(settings, live ? now : new Date(2026, 0, 1, 9, 0, 0), {
    demo,
    demoStartMs: live ? demoStartRef.current : undefined,
  });

  const bases = useMemo(
    () => periodBases(settings, new Date()),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [settings, dayKey],
  );

  const extrasCents = useMemo(
    () => extrasThisMonth(settings, new Date()),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [settings.extras, monthKey],
  );

  const derived = snapshot.derived;
  const sym = symbolFor(settings.currency);

  const monthBaseCents = bases.monthBeforeCents + snapshot.earnedCents;
  const unpaidCents = settings.unpaidDays * derived.dailyCents;
  const monthTotalCents = monthBaseCents + extrasCents - unpaidCents;

  const jarCents = Math.max(0, monthBaseCents) * (settings.jarRate / 100);
  const jarPct = settings.jarGoalCents > 0 ? Math.min(100, (jarCents / settings.jarGoalCents) * 100) : 0;

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
  const statusInfo = demo
    ? { label: t("status.preview"), live: true }
    : (() => {
        const s = STATUS_MAP[snapshot.status];
        return s ? { label: t(s.key), live: s.live } : { label: t("status.working"), live: true };
      })();
  const earning = Boolean(statusInfo.live);

  // Countdown labels
  let cdLabel = t("cd.nextShift");
  let cdValue = "—";
  if (snapshot.status === "working" || snapshot.status === "break") {
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
    cdValue = nextShiftLabel(settings, now);
  }

  // Pause notes
  let pauseNote: string | null = null;
  if (live && !demo && snapshot.status === "break") {
    const active = breaksToday(settings).find(
      (b) => snapshot.shiftMin >= b.start && snapshot.shiftMin < b.end,
    );
    pauseNote = active
      ? `${t("pause.breakResume")} ${toHHMM(active.end % (24 * 60))}`
      : t("pause.break");
  } else if (live && !demo && snapshot.status === "before") {
    pauseNote = `${t("pause.before")} ${settings.start}`;
  } else if (live && !demo && snapshot.status === "done") {
    pauseNote = t("pause.done");
  } else if (live && !demo && snapshot.status === "dayoff") {
    pauseNote = t("pause.dayoff");
  }

  const ticker = splitCents(live ? snapshot.earnedCents : 0, settings.currency);
  const privacy = settings.privacy;
  const ringC = 2 * Math.PI * 62;

  const blur = privacy ? " blurred" : "";

  // Milestone
  const MILE_LADDER = [25, 50, 100, 250, 500, 1_000, 2_500, 5_000, 10_000, 25_000, 50_000];
  const mileMinStep = derived.perSecondCents * 90;
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

  // Wishlist form preview
  const wishTyped = clampNumber(wishPrice, 0, 100_000_000);
  let wishPreview: string;
  if (wishTyped === null || wishTyped <= 0) {
    wishPreview = wishUnit === "hours" ? t("wish.preview.typeHours") : t("wish.preview.typePrice");
  } else if (derived.hourlyCents <= 0) {
    wishPreview = t("wish.preview.setPay");
  } else if (wishUnit === "hours") {
    wishPreview = `≈ ${formatCents(Math.round(wishTyped * derived.hourlyCents), settings.currency)}`;
  } else {
    wishPreview = `≈ ${((wishTyped * 100) / derived.hourlyCents).toFixed(1)} ${t("wish.preview.hoursOfWork")}`;
  }

  function addWish() {
    const name = wishName.trim();
    const value = clampNumber(wishPrice, 0.01, 100_000_000);
    if (!name || value === null) {
      show(t("wish.nameNumber"));
      return;
    }
    let priceCents: number;
    if (wishUnit === "hours") {
      if (derived.hourlyCents <= 0) {
        show(t("wish.setPayFirst"));
        return;
      }
      priceCents = Math.round(value * derived.hourlyCents);
    } else {
      priceCents = Math.round(value * 100);
    }
    if (priceCents <= 0) {
      show(t("wish.nothing"));
      return;
    }
    update({
      wishlist: [
        ...settings.wishlist,
        {
          id: `w${Date.now()}`,
          name: name.slice(0, 40),
          priceCents,
          emoji: pickWishEmoji(name),
        },
      ],
    });
    setWishName("");
    setWishPrice("");
    track("wish_add", { unit: wishUnit, items: settings.wishlist.length + 1 });
    show(t("toast.addedWish"));
  }

  function setWishEmoji(id: string, choice: string) {
    update({
      wishlist: settings.wishlist.map((w) => {
        if (w.id !== id) return w;
        if (choice === "auto") return { ...w, emoji: pickWishEmoji(w.name), emojiPicked: false };
        return { ...w, emoji: choice, emojiPicked: true };
      }),
    });
  }

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
          label: extraLabel.trim().slice(0, 24) || "Extra",
          amountCents: Math.round(amount * 100),
          ts: Date.now(),
        },
      ],
    });
    setExtraLabel("");
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
            <button type="button" className="btn btn-ink btn-sm" onClick={openPanel}>
              {t("action.setPay")}
            </button>
          </div>
        </div>

        <div className={`demo-bar${demo ? " on" : ""}`}>
          <span>
            {t("demo.text")}
          </span>
          <button type="button" className="btn btn-ink btn-sm" onClick={() => setQsOpen(true)}>
            {t("demo.btn")}
          </button>
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
            {live && (snapshot.status === "working" || snapshot.status === "break") && (() => {
              const remainSec = Math.max(0, (snapshot.shiftEndMin - snapshot.shiftMin) * 60);
              return (
                <div className="clockout-bar">
                  <span className="clockout-label">{t("tick.clockOutIn")}</span>
                  <span className="clockout-value">{untilLabel(remainSec)}</span>
                  <span className="clockout-time">{settings.end}</span>
                </div>
              );
            })()}
            {live && snapshot.status === "done" && (
              <div className="clockout-bar done">
                <span className="clockout-label">{t("tick.shiftDone")}</span>
                <span className="clockout-value">{settings.end}</span>
              </div>
            )}

            <div className="tick-sub">
              <span>
                {t("tick.atRate")} <b className={privacy ? "blurred" : undefined}>{formatRate(derived.hourlyCents, settings.currency)}/hr</b>
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
                <div className={`v${blur}`}>{formatRate(derived.perMinuteCents, settings.currency)}</div>
              </div>
              <div className="chip">
                <div className="k">{t("tick.perHour")}</div>
                <div className={`v${blur}`}>{formatRate(derived.hourlyCents, settings.currency)}</div>
              </div>
              <div className="chip">
                <div className="k">{t("tick.perSecond")}</div>
                <div className={`v${blur}`}>{formatRate(derived.perSecondCents, settings.currency, 4)}</div>
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

        <div className="grid-3">
          <div className="mod">
            <h3>{t("jar.title")}</h3>
            <div className="hint">{t("jar.hint", { rate: settings.jarRate })}</div>
            <div className={`big${blur}`}>{formatCents(live ? jarCents : 0, settings.currency, { digits: 0 })}</div>
            <div className="jar">
              <i style={{ width: `${live ? jarPct.toFixed(1) : 0}%` }} />
            </div>
            <div className="rowline">
              <span>{t("jar.goal")}</span>
              <b className={privacy ? "blurred" : undefined}>
                {formatCents(settings.jarGoalCents, settings.currency, { digits: 0 })}
              </b>
            </div>
            <div className="rowline">
              <span>{t("jar.leftToGo")}</span>
              <b className={privacy ? "blurred" : undefined}>
                {formatCents(Math.max(0, settings.jarGoalCents - (live ? jarCents : 0)), settings.currency, { digits: 0 })}
              </b>
            </div>
            <div className="jar-note">
              {jarPct >= 100 ? t("jar.goalReached") : t("jar.progress", { pct: Math.round(live ? jarPct : 0) })}
            </div>
          </div>

          <div className="mod">
            <h3>{t("wish.title")}</h3>
            <div className="hint">{t("wish.hint")}</div>
            <ul className="wishlist">
              {settings.wishlist.length === 0 ? (
                <li style={{ color: "var(--faint)", fontWeight: 700, fontSize: 13 }}>
                  {t("wish.empty")}
                </li>
              ) : (
                settings.wishlist.map((item) => {
                  const hours = derived.hourlyCents > 0 ? item.priceCents / derived.hourlyCents : 0;
                  const pct =
                    item.priceCents > 0
                      ? Math.min(100, ((live ? monthTotalCents : 0) / item.priceCents) * 100)
                      : 0;
                  return (
                    <li key={item.id}>
                      <span className="em" title={t("wish.emojiChange")}>
                        {item.emoji}
                        <select
                          className="em-pick"
                          value={item.emojiPicked ? item.emoji : "auto"}
                          onChange={(e) => setWishEmoji(item.id, e.target.value)}
                          aria-label={`${t("wish.emojiChange")} ${item.name}`}
                        >
                          <option value="auto">{t("wish.emojiAuto")} — {pickWishEmoji(item.name)}</option>
                          {!EMOJI_PALETTE.includes(item.emoji) ? (
                            <option value={item.emoji}>{item.emoji}</option>
                          ) : null}
                          {EMOJI_PALETTE.filter((e) => e !== item.emoji).map((e) => (
                            <option key={e} value={e}>
                              {e}
                            </option>
                          ))}
                        </select>
                      </span>
                      <span className="nm">
                        {item.name.startsWith("preset.")
                          ? t(`wish.${item.name}`)
                          : item.name}
                      </span>
                      <span className="hr">{hours > 0 ? `${hours.toFixed(1)} h` : "—"}</span>
                      <span
                        style={{
                          width: 52,
                          height: 6,
                          borderRadius: 99,
                          background: "var(--line)",
                          overflow: "hidden",
                          display: "inline-block",
                        }}
                      >
                        <i
                          style={{
                            display: "block",
                            height: "100%",
                            width: `${pct.toFixed(0)}%`,
                            background: "var(--mint)",
                          }}
                        />
                      </span>
                      <button
                        type="button"
                        aria-label={`${t("wish.emojiChange")} ${item.name}`}
                        onClick={() =>
                          update({ wishlist: settings.wishlist.filter((w) => w.id !== item.id) })
                        }
                      >
                        ×
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
            <div className="wish-em-hint">{t("wish.emojiHint")}</div>
            <div className="mini-form">
              <input
                placeholder={t("wish.placeholder")}
                maxLength={24}
                value={wishName}
                onChange={(e) => setWishName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addWish()}
                aria-label={t("wish.title")}
              />
              <input
                type="number"
                placeholder={wishUnit === "hours" ? "10" : "120"}
                inputMode="decimal"
                min={0}
                step="any"
                value={wishPrice}
                onChange={(e) => setWishPrice(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addWish()}
                aria-label={
                  wishUnit === "hours"
                    ? t("wish.unit.hours")
                    : t("wish.unit.price", { sym })
                }
              />
              <button type="button" onClick={addWish} aria-label={t("wish.title")}>
                +
              </button>
            </div>
            <div className="wish-unit-row">
              <div className="wish-unit" role="group" aria-label={t("wish.unit.hours")}>
                <button
                  type="button"
                  className={wishUnit === "price" ? "on" : ""}
                  aria-pressed={wishUnit === "price"}
                  onClick={() => setWishUnit("price")}
                >
                  {t("wish.unit.price", { sym })}
                </button>
                <button
                  type="button"
                  className={wishUnit === "hours" ? "on" : ""}
                  aria-pressed={wishUnit === "hours"}
                  onClick={() => setWishUnit("hours")}
                >
                  {t("wish.unit.hours")}
                </button>
              </div>
              <span className="wish-preview">{wishPreview}</span>
            </div>
          </div>

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
              <input
                placeholder={t("month.extraPlaceholder")}
                maxLength={18}
                value={extraLabel}
                onChange={(e) => setExtraLabel(e.target.value)}
                aria-label={t("month.extraPlaceholder")}
              />
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
