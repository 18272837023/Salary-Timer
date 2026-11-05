"use client";

import { useI18n } from "@/lib/i18n";
import { Link } from "@/components/SmartLink";
import { LEARN, TOOLS } from "@/lib/site";

export function SiteFooter() {
  const { t } = useI18n();
  const YEAR = 2026;

  return (
    <footer>
      <div className="wrap">
        <div className="foot-grid">
          <div>
            <Link className="brand" href="/" style={{ marginBottom: 10 }}>
              <span className="mark">$</span> {t("nav.brand")}
            </Link>
            <p
              style={{
                fontSize: 13.5,
                color: "var(--muted)",
                fontWeight: 600,
                maxWidth: 260,
                marginTop: 8,
              }}
            >
              {t("footer.tagline")}
            </p>
          </div>

          <div>
            <h5>{t("footer.tools")}</h5>
            <ul>
              {TOOLS.map((tool) => (
                <li key={tool.href}>
                  <Link href={tool.href}>{tool.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h5>{t("footer.learn")}</h5>
            <ul>
              {LEARN.map((article) => (
                <li key={article.href}>
                  <Link href={article.href}>{article.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h5>{t("footer.about")}</h5>
            <ul>
              <li>
                <Link href="/#how">{t("footer.howWorks")}</Link>
              </li>
              <li>
                <Link href="/#faq">{t("footer.private")}</Link>
              </li>
              <li>
                <Link href="/#faq">{t("footer.faq")}</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="foot-bottom">
          <span>{t("footer.copyright", { year: YEAR })}</span>
          <span>{t("footer.madeWith")}</span>
        </div>
      </div>
    </footer>
  );
}
