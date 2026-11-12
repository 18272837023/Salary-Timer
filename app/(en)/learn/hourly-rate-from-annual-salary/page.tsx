import type { Metadata } from "next";
import { Link } from "@/components/SmartLink";
import { LearnPage } from "@/components/LearnPage";
import { learnSchemas } from "@/lib/schema";
import { getLearn } from "@/lib/site";

const article = getLearn("/learn/hourly-rate-from-annual-salary");

export const metadata: Metadata = {
  title: article.title,
  description: article.description,
  alternates: { canonical: article.href },
  openGraph: { title: article.title, description: article.description, url: article.href },
};

const faq = [
  {
    "q": "When is salary divided by 2,080 appropriate?",
    "a": "For an annualized estimate based on 40 paid hours per week and 52 weeks. An 8.5-hour shift with a 30-minute unpaid lunch still gives eight paid hours a day and can fit this assumption."
  },
  {
    "q": "Should I use gross or net salary?",
    "a": "Use gross pay for a pre-tax comparison. For a take-home hourly rate, divide net pay by the hours for the same period. Salary Timer estimates gross pay and does not calculate tax or deductions."
  },
  {
    "q": "Does this estimate include paid leave?",
    "a": "The timer repeats your weekly schedule over 52 weeks. It does not subtract specific paid holidays, vacation dates or unpaid leave. To measure pay per hour actually worked in a particular year, use recorded hours and actual annual pay separately."
  },
  {
    "q": "Is this the statutory regular rate for overtime?",
    "a": "Not necessarily. This is an annualized salary conversion. A statutory overtime regular rate can depend on jurisdiction, workweek earnings, bonuses and other rules; do not substitute this estimate for that calculation."
  }
];

export default function Page() {
  return (
    <LearnPage article={article} h1="Hourly rate from annual salary: choose the right hours"
      lede="Divide gross annual salary by annual hours measured on the same basis. A 2,080-hour year fits a 40-hour paid week; other schedules need a different divisor." faq={faq}>
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(learnSchemas(article, faq)) }} />

      <section>
        <h2>Annualized salary-to-hourly formula</h2>
        <p className="formula">estimated hourly rate = gross annual salary ÷ (paid hours per day × working days per week × 52)</p>
        <p>Paid hours per day means shift length minus unpaid breaks, counted once.
          From 09:00 to 17:30 is 8.5 hours. Subtract a 30-minute unpaid lunch and the paid day
          is eight hours. If two additional 15-minute breaks are also genuinely unpaid,
          the paid day is 7.5 hours. Do not subtract paid rest breaks.</p>
      </section>
      <section>
        <h2>Worked example: $60,000 on three schedules</h2>
        <p>Assume the same gross annual salary and 52 weeks in every row.</p>
        <div className="table-wrap"><table>
          <thead><tr><th>Paid hours / week</th><th>Annual hours</th><th>Estimated hourly rate</th></tr></thead>
          <tbody>
            <tr><td>37.5</td><td>1,950</td><td>$30.77</td></tr>
            <tr><td>40</td><td>2,080</td><td>$28.85</td></tr>
            <tr><td>42.5</td><td>2,210</td><td>$27.15</td></tr>
          </tbody>
        </table></div>
        <p>At 40 paid hours per week, dividing by 2,080 is correct for this model.
          The presence of an unpaid lunch does not change that if the remaining paid week
          is still 40 hours. Read <Link href="/learn/2080-hours-in-a-year">where 2,080 comes from</Link>.</p>
      </section>
      <section>
        <h2>Three different hourly-rate questions</h2>
        <ul className="checks">
          <li><strong>Annualized equivalent:</strong> gross annual salary divided by a
            repeating weekly schedule times 52. This is the timer’s salary mode.</li>
          <li><strong>Effective pay per hour actually worked:</strong> actual pay divided
            by actual recorded hours for the same period. Unpaid extra work increases
            this denominator; paid leave can make it different from scheduled annual hours.</li>
          <li><strong>Statutory overtime regular rate:</strong> a legal calculation with
            jurisdiction-specific inclusions and exclusions. The annualized equivalent
            is not automatically this rate.</li>
        </ul>
        <p>Commuting can be included in a separate personal time-cost comparison, but it is
          not an input to this timer’s paid-hours model. An unrelated second job does not
          change the conversion for the salary being measured.</p>
      </section>
      <section>
        <h2>Use the same basis in the calculator and the timer</h2>
        <p>The <Link href="/hourly-rate-calculator">hourly rate calculator</Link> and
          <Link href="/"> live salary timer</Link> share the annualized calculation.
          Monthly mode first multiplies salary by 12; hourly mode uses your entered rate directly.
          See <Link href="/learn/monthly-salary-to-hourly-rate">monthly salary to hourly rate</Link>,
          <Link href="/salary-per-second"> salary per second</Link> and
          <Link href="/learn/how-overtime-is-calculated"> overtime calculation rules</Link>
          for the corresponding assumptions.</p>
      </section>
    </LearnPage>
  );
}
