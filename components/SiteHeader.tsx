"use client";

import { LangDropdown, useHref, useI18n } from "@/lib/i18n";
import { Link } from "@/components/SmartLink";
import { useEffect, useState } from "react";

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
      <nav aria-label={t("nav.lang")}><LangDropdown /></nav>
    </div>
  </header>;
}
