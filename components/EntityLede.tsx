"use client";

import { useI18n } from "@/lib/i18n";
import { ENTITY_DEFINITION } from "@/lib/site";

export function EntityLede() {
  const { t } = useI18n();
  return (
    <p className="sec-lede" style={{ maxWidth: 780, margin: "0 auto", textAlign: "center" }}>
      {ENTITY_DEFINITION} {t("entity.lede")}
    </p>
  );
}
