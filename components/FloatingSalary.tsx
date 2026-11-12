"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useI18n } from "@/lib/i18n";
import { formatCents } from "@/lib/money";
import { breaksToday, compute, formatClock, nextShift } from "@/lib/schedule";
import { useSettings } from "@/lib/store";

interface PictureInPicture {
  requestWindow(options: { width: number; height: number }): Promise<Window>;
}

// Capability detection keeps unsupported browsers usable without a popup fallback
// that would promise always-on-top behavior the browser cannot provide.
function pictureInPicture(): PictureInPicture | undefined {
  return (window as Window & { documentPictureInPicture?: PictureInPicture }).documentPictureInPicture;
}

const WINDOW_STYLES = `
  * { box-sizing: border-box; }
  :root { color-scheme: light; font-family: "Segoe UI", system-ui, sans-serif; color: #33313b; background: #fffdf8; }
  body { margin: 0; padding: 12px; }
  button { font: inherit; cursor: pointer; }
  button:focus-visible { outline: 3px solid #167958; outline-offset: 3px; }
  .float-card { display: grid; gap: 8px; min-height: calc(100dvh - 24px); grid-template-rows: auto 1fr auto auto auto auto; }
  .float-header, .float-status, .float-countdown { display: flex; align-items: center; gap: 8px; }
  .float-header { justify-content: space-between; font-size: 13px; font-weight: 800; }
  .float-mark { display: inline-grid; place-items: center; width: 25px; height: 25px; margin-right: 7px; background: #58d7ac; color: #185a43; border-radius: 8px; }
  .float-privacy { display: grid; place-items: center; width: 30px; height: 28px; border: 1px solid #e4e1d9; border-radius: 9px; background: #fff; color: #55515e; }
  .float-label { margin: 0 0 2px; font-size: 11px; color: #7c7889; }
  .float-total { display: flex; flex-direction: column; justify-content: center; }
  .float-amount { font-size: clamp(24px, min(11vw, 15vh), 56px); line-height: 1.15; font-weight: 800; letter-spacing: -1px; font-variant-numeric: tabular-nums; overflow-wrap: anywhere; }
  .float-hidden { filter: blur(7px); user-select: none; }
  .float-status { font-size: 12px; color: #686473; }
  .float-dot { width: 7px; height: 7px; border-radius: 50%; background: #aaa5b2; flex-shrink: 0; }
  .float-dot.live { background: #17815c; }
  .float-countdown { justify-content: space-between; min-height: 31px; padding: 6px 9px; border: 1px solid #d9eee4; border-radius: 9px; background: #effaf5; font-size: 11px; }
  .float-countdown b { font-size: 16px; font-variant-numeric: tabular-nums; white-space: nowrap; }
  .float-return { width: 100%; min-height: 29px; padding: 5px 10px; border: 1px solid #e4e1d9; border-radius: 9px; background: #fff; color: #494452; font-size: 12px; font-weight: 600; }
  .float-hint { margin: 0; font-size: 10px; line-height: 1.4; color: #7c7889; text-align: center; }
  @media (prefers-reduced-motion: no-preference) { .float-privacy:hover, .float-return:hover { background: #f0f8f3; } }
`;

