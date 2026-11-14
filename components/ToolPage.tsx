"use client";

import { useI18n } from "@/lib/i18n";
import { ContentByline, ContentNotes } from "@/components/ContentNotes";
import { Link } from "@/components/SmartLink";
import { SalaryApp } from "@/components/SalaryApp";
import { Faq, ToolLinks, type FaqItem } from "@/components/sections";
import type { ToolRoute } from "@/lib/site";
import { getLearn } from "@/lib/site";

export function ToolPage({
  tool,
  h1,
  lede,
  faq,
  children,
}: {
  tool: ToolRoute;
  h1: React.ReactNode;
  lede: string;
  faq: FaqItem[];
  children: React.ReactNode;
}) {
  const { t } = useI18n();
  const relatedLearn = tool.relatedLearnHref ? getLearn(tool.relatedLearnHref) : null;

  return (
    <main id="top">
      <section className="tool-hero">
        <div className="blob m" />
        <div className="wrap">
          <nav className="crumbs" aria-label="Breadcrumb">
            <Link href="/">{t("tool.breadcrumbHome")}</Link>
            <span aria-hidden="true">{t("tool.breadcrumbSlash")}</span>
            <span aria-current="page">{tool.label}</span>
          </nav>

          <h1 className="tool-h1">{h1}</h1>
          <p className="lede">{lede}</p>
          <ContentByline href={tool.href} />
          {relatedLearn ? (
            <p className="learn-related">
              {t("tool.relatedNew")} <Link href={relatedLearn.href}>{relatedLearn.label}</Link>{t("tool.relatedOr")}
            </p>
          ) : (
            <p className="learn-related">
              {t("tool.relatedOrShort")}
            </p>
          )}
        </div>
      </section>

      <div className="wrap">
        <SalaryApp />
      </div>

      <article className="prose">
        {children}
        <ContentNotes cluster={tool.cluster} />
      </article>

      <Faq
        items={faq}
        eyebrow={t("faq.eyebrow")}
        title={t("tools.faqTitle", { label: tool.label })}
        lede={t("tools.faqLede")}
        id="faq"
      />

      <ToolLinks current={tool.href} />
    </main>
  );
}
