import type { Metadata } from "next";
import { Link } from "@/components/SmartLink";
import { ClusterHubPage } from "@/components/ClusterHubPage";
import type { FaqItem } from "@/components/sections";
import { clusterSchemas } from "@/lib/schema";
import { getCluster } from "@/lib/site";

const cluster = getCluster("paid-time");

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
    q: "Is a lunch break paid?",
    a: "Usually not, if it is 30 minutes or longer. Shorter rest breaks are more often paid. The only reliable answer is your contract or handbook — a generic calculator assuming a tidy eight paid hours is guessing on your behalf.",
  },
  {
    q: "What hours count as overtime?",
    a: "In most places, hours worked beyond the standard threshold in a workweek — commonly 40. The rate is then a multiple of your regular rate: 1.5× is the usual minimum, 2× for certain holidays or very long days. Unpaid breaks do not count toward the threshold, which is why a 45-hour week with lunch is often only 40 paid hours.",
  },
  {
    q: "Is a night shift worth more per hour?",
    a: "Often, yes. A shift differential is an extra amount or percentage paid for hours worked in a defined night window. It is common in healthcare, manufacturing, logistics and hospitality, and it is frequently not included in the advertised hourly rate — so the real night rate can be noticeably higher than the day rate.",
  },
  {
    q: "How many hours of a 12-hour shift are actually paid?",
    a: "Usually fewer than 12. Unpaid meal breaks, handover time and travel between sites all come out of the clock. A 12-hour shift with a 30-minute unpaid break and a 15-minute handover is 11.25 paid hours — and on a three-day week, that 0.75-hour gap is over 100 hours a year.",
  },
];

export default function PaidTimeHubPage() {
  return (
    <ClusterHubPage
      cluster={cluster}
      h1={
        <>
          What counts as <span className="hl">paid time</span>.
        </>
      }
      lede="Your hourly rate is a fraction. This topic is the denominator — which hours your employer is actually buying, and which ones you are giving away because nobody wrote it down."
      faq={faq}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(clusterSchemas(cluster, faq)) }}
      />

      <section>
        <h2>Paid time is a contract question, not a maths question</h2>
        <p>
          There is no universal rule for what counts as work. There is your agreement, your local
          labour law, and the habit of whoever runs the rota. Where those three disagree, the
          agreement usually wins — which is why the honest answer to most questions in this topic
          starts with &ldquo;check your contract&rdquo; rather than a number.
        </p>
        <p>
          What the site can do is make the arithmetic visible once you know the rule. Mark a break as
          unpaid and the counter freezes. Mark it paid and it keeps running. Either way the number
          you see matches the contract you described, instead of a default assumption baked in by
          someone else.
        </p>
      </section>

      <section>
        <h2>The five kinds of time that get argued about</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Type of time</th>
                <th>Usually paid?</th>
                <th>What it changes</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Meal break, 30–60 min</td>
                <td>No</td>
                <td>Removes ~6% of paid hours on an 8.5 h day</td>
              </tr>
              <tr>
                <td>Rest break, 5–20 min</td>
                <td>Yes</td>
                <td>Nothing — it stays inside paid time</td>
              </tr>
              <tr>
                <td>Handover / briefing</td>
                <td>Depends</td>
                <td>Often unpaid in practice, paid on paper</td>
              </tr>
              <tr>
                <td>Travel between sites</td>
                <td>Usually yes</td>
                <td>Commuting is not; the second site usually is</td>
              </tr>
              <tr>
                <td>On-call standby</td>
                <td>Allowance, not full rate</td>
                <td>Adds a flat amount rather than hours</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3>Meal breaks are the expensive one</h3>
        <p>
          Half an hour a day is 130 hours a year — more than three working weeks. If your salary
          assumes those hours are paid and they are not, your real rate is lower than the one you
          have been quoting in conversations with yourself. The full arithmetic, including what it
          does to a $60,000 salary, is in{" "}
          <Link href="/learn/are-lunch-breaks-paid">are lunch breaks paid</Link>.
        </p>

        <h3>Handover is the one nobody writes down</h3>
        <p>
          In shift work, the fifteen minutes you spend briefing the next person is often the most
          genuinely work-like part of the day, and often the least recorded. Across a four-shift week
          that is an hour; across a year it is a working week and a half. It is not a rounding error
          — it is a policy gap.
        </p>
      </section>

      <section>
        <h2>Premium hours: when the rate itself changes</h2>
        <p>
          Most of this topic is about which hours are paid. The rest is about hours that are paid
          differently — and there are two mechanisms worth knowing.
        </p>

        <h3>Overtime multiplies the base rate</h3>
        <p>
          Overtime is a multiplier applied to your regular rate, not a new rate invented for the
          occasion. That distinction matters because the base rate is where disputes happen: if your
          regular rate was understated, every overtime hour is understated by the same proportion.
          The arithmetic and the four common errors are in{" "}
          <Link href="/learn/how-overtime-is-calculated">how overtime is calculated</Link>.
        </p>

        <h3>Night differentials add to it instead</h3>
        <p>
          A shift differential is usually a flat amount or a percentage for hours inside a defined
          window — often something like 22:00 to 06:00. It is additive rather than multiplicative, and
          it frequently does not appear in the advertised hourly rate, which is why two people on the
          same contract can take home very different amounts. See{" "}
          <Link href="/learn/night-shift-pay">night shift pay</Link> for what a differential is worth
          over a year.
        </p>

        <h3>Long shifts hide the biggest gap</h3>
        <p>
          A 12-hour shift is rarely 12 paid hours, and the shorter the working week, the more each
          unpaid hour costs proportionally. On three 12-hour shifts a week, losing 45 minutes a shift
          to breaks and handover is over 100 hours a year — nearly 6% of your paid life. That case is
          worked through in{" "}
          <Link href="/learn/twelve-hour-shift-pay">12-hour shift pay</Link>.
        </p>
      </section>

      <section>
        <h2>What this topic covers</h2>
        <p>
          Five guides and two live tools. The guides are ordered from the most common question to the
          most specialised:
        </p>
        <ul className="checks">
          <li>
            <Link href="/learn/are-lunch-breaks-paid">Are lunch breaks paid?</Link> — the default
            assumption, and the two numbers it moves.
          </li>
          <li>
            <Link href="/learn/how-overtime-is-calculated">
              How overtime is calculated
            </Link>{" "}
            — the multiplier, the base rate, and the traps.
          </li>
          <li>
            <Link href="/learn/night-shift-pay">Night shift pay</Link> — differentials, premiums and
            what nights are worth over a year.
          </li>
          <li>
            <Link href="/learn/twelve-hour-shift-pay">12-hour shift pay</Link> — how many of those
            hours are actually paid.
          </li>
          <li>
            <Link href="/learn/salary-timer-for-shift-workers">
              Salary timer for shift workers
            </Link>{" "}
            — nights, rotas and shifts that cross midnight.
          </li>
          <li>
            <Link href="/overtime-pay-calculator">Overtime pay calculator</Link> — what an extra hour
            is worth before you agree to it.
          </li>
          <li>
            <Link href="/shift-worker-salary-timer">Shift worker salary timer</Link> — a timer that
            handles overnight shifts correctly.
          </li>
        </ul>
        <p>
          The denominator these rules produce feeds straight into{" "}
          <Link href="/learn/hourly-rate">what an hour is worth</Link>. The delay between working
          those hours and being paid for them is{" "}
          <Link href="/learn/pay-schedule">when the money arrives</Link>.
        </p>
      </section>
    </ClusterHubPage>
  );
}
