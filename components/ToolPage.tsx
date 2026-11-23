import { Link } from "@/components/SmartLink";
import { SalaryApp } from "@/components/SalaryApp";
import { Faq, type FaqItem } from "@/components/sections";
import type { ToolRoute } from "@/lib/site";

/**
 * Shared shell for a single-purpose tool page: breadcrumb, H1, a hero slot,
 * long-form body, then the FAQ.
 *
 * The hero is a slot rather than a hard-coded <SalaryApp /> because the live
 * timer is not the right instrument for every job. A page whose whole purpose
 * is "give me one number from one number" should not hand the visitor a
 * counter that starts ticking; it should hand them the conversion. Pages that
 * do not pass a hero still get the timer, because for most tools that *is* the
 * product.
 *
 * A Server Component: the page's JSON-LD and copy have to be in the exported
 * HTML, not assembled after hydration.
 */
export function ToolPage({
  tool,
  h1,
  lede,
  faq,
  children,
  hero,
}: {
  tool: ToolRoute;
  h1: React.ReactNode;
  lede: string;
  faq: FaqItem[];
  children: React.ReactNode;
  hero?: React.ReactNode;
}) {
  return (
    <main id="top">
      <section className="tool-hero">
        <div className="blob m" />
        <div className="wrap">
          <nav className="crumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{tool.label}</span>
          </nav>

          <h1 className="tool-h1">{h1}</h1>
          <p className="lede">{lede}</p>
        </div>
      </section>

      <div className="wrap">{hero ?? <SalaryApp />}</div>

      <article className="prose">{children}</article>

      <Faq
        items={faq}
        eyebrow="Questions"
        title={`${tool.label}: the short answers`}
        lede="No hedging, no small print."
        id="faq"
      />
    </main>
  );
}
