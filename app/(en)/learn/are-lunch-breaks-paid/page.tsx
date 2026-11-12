import type { Metadata } from "next";
import { Link } from "@/components/SmartLink";
import { LearnPage } from "@/components/LearnPage";
import { learnSchemas } from "@/lib/schema";
import { getLearn } from "@/lib/site";

const article = getLearn("/learn/are-lunch-breaks-paid");

export const metadata: Metadata = {
  title: article.title,
  description: article.description,
  alternates: { canonical: article.href },
  openGraph: { title: article.title, description: article.description, url: article.href },
};

const faq = [
  {
    "q": "Are lunch breaks paid?",
    "a": "It depends on the jurisdiction and the break. Under US federal FLSA rules, a bona fide meal period is generally unpaid only when the employee is completely relieved of duties; short rest breaks are generally paid. In the UK, whether a rest break is paid depends on the employment contract."
  },
  {
    "q": "How much does a 30-minute unpaid lunch change my estimated hourly rate?",
    "a": "At $60,000 a year, five 8.5-hour shifts a week and 52 weeks, counting the whole shift gives $27.15 per hour. Subtracting a 30-minute unpaid lunch gives 40 paid hours a week and $28.85 per hour: a difference of about $1.70."
  },
  {
    "q": "Does an unpaid lunch make the 2,080-hour divisor wrong?",
    "a": "Not by itself. An 8.5-hour shift minus a 30-minute unpaid lunch is eight paid hours. Five such days a week, multiplied by 52, is exactly 2,080 hours."
  },
  {
    "q": "Should the timer pause for a paid break?",
    "a": "No. Add only genuinely unpaid breaks to the timer. Leave paid rest breaks inside the paid window. The timer follows your inputs; it does not decide which breaks legally qualify as unpaid."
  }
];

export default function Page() {
  return (
    <LearnPage article={article} h1="Are lunch breaks paid?"
      lede="Break pay depends on the applicable law, your duties during the break and your agreement. Here is how to check the rule and model a genuinely unpaid break." faq={faq}>
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(learnSchemas(article, faq)) }} />

      <section>
        <h2>Check the rule before subtracting a break</h2>
        <p>For workers covered by US federal FLSA hours-worked rules, short rest breaks
          of about 5–20 minutes generally count as working time. A bona fide meal period,
          typically 30 minutes or more, generally does not count only when the employee is
          completely relieved of duties. Answering work calls or performing required tasks
          during lunch can change the answer.</p>
        <p>These are US federal rules, not a worldwide standard. State rules may provide
          additional protections. In the UK, the right to a rest break and whether it is paid
          are separate questions: payment depends on the employment contract. See the official
          sources below for each jurisdiction.</p>
      </section>
      <section>
        <h2>Worked example: the difference is $1.70 per hour</h2>
        <p>Assume $60,000 gross annual pay, five 09:00–17:30 shifts per week and a
          52-week annualization. Keep pay and shift length fixed; change only whether the
          30-minute lunch is paid.</p>
        <div className="table-wrap"><table>
          <thead><tr><th>Lunch assumption</th><th>Paid hours / week</th><th>Annual hours</th><th>Estimated hourly rate</th></tr></thead>
          <tbody>
            <tr><td>Paid: full 8.5-hour shift</td><td>42.5</td><td>2,210</td><td>$27.15</td></tr>
            <tr><td>Unpaid: 8 paid hours</td><td>40</td><td>2,080</td><td>$28.85</td></tr>
          </tbody>
        </table></div>
        <p>The unrounded difference is about $1.6968, displayed as $1.70 per hour.
          Removing an unpaid break reduces the denominator, so the equivalent hourly rate
          rises when annual salary is held fixed. It does not increase annual salary.</p>
      </section>
      <section>
        <h2>How to represent your break in Salary Timer</h2>
        <ul className="checks">
          <li><strong>Unpaid break:</strong> add the break window in the pay settings.
            The counter pauses in that window and the annualized rate uses the remaining hours.</li>
          <li><strong>Paid break:</strong> leave it inside the paid shift window.</li>
          <li><strong>Uncertain status:</strong> check applicable law and the actual duties
            required during the break, as well as your agreement. A contract label alone
            does not remove a statutory entitlement.</li>
        </ul>
        <p>Use the <Link href="/">salary timer</Link> after checking those inputs.
          For the divisor, read <Link href="/learn/hourly-rate-from-annual-salary">hourly rate from annual salary</Link>.
          For related working-time questions, see <Link href="/learn/paid-time">what counts as paid time</Link>.</p>
      </section>
    </LearnPage>
  );
}
