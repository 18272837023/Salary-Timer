import type { FaqItem } from "@/components/sections";
import {
  SITE_NAME,
  absoluteUrl,
  pageUrl,
  type LearnArticle,
  type ToolRoute,
} from "./site";

/** BreadcrumbList for a single landing page. */
export function breadcrumbSchema(tool: ToolRoute) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: tool.label, item: pageUrl(tool.href) },
    ],
  };
}

/** BreadcrumbList for a Learn article: Home → Learn → Article. */
export function learnBreadcrumbSchema(article: LearnArticle) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Learn", item: pageUrl("/learn") },
      { "@type": "ListItem", position: 3, name: article.label, item: pageUrl(article.href) },
    ],
  };
}

export function learnArticleSchema(article: LearnArticle) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    url: pageUrl(article.href),
    inLanguage: "en",
    isPartOf: { "@type": "WebSite", name: SITE_NAME, url: absoluteUrl("/") },
    publisher: { "@type": "Organization", name: SITE_NAME, url: absoluteUrl("/") },
  };
}

/** Structured data bundle for a Learn article page. */
export function learnSchemas(article: LearnArticle, faq: FaqItem[]) {
  return [learnArticleSchema(article), learnBreadcrumbSchema(article), faqSchema(faq)];
}

export function faqSchema(items: FaqItem[]) {
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

export function webPageSchema(tool: ToolRoute) {
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

/** All three blocks a landing page needs, ready to render. */
export function toolSchemas(tool: ToolRoute, faq: FaqItem[]) {
  return [webPageSchema(tool), breadcrumbSchema(tool), faqSchema(faq)];
}
