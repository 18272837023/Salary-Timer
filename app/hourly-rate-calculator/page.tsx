import type { Metadata } from "next";
import { Link } from "@/components/SmartLink";
import { ToolPage } from "@/components/ToolPage";
import type { FaqItem } from "@/components/sections";
import { toolSchemas } from "@/lib/schema";
import { getTool } from "@/lib/site";

const tool = getTool("/hourly-rate-calculator");

export const metadata: Metadata = {
  title: tool.title,
  description: tool.description,
  alternates: { canonical: tool.href },
  openGraph: { title: tool.title, description: tool.description, url: tool.href },
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
      h1={
        <>
          Hourly Rate Calculator:
          <br />
          what your salary <span className="hl">really pays</span> per hour.
        </>
      }
      lede="Divide your salary by 2,080 and you get a number that describes almost nobody. This calculator uses the hours you actually work — real shift length, real unpaid breaks, real working days — so the rate you see is the rate you live."
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
        <p>
          The honest formula is short:
        </p>
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
          Set your real numbers in the timer above and it will keep that rate visible all day. For
          the written walkthrough, see{" "}
          <Link href="/learn/hourly-rate-from-annual-salary">
            hourly rate from annual salary
          </Link>
          . Want the per-second version? Open{" "}
          <Link href="/salary-per-second">salary per second</Link>. For premium hours, use the{" "}
          <Link href="/overtime-pay-calculator">overtime pay calculator</Link>. Or go back to the{" "}
          <Link href="/">salary timer homepage</Link>.
        </p>
      </section>
    </ToolPage>
  );
}
