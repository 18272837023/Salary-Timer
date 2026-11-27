"use client";

import { useEffect, useRef, useState } from "react";
import { centsToInput, formatCents, symbolFor } from "@/lib/money";
import { derive, formatClock } from "@/lib/schedule";
import { useSettings } from "@/lib/store";

/**
 * The manual mode for `/salary-stopwatch`.
 *
 * This is deliberately NOT the homepage timer. The homepage knows your saved
 * schedule and counts by itself; this one knows nothing about schedules and
 * counts only between the moment you press Start and the moment you press
 * Pause. That independence is the reason the page is allowed to exist at all —
 * a "salary stopwatch" page backed by a schedule-driven counter would be the
 * homepage with a different title.
 *
 * Time is accumulated in refs rather than state so a re-render can never lose
 * a segment: `sinceRef` holds the start of the current segment, `paidRef` and
 * `breakRef` hold everything committed before it. The interval exists only to
 * re-render, never to add time — a backgrounded tab that throttles timers still
 * gets the right total, because the total is a subtraction of two timestamps.
 *
 * A pause and a break stop the clock the same way but mean different things, so
 * they are recorded separately: pause is "I stopped looking", a break is unpaid
 * time you want to see the cost of.
 */

type Status = "idle" | "running" | "paused" | "break";

interface Session {
  id: number;
  seconds: number;
  cents: number;
}

const TICK_MS = 250;
/** Only sessions worth logging. Below a second there is nothing to bill. */
const MIN_SESSION_SECONDS = 1;
const MAX_SESSIONS = 5;

export function SalaryStopwatch() {
  const { settings, hydrated } = useSettings();
  const [rate, setRate] = useState("25");
  const [status, setStatus] = useState<Status>("idle");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [now, setNow] = useState(0);

  const paidRef = useRef(0);
  const breakRef = useRef(0);
  const sinceRef = useRef<number | null>(null);

  const currency = settings.currency;
  const sym = symbolFor(currency);

  // Prefill once from the saved pay, then leave the field alone: retyping a
  // rate the visitor just corrected would be the worst kind of helpful.
  const prefilled = useRef(false);
  useEffect(() => {
    if (!hydrated || prefilled.current) return;
    prefilled.current = true;
    const { hourlyCents } = derive(settings);
    if (hourlyCents > 0) setRate(centsToInput(Math.round(hourlyCents), settings.currency));
  }, [hydrated, settings]);

  // Re-render only. Time itself comes from timestamp arithmetic below.
  useEffect(() => {
    if (status !== "running" && status !== "break") return;
    const id = window.setInterval(() => setNow(Date.now()), TICK_MS);
    return () => window.clearInterval(id);
  }, [status]);

  const rateNum = Number.parseFloat(rate);
  const rateCents = Number.isFinite(rateNum) && rateNum > 0 ? rateNum * 100 : 0;

  const live = sinceRef.current !== null ? Math.max(0, now - sinceRef.current) : 0;
  const paidMs = paidRef.current + (status === "running" ? live : 0);
  const breakMs = breakRef.current + (status === "break" ? live : 0);

  const paidSeconds = paidMs / 1000;
  const breakSeconds = breakMs / 1000;
  const earnedCents = (paidSeconds * rateCents) / 3600;

  /** Close the current segment into the right bucket and restart the clock. */
  const commit = (at: number) => {
    if (sinceRef.current !== null) {
      const delta = Math.max(0, at - sinceRef.current);
      if (status === "running") paidRef.current += delta;
      else if (status === "break") breakRef.current += delta;
    }
    sinceRef.current = at;
    setNow(at);
  };

  const start = () => {
    if (status !== "idle") return;
    const at = Date.now();
    sinceRef.current = at;
    setNow(at);
    setStatus("running");
  };

  const pause = () => {
    if (status !== "running" && status !== "break") return;
    commit(Date.now());
    sinceRef.current = null;
    setStatus("paused");
  };

  const resume = () => {
    if (status !== "paused" && status !== "break") return;
    const at = Date.now();
    // Coming back from a break, the open segment is break time and has to be
    // closed as break time — otherwise the break would be paid for.
    if (status === "break") commit(at);
    if (sinceRef.current === null) sinceRef.current = at;
    setNow(at);
    setStatus("running");
  };

  const toggleBreak = () => {
    const at = Date.now();
    if (status === "running") {
      commit(at);
      setStatus("break");
    } else if (status === "break") {
      commit(at);
      setStatus("running");
    }
  };

  const reset = () => {
    const at = Date.now();
    // Log what the session was worth before wiping it — otherwise Reset throws
    // away the only number the visitor came for.
    const totalMs = paidRef.current + (status === "running" && sinceRef.current !== null ? at - sinceRef.current : 0);
    const seconds = Math.round(totalMs / 1000);
    if (seconds >= MIN_SESSION_SECONDS && rateCents > 0) {
      setSessions((list) =>
        [{ id: at, seconds, cents: (seconds * rateCents) / 3600 }, ...list].slice(0, MAX_SESSIONS),
      );
    }
    paidRef.current = 0;
    breakRef.current = 0;
    sinceRef.current = null;
    setNow(at);
    setStatus("idle");
  };

  const statusLabel =
    status === "running"
      ? "Running"
      : status === "break"
        ? "On an unpaid break"
        : status === "paused"
          ? "Paused"
          : "Ready";

  return (
    <div className="sw" data-status={status}>
      <div className="sw-head">
        <label className="conv-field sw-rate">
          <span>Your hourly rate</span>
          <span className="conv-money">
            <span className="cur" aria-hidden="true">
              {sym}
            </span>
            <input
              inputMode="decimal"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              aria-label="Hourly rate"
            />
          </span>
        </label>
        <span className="sw-pill">
          <i aria-hidden="true" />
          {statusLabel}
        </span>
      </div>

      <div className="sw-face">
        <div className="sw-clock" role="timer" aria-live="off">
          {formatClock(paidSeconds)}
        </div>
        <div className="sw-earn">{formatCents(earnedCents, currency)}</div>
      </div>

      <p className="sw-caption">
        Paid time this session
        {breakSeconds > 0 ? (
          <> · {formatClock(breakSeconds)} unpaid break, not counted</>
        ) : null}
      </p>

      <div className="sw-actions">
        <button type="button" className="sw-btn primary" onClick={start} disabled={status !== "idle"}>
          Start
        </button>
        <button type="button" className="sw-btn" onClick={pause} disabled={status !== "running" && status !== "break"}>
          Pause
        </button>
        <button type="button" className="sw-btn" onClick={resume} disabled={status !== "paused" && status !== "break"}>
          Resume
        </button>
        <button type="button" className="sw-btn" onClick={reset} disabled={status === "idle"}>
          Reset
        </button>
      </div>

      <button
        type="button"
        className="sw-break"
        onClick={toggleBreak}
        aria-pressed={status === "break"}
        disabled={status !== "running" && status !== "break"}
      >
        {status === "break" ? "End the break — back to work" : "Take an unpaid break"}
      </button>

      <p className="conv-note">
        Gross pay, before tax. Nothing is saved: reloading the page clears the session and the log.
      </p>

      {sessions.length > 0 ? (
        <div className="sw-log">
          <h3>Sessions this visit</h3>
          <ul>
            {sessions.map((s) => (
              <li key={s.id}>
                <span>{formatClock(s.seconds)}</span>
                <b>{formatCents(s.cents, currency)}</b>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
