import type { Metadata } from "next";
import { Link } from "@/components/SmartLink";
import { ToolPage } from "@/components/ToolPage";
import { PayPerSecond } from "@/components/PayPerSecond";
import type { FaqItem } from "@/lib/home-faq";
import { toolSchemas } from "@/lib/tool-schema";
import { OG_DEFAULTS, getTool } from "@/lib/site";

const tool = getTool("/pay-per-second-calculator");

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
    q: "How much do I make per second?",
    a: "Divide your hourly rate by 3,600. At $25 an hour that is $0.0069 a second, at $40 an hour $0.0111, and at $60 an hour $0.0167. The figure looks tiny because a second is tiny — multiply it by 60 and you are back at a number you recognise.",
  },
  {
    q: "How do I work out pay per minute?",
    a: "Hourly rate divided by 60. $25 an hour is $0.42 a minute, $30 is $0.50 and $18 is $0.30. From there a 25-minute meeting costs $10.42 at $25 an hour, which is usually the moment the per-minute figure stops being trivia.",
  },
  {
    q: "What is $60,000 a year per second?",
    a: "About $0.008 a second at 40 hours a week and 52 paid weeks. The shortcut is annual pay divided by 7,488,000, because a standard year is 2,080 paid hours and every hour holds 3,600 seconds. Over 50 paid weeks the same salary works out at $0.0083.",
  },
  {
    q: "Is this my actual pay per second?",
    a: "No. It is an average rate, gross of tax, across the seconds you are paid for. Income tax, pension contributions and any unpaid break come off it, while overtime premium, tips and bonuses are not in it. Treat it as the price of your time, not as money arriving.",
  },
  {
    q: "Does the per-second rate count every second of the day?",
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
      lede="Type your pay and your hours and the second comes back — then the minute, the hour and the workday. It is arithmetic, not a ticker: nothing moves until you change a number."
      faq={faq}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(toolSchemas(tool, faq)) }}
      />

      <section>
        <h2>A second is the honest unit, and the useless one</h2>
        <p>
          An hourly rate is a quote. A per-second rate is what that quote actually buys, and it is
          the only unit that lets you price a 40-second walk to the kitchen against a two-hour
          meeting without flattering either of them.
        </p>
        <p className="formula">pay per second = hourly rate ÷ 3,600</p>
        <p>
          At $25 an hour a second is worth 0.69 cents. Nobody prices anything in cents, which is why
          the number reads as trivia at first — until you use it to convert a price tag into time.
          The <Link href="/pay-per-second-calculator">pay per second calculator</Link> above is that
          division with your own numbers in it; the rest of this page is what the answer means.
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
          Every row is the hourly rate ÷ 3,600 for the second, ÷ 60 for the minute, and × 8 for an
          eight-hour workday.
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
          The workday column is the one to hold against a timesheet. $200 a day at $25 an hour is
          eight paid hours; if your shift is 9:00–17:30 with a half-hour unpaid lunch, it is exactly
          that, and if you stay an hour late unpaid it is still $200.
        </p>
      </section>

      <section>
        <h2>Annual salary per second</h2>
        <p>
          For a salary rather than an hourly rate there is one shortcut worth memorising: divide the
          annual figure by <b>7,488,000</b>. That number is 2,080 paid hours × 3,600 seconds, so it
          is the count of paid seconds in a standard year.
        </p>
        <p className="formula">pay per second = annual salary ÷ 7,488,000</p>

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
          The genuinely useful version of this number is its reciprocal: divide 3,600 by your hourly
          rate and every price becomes a duration. That is the figure the calculator shows under the
          result, and it is the one worth remembering.
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
          This is where the unit earns its keep. A price in dollars is a number you compare with
          other prices; a price in seconds is a number you compare with your evening.
        </p>
      </section>

      <section>
        <h2>Where the per-second number lies</h2>
        <ul className="checks">
          <li>
            <b>It counts paid seconds, not clock seconds.</b> 28,800 of the day&rsquo;s 86,400. A
            half-hour unpaid lunch removes 1,800 more, and the rate does not go up to compensate.
          </li>
          <li>
            <b>It is gross.</b> Income tax, social insurance and pension contributions come off
            afterwards. At a 20% effective rate the second is worth 20% less than the figure on
            screen.
          </li>
          <li>
            <b>Overtime is not linear.</b> Time-and-a-half does not raise your per-second rate; it
            adds extra paid seconds after the shift ends. The two effects are not interchangeable.
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
