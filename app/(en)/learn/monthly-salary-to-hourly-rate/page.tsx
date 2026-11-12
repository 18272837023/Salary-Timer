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
    a: "Because 40 paid hours per week times 52 weeks divided by 12 is about 173.33 hours per average month. It is a valid annualized convention for a 40-hour week, not a claim that each calendar month has that many working hours.",
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
      lede="For an annualized equivalent, multiply monthly gross salary by 12 and divide by weekly paid hours times 52. For a specific month, divide that month’s pay by hours measured for that month."
      faq={faq}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(learnSchemas(article, faq)) }}
      />

      <section>
        <h2>When the 173.33-hour monthly average fits</h2>
        <p>
          173.33 is approximately 2,080 ÷ 12. With a 40-hour paid week and 52-week
          annualization, it is a useful monthly average. It does not assume that all
          calendar months have the same number of working days.
        </p>
        <p>
          The examples below use 19–23 paid working days. Actual days depend on the
          calendar, schedule and leave. Dividing a month’s pay by that month’s hours
          answers a different question from the annualized conversion used by the timer.
        </p>
      </section>

      <section>
        <h2>One monthly salary, different monthly hours</h2>
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
                <th>Pay divided by that month’s hours</th>
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
          The 19-day figure is about 21% higher than the 23-day figure for identical pay.
          The annualized $28.85 is a valid average for the stated schedule; the other
          rows measure individual months. Neither is automatically a statutory overtime rate.
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
          For a consistent annualized comparison, use:
        </p>
        <p className="formula">
          hourly rate = (monthly salary × 12) ÷ (paid hours per day × paid days per week × 52)
        </p>
        <p>
          This is the annualized method used by Salary Timer. If you want a number for a specific month instead of the
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
