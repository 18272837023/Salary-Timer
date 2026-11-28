import type { Metadata } from "next";
import { Link } from "@/components/SmartLink";
import { ToolPage } from "@/components/ToolPage";
import { ExampleBars, ToolExample } from "@/components/ToolExample";
import { HourlyToSalary } from "@/components/HourlyToSalary";
import type { FaqItem } from "@/lib/home-faq";
import { toolSchemas } from "@/lib/tool-schema";
import { OG_DEFAULTS, getTool } from "@/lib/site";

const tool = getTool("/hourly-to-annual-salary");

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
    q: "How do I convert an hourly wage to a yearly salary?",
    a: "The hourly to annual salary calculator multiplies hourly pay by paid hours per week and paid weeks per year. At $25 an hour, 40 hours and 52 paid weeks give $52,000. With 50 paid weeks it is $50,000.",
  },
  {
    q: "What is $20 an hour in a year?",
    a: "Enter $20 and 40 paid hours in the hourly to annual salary calculator. At 52 weeks the results are $41,600 a year, $3,466.67 a month on average, and $800 a week. At 50 weeks the annual result is $40,000.",
  },
  {
    q: "What is $25 an hour annually?",
    a: "At 40 hours a week and 52 paid weeks, $25 an hour is $52,000 a year. That averages $4,333.33 per month and comes to $1,000 per week or $2,000 per two paid weeks.",
  },
  {
    q: "Should I select 50 or 52 weeks in the hourly to annual salary calculator?",
    a: "52 if you are paid for holiday and take no unpaid leave. 50 if two weeks a year go unpaid, which is common for contractors, seasonal work and anyone on a zero-hours arrangement. The difference is 3.8% of the annual figure, and it is the same 3.8% whether you earn $12 an hour or $40.",
  },
  {
    q: "Does this include overtime or tax?",
    a: "The hourly to annual salary calculator treats every entered hour as base-rate pay and reports gross amounts before tax. If you've already entered overtime hours at the base rate, add only the overtime premium separately. Keep tips, commission and bonuses separate when comparing base wages.",
  },
];

