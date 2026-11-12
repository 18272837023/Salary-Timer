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
    "q": "Is a 12-hour shift paid as 12 hours?",
    "a": "It depends on genuinely unpaid breaks and applicable law. A 12-hour window with a 30-minute duty-free unpaid meal is 11.5 paid hours. Required handovers and travel between sites during the workday can be compensable and should not be subtracted automatically."
  },
  {
    "q": "Is three 12-hour shifts better than five eight-hour shifts?",
    "a": "With the same annual salary, three shifts of 11.5 paid hours give 34.5 paid hours a week versus 40. The annualized hourly equivalent is about 16% higher. Actual pay, overtime rules and working conditions also matter."
  },
  {
    "q": "Do 12-hour shifts trigger overtime?",
    "a": "Under the general US federal FLSA rule for covered, nonexempt workers, the threshold is over 40 hours worked in a workweek. Daily thresholds under state law and special statutory arrangements may differ. Shift length alone does not establish entitlement."
  },
  {
    "q": "How should I enter a 12-hour shift?",
    "a": "Enter the full start and end times, then add only genuinely unpaid breaks. Keep required paid duties inside the paid window. The timer models your inputs and does not determine the legal status of each activity."
  }
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
      lede="Calculate paid shift hours by subtracting genuinely unpaid breaks once. Required handovers and workday travel may be paid work under the applicable rules."
      faq={faq}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(learnSchemas(article, faq)) }}
      />

      <section>
        <h2>Worked example: 12 hours minus a 30-minute unpaid meal</h2>
        <p>Assume a 12-hour attendance window with one genuinely unpaid, duty-free
          30-minute meal. All other time, including any required handover inside that
          window, is paid. The result is 11.5 paid hours, not 11.25.</p>
        <div className="table-wrap"><table>
          <thead><tr><th>Component</th><th>Hours</th></tr></thead>
          <tbody>
            <tr><td>Full shift window</td><td>12</td></tr>
            <tr><td>Duty-free unpaid meal</td><td>−0.5</td></tr>
            <tr><td>Paid shift time</td><td>11.5</td></tr>
          </tbody>
        </table></div>
        <p>Under US federal hours-worked rules, required duties and travel between
          sites during the workday can be compensable. An employer labelling a handover
          unpaid does not by itself make that deduction lawful. See the official
          hours-worked source below.</p>
      </section>
      <section>
        <h2>Compare schedules on the same $60,000 salary</h2>
        <p>These examples repeat the stated paid week 52 times. The salary is fixed;
          no additional overtime premium is included in the figures.</p>
        <div className="table-wrap"><table>
          <thead><tr><th>Schedule</th><th>Paid hours / week</th><th>Annualized hours</th><th>Hourly equivalent</th></tr></thead>
          <tbody>
            <tr><td>3 × 12-hour windows, 30-minute unpaid meal each</td><td>34.5</td><td>1,794</td><td>$33.44</td></tr>
            <tr><td>5 × 8 paid hours</td><td>40</td><td>2,080</td><td>$28.85</td></tr>
            <tr><td>4 × 12-hour windows, 30-minute unpaid meal each</td><td>46</td><td>2,392</td><td>$25.08</td></tr>
          </tbody>
        </table></div>
        <p>For an hourly-paid worker, compare actual rates and qualifying overtime
          separately. A 46-hour worked week exceeds the general federal 40-hour threshold
          for covered, nonexempt workers; state rules may provide additional protections.
          Read <Link href="/learn/how-overtime-is-calculated">how overtime is calculated</Link>.</p>
      </section>
      <section>
        <h2>Set up the timer without subtracting paid duties</h2>
        <p>Enter the whole shift window and add only genuinely unpaid breaks.
          If a handover extends beyond the scheduled end, include that required time
          when evaluating your pay rather than silently dropping it.</p>
        <p>The <Link href="/shift-worker-salary-timer">shift worker timer</Link>
          supports a shift crossing midnight and multiple break windows. It uses your
          inputs; it does not determine legal overtime thresholds or automatically
          apply a separate night differential.</p>
        <p>Continue with <Link href="/learn/are-lunch-breaks-paid">meal and rest breaks</Link>,
          <Link href="/learn/night-shift-pay"> night shift pay</Link>,
          <Link href="/learn/salary-timer-for-shift-workers"> the shift work guide</Link> or
          <Link href="/learn/paid-time"> the paid-time topic</Link>.</p>
      </section>
    </LearnPage>
  );
}
