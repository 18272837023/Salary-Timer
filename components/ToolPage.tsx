import { Link } from "@/components/SmartLink";
import { SalaryApp } from "@/components/SalaryApp";
import { Faq, ToolLinks, type FaqItem } from "@/components/sections";
import type { ToolRoute } from "@/lib/site";
import { getLearn } from "@/lib/site";

/**
 * Shared shell for every long-tail landing page.
 *
 * Each page gets a real H1, its own copy, the live tool, its own FAQ and a
 * breadcrumb — so they are genuinely distinct documents rather than doorway
 * pages pointing at the homepage.
 */
export function ToolPage({
  tool,
  h1,
  lede,
  faq,
  children,
}: {
  tool: ToolRoute;
  h1: React.ReactNode;
  lede: string;
  faq: FaqItem[];
  children: React.ReactNode;
}) {
  const relatedLearn = tool.relatedLearnHref ? getLearn(tool.relatedLearnHref) : null;

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
          {relatedLearn ? (
            <p className="learn-related">
              New here? Read <Link href={relatedLearn.href}>{relatedLearn.label}</Link>, or open the{" "}
              <Link href="/">salary timer</Link> on the homepage.
            </p>
          ) : (
            <p className="learn-related">
              Or start on the homepage with the <Link href="/">salary timer</Link>.
            </p>
          )}
        </div>
      </section>

      <div className="wrap">
        <SalaryApp />
      </div>

      <article className="prose">{children}</article>

      <Faq
        items={faq}
        eyebrow="Questions"
        title={`${tool.label}: the short answers`}
        lede="Everything people ask about this particular calculation."
        id="faq"
      />

      <ToolLinks current={tool.href} />
    </main>
  );
}
