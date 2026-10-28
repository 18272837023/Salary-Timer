import { Link } from "@/components/SmartLink";
import { Faq, type FaqItem } from "@/components/sections";
import { clusterNodes, getCluster, getTool, type LearnArticle } from "@/lib/site";

/**
 * Shared shell for every `/learn/*` article.
 *
 * Distinct from ToolPage on purpose: no live timer in the hero — these are
 * informational pages that cross-link into tools, not the tools themselves.
 *
 * The "more in this topic" block is generated from cluster membership, so every
 * article automatically links to its hub and to its siblings. That is what makes
 * a cluster a cluster rather than a pile of pages that happen to mention each
 * other.
 */
export function LearnPage({
  article,
  h1,
  lede,
  faq,
  children,
}: {
  article: LearnArticle;
  h1: React.ReactNode;
  lede: string;
  faq: FaqItem[];
  children: React.ReactNode;
}) {
  let related: { href: string; label: string } | null = null;
  if (article.relatedToolHref === "/") {
    related = { href: "/#timer", label: "Salary Timer" };
  } else if (article.relatedToolHref) {
    const tool = getTool(article.relatedToolHref);
    related = { href: tool.href, label: tool.label };
  }

  const cluster = article.cluster ? getCluster(article.cluster) : null;
  const siblings = article.cluster
    ? clusterNodes(article.cluster).articles.filter((a) => a.href !== article.href)
    : [];

  return (
    <main id="top">
      <section className="tool-hero">
        <div className="blob m" />
        <div className="wrap">
          <nav className="crumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span aria-hidden="true">/</span>
            <Link href="/learn">Learn</Link>
            {cluster ? (
              <>
                <span aria-hidden="true">/</span>
                <Link href={cluster.href}>{cluster.label}</Link>
              </>
            ) : null}
            <span aria-hidden="true">/</span>
            <span aria-current="page">{article.label}</span>
          </nav>

          <h1 className="tool-h1">{h1}</h1>
          <p className="lede">{lede}</p>

          {related ? (
            <p className="learn-related">
              Related tool: <Link href={related.href}>{related.label}</Link>
            </p>
          ) : null}
        </div>
      </section>

      <article className="prose">{children}</article>

      {cluster && siblings.length > 0 ? (
        <section className="section tight" id="in-this-topic">
          <div className="wrap">
            <div className="eyebrow">Same topic</div>
            <h2 style={{ fontSize: "clamp(22px, 2.6vw, 28px)" }}>More on {cluster.label.toLowerCase()}</h2>
            <p className="sec-lede">{cluster.definition}</p>

            <div className="topic-nodes">
              {siblings.map((a) => (
                <Link className="tnode" href={a.href} key={a.href}>
                  <span className="tnode-tag">Guide</span>
                  <strong>{a.label}</strong>
                  <span>{a.blurb}</span>
                </Link>
              ))}
            </div>

            <p className="topic-more">
              The full topic, from the top: <Link href={cluster.href}>{cluster.label}</Link>.
            </p>
          </div>
        </section>
      ) : null}

      <Faq
        items={faq}
        eyebrow="Questions"
        title="Short answers"
        lede="The bits people ask after reading this."
        id="faq"
      />

      <section className="section tight">
        <div className="wrap" style={{ textAlign: "center" }}>
          <p className="sec-lede" style={{ margin: "0 auto 18px" }}>
            These guides exist to keep the topic clear. The product is the{" "}
            <Link href="/">salary timer</Link> on the homepage.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/" className="btn btn-mint">
              Open the salary timer
            </Link>
            <Link href="/learn" className="btn btn-ghost">
              All topics
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
