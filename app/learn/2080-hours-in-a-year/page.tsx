import type { Metadata } from "next";
import { Link } from "@/components/SmartLink";
import { LearnPage } from "@/components/LearnPage";
import type { FaqItem } from "@/components/sections";
import { learnSchemas } from "@/lib/schema";
import { getLearn } from "@/lib/site";

const article = getLearn("/learn/2080-hours-in-a-year");

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
    q: "Is 2,080 hours a year accurate?",
    a: "As a number, yes — 40 × 52 is 2,080. As a default, no. It describes someone with exactly 40 paid hours a week for all 52 weeks. The moment your paid week is 37.5, 42.5 or 48 hours, the divisor is wrong and so is every rate derived from it.",
  },
  {
    q: "How many work hours are in a year really?",
    a: "At 40 paid hours a week, 2,080. At a 37.5-hour contract, 1,950. At a 45-hour week, 2,340. At 48 hours, 2,496. The number of calendar days in the year barely matters — what moves the total is paid hours per week, because 52 weeks is close to a constant.",
  },
  {
    q: "Does paid holiday count toward the 2,080?",
    a: "Yes, and that is the one thing 2,080 gets right. Paid holiday is paid, so it belongs in the denominator if you are dividing pay by hours you are paid for. It only comes out if the holiday is unpaid — which is a different contract, and a different divisor.",
  },
  {
    q: "Should I use 2,080 for a part-time job?",
    a: "No. Scale the weekly hours: 20 paid hours a week is 1,040 a year, 30 is 1,560. Using 2,080 for a part-time role understates the hourly rate by roughly half, which is why part-time workers often think their rate is worse than it is.",
  },
];

export default function HoursInAYearPage() {
  return (
    <LearnPage
      article={article}
      h1={
        <>
          2,080 hours in a year — <span className="hl">whose</span> year?
        </>
      }
      lede="2,080 is the default divisor in nearly every salary calculator on the internet. The arithmetic is correct. The assumption behind it is what fails, and it fails quietly."
      faq={faq}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(learnSchemas(article, faq)) }}
      />

      <section>
        <h2>Where the number comes from</h2>
        <p>
          2,080 is 40 hours a week × 52 weeks a year. That is the whole derivation. It is a
          convention inherited from a manufacturing-era standard week, and it has survived into
          knowledge work because it is easy to put in a spreadsheet cell.
        </p>
        <p>
          The important thing to notice is that <em>both</em> factors are assumptions. 40 assumes
          your paid week is exactly 40 hours. 52 assumes you are paid for every week of the calendar
          year. Neither is a measurement of your job.
        </p>
      </section>

      <section>
        <h2>What each assumption is worth</h2>
        <p>
          Changing one assumption at a time shows how much of your rate is actually decided by the
          divisor rather than the salary. The numbers below all use $60,000, so the only thing moving
          is the denominator.
        </p>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Assumption inside 2,080</th>
                <th>Common reality</th>
                <th>Real divisor</th>
                <th>Rate at $60,000</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>40 paid hours / week</td>
                <td>37.5-hour contract</td>
                <td>1,950</td>
                <td>$30.77</td>
              </tr>
              <tr>
                <td>40 paid hours / week</td>
                <td>45-hour week</td>
                <td>2,340</td>
                <td>$25.64</td>
              </tr>
              <tr>
                <td>5 paid days / week</td>
                <td>4-day week, 32 paid hours</td>
                <td>1,664</td>
                <td>$36.06</td>
              </tr>
              <tr>
                <td>52 paid weeks</td>
                <td>6 weeks unpaid leave</td>
                <td>1,840</td>
                <td>$32.61</td>
              </tr>
              <tr>
                <td>No unpaid overtime</td>
                <td>3 unpaid hours a week</td>
                <td>2,236</td>
                <td>$26.83</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3>An unpaid lunch does not break 2,080 by itself</h3>
        <p>
          This is the part most articles get wrong. If you work a 09:00–17:30 shift with a 30-minute
          unpaid lunch, your <em>paid</em> day is 8 hours — and 8 × 5 × 52 is exactly 2,080. The
          lunch is already accounted for.
        </p>
        <p>
          What breaks the divisor is a paid day that is not 8 hours: a 7.5-hour contract, a 9-hour
          shift, a fourth day off, a sixth day on. The lunch matters for the daily total, not for the
          annual one — provided the daily total comes out to 8.
        </p>

        <h3>Unpaid overtime is the silent one</h3>
        <p>
          Three unpaid hours a week — staying 36 minutes late three times — adds 156 hours to your
          year without adding a cent to your pay. Your divisor becomes 2,236 and your real rate drops
          by 7%. Nobody negotiates this. It just accumulates.
        </p>
      </section>

      <section>
        <h2>Who 2,080 actually fits</h2>
        <p>
          It fits a narrower group than the internet implies: full-time salaried roles with exactly
          40 paid hours a week, paid public holidays, paid vacation, no routine unpaid overtime, and
          no second job. If that is you, 2,080 is correct and you can stop worrying about it.
        </p>
        <p>
          If any of those is false — a 37.5-hour European contract, a 4-day week, a shift rota, a
          part-time role, a job where you stay late most days — the divisor is wrong and your real
          rate is not the one you have been quoting.
        </p>
      </section>

      <section>
        <h2>What to divide by instead</h2>
        <p>
          Use your own paid week, then multiply by 52:
        </p>
        <p className="formula">
          annual paid hours = paid hours per day × paid days per week × 52
        </p>
        <p>
          For most people the honest answer is one of four numbers: 1,664 (four 8-hour days), 1,950
          (37.5 hours), 2,080 (40 hours) or 2,340 (45 hours). Knowing which one is yours takes one
          minute and changes every rate calculation that follows.
        </p>
        <p>
          The conversion itself, worked through on three real schedules, is in{" "}
          <Link href="/learn/hourly-rate-from-annual-salary">
            hourly rate from annual salary
          </Link>
          . If your pay arrives monthly rather than yearly, the same trap appears in a different
          disguise — see{" "}
          <Link href="/learn/monthly-salary-to-hourly-rate">monthly salary to hourly rate</Link>. And
          if you want to see which hours actually count toward the 40,{" "}
          <Link href="/learn/are-lunch-breaks-paid">are lunch breaks paid</Link> is the place to
          start. Put your own numbers into the{" "}
          <Link href="/hourly-rate-calculator">hourly rate calculator</Link> to get the divisor that
          belongs to your job, or read the{" "}
          <Link href="/learn/hourly-rate">full topic on what an hour is worth</Link>.
        </p>
      </section>
    </LearnPage>
  );
}
