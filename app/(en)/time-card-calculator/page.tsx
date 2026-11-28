import type { Metadata } from "next";
import { Link } from "@/components/SmartLink";
import { ToolPage } from "@/components/ToolPage";
import { ToolExample } from "@/components/ToolExample";
import { TimeCard } from "@/components/TimeCard";
import type { FaqItem } from "@/lib/home-faq";
import { toolSchemas } from "@/lib/tool-schema";
import { OG_DEFAULTS, getTool } from "@/lib/site";

const tool = getTool("/time-card-calculator");

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
    q: "How do I calculate the hours on a time card?",
    a: "Subtract clock-in from clock-out, then subtract the unpaid break. 9:00 to 17:30 is 8.5 hours on the clock. With a 30-minute unpaid lunch it is 8 paid hours, and five of those days add up to 40.",
  },
  {
    q: "Does this time card calculator subtract lunch?",
    a: "Only the break you type in. Leave it at 0 for a paid lunch and the whole span counts; enter 30 for an unpaid half hour and it comes off that day before anything is added up.",
  },
  {
    q: "How do I enter an overnight shift?",
    a: "Enter both times on the day the shift starts. The time card calculator interprets an earlier clock-out time as the next day: 23:00 to 07:00 is 8 hours before breaks. Identical start and end times count as zero.",
  },
  {
    q: "Which overtime rules does the time card calculator support?",
    a: "You choose one of two rules. Daily over 8 hours treats anything past the eighth hour of a day as overtime; weekly over 40 hours treats anything past the fortieth hour of each seven-day block that way. At $25 an hour with a 1.5 multiplier, overtime pays $37.50 an hour.",
  },
  {
    q: "Can I use it for a two-week pay period?",
    a: "Yes. Switch the time card calculator to 14 days. It displays a row for each day and applies the weekly overtime threshold to each seven-day block separately.",
  },
  {
    q: "Does it calculate take-home pay?",
    a: "The time card calculator shows gross pay based on your hours, rate and selected overtime rule. To compare it with a payslip, use the gross or before-deductions amount for the same period.",
  },
];

