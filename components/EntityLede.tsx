"use client";

import { useI18n } from "@/lib/i18n";
import { ENTITY_DEFINITION, ZH_ENTITY_DEFINITION } from "@/lib/site";

export function EntityLede() {
  const { t, lang } = useI18n();
  return (
    <p className="sec-lede" style={{ maxWidth: 780, margin: "0 auto", textAlign: "center" }}>
      {lang === "zh" ? ZH_ENTITY_DEFINITION : ENTITY_DEFINITION} {t("entity.lede")}
    </p>
  );
}
