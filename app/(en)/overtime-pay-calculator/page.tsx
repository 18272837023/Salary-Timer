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
    a: "For a simple estimate, multiply the applicable regular rate by the chosen multiplier and qualifying extra hours. At a $25 regular rate and 1.5 times, an extra hour is worth $37.50; 48 minutes is 0.8 hours, worth $30. The timer follows your inputs rather than determining legal entitlement.",
  },
  {
    q: "What do 1.25×, 1.5× and 2× mean in practice?",
    a: "They multiply the entered or estimated hourly rate. Under the general US federal FLSA rule, covered, nonexempt workers must receive at least 1.5 times their regular rate for hours worked over 40 in a workweek; 1.25 times would not satisfy that minimum. Other jurisdictions and contracts differ. A 2 times option does not mean holidays automatically qualify.",
  },
  {
    q: "Should overtime be based on my salary or my hourly rate?",
    a: "Use the applicable regular rate for your scenario. Annual salary divided by scheduled annual hours is an estimate, not automatically the statutory overtime regular rate. Under US federal rules, coverage, workweek pay and items such as nondiscretionary bonuses can affect the calculation.",
  },
  {
    q: "Does the timer keep counting after I clock out?",
    a: "Only if you turn overtime on. When it is enabled, the counter continues past your shift end at the multiplier you chose and the extra pay is added to today's total and to the month. Turn it off and the clock stops at clock-out, which is the honest behaviour if your overtime is unpaid.",
  },
  {
    q: "Is unpaid overtime worth tracking?",
    a: "Tracking actual extra work can help compare pay with time spent. Divide pay by recorded hours for the same period to measure an effective hourly rate. This is separate from the timer’s annualized salary conversion and does not decide whether additional pay is legally owed.",
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
          doing five extra hours a week at 1.5×. Your pay rises by about $216.35 a week, or
          $11,250 a year using the unrounded rate. Your hours rise by 5 a week, from 40 to 45.
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
          overtime a day is 2.5 hours a week, 130 hours a year — 16.25 eight-hour working days. On a
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
