import type { Metadata } from "next";
import { Link } from "@/components/SmartLink";
import { ToolPage } from "@/components/ToolPage";
import type { FaqItem } from "@/components/sections";
import { toolSchemas } from "@/lib/schema";
import { getTool } from "@/lib/site";

const tool = getTool("/paycheck-countdown");

export const metadata: Metadata = {
  title: tool.title,
  description: tool.description,
  alternates: { canonical: tool.href },
  openGraph: { title: tool.title, description: tool.description, url: tool.href },
};

const faq: FaqItem[] = [
  {
    q: "How does the payday countdown work?",
    a: "Set the day of the month you get paid (or 'last day'), and the site works out the next occurrence from today. If that date has already passed this month, it rolls to the same day next month, clamping correctly for short months — day 31 becomes the 30th or the 28th rather than an invalid date.",
  },
  {
    q: "Can it count down in shifts instead of days?",
    a: "Indirectly, yes. The countdown shows days; the timer shows paid hours per shift, so dividing the remaining days by your working days per week gives the number of shifts. If you work 5 days a week and payday is 9 days away, that is roughly 6 shifts including today.",
  },
  {
    q: "What if I get paid weekly or fortnightly?",
    a: "Set your payday to the next actual pay date and read the countdown as a one-off. For a repeating weekly cycle, subtract 7 from the shown number each week — or simply reset the payday after each payday, which takes two seconds.",
  },
  {
    q: "Does the countdown account for weekends?",
    a: "The day count is calendar days, not working days, because that is what people actually experience — a weekend between you and payday is still two days of waiting. The shift estimate does account for your working days, since only those are days you get paid for.",
  },
  {
    q: "Why does the last week before payday feel so long?",
    a: "Because the balance is low and the remaining work is high, so every purchase becomes a decision. A countdown does not fix that, but it does something useful: it makes the remaining distance finite and visible, which reliably reduces the anxiety of an open-ended wait.",
  },
];

export default function PaycheckCountdownPage() {
  return (
    <ToolPage
      tool={tool}
      h1={
        <>
          Paycheck countdown:
          <br />
          how many <span className="hl">shifts</span> until payday.
        </>
      }
      lede="Days are the wrong unit when you are waiting for money. Shifts are better, and hours are better still — because those are the ones you actually have to get through. Set your payday once and the countdown does the rest."
      faq={faq}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(toolSchemas(tool, faq)) }}
      />

      <section>
        <h2>Why a payday countdown helps at all</h2>
        <p>
          An open-ended wait is more stressful than a bounded one, even when the length is
          identical. That is one of the more robust findings in the study of waiting: uncertainty
          about duration is worse than the duration itself.
        </p>
        <p>
          Payday is not uncertain — it is the 15th, every month. But it <em>feels</em> uncertain,
          because nothing in your daily experience marks the distance. A countdown converts a vague
          &ldquo;soon&rdquo; into &ldquo;nine days, six shifts, forty-eight paid hours&rdquo;. Same
          wait, dramatically less friction.
        </p>
      </section>

      <section>
        <h2>Three units, three different feelings</h2>
        <p>
          The same distance reads differently depending on how you count it:
        </p>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Unit</th>
                <th>9 days before payday, 5-day week</th>
                <th>How it feels</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Calendar days</td>
                <td>9 days</td>
                <td>Long. Includes a weekend that does not pay you.</td>
              </tr>
              <tr>
                <td>Shifts</td>
                <td>6 shifts</td>
                <td>Countable. You can tick them off.</td>
              </tr>
              <tr>
                <td>Paid hours</td>
                <td>48 hours</td>
                <td>Finite and familiar — two working days per day off.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p>
          Most people find the shift count the most motivating, because a shift has a beginning and
          an end you can see. &ldquo;Six shifts&rdquo; is a list. &ldquo;Nine days&rdquo; is a fog.
        </p>
      </section>

      <section>
        <h2>What the countdown pairs with</h2>
        <ul className="checks">
          <li>
            <b>The live counter.</b> Knowing payday is nine days away is more useful when you can
            also see what you have already earned this month, and what is still to come.
          </li>
          <li>
            <b>The savings jar.</b> A jar that fills from your earnings turns the wait into progress.
            By payday the jar is not empty, which is the entire point of saving automatically.
          </li>
          <li>
            <b>Your real hourly rate.</b> If the countdown says six shifts, and each shift is worth
            a known amount, you know what the remaining wait is worth. That number is usually more
            than people expect.
          </li>
        </ul>
      </section>

      <section>
        <h2>Setting it up correctly</h2>
        <p>
          Three details make the difference between a countdown that is right and one that is
          decorative:
        </p>
        <ol className="checks">
          <li>
            <b>Use your actual pay date</b>, not the nominal one. If your employer pays on the 15th
            but the money lands on the 17th when the 15th is a weekend, use the 17th.
          </li>
          <li>
            <b>Set your working days honestly.</b> The shift estimate depends on them, and a rota
            that includes Saturdays changes the answer by a third.
          </li>
          <li>
            <b>Keep the schedule current.</b> The countdown reads your settings, so a shift change
            needs to be entered once, not remembered every month.
          </li>
        </ol>
        <p>
          For the per-hour version of the same numbers, see{" "}
          <Link href="/hourly-rate-calculator">hourly rate calculator</Link>. If your pay date
          moves with a rota rather than the calendar, the{" "}
          <Link href="/shift-worker-salary-timer">shift worker salary timer</Link> is the better
          fit. You can also open the <Link href="/">salary timer homepage</Link> and start the clock
          there.
        </p>
      </section>
    </ToolPage>
  );
}
