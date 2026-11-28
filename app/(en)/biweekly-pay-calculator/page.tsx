import type { Metadata } from "next";
import { Link } from "@/components/SmartLink";
import { ToolPage } from "@/components/ToolPage";
import { ExampleValues, ToolExample } from "@/components/ToolExample";
import { BiweeklyPay } from "@/components/BiweeklyPay";
import type { FaqItem } from "@/lib/home-faq";
import { toolSchemas } from "@/lib/tool-schema";
import { OG_DEFAULTS, getTool } from "@/lib/site";

const tool = getTool("/biweekly-pay-calculator");

export const metadata: Metadata = {
  title: { absolute: tool.title },
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
    a: "The biweekly pay calculator divides an annual salary by 26. On $52,000 a year that is $2,000 gross per check; on $75,000 it is $2,884.62. The semi-monthly amounts use 24 checks and come to $2,166.67 and $3,125.",
  },
  {
    q: "Is biweekly the same as twice a month?",
    a: "Biweekly means every 14 days, usually 26 paychecks a year. Twice monthly means 24 paychecks a year. The biweekly pay calculator compares those two schedules for the same salary.",
  },
  {
    q: "How do I work out biweekly pay from an hourly wage?",
    a: "Select per hour in the biweekly pay calculator and enter the paid hours for the whole two-week period. For two 40-hour weeks at $25 an hour, enter 80 hours to get $2,000 gross. Leave unpaid breaks out of the total.",
  },
  {
    q: "Does the biweekly pay calculator take out taxes?",
    a: "It shows gross pay before tax and other deductions. Compare it with the gross line of a payslip for the same pay period. The deposit amount can differ because of tax withholding, insurance or retirement contributions.",
  },
  {
    q: "Can I use it as a timesheet?",
    a: "The biweekly pay calculator accepts one total for your paid hours across two weeks. Add daily shifts and subtract unpaid breaks in the time card first, then use that total to estimate one check here.",
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
        <h2>How to calculate one biweekly paycheck</h2>
        <p>
          Use the biweekly pay calculator when you want a gross estimate for one check on an
          every-other-week schedule. If your employer pays twice a month, read the semi-monthly
          amount in the comparison instead.
        </p>
        <p className="formula">biweekly paycheck = annual salary ÷ 26</p>
        <p>
          For hourly pay, the biweekly pay calculator multiplies your wage by total paid hours
          in the period. If you work 36 hours one week and 40 the next, enter 76 hours.
        </p>
        <p>
          If what you want is the running total while you are actually working rather than a
          projection, that is a different instrument: the{" "}
          <Link href="/">live salary timer</Link> counts through the workday from your saved schedule
          and shows today&rsquo;s earnings next to the payday line.
        </p>
      </section>

      <section>
        <h2>Biweekly vs. semi-monthly pay on the same salary</h2>
        <p>
          Enter $52,000 as annual salary in the biweekly pay calculator. The example shows what
          one check looks like in a 26-paycheck year alongside the 24-paycheck schedule.
        </p>

        <ToolExample title="Gross pay per check on a $52,000 annual salary">
          <ExampleValues items={[
            { label: "Biweekly", value: "$2,000.00", detail: "Every two weeks · 26 checks in this estimate" },
            { label: "Semi-monthly", value: "$2,166.67", detail: "Twice a month · 24 checks a year" },
          ]} />
          <p>Each semi-monthly check is about $166.67 larger in this example. Annual pay stays the same.</p>
        </ToolExample>

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
          With 26 and 24 checks, each semi-monthly check is about 8.3% larger on the same salary.
          The biweekly pay calculator uses 26. If your calendar has 27 paydays, check how your
          employer handles base pay for that year.
        </p>
      </section>

      <section>
        <h2>The two extra paychecks</h2>
        <p>
          In a 26-paycheck year, two months have three checks. The biweekly pay calculator
          still reports the amount per check. For a monthly budget, multiply that amount by
          the number of scheduled deposits in the month you are planning for.
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
        <h2>What the biweekly pay calculator leaves out</h2>
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
          Use the biweekly pay calculator result for the base earnings portion of one check.
          If your payslip includes a bonus or an overtime line, compare base pay separately
          so you are looking at the same amounts.
        </p>
      </section>
    </ToolPage>
  );
}