function FloatingCard({ ownerWindow, onReturn }: { ownerWindow: Window; onReturn: () => void }) {
  const { settings, update } = useSettings();
  const { t, lang } = useI18n();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    ownerWindow.document.title = t("float.title");
    ownerWindow.document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
  }, [ownerWindow, lang, t]);

  useEffect(() => {
    // The opener's requestAnimationFrame pauses when its tab is hidden. Drive
    // this view from the visible PiP window, recomputing from wall-clock time
    // rather than accumulating ticks, so missed frames never lose earnings.
    let active = true;
    const tick = () => { if (active) setNow(new Date()); };
    const timer = ownerWindow.setInterval(tick, 250);
    ownerWindow.addEventListener("pageshow", tick);
    return () => {
      active = false;
      ownerWindow.clearInterval(timer);
      ownerWindow.removeEventListener("pageshow", tick);
    };
  }, [ownerWindow]);

  const snapshot = compute(settings, now);
  const ready = settings.onboarded && settings.amountCents > 0;
  const earning = ready && (snapshot.status === "working" || snapshot.status === "overtime");
  const status = ready ? t(`status.${snapshot.status}`) : t("status.unset");
  let label = t("cd.notSet");
  let seconds: number | null = null;
  if (ready) {
    if (snapshot.status === "working") {
      label = t("tick.clockOutIn");
      seconds = (snapshot.shiftEndMin - snapshot.shiftMin) * 60;
    } else if (snapshot.status === "overtime") {
      label = t("cd.overtimeFor");
      seconds = snapshot.overtimeMin * 60;
    } else if (snapshot.status === "break") {
      label = t("tick.breakEndsIn");
      const currentBreak = breaksToday(settings).find((b) => snapshot.shiftMin >= b.start && snapshot.shiftMin < b.end);
      if (currentBreak) seconds = (currentBreak.end - snapshot.shiftMin) * 60;
    } else {
      label = t(snapshot.status === "before" ? "tick.shiftStartsIn" : "tick.nextShiftIn");
      seconds = nextShift(settings, now)?.seconds ?? null;
    }
  }

  return (
    <main className="float-card">
      <header className="float-header">
        <span><span className="float-mark" aria-hidden="true">$</span>{t("nav.brand")}</span>
        <button className="float-privacy" type="button" aria-pressed={settings.privacy}
          aria-label={t(settings.privacy ? "float.show" : "float.hide")}
          title={t(settings.privacy ? "float.show" : "float.hide")}
          onClick={() => update({ privacy: !settings.privacy })}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" />
            {settings.privacy && <path d="m3 3 18 18" />}
          </svg>
        </button>
      </header>
      <section className="float-total" aria-label={t("tick.earnedToday")}>
        <p className="float-label">{t("tick.earnedToday")}</p>
        <div role="group" className={`float-amount${settings.privacy ? " float-hidden" : ""}`} aria-label={settings.privacy ? t("float.hidden") : undefined}>
          <span aria-hidden={settings.privacy || undefined}>{formatCents(ready ? snapshot.earnedCents : 0, settings.currency)}</span>
        </div>
      </section>
      <div className="float-status"><span className={`float-dot${earning ? " live" : ""}`} aria-hidden="true" />{status}</div>
      <div className="float-countdown"><span>{label}</span><b>{seconds === null ? "—" : formatClock(Math.max(0, seconds))}</b></div>
      <button className="float-return" type="button" onClick={onReturn}>{t("float.return")}</button>
      <p className="float-hint">{t("float.windowHint")}</p>
    </main>
  );
}

export function FloatingSalary() {
  const { t } = useI18n();
  const { settings, hydrated } = useSettings();
  const hintId = useId();
  const [supported, setSupported] = useState<boolean | null>(null);
  const [pipWindow, setPipWindow] = useState<Window | null>(null);
  const [opening, setOpening] = useState(false);
  const [failed, setFailed] = useState(false);
  const windowRef = useRef<Window | null>(null);
  const openingRef = useRef(false);
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    setSupported(Boolean(window.isSecureContext && pictureInPicture()?.requestWindow));
    return () => {
      mountedRef.current = false;
      windowRef.current?.close();
      windowRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!pipWindow) return;
    const onClose = () => {
      if (windowRef.current === pipWindow) windowRef.current = null;
      if (mountedRef.current) setPipWindow(null);
    };
    pipWindow.addEventListener("pagehide", onClose, { once: true });
    return () => pipWindow.removeEventListener("pagehide", onClose);
  }, [pipWindow]);

  async function open() {
    if (windowRef.current && !windowRef.current.closed) {
      windowRef.current.focus();
      return;
    }
    const api = pictureInPicture();
    if (!api || openingRef.current) return;
    openingRef.current = true;
    setOpening(true);
    setFailed(false);
    try {
      // Call immediately in the click handler, preserving user activation.
      const opened = await api.requestWindow({ width: 340, height: 260 });
      if (!mountedRef.current) { opened.close(); return; }
      const style = opened.document.createElement("style");
      style.textContent = WINDOW_STYLES;
      opened.document.head.append(style);
      windowRef.current = opened;
      setPipWindow(opened);
    } catch {
      windowRef.current?.close();
      windowRef.current = null;
      if (mountedRef.current) { setPipWindow(null); setFailed(true); }
    } finally {
      openingRef.current = false;
      if (mountedRef.current) setOpening(false);
    }
  }

  const ready = hydrated && settings.onboarded && settings.amountCents > 0;
  const hint = supported === false ? "float.unsupported" : !ready ? "float.setup" : "float.hint";

  return (
    <aside className="floating-entry" aria-label={t("float.title")}>
      <button type="button" className="btn btn-ink btn-sm floating-launch"
        disabled={!supported || !ready || opening} aria-describedby={hintId}
        title={t(pipWindow ? "float.focus" : hint)}
        aria-pressed={Boolean(pipWindow)} onClick={open}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <rect x="2" y="4" width="20" height="16" rx="3" /><rect x="11" y="11" width="8" height="6" rx="1" />
        </svg>
        {t(opening ? "float.opening" : "float.open")}
      </button>
      <p id={hintId} className={`floating-help${supported && ready ? " floating-help-sr" : ""}`}>{t(hint)}</p>
      {failed && <p className="floating-error" role="alert">{t("float.error")}</p>}
      {pipWindow && createPortal(
        <FloatingCard ownerWindow={pipWindow} onReturn={() => { window.focus(); pipWindow.close(); }} />,
        pipWindow.document.body,
      )}
    </aside>
  );
}