export default function HourlyToAnnualSalaryPage() {
  return (
    <ToolPage
      tool={tool}
      hero={<HourlyToSalary />}
      h1={
        <>
          Hourly to annual salary calculator:
          <br />
          what an hour <span className="hl">adds up to</span> in a year.
        </>
      }
      lede="Type an hourly wage and get the yearly figure back, plus the month, week and biweekly pay that go with it. Switch between 52 and 50 paid weeks and see what two unpaid weeks actually cost."
      faq={faq}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(toolSchemas(tool, faq)) }}
      />

      <section>
        <h2>How to convert hourly pay to annual salary</h2>
        <p>
          The hourly to annual salary calculator uses three inputs: your hourly wage, your paid
          hours in a typical week, and the number of weeks you expect to be paid.
        </p>
        <p className="formula">annual salary = hourly wage × paid hours per week × paid weeks per year</p>
        <p>
          Start with your contract or a representative payslip. For the hourly to annual salary
          calculator, unpaid leave can change the weeks input while a regular unpaid lunch
          reduces the paid hours input.
        </p>
        <p>
          The calculator shows biweekly pay for two weeks at the hours you entered. To estimate
          one paycheck from an annual salary or from the hours in a specific two-week period,
          use the <Link href="/biweekly-pay-calculator">biweekly pay calculator</Link>.
        </p>
      </section>

      <section>
        <h2>Annual pay for common hourly wages</h2>
        <p>
          This table reproduces the hourly to annual salary calculator at 40 paid hours per week
          and 52 weeks. Use your stated hours if a job advert quotes a different schedule.
        </p>

        <div className="table-wrap fit">
          <table>
            <thead>
              <tr>
                <th>Hourly</th>
                <th>Per year</th>
                <th>Per month</th>
                <th>Per week</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>$12</td>
                <td>24,960</td>
                <td>2,080</td>
                <td>480</td>
              </tr>
              <tr>
                <td>$15</td>
                <td>31,200</td>
                <td>2,600</td>
                <td>600</td>
              </tr>
              <tr>
                <td>$20</td>
                <td>41,600</td>
                <td>3,466.67</td>
                <td>800</td>
              </tr>
              <tr>
                <td>$25</td>
                <td>52,000</td>
                <td>4,333.33</td>
                <td>1,000</td>
              </tr>
              <tr>
                <td>$30</td>
                <td>62,400</td>
                <td>5,200</td>
                <td>1,200</td>
              </tr>
              <tr>
                <td>$40</td>
                <td>83,200</td>
                <td>6,933.33</td>
                <td>1,600</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p>
          Compare the weekly column with a typical gross paycheck. If the paycheck differs from
          the hourly to annual salary calculator, check for extra hours, unpaid time or variable pay
          before relying on the annual projection.
        </p>
      </section>

      <section>
        <h2>Annual pay with 50 vs. 52 paid weeks</h2>
        <p>
          Enter $25 per hour and 40 paid hours per week in the hourly to annual salary calculator.
          Switch from 52 to 50 weeks. Weekly pay stays at $1,000 while annual pay drops by $2,000.
        </p>

        <ToolExample title="Annual gross pay at $25 an hour and 40 hours a week">
          <ExampleBars items={[
            { label: "52 paid weeks", value: 52000, amount: "$52,000" },
            { label: "50 paid weeks", value: 50000, amount: "$50,000" },
          ]} />
          <p>Two unpaid weeks reduce annual gross pay by 3.8% in this example.</p>
        </ToolExample>

        <div className="table-wrap fit">
          <table>
            <thead>
              <tr>
                <th>Hourly</th>
                <th>52 paid weeks</th>
                <th>50 paid weeks</th>
                <th>Difference</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>$20</td>
                <td>41,600</td>
                <td>40,000</td>
                <td>1,600</td>
              </tr>
              <tr>
                <td>$25</td>
                <td>52,000</td>
                <td>50,000</td>
                <td>2,000</td>
              </tr>
              <tr>
                <td>$30</td>
                <td>62,400</td>
                <td>60,000</td>
                <td>2,400</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p>
          The 3.8% difference assumes the same wage and hours each paid week. Compare the annual
          amount from the hourly to annual salary calculator with any salaried offer that includes
          paid leave.
        </p>
      </section>

      <section>
        <h2>How to estimate monthly pay from an hourly wage</h2>
        <p>
          The most common arithmetic mistake in this conversion is not the annual figure, it is the
          monthly one. People take the weekly pay and multiply by four. At $25 an hour that gives
          $4,000 a month.
        </p>
        <p>
          The hourly to annual salary calculator divides annual pay by 12 to find a monthly
          average. Here that is $52,000 ÷ 12 = $4,333.33. Multiplying weekly pay by four
          accounts for only 48 weeks across 12 months.
        </p>
        <p>
          Biweekly is the one case where doubling does work, because two weeks really is two weeks.
          $1,000 a week is $2,000 every second Friday, 26 times a year.
        </p>
      </section>

      <section>
        <h2>What the hourly to annual salary calculator leaves out</h2>
        <ul className="checks">
          <li>
            <b>Tax and deductions.</b> Everything here is gross. Income tax, social insurance and
            pension contributions come off afterwards, and they do not scale linearly, so a 10%
            raise is rarely a 10% raise in the bank.
          </li>
          <li>
            <b>Overtime premium.</b> The converter multiplies your base rate. Time-and-a-half on
            five extra hours a week is a separate sum — add it to the weekly figure before you
            annualise, or you will understate the year by about $3,250 at $25 an hour.
          </li>
          <li>
            <b>Tips, bonuses and commission.</b> Variable pay has no fixed hourly equivalent. If it
            is a meaningful part of your income, annualise it separately and add the two figures
            rather than averaging it into the hourly rate.
          </li>
          <li>
            <b>Unpaid breaks.</b> A shift that runs 9:00–17:30 with a 30-minute unpaid lunch is 8
            paid hours, not 8.5. Put the paid figure in the hours field, or the year will be
            overstated by about 6%.
          </li>
        </ul>
      </section>

      <section>
        <h2>Where to go next</h2>
        <p>
          If you already know your yearly pay and want the rate behind it, the reverse direction is{" "}
          <Link href="/hourly-rate-calculator">converting a salary into an hourly rate</Link> — same
          hours, same paid weeks, divided instead of multiplied. That page is also the better start
          when you are comparing two salaried offers rather than two hourly ones.
        </p>
        <p>
          The hourly to annual salary calculator gives a full-year estimate. To track paid time
          and earnings during your shift, enter your wage and schedule in the{" "}
          <Link href="/">live salary timer</Link>.
        </p>
      </section>
    </ToolPage>
  );
}
