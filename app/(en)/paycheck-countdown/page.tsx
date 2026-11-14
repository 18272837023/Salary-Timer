import type { Metadata } from "next";
import { Link } from "@/components/SmartLink";
import { ToolPage } from "@/components/ToolPage";
import type { FaqItem } from "@/components/sections";
import { toolSchemas } from "@/lib/schema";
import { getTool } from "@/lib/site";

const tool = getTool("/paycheck-countdown");
export const metadata: Metadata = {
  title: tool.title, description: tool.description,
  alternates: { canonical: tool.href },
  openGraph: { title: tool.title, description: tool.description, url: tool.href },
};
const faq: FaqItem[] = [
  { q: "How do I count the days until payday?", a: "Open Set my salary, choose the day of the month you are paid, and save. The timer shows calendar days until the next occurrence, including weekends. Your browser's local date is used; payday itself shows zero days remaining." },
  { q: "What happens when payday is the last day of the month?", a: "Choose the last-day option. The countdown uses the actual final date of each month. A numbered payday such as the 31st is also limited to the final date in a shorter month." },
  { q: "Does it support weekly or biweekly pay schedules?", a: "The automatic schedule is monthly. You can enter the day number of your next actual pay date as a temporary target and update it afterward, but the tool does not automatically repeat a weekly, biweekly or semimonthly schedule." },
  { q: "Does it calculate shifts or working hours until payday?", a: "No. The payday countdown displays calendar days. Shift progress and earnings are separate features; weekends and holidays are not removed from the payday day count." },
  { q: "Will it tell me when my bank deposit arrives?", a: "No. It estimates the distance to the pay date you enter. It does not connect to your employer or bank, predict a deposit time, or automatically adjust for holidays and weekend payroll changes." },
];
export default function PaycheckCountdownPage() {
  return <ToolPage tool={tool} h1={<>Paycheck countdown:<br /><span className="hl">days until payday.</span></>}
    lede="Set your monthly payday to see how many calendar days remain. Track estimated earnings alongside the countdown, with no account required." faq={faq}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(toolSchemas(tool, faq)) }} />
    <section>
      <h2>How to set your payday countdown</h2>
      <ol className="checks">
        <li>Open <b>Set my salary</b> in the timer above.</li>
        <li>Choose your monthly payday, or the last day of the month, then save.</li>
        <li>Read the days remaining in the timer summary. On the selected date, it shows payday today.</li>
      </ol>
      <p>Use the date your employer has confirmed. If a weekend or holiday changes that date, update the setting yourself. The counter does not check bank processing times.</p>
    </section>
    <section>
      <h2>Example: nine calendar days until payday</h2>
      <p>If today is November 6 and your payday is November 15, the countdown shows 9 days. It includes Saturdays and Sundays. On November 15, it shows payday today; on November 16, it targets December 15.</p>
      <p>The number of shifts within those nine days depends on your actual rota. The countdown does not calculate that number or convert it into remaining paid hours.</p>
    </section>
    <section>
      <h2>Payday and pay period are different</h2>
      <p>A pay period describes the work covered by a paycheck. Payday is the date that paycheck is scheduled to be paid. Your live earnings estimate may cover different dates from your next paycheck, and excludes taxes and deductions.</p>
      <p>Read <Link href="/learn/how-pay-periods-work/">how pay periods work</Link> or <Link href="/learn/why-is-my-first-paycheck-smaller/">why a first paycheck can be smaller</Link> to understand that gap.</p>
    </section>
    <section>
      <h2>Track earnings while you wait</h2>
      <p>The <Link href="/">live salary timer</Link> estimates gross earnings during your configured paid working hours. Use the <Link href="/hourly-rate-calculator/">hourly rate calculator</Link> to check the rate, or <Link href="/salary-per-second/">calculate salary per second</Link> to see the smaller units. These estimates do not predict your bank balance or replace a payslip.</p>
    </section>
  </ToolPage>;
}
