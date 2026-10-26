import type { Metadata } from "next";
import { Link } from "@/components/SmartLink";
import { LearnPage } from "@/components/LearnPage";
import type { FaqItem } from "@/components/sections";
import { learnSchemas } from "@/lib/schema";
import { getLearn } from "@/lib/site";

const article = getLearn("/learn/hourly-rate-from-annual-salary");

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
    q: "Why is salary ÷ 2,080 usually wrong?",
    a: "2,080 assumes 40 paid hours a week, every week of the year. Unpaid lunch, a 4-day week, unpaid overtime or a longer day all change the divisor — often by 10–20%.",
  },
  {
    q: "Should I use gross or net salary?",
    a: "Use gross. Tax is applied afterwards. Mixing net pay with gross hours produces a number that describes neither your rate nor your take-home.",
  },
  {
    q: "How do I convert hourly back to annual?",
    a: "Multiply hourly rate × paid hours per week × 52. A 37.5-hour week is ×1,950, not ×2,080 — which is why the same salary looks different across countries.",
  },
  {
    q: "Does a salary timer use this same rate?",
    a: "Yes. On this site the live timer and the hourly rate calculator share the same schedule-first math, so the number climbing on screen matches the rate you just derived.",
  },
];

export default function HourlyRateFromAnnualPage() {
  return (
    <LearnPage
      article={article}
      h1={
        <>
          Hourly rate from annual salary —
          <br />
          the <span className="hl">honest</span> conversion.
        </>
      }
      lede="Salary ÷ 2,080 is tidy and usually wrong. This page is the conceptual twin of the hourly rate calculator — and of the rate that drives the live salary timer."
      faq={faq}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(learnSchemas(article, faq)) }}
      />

      <section>
        <h2>The formula that survives contact with a real job</h2>
        <p className="formula">
          hourly rate = annual salary ÷ (paid hours per day × working days per week × 52)
        </p>
        <p>
          The hard part is <em>paid hours per day</em>. A shift from 09:00 to 17:30 looks like 8.5
          hours. With a 30-minute unpaid lunch it is 8. With two unpaid 15-minute breaks it is 7.5.
          The salary stays fixed; the divisor is what honesty changes.
        </p>
        <p>
          That same rate is what a <Link href="/">salary timer</Link> multiplies by elapsed paid
          time. If you get the conversion wrong here, the live counter will be smoothly, politely
          wrong all day.
        </p>
      </section>

      <section>
        <h2>Where 2,080 comes from — and where it fails</h2>
        <p>
          40 × 52 = 2,080. It only holds if every contracted hour is paid and you never work more
          or less. Most people have unpaid lunch. Some work a four-day week. Some answer messages on
          Sundays. The divisor moves; the annual figure on the offer letter does not.
        </p>
        <ul className="checks">
          <li>
            Unpaid lunch on an 8.5-hour clock window → fewer paid hours → <em>higher</em> true
            hourly rate than ÷ 2,080 suggests (you are paid for fewer hours than the myth assumes).
          </li>
          <li>
            Fifty-hour weeks at the same salary → more paid hours → <em>lower</em> true hourly rate.
          </li>
          <li>
            A 4-day week at the same salary → fewer days → usually a higher rate, unless each day
            is stretched to compensate.
          </li>
        </ul>
        <p>
          Using the wrong divisor does not just mislabel your rate. It misprices overtime,
          freelancing quotes, and “can you cover Saturday?” decisions — anything that needs a
          believable price for an hour.
        </p>
      </section>

      <section>
        <h2>Worked shape (without pretending your numbers)</h2>
        <p>
          Take a round example: $60,000 a year, Monday–Friday, 09:00–17:30, 30-minute unpaid lunch.
        </p>
        <ul className="checks">
          <li>Clock window: 8.5 hours. Paid hours after lunch: 8.</li>
          <li>Weekly paid hours: 8 × 5 = 40. Annual paid hours: 40 × 52 = 2,080.</li>
          <li>
            In this special case ÷ 2,080 accidentally matches — because paid hours lined up with the
            myth. Change lunch to 60 minutes and paid hours drop to 7.5 × 5 × 52 = 1,950; the rate
            rises.
          </li>
        </ul>
        <p>
          The point is not the dollar figure. The point is that{" "}
          <em>breaks and days are part of the rate</em>, not decoration. That is why{" "}
          <Link href="/learn/are-lunch-breaks-paid">unpaid lunch</Link> shows up again on the live
          timer: the counter must pause for the same reason the divisor shrank.
        </p>
      </section>

      <section>
        <h2>How this page connects to the rest of the site</h2>
        <p>
          Use the <Link href="/hourly-rate-calculator">hourly rate calculator</Link> when you want
          the interactive conversion. Use the <Link href="/">salary timer homepage</Link> when you
          want that rate to drive a live counter. Use the{" "}
          <Link href="/salary-per-second">salary per second</Link> page when you want the same math
          sliced finer. Use the{" "}
          <Link href="/overtime-pay-calculator">overtime pay calculator</Link> when the question is
          an extra hour at 1.5×, not the base rate.
        </p>
        <p>
          For the product idea behind the live number, read{" "}
          <Link href="/learn/how-salary-timers-work">how salary timers work</Link>. The articles are
          here so those tools stay one topic — not five unrelated calculators.
        </p>
      </section>
    </LearnPage>
  );
}
