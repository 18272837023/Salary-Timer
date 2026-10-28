import type { Metadata } from "next";
import { Link } from "@/components/SmartLink";
import { LearnPage } from "@/components/LearnPage";
import type { FaqItem } from "@/components/sections";
import { learnSchemas } from "@/lib/schema";
import { getLearn } from "@/lib/site";

const article = getLearn("/learn/how-pay-periods-work");

export const metadata: Metadata = {
  title: article.title,
  description: article.description,
  alternates: { canonical: article.href },
  openGraph: {
    title: article.title,
    description: article.description,
    url: article.href,
  },
};

const faq: FaqItem[] = [
  {
    q: "How many pay periods are in a year?",
    a: "Weekly 52, biweekly 26, semi-monthly 24, monthly 12. The count follows from the cycle, not from the calendar — which is why a biweekly cycle produces 26 paychecks but only 12 months to put them in.",
  },
  {
    q: "Why do I get three paychecks in some months?",
    a: "Because 26 paychecks do not divide evenly into 12 months. On a biweekly cycle, two months a year contain three paydays instead of two. Those are the cheapest months of the year if you budget on two, and they are the easiest to save in.",
  },
  {
    q: "Is semi-monthly the same as biweekly?",
    a: "No. Semi-monthly is twice a month — usually the 1st and the 15th — giving 24 paychecks covering unequal windows of 13 to 16 days. Biweekly is every 14 days, giving 26 smaller paychecks. The annual total is the same; the rhythm is not.",
  },
  {
    q: "Why is my payday not the last day of the period?",
    a: "Because a pay period and a payday are two different things with a fixed gap between them. Payroll needs time to close the period, so the payday sits some days later. That gap is why you can finish a month's work and still be waiting for the money.",
  },
];

export default function HowPayPeriodsWorkPage() {
  return (
    <LearnPage
      article={article}
      h1={
        <>
          How pay periods <span className="hl">work</span>.
        </>
      }
      lede="A pay period is a window of work. A payday is when that window gets paid. Almost every cash-flow surprise comes from confusing the two, or from assuming the four cycles behave the same way."
      faq={faq}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(learnSchemas(article, faq)) }}
      />

      <section>
        <h2>A pay period is a window, not a date</h2>
        <p>
          Every paycheck covers a specific stretch of time — a start date and an end date — and then
          arrives on a third date afterwards. Three dates, not one. The distance between the end of
          the window and the payday is the processing gap, and it is usually between three days and
          two weeks.
        </p>
        <p>
          That gap is the whole reason payday feels far away even when you have just finished a
          month of work. The work is done; the money has not moved. On a monthly cycle with a
          two-week gap, the distance between the first hour you worked and the moment you were paid
          for it can reach six weeks.
        </p>
      </section>

      <section>
        <h2>The four cycles, compared</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Cycle</th>
                <th>Paychecks / year</th>
                <th>Each covers</th>
                <th>Extra-paycheck months</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Weekly</td>
                <td>52</td>
                <td>7 days</td>
                <td>0</td>
              </tr>
              <tr>
                <td>Biweekly</td>
                <td>26</td>
                <td>14 days</td>
                <td>2</td>
              </tr>
              <tr>
                <td>Semi-monthly</td>
                <td>24</td>
                <td>13–16 days</td>
                <td>0</td>
              </tr>
              <tr>
                <td>Monthly</td>
                <td>12</td>
                <td>28–31 days</td>
                <td>0</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3>Biweekly: 26 paychecks, two of them bonus-shaped</h3>
        <p>
          26 × 14 days is 364 days, which is two short of a year. The cycle therefore drifts forward
          by a day or two annually, and every so often a month catches three paydays instead of two.
          If you budget on two paychecks a month, those two months are free money — and they are the
          single easiest place to build a buffer.
        </p>

        <h3>Semi-monthly: the same money, a steadier rhythm</h3>
        <p>
          24 paychecks, usually the 1st and the 15th. Each covers an unequal window — the 1st to the
          15th is 15 days, the 16th to the end is 13 to 16 depending on the month. You never get a
          three-paycheck month, and you never get a five-week gap either. It is the most predictable
          of the four, which is why many salaried roles use it.
        </p>

        <h3>Monthly: the longest wait</h3>
        <p>
          Twelve paychecks, one per calendar month. The amounts are the largest and the gaps are the
          longest, which makes a monthly cycle the hardest to run on a weekly budget. If your pay is
          monthly and your bills are monthly, it works; if your spending is weekly, the last week of
          every month is structurally tight.
        </p>
      </section>

      <section>
        <h2>Why the cycle matters more than the amount</h2>
        <p>
          Two people on identical annual pay can have completely different financial experience
          depending on the cycle. The biweekly worker gets a natural lump twice a year. The monthly
          worker gets a bigger lump twelve times and has to manage it. Neither is better — but the
          budgeting that works for one is wrong for the other.
        </p>
        <p>
          The cycle also changes what &ldquo;I have earned it but not been paid it&rdquo; means. That
          figure is real money you can count on, and it is what a countdown is actually measuring.
          The <Link href="/paycheck-countdown">paycheck countdown</Link> shows the days, hours and
          shifts left until the next one, alongside what has accrued since the last.
        </p>
      </section>

      <section>
        <h2>Working out what you are owed right now</h2>
        <p>
          The calculation is three steps: find the current pay period&apos;s start date, count the
          paid hours between then and now, multiply by your real hourly rate. That last term is the
          one people get wrong — if the rate is optimistic, so is the total.
        </p>
        <p>
          Getting the rate right is the subject of{" "}
          <Link href="/learn/hourly-rate">what an hour is worth</Link>, and deciding which hours
          count is <Link href="/learn/paid-time">what counts as paid time</Link>. This topic is only
          about timing: which window you are in, and when it closes.
        </p>
        <p>
          If your first paycheck looked smaller than this arithmetic predicts, that is a separate and
          very common effect — see{" "}
          <Link href="/learn/why-is-my-first-paycheck-smaller">
            why your first paycheck is smaller
          </Link>
          .
        </p>
      </section>
    </LearnPage>
  );
}
