"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { SetupPanel } from "./SetupPanel";
import { SettlementModal } from "./SettlementModal";

const STATUS_COPY: Record<string, { label: string; live: boolean }> = {
  working: { label: "On the clock", live: true },
  break: { label: "On an unpaid break", live: false },
  overtime: { label: "Overtime", live: true },
  before: { label: "Shift hasn't started", live: false },
  done: { label: "Clocked out", live: false },
  dayoff: { label: "Day off", live: false },
};

const WISH_EMOJIS = ["🎁", "🎧", "🎫", "👟", "🏝️", "📱", "💻", "🚲", "⌚", "🍽️", "🎮", "📚"];

function clampNumber(value: string, min: number, max: number): number | null {
  const n = Number.parseFloat(value);
  if (!Number.isFinite(n)) return null;
  return Math.min(max, Math.max(min, n));
}

export function SalaryApp() {
  const { settings, demo, hydrated, update } = useSettings();
  const { show } = useToast();
  const now = useNow(100);

  // Time-dependent numbers are only rendered after mount so the server HTML and
  // the first client render agree exactly (no hydration mismatch, no flash of
  // wrong data — crawlers get the static marketing copy, which is what matters).
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const live = mounted && hydrated;

  const [panelOpen, setPanelOpen] = useState(false);
  const [settleOpen, setSettleOpen] = useState(false);
  const [slack, setSlack] = useState({ on: false, startedAt: 0, totalSec: 0 });
  const [wishName, setWishName] = useState("");
  const [wishPrice, setWishPrice] = useState("");
  const [extraLabel, setExtraLabel] = useState("");
  const [extraAmount, setExtraAmount] = useState("");

  // Stable callbacks — SetupPanel's scroll-lock effect must not re-fire every
  // clock tick (a new inline lambda would steal body overflow and leave the
  // page stuck non-scrollable after close).
  const closePanel = useCallback(() => setPanelOpen(false), []);
  const openPanel = useCallback(() => setPanelOpen(true), []);
  const closeSettle = useCallback(() => setSettleOpen(false), []);

  const dayKey = dateKey(now);
  const monthKey = `${now.getFullYear()}-${now.getMonth()}`;

  // Anchor for the demo clock so it advances from the moment the page loaded.
  const demoStartRef = useRef(Date.now());

  // Compute on every tick (cheap) — avoid memoizing against Date identity so a
  // settings save can never leave a stale frozen frame on screen.
  const snapshot = compute(settings, live ? now : new Date(2026, 0, 1, 9, 0, 0), {
    demo,
    demoStartMs: live ? demoStartRef.current : undefined,
  });

  const bases = useMemo(
    // Cheap once a day, expensive 10× a second — keyed on the calendar day only.
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

  const status = demo ? { label: "Previewing a shift", live: true } : STATUS_COPY[snapshot.status];
  const earning = Boolean(status.live);

  let cdLabel = "Next shift";
  let cdValue = "—";
  if (snapshot.status === "working" || snapshot.status === "break") {
    cdLabel = "Clock out in";
    cdValue = formatClock((snapshot.shiftEndMin - snapshot.shiftMin) * 60);
  } else if (snapshot.status === "overtime") {
    cdLabel = "Overtime for";
    cdValue = formatClock(snapshot.overtimeMin * 60);
  } else if (snapshot.status === "before") {
    cdLabel = "Shift starts in";
    cdValue = formatClock((derived.startMin - snapshot.nowMin) * 60);
  } else if (snapshot.status === "done") {
    cdLabel = "Shift complete";
    cdValue = formatHM(derived.paidMin);
  } else {
    cdLabel = "Next shift";
    cdValue = nextShiftLabel(settings, now);
  }

  // Visible reason the big number isn't climbing — otherwise a lunch break after
  // "Start the clock" looks exactly like the timer died.
  let pauseNote: string | null = null;
  if (live && !demo && snapshot.status === "break") {
    const active = breaksToday(settings).find(
      (b) => snapshot.shiftMin >= b.start && snapshot.shiftMin < b.end,
    );
    pauseNote = active
      ? `Unpaid break — counting resumes at ${toHHMM(active.end % (24 * 60))}`
      : "Unpaid break — pay paused";
  } else if (live && !demo && snapshot.status === "before") {
    pauseNote = `Shift starts at ${settings.start}`;
  } else if (live && !demo && snapshot.status === "done") {
    pauseNote = "Clocked out — see you next shift";
  } else if (live && !demo && snapshot.status === "dayoff") {
    pauseNote = "Day off — nothing to count today";
  }

  const ticker = live ? splitCents(snapshot.earnedCents) : { whole: "0", frac: ".00" };
  const privacy = settings.privacy;
  const ringC = 2 * Math.PI * 62;

  const blur = privacy ? " blurred" : "";

  function addWish() {
    const name = wishName.trim();
    const price = clampNumber(wishPrice, 0.01, 100_000_000);
    if (!name || price === null) {
      show("Name and price, please");
      return;
    }
    update({
      wishlist: [
        ...settings.wishlist,
        {
          id: `w${Date.now()}`,
          name: name.slice(0, 40),
          priceCents: Math.round(price * 100),
          emoji: WISH_EMOJIS[Math.floor(Math.random() * WISH_EMOJIS.length)],
        },
      ],
    });
    setWishName("");
    setWishPrice("");
    show("Added to your wishlist");
  }

  function addExtra() {
    const amount = clampNumber(extraAmount, -1_000_000, 1_000_000);
    if (amount === null || amount === 0) {
      show("Enter an amount");
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
    show("Extra income added");
  }

  return (
    <div className="app-shell" id="timer">
      <div className="app">
        <div className="app-top">
          <div className={`status${status.live ? "" : " idle"}`}>
            <span className="dot" />
            <span>{live ? status.label : "On the clock"}</span>
          </div>
          <div className="app-actions">
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => {
                update({ privacy: !privacy });
                show(privacy ? "Numbers visible 👀" : "Numbers hidden 🙈");
              }}
            >
              {privacy ? "👀 Show numbers" : "🙈 Hide numbers"}
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setSettleOpen(true)}
            >
              📋 Today&apos;s settlement
            </button>
            <button type="button" className="btn btn-ink btn-sm" onClick={openPanel}>
              ⚙️ Set my pay
            </button>
          </div>
        </div>

        <div className={`demo-bar${demo ? " on" : ""}`}>
          <span>
            👋 You&apos;re looking at a demo salary of <b>$78,000/yr</b>. The clock is running so you
            can see how it feels.
          </span>
          <button type="button" className="btn btn-ink btn-sm" onClick={openPanel}>
            Make it mine
          </button>
        </div>

        <div className="grid-main">
          <div className={`tick-card${earning ? "" : " paused"}`}>
            <div className="tick-label">Earned today</div>
            <div className={`ticker${blur}`}>
              <span className="cur">{sym}</span>
              <span>{ticker.whole}</span>
              <span className="cents">{ticker.frac}</span>
            </div>
            {pauseNote ? <div className="tick-pause">{pauseNote}</div> : null}
            <div className="tick-sub">
              <span>
                at <b className={privacy ? "blurred" : undefined}>{formatRate(derived.hourlyCents, settings.currency)}/hr</b>
              </span>
              <span className="sep" />
              <span>
                <b className={privacy ? "blurred" : undefined}>
                  {live ? formatHM(snapshot.paidElapsedMin) : "0h 00m"}
                </b>{" "}
                paid today
              </span>
              <span className="sep" />
              <span>
                <b className={privacy ? "blurred" : undefined}>
                  {live ? formatCents(monthTotalCents, settings.currency) : formatCents(0, settings.currency)}
                </b>{" "}
                this month
              </span>
            </div>

            <div className="chip-row">
              <div className="chip">
                <div className="k">Per minute</div>
                <div className={`v${blur}`}>{formatRate(derived.perMinuteCents, settings.currency)}</div>
              </div>
              <div className="chip">
                <div className="k">Per hour</div>
                <div className={`v${blur}`}>{formatRate(derived.hourlyCents, settings.currency)}</div>
              </div>
              <div className="chip">
                <div className="k">Per second</div>
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
                  <div className="ring-cap">of shift</div>
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
                  {slack.on ? "Slacking for" : slackSeconds > 5 ? "Slacked today" : "Slack mode"}
                </div>
                <div className="v">
                  {slack.on
                    ? `${formatClock(slackSeconds)} · clock paused`
                    : slackSeconds > 5
                      ? `${formatClock(slackSeconds)} · no pay, no guilt`
                      : "Tap when you wander off"}
                </div>
              </div>
              <button
                type="button"
                className={`slack-btn${slack.on ? " on" : ""}`}
                onClick={() =>
                  setSlack((prev) =>
                    prev.on
                      ? {
                          on: false,
                          startedAt: 0,
                          totalSec: prev.totalSec + (now.getTime() - prev.startedAt) / 1000,
                        }
                      : { on: true, startedAt: now.getTime(), totalSec: prev.totalSec },
                  )
                }
              >
                {slack.on ? "Back to work" : "☕ Away"}
              </button>
            </div>
          </div>
        </div>

        <div className="grid-3">
          <div className="mod">
            <h3>🏺 Savings jar</h3>
            <div className="hint">Saving {settings.jarRate}% of everything you earn</div>
            <div className={`big${blur}`}>{formatCents(live ? jarCents : 0, settings.currency, { digits: 0 })}</div>
            <div className="jar">
              <i style={{ width: `${live ? jarPct.toFixed(1) : 0}%` }} />
            </div>
            <div className="rowline">
              <span>Goal</span>
              <b className={privacy ? "blurred" : undefined}>
                {formatCents(settings.jarGoalCents, settings.currency, { digits: 0 })}
              </b>
            </div>
            <div className="rowline">
              <span>Left to go</span>
              <b className={privacy ? "blurred" : undefined}>
                {formatCents(Math.max(0, settings.jarGoalCents - (live ? jarCents : 0)), settings.currency, { digits: 0 })}
              </b>
            </div>
            <div className="jar-note">
              {jarPct >= 100 ? "Goal reached 🎉" : `${Math.round(live ? jarPct : 0)}% there — keep going 🐷`}
            </div>
          </div>

          <div className="mod">
            <h3>🎁 Wishlist</h3>
            <div className="hint">Every price, in hours of your life</div>
            <ul className="wishlist">
              {settings.wishlist.length === 0 ? (
                <li style={{ color: "var(--faint)", fontWeight: 700, fontSize: 13 }}>
                  Nothing yet — add something you are saving for.
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
                      <span className="em">{item.emoji}</span>
                      <span className="nm">{item.name}</span>
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
                        aria-label={`Remove ${item.name}`}
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
            <div className="mini-form">
              <input
                placeholder="Concert ticket"
                maxLength={24}
                value={wishName}
                onChange={(e) => setWishName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addWish()}
                aria-label="Wishlist item name"
              />
              <input
                type="number"
                placeholder="120"
                inputMode="decimal"
                value={wishPrice}
                onChange={(e) => setWishPrice(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addWish()}
                aria-label="Wishlist item price"
              />
              <button type="button" onClick={addWish} aria-label="Add wishlist item">
                +
              </button>
            </div>
          </div>

          <div className="mod">
            <h3>💸 This month, honestly</h3>
            <div className="hint">Base pay plus extras, minus unpaid days</div>
            <div className="rowline">
              <span>Base earned</span>
              <b className={privacy ? "blurred" : undefined}>
                {formatCents(live ? monthBaseCents : 0, settings.currency)}
              </b>
            </div>
            <div className="rowline">
              <span>Extras (bonus, tips, OT)</span>
              <b className={privacy ? "blurred" : undefined}>
                +{formatCents(extrasCents, settings.currency)}
              </b>
            </div>
            <div className="rowline">
              <span>Unpaid days off</span>
              <b className={privacy ? "blurred" : undefined}>
                −{formatCents(unpaidCents, settings.currency)}
              </b>
            </div>
            <div
              className="rowline"
              style={{ borderTop: "2px dashed var(--line)", marginTop: 4, paddingTop: 9 }}
            >
              <span>Total</span>
              <b
                className={privacy ? "blurred" : undefined}
                style={{ fontSize: 19 }}
              >
                {formatCents(live ? monthTotalCents : 0, settings.currency)}
              </b>
            </div>
            <div className="mini-form">
              <input
                placeholder="Bonus / tips"
                maxLength={18}
                value={extraLabel}
                onChange={(e) => setExtraLabel(e.target.value)}
                aria-label="Extra income label"
              />
              <input
                type="number"
                placeholder="50"
                inputMode="decimal"
                value={extraAmount}
                onChange={(e) => setExtraAmount(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addExtra()}
                aria-label="Extra income amount"
              />
              <button type="button" onClick={addExtra} aria-label="Add extra income">
                +
              </button>
            </div>
            <div className="rowline" style={{ marginTop: 8 }}>
              <span>Unpaid days this month</span>
              <input
                type="number"
                min={0}
                max={31}
                value={settings.unpaidDays}
                onChange={(e) => {
                  const v = clampNumber(e.target.value, 0, 31);
                  update({ unpaidDays: v === null ? 0 : Math.round(v) });
                }}
                aria-label="Unpaid days this month"
                style={{ width: 64, padding: "6px 8px", fontSize: 13, textAlign: "center" }}
              />
            </div>
          </div>
        </div>
      </div>

      <SetupPanel open={panelOpen} onClose={closePanel} />
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
