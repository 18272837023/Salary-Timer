import type { Metadata } from "next";
import { Link } from "@/components/SmartLink";
import { ToolPage } from "@/components/ToolPage";
import { PaydayCountdown } from "@/components/PaydayCountdown";
import type { FaqItem } from "@/lib/home-faq";
import { toolSchemas } from "@/lib/tool-schema";
import { OG_DEFAULTS, getTool } from "@/lib/site";

const tool = getTool("/payday-countdown");

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
    q: "How many days until payday?",
    a: "Enter the next payday you already know and the card counts the calendar days from today to that date. If it is today the answer is zero, and the next three dates are listed underneath so the countdown does not simply stop. Nothing about your wage goes into the sum — it is date arithmetic only.",
  },
  {
    q: "How many paychecks do I get in a year?",
    a: "Weekly pay means 52. Every two weeks means 26. Twice a month means 24, and monthly means 12. The difference between 26 and 24 is the whole reason two people on identical salaries can compare paychecks that differ by more than a hundred dollars.",
  },
  {
    q: "Why do I sometimes get three paychecks in a month?",
    a: "Because a year holds 26 biweekly paydays but only 12 months, so two months a year contain three. Semi-monthly pay never does this: it pays on fixed dates, so every month gets exactly two. If your third paycheck feels like a bonus, it is not — the annual total is unchanged.",
  },
  {
    q: "Does the countdown move payday for public holidays?",
    a: "No. It moves a payday that lands on a Saturday or Sunday back to the Friday before, and that is the only adjustment it makes. Public holidays differ by country and by employer, so guessing at them would produce a confident wrong date. Check your employer's payroll calendar for those.",
  },
  {
    q: "Is a biweekly paycheck bigger than a semi-monthly one?",
    a: "Yes, for the same salary, because there are fewer of them. On $52,000 a year a biweekly paycheck is $2,000 and a semi-monthly one is $2,166.67. Neither is a raise: the year totals are identical, and comparing the paychecks across two job offers without annualising them is a common and expensive mistake.",
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
      lede="Pick your pay cycle and the next payday you already know, and the card counts the days down to it — then shows the three after that. Dates only: this page will not guess what the payday is worth."
      faq={faq}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(toolSchemas(tool, faq)) }}
      />

      <section>
        <h2>A date question, not a money question</h2>
        <p>
          &ldquo;When is my next payday&rdquo; and &ldquo;how much will it be&rdquo; feel like one
          question and are not. The first is arithmetic on a calendar: one date, one cycle, one
          subtraction. The second needs your rate, your hours and your deductions, and the answer
          changes every day you work.
        </p>
        <p>
          This page only does the first. The <Link href="/payday-countdown">payday countdown</Link>{" "}
          above takes the payday you already know, repeats it on your cycle, and counts the calendar
          days from today — which is why it can answer in one line instead of asking you to set up a
          schedule first.
        </p>
        <p>
          If the other question is the one you actually have, the{" "}
          <Link href="/">live salary timer</Link> on the homepage answers it: it reads your saved
          pay, counts through the workday and shows a running total next to its own payday line.
        </p>
      </section>

      <section>
        <h2>Four cycles, four different years</h2>
        <p>
          The cycle decides how many paydays a year holds, and that number decides everything else —
          how big a paycheck is, how often a month gets an extra one, and why two people on the same
          salary never seem to agree about what a paycheck looks like.
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
          Notice that only the fortnightly cycle drifts. Weekly pay is tied to a weekday rather than
          a date, so it also wanders across the calendar, but by four or five paydays a month instead
          of a whole extra one twice a year. Twice-monthly and monthly pay are anchored to dates, and
          an anchored date cannot produce a third payment in the same month.
        </p>
      </section>

      <section>
        <h2>Why biweekly and semi-monthly are not the same</h2>
        <p>
          26 versus 24. Two extra paychecks a year, for identical work, at identical pay — which is
          the difference between a paycheck of $2,000 and one of $2,166.67 on a $52,000 salary.
        </p>
        <p>
          People compare those numbers all the time and conclude that the semi-monthly job pays
          better. It does not; it just pays more often in smaller pieces. Annualising both is the only
          honest comparison, and the{" "}
          <Link href="/hourly-to-annual-salary">hourly to annual salary calculator</Link> is the
          shortest route to it when your pay is quoted per hour rather than per year.
        </p>
        <p>
          The three-paycheck month is the visible symptom of the same arithmetic. A biweekly year is
          26 × 14 = 364 days, so the paydays slide two days earlier each year, and roughly twice a
          year one lands early enough that another follows inside the same month. It is not a bonus.
          The year still holds 26.
        </p>
      </section>

      <section>
        <h2>When payday moves</h2>
        <p>
          Payroll dates are promises about money arriving, so they move earlier and never later. A
          payday that lands on a Saturday is usually paid on the Friday before; one that lands on a
          Sunday is paid on the Friday too. Nobody shifts a payday forward into the following week,
          because that would mean paying after the date the contract states.
        </p>
        <p>
          Public holidays are the same idea with a messier calendar. Banks close, so payroll runs a
          day or two early, and the exact behaviour depends on the country, the bank and the employer.
          The countdown above deliberately does not model that: it handles weekends, states so, and
          leaves holidays to your payroll calendar rather than inventing a rule that would be wrong
          somewhere.
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
