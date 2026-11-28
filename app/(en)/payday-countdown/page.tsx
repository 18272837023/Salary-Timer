import type { Metadata } from "next";
import { Link } from "@/components/SmartLink";
import { ToolPage } from "@/components/ToolPage";
import { ExampleValues, ToolExample } from "@/components/ToolExample";
import { PaydayCountdown } from "@/components/PaydayCountdown";
import type { FaqItem } from "@/lib/home-faq";
import { toolSchemas } from "@/lib/tool-schema";
import { OG_DEFAULTS, getTool } from "@/lib/site";

const tool = getTool("/payday-countdown");

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
    q: "How many days until payday?",
    a: "Choose your pay cycle and enter a known payday. The payday countdown shows the number of calendar days until the next eligible date. If that date is today, it shows zero and lists upcoming dates underneath.",
  },
  {
    q: "How many paychecks do I get in a year?",
    a: "The usual annual counts are 52 for weekly pay, 26 for every two weeks, 24 for twice a month, and 12 for monthly pay. A particular calendar year can have an extra weekly or biweekly payday depending on where the dates fall.",
  },
  {
    q: "Why do I sometimes get three paychecks in a month?",
    a: "A biweekly cycle repeats every 14 days, so three paydays can fall in a longer month. Use the biweekly setting in the payday countdown to see upcoming dates in your particular cycle.",
  },
  {
    q: "Does the payday countdown adjust for public holidays?",
    a: "No. It moves a payday that lands on a Saturday or Sunday back to the Friday before, and that is the only adjustment it makes. Public holidays differ by country and by employer, so guessing at them would produce a confident wrong date. Check your employer's payroll calendar for those.",
  },
  {
    q: "Does the payday countdown show how much I will be paid?",
    a: "It shows dates and days remaining. For paycheck size, an annual salary of $52,000 gives about $2,000 per biweekly check at 26 checks a year or $2,166.67 per semi-monthly check at 24.",
  },
];

export default function PaydayCountdownPage() {
  return (
    <ToolPage
      tool={tool}
      hero={<PaydayCountdown />}
      h1={
        <>
          Payday countdown:
          <br />
          how many days until <span className="hl">you get paid.</span>
        </>
      }
      lede="Choose your pay cycle and enter a known payday. See how many calendar days remain and preview the next dates, with an optional Friday adjustment for weekend paydays."
      faq={faq}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(toolSchemas(tool, faq)) }}
      />

      <section>
        <h2>How to use the payday countdown</h2>
        <p>
          Start with a scheduled pay date from a recent payslip or your employer’s payroll calendar.
          The date should belong to the schedule you want to follow. For example, use a Friday
          from your current cycle if you get paid every other Friday.
        </p>
        <p>
          Enter that date and select your pay cycle. The payday countdown uses calendar days to
          find the next date. The workdays figure below it counts weekdays and excludes weekends.
        </p>
        <p>
          If the other question is the one you actually have, the{" "}
          <Link href="/">live salary timer</Link> on the homepage answers it: it reads your saved
          pay, counts through the workday and shows a running total next to its own payday line.
        </p>
      </section>

      <section>
        <h2>Weekly, biweekly, semi-monthly, and monthly schedules</h2>
        <p>
          Choose the payday countdown setting that matches the interval on your payroll calendar.
          Compare two recent scheduled pay dates if you are unsure whether the cycle is biweekly
          or semi-monthly.
        </p>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Cycle</th>
                <th>Paydays a year</th>
                <th>What it does to a month</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">Weekly</th>
                <td>52</td>
                <td>four or five paydays, on no fixed date</td>
              </tr>
              <tr>
                <th scope="row">Every two weeks</th>
                <td>26</td>
                <td>two or three — three in two months a year</td>
              </tr>
              <tr>
                <th scope="row">Twice a month</th>
                <td>24</td>
                <td>exactly two, always</td>
              </tr>
              <tr>
                <th scope="row">Monthly</th>
                <td>12</td>
                <td>exactly one, always</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p>
          A weekly or biweekly payday moves across calendar dates even if the weekday stays fixed.
          The payday countdown uses calendar dates for monthly schedules. When that day does
          not exist in a shorter month, it uses the last day of the month.
        </p>
        <p>
          For twice-monthly pay, the date you enter also selects the pattern. A date on or before
          the 15th uses the 1st and 15th. A later date uses the 15th and the last day of the month.
          Check the pattern displayed below the date field against your payroll calendar.
          If a weekend payday was moved to Friday, use the original scheduled date as your
          starting point and enable the Friday adjustment. This keeps later dates on the right cycle.
        </p>
      </section>

      <section>
        <h2>Biweekly vs. semi-monthly payday calendar</h2>
        <p>
          A biweekly schedule repeats every 14 days. A semi-monthly schedule follows two dates
          in each calendar month. The schedules can share one payday and differ on the next.
        </p>

        <ToolExample title="Payday countdown example for August 2026">
          <ExampleValues items={[
            {
              label: "Biweekly · every other Friday",
              value: <><time dateTime="2026-08-14">Aug 14</time> · <time dateTime="2026-08-28">Aug 28</time></>,
              detail: "14 days apart",
            },
            {
              label: "Semi-monthly · 15th and month end",
              value: <><time dateTime="2026-08-14">Aug 14</time> · <time dateTime="2026-08-31">Aug 31</time></>,
              detail: "Aug 15 is Saturday, so the Friday rule moves it to Aug 14",
            },
          ]} />
          <p>Both schedules start from a known payday of July 31, 2026, with the Friday rule enabled.</p>
        </ToolExample>

        <p>
          Use the payday countdown preview to check whether the semi-monthly pattern matches your
          employer’s scheduled dates. To compare gross amounts per check, use the{" "}
          <Link href="/biweekly-pay-calculator">biweekly pay calculator</Link>.
        </p>
      </section>

      <section>
        <h2>What happens when payday falls on a weekend?</h2>
        <p>
          Enable the Friday rule in the payday countdown to move a Saturday or Sunday payday
          to the previous Friday.
          Check your employer’s payroll calendar to see which rule applies to you.
        </p>
        <p>
          The payday countdown only adjusts for weekends when the Friday rule is enabled.
          For a public holiday, check your employer’s posted date. Processing dates can vary with
          the country, employer, and bank.
        </p>
        <p>
          One last distinction worth keeping: the <b>pay date</b> is when the money arrives, the{" "}
          <b>pay period</b> is the stretch of work it covers. A fortnightly pay date on Friday 4
          December usually settles the two weeks that ended a week earlier. If a paycheck looks short,
          check which period it covers before checking the arithmetic.
        </p>
      </section>
    </ToolPage>
  );
}
