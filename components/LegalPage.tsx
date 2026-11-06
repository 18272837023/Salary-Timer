import { Link } from "@/components/SmartLink";
import {
  CONTACT_EMAIL,
  LEGAL_PAGES,
  LEGAL_UPDATED,
  ORGANIZATION_ID,
  SITE_NAME,
  pageUrl,
  type LegalPageRoute,
} from "@/lib/site";

/**
 * Shared shell for the two legal pages.
 *
 * Deliberately reuses the `.tool-hero` / `.prose` layout from LearnPage so the
 * policies look like part of the site rather than a pasted document. Everything
 * that is identical between the two pages — breadcrumb, structured data, the
 * "last updated" line, the contact block and the cross-link to the other page —
 * lives here so the two policies can never drift apart on those details.
 *
 * This is a Server Component: no interactive state, and the JSON-LD is emitted
 * into the prerendered HTML where crawlers can read it without executing JS.
 */

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// Built from the ISO constant rather than toLocaleDateString so the prerendered
// HTML is identical regardless of the build machine's ICU data or timezone.
function updatedLabel(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  return `${day} ${MONTHS[month - 1]} ${year}`;
}

export function LegalPage({
  page,
  h1,
  lede,
  children,
}: {
  page: LegalPageRoute;
  h1: React.ReactNode;
  lede: string;
  children: React.ReactNode;
}) {
  const url = pageUrl(page.href);
  const homeUrl = pageUrl("/");
  const other = LEGAL_PAGES.find((p) => p.href !== page.href);

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: page.title,
        description: page.description,
        inLanguage: "en",
        dateModified: LEGAL_UPDATED,
        isPartOf: { "@type": "WebSite", name: SITE_NAME, url: homeUrl },
        about: { "@id": ORGANIZATION_ID },
        publisher: { "@id": ORGANIZATION_ID },
        breadcrumb: { "@id": `${url}#breadcrumb` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: homeUrl },
          { "@type": "ListItem", position: 2, name: page.label, item: url },
        ],
      },
    ],
  };

  return (
    <main id="top">
      <section className="tool-hero">
        <div className="blob m" />
        <div className="wrap">
          <nav className="crumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{page.label}</span>
          </nav>

          <h1 className="tool-h1">{h1}</h1>
          <p className="lede">{lede}</p>
          <p className="legal-updated">
            Last updated <time dateTime={LEGAL_UPDATED}>{updatedLabel(LEGAL_UPDATED)}</time>
          </p>
        </div>
      </section>

      <article className="prose">
        <script
          type="application/ld+json"
          // Generated from our own constants — no user input reaches this string.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
        {children}
      </article>

      <section className="section tight">
        <div className="wrap" style={{ textAlign: "center" }}>
          <p className="sec-lede" style={{ margin: "0 auto 18px" }}>
            Questions about this page? Email{" "}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>, or go back to the{" "}
            <Link href="/">free live salary timer</Link> on the homepage.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/" className="btn btn-mint">
              Open the salary timer
            </Link>
            {other ? (
              <Link href={other.href} className="btn btn-ghost">
                {other.label}
              </Link>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}
