import type { MetadataRoute } from "next";
import { ABOUT_PAGE, LEGAL_PAGES, pageUrl } from "@/lib/site";
import { contentUpdated } from "@/lib/editorial";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...["/", "/zh"].map(href => ({ url: pageUrl(href), lastModified: contentUpdated(href), changeFrequency: "weekly" as const, priority: href === "/" ? 1 : 0.9 })),
    { url: pageUrl(ABOUT_PAGE.href), lastModified: contentUpdated(ABOUT_PAGE.href), changeFrequency: "yearly" as const, priority: 0.5 },
    ...LEGAL_PAGES.map(page => ({ url: pageUrl(page.href), lastModified: contentUpdated(page.href), changeFrequency: "yearly" as const, priority: 0.3 })),
  ];
}
