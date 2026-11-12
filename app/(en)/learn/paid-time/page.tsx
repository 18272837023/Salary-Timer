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
    "q": "Is a lunch break paid?",
    "a": "Under general US federal FLSA rules, short rest breaks are generally paid; bona fide meals are generally unpaid only when the employee is completely relieved of duties. In the UK, whether a rest break is paid depends on the contract. Check applicable law and actual duties."
  },
  {
    "q": "What hours count as overtime?",
    "a": "Under the general US federal FLSA rule, covered, nonexempt employees receive at least 1.5 times their regular rate for hours worked over 40 in a workweek. State protections and special statutory rules may differ. This is not a worldwide threshold."
  },
  {
    "q": "Is a night shift worth more per hour?",
    "a": "Only when the applicable law or employment arrangement provides a premium. A differential may be a flat sum, a percentage or a per-shift allowance. Check which hours qualify and whether it affects the overtime regular rate."
  },
  {
    "q": "How many hours of a 12-hour shift are paid?",
    "a": "A 12-hour window with a 30-minute duty-free unpaid meal is 11.5 paid hours. Required handovers and travel between sites during the workday may be compensable; do not deduct them automatically."
  }
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
        <h2>Paid time depends on law, duties and the employment arrangement</h2>
        <p>
          Start with applicable law and the work actually performed, then check the contract
          and workplace policy. A contract cannot simply remove statutory pay protections.
          The table below summarizes general US federal FLSA hours-worked principles;
          state rules, exemptions and other jurisdictions can differ.
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
                <th>General US federal treatment</th>
                <th>What it changes</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Meal break, 30–60 min</td>
                <td>Generally unpaid only if completely relieved of duties</td>
                <td>Removes ~6% of paid hours on an 8.5 h day</td>
              </tr>
              <tr>
                <td>Rest break, 5–20 min</td>
                <td>Yes</td>
                <td>Nothing — it stays inside paid time</td>
              </tr>
              <tr>
                <td>Handover / briefing</td>
                <td>Required duties generally count as work</td>
                <td>Include required work when assessing paid hours</td>
              </tr>
              <tr>
                <td>Travel between sites</td>
                <td>Usually yes</td>
                <td>Commuting is not; the second site usually is</td>
              </tr>
              <tr>
                <td>On-call standby</td>
                <td>Depends on restrictions and whether time can be used freely</td>
                <td>Assess hours worked under the applicable rules</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3>Meal breaks are the expensive one</h3>
        <p>
          Half an hour a day is 130 hours a year — more than three working weeks. At a fixed annual salary,
          subtracting genuinely unpaid meals reduces annualized paid hours and increases
          the equivalent hourly rate. This does not change the annual salary itself. The full arithmetic, including what it
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
          A 12-hour attendance window with a 30-minute duty-free unpaid meal contains 11.5
          paid hours. Over three shifts a week and 52 weeks, the meals total 78 unpaid hours.
          Required handovers should not be treated as unpaid breaks by default. That case is
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
