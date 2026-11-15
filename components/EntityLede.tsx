"use client";

import { Link } from "@/components/SmartLink";
import { useI18n } from "@/lib/i18n";
import { ENTITY_DEFINITION, ZH_ENTITY_DEFINITION } from "@/lib/site";

export function EntityLede() {
  const { t, lang } = useI18n();
  const name = lang === "zh" ? "薪资计时器" : "Salary Timer";
  const definition = lang === "zh" ? ZH_ENTITY_DEFINITION : ENTITY_DEFINITION;
  return (
    <p className="sec-lede" style={{ maxWidth: 780, margin: "0 auto", textAlign: "center" }}>
      <Link href={lang === "zh" ? "/zh/" : "/"}>{name}</Link>{definition.slice(name.length)} {t("entity.lede")}
    </p>
  );
}
