import type { FaqItem } from "@/lib/home-faq";
import { SITE_NAME, absoluteUrl, pageUrl, type ToolRoute } from "@/lib/site";

/**
 * Structured data for a tool landing page.
 *
 * Three blocks, in this order: what the page is (WebPage), where it sits
 * (BreadcrumbList), and what it answers (FAQPage). The FAQ block is built from
 * the same array the visible accordion renders, so the markup can never claim
 * an answer the page does not show.
 *
 * Deliberately separate from the page component: this runs on the server during
 * export, and nothing here reads React state.
 */

function webPageSchema(tool: ToolRoute) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: tool.title,
    url: pageUrl(tool.href),
    description: tool.description,
    isPartOf: { "@type": "WebSite", name: SITE_NAME, url: absoluteUrl("/") },
    inLanguage: "en",
    about: { "@type": "Thing", name: tool.label },
  };
}

function breadcrumbSchema(tool: ToolRoute) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: tool.label, item: pageUrl(tool.href) },
    ],
  };
}

function faqSchema(items: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

/** All three blocks a landing page needs, ready to render. */
export function toolSchemas(tool: ToolRoute, faq: FaqItem[]) {
  return [webPageSchema(tool), breadcrumbSchema(tool), faqSchema(faq)];
}
