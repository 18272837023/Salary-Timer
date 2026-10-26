import type { Metadata } from "next";
import { Link } from "@/components/SmartLink";
import { LearnPage } from "@/components/LearnPage";
import type { FaqItem } from "@/components/sections";
import { learnSchemas } from "@/lib/schema";
import { getLearn } from "@/lib/site";

const article = getLearn("/learn/how-salary-timers-work");

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
    q: "Is a salary timer the same as a timesheet?",
    a: "No. A timesheet records hours for payroll. A salary timer converts those hours into money as they pass, so you can feel the value of a meeting or a late shift while it is still happening.",
  },
  {
    q: "Does it replace my payslip?",
    a: "No. It is a gross-pay estimate: useful for motivation and decisions, not for tax, pension or deductions. Treat it as “what I earned before deductions”.",
  },
  {
    q: "Why does the number stop during lunch?",
    a: "Because most lunch breaks are unpaid. A timer that keeps climbing through an unpaid break inflates your rate and lies about the hour you are living through.",
  },
  {
    q: "What do I need to enter before it can run?",
    a: "Pay amount (yearly, monthly or hourly), currency, working days, shift start and end, and any unpaid breaks. Overtime rules are optional. Once those are set, the live counter follows the schedule.",
  },
];

export default function HowSalaryTimersWorkPage() {
  return (
    <LearnPage
      article={article}
      h1={
        <>
          How salary timers <span className="hl">work</span>.
        </>
      }
      lede="A salary timer turns your schedule into a live counter. This page explains the idea and the math — so the free tool on the homepage is not a black box."
      faq={faq}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(learnSchemas(article, faq)) }}
      />

      <section>
        <h2>The short version</h2>
        <p>
          You tell the timer what you earn and when you work. It derives a real hourly rate from
          that schedule, then multiplies elapsed <em>paid</em> time by that rate. The result is a
          number that moves every second you are on the clock — and pauses when you are not.
        </p>
        <p>
          That is different from a static calculator. A calculator answers “what is my rate?” once.
          A timer answers “what has this hour cost so far?” while you are still in it. That is why
          the product on this site is a <Link href="/">live salary timer</Link>, not only a form
          that prints a single figure.
        </p>
      </section>

      <section>
        <h2>Two numbers, one schedule</h2>
        <p>
          Every honest salary timer is really doing two jobs. First it turns your pay and your real
          hours into an hourly rate. Then it accrues that rate only inside paid windows of the day.
        </p>
        <p className="formula">
          earned so far = hourly rate × paid minutes elapsed ÷ 60
        </p>
        <p>
          If the hourly rate is wrong, the live total is wrong in a smooth, convincing way. That is
          why this site insists on schedule-first math: working days, shift start and end, unpaid
          breaks, optional overtime — the same inputs behind the{" "}
          <Link href="/hourly-rate-calculator">hourly rate calculator</Link> and the homepage timer.
        </p>
        <p>
          A 09:00–17:30 day with a 30-minute unpaid lunch is not 8.5 paid hours. It is 8. Over a
          year that half hour is more than three working weeks. Pretend lunch is paid and both your
          rate and your “earned today” number drift upward for free.
        </p>
      </section>

      <section>
        <h2>What the live counter is allowed to do</h2>
        <ul className="checks">
          <li>
            <strong>Before the shift</strong> — show zero (or a countdown). You have not started
            paid work yet.
          </li>
          <li>
            <strong>During paid time</strong> — climb continuously. Meetings, Slack, and “quick
            syncs” all share the same meter.
          </li>
          <li>
            <strong>During an unpaid break</strong> — freeze. See{" "}
            <Link href="/learn/are-lunch-breaks-paid">are lunch breaks paid?</Link> for why that
            pause is the honest behaviour.
          </li>
          <li>
            <strong>After clock-out</strong> — either stop, or keep going at an overtime multiplier
            if you turned that on. The{" "}
            <Link href="/overtime-pay-calculator">overtime pay calculator</Link> is the focused
            version of that idea.
          </li>
        </ul>
        <p>
          Night shifts that cross midnight follow the same rules; they just need a shift window that
          wraps past 00:00. That edge case is covered in the{" "}
          <Link href="/learn/salary-timer-for-shift-workers">shift work guide</Link> and the{" "}
          <Link href="/shift-worker-salary-timer">shift worker salary timer</Link>.
        </p>
      </section>

      <section>
        <h2>Timer versus calculator versus payslip</h2>
        <p>
          People often mix three tools that answer different questions:
        </p>
        <ul className="checks">
          <li>
            <strong>Calculator</strong> — “What is my rate?” Useful once, when you change jobs or
            hours. Then you mostly leave it alone.
          </li>
          <li>
            <strong>Salary timer</strong> — “What is this hour worth while I am in it?” Useful every
            working day. That is the homepage product.
          </li>
          <li>
            <strong>Payslip</strong> — “What hit my bank after tax?” Authoritative for money in the
            account; useless for feeling a Tuesday afternoon.
          </li>
        </ul>
        <p>
          This site is built around the middle one. The calculators exist so the rate feeding the
          timer is not a fantasy. The Learn articles exist so those ideas stay connected — not so
          they replace the live counter.
        </p>
      </section>

      <section>
        <h2>Why people leave the tab open</h2>
        <p>
          Money and time are both hard to feel. A payslip arrives as one number after thirty days of
          effort. A live counter makes a meeting, a late finish, or a Saturday cover request
          measurable while you can still say no.
        </p>
        <p>
          That is the whole product thesis: shorten the gap between effort and reward. Everything
          else — per-second figures,{" "}
          <Link href="/paycheck-countdown">paycheck countdown</Link>, savings jar priced in hours —
          is a way of keeping that gap visible.
        </p>
        <p>
          When you are ready, open the <Link href="/">free salary timer</Link> on the homepage, set
          your pay once, and let the number run during paid time only.
        </p>
      </section>
    </LearnPage>
  );
}
