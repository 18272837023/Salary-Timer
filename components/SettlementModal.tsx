"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useI18n } from "@/lib/i18n";
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
  const { t, lang } = useI18n();
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
    [t("settle.shift"), `${settings.start} – ${settings.end}`],
    [t("settle.paidHours"), formatHM(derived.paidMin)],
    [t("settle.unpaidBreaks"), formatHM(derived.breakMin)],
    [t("settle.paidSoFar"), formatHM(snapshot.paidElapsedMin)],
  ];
  if (snapshot.overtimeMin > 0) {
    rows.push([t("settle.overtime", { mult: settings.otMult }), formatHM(snapshot.overtimeMin)]);
  }
  rows.push([t("settle.hourlyRate"), formatCents(derived.hourlyCents, settings.currency)]);
  rows.push([
    t("settle.nextPayday"),
    paydayDays === 1 ? t("settle.paydayDay", { n: paydayDays }) : t("settle.paydayDays", { n: paydayDays }),
  ]);

  const dateLabel = new Date().toLocaleDateString(lang === "zh" ? "zh-CN" : "en-US", {
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
      aria-label={t("settle.label")}
      aria-hidden={!open}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="sheet">
        <h3>{t("settle.title")}</h3>
        <div className="sub">{dateLabel}</div>
        {rows.map(([label, value]) => (
          <div className="line" key={label}>
            <span>{label}</span>
            <b>{value}</b>
          </div>
        ))}
        <div className="total">
          <span>{t("settle.today")}</span>
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
          {t("settle.done")}
        </button>
      </div>
    </div>,
    document.body,
  );
}
