import type { Metadata } from "next";
import { Link } from "@/components/SmartLink";
import { ToolPage } from "@/components/ToolPage";
import { ExampleBars, ToolExample } from "@/components/ToolExample";
import { SalaryConverter } from "@/components/SalaryConverter";
import type { FaqItem } from "@/lib/home-faq";
import { toolSchemas } from "@/lib/tool-schema";
import { OG_DEFAULTS, getTool } from "@/lib/site";

const tool = getTool("/hourly-rate-calculator");

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
    q: "When should I divide my annual salary by 2,080?",
    a: "Use 2,080 when your salary covers 40 paid hours per week for 52 weeks. A 9:00 to 17:30 shift with 30 minutes of unpaid lunch still counts as 8 paid hours. Enter your own weekly hours and paid weeks in the hourly rate calculator if either figure differs.",
  },
  {
    q: "How does the hourly rate calculator handle paid time off?",
    a: "The calculator uses the paid weeks you enter. Include paid time off in the denominator when estimating pay per paid hour. For an estimate per hour actually worked, keep the same gross annual pay and use the hours you actually worked.",
  },
  {
    q: "What is a good hourly rate?",
    a: "A useful comparison is against your own alternatives: your previous job, a similar local role, or a freelance day rate. Run each offer through the hourly rate calculator using the same definition of paid hours.",
  },
  {
    q: "Should I use gross or net pay?",
    a: "Use gross pay for a before-tax estimate. If you already know your take-home pay, enter it to see the equivalent take-home rate. The hourly rate calculator divides the amount you enter by your paid hours and leaves taxes and deductions to payroll.",
  },
  {
    q: "How do I convert hourly back to an annual salary?",
    a: "Reverse the hourly rate calculator formula: multiply hourly pay by paid hours per week and paid weeks per year. At 52 paid weeks, use 2,080 hours for a 40-hour week or 1,950 hours for a 37.5-hour week.",
  },
];

