import type { Metadata } from "next";
import { Link } from "@/components/SmartLink";
import { LearnPage } from "@/components/LearnPage";
import type { FaqItem } from "@/components/sections";
import { learnSchemas } from "@/lib/schema";
import { getLearn } from "@/lib/site";

const article = getLearn("/learn/why-is-my-first-paycheck-smaller");

export const metadata: Metadata = {
  title: article.title,
  description: article.description,
  alternates: { canonical: article.href },
  openGraph: {
    title: article.title,
    description: article.description,
    url: article.href,
  },
};

const faq: FaqItem[] = [
  {
    q: "Why is my first paycheck so much smaller?",
    a: "Two reasons stacked. The pay period is partial, so it covers fewer days than a normal one. And deductions are calculated on that smaller gross, so a fixed or one-off deduction takes a bigger share of it. A first paycheck at 40–60% of a normal one is common and usually correct.",
  },
  {
    q: "Do I lose the missing money?",
    a: "No. The days you worked before the pay period started are still owed to you and appear in the next cycle. What can genuinely disappear is anything deducted as a one-off — equipment, uniforms, overpaid leave — which is worth checking line by line.",
  },
  {
    q: "Why is the tax percentage different on my first paycheck?",
    a: "Because tax is calculated per paycheck, not per year. A smaller gross can fall into a lower withholding band, or be taxed at a flat supplementary rate. Over twelve months it usually evens out, but the first one or two payslips can look inconsistent.",
  },
  {
    q: "How long until my pay normalises?",
    a: "Usually by the second or third full cycle. If the second paycheck is also short and you started before the period began, ask payroll which days each payment covers — the period dates are on the payslip for exactly this reason.",
  },
];

export default function FirstPaycheckSmallerPage() {
  return (
    <LearnPage
      article={article}
      h1={
        <>
          Why your first paycheck is <span className="hl">smaller</span>.
        </>
      }
      lede="Almost nobody's first paycheck matches the number they divided by twelve in their head. There are two reasons, they stack, and one of them is not actually a loss."
      faq={faq}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(learnSchemas(article, faq)) }}
      />

      <section>
        <h2>Two separate things, happening at once</h2>
        <p>
          The first is arithmetic: a first paycheck usually covers a partial pay period, because you
          started partway through one. If the period runs the 1st to the 15th and you started on the
          8th, you are paid for eight days, not fifteen.
        </p>
        <p>
          The second is structural: deductions do not shrink in proportion. A percentage deduction
          scales with your gross, but a fixed one does not — and a one-off deduction hits a small
          paycheck far harder than a full one. Together they can turn a paycheck you expected to be
          $3,650 into $1,509.
        </p>
      </section>

      <section>
        <h2>The same job, two paychecks</h2>
        <p>
          A $5,000 monthly gross, a 22-working-day period, 22% income tax, 5% pension, and one
          one-off equipment deduction of $150 in the first cycle:
        </p>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Line</th>
                <th>Full period</th>
                <th>First period (10 of 22 days)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Gross pay</td>
                <td>$5,000</td>
                <td>$2,273</td>
              </tr>
              <tr>
                <td>Income tax (22%)</td>
                <td>−$1,100</td>
                <td>−$500</td>
              </tr>
              <tr>
                <td>Pension (5%)</td>
                <td>−$250</td>
                <td>−$114</td>
              </tr>
              <tr>
                <td>One-off equipment</td>
                <td>—</td>
                <td>−$150</td>
              </tr>
              <tr>
                <td>Net pay</td>
                <td>$3,650</td>
                <td>$1,509</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p>
          The first paycheck is 41% of a normal one. Roughly 45% of that gap is the partial period,
          and the rest is the one-off deduction landing on a smaller base. Neither is an error, and
          only one of them is permanent.
        </p>

        <h3>Which part is actually lost</h3>
        <p>
          The unpaid days are not lost — you simply had not worked them yet when the period closed.
          They appear in the next cycle, which is why the second paycheck is often slightly larger
          than a normal one.
        </p>
        <p>
          What <em>is</em> gone is any genuine one-off: equipment, uniform, a training fee, or a
          recovery for leave you had not accrued. Those are worth checking line by line, because they
          are the only part of the gap that does not come back.
        </p>
      </section>

      <section>
        <h2>Why the tax percentage looks wrong</h2>
        <p>
          Tax is withheld per paycheck, not recalculated annually. A partial period produces a smaller
          gross, which can fall into a different withholding band than your normal pay — so the
          effective percentage on a first payslip can be higher or lower than it will be later.
        </p>
        <p>
          This usually evens out across the year. It only becomes a real problem if the withholding
          assumption is wrong for your actual annual pay, which shows up as a surprise at tax time
          rather than in month one.
        </p>

        <h3>Where the cycle fits in</h3>
        <p>
          How big the partial period is depends entirely on your pay cycle. On a weekly cycle the
          worst case is six days short; on a monthly cycle it can be three weeks. That is one more
          reason{" "}
          <Link href="/learn/how-pay-periods-work">the pay period structure</Link> matters more than
          people expect — the same start date produces very different first paychecks depending on
          the cycle.
        </p>
      </section>

      <section>
        <h2>What to check on the payslip</h2>
        <ul className="checks">
          <li>
            <b>The period dates.</b> Confirm which days the payment covers. This single line explains
            most of the gap.
          </li>
          <li>
            <b>One-off deductions.</b> Anything labelled equipment, uniform, advance or recovery is a
            genuine reduction, not a timing effect.
          </li>
          <li>
            <b>The hourly rate used.</b> If the payslip implies a rate, compare it to your real one —
            the arithmetic is in <Link href="/learn/hourly-rate">what an hour is worth</Link>.
          </li>
          <li>
            <b>Whether breaks were treated as unpaid.</b> A payslip that pays you for break time will
            disagree with your own record; see{" "}
            <Link href="/learn/are-lunch-breaks-paid">are lunch breaks paid</Link>.
          </li>
        </ul>
        <p>
          Once you know your payday, the <Link href="/paycheck-countdown">paycheck countdown</Link>{" "}
          turns the wait into a number of days, hours and shifts. The full topic — all four cycles and
          the biweekly drift — is <Link href="/learn/pay-schedule">when the money arrives</Link>.
        </p>
      </section>
    </LearnPage>
  );
}
