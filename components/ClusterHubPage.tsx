import { Link } from "@/components/SmartLink";
import { Faq, type FaqItem } from "@/components/sections";
import { clusterNodes, type Cluster } from "@/lib/site";

/**
 * Shell for a topic hub — the page that *defines* a cluster and owns every node
 * underneath it.
 *
 * The node list at the bottom is generated from `clusterNodes()` rather than
 * written by hand, so a page can never be added to a topic and forgotten here.
 */
export function ClusterHubPage({
  cluster,
  h1,
  lede,
  faq,
  children,
}: {
  cluster: Cluster;
  h1: React.ReactNode;
  lede: string;
  faq: FaqItem[];
  children: React.ReactNode;
}) {
  const { tools, articles } = clusterNodes(cluster.id);

  return (
    <main id="top">
      <section className="tool-hero">
        <div className="blob m" />
        <div className="wrap">
          <nav className="crumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span aria-hidden="true">/</span>
            <Link href="/learn">Learn</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{cluster.label}</span>
          </nav>

          <h1 className="tool-h1">{h1}</h1>
          <p className="lede">{lede}</p>
          <p className="learn-related">
            One of three topics on this site. The others are{" "}
            {cluster.id === "hourly-rate" ? (
              <>
                <Link href="/learn/paid-time">what counts as paid time</Link> and{" "}
                <Link href="/learn/pay-schedule">when the money arrives</Link>.
              </>
            ) : cluster.id === "paid-time" ? (
              <>
                <Link href="/learn/hourly-rate">what an hour is worth</Link> and{" "}
                <Link href="/learn/pay-schedule">when the money arrives</Link>.
              </>
            ) : (
              <>
                <Link href="/learn/hourly-rate">what an hour is worth</Link> and{" "}
                <Link href="/learn/paid-time">what counts as paid time</Link>.
              </>
            )}
          </p>
        </div>
      </section>

      <article className="prose">{children}</article>

      <section className="section tight" id="in-this-topic">
        <div className="wrap">
          <div className="eyebrow">Everything in this topic</div>
          <h2 style={{ fontSize: "clamp(24px, 3vw, 32px)" }}>{cluster.label}</h2>
          <p className="sec-lede">{cluster.definition}</p>

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
            Not sure this is the right topic? Go back to the{" "}
            <Link href="/learn">full topic map</Link>.
          </p>
        </div>
      </section>

      <Faq
        items={faq}
        eyebrow="Questions"
        title={`${cluster.label} — short answers`}
        lede="The questions people ask after reading this topic."
        id="faq"
      />

      <section className="section tight">
        <div className="wrap" style={{ textAlign: "center" }}>
          <p className="sec-lede" style={{ margin: "0 auto 18px" }}>
            Every guide here exists to make one number honest — the one on the{" "}
            <Link href="/">free salary timer</Link>.
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
