"use client";

import { Link } from "@/components/SmartLink";
import { useEffect, useState } from "react";
import { NAV_LINKS, TOOLS } from "@/lib/site";

export function SiteHeader() {
  const [stuck, setStuck] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={stuck ? "stuck" : undefined}>
      <div className="wrap nav">
        <Link className="brand" href="/">
          <span className="mark">$</span> Salary Timer
        </Link>

        <nav className="nav-links" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
          <Link href={TOOLS[0].href}>Calculators</Link>
        </nav>

        <button
          type="button"
          className="nav-burger"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {menuOpen && (
        <div className="nav-sheet">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>
              {link.label}
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
