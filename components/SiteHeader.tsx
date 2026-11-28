"use client";

import { LangDropdown, useHref, useI18n } from "@/lib/i18n";
import { Link } from "@/components/SmartLink";
import { TOOL_PAGES } from "@/lib/site";
import { useEffect, useRef, useState } from "react";

/**
 * The Tools menu.
 *
 * A disclosure, not a hover menu: it opens on click and stays open until the
 * visitor picks something, presses Escape or clicks outside. Hover menus are
 * unreachable by keyboard and disappear the moment the pointer overshoots.
 *
 * Use the same labels and destinations as the footer.
 */
function ToolsMenu() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (wrap.current && !wrap.current.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="nav-tools" ref={wrap}>
      <button
        type="button"
        className="nav-tools-btn"
        aria-expanded={open}
        aria-controls="tools-menu"
        onClick={() => setOpen((value) => !value)}
      >
        {t("nav.tools")}
        <svg width="10" height="6" viewBox="0 0 10 6" aria-hidden="true" focusable="false">
          <path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open ? (
        <div className="tools-menu" id="tools-menu">
          {TOOL_PAGES.map((tool) => {
            const hintId = `tools-hint-${tool.href.slice(1)}`;
            return (
              <div key={tool.href} className="tools-menu-item">
                <Link href={tool.href} aria-describedby={hintId} onClick={() => setOpen(false)}>
                  {tool.label}
                </Link>
                <span id={hintId}>{tool.menuHint}</span>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export function SiteHeader() {
  const { t } = useI18n();
  const href = useHref();
  const [stuck, setStuck] = useState(false);
  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return <header className={stuck ? "stuck" : undefined}>
    <div className="wrap nav">
      <Link className="brand" href={href("/")}><span className="mark">$</span> {t("nav.brand")}</Link>
      <div className="nav-links">
        <ToolsMenu />
        <nav aria-label={t("nav.lang")}><LangDropdown /></nav>
      </div>
    </div>
  </header>;
}
