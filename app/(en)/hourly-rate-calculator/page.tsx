import type { Metadata } from "next";
import { Link } from "@/components/SmartLink";
import { ToolPage } from "@/components/ToolPage";
import { SalaryConverter } from "@/components/SalaryConverter";
import type { FaqItem } from "@/lib/home-faq";
import { toolSchemas } from "@/lib/tool-schema";
import { OG_DEFAULTS, getTool } from "@/lib/site";

const tool = getTool("/hourly-rate-calculator");

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
    q: "Why is salary ÷ 2,080 usually wrong?",
    a: "2,080 is 40 hours × 52 weeks. It only holds if you work exactly eight paid hours a day, five days a week, every week of the year — with no unpaid lunch, no unpaid overtime and no holiday. Almost nobody does. If your lunch is unpaid, a 9-to-5:30 shift is 8 paid hours, not 8.5, and the divisor changes. If you work a 4-day week, it changes a lot.",
  },
  {
    q: "Does this calculator include holiday or paid time off?",
    a: "No, and that is deliberate. Your hourly rate is the price of an hour you actually spend working. Paid holiday is a benefit on top of that number, not part of it. If you add holiday back in, the rate you see goes up but stops describing the hour you are living through.",
  },
  {
    q: "What is a good hourly rate?",
    a: "There is no universal answer, but the useful comparison is against your own alternatives: your previous job, a local equivalent role, or your freelance day rate. What this calculator gives you is a consistent basis for that comparison — the same definition of an hour applied to every offer.",
  },
  {
    q: "Should I use gross or net pay?",
    a: "Use gross. Tax is a percentage applied afterwards, and mixing net figures with gross hours produces a number that describes nothing. If you want a take-home rate, divide the net hourly figure by your effective tax rate separately.",
  },
  {
    q: "How do I convert hourly back to an annual salary?",
    a: "Multiply your hourly rate by your paid hours per week, then by 52. For a 40-hour week that is ×2,080. For a 37.5-hour week (a common European contract) it is ×1,950, which is why the same annual salary looks better in some countries than others.",
  },
];

export default function HourlyRateCalculatorPage() {
  return (
    <ToolPage
      tool={tool}
      hero={<SalaryConverter />}
      h1={
        <>
          Salary to hourly calculator:
          <br />
          what your salary <span className="hl">really pays</span> per hour.
        </>
      }
      lede="Type in a yearly, monthly or weekly figure and get the hourly rate back. It does not divide by 2,080 behind your back — you give it the hours you actually work, so the rate you see is the rate you live."
      faq={faq}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(toolSchemas(tool, faq)) }}
      />

      <section>
        <h2>The 2,080-hour myth</h2>
        <p>
          Every salary-to-hourly calculator you have used starts with the same assumption: 40 hours
          a week, 52 weeks a year, 2,080 hours. It is a tidy number, it is easy to teach, and for
          most people it is wrong by 10–20%.
        </p>
        <p>
          The problem is that it double-counts reality in one direction and ignores it in another.
          An unpaid lunch makes your real working day shorter than your contracted one. A commute,
          a 47-hour week, or a sixth day makes it longer. Neither shows up in 2,080.
        </p>
        <p>The honest formula is short:</p>
        <p className="formula">
          hourly rate = salary ÷ (paid hours per day × working days per week × 52)
        </p>
        <p>
          The only hard part is <em>paid hours per day</em>, because that is where contracts get
          creative. A 09:00–17:30 shift sounds like 8.5 hours. With a 30-minute unpaid lunch it is 8.
          With two unpaid 15-minute breaks it is 7.5. Over a year, half an hour a day is 130 hours —
          six and a half extra working days you are giving away.
        </p>
      </section>

      <section>
        <h2>Three salaries, three very different rates</h2>
        <p>
          Take the same $60,000 and run it through three realistic schedules. None of these are
          contrived; all three are ordinary.
        </p>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Schedule</th>
                <th>Paid hours / week</th>
                <th>Hours / year</th>
                <th>Real hourly rate</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>5 days · 8.5h shift · 30 min unpaid lunch</td>
                <td>40.0</td>
                <td>2,080</td>
                <td>$28.85</td>
              </tr>
              <tr>
                <td>5 days · 9h shift · 30 min unpaid lunch</td>
                <td>42.5</td>
                <td>2,210</td>
                <td>$27.15</td>
              </tr>
              <tr>
                <td>4 days · 8h paid</td>
                <td>32.0</td>
                <td>1,664</td>
                <td>$36.06</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p>
          Same salary, a spread from $27.15 to $36.06 an hour — a 33% difference in what an hour of
          your life costs. The 4-day-week worker earns $7.21 more per hour for identical annual pay.
          That is not a rounding error. That is the entire argument for a four-day week, expressed
          in one column.
        </p>
      </section>

      <section>
        <h2>Salary to hourly, in one table</h2>
        <p>
          The same division across salaries people actually earn, at three common working years.
          Every figure is annual pay ÷ (hours per week × paid weeks).
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
          hours. <b>Weekly</b> skips the month entirely: multiply by the weeks you are actually paid,
          then divide by the hours inside those weeks.
        </p>
        <p>
          Going the other way — an hourly wage turned into a year, a month or a week — is the{" "}
          <Link href="/hourly-to-annual-salary">hourly to annual salary conversion</Link>, which
          keeps the 52-or-50 paid-week decision visible instead of folding it into a constant.
        </p>
      </section>

      <section>
        <h2>What actually moves your rate</h2>
        <ul className="checks">
          <li>
            <b>Unpaid breaks.</b> The single most common error. If lunch is unpaid, it is not part of
            your rate — subtract it before you divide.
          </li>
          <li>
            <b>Unpaid overtime.</b> Staying 45 minutes late three times a week adds 117 hours a year
            to your denominator without adding a cent to your numerator.
          </li>
          <li>
            <b>The commute.</b> Not part of the legal calculation, but it is part of the decision. A
            $62k job with a 90-minute daily commute and a $58k job from your spare room are not
            $4,000 apart; they are roughly 375 hours apart.
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
          The rate is not the point. The point is that once you know it, every decision involving
          time gets a price tag attached:
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
            A job offer with a 20% raise and a 15% longer week is not a raise. Run it through the
            calculator before you accept.
          </li>
        </ul>
        <p>
          Those sums get easier once the rate is broken down further. The{" "}
          <Link href="/pay-per-second-calculator">pay per second calculator</Link> takes the same
          hourly rate and gives you the second, the minute and the workday — which is the form a
          meeting, a commute or a coffee actually gets measured in.
        </p>
        <p>
          Set your real numbers in the converter above and you have the honest figure for this job.
          If you would rather watch the number accrue than calculate it, open the{" "}
          <Link href="/">free salary timer</Link> — it reads the same hours you just entered, so the
          two never disagree.
        </p>
      </section>
    </ToolPage>
  );
}
