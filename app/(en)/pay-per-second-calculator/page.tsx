import type { Metadata } from "next";
import { Link } from "@/components/SmartLink";
import { ToolPage } from "@/components/ToolPage";
import { ExampleValues, ToolExample } from "@/components/ToolExample";
import { PayPerSecond } from "@/components/PayPerSecond";
import type { FaqItem } from "@/lib/home-faq";
import { toolSchemas } from "@/lib/tool-schema";
import { OG_DEFAULTS, getTool } from "@/lib/site";

const tool = getTool("/pay-per-second-calculator");

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
    q: "How much do I make per second?",
    a: "The pay per second calculator divides your hourly rate by 3,600. At $25 an hour that is $0.0069 a second, at $40 an hour it is $0.0111, and at $60 an hour it is $0.0167. Multiply the unrounded result by 60 to find pay per minute.",
  },
  {
    q: "How do I work out pay per minute?",
    a: "Divide your hourly rate by 60. The pay per second calculator shows $0.42 per minute at $25 an hour, $0.50 at $30, and $0.30 at $18. Using the unrounded rate, 25 minutes of paid time at $25 an hour comes to $10.42.",
  },
  {
    q: "What is $60,000 a year per second?",
    a: "Enter $60,000 and 40 paid hours per week in the pay per second calculator. It assumes 52 weeks, or 7,488,000 paid seconds, and displays $0.0080 per second. If you need 50 paid weeks, divide by 7,200,000 seconds separately to get about $0.0083.",
  },
  {
    q: "Is this my actual pay per second?",
    a: "The pay per second calculator estimates gross earnings at the rate you enter. Enter paid hours without unpaid breaks. Taxes, pension contributions, and any overtime, tips or bonuses you have not included in the pay input can change the amount you receive.",
  },
  {
    q: "Does the pay per second calculator count every second of the day?",
    a: "It counts paid seconds only. A day holds 86,400 seconds, and an eight-hour working day is 28,800 of them — exactly a third of the clock. A 30-minute unpaid lunch removes another 1,800. That is why a per-second figure is always higher than the same salary divided across the whole day.",
  },
];

