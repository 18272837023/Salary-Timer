import type { Metadata } from "next";
import { Link } from "@/components/SmartLink";
import { LearnPage } from "@/components/LearnPage";
import type { FaqItem } from "@/components/sections";
import { learnSchemas } from "@/lib/schema";
import { getLearn } from "@/lib/site";

const article = getLearn("/learn/monthly-salary-to-hourly-rate");

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
    q: "How do I convert a monthly salary to an hourly rate?",
    a: "Go through the year, not the month. Multiply your monthly salary by 12, then divide by your real annual paid hours (paid hours per day × paid days per week × 52). Dividing the monthly figure by 173.33 gives the same answer only if you work exactly 40 paid hours every week of the year.",
  },
  {
    q: "Why does everyone divide by 173.33?",
    a: "Because 2,080 ÷ 12 = 173.33. It is the annual default divided into twelve equal pieces, so it inherits the 2,080 assumption and adds a second one: that every month contains the same number of working days. February and March disagree by about 15%.",
  },
  {
    q: "Is a month 4 weeks?",
    a: "No — a month is about 4.35 weeks. Treating it as exactly 4 weeks understates your annual paid hours by roughly 8%, which makes your hourly rate look higher than it is. Four weeks is 28 days; the shortest month is 28 and the longest is 31.",
  },
  {
    q: "Does this work for a 13th-month salary?",
    a: "Add it to the annual figure before dividing. A 13th-month payment is part of your annual pay, so it belongs in the numerator. Leaving it out understates your rate by about 8%.",
  },
];

export default function MonthlySalaryToHourlyPage() {
  return (
    <LearnPage
      article={article}
      h1={
        <>
          Monthly salary to hourly rate — <span className="hl">go through the year</span>.
        </>
      }
      lede="Converting a monthly figure is the same conversion as an annual one, with one extra trap bolted on: months do not contain equal amounts of work. Dividing by 173.33 pretends they do."
      faq={faq}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(learnSchemas(article, faq)) }}
      />

      <section>
        <h2>Why 173.33 is worse than 2,080</h2>
        <p>
          173.33 is 2,080 ÷ 12. It is the standard monthly divisor, and it inherits every assumption
          of the annual version — 40 paid hours a week, 52 paid weeks — then adds a new one of its
          own: that all twelve months are the same size.
        </p>
        <p>
          They are not. A month holds between 19 and 23 working days depending on where weekends and
          public holidays land. Dividing a fixed monthly salary by a fixed 173.33 gives you one
          number that is wrong in every single month, and closest to right in none of them.
        </p>
      </section>

      <section>
        <h2>The same month, five different rates</h2>
        <p>
          Take a $5,000 monthly salary and eight paid hours a day. Nothing changes except how many
          working days the month happens to contain:
        </p>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Working days</th>
                <th>Paid hours</th>
                <th>Real rate that month</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>19</td>
                <td>152</td>
                <td>$32.89</td>
              </tr>
              <tr>
                <td>20</td>
                <td>160</td>
                <td>$31.25</td>
              </tr>
              <tr>
                <td>21</td>
                <td>168</td>
                <td>$29.76</td>
              </tr>
              <tr>
                <td>22</td>
                <td>176</td>
                <td>$28.41</td>
              </tr>
              <tr>
                <td>23</td>
                <td>184</td>
                <td>$27.17</td>
              </tr>
              <tr>
                <td>— (the 173.33 default)</td>
                <td>173.33</td>
                <td>$28.85</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p>
          A 21% spread between the best and worst month, for identical pay. The 173.33 figure sits
          near the middle and describes no actual month — it is an average being used as if it were a
          measurement.
        </p>

        <h3>Why this matters even though pay is constant</h3>
        <p>
          If your salary is fixed, the monthly variance does not change what lands in your account.
          It changes what an <em>hour</em> was worth — and that is the number you use to decide
          whether to take on extra work, whether a commute is worth it, or whether a side project
          pays better than your job.
        </p>
        <p>
          It also explains a feeling most monthly-paid people recognise: February feels expensive
          because it pays the same for fewer hours, and the month with 23 working days feels like it
          costs more per hour than it should.
        </p>
      </section>

      <section>
        <h2>The conversion, done once</h2>
        <p>
          The reliable route is to leave the month behind entirely:
        </p>
        <p className="formula">
          hourly rate = (monthly salary × 12) ÷ (paid hours per day × paid days per week × 52)
        </p>
        <p>
          Two steps, no monthly averaging. If you want a number for a specific month instead of the
          year, divide the monthly salary by that month&apos;s actual paid hours — the table above is
          exactly that calculation.
        </p>

        <h3>If you are paid monthly but work weekly</h3>
        <p>
          Many salaried roles are paid monthly but scheduled weekly, which is where the two clocks
          separate. In that case the weekly figure is the one to reason about: your paid week is
          stable, your payday is not. The{" "}
          <Link href="/learn/how-pay-periods-work">pay period guide</Link> covers how the cycle and
          the payday relate.
        </p>
      </section>

      <section>
        <h2>What this changes downstream</h2>
        <p>
          Once you have an honest hourly rate, the two most common follow-on questions are about
          which hours were paid and when the money lands. Those are the other two topics on this
          site: <Link href="/learn/paid-time">what counts as paid time</Link> and{" "}
          <Link href="/learn/pay-schedule">when the money arrives</Link>.
        </p>
        <p>
          For the annual version of this same conversion — including the arithmetic behind 2,080 and
          who it actually fits — read{" "}
          <Link href="/learn/hourly-rate-from-annual-salary">
            hourly rate from annual salary
          </Link>{" "}
          and <Link href="/learn/2080-hours-in-a-year">2,080 hours in a year</Link>. To put your own
          monthly figure in and get the rate for your real schedule, use the{" "}
          <Link href="/hourly-rate-calculator">hourly rate calculator</Link>, or start from the{" "}
          <Link href="/learn/hourly-rate">full topic on what an hour is worth</Link>.
        </p>
      </section>
    </LearnPage>
  );
}
