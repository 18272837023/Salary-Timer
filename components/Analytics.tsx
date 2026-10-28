import { GA_MEASUREMENT_ID } from "@/lib/site";
import { RouteAnalytics } from "./RouteAnalytics";

/**
 * GA4 page-view tracking — the tags Google hands you, rendered as-is.
 *
 * Two deliberate choices:
 *
 * 1. **Plain <script> tags, not `next/script`.** With `afterInteractive` Next
 *    only emits a preload hint and injects the real tag after hydration; with
 *    `beforeInteractive` it queues the tag into `self.__next_s`, which is only
 *    drained once the framework runtime boots. Both leave a window where a
 *    visitor can bounce before a single pageview is recorded. Emitting the tag
 *    directly means the browser executes it as soon as it parses the document,
 *    exactly like the snippet from Google's dashboard. React 19 hoists the
 *    `async` script into <head> for us.
 *
 * 2. **Inline init before the external script may have loaded.** That is fine
 *    and is how Google's own snippet works: `gtag()` only appends to
 *    `dataLayer`, and gtag.js drains that queue whenever it arrives.
 *
 * What it deliberately does *not* do: touch the salary settings. Those stay in
 * localStorage; only the page URL and title are reported.
 */
export function Analytics() {
  // Keep local development out of the production property.
  if (process.env.NODE_ENV !== "production" || !GA_MEASUREMENT_ID) return null;

  return (
    <>
      <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} />
      <script
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html:
            `window.dataLayer=window.dataLayer||[];` +
            `function gtag(){dataLayer.push(arguments)}` +
            `window.gtag=gtag;` +
            `gtag('js',new Date());` +
            `gtag('config','${GA_MEASUREMENT_ID}');`,
        }}
      />
      <RouteAnalytics />
    </>
  );
}
