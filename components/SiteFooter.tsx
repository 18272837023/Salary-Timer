"use client";

import { useHref, useI18n } from "@/lib/i18n";
import { Link } from "@/components/SmartLink";
import { LEARN, LEGAL_PAGES, TOOLS } from "@/lib/site";

export function SiteFooter() {
  const { t } = useI18n();
  const href = useHref();
  const YEAR = 2026;

  return (
    <footer>
      <div className="wrap">
        <div className="foot-grid">
          <div>
            <Link className="brand" href={href("/")} style={{ marginBottom: 10 }}>
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
                <Link href={href("/#how")}>{t("footer.howWorks")}</Link>
              </li>
              <li>
                <Link href={href("/#faq")}>{t("footer.private")}</Link>
              </li>
              <li>
                <Link href={href("/#faq")}>{t("footer.faq")}</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="foot-bottom">
          <span>{t("footer.copyright", { year: YEAR })}</span>
          {/* Derived from LEGAL_PAGES so a policy page can never be published
              without also being reachable from every page on the site. */}
          <nav className="foot-legal" aria-label="Legal">
            {LEGAL_PAGES.map((page) => (
              <Link key={page.href} href={page.href}>
                {t(page.labelKey)}
              </Link>
            ))}
          </nav>
          <span>{t("footer.madeWith")}</span>
        </div>
      </div>
    </footer>
  );
}
