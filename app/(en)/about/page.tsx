import type { Metadata } from "next";
import { Link } from "@/components/SmartLink";
import { AuthorStrip } from "@/components/AuthorStrip";
import { AUTHOR, AUTHOR_ID } from "@/lib/author";
import {
  ABOUT_PAGE,
  CONTACT_EMAIL,
  ORGANIZATION_ID,
  SAME_AS,
  SITE_NAME,
  absoluteUrl,
  pageUrl,
} from "@/lib/site";

export const metadata: Metadata = {
  // The layout appends "· Salary Timer"; the title here must not repeat it.
  title: ABOUT_PAGE.title,
  description: ABOUT_PAGE.description,
  alternates: { canonical: ABOUT_PAGE.href },
  openGraph: {
    title: ABOUT_PAGE.title,
    description: ABOUT_PAGE.description,
    url: ABOUT_PAGE.href,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: `${SITE_NAME} — a live earnings counter` }],
  },
};

/**
 * `/about` exists for one reason: a calculator that shows you a number about
 * your own pay should be able to say who is behind it. It is also where the
 * Person node lives, so the Organization declared in the layout can point at a
 * real human with a stable @id instead of an anonymous brand.
 *
 * A Server Component — the JSON-LD has to be in the prerendered HTML.
 */

const url = pageUrl(ABOUT_PAGE.href);
const homeUrl = pageUrl("/");

const schema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "AboutPage",
      "@id": `${url}#webpage`,
      url,
      name: ABOUT_PAGE.title,
      description: ABOUT_PAGE.description,
      inLanguage: "en",
      isPartOf: { "@type": "WebSite", name: SITE_NAME, url: homeUrl },
      about: { "@id": AUTHOR_ID },
      mainEntity: { "@id": AUTHOR_ID },
      publisher: { "@id": ORGANIZATION_ID },
      breadcrumb: { "@id": `${url}#breadcrumb` },
    },
    {
      "@type": "Person",
      "@id": AUTHOR_ID,
      name: AUTHOR.name,
      url,
      image: absoluteUrl(AUTHOR.avatar),
      jobTitle: AUTHOR.role,
      description: AUTHOR.bio[0],
      knowsAbout: AUTHOR.knowsAbout,
      email: `mailto:${AUTHOR.email}`,
      worksFor: { "@id": ORGANIZATION_ID },
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${url}#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: homeUrl },
        { "@type": "ListItem", position: 2, name: ABOUT_PAGE.label, item: url },
      ],
    },
  ],
};

export default function AboutPage() {
  return (
    <main id="top">
      <section className="tool-hero">
        <div className="blob m" />
        <div className="wrap">
          <nav className="crumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{ABOUT_PAGE.label}</span>
          </nav>

          <h1 className="tool-h1">
            About this site: one person,
            <br />
            one <span className="hl">honest counter</span>.
          </h1>
          <p className="lede">
            {SITE_NAME} is built and maintained by one developer. This page says who that is, why
            the counter works the way it does, and what happens to the numbers you type into it.
          </p>
        </div>
      </section>

      <article className="prose">
        <script
          type="application/ld+json"
          // Generated from our own constants — no user input reaches this string.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />

        <AuthorStrip eyebrow={false} aboutLink={false} />

        <section>
          <h2>Who runs this site</h2>
          {AUTHOR.bio.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
          <p>
            {AUTHOR.role}, reachable at{" "}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. The source code is public in
            the <a href={SAME_AS[0]}>repository</a>, so every claim on this page can be checked
            against the thing that actually runs.
          </p>
        </section>

        <section>
          <h2>Why the counter works this way</h2>
          <p>
            Most salary tools start from an annual figure and divide it by 2,080 — 40 hours a week,
            52 weeks a year. It is a tidy number and it is wrong for most people, usually by 10–20%.
            It assumes no unpaid lunch, no holidays, no overtime and a five-day week that never
            changes.
          </p>
          <p>
            This timer asks for your schedule instead. The days you actually work, the break you
            actually take, the overtime rate you actually get. Then it counts only the paid time
            that has passed, pauses during unpaid breaks, and stops at the end of your shift unless
            you have told it overtime is allowed.
          </p>
          <p>
            That is also why the page shows a rate per second. Once you know what an hour of your
            working life is worth, the smaller units stop being a gimmick and start being the most
            honest way to display the number.
          </p>
        </section>

        <section>
          <h2>What happens to your numbers</h2>
          <p>
            Your pay, schedule and breaks are saved in this browser&apos;s{" "}
            <code>localStorage</code> and the arithmetic runs on your device. Nothing is uploaded,
            because there is no server-side database to upload it to, and no account to attach it
            to. Clearing your browser data deletes the settings, which is the intended behaviour
            rather than a bug.
          </p>
          <p>
            The site does run Google Analytics to count page views and a small set of interaction
            events — whether setup completes, whether the timer is used, whether the floating
            window opens. Those events carry fixed labels, never amounts. The{" "}
            <Link href="/privacy">privacy policy</Link> lists every event and every parameter, and
            privacy mode blurs the numbers on screen for when someone is looking over your
            shoulder.
          </p>
        </section>

        <section>
          <h2>What this site is not</h2>
          <p>{AUTHOR.limit}</p>
          <ul className="checks">
            <li>
              <b>Not a payslip.</b> The number is a gross estimate from the inputs you provide. Your
              employer&apos;s payroll system applies rounding, deductions and rules this page does
              not model.
            </li>
            <li>
              <b>Not tax advice.</b> No income tax, national insurance, social security or pension
              contribution is calculated here, in any country.
            </li>
            <li>
              <b>Not a time-tracking product.</b> Nothing is recorded, submitted to an employer or
              exported as an invoice. Close the tab and the session is gone.
            </li>
          </ul>
        </section>

        <section>
          <h2>Corrections</h2>
          <p>
            If a number on this page is wrong, or a formula is stated in a way that misleads, email{" "}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> with the page and what you
            expected to see. Corrections to arithmetic are treated as bugs and fixed first;
            disagreements about how a rate should be defined are answered on the page rather than
            in private, so the next reader gets the answer too.
          </p>
          <p>
            Back to the <Link href="/">live salary timer</Link>.
          </p>
        </section>
      </article>

      <section className="section tight">
        <div className="wrap" style={{ textAlign: "center" }}>
          <p className="sec-lede" style={{ margin: "0 auto 18px" }}>
            No account, no upload, no small print beyond the two policy pages.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/" className="btn btn-mint">
              Open the salary timer
            </Link>
            <Link href="/privacy" className="btn btn-ghost">
              Privacy policy
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