export default function TimeCardCalculatorPage() {
  return (
    <ToolPage
      tool={tool}
      hero={<TimeCard />}
      h1={
        <>
          Time card calculator:
          <br />
          a week of shifts, <span className="hl">added up.</span>
        </>
      }
      lede="Clock in and clock out for each day, subtract the unpaid break, and get the week's regular hours, overtime hours and gross pay. Seven or fourteen days, overnight shifts included. Gross only: this page does not estimate tax."
      faq={faq}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(toolSchemas(tool, faq)) }}
      />

      <section>
        <h2>How to enter a week in the time card calculator</h2>
        <p>
          Start with the first day of the workweek you want to total. Use actual clock times for
          each day, including short shifts and shifts that ran late. Leave unworked days blank.
        </p>
        <p>
          Enter your start and end times and any unpaid breaks on each day's row. The time card calculator
          subtracts the breaks and adds the paid hours across the week or two-week period.
        </p>
        <p className="formula">day hours = clock out − clock in − unpaid break</p>
        <p>
          If the running figure is what you wanted instead, that is a different instrument: the{" "}
          <Link href="/">live salary timer</Link> counts through today from your saved schedule and
          tells you what the afternoon is worth so far. This page never ticks, and the{" "}
          <Link href="/salary-stopwatch">salary stopwatch</Link> exists for the case in between — one
          session, priced by hand, started and stopped by you.
        </p>
      </section>

      <section>
        <h2>How to subtract unpaid breaks from a shift</h2>
        <p>
          For 09:00 to 17:30 with a 30-minute unpaid lunch, enter 30 in the time card calculator’s
          break field. Across five identical shifts, that changes the total from 42.5 to 40 paid hours.
        </p>

        <div className="table-wrap fit">
          <table>
            <thead>
              <tr>
                <th>Shift</th>
                <th>On the clock</th>
                <th>Paid, 30 min unpaid</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>One day</td>
                <td>8.50 h</td>
                <td>8.00 h</td>
              </tr>
              <tr>
                <td>Five days</td>
                <td>42.50 h</td>
                <td>40.00 h</td>
              </tr>
              <tr>
                <td>At $25/h</td>
                <td>$1,062.50</td>
                <td>$1,000.00</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p>
          Check how your employer records breaks before filling out the card.
          A paid break belongs inside the clocked span. Only the minutes you are not paid for
          go into the unpaid break field.
        </p>
        <p>
          If there are two unpaid breaks in a shift, add their minutes and enter the total.
          The time card calculator caps the break at the length of the shift to avoid a negative
          duration. Check the number if a row unexpectedly shows zero paid hours.
        </p>
      </section>

      <section>
        <h2>Weekly time card with an overnight shift</h2>
        <p>
          For a shift from 23:00 to 07:00, the time card calculator treats the end as the next day and
          marks the row <b>+1 day</b>. That is 8 hours before breaks, or 7.5 paid hours with
          a 30-minute unpaid break.
        </p>

        <ToolExample title="Completed 7-day time card at $25 an hour">
          <table className="example-card-table" aria-label="Example weekly hours with an overnight shift">
            <thead>
              <tr>
                <th scope="col">Day</th>
                <th scope="col">Shift</th>
                <th scope="col">Unpaid break</th>
                <th scope="col">Paid</th>
              </tr>
            </thead>
            <tbody>
              {["Mon", "Tue", "Wed", "Thu"].map(day => (
                <tr key={day}>
                  <th scope="row">{day}</th><td>09:00–17:30</td><td>30 min</td><td>8 h</td>
                </tr>
              ))}
              <tr>
                <th scope="row">Fri</th><td>23:00–07:00 <small>+1 day</small></td><td>30 min</td><td>7.5 h</td>
              </tr>
              <tr>
                <th scope="row">Sat–Sun</th><td>No shifts</td><td>—</td><td>0 h</td>
              </tr>
            </tbody>
            <tfoot>
              <tr><th scope="row" colSpan={3}>Total paid time</th><td>39.5 h</td></tr>
            </tfoot>
          </table>
          <p>This week totals 39.5 regular hours and 0 overtime hours under either rule, for $987.50 gross.</p>
        </ToolExample>

        <p>
          Enter the overnight shift on the day it started. In this example it belongs on Friday’s row.
        </p>
        <p>
          Identical clock-in and clock-out times mean zero hours in the time card calculator.
          Split a full-day shift into separately recorded time blocks so the duration is explicit.
        </p>
      </section>

      <section>
        <h2>Two overtime rules, two different answers</h2>
        <p>
          The time card calculator offers daily and weekly overtime estimates. Choose the rule
          you want to compare, then enter the multiplier that applies to those hours.
        </p>
        <ul className="checks">
          <li>
            <b>Daily over 8 hours.</b> Anything past the eighth hour of a day is overtime, whatever
            the week totals. This is the rule in several US states and in a great many union
            contracts, and it is the one that punishes a single long day.
          </li>
          <li>
            <b>Weekly over 40 hours.</b> The US federal default for non-exempt employees: the first
            forty hours in a seven-day workweek are straight time and the rest are overtime, no matter
            how they are distributed across the days.
          </li>
        </ul>
        <p>
          Take five eight-hour days plus a six-hour Saturday: 46 hours either way.
        </p>

        <div className="table-wrap fit plain">
          <table>
            <thead>
              <tr>
                <th>Rows</th>
                <th>Hours</th>
                <th>Daily over 8</th>
                <th>Weekly over 40</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Mon–Fri</td>
                <td>40.00</td>
                <td>0.00 OT</td>
                <td>0.00 OT</td>
              </tr>
              <tr>
                <td>Saturday</td>
                <td>6.00</td>
                <td>0.00 OT</td>
                <td>6.00 OT</td>
              </tr>
              <tr>
                <td>Overtime hours</td>
                <td>46.00</td>
                <td>0.00</td>
                <td>6.00</td>
              </tr>
              <tr>
                <td>Gross at $25/h</td>
                <td>—</td>
                <td>$1,150.00</td>
                <td>$1,225.00</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p>
          Switch the overtime rule and the same 46 hours produce a $75 difference.
          Under the weekly rule, six Saturday hours move from regular pay to time and a half.
        </p>
        <p>
          On a 14-day card the time card calculator applies the weekly rule per seven-day block.
          A 46-hour week still has six overtime hours under that setting even if the second week
          has fewer than 40 hours.
        </p>
        <p>
          The time card calculator applies the selected thresholds to the hours you enter.
          Confirm overtime eligibility and the applicable rules with your employer or payroll team.
          To estimate one check from base salary, use the{" "}
          <Link href="/biweekly-pay-calculator">biweekly pay calculator</Link>.
        </p>
      </section>

      <section>
        <h2>What the time card calculator leaves out</h2>
        <ul className="checks">
          <li>
            <b>Estimate your tax.</b> Everything here is gross. Withholding depends on the country and
            state, the filing status, the contributions and the tax year, so a net figure derived from
            hours alone would be the one number on the card you could not check.
          </li>
          <li>
            <b>Round your punches.</b> The card uses the clock times you enter.
            If your employer’s records apply rounding, compare the underlying clock times before
            comparing totals.
          </li>
          <li>
            <b>Track PTO, holidays or shift differentials.</b> Paid leave is not worked time, and a
            night-shift premium is a different rate on the same hours. Both are real, and both would
            need a column this card does not have.
          </li>
          <li>
            <b>Save your card across reloads.</b> Use Print or Export CSV in the time card
            calculator before leaving the page if you need to keep a copy of your shifts.
          </li>
        </ul>
      </section>
    </ToolPage>
  );
}
