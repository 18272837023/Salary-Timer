"use client";

import { LangDropdown, useHref, useI18n } from "@/lib/i18n";
import { Link } from "@/components/SmartLink";
import { useEffect, useState } from "react";
import { NAV_LINKS, TOOLS } from "@/lib/site";

export function SiteHeader() {
  const { t } = useI18n();
  const href = useHref();
  const [stuck, setStuck] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Map static NAV_LINKS labels to i18n keys
  const navLabels: Record<string, string> = {
    "/#timer": t("nav.liveTimer"),
    "/#features": t("nav.features"),
    "/#who": t("nav.who"),
    "/#faq": t("nav.faq"),
    "/learn": t("nav.learn"),
  };

  return (
    <header className={stuck ? "stuck" : undefined}>
      <div className="wrap nav">
        <Link className="brand" href={href("/")}>
          <span className="mark">$</span> {t("nav.brand")}
        </Link>

        <nav className="nav-links" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={href(link.href)}>
              {navLabels[link.href] ?? link.label}
            </Link>
          ))}
          <Link href={TOOLS[0].href}>{t("nav.calculators")}</Link>
          <LangDropdown />
        </nav>

        <div className="nav-right-mobile">
          <LangDropdown />
          <button
            type="button"
            className="nav-burger"
            aria-label={menuOpen ? t("nav.closeMenu") : t("nav.openMenu")}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="nav-sheet">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={href(link.href)}
              onClick={() => setMenuOpen(false)}
            >
              {navLabels[link.href] ?? link.label}
            </Link>
          ))}
          {TOOLS.map((tool) => (
            <Link key={tool.href} href={tool.href} onClick={() => setMenuOpen(false)}>
              {tool.emoji} {tool.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
