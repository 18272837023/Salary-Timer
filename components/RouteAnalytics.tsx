"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { GA_MEASUREMENT_ID } from "@/lib/site";

type GtagFn = (command: string, ...args: unknown[]) => void;

/** gtag is injected at runtime by the inline script, so it is not on Window's type. */
function gtag(): GtagFn | undefined {
  return (window as unknown as { gtag?: GtagFn }).gtag;
}

/**
 * Reports a `page_view` on client-side navigation.
 *
 * `gtag('config')` in the inline script fires exactly one pageview, on load.
 * This site is a Next.js App Router app, so moving between the tool pages
 * never reloads the document — without this every landing page except the
 * first would look like a bounce.
 *
 * Deliberately does not touch the salary settings: those stay in localStorage,
 * and only the URL and title are reported.
 */
export function RouteAnalytics() {
  const pathname = usePathname();
  // The initial config already reported the landing page; skip the first run
  // so it isn't counted twice.
  const seenFirstPath = useRef(false);

  useEffect(() => {
    if (!pathname) return;
    if (!seenFirstPath.current) {
      seenFirstPath.current = true;
      return;
    }
    gtag()?.("event", "page_view", {
      page_path: `${pathname}${window.location.search}`,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [pathname]);

  return null;
}