export default function HourlyRateCalculatorPage() {
  return (
    <ToolPage
      tool={tool}
      hero={<SalaryConverter />}
      h1={
        <>
          Hourly rate calculator:
          <br />
          what your salary <span className="hl">really pays</span> per hour.
        </>
      }
      lede="Convert yearly, monthly or weekly gross pay to an hourly rate using your paid hours per week and paid weeks per year."
      faq={faq}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(toolSchemas(tool, faq)) }}
      />

      <section>
        <h2>How the hourly rate calculator converts salary</h2>
        <p>
          A schedule of 40 paid hours per week for 52 paid weeks adds up to 2,080 hours.
          Use your own figures when your schedule differs. For example, 37.5 paid hours over
          52 weeks adds up to 1,950 hours.
        </p>
        <p>
          The hourly rate calculator first converts gross pay to an annual amount. It multiplies
          monthly pay by 12 or weekly pay by the number of paid weeks, then divides by annual paid hours.
        </p>
        <p className="formula">
          hourly rate = annual gross pay ÷ (paid hours per week × paid weeks per year)
        </p>
        <p>
          A 09:00–17:30 shift lasts 8.5 hours. Subtract a 30-minute unpaid lunch to count 8 paid hours.
          Two additional unpaid 15-minute breaks bring that to 7.5 hours. Across five days a week
          for 52 weeks, that extra half hour each day adds up to 130 hours of unpaid breaks,
          equivalent to 16.25 eight-hour shifts.
        </p>
      </section>

      <section>
        <h2>What does a $60,000 salary pay per hour?</h2>
        <p>
          Enter $60,000 as annual pay and 52 paid weeks. Then compare the hourly rate for three
          weekly schedules. Subtract unpaid lunch before entering the weekly hours.
        </p>

        <ToolExample title="Hourly rate calculator example for a $60,000 salary">
          <ExampleBars items={[
            { label: "40 paid hours a week", value: 60000 / (40 * 52), amount: "$28.85/hr" },
            { label: "42.5 paid hours a week", value: 60000 / (42.5 * 52), amount: "$27.15/hr" },
            { label: "32 paid hours a week", value: 60000 / (32 * 52), amount: "$36.06/hr" },
          ]} />
        </ToolExample>

        <p>
          Five 8.5-hour shifts with a 30-minute unpaid lunch each add up to 40 paid hours.
          Five 9-hour shifts with the same lunch add up to 42.5 hours. Four 8-hour paid shifts
          add up to 32 hours. Only the hours field changes in the hourly rate calculator across
          these examples. Keep the annual pay and paid weeks the same.
        </p>
      </section>

      <section>
        <h2>Salary to hourly conversion table</h2>
        <p>
          The table shows hourly rate calculator results for three work schedules.
          Each figure is annual pay ÷ (hours per week × paid weeks).
        </p>

        <div className="table-wrap fit">
          <table>
            <thead>
              <tr>
                <th>Annual salary</th>
                <th>40 h × 52</th>
                <th>37.5 h × 52</th>
                <th>40 h × 48</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>$40,000</td>
                <td>$19.23</td>
                <td>$20.51</td>
                <td>$20.83</td>
              </tr>
              <tr>
                <td>$50,000</td>
                <td>$24.04</td>
                <td>$25.64</td>
                <td>$26.04</td>
              </tr>
              <tr>
                <td>$60,000</td>
                <td>$28.85</td>
                <td>$30.77</td>
                <td>$31.25</td>
              </tr>
              <tr>
                <td>$75,000</td>
                <td>$36.06</td>
                <td>$38.46</td>
                <td>$39.06</td>
              </tr>
              <tr>
                <td>$90,000</td>
                <td>$43.27</td>
                <td>$46.15</td>
                <td>$46.88</td>
              </tr>
              <tr>
                <td>$120,000</td>
                <td>$57.69</td>
                <td>$61.54</td>
                <td>$62.50</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p>
          <b>Monthly</b> is the same sum with one extra step: multiply by 12 first. A $4,000 monthly
          salary is $48,000 a year — $23.08 an hour over 2,080 hours, or $24.62 if your week is 37.5
          hours. In the hourly rate calculator, select <b>per month</b> to enter the $4,000
          directly. For a weekly salary, select <b>per week</b> and enter your typical weekly amount.
        </p>
        <p>
          Going the other way — an hourly wage turned into a year, a month or a week — is the{" "}
          <Link href="/hourly-to-annual-salary">hourly to annual salary conversion</Link>, which
          keeps the 52-or-50 paid-week decision visible instead of folding it into a constant.
        </p>
      </section>

      <section>
        <h2>Which hours should you enter in the hourly rate calculator?</h2>
        <ul className="checks">
          <li>
            <b>Unpaid breaks.</b> Remove unpaid lunch from your working hours before converting
            your salary. A paid break stays in the weekly total.
          </li>
          <li>
            <b>Unpaid overtime.</b> Staying 45 minutes late three times a week adds 117 hours a year
            to your denominator without adding a cent to your numerator.
          </li>
          <li>
            <b>The commute.</b> Keep the commuting time separate from the paid-hours estimate.
            If two jobs have different commutes, compare that time alongside the hourly rate
            calculator results.
          </li>
          <li>
            <b>Working days.</b> Going from five to four days raises your hourly rate by 25% at
            constant salary, because the same money now buys 20% fewer hours.
          </li>
        </ul>
      </section>

      <section>
        <h2>How to use this number</h2>
        <p>
          Use the hourly rate calculator to compare two offers with different weekly schedules.
          The hourly result also puts the cost of a purchase or a block of time in perspective.
        </p>
        <ul className="checks">
          <li>
            A two-hour meeting is not &ldquo;a meeting&rdquo;. At $28.85 it costs $57.70 of payroll,
            and if four people attend, $230.
          </li>
          <li>
            A $120 concert ticket is 4.2 hours. A $1,800 holiday is 62 hours — a week and a half of
            your working life, paid in advance.
          </li>
          <li>
            With the same number of paid weeks, a 20% salary increase and a 15% longer workweek
            raise your hourly rate by about 4.3%. Compare the hourly and annual figures together.
          </li>
        </ul>
        <p>
          Those sums get easier once the rate is broken down further. The{" "}
          <Link href="/pay-per-second-calculator">pay per second calculator</Link> takes the same
          hourly rate and gives you the second, the minute and the workday — which is the form a
          meeting, a commute or a coffee actually gets measured in.
        </p>
        <p>
          To track earnings through your workday, open the <Link href="/">free salary timer</Link>{" "}
          and enter your hourly rate and work schedule in its settings.
        </p>
      </section>
    </ToolPage>
  );
}