export default function PayPerSecondCalculatorPage() {
  return (
    <ToolPage
      tool={tool}
      hero={<PayPerSecond />}
      h1={
        <>
          Pay per second calculator:
          <br />
          what you make <span className="hl">in a second.</span>
        </>
      }
      lede="Enter your hourly wage or annual salary to see estimated gross pay per paid second, minute, hour, and workday."
      faq={faq}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(toolSchemas(tool, faq)) }}
      />

      <section>
        <h2>How the pay per second calculator works</h2>
        <p>
          An hourly rate is a quote. A per-second rate is what that quote actually buys, and it is
          the only unit that lets you price a 40-second walk to the kitchen against a two-hour
          meeting without flattering either of them.
        </p>
        <p className="formula">pay per second = hourly rate ÷ 3,600</p>
        <p>
          At $25 an hour a paid second is worth about 0.69 cents. To use the pay per second
          calculator for this example, select <b>per hour</b> and enter $25. The tool shows
          dollars with four decimal places because the result is smaller than a cent.
        </p>
        <p>
          The other half of the arithmetic is the clock. A day holds 86,400 seconds. An eight-hour
          working day holds 28,800 — exactly one third. Even a full working day is two thirds unpaid
          by definition, before anyone mentions lunch.
        </p>
      </section>

      <section>
        <h2>What common wages come to</h2>
        <p>
          These examples use the pay per second calculator at five eight-hour workdays a week.
          Divide the hourly rate by 3,600 for seconds, by 60 for minutes, or multiply by eight
          for one paid workday.
        </p>

        <div className="table-wrap fit">
          <table>
            <thead>
              <tr>
                <th>Hourly</th>
                <th>Per second</th>
                <th>Per minute</th>
                <th>Per workday</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>$12</td>
                <td>$0.0033</td>
                <td>$0.20</td>
                <td>$96.00</td>
              </tr>
              <tr>
                <td>$15</td>
                <td>$0.0042</td>
                <td>$0.25</td>
                <td>$120.00</td>
              </tr>
              <tr>
                <td>$20</td>
                <td>$0.0056</td>
                <td>$0.33</td>
                <td>$160.00</td>
              </tr>
              <tr>
                <td>$25</td>
                <td>$0.0069</td>
                <td>$0.42</td>
                <td>$200.00</td>
              </tr>
              <tr>
                <td>$30</td>
                <td>$0.0083</td>
                <td>$0.50</td>
                <td>$240.00</td>
              </tr>
              <tr>
                <td>$40</td>
                <td>$0.0111</td>
                <td>$0.67</td>
                <td>$320.00</td>
              </tr>
              <tr>
                <td>$60</td>
                <td>$0.0167</td>
                <td>$1.00</td>
                <td>$480.00</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p>
          The second column only becomes readable once you multiply by 60. $0.0069 is $0.42 a
          minute; $0.0167 is a dollar a minute. That is the whole reason per-minute pay is a better
          mental unit than per-second pay — it is small enough to be honest and large enough to be
          legible.
        </p>
        <p>
          Compare the workday amount from the pay per second calculator with your paid shift hours.
          A 9:00–17:30 shift with a half-hour unpaid lunch is eight paid hours, or $200 gross
          at $25 an hour.
        </p>
      </section>

      <section>
        <h2>Paid seconds vs. calendar seconds in a year</h2>
        <p>
          The pay per second calculator divides annual pay by the seconds you are paid for. At 40 paid hours
          per week and 52 paid weeks, that is 2,080 hours × 3,600 seconds, or 7,488,000 paid seconds.
        </p>
        <p className="formula">pay per paid second = annual salary ÷ (annual paid hours × 3,600)</p>

        <ToolExample title="Two ways to divide a $60,000 annual salary">
          <ExampleValues items={[
            { label: "Per paid second", value: "$0.008013", detail: "Based on 7,488,000 paid seconds" },
            { label: "Per calendar second", value: "$0.001903", detail: "Based on all 31,536,000 seconds in a 365-day year" },
          ]} />
          <p>The pay per second calculator shows $0.0080 per paid second. The calendar average also includes nights, weekends and time off.</p>
        </ToolExample>

        <div className="table-wrap fit">
          <table>
            <thead>
              <tr>
                <th>Annual</th>
                <th>Hourly</th>
                <th>Per second</th>
                <th>Per minute</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>$40,000</td>
                <td>$19.23</td>
                <td>$0.0053</td>
                <td>$0.32</td>
              </tr>
              <tr>
                <td>$50,000</td>
                <td>$24.04</td>
                <td>$0.0067</td>
                <td>$0.40</td>
              </tr>
              <tr>
                <td>$60,000</td>
                <td>$28.85</td>
                <td>$0.0080</td>
                <td>$0.48</td>
              </tr>
              <tr>
                <td>$75,000</td>
                <td>$36.06</td>
                <td>$0.0100</td>
                <td>$0.60</td>
              </tr>
              <tr>
                <td>$100,000</td>
                <td>$48.08</td>
                <td>$0.0134</td>
                <td>$0.80</td>
              </tr>
              <tr>
                <td>$150,000</td>
                <td>$72.12</td>
                <td>$0.0200</td>
                <td>$1.20</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p>
          The 7,488,000 assumes 40 hours a week over 52 paid weeks. That is the same 2,080-hour year
          every salary-to-hourly calculator uses, and it is only right if nothing in your contract
          disagrees. An unpaid lunch or a four-day week changes the divisor, and with it every
          figure in the second column.
        </p>
      </section>

      <section>
        <h2>What a dollar costs in seconds</h2>
        <p>
          The pay per second calculator also shows how many seconds of paid work earn one
          dollar. Divide 3,600 by your hourly wage to find that number, then multiply by a price
          to estimate how many seconds of work it represents.
        </p>

        <div className="table-wrap fit">
          <table>
            <thead>
              <tr>
                <th>Hourly</th>
                <th>Seconds per $1</th>
                <th>Minutes per $1</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>$12</td>
                <td>300</td>
                <td>5.0</td>
              </tr>
              <tr>
                <td>$15</td>
                <td>240</td>
                <td>4.0</td>
              </tr>
              <tr>
                <td>$20</td>
                <td>180</td>
                <td>3.0</td>
              </tr>
              <tr>
                <td>$25</td>
                <td>144</td>
                <td>2.4</td>
              </tr>
              <tr>
                <td>$30</td>
                <td>120</td>
                <td>2.0</td>
              </tr>
              <tr>
                <td>$40</td>
                <td>90</td>
                <td>1.5</td>
              </tr>
              <tr>
                <td>$60</td>
                <td>60</td>
                <td>1.0</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p>
          At $25 an hour, a $1 purchase is 144 seconds — two minutes and change. A $120 concert
          ticket is 17,280 seconds, or 4.8 working hours. A $1,800 holiday is 259,200 seconds: three
          full working weeks, handed over in advance.
        </p>
        <p>
          The prices in this table are compared with gross earnings. Use the pay per second
          calculator with your known take-home hourly rate if you want the comparison after deductions.
        </p>
      </section>

      <section>
        <h2>What the pay per second calculator includes</h2>
        <ul className="checks">
          <li>
            <b>Use paid hours.</b> Eight paid hours are 28,800 seconds. For an eight-hour shift
            with a 30-minute unpaid break, enter 7.5 paid hours.
          </li>
          <li>
            <b>Amounts are gross.</b> The result is before taxes and payroll deductions.
          </li>
          <li>
            <b>Use the applicable hourly rate.</b> To estimate overtime pay per second, enter
            the overtime hourly rate separately. For example, time and a half on $20/hr is $30/hr.
          </li>
          <li>
            <b>An average hides a bad month.</b> A per-second figure spreads a year evenly. A
            seasonal job, a contract gap or unpaid leave all show up as months that were worse than
            the average says.
          </li>
          <li>
            <b>Small numbers hide large differences.</b> $0.0069 and $0.0083 look almost identical
            and are 20% apart. Judge the percentage, never the second.
          </li>
        </ul>
      </section>

      <section>
        <h2>Where to go next</h2>
        <p>
          If what you actually want is to watch the number move rather than read it, the{" "}
          <Link href="/">live salary timer</Link> counts up from the same hourly rate and the same
          hours, so the second it shows and the second on this page can never disagree.
        </p>
        <p>
          If you are comparing job offers rather than pricing a coffee, start from the rate instead:
          the{" "}
          <Link href="/hourly-rate-calculator">salary to hourly calculator</Link> turns annual,
          monthly or weekly pay into the rate behind it, using the hours you really work.
        </p>
      </section>
    </ToolPage>
  );
}
