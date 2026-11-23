import type { MetadataRoute } from "next";
import { ABOUT_PAGE, LEGAL_PAGES, TOOL_PAGES, pageUrl } from "@/lib/site";
import { contentUpdated } from "@/lib/editorial";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...["/", "/zh"].map(href => ({ url: pageUrl(href), lastModified: contentUpdated(href), changeFrequency: "weekly" as const, priority: href === "/" ? 1 : 0.9 })),
    ...TOOL_PAGES.map(tool => ({ url: pageUrl(tool.href), lastModified: contentUpdated(tool.href), changeFrequency: "monthly" as const, priority: 0.8 })),
    { url: pageUrl(ABOUT_PAGE.href), lastModified: contentUpdated(ABOUT_PAGE.href), changeFrequency: "yearly" as const, priority: 0.5 },
    ...LEGAL_PAGES.map(page => ({ url: pageUrl(page.href), lastModified: contentUpdated(page.href), changeFrequency: "yearly" as const, priority: 0.3 })),
  ];
}
