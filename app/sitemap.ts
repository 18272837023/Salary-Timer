import type { MetadataRoute } from "next";
import { CLUSTERS, LEARN, LEGAL_PAGES, TOOLS, absoluteUrl, pageUrl } from "@/lib/site";
import { contentUpdated } from "@/lib/editorial";

// Required by `output: "export"` — metadata routes are prerendered at build time.
export const dynamic = "force-static";

// Include published routes; lastmod tracks significant content edits, not builds.
export default function sitemap(): MetadataRoute.Sitemap {

  return [
    {
      url: absoluteUrl("/"),
      lastModified: contentUpdated("/"),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      // The Chinese homepage is a real prerendered route, not a client toggle.
      url: pageUrl("/zh"),
      lastModified: contentUpdated("/zh"),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
    ...TOOLS.map((tool) => ({
      // Trailing slash matches `trailingSlash: true` and the canonical tag,
      // so the sitemap never points at a URL that redirects.
      url: pageUrl(tool.href),
      lastModified: contentUpdated(tool.href),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    {
      url: pageUrl("/learn"),
      lastModified: contentUpdated("/learn"),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    },
    ...CLUSTERS.map((cluster) => ({
      url: pageUrl(cluster.href),
      lastModified: contentUpdated(cluster.href),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...LEARN.map((article) => ({
      url: pageUrl(article.href),
      lastModified: contentUpdated(article.href),
      changeFrequency: "monthly" as const,
      priority: 0.65,
    })),
    ...LEGAL_PAGES.map((page) => ({
      url: pageUrl(page.href),
      lastModified: contentUpdated(page.href),
      changeFrequency: "yearly" as const,
      priority: 0.3,
    })),
  ];
}
