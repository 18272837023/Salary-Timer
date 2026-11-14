import type { Metadata } from "next";
import { Link } from "@/components/SmartLink";
import { ToolPage } from "@/components/ToolPage";
import type { FaqItem } from "@/components/sections";
import { toolSchemas } from "@/lib/schema";
import { getTool } from "@/lib/site";

const tool = getTool("/salary-per-second");

export const metadata: Metadata = {
  title: tool.title,
  description: tool.description,
  alternates: { canonical: tool.href },
  openGraph: { title: tool.title, description: tool.description, url: tool.href },
};

const faq: FaqItem[] = [
  {
    q: "How do you calculate salary per second?",
    a: "Take your hourly rate and divide by 3,600. If you know your annual salary, first divide it by your real paid hours per year (paid hours per day × working days × 52) to get the hourly rate, then divide by 3,600. A $60,000 salary on a standard 2,080-hour year works out to $28.85 an hour, which is $0.008 per second.",
  },
  {
    q: "Is per-second pay a real thing?",
    a: "This is a conversion of your gross hourly rate into a per-second estimate. It does not change your employment terms, payment schedule or payroll rounding rules. The live counter adds earnings only during your configured paid working time.",
  },
  {
    q: "Why show four decimal places?",
    a: "Because a per-second rate at a normal salary is a fraction of a cent. Rounded to two decimals it becomes $0.01 for almost everyone, which destroys the point. Four decimals keeps the number honest and keeps the difference between a $40k and an $80k salary visible.",
  },
  {
    q: "Does per-second pay include breaks?",
    a: "Only if the break is paid. In this calculator, unpaid breaks are subtracted from the paid hours before the rate is divided, and the counter freezes while you are on one. A paid coffee break is different: don't add it as a break and the timer keeps running.",
  },
  {
    q: "What is the point of knowing this number?",
    a: "It converts vague time into a concrete price at the exact moment you are deciding whether to spend it. That is the only moment the decision can still change. A monthly total arrives too late to be useful.",
  },
];

export default function SalaryPerSecondPage() {
  return (
    <ToolPage
      tool={tool}
      h1={
        <>
          Salary per second:
          <br />
          calculate your <span className="hl">earnings per second</span>.
        </>
      }
      lede="Enter your hourly, monthly or annual pay and working schedule to calculate gross salary per second, minute and hour. Watch the live counter during your paid working hours."
      faq={faq}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(toolSchemas(tool, faq)) }}
      />

      <section>
        <h2>What a second is worth</h2>
        <p>
          A salary per second is just your hourly rate divided by 3,600. At $60,000 a year on a
          standard 2,080-hour schedule, that is:
        </p>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Unit</th>
                <th>Calculation</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Per year</td>
                <td>—</td>
                <td>$60,000</td>
              </tr>
              <tr>
                <td>Per hour</td>
                <td>60,000 ÷ 2,080</td>
                <td>$28.85</td>
              </tr>
              <tr>
                <td>Per minute</td>
                <td>60,000 ÷ 2,080 ÷ 60</td>
                <td>$0.4808</td>
              </tr>
              <tr>
                <td>Per second</td>
                <td>60,000 ÷ 2,080 ÷ 3,600</td>
                <td>$0.00801282</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p>
          Eight tenths of a cent. It sounds like nothing, and that is precisely the trick: the number
          is small enough to ignore, which is why we ignore the hours it adds up to.
        </p>
      </section>

      <section>
        <h2>Small blocks of time, priced</h2>
        <p>Multiply that per-second figure across the things that actually fill a workday:</p>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Moment</th>
                <th>Duration</th>
                <th>What it costs</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>One blink</td>
                <td>0.3 s</td>
                <td>$0.002</td>
              </tr>
              <tr>
                <td>One breath</td>
                <td>4 s</td>
                <td>$0.032</td>
              </tr>
              <tr>
                <td>&ldquo;Quick sync&rdquo;</td>
                <td>15 min</td>
                <td>$7.21</td>
              </tr>
              <tr>
                <td>&ldquo;Can we grab 30 minutes?&rdquo;</td>
                <td>30 min</td>
                <td>$14.42</td>
              </tr>
              <tr>
                <td>The meeting that could have been an email</td>
                <td>1 h</td>
                <td>$28.85</td>
              </tr>
              <tr>
                <td>An entire shift</td>
                <td>8 h</td>
                <td>$230.77</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p>
          A 30-minute meeting is $14.42 of your life. If six people attend, it is $86.50 of payroll —
          for a conversation that often ends without a decision. You do not need to become the person
          who refuses all meetings. You only need the number to exist in your head when someone asks
          for &ldquo;just half an hour&rdquo;.
        </p>
      </section>

      <section>
        <h2>How to use the salary per second calculator</h2>
        <ol className="checks">
          <li>Open <b>Set my salary</b> and enter your pay type, amount and currency.</li>
          <li>Set your working days, shift times and unpaid breaks, then save.</li>
          <li>Read the per-second rate and watch estimated earnings accumulate during paid time.</li>
        </ol>
        <p>Monthly pay is multiplied by 12, then divided by scheduled paid hours per week × 52 to find the hourly equivalent. Hourly pay uses your entered rate directly. Divide that rate by 3,600 for salary per second. Examples above retain the unrounded rate until the final display.</p>
        <p>For the assumptions behind the annual-hours divisor, read <Link href="/learn/2080-hours-in-a-year/">when to use 2,080 hours per year</Link>. This is gross pay before taxes and deductions, not a prediction of take-home income.</p>
      </section>

      <section>
        <h2>Doing it properly</h2>
        <p>
          The calculation only holds if the hours are right. Two corrections matter more than the
          rest:
        </p>
        <ul className="checks">
          <li>
            <b>Use your real paid hours.</b> Not 2,080 unless you genuinely work 40 paid hours every
            week. An unpaid lunch or a 4-day week changes the per-second rate substantially — see{" "}
            <Link href="/hourly-rate-calculator">the hourly rate calculator</Link> for the worked
            examples.
          </li>
          <li>
            <b>Exclude unpaid breaks from the count.</b> If lunch is unpaid, the clock must stop for
            it. Otherwise you are inflating a number you are using to make decisions.
          </li>
        </ul>
        <p>
          Set your salary in the timer above and it will show the per-second rate alongside a live
          counter. For night shifts and rotas,{" "}
          <Link href="/shift-worker-salary-timer">shift worker salary timer</Link> handles the
          midnight crossover. Or start from the{" "}
          <Link href="/">live salary timer</Link> on the homepage.
        </p>
      </section>
    </ToolPage>
  );
}
