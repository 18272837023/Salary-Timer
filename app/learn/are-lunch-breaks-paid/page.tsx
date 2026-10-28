import type { Metadata } from "next";
import { Link } from "@/components/SmartLink";
import { LearnPage } from "@/components/LearnPage";
import type { FaqItem } from "@/components/sections";
import { learnSchemas } from "@/lib/schema";
import { getLearn } from "@/lib/site";

const article = getLearn("/learn/are-lunch-breaks-paid");

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
    q: "Are lunch breaks usually paid?",
    a: "In most salaried and hourly jobs in the US, UK, EU and similar markets, a meal break of 30 minutes or more is unpaid unless your contract says otherwise. Short rest breaks are more often paid — check your agreement.",
  },
  {
    q: "How much does an unpaid lunch change my rate?",
    a: "A 30-minute unpaid lunch on an otherwise 8.5-hour day removes about 6% of your paid hours. On a $60,000 salary that is roughly $3–4 per hour difference versus pretending lunch is paid.",
  },
  {
    q: "Should a salary timer keep running through lunch?",
    a: "Only if lunch is paid. If it is unpaid, the honest timer pauses — otherwise the live total and the implied rate are both inflated.",
  },
  {
    q: "What if my lunch is genuinely paid?",
    a: "Do not add it as an unpaid break. The timer will keep accruing through that window, which is the correct behaviour when the contract pays for it.",
  },
];

export default function AreLunchBreaksPaidPage() {
  return (
    <LearnPage
      article={article}
      h1={
        <>
          Are lunch breaks <span className="hl">paid</span>?
        </>
      }
      lede="Usually no — and that unpaid half hour is one of the main reasons a salary timer must pause. This page ties the break rule to the rate math used across the site."
      faq={faq}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(learnSchemas(article, faq)) }}
      />

      <section>
        <h2>The default assumption</h2>
        <p>
          Unless your contract or local law says otherwise, a meal break is time you are not being
          paid to work. That is why payroll systems clock you out for lunch, and why an honest
          salary timer should freeze the counter for the same window.
        </p>
        <p>
          Short rest breaks (coffee, stretch) are often paid. Meal breaks are the ones that usually
          are not. The only reliable source is your agreement — not a generic calculator that
          assumes 2,080 tidy hours and a lunch that somehow still counts as work.
        </p>
      </section>

      <section>
        <h2>Two places the same fact shows up</h2>
        <p>
          Unpaid lunch is not a UI nicety. It changes two linked numbers on this site:
        </p>
        <ul className="checks">
          <li>
            <strong>Your hourly rate</strong> — fewer paid hours per year means a different rate for
            the same salary. Covered in{" "}
            <Link href="/learn/hourly-rate-from-annual-salary">
              hourly rate from annual salary
            </Link>{" "}
            and the <Link href="/hourly-rate-calculator">hourly rate calculator</Link>.
          </li>
          <li>
            <strong>Today&apos;s live total</strong> — while you are on an unpaid break, accrued pay
            should stop. That is what the <Link href="/">live salary timer</Link> does
            when you add a break in Set my pay.
          </li>
        </ul>
        <p>
          If either side ignores the break, the story falls apart. A “live” number that climbs
          through unpaid lunch is not live — it is optimistic.
        </p>
      </section>

      <section>
        <h2>Why the pause matters in practice</h2>
        <p>
          If the counter keeps climbing through an unpaid lunch, two things go wrong at once:
          today&apos;s “earned” total is too high, and the implied hourly rate looks better than the
          rate you actually live. Over a year, half an hour a day is more than three full working
          weeks of fiction.
        </p>
        <p>
          That fiction shows up in bad decisions: staying late because the day “already paid well,”
          accepting a low overtime offer because the base rate looked healthier than it is, or
          comparing two jobs without aligning how lunch is treated.
        </p>
        <p>
          The product rule on this site is simple: breaks you mark as unpaid are unpaid. The status
          line says so. The big number holds still until paid time resumes. That is the same honesty
          described in <Link href="/learn/how-salary-timers-work">how salary timers work</Link>.
        </p>
      </section>

      <section>
        <h2>Paid lunch, unpaid lunch, and what to enter</h2>
        <ul className="checks">
          <li>
            <strong>Unpaid meal break</strong> — add it in the timer settings. The counter freezes
            for that window.
          </li>
          <li>
            <strong>Paid meal break</strong> — do not add it. The counter keeps running, matching
            the contract.
          </li>
          <li>
            <strong>Unsure</strong> — check the contract or handbook. Do not let a default 2,080
            calculator decide for you.
          </li>
        </ul>
        <p>
          Set it once on the <Link href="/">Salary Timer</Link>, then forget it until the
          schedule changes. The live timer, the rate math, and these Learn pages are meant to stay
          consistent on that one point: unpaid time does not earn.
        </p>
      </section>
    </LearnPage>
  );
}
