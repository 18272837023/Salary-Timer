import type { Metadata } from "next";
import { Hero } from "@/components/Hero";
import { SalaryApp } from "@/components/SalaryApp";
import {
  CtaBand,
  Faq,
  Features,
  HOME_FAQ,
  HowItWorks,
  LearnLinks,
  PainPoints,
  Personas,
  Scenarios,
  ToolLinks,
} from "@/components/sections";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL, absoluteUrl, ENTITY_DEFINITION, ORGANIZATION_ID, SAME_AS } from "@/lib/site";

export const metadata: Metadata = {
  // Absolute: do not append the layout “· Salary Timer” template on the homepage.
  title: { absolute: SITE_TITLE },
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: "/",
  },
};

const appSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: SITE_NAME,
  url: SITE_URL,
  applicationCategory: "FinanceApplication",
  operatingSystem: "Any — runs in the browser",
  browserRequirements: "Requires JavaScript",
  description: ENTITY_DEFINITION,
  inLanguage: "en",
  isAccessibleForFree: true,
  // Reference the Organization node by @id instead of leaving it null — one
  // entity, described once, pointed at from every schema block.
  publisher: { "@id": ORGANIZATION_ID },
  sameAs: SAME_AS,
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  featureList: [
    "Live salary counter, updated every second",
    "Salary per second, minute and hour",
    "Custom working days and shift times",
    "Unpaid break handling",
    "Overtime multipliers",
    "Payday countdown",
    "Savings jar",
    "Wishlist priced in working hours",
    "Privacy mode",
  ],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: HOME_FAQ.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") }],
};

export default function HomePage() {
  return (
    <main id="top">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(appSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <Hero>
        <SalaryApp />
      </Hero>

      {/* Entity definition, in the plainest possible words, above the fold of
          the content: the one sentence a search engine or an AI answer should
          be able to lift without reading anything else. */}
      <section className="section tight" aria-label="What Salary Timer is">
        <div className="wrap">
          <p className="sec-lede" style={{ maxWidth: 780, margin: "0 auto", textAlign: "center" }}>
            {ENTITY_DEFINITION} It runs entirely in your browser — no account, no install, and your
            pay figures never leave your device.
          </p>
        </div>
      </section>

      <PainPoints />
      <Features />
      <Personas />
      <Scenarios />
      <HowItWorks />
      <Faq items={HOME_FAQ} />
      <LearnLinks />
      <ToolLinks current="/" />
      <CtaBand />
    </main>
  );
}
