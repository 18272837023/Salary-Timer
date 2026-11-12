import { contentUpdated, sourcesFor } from "@/lib/editorial";
import { CONTACT_EMAIL, SAME_AS, SITE_NAME, type ClusterId } from "@/lib/site";

export function ContentByline({ href }: { href: string }) {
  const updated = contentUpdated(href);
  return (
    <p className="content-byline">
      Published and maintained by <a href={SAME_AS[0]}>{SITE_NAME}</a>
      {updated && <> · Updated <time dateTime={updated}>{updated}</time></>}
    </p>
  );
}

export function ContentNotes({ cluster }: { cluster?: ClusterId }) {
  return (
    <section className="content-notes" aria-label="Calculation method and sources">
      <h2>Calculation method and sources</h2>
      <p>Salary modes estimate gross pay using scheduled paid hours per week × 52.
        Monthly pay is multiplied by 12 before conversion; hourly mode uses the entered rate.
        Unpaid breaks are subtracted once from shift length. Figures are rounded for display.
        Specific leave dates, taxes and deductions are not calculated.</p>
      <p>An annualized hourly equivalent differs from pay divided by actual recorded hours
        and from a statutory overtime regular rate. With overtime enabled, this timer counts
        after your configured shift end at your chosen multiplier; it does not determine
        legal coverage or apply a statutory weekly threshold automatically.</p>
      {cluster === "paid-time" && (
        <p>The US examples use general federal FLSA rules for covered, nonexempt workers;
          state protections, exemptions and special statutory arrangements can differ.
          UK examples are identified separately. Required work cannot be made unpaid
          merely by labelling it a break or writing it out of a contract.</p>
      )}
      <ul>
        {sourcesFor(cluster).map((source) => (
          <li key={source.url}><a href={source.url}>{source.label}</a></li>
        ))}
      </ul>
      <p className="content-corrections">These guides explain the product and example calculations.
        They are not an independent payroll or legal review. Report a calculation or source issue
        to <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.</p>
    </section>
  );
}
