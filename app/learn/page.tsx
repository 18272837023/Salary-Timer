import type { Metadata } from "next";
import { Link } from "@/components/SmartLink";
import { LEARN, SITE_NAME, absoluteUrl, pageUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Learn — how salary timers, hourly rates and breaks actually work",
  description:
    "Short guides on salary timers, converting annual pay to an hourly rate, unpaid lunch breaks, and shift-work schedules. Free reading, no sign-up.",
  alternates: { canonical: "/learn" },
  openGraph: {
    title: `Learn · ${SITE_NAME}`,
    description:
      "Guides on salary timers, real hourly rates, unpaid breaks and shift work.",
    url: "/learn",
  },
};

const indexSchema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Learn",
  url: pageUrl("/learn"),
  description: "Guides on salary timers, hourly rates, breaks and shift work.",
  isPartOf: { "@type": "WebSite", name: SITE_NAME, url: absoluteUrl("/") },
  hasPart: LEARN.map((a) => ({
    "@type": "Article",
    name: a.label,
    url: pageUrl(a.href),
    description: a.description,
  })),
};

export default function LearnIndexPage() {
  return (
    <main id="top">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(indexSchema) }}
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
            Learn how the <span className="hl">numbers</span> actually work.
          </h1>
          <p className="lede">
            Short guides on salary timers, converting pay to an hourly rate, unpaid breaks and
            shift schedules — written so you can make a better decision with the live tools.
          </p>
          <p className="learn-related">
            Every guide here explains one part of the maths behind the{" "}
            <Link href="/">salary timer</Link> — what counts as paid time, how an hourly rate is
            derived, and what changes when you work nights.
          </p>
        </div>
      </section>

      <section className="section tight">
        <div className="wrap">
          <ul className="learn-index">
            {LEARN.map((article) => (
              <li key={article.href}>
                <Link href={article.href}>
                  <strong>{article.label}</strong>
                  <span>{article.blurb}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
