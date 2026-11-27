import type { Metadata } from "next";
import { Link } from "@/components/SmartLink";
import { ToolPage } from "@/components/ToolPage";
import { BiweeklyPay } from "@/components/BiweeklyPay";
import type { FaqItem } from "@/lib/home-faq";
import { toolSchemas } from "@/lib/tool-schema";
import { OG_DEFAULTS, getTool } from "@/lib/site";

const tool = getTool("/biweekly-pay-calculator");

export const metadata: Metadata = {
  title: tool.title,
  description: tool.description,
  alternates: { canonical: tool.href },
  // Spread the defaults first: a page-level openGraph replaces the layout's
  // object wholesale, so setting only title/url here would drop the share image.
  openGraph: {
    ...OG_DEFAULTS,
    title: tool.title,
    description: tool.description,
    url: tool.href,
  },
};

const faq: FaqItem[] = [
  {
    q: "How much is my biweekly paycheck?",
    a: "Divide the annual salary by 26. On $52,000 a year one biweekly paycheck is $2,000 gross; on $75,000 it is $2,884.62. Dividing by 24 instead gives $2,166.67 and $3,125 — those are semi-monthly figures, and they are 8.3% higher because there are two fewer of them.",
  },
  {
    q: "Is biweekly the same as twice a month?",
    a: "No. Biweekly means every 14 days, which is 26 paychecks a year. Twice a month means two fixed dates a month, which is 24. Same salary, different paycheck size, and two months a year where the biweekly schedule pays three times.",
  },
  {
    q: "How do I work out biweekly pay from an hourly wage?",
    a: "Multiply the hourly wage by the paid hours in the two weeks. A full-time fortnight is 80 paid hours, so $25 an hour is $2,000 per paycheck and $52,000 a year across 26 of them. Unpaid lunch belongs outside the 80: a 9:00–17:30 shift with a half-hour break is 8 paid hours a day.",
  },
  {
    q: "Does this calculator take out taxes?",
    a: "No, and it will not pretend to. Payroll tax depends on where you live, what you filed, what you contribute and which tax year it is, so a net figure derived from a salary alone is a guess wearing a decimal point. Everything here is gross. Your employer's payroll system, or a payslip from a previous period, is the only reliable source for net.",
  },
  {
    q: "Can I use it as a timesheet?",
    a: "No. There is one field for the paid hours in the whole two-week period, with no per-day rows and no clock in or out — a two-week time card is a different tool and this page deliberately is not one. If you want to time a single session by hand, that is what the stopwatch on this site does.",
  },
];

export default function BiweeklyPayCalculatorPage() {
  return (
    <ToolPage
      tool={tool}
      hero={<BiweeklyPay />}
      h1={
        <>
          Biweekly pay calculator:
          <br />
          what <span className="hl">one paycheck</span> comes to.
        </>
      }
      lede="Enter an annual salary or an hourly wage and get the gross amount of a single two-week paycheck, plus what the same money looks like paid twice a month. Gross only: this page does not estimate tax."
      faq={faq}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(toolSchemas(tool, faq)) }}
      />

      <section>
        <h2>One paycheck, not a year</h2>
        <p>
          A yearly figure is a budget. A paycheck is a date. The gap between them is one division,
          and the only thing that can go wrong is the divisor — which is exactly what goes wrong,
          because there are two plausible numbers and they are three weeks apart in outcome.
        </p>
        <p className="formula">biweekly paycheck = annual salary ÷ 26</p>
        <p>
          The <Link href="/biweekly-pay-calculator">biweekly pay calculator</Link> above applies that
          division, or the hourly equivalent — wage × paid hours in the fortnight — and shows the
          semi-monthly figure beside it so the two cannot be confused for each other.
        </p>
        <p>
          If what you want is the running total while you are actually working rather than a
          projection, that is a different instrument: the{" "}
          <Link href="/">live salary timer</Link> counts through the workday from your saved schedule
          and shows today&rsquo;s earnings next to the payday line.
        </p>
      </section>

      <section>
        <h2>26, not 24</h2>
        <p>
          A year holds 52 weeks. Paid every two weeks, that is 26 paychecks. Paid twice a month, it is
          24. Both are called &ldquo;twice a month&rdquo; by people who are not thinking about it, and
          they are not the same number.
        </p>

        <div className="table-wrap fit">
          <table>
            <thead>
              <tr>
                <th>Annual</th>
                <th>Biweekly (÷26)</th>
                <th>Semi-monthly (÷24)</th>
                <th>Difference</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>$40,000</td>
                <td>$1,538.46</td>
                <td>$1,666.67</td>
                <td>$128.21</td>
              </tr>
              <tr>
                <td>$52,000</td>
                <td>$2,000.00</td>
                <td>$2,166.67</td>
                <td>$166.67</td>
              </tr>
              <tr>
                <td>$60,000</td>
                <td>$2,307.69</td>
                <td>$2,500.00</td>
                <td>$192.31</td>
              </tr>
              <tr>
                <td>$75,000</td>
                <td>$2,884.62</td>
                <td>$3,125.00</td>
                <td>$240.38</td>
              </tr>
              <tr>
                <td>$100,000</td>
                <td>$3,846.15</td>
                <td>$4,166.67</td>
                <td>$320.51</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p>
          The gap is always 8.3%, because 26 ÷ 24 does not care what you earn. What changes is the
          money: on $100,000 the semi-monthly figure is $320.51 more per check, and someone comparing
          two job offers by paycheck alone would read that as the better job. It is not. The year is
          identical.
        </p>
      </section>

      <section>
        <h2>The two extra paychecks</h2>
        <p>
          26 paychecks spread across 12 months means two months a year get three of them. That is not
          a bonus and it is not overtime — the annual total has not moved. It is simply the residue of
          26 not dividing by 12.
        </p>
        <p>
          The reason it happens is that a biweekly year is 26 × 14 = 364 days, two short of a
          calendar year. Every year the paydays slide roughly two days earlier, and twice a year one
          lands early enough that the next one follows inside the same month. Semi-monthly pay cannot
          do this: two fixed dates a month always produce exactly two.
        </p>
        <p>
          If the useful question is when the next one lands rather than how big it is, the{" "}
          <Link href="/payday-countdown">payday countdown</Link> handles the dates on any cycle and
          lists the next three, which is the part this page does not do.
        </p>
      </section>

      <section>
        <h2>What this page will not do</h2>
        <ul className="checks">
          <li>
            <b>Estimate your tax.</b> Payroll tax is not a percentage you can apply to a salary:
            it depends on the country and state you live in, what you filed, what you contribute to a
            pension or a health plan, and which tax year it is. A net figure invented from a salary
            alone is a guess with a decimal point, and it would be the one number on the card you
            could not check.
          </li>
          <li>
            <b>Act as a two-week time card.</b> There is one hours field for the whole period and no
            per-day rows. Logging shifts is a different job with a different shape — the{" "}
            <Link href="/time-card-calculator">time card calculator</Link> does it with a row per day
            and adds the fortnight up — and building a bad version of it inside a pay calculator helps
            nobody.
          </li>
          <li>
            <b>Guess at overtime, tips or bonuses.</b> The figure is your base rate across paid
            hours. Variable pay is a separate sum, and averaging it into the paycheck hides the fact
            that it is not guaranteed.
          </li>
        </ul>
        <p>
          What it does do is one thing properly: turn a salary or a wage into the gross amount of a
          single two-week paycheck, with the divisor stated so you can argue with it if your payroll
          department uses a different one.
        </p>
      </section>
    </ToolPage>
  );
}
