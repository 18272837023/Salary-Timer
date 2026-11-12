import type { Metadata } from "next";
import { Link } from "@/components/SmartLink";
import { LearnPage } from "@/components/LearnPage";
import { learnSchemas } from "@/lib/schema";
import { getLearn } from "@/lib/site";

const article = getLearn("/learn/how-overtime-is-calculated");

export const metadata: Metadata = {
  title: article.title,
  description: article.description,
  alternates: { canonical: article.href },
  openGraph: { title: article.title, description: article.description, url: article.href },
};

const faq = [
  {
    "q": "How is overtime pay calculated?",
    "a": "For a simple hourly example, multiply the applicable overtime regular rate by the multiplier and qualifying overtime hours. At a $25 regular rate, 1.5 times the rate is $37.50 per overtime hour. Salary arrangements and statutory calculations may require additional steps."
  },
  {
    "q": "When does the US federal overtime threshold apply?",
    "a": "Under the general FLSA rule, covered, nonexempt employees receive at least 1.5 times their regular rate for hours worked over 40 in a workweek. Exemptions, special arrangements and state rules can change the analysis."
  },
  {
    "q": "Does an unpaid lunch count toward 40 hours?",
    "a": "Under the general US federal FLSA rule, a bona fide duty-free unpaid meal period is not hours worked. A 45-hour attendance window containing five such meal hours is 40 worked hours, so it does not exceed that federal weekly threshold. State rules may differ."
  },
  {
    "q": "Can two weeks be averaged to avoid overtime?",
    "a": "Not under the general US federal FLSA workweek rule: hours cannot be averaged over two or more weeks. Specific statutory exceptions or rules in other jurisdictions must be checked separately; a contract term alone does not override the applicable law."
  },
  {
    "q": "Is 1.5 times the rate a legal minimum worldwide?",
    "a": "No. It is the general US federal minimum for covered, nonexempt workers above the weekly threshold. In the UK, there is no general requirement to pay an overtime premium, although average pay must meet the applicable minimum wage and contractual terms matter."
  }
];

export default function Page() {
  return (
    <LearnPage article={article} h1="How overtime is calculated: rates, thresholds and jurisdiction"
      lede="Once the applicable rate and qualifying hours are known, overtime pay is multiplication. Determining those inputs depends on local law and the employment arrangement." faq={faq}>
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(learnSchemas(article, faq)) }} />

      <section>
        <h2>Start with the jurisdiction and worker coverage</h2>
        <p>The US examples here use the general federal FLSA rule for covered,
          nonexempt employees: at least 1.5 times the regular rate for hours worked
          beyond 40 in a workweek. This is not a universal daily or weekly threshold.
          State protections, exemptions and special statutory arrangements may differ.</p>
        <p>In the UK, employers generally do not have to pay an overtime premium;
          contractual rates and minimum-wage obligations still apply. The official
          US and UK guidance is linked in the sources below.</p>
      </section>
      <section>
        <h2>Worked example: five overtime hours at $25</h2>
        <p className="formula">overtime pay = applicable regular rate × multiplier × qualifying overtime hours</p>
        <p>Assume a $25 regular rate, 40 straight-time hours and five additional qualifying
          hours, paid separately at the multiplier shown. Annual figures repeat that exact
          week 52 times and exclude leave, bonuses and deductions.</p>
        <div className="table-wrap"><table>
          <thead><tr><th>Multiplier</th><th>Pay for 5 extra hours</th><th>Total weekly pay</th><th>Annualized total</th></tr></thead>
          <tbody>
            <tr><td>1.0× (comparison only)</td><td>$125.00</td><td>$1,125.00</td><td>$58,500</td></tr>
            <tr><td>1.25× (comparison only)</td><td>$156.25</td><td>$1,156.25</td><td>$60,125</td></tr>
            <tr><td>1.5×</td><td>$187.50</td><td>$1,187.50</td><td>$61,750</td></tr>
            <tr><td>2.0×</td><td>$250.00</td><td>$1,250.00</td><td>$65,000</td></tr>
          </tbody>
        </table></div>
        <p>The 1.0× and 1.25× rows illustrate arithmetic; they would not satisfy the
          general FLSA 1.5× minimum for these qualifying hours. A displayed calculator
          option does not establish that a rate is lawful.</p>
      </section>
      <section>
        <h2>The regular rate may differ from the base wage</h2>
        <p>For the general FLSA calculation, the regular rate includes remuneration
          except for specific statutory exclusions. Shift differentials and
          nondiscretionary bonuses can affect it. Do not assume the annual salary
          conversion or the advertised base wage is the statutory regular rate.</p>
        <p>If straight-time pay already covers some extra hours, the additional premium
          owed can differ from a full 1.5× payment on top of that pay. Check the applicable
          salary arrangement rather than adding a premium twice.</p>
      </section>
      <section>
        <h2>Check hours worked and the workweek separately</h2>
        <ul className="checks">
          <li><strong>Meal periods:</strong> under the general US federal rule,
            bona fide duty-free unpaid meals do not count toward hours worked;
            short paid rest breaks generally do.</li>
          <li><strong>Weekly threshold:</strong> a 12-hour day alone does not trigger
            the general federal 40-hour rule. State daily-overtime rules can differ.</li>
          <li><strong>Averaging:</strong> the general federal rule does not permit
            averaging hours across two or more weeks to avoid overtime.</li>
          <li><strong>Required duties:</strong> handovers and travel between job sites
            during the workday can be compensable work. Do not label them unpaid by default.</li>
        </ul>
        <p>Read <Link href="/learn/are-lunch-breaks-paid">the meal-break guide</Link>,
          <Link href="/learn/twelve-hour-shift-pay"> 12-hour shift examples</Link> and
          <Link href="/learn/paid-time"> what counts as paid time</Link> for related questions.</p>
      </section>
      <section>
        <h2>What Salary Timer estimates</h2>
        <p>The <Link href="/overtime-pay-calculator">overtime calculator</Link> uses
          your entered or annualized hourly rate and chosen multiplier. When overtime is
          enabled, it counts beyond the configured shift end. It does not automatically
          enforce a statutory weekly threshold, exemptions or bonus adjustments.
          Use it to model a scenario after checking those inputs, rather than to determine
          a legal entitlement. See <Link href="/learn/night-shift-pay">night differentials</Link>
          for another component that may affect the rate.</p>
      </section>
    </LearnPage>
  );
}
