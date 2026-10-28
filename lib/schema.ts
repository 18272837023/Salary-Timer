import type { FaqItem } from "@/components/sections";
import {
  SITE_NAME,
  absoluteUrl,
  clusterNodes,
  pageUrl,
  type Cluster,
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

/** BreadcrumbList for a cluster hub: Home → Learn → Topic. */
export function clusterBreadcrumbSchema(cluster: Cluster) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Learn", item: pageUrl("/learn") },
      { "@type": "ListItem", position: 3, name: cluster.label, item: pageUrl(cluster.href) },
    ],
  };
}

/**
 * A hub page is a `CollectionPage` whose `hasPart` is every node in the topic.
 * That single statement is what lets a crawler see the cluster as one thing
 * rather than a pile of unrelated URLs.
 */
export function clusterHubSchema(cluster: Cluster) {
  const { tools, articles } = clusterNodes(cluster.id);
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: cluster.title,
    description: cluster.description,
    url: pageUrl(cluster.href),
    inLanguage: "en",
    isPartOf: { "@type": "WebSite", name: SITE_NAME, url: absoluteUrl("/") },
    about: { "@type": "Thing", name: cluster.label, description: cluster.definition },
    hasPart: [
      ...tools.map((t) => ({
        "@type": "WebApplication",
        name: t.label,
        url: pageUrl(t.href),
        description: t.description,
      })),
      ...articles.map((a) => ({
        "@type": "Article",
        name: a.label,
        url: pageUrl(a.href),
        description: a.description,
      })),
    ],
  };
}

/** Structured data bundle for a cluster hub page. */
export function clusterSchemas(cluster: Cluster, faq: FaqItem[]) {
  return [clusterHubSchema(cluster), clusterBreadcrumbSchema(cluster), faqSchema(faq)];
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
