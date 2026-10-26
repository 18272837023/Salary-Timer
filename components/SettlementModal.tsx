"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { formatCents } from "@/lib/money";
import { formatHM } from "@/lib/schedule";
import type { Settings, Snapshot } from "@/lib/types";

export function SettlementModal({
  open,
  onClose,
  snapshot,
  settings,
  paydayDays,
}: {
  open: boolean;
  onClose: () => void;
  snapshot: Snapshot;
  settings: Settings;
  paydayDays: number;
}) {
  // Portal to <body> so sticky header (z-index 50) can't cover the dialog —
  // it's otherwise trapped under .app-shell's stacking context (z-index 1).
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const { derived } = snapshot;
  const rows: [string, string][] = [
    ["Shift", `${settings.start} – ${settings.end}`],
    ["Paid hours in shift", formatHM(derived.paidMin)],
    ["Unpaid breaks", formatHM(derived.breakMin)],
    ["Paid time so far", formatHM(snapshot.paidElapsedMin)],
  ];
  if (snapshot.overtimeMin > 0) {
    rows.push([`Overtime (${settings.otMult}×)`, formatHM(snapshot.overtimeMin)]);
  }
  rows.push(["Hourly rate", formatCents(derived.hourlyCents, settings.currency)]);
  rows.push(["Next payday", `${paydayDays} day${paydayDays === 1 ? "" : "s"}`]);

  const dateLabel = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  if (!mounted) return null;

  return createPortal(
    <div
      className={`modal${open ? " on" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label="Today's settlement"
      aria-hidden={!open}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="sheet">
        <h3>📋 Today&apos;s settlement</h3>
        <div className="sub">{dateLabel}</div>
        {rows.map(([label, value]) => (
          <div className="line" key={label}>
            <span>{label}</span>
            <b>{value}</b>
          </div>
        ))}
        <div className="total">
          <span>Today</span>
          <span className={settings.privacy ? "blurred" : undefined}>
            {formatCents(snapshot.earnedCents, settings.currency)}
          </span>
        </div>
        <button
          type="button"
          className="btn btn-ghost"
          style={{ width: "100%", marginTop: 10 }}
          onClick={onClose}
        >
          Done
        </button>
      </div>
    </div>,
    document.body,
  );
}
