import type { Metadata } from "next";
import { Link } from "@/components/SmartLink";
import { ClusterHubPage } from "@/components/ClusterHubPage";
import type { FaqItem } from "@/components/sections";
import { clusterSchemas } from "@/lib/schema";
import { getCluster } from "@/lib/site";

const cluster = getCluster("pay-schedule");

export const metadata: Metadata = {
  title: cluster.title,
  description: cluster.description,
  alternates: { canonical: cluster.href },
  openGraph: {
    title: cluster.title,
    description: cluster.description,
    url: cluster.href,
  },
};

const faq: FaqItem[] = [
  {
    q: "Is biweekly the same as semi-monthly?",
    a: "No, and the difference is two paychecks a year. Biweekly is every two weeks — 26 paychecks, each covering 14 days. Semi-monthly is twice a month, usually the 1st and the 15th — 24 paychecks, covering unequal windows. Biweekly paychecks are slightly smaller but you get two extra ones in most years.",
  },
  {
    q: "How many paychecks do you get in a year?",
    a: "Weekly 52, biweekly 26, semi-monthly 24, monthly 12. Biweekly is the one that drifts: 26 × 14 days is 364, so roughly every 11 years a third paycheck lands in a month that already has two.",
  },
  {
    q: "Why is my first paycheck smaller than the salary suggests?",
    a: "Two separate reasons. First, it usually covers a partial period — you started mid-cycle, so it pays for the days you actually worked. Second, deductions are taken in full from that smaller gross. A first paycheck is often 40–60% of a normal one, and the missing part is not lost — it is paid in the next cycle.",
  },
  {
    q: "Why does my paycheck date move?",
    a: "Because the pay period and the payday are two different things with a fixed gap between them. If a payday falls on a weekend or a bank holiday, most employers pay earlier rather than later, which shifts the date without changing the amount.",
  },
];

export default function PayScheduleHubPage() {
  return (
    <ClusterHubPage
      cluster={cluster}
      h1={
        <>
          When the money <span className="hl">actually arrives</span>.
        </>
      }
      lede="You work on a daily clock and you are paid on a cycle. The distance between those two clocks is where every cash-flow problem, every first-paycheck surprise and every payday-countdown lives."
      faq={faq}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(clusterSchemas(cluster, faq)) }}
      />

      <section>
        <h2>Work and pay run on two different clocks</h2>
        <p>
          The first clock is the one you feel: hours, shifts, the last two hours of a Friday. The
          second clock is administrative: a pay period with a start and end date, then a payday some
          days later. On a monthly cycle the gap between finishing work and being paid for it can
          reach five weeks.
        </p>
        <p>
          That gap is not a rounding issue. It is the reason a month can feel like it is going badly
          while your earned total is fine — the work is done, the money has not moved yet. Once you
          can see both clocks at once, the feeling gets a number attached to it.
        </p>
      </section>

      <section>
        <h2>The four pay cycles, side by side</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Cycle</th>
                <th>Paychecks / year</th>
                <th>Each covers</th>
                <th>The catch</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Weekly</td>
                <td>52</td>
                <td>7 days</td>
                <td>Most admin per paycheck, smallest amounts</td>
              </tr>
              <tr>
                <td>Biweekly</td>
                <td>26</td>
                <td>14 days</td>
                <td>Two months a year get three paychecks</td>
              </tr>
              <tr>
                <td>Semi-monthly</td>
                <td>24</td>
                <td>1st–15th, 16th–end</td>
                <td>Periods are unequal: 13 to 16 days</td>
              </tr>
              <tr>
                <td>Monthly</td>
                <td>12</td>
                <td>Calendar month</td>
                <td>Longest wait between work and money</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3>Biweekly is not semi-monthly, and it matters twice a year</h3>
        <p>
          The names sound interchangeable and the numbers are not. Biweekly means every 14 days:
          26 paychecks, each one slightly smaller. Semi-monthly means twice a month: 24 paychecks,
          each one slightly larger. If you budget on the assumption that a &ldquo;month&rdquo; contains
          two paychecks, biweekly quietly breaks that twice a year — and those two months are the
          easiest ones in the calendar to save in.
        </p>

        <h3>Monthly cycles hide the longest delay</h3>
        <p>
          On a monthly cycle, work done on the 1st may not be paid until the 28th of the following
          month — up to 58 days between the hour you worked and the hour it landed. That is why a
          monthly-paid worker can be perfectly on budget and still feel broke in the last week of
          every month.
        </p>
      </section>

      <section>
        <h2>Why the first paycheck is always the strange one</h2>
        <p>
          Two things go wrong at once. The period is partial, so it pays for fewer days than a normal
          cycle. And deductions are calculated on that smaller gross, which means the percentage taken
          can look wrong even when it is arithmetically correct.
        </p>
        <p>
          The missing money is not lost. It is the work you did before the pay period started, and it
          appears in the next cycle. The full breakdown — including which deductions are one-off
          versus recurring — is in{" "}
          <Link href="/learn/why-is-my-first-paycheck-smaller">
            why your first paycheck is smaller
          </Link>
          .
        </p>
      </section>

      <section>
        <h2>What this topic covers</h2>
        <p>
          Two guides and one live tool. This is the smallest of the three topics on purpose — it is
          narrow, and it is the one people search for on a specific day of the month:
        </p>
        <ul className="checks">
          <li>
            <Link href="/learn/how-pay-periods-work">How pay periods work</Link> — the four cycles,
            the paycheck counts, and the biweekly trap.
          </li>
          <li>
            <Link href="/learn/why-is-my-first-paycheck-smaller">
              Why your first paycheck is smaller
            </Link>{" "}
            — which part is missing, and when it comes back.
          </li>
          <li>
            <Link href="/paycheck-countdown">Paycheck countdown</Link> — set your payday once and see
            the days, hours and shifts left.
          </li>
        </ul>
        <p>
          The other two topics explain the amount rather than the timing:{" "}
          <Link href="/learn/hourly-rate">what an hour is worth</Link> and{" "}
          <Link href="/learn/paid-time">what counts as paid time</Link>.
        </p>
      </section>
    </ClusterHubPage>
  );
}
