import type { MetadataRoute } from "next";
import { LEARN, TOOLS, absoluteUrl, pageUrl } from "@/lib/site";

// Required by `output: "export"` — metadata routes are prerendered at build time.
export const dynamic = "force-static";

// Regenerated on every build, so adding a landing page to lib/site.ts is enough
// to get it indexed.
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: absoluteUrl("/"),
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...TOOLS.map((tool) => ({
      // Trailing slash matches `trailingSlash: true` and the canonical tag,
      // so the sitemap never points at a URL that redirects.
      url: pageUrl(tool.href),
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    {
      url: pageUrl("/learn"),
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    },
    ...LEARN.map((article) => ({
      url: pageUrl(article.href),
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.65,
    })),
  ];
}
