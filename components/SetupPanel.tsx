"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CURRENCIES, centsToInput, formatCents, formatRate, parseAmountToCents, symbolFor } from "@/lib/money";
import { compute, derive, formatHM } from "@/lib/schedule";
import { makeId } from "@/lib/defaults";
import { useSettings, useToast } from "@/lib/store";
import type { PayMode, Settings } from "@/lib/types";

const MODES: { value: PayMode; label: string }[] = [
  { value: "annual", label: "Yearly" },
  { value: "monthly", label: "Monthly" },
  { value: "hourly", label: "Hourly" },
];

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];
const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const AMOUNT_LABEL: Record<PayMode, string> = {
  annual: "Annual salary (gross)",
  monthly: "Monthly salary (gross)",
  hourly: "Hourly rate",
};

export function SetupPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { settings, replace, demo } = useSettings();
  const { show } = useToast();
  const [draft, setDraft] = useState<Settings>(settings);
  const [amountText, setAmountText] = useState(centsToInput(settings.amountCents));
  const amountRef = useRef<HTMLInputElement>(null);
  // Portal to <body> so sticky header (z-index 50) can't cover the dialog —
  // it's otherwise trapped under .app-shell's stacking context (z-index 1).
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Keep a stable close handle so the scroll-lock effect doesn't re-run every
  // parent render (SalaryApp re-renders ~10×/sec for the live clock).
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // Re-seed the form each time the panel opens, so a cancelled edit never leaks.
  // Intentionally keyed on `open` only — mid-edit settings updates from elsewhere
  // shouldn't wipe the draft the visitor is typing.
  useEffect(() => {
    if (!open) return;
    setDraft(settings);
    setAmountText(centsToInput(settings.amountCents));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- seed on open, not on every settings tick
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

  function patch(next: Partial<Settings>) {
    setDraft((prev) => ({ ...prev, ...next }));
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
      show("Add your pay first 🙂");
      amountRef.current?.focus();
      return;
    }
    if (draft.days.length === 0) {
      show("Pick at least one working day");
      return;
    }
    const next: Settings = { ...draft, amountCents: cents, onboarded: true };
    replace(next);
    onClose();

    // Tell the truth about whether the counter will climb right now — saving
    // onto an unpaid break used to promise "the clock is running" while the
    // big number sat still, which felt like a bug.
    const snap = compute(next, new Date(), { demo: false });
    if (snap.status === "working" || snap.status === "overtime") {
      show(demo ? "Saved — the clock is running" : "Settings updated — clock running");
    } else if (snap.status === "break") {
      show("Saved — paused for unpaid break");
    } else if (snap.status === "before") {
      show(`Saved — shift starts at ${next.start}`);
    } else if (snap.status === "done") {
      show("Saved — shift complete for today");
    } else {
      show("Saved — today is a day off");
    }
  }

  if (!mounted) return null;

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
        aria-label="Pay setup"
        aria-hidden={!open}
        inert={!open ? true : undefined}
      >
        <div className="panel-head">
          <h3>⚙️ Your pay setup</h3>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="panel-body">
          <div className="field">
            <label>How are you paid?</label>
            <div className="seg">
              {MODES.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  className={draft.mode === m.value ? "on" : undefined}
                  onClick={() => patch({ mode: m.value })}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <label htmlFor="amountInput">{AMOUNT_LABEL[draft.mode]}</label>
            <div className="row2" style={{ gridTemplateColumns: "1.5fr 1fr" }}>
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
                  // Keep the live hourly-rate preview in sync while typing —
                  // otherwise the "your real hourly rate" box lags a keystroke
                  // behind and shows the old salary.
                  const cents = parseAmountToCents(next);
                  if (cents !== null) patch({ amountCents: cents });
                }}
              />
              <select
                aria-label="Currency"
                value={draft.currency}
                onChange={(e) => patch({ currency: e.target.value as Settings["currency"] })}
              >
                {CURRENCIES.map((code) => (
                  <option key={code} value={code}>
                    {code} {symbolFor(code)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="field">
            <label>Working days</label>
            <div className="days">
              {DAY_LABELS.map((label, i) => (
                <button
                  key={DAY_NAMES[i]}
                  type="button"
                  aria-label={DAY_NAMES[i]}
                  aria-pressed={draft.days.includes(i)}
                  className={draft.days.includes(i) ? "on" : undefined}
                  onClick={() => toggleDay(i)}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="help">Tap the days you actually work — not the ones in your contract.</div>
          </div>

          <div className="field">
            <div className="row2">
              <div>
                <label htmlFor="startInput">Shift starts</label>
                <input
                  id="startInput"
                  type="time"
                  value={draft.start}
                  onChange={(e) => patch({ start: e.target.value || "09:00" })}
                />
              </div>
              <div>
                <label htmlFor="endInput">Shift ends</label>
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
            <label>Unpaid breaks</label>
            <div className="break-list">
              {draft.breaks.map((b, i) => (
                <div className="break-item" key={b.id}>
                  <input
                    type="time"
                    aria-label={`Break ${i + 1} start`}
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
                    aria-label={`Break ${i + 1} end`}
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
                    aria-label={`Remove break ${i + 1}`}
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
              + Add a break
            </button>
          </div>

          <div className="field">
            <label htmlFor="paydaySelect">Payday</label>
            <select
              id="paydaySelect"
              value={String(draft.payday)}
              onChange={(e) =>
                patch({ payday: e.target.value === "last" ? "last" : Number(e.target.value) })
              }
            >
              {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                <option key={d} value={d}>
                  Day {d} of the month
                </option>
              ))}
              <option value="last">Last day of the month</option>
            </select>
            <div className="help">Used for the payday countdown.</div>
          </div>

          <div className="field">
            <div className="switch-row" style={{ paddingTop: 0 }}>
              <div>
                <div style={{ fontFamily: "var(--display)", fontWeight: 800, fontSize: 14 }}>
                  Overtime after clock-out
                </div>
                <div className="help" style={{ marginTop: 1 }}>
                  Keep counting at a higher rate
                </div>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={draft.overtime}
                  onChange={(e) => patch({ overtime: e.target.checked })}
                  aria-label="Overtime after clock-out"
                />
                <span className="track" />
              </label>
            </div>
            {draft.overtime && (
              <div style={{ marginTop: 4 }}>
                <select
                  aria-label="Overtime multiplier"
                  value={String(draft.otMult)}
                  onChange={(e) => patch({ otMult: Number(e.target.value) })}
                >
                  <option value="1.25">1.25× overtime</option>
                  <option value="1.5">1.5× overtime</option>
                  <option value="1.75">1.75× overtime</option>
                  <option value="2">2× overtime</option>
                </select>
              </div>
            )}
          </div>

          <div className="field">
            <div className="switch-row" style={{ paddingTop: 0 }}>
              <div>
                <div style={{ fontFamily: "var(--display)", fontWeight: 800, fontSize: 14 }}>
                  Privacy mode
                </div>
                <div className="help" style={{ marginTop: 1 }}>
                  Blur every number on screen
                </div>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={draft.privacy}
                  onChange={(e) => patch({ privacy: e.target.checked })}
                  aria-label="Privacy mode"
                />
                <span className="track" />
              </label>
            </div>
          </div>

          <div className="field">
            <label>Savings jar</label>
            <div className="row2">
              <input
                type="number"
                min={0}
                step={50}
                placeholder="Goal"
                aria-label="Savings goal"
                value={centsToInput(draft.jarGoalCents)}
                onChange={(e) => {
                  const cents = parseAmountToCents(e.target.value);
                  patch({ jarGoalCents: cents ?? 0 });
                }}
              />
              <select
                aria-label="Savings rate"
                value={String(draft.jarRate)}
                onChange={(e) => patch({ jarRate: Number(e.target.value) })}
              >
                {[5, 10, 15, 20, 30].map((r) => (
                  <option key={r} value={r}>
                    Save {r}%
                  </option>
                ))}
              </select>
            </div>
            <div className="help">The jar fills from your earnings at this rate.</div>
          </div>

          <div className="preview">
            <div className="k">Your real hourly rate</div>
            <div className="v">{formatRate(preview.hourlyCents, draft.currency)}</div>
            <div className="s">
              {formatCents(preview.dailyCents, draft.currency)} per day ·{" "}
              {Math.round(preview.annualHours).toLocaleString("en-US")} paid hours a year ·{" "}
              {preview.dayCount} days a week · {formatHM(preview.paidMin)} paid per shift
            </div>
          </div>
        </div>

        <div className="panel-foot">
          <button type="button" className="btn btn-mint" style={{ width: "100%" }} onClick={save}>
            Start the clock
          </button>
        </div>
      </div>
    </>,
    document.body,
  );
}
