import type { Metadata } from "next";
import { Link } from "@/components/SmartLink";
import { ClusterHubPage } from "@/components/ClusterHubPage";
import type { FaqItem } from "@/components/sections";
import { clusterSchemas } from "@/lib/schema";
import { getCluster } from "@/lib/site";

const cluster = getCluster("hourly-rate");

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
    q: "What is the difference between salary and hourly rate?",
    a: "Salary is a promise about a year. Hourly rate is a price for an hour. The second one is what you actually spend when you agree to a meeting, a shift or a late evening — and it is the only figure you can compare across two jobs with different schedules.",
  },
  {
    q: "Why is 2,080 hours used as the default?",
    a: "Because 40 hours × 52 weeks is easy to teach and easy to put in a spreadsheet. It is a convention, not a measurement. It only describes someone with exactly eight paid hours a day, five paid days a week, every week of the year, with no unpaid break and no unpaid overtime.",
  },
  {
    q: "Does a higher salary always mean a higher hourly rate?",
    a: "No. $62,000 across 45-minute commutes and 47-hour weeks can pay less per hour than $58,000 from a spare room on 37.5 hours. Once the denominator changes, the ranking can flip — which is why the rate is the number to compare, not the salary.",
  },
  {
    q: "Should I use gross or net pay for this?",
    a: "Gross. Tax is a percentage applied afterwards, and dividing a net figure by gross hours produces a number that describes nothing. Work out the take-home rate separately if you need it.",
  },
];

export default function HourlyRateHubPage() {
  return (
    <ClusterHubPage
      cluster={cluster}
      h1={
        <>
          What an hour of your time is <span className="hl">actually worth</span>.
        </>
      }
      lede="A salary is a yearly promise. An hourly rate is a price for an hour — and only one of those two numbers can be compared, spent or refused. This topic is every way to get from the first to the second without lying to yourself."
      faq={faq}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(clusterSchemas(cluster, faq)) }}
      />

      <section>
        <h2>Why the hourly rate is the only comparable number</h2>
        <p>
          Two job offers, $62,000 and $58,000. The higher one looks better until you notice it comes
          with a 45-minute commute each way and a week that routinely runs to 47 hours. The lower one
          is a 37.5-hour week from a spare room. Per year, the first pays $4,000 more. Per hour of
          your life, it pays less.
        </p>
        <p>
          That inversion is not an edge case. It is what happens every time you compare salaries
          without comparing denominators. An hourly rate is the only figure that already contains the
          denominator, which is why it is the number this whole site is built around.
        </p>
      </section>

      <section>
        <h2>The one formula that matters</h2>
        <p>
          Converting a salary to an hourly rate needs three inputs, and most calculators only ask for
          one:
        </p>
        <p className="formula">
          hourly rate = salary ÷ (paid hours per day × paid days per week × 52)
        </p>
        <p>
          The hard part is never the division. It is <em>paid hours per day</em>, because that is
          where contracts, breaks and habit quietly disagree with each other.
        </p>

        <h3>Paid hours per day is not shift length</h3>
        <p>
          A 09:00–17:30 shift looks like 8.5 hours on the contract. With a 30-minute unpaid lunch it
          is 8. With two unpaid 15-minute breaks as well, it is 7.5. Over a year, that last half hour
          is 130 hours — three and a bit working weeks handed over for nothing.
        </p>

        <h3>Working days per week changes the rate more than most raises</h3>
        <p>
          Dropping from five days to four at constant salary raises the hourly rate by 25%, because
          the same money now buys 20% fewer hours. Going from five to six days lowers it by about
          17%. Neither move shows up in a salary conversation, and both show up immediately here.
        </p>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Schedule</th>
                <th>Paid h / week</th>
                <th>Divisor</th>
                <th>Rate at $60,000</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>5 days · 8 h paid</td>
                <td>40.0</td>
                <td>2,080</td>
                <td>$28.85</td>
              </tr>
              <tr>
                <td>5 days · 7.5 h paid (37.5 h contract)</td>
                <td>37.5</td>
                <td>1,950</td>
                <td>$30.77</td>
              </tr>
              <tr>
                <td>5 days · 8.5 h paid</td>
                <td>42.5</td>
                <td>2,210</td>
                <td>$27.15</td>
              </tr>
              <tr>
                <td>4 days · 8 h paid</td>
                <td>32.0</td>
                <td>1,664</td>
                <td>$36.06</td>
              </tr>
              <tr>
                <td>6 days · 8 h paid</td>
                <td>48.0</td>
                <td>2,496</td>
                <td>$24.04</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p>
          Same $60,000, a spread from $24.04 to $36.06 an hour. The person on the six-day week earns
          a third less per hour than the person on four days, for identical annual pay. No
          salary-negotiation advice will ever surface that, because salary is the wrong unit.
        </p>
      </section>

      <section>
        <h2>Four places the rate goes wrong</h2>
        <ul className="checks">
          <li>
            <b>Using the contracted day instead of the paid day.</b> The most common error by a wide
            margin. Lunch is usually unpaid; treat it as paid and every downstream number is
            optimistic.
          </li>
          <li>
            <b>Ignoring unpaid overtime.</b> Staying 45 minutes late three times a week adds 117
            hours a year to the denominator without adding a cent to the numerator.
          </li>
          <li>
            <b>Mixing gross pay with net hours.</b> Or the reverse. Pick gross and stay there.
          </li>
          <li>
            <b>Dividing a monthly salary by 173.3.</b> That figure is 2,080 ÷ 12, so it inherits
            every assumption of the annual version — and adds a new one, that every month has the
            same number of working days. February disagrees.
          </li>
        </ul>
      </section>

      <section>
        <h2>What this topic covers</h2>
        <p>
          Three guides and two live tools, in the order most people need them. Start with the annual
          conversion, then look at where the divisor comes from, then handle the monthly case:
        </p>
        <ul className="checks">
          <li>
            <Link href="/learn/hourly-rate-from-annual-salary">
              Hourly rate from annual salary
            </Link>{" "}
            — the conversion itself, worked through on real schedules.
          </li>
          <li>
            <Link href="/learn/2080-hours-in-a-year">2,080 hours in a year</Link> — where the
            default divisor comes from, and who it actually fits.
          </li>
          <li>
            <Link href="/learn/monthly-salary-to-hourly-rate">
              Monthly salary to hourly rate
            </Link>{" "}
            — why ÷ 173.3 is a trap, and what to divide by instead.
          </li>
          <li>
            <Link href="/hourly-rate-calculator">Hourly rate calculator</Link> — put your own
            schedule in and get the number.
          </li>
          <li>
            <Link href="/salary-per-second">Salary per second</Link> — the same rate, at the
            smallest unit, ticking live.
          </li>
        </ul>
        <p>
          Once you have the number, the other two topics explain what happens to it:{" "}
          <Link href="/learn/paid-time">what counts as paid time</Link> decides the denominator, and{" "}
          <Link href="/learn/pay-schedule">when the money arrives</Link> decides how long you wait
          for it.
        </p>
      </section>
    </ClusterHubPage>
  );
}
