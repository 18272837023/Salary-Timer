import type { Metadata } from "next";
import { Link } from "@/components/SmartLink";
import { LearnPage } from "@/components/LearnPage";
import type { FaqItem } from "@/components/sections";
import { learnSchemas } from "@/lib/schema";
import { getLearn } from "@/lib/site";

const article = getLearn("/learn/twelve-hour-shift-pay");

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
    q: "Is a 12-hour shift paid as 12 hours?",
    a: "Rarely. Unpaid meal breaks, handover time and travel between sites all come out of it. A 12-hour shift with a 30-minute unpaid break and a 15-minute unpaid handover is 11.25 paid hours — and on three shifts a week that 0.75-hour gap is 117 hours a year.",
  },
  {
    q: "Is 3×12 better than 5×8?",
    a: "Per hour, usually yes. Three 12-hour shifts at 11.25 paid hours is 33.75 paid hours a week, so the same salary buys fewer hours and the hourly rate is roughly 19% higher. Per month, it depends on what your salary is based on — check whether your contract pays for 36 hours or 40.",
  },
  {
    q: "Do 12-hour shifts trigger overtime?",
    a: "Not automatically. In most places overtime starts after 40 hours in a workweek, so three 12-hour shifts at 36 hours earns none. Four 12-hour shifts at 45 paid hours does. Some jurisdictions use a daily threshold instead, which changes the answer entirely.",
  },
  {
    q: "Should a salary timer treat a 12-hour shift differently?",
    a: "Yes — it should use your paid hours, not the shift length, and it should pause for unpaid breaks. Otherwise the live counter runs 45 minutes ahead of reality on every shift, which is exactly the kind of optimism this site exists to remove.",
  },
];

export default function TwelveHourShiftPayPage() {
  return (
    <LearnPage
      article={article}
      h1={
        <>
          12-hour shift pay — how many of those hours are <span className="hl">paid</span>.
        </>
      }
      lede="A 12-hour shift is a real thing you do. It is almost never 12 paid hours. The gap is small enough to ignore per shift and large enough to matter per year."
      faq={faq}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(learnSchemas(article, faq)) }}
      />

      <section>
        <h2>Twelve hours on the clock, fewer on the payslip</h2>
        <p>
          Long shifts are where the difference between <em>time at work</em> and <em>paid time</em>
          stops being a technicality. A 12-hour shift typically contains three things that are not
          paid work: a meal break, a handover, and whatever time it takes to get from one site to
          another.
        </p>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Component</th>
                <th>Minutes</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Shift length</td>
                <td>720</td>
              </tr>
              <tr>
                <td>Unpaid meal break</td>
                <td>−30</td>
              </tr>
              <tr>
                <td>Unpaid handover</td>
                <td>−15</td>
              </tr>
              <tr>
                <td>Paid hours</td>
                <td>675 (11.25 h)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3>Handover is the one nobody records</h3>
        <p>
          Fifteen minutes briefing the next person is genuinely work — arguably the most
          consequential part of the day in a care or production setting — and it is routinely
          unrecorded. Across three shifts a week that is 39 hours a year; across five, 65.
        </p>

        <h3>Unpaid breaks scale with shift length</h3>
        <p>
          A 30-minute break on an 8-hour shift removes 6% of the day. The same 30 minutes on a
          12-hour shift removes 4% — so longer shifts are proportionally <em>less</em> damaged by
          breaks. This is one of the few places where the 12-hour pattern genuinely wins.
        </p>
      </section>

      <section>
        <h2>Three 12s versus five 8s</h2>
        <p>
          The interesting comparison is not daily, it is weekly. Three 12-hour shifts at 11.25 paid
          hours each is 33.75 paid hours — noticeably less than a standard 40-hour week. Run the same
          $60,000 through three patterns:
        </p>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Pattern</th>
                <th>Paid h / week</th>
                <th>Annual hours</th>
                <th>Rate at $60,000</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>3 × 12 h (11.25 paid)</td>
                <td>33.75</td>
                <td>1,755</td>
                <td>$34.19</td>
              </tr>
              <tr>
                <td>5 × 8 h (8 paid)</td>
                <td>40.00</td>
                <td>2,080</td>
                <td>$28.85</td>
              </tr>
              <tr>
                <td>4 × 12 h (11.25 paid)</td>
                <td>45.00</td>
                <td>2,340</td>
                <td>$25.64</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p>
          The three-shift worker earns 19% more per hour than the five-shift worker for identical
          annual pay — because the same money buys 325 fewer hours. That is the entire argument for
          compressed schedules, and it only becomes visible once the unpaid hour is subtracted.
        </p>
        <p>
          The four-shift pattern runs the other way: 45 paid hours a week is 12.5% more hours than
          standard, so the rate drops. If that fourth shift is meant to be overtime, it should be
          paid as overtime — see{" "}
          <Link href="/learn/how-overtime-is-calculated">how overtime is calculated</Link>.
        </p>
      </section>

      <section>
        <h2>Where a 12-hour shift breaks a calculator</h2>
        <p>
          Two things go wrong specifically on long shifts. The first is that the shift may cross
          midnight — a 19:00–07:00 shift starts on one calendar day and ends on the next, which naive
          date arithmetic reads as negative hours. The second is that the break may be split into two
          shorter unpaid windows rather than one, which a single-break field cannot represent.
        </p>
        <p>
          Both are handled in the <Link href="/shift-worker-salary-timer">shift worker salary timer</Link>
          , and the reasoning behind the design is in{" "}
          <Link href="/learn/salary-timer-for-shift-workers">the shift work guide</Link>.
        </p>

        <h3>Nights make the gap more expensive</h3>
        <p>
          If the shift is also a night shift, the unpaid hour is an unpaid hour at the <em>premium</em>{" "}
          rate, not the base rate. Losing 45 minutes of a shift that pays 15% more costs 15% more than
          losing 45 minutes of a day shift. That interaction is covered in{" "}
          <Link href="/learn/night-shift-pay">night shift pay</Link>.
        </p>
      </section>

      <section>
        <h2>What to do with this</h2>
        <p>
          The practical step is small: find out your paid hours per shift, not your shift length. Ask
          whether the handover is paid, whether the meal break is unpaid, and whether travel between
          sites counts. Those three answers decide your real rate more than any raise you are likely
          to negotiate this year.
        </p>
        <p>
          Then put the paid figure into the timer rather than the shift length, so the live counter
          matches the payslip. The full topic is{" "}
          <Link href="/learn/paid-time">what counts as paid time</Link>; the break question on its own
          is in <Link href="/learn/are-lunch-breaks-paid">are lunch breaks paid</Link>.
        </p>
      </section>
    </LearnPage>
  );
}
