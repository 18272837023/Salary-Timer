import type { Metadata } from "next";
import { Link } from "@/components/SmartLink";
import { LearnPage } from "@/components/LearnPage";
import type { FaqItem } from "@/components/sections";
import { learnSchemas } from "@/lib/schema";
import { getLearn } from "@/lib/site";

const article = getLearn("/learn/night-shift-pay");

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
    q: "What is night shift pay?",
    a: "A shift differential — an extra amount paid for hours worked inside a defined night window, usually something like 22:00 to 06:00. It can be a flat hourly premium, a percentage of your base rate, or a fixed amount per night shift. It is usually set by contract or collective agreement rather than by law.",
  },
  {
    q: "How much extra is night shift usually worth?",
    a: "Common arrangements add somewhere between 10% and 20% to the base rate, or a flat $1–$3 an hour. On a $22 base, a 15% differential is worth about $6,900 a year to a full-time night worker — which is why a night job and a day job at the same nominal rate are not the same job.",
  },
  {
    q: "Does the differential apply to the whole shift?",
    a: "Only to the hours that fall inside the defined window. A 22:00–06:00 shift is entirely inside it; a 14:00–22:00 shift may contain almost none. This is why two people on the same contract can earn very different amounts, and why a timer that applies one rate all night is only right by accident.",
  },
  {
    q: "Does night pay affect overtime?",
    a: "Usually yes, indirectly. Where the differential is a regular part of your pay it can be included in the regular rate, which raises the base for overtime too. That makes a night overtime hour worth more than the same hour on days.",
  },
];

export default function NightShiftPayPage() {
  return (
    <LearnPage
      article={article}
      h1={
        <>
          Night shift pay — what the <span className="hl">extra hours</span> are worth.
        </>
      }
      lede="A night job usually pays more per hour than the same job by day. The premium is real money, it is frequently missing from the advertised rate, and it is easy to lose track of when you are quoting a single hourly figure."
      faq={faq}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(learnSchemas(article, faq)) }}
      />

      <section>
        <h2>What a shift differential actually is</h2>
        <p>
          A shift differential is extra pay for working hours that most people do not want. It is
          usually attached to a window — 22:00 to 06:00, or 18:00 to 06:00 depending on the
          employer — and it applies only to the hours that fall inside that window.
        </p>
        <p>
          It is not normally a legal requirement. It is a market response: hospitals, warehouses,
          factories and hotels have to staff nights, and they pay a premium to do it. That means the
          amount is set by your contract or collective agreement, and it varies far more between
          employers than the base rate does.
        </p>
      </section>

      <section>
        <h2>Three ways it gets paid</h2>
        <ul className="checks">
          <li>
            <b>Flat hourly premium.</b> A fixed amount added per hour — $2 an hour, for example. The
            simplest and the easiest to verify against a payslip.
          </li>
          <li>
            <b>Percentage of base.</b> A 15% or 20% uplift on your base rate for those hours. This
            scales with your rate, so it is worth more to higher-paid staff and it changes whenever
            your base changes.
          </li>
          <li>
            <b>Per-shift allowance.</b> A fixed sum for each night shift worked, regardless of length.
            This one quietly punishes long shifts — a $20 allowance on an 8-hour night is $2.50 an
            hour; on a 12-hour night it is $1.67.
          </li>
        </ul>

        <h3>What it adds up to over a year</h3>
        <p>
          Base rate $22 an hour, 40 paid hours a week, 52 weeks, all of it on nights. Each row is a
          different differential on the same job:
        </p>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Differential</th>
                <th>Effective rate</th>
                <th>Annual pay</th>
                <th>Gap vs no premium</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>None</td>
                <td>$22.00</td>
                <td>$45,760</td>
                <td>—</td>
              </tr>
              <tr>
                <td>+$2.00 / hour</td>
                <td>$24.00</td>
                <td>$49,920</td>
                <td>$4,160</td>
              </tr>
              <tr>
                <td>+10%</td>
                <td>$24.20</td>
                <td>$50,336</td>
                <td>$4,576</td>
              </tr>
              <tr>
                <td>+15%</td>
                <td>$25.30</td>
                <td>$52,624</td>
                <td>$6,864</td>
              </tr>
              <tr>
                <td>+20%</td>
                <td>$26.40</td>
                <td>$54,912</td>
                <td>$9,152</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p>
          A 15% differential is worth $6,864 a year. That is the same order of magnitude as a
          promotion, and it is invisible in the phrase &ldquo;$22 an hour&rdquo; that both the day
          shift and the night shift get described with.
        </p>
      </section>

      <section>
        <h2>The mistake: comparing a night rate to a day salary</h2>
        <p>
          Because the differential is often paid as an allowance rather than baked into the hourly
          figure, the advertised rate for a night role can look identical to the day role. Then the
          payslip arrives and it is 15% higher — or the reverse happens, and someone accepts a night
          job at the day rate because nobody wrote the differential down.
        </p>
        <p>
          The honest comparison is annual pay divided by annual paid hours, with the differential
          included. That is the same calculation as{" "}
          <Link href="/learn/hourly-rate">what an hour is worth</Link>, just with a second component
          in the numerator.
        </p>

        <h3>Nights also change what counts as a paid hour</h3>
        <p>
          A night shift that crosses midnight is where most calculators fall over: they assume a
          shift starts and ends on the same calendar day, so a 22:00–06:00 shift reads as negative
          hours. The arithmetic for that case is in{" "}
          <Link href="/learn/salary-timer-for-shift-workers">
            the shift work guide
          </Link>
          , and the <Link href="/shift-worker-salary-timer">shift worker salary timer</Link> handles
          it directly.
        </p>
      </section>

      <section>
        <h2>Where nights sit in the wider picture</h2>
        <p>
          Night pay is one of two ways an hour can be worth more than your base rate; the other is
          overtime. They often stack, and when they do the order matters — see{" "}
          <Link href="/learn/how-overtime-is-calculated">how overtime is calculated</Link> for how the
          regular rate absorbs a differential. The full set of rules about which hours are paid at
          all is in <Link href="/learn/paid-time">what counts as paid time</Link>.
        </p>
        <p>
          If your shifts are long as well as nocturnal, the two effects compound:{" "}
          <Link href="/learn/twelve-hour-shift-pay">12-hour shift pay</Link> works through how many of
          those hours are paid before the differential is applied at all.
        </p>
      </section>
    </LearnPage>
  );
}
