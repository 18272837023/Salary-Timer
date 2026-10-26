import type { Metadata } from "next";
import { Link } from "@/components/SmartLink";
import { LearnPage } from "@/components/LearnPage";
import type { FaqItem } from "@/components/sections";
import { learnSchemas } from "@/lib/schema";
import { getLearn } from "@/lib/site";

const article = getLearn("/learn/salary-timer-for-shift-workers");

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
    q: "Why do normal salary calculators fail on night shifts?",
    a: "They assume the day ends before midnight. A 22:00–06:00 shift wraps past 00:00; a calculator that only looks at clock time on a single calendar day will undercount or mis-order breaks.",
  },
  {
    q: "Can a salary timer handle rotating rotas?",
    a: "Yes, if you can set working days and shift times per pattern. Update the schedule when the rota changes; the rate and live counter follow the new window.",
  },
  {
    q: "What about night differentials and overtime?",
    a: "Model the differential as a higher hourly rate or an overtime multiplier after clock-out. The important part is that the timer knows when paid time ends and when the higher rate starts.",
  },
  {
    q: "Should I use the homepage timer or the shift worker tool?",
    a: "Same math. The shift worker page emphasises overnight and rota setups; the homepage timer is the main live product. Use whichever entry fits — then keep one schedule saved.",
  },
];

export default function SalaryTimerForShiftWorkersLearnPage() {
  return (
    <LearnPage
      article={article}
      h1={
        <>
          Shift work guide:
          <br />
          nights, rotas and <span className="hl">cross-midnight</span> pay.
        </>
      }
      lede="Office-hour math breaks on night shifts. This guide explains what any salary timer on this site must get right — then sends you to the live tools, not the other way around."
      faq={faq}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(learnSchemas(article, faq)) }}
      />

      <section>
        <h2>What “shift work” breaks in a normal calculator</h2>
        <p>
          Cross-midnight shifts, unpaid breaks at odd hours, rotating days off, and overtime that
          starts after a 12-hour block — none of that fits “÷ 2,080 and hope”. A timer built only
          for offices will either ignore the overnight wrap or count the wrong break.
        </p>
        <p>
          The fix is the same schedule-first idea used everywhere on this site: define the shift
          window (even if it crosses midnight), subtract unpaid breaks inside that window, then
          accrue pay only while you are in paid time. That is{" "}
          <Link href="/learn/how-salary-timers-work">how salary timers work</Link> in general; shift
          work just stresses the edges.
        </p>
      </section>

      <section>
        <h2>Cross-midnight is a window, not two days</h2>
        <p>
          A 22:00–06:00 shift is eight clock hours that happen to sit on two calendar dates. For
          pay math it is one window. Breaks at 02:00 belong inside that window. A countdown to
          clock-out should aim at 06:00, not reset at midnight.
        </p>
        <p>
          If software splits the night into “Tuesday evening” and “Wednesday morning” without
          stitching them, your live total and your rate both wobble. The{" "}
          <Link href="/shift-worker-salary-timer">shift worker salary timer</Link> is the entry
          point that calls that out; the <Link href="/">homepage salary timer</Link> uses the same
          underlying rules when you set an overnight start and end.
        </p>
      </section>

      <section>
        <h2>Rotas change the divisor, not the salary</h2>
        <p>
          A 3-on-3-off pattern and a five-day week at the same annual pay are not the same hourly
          rate. Annual hours change when the pattern of working days changes. That is the same
          lesson as{" "}
          <Link href="/learn/hourly-rate-from-annual-salary">
            hourly rate from annual salary
          </Link>
          — only the calendar looks stranger.
        </p>
        <p>
          Practical rule: when the rota flips, update working days once. Do not reinvent the
          salary. Let the rate recalculate, then let the live counter follow the new paid windows.
        </p>
      </section>

      <section>
        <h2>Breaks and overtime still mean the same things</h2>
        <ul className="checks">
          <li>
            Unpaid breaks still pause the counter — including a meal at 02:30. See{" "}
            <Link href="/learn/are-lunch-breaks-paid">are lunch breaks paid?</Link>
          </li>
          <li>
            Overtime after a long block still needs an explicit multiplier. The{" "}
            <Link href="/overtime-pay-calculator">overtime pay calculator</Link> is the focused
            tool; the timer can keep counting after clock-out when you enable it.
          </li>
          <li>
            Night differentials can be modelled as a higher base rate or as overtime after the
            standard window — pick one story and stick to it so the live number stays interpretable.
          </li>
        </ul>
      </section>

      <section>
        <h2>Where to go next on this site</h2>
        <p>
          This article is a map, not the product. For the live counter, use the{" "}
          <Link href="/shift-worker-salary-timer">shift worker salary timer</Link> or the{" "}
          <Link href="/">salary timer homepage</Link>. For base-rate checks across two rotas, use
          the <Link href="/hourly-rate-calculator">hourly rate calculator</Link>. For the general
          product idea, keep{" "}
          <Link href="/learn/how-salary-timers-work">how salary timers work</Link> nearby.
        </p>
        <p>
          The point of Learn is the same as the point of the tools: one coherent topic — what an
          hour of work is worth, counted honestly, including at 3am.
        </p>
      </section>
    </LearnPage>
  );
}
