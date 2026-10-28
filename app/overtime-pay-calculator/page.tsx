import type { Metadata } from "next";
import { Link } from "@/components/SmartLink";
import { ToolPage } from "@/components/ToolPage";
import type { FaqItem } from "@/components/sections";
import { toolSchemas } from "@/lib/schema";
import { getTool } from "@/lib/site";

const tool = getTool("/overtime-pay-calculator");

export const metadata: Metadata = {
  title: tool.title,
  description: tool.description,
  alternates: { canonical: tool.href },
  openGraph: { title: tool.title, description: tool.description, url: tool.href },
};

const faq: FaqItem[] = [
  {
    q: "How is overtime pay calculated?",
    a: "Overtime pay is your base hourly rate multiplied by the overtime multiplier, multiplied by the extra hours. At a $28.85 base rate and a 1.5× multiplier, an overtime hour is worth $43.27. Forty-eight minutes of overtime is 0.8 hours, so $34.62.",
  },
  {
    q: "What do 1.25×, 1.5× and 2× mean in practice?",
    a: "They are contractual multipliers on your base rate. 1.25× is common for the first tier of overtime or for weekend work in some sectors; 1.5× ('time and a half') is the most common statutory rate; 2× ('double time') usually applies to public holidays or a second consecutive rest day.",
  },
  {
    q: "Should overtime be based on my salary or my hourly rate?",
    a: "Always convert to an hourly rate first, and use your real paid hours to do it — not 2,080 unless that is genuinely your schedule. If your true rate is $27.15 because you work 42.5 paid hours a week, your 1.5× is $40.73, not $43.27. Getting the base wrong understates every overtime hour you work.",
  },
  {
    q: "Does the timer keep counting after I clock out?",
    a: "Only if you turn overtime on. When it is enabled, the counter continues past your shift end at the multiplier you chose and the extra pay is added to today's total and to the month. Turn it off and the clock stops at clock-out, which is the honest behaviour if your overtime is unpaid.",
  },
  {
    q: "Is unpaid overtime worth tracking?",
    a: "Yes, arguably more than paid overtime. Unpaid overtime lowers your effective hourly rate without changing your salary, which is the single most common way people are underpaid without noticing. Track the hours for a month and divide your salary by the real total — see the hourly rate calculator for that calculation.",
  },
];

export default function OvertimePayCalculatorPage() {
  return (
    <ToolPage
      tool={tool}
      h1={
        <>
          Overtime pay calculator:
          <br />
          what that extra hour is <span className="hl">actually worth</span>.
        </>
      }
      lede="Extra hours feel free at the moment you agree to them. They are not. Set your multiplier once and the timer keeps counting after clock-out, so a late evening has a number attached while you are still in it."
      faq={faq}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(toolSchemas(tool, faq)) }}
      />

      <section>
        <h2>The arithmetic, with real numbers</h2>
        <p>
          Overtime is simple multiplication, which is exactly why it is easy to accept without
          checking. Take a $60,000 salary on a 2,080-hour year: base rate $28.85 an hour.
        </p>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Multiplier</th>
                <th>Overtime hourly rate</th>
                <th>One extra hour</th>
                <th>One extra 4-hour evening</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1.25×</td>
                <td>$36.06</td>
                <td>$36.06</td>
                <td>$144.23</td>
              </tr>
              <tr>
                <td>1.5×</td>
                <td>$43.27</td>
                <td>$43.27</td>
                <td>$173.10</td>
              </tr>
              <tr>
                <td>1.75×</td>
                <td>$50.48</td>
                <td>$50.48</td>
                <td>$201.93</td>
              </tr>
              <tr>
                <td>2×</td>
                <td>$57.69</td>
                <td>$57.69</td>
                <td>$230.77</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p>
          One extra evening a week at 1.5× is $173.10 — roughly $9,000 a year if it happens every
          week. That is a meaningful amount of money, and it is also 208 hours of your life, which is
          five full working weeks. Both statements are true at once. The point of seeing the number
          is to be able to hold both.
        </p>
      </section>

      <section>
        <h2>The overtime trap nobody mentions</h2>
        <p>
          Overtime raises your income per week and lowers your rate per hour, at the same time. This
          is not a paradox; it is just what happens when the numerator grows slower than the
          denominator.
        </p>
        <p>
          A worked example. You earn $60,000 for 40 paid hours a week — $28.85 an hour. You start
          doing five extra hours a week at 1.5×. Your pay rises by $43.27 × 5 = $216 a week, about
          $11,250 a year. Your hours rise by 5 a week, from 40 to 45.
        </p>
        <ul className="checks">
          <li>
            <b>New annual pay:</b> $71,250
          </li>
          <li>
            <b>New annual hours:</b> 45 × 52 = 2,340
          </li>
          <li>
            <b>New blended rate:</b> $30.45 an hour
          </li>
        </ul>
        <p>
          You are earning 19% more money for 12.5% more of your life, and your average hour is worth
          $1.60 more than it was. That can be a good deal — but only if you chose it deliberately.
          Most people never run the numbers, so they cannot tell whether the extra hours are buying
          them a holiday or just covering the tax.
        </p>
      </section>

      <section>
        <h2>Unpaid overtime is the expensive kind</h2>
        <p>
          The same arithmetic runs in reverse when overtime is unpaid. Thirty minutes of unpaid
          overtime a day is 2.5 hours a week, 130 hours a year — six and a half working days. On a
          $60,000 salary that is a real hourly rate of $27.15 instead of $28.85: a 6% pay cut you
          agreed to by staying late.
        </p>
        <p>
          This is why the timer has an off switch for overtime. If your extra hours are unpaid, turn
          it off, and the counter will stop at clock-out the way your pay does. If you want to see
          the cost of unpaid overtime explicitly, log it for a month and run the total through{" "}
          <Link href="/hourly-rate-calculator">hourly rate calculator</Link>, or the{" "}
          <Link href="/">live salary timer</Link> on the homepage.
        </p>
      </section>

      <section>
        <h2>Using the multiplier honestly</h2>
        <ul className="checks">
          <li>
            <b>Match your contract, not the law.</b> Use the multiplier you are actually paid. If your
            employer pays 1.25× and the statutory rate is 1.5×, the calculator should show 1.25× —
            the gap is a separate conversation.
          </li>
          <li>
            <b>Check your base rate first.</b> A wrong base rate makes every overtime figure wrong.
            Confirm your paid hours per shift before trusting the multiplier.
          </li>
          <li>
            <b>Watch the countdown switch.</b> During overtime the ring stops advancing and the label
            changes to &ldquo;Overtime for&rdquo;, counting up instead of down. That is deliberate:
            the shift is over, and the clock is now measuring something else.
          </li>
        </ul>
        <p>
          For rotas where overtime happens at 3am rather than 6pm,{" "}
          <Link href="/shift-worker-salary-timer">shift worker salary timer</Link> handles the
          midnight crossover properly.
        </p>
      </section>
    </ToolPage>
  );
}
