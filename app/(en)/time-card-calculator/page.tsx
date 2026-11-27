import type { Metadata } from "next";
import { Link } from "@/components/SmartLink";
import { ToolPage } from "@/components/ToolPage";
import { TimeCard } from "@/components/TimeCard";
import type { FaqItem } from "@/lib/home-faq";
import { toolSchemas } from "@/lib/tool-schema";
import { OG_DEFAULTS, getTool } from "@/lib/site";

const tool = getTool("/time-card-calculator");

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
    q: "How do I calculate the hours on a time card?",
    a: "Subtract the clock-in time from the clock-out time, then subtract the unpaid break. 9:00 to 17:30 is 8.5 hours on the clock; with a 30-minute lunch it is 8 paid hours, and five of those days add up to 40.",
  },
  {
    q: "Does this time card calculator subtract lunch?",
    a: "Only the break you type in. Leave it at 0 for a paid lunch and the whole span counts; enter 30 for an unpaid half hour and it comes off that day before anything is added up.",
  },
  {
    q: "How do I enter an overnight shift?",
    a: "Type the real clock times and let the card wrap. 23:00 to 07:00 is read as 8 hours on the following day and the row is marked +1 day. If the two times are identical the row counts as zero, so a genuine 24-hour shift belongs in two rows.",
  },
  {
    q: "How is overtime calculated here?",
    a: "You choose one of two rules. Daily over 8 hours treats anything past the eighth hour of a day as overtime; weekly over 40 hours treats anything past the fortieth hour of each seven-day block that way. At $25 an hour with a 1.5 multiplier, overtime pays $37.50 an hour.",
  },
  {
    q: "Can I use it for a two-week pay period?",
    a: "Yes. Switch the card to 14 days and it becomes two rows of seven. Under the weekly rule each seven-day block gets its own 40-hour threshold, which is why a 14-day card is not simply twice a 7-day one.",
  },
  {
    q: "Does it calculate take-home pay?",
    a: "No. Everything is gross, before tax. Withholding depends on where you live, what you filed and what you contribute, so a net figure derived from hours alone would be a guess — and it would be the one number on the card you could not check.",
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
        <h2>A time card is a table, not a clock</h2>
        <p>
          Two questions sound identical and are not. &ldquo;What am I earning right now&rdquo; is
          answered by a counter that runs by itself, because it already knows your schedule. &ldquo;What
          did I actually work this week&rdquo; cannot be answered by anything that runs by itself — it
          needs the Tuesday you stayed forty minutes late and the Thursday you left at lunchtime.
        </p>
        <p>
          That is why the <Link href="/time-card-calculator">time card calculator</Link> above has no
          ticking number anywhere in it. A row per day is the honest shape of the question, and it is
          the shape payroll departments have used since the cards were cardboard.
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
        <h2>The lunch break is the whole argument</h2>
        <p>
          A 9:00 to 17:30 shift looks like eight and a half hours and is eight paid ones. The half hour
          in the middle is not a rounding detail — over five days it is the difference between a
          40-hour week and a 42.5-hour one, and the difference grows with the rate.
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
          Neither column is a mistake. A paid lunch is common in salaried roles and in some union
          contracts; an unpaid one is the norm for hourly work, and then the two columns collapse into
          one. The number that decides which you are is not on the clock, it is in your contract — and
          if you do not know, the difference is worth asking about before you fill in a year of cards.
        </p>
        <p>
          The card takes the break in minutes rather than as a second pair of times, because that is
          how a break is actually written down: half an hour, forty-five minutes, or nothing. A break
          longer than the shift is treated as a typo and capped at the shift length, so a stray
          keystroke cannot produce negative hours.
        </p>
      </section>

      <section>
        <h2>Overnight shifts: 11 PM to 7 AM is eight hours</h2>
        <p>
          Subtract 23:00 from 07:00 and you get minus sixteen. Every spreadsheet that has ever tried to
          total a night shift has produced that number at least once, and the fix is a single line: an
          end time earlier than the start time belongs to the next day, so add twenty-four hours before
          subtracting.
        </p>
        <p>
          23:00 to 07:00 therefore reads as 8.00 hours, and the row is marked{" "}
          <b>+1 day</b> so you can see which shift crossed midnight rather than discovering it from a
          total that looks too large.
        </p>
        <p>
          One case has no good answer and the card refuses to guess: identical in and out times count
          as zero, not twenty-four. A real 24-hour shift is two rows — the second one starting the
          morning after the first — because a single row cannot say which of the two readings you
          meant.
        </p>
      </section>

      <section>
        <h2>Two overtime rules, two different answers</h2>
        <p>
          Overtime is not one rule. The two in common use disagree on the same week, and the card
          offers both because picking one quietly would be wrong half the time.
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
          Same week, same hours, $75 apart, because six hours that were straight time on Saturday
          become time and a half under the other rule. Neither column is a bug — but only one of them
          matches your contract, and the card cannot know which.
        </p>
        <p>
          On a 14-day card the weekly rule applies per seven-day block rather than to the fortnight as
          a whole. That is deliberate: forty-six hours in week one is overtime even if week two is
          quiet, and averaging the two would erase it. It is also why a two-week card is not just two
          one-week cards stapled together when the boundary moves.
        </p>
        <p>
          What none of this settles is whether you are owed overtime at all. Salaried exempt employees
          generally are not, and the tests for exemption are legal ones about duties and salary level,
          not arithmetic. If the answer matters, it comes from your contract or an employment lawyer —
          not from a calculator, including this one. What the card can do is price a week of hours
          once you know the rule; if you need the paycheck that follows from those hours rather than
          the hours themselves, the <Link href="/biweekly-pay-calculator">biweekly pay calculator</Link>{" "}
          works from the salary side and stops at one gross figure.
        </p>
      </section>

      <section>
        <h2>What this page will not do</h2>
        <ul className="checks">
          <li>
            <b>Estimate your tax.</b> Everything here is gross. Withholding depends on the country and
            state, the filing status, the contributions and the tax year, so a net figure derived from
            hours alone would be the one number on the card you could not check.
          </li>
          <li>
            <b>Round your punches.</b> Some payroll systems round to the nearest quarter hour. That is
            legal in the US only while it does not systematically shave time off the employee, which
            is a fact about the rounding policy, not about this week — so the card leaves your times
            exactly as typed.
          </li>
          <li>
            <b>Track PTO, holidays or shift differentials.</b> Paid leave is not worked time, and a
            night-shift premium is a different rate on the same hours. Both are real, and both would
            need a column this card does not have.
          </li>
          <li>
            <b>Remember anything.</b> There is no account and no storage: reload the page and the card
            is empty. That is why Print and Export CSV sit under the total — a time card is payroll
            input, and the copy you keep is the point.
          </li>
        </ul>
      </section>
    </ToolPage>
  );
}
