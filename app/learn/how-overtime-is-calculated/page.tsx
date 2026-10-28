import type { Metadata } from "next";
import { Link } from "@/components/SmartLink";
import { LearnPage } from "@/components/LearnPage";
import type { FaqItem } from "@/components/sections";
import { learnSchemas } from "@/lib/schema";
import { getLearn } from "@/lib/site";

const article = getLearn("/learn/how-overtime-is-calculated");

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
    q: "How is overtime pay calculated?",
    a: "Multiply your regular rate by the overtime multiplier, then by the overtime hours. At a $25 regular rate and 1.5×, each overtime hour is worth $37.50. Overtime hours are usually those worked beyond 40 in a workweek — not beyond 8 in a day, though some places use a daily threshold too.",
  },
  {
    q: "Is overtime calculated on the base wage or total pay?",
    a: "On the regular rate, which can be higher than the base wage. Non-discretionary bonuses, shift differentials and production bonuses are generally included when working out the regular rate, which pushes up the overtime rate as well. Discretionary bonuses usually are not.",
  },
  {
    q: "Does an unpaid lunch count toward the 40 hours?",
    a: "No. Only hours actually worked count. A 45-hour week with five unpaid lunch hours is 40 worked hours, so there is no overtime at all — a distinction that costs people real money when they assume the clock on the wall is the one that counts.",
  },
  {
    q: "Is 1.5× the legal minimum everywhere?",
    a: "No. 1.5× is the common statutory minimum in the US and appears in many contracts elsewhere, but plenty of jurisdictions and agreements use different figures, and some use 2× for holidays or very long shifts. Your contract and local law decide, not a calculator.",
  },
];

export default function HowOvertimeIsCalculatedPage() {
  return (
    <LearnPage
      article={article}
      h1={
        <>
          How overtime is <span className="hl">calculated</span>.
        </>
      }
      lede="Overtime is a multiplier applied to a base. Both halves of that sentence cause arguments, and the arguments almost always cost the worker money rather than the employer."
      faq={faq}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(learnSchemas(article, faq)) }}
      />

      <section>
        <h2>Overtime is a multiplier, not a rate</h2>
        <p>
          There is no such thing as &ldquo;the overtime rate&rdquo;. There is your regular rate, and
          there is a multiplier applied to it. At $25 an hour, a 1.5× overtime hour is $37.50 — and
          if your regular rate was miscalculated, every overtime hour inherits the same error.
        </p>
        <p className="formula">
          overtime hour value = regular rate × multiplier
        </p>
        <p>
          The multiplier is the part everyone knows. The regular rate is the part that gets argued
          about, and it is the one that actually decides your money.
        </p>
      </section>

      <section>
        <h2>What different multipliers are worth</h2>
        <p>
          Five overtime hours on top of a 40-hour week, at a $25 regular rate. The only variable is
          the multiplier:
        </p>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Multiplier</th>
                <th>Weekly pay</th>
                <th>Annual (×52)</th>
                <th>Gap vs no overtime</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1.0× (flat, no premium)</td>
                <td>$1,125.00</td>
                <td>$58,500</td>
                <td>—</td>
              </tr>
              <tr>
                <td>1.25×</td>
                <td>$1,156.25</td>
                <td>$60,125</td>
                <td>$1,625</td>
              </tr>
              <tr>
                <td>1.5× (the common minimum)</td>
                <td>$1,187.50</td>
                <td>$61,750</td>
                <td>$3,250</td>
              </tr>
              <tr>
                <td>2.0×</td>
                <td>$1,250.00</td>
                <td>$65,000</td>
                <td>$6,500</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p>
          Moving from 1.25× to 1.5× on five hours a week is worth $1,625 a year. That is not a
          rounding difference — it is the difference between one multiplier and another, on the same
          hours, for the same employer.
        </p>

        <h3>The base rate is where it goes wrong</h3>
        <p>
          Overtime is computed on your <em>regular rate</em>, not your base wage. The regular rate is
          your total non-discretionary pay divided by hours worked, so anything routinely paid on top
          of the base wage — shift differentials, production bonuses, non-discretionary commissions —
          generally raises it. A night-shift worker on a differential therefore has a higher overtime
          rate than a day-shift worker on the same base.
        </p>
        <p>
          Employers that compute overtime on the base wage alone are understating it. It is worth
          checking your payslip against both numbers once, because the gap compounds across every
          overtime hour you work.
        </p>

        <h3>Which hours count toward the threshold</h3>
        <p>
          Only hours actually worked. Unpaid meal breaks do not count, which produces the most
          expensive misunderstanding in this topic: a 45-hour week with five unpaid lunch hours is 40
          worked hours, so there is no overtime. The person who assumed the clock on the wall counted
          works five extra hours for nothing.
        </p>
        <p>
          The full list of what counts is in{" "}
          <Link href="/learn/paid-time">what counts as paid time</Link>; the lunch case specifically
          is in <Link href="/learn/are-lunch-breaks-paid">are lunch breaks paid</Link>.
        </p>
      </section>

      <section>
        <h2>Four traps, in order of how much they cost</h2>
        <ul className="checks">
          <li>
            <b>Computing on base wage instead of regular rate.</b> Silently understates every
            overtime hour, and the error scales with how much variable pay you receive.
          </li>
          <li>
            <b>Counting break time as worked time.</b> The reverse error — it makes people believe
            they have overtime when the threshold has not been crossed, and it makes the hours look
            better than the payslip.
          </li>
          <li>
            <b>Assuming a daily threshold exists.</b> In many places overtime starts after 40 in a
            week, so a 12-hour Monday does not trigger it on its own. Some jurisdictions do use a
            daily rule — check which applies to you.
          </li>
          <li>
            <b>Averaging two weeks together.</b> Some arrangements allow hours to be averaged over a
            longer period, which can legally wipe out overtime that a single week would have earned.
            If your contract mentions averaging, that is what it is doing.
          </li>
        </ul>
      </section>

      <section>
        <h2>Working out whether an extra shift is worth it</h2>
        <p>
          The useful version of this calculation is prospective: someone asks you to cover a Saturday
          and you want the number before you answer. Eight hours at 1.5× on a $25 rate is $300 —
          which is a different conversation from &ldquo;a Saturday&rdquo;.
        </p>
        <p>
          That is exactly what the <Link href="/overtime-pay-calculator">overtime pay calculator</Link>{" "}
          does: set the multiplier, set the hours, see what the shift is worth before you agree to it.
          For the wider picture on which hours are premium in the first place, including night
          differentials, see <Link href="/learn/paid-time">what counts as paid time</Link> and{" "}
          <Link href="/learn/night-shift-pay">night shift pay</Link>. Long shifts have their own
          arithmetic, covered in{" "}
          <Link href="/learn/twelve-hour-shift-pay">12-hour shift pay</Link>.
        </p>
      </section>
    </LearnPage>
  );
}
