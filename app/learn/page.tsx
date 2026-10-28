import type { Metadata } from "next";
import { Link } from "@/components/SmartLink";
import {
  CLUSTERS,
  SITE_NAME,
  absoluteUrl,
  clusterNodes,
  entryArticle,
  pageUrl,
} from "@/lib/site";

export const metadata: Metadata = {
  title: "Learn — the three topics behind every salary timer",
  description:
    "Three topics: what an hour of your time is worth, what counts as paid time, and when the money actually arrives. Every guide on the site belongs to one of them.",
  alternates: { canonical: "/learn" },
  openGraph: {
    title: `Learn · ${SITE_NAME}`,
    description:
      "Three topics: what an hour is worth, what counts as paid time, and when the money arrives.",
    url: "/learn",
  },
};

const mapSchema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Learn",
  url: pageUrl("/learn"),
  description:
    "A topic map of the three subjects this site covers, and every page inside them.",
  isPartOf: { "@type": "WebSite", name: SITE_NAME, url: absoluteUrl("/") },
  hasPart: CLUSTERS.map((c) => {
    const { tools, articles } = clusterNodes(c.id);
    return {
      "@type": "CollectionPage",
      name: c.label,
      url: pageUrl(c.href),
      description: c.definition,
      hasPart: [...tools, ...articles].map((n) => ({
        "@type": "WebPage",
        name: n.label,
        url: pageUrl(n.href),
        description: n.description,
      })),
    };
  }),
};

export default function LearnIndexPage() {
  const entry = entryArticle();

  return (
    <main id="top">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(mapSchema) }}
      />

      <section className="tool-hero">
        <div className="blob m" />
        <div className="wrap">
          <nav className="crumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">Learn</span>
          </nav>

          <h1 className="tool-h1">
            Three topics, and <span className="hl">nothing else</span>.
          </h1>
          <p className="lede">
            This site is about one question: what is an hour of your time actually worth? Everything
            here answers a part of it. The three topics below are the whole map — if a page is not
            under one of them, it does not belong on the site.
          </p>
          <p className="learn-related">
            Start with{" "}
            {entry ? <Link href={entry.href}>{entry.label.toLowerCase()}</Link> : null} if you want
            the idea before the detail. Otherwise pick the topic you came for.
          </p>
        </div>
      </section>

      <section className="section tight">
        <div className="wrap">
          {CLUSTERS.map((cluster, i) => {
            const { tools, articles } = clusterNodes(cluster.id);
            return (
              <section className="topic" key={cluster.id} aria-labelledby={`topic-${cluster.id}`}>
                <div className="eyebrow">
                  Topic {i + 1} of {CLUSTERS.length}
                </div>
                <h2 id={`topic-${cluster.id}`} style={{ fontSize: "clamp(24px, 3vw, 32px)" }}>
                  {cluster.label}
                </h2>
                <p className="topic-def">{cluster.definition}</p>

                <ul className="topic-covers">
                  {cluster.covers.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>

                <div className="topic-nodes">
                  {tools.map((t) => (
                    <Link className="tnode" href={t.href} key={t.href}>
                      <span className="tnode-tag">Live tool</span>
                      <strong>{t.label}</strong>
                      <span>{t.blurb}</span>
                    </Link>
                  ))}
                  {articles.map((a) => (
                    <Link className="tnode" href={a.href} key={a.href}>
                      <span className="tnode-tag">Guide</span>
                      <strong>{a.label}</strong>
                      <span>{a.blurb}</span>
                    </Link>
                  ))}
                </div>

                <p className="topic-more">
                  Full topic guide:{" "}
                  <Link href={cluster.href}>
                    {cluster.label.toLowerCase()} — {tools.length + articles.length} pages
                  </Link>
                </p>
              </section>
            );
          })}
        </div>
      </section>

      <section className="section tight">
        <div className="wrap" style={{ textAlign: "center" }}>
          <p className="sec-lede" style={{ margin: "0 auto 18px" }}>
            All of this exists to make one number honest. That number lives on the{" "}
            <Link href="/">free salary timer</Link>.
          </p>
          <Link href="/" className="btn btn-mint">
            Open the salary timer
          </Link>
        </div>
      </section>
    </main>
  );
}
