import type { Metadata } from "next";
import { Link } from "@/components/SmartLink";
import { ToolPage } from "@/components/ToolPage";
import type { FaqItem } from "@/components/sections";
import { toolSchemas } from "@/lib/schema";
import { getTool } from "@/lib/site";

const tool = getTool("/shift-worker-salary-timer");

export const metadata: Metadata = {
  title: tool.title,
  description: tool.description,
  alternates: { canonical: tool.href },
  openGraph: { title: tool.title, description: tool.description, url: tool.href },
};

const faq: FaqItem[] = [
  {
    q: "Does it work for night shifts that cross midnight?",
    a: "Yes. If the end time is earlier than the start time, the shift is treated as crossing midnight. A 22:00–06:00 shift is an eight-hour window, breaks at 02:00 land in the right place, and the countdown keeps counting toward 06:00 rather than resetting at 00:00.",
  },
  {
    q: "Can I set a 12-hour shift?",
    a: "Yes. Set the start and end times to span twelve hours — 07:00 to 19:00, or 19:00 to 07:00 for nights — and add any unpaid breaks. A 12-hour shift with a 30-minute unpaid break is 11.5 paid hours, which is what the hourly rate will be based on.",
  },
  {
    q: "How do I handle a rotating rota?",
    a: "Set the working days that match the current pattern, then change them when the rota changes. The hourly rate is recalculated immediately, because a 3-on-3-off pattern has a different annual hours total from a 5-day week — 2,093 versus 2,080 for 11.5 paid hours per shift.",
  },
  {
    q: "What about night shift differentials?",
    a: "There is no separate night-rate field, but the overtime multiplier can stand in for it: if nights pay 1.15× or 1.25×, set that multiplier. It will apply after clock-out rather than to the whole shift, so for an exact figure use your blended hourly rate instead.",
  },
  {
    q: "Why do shift workers need a different calculator?",
    a: "Because every standard calculator assumes a 9-to-5 with a lunch break in the middle. Shift work breaks all three assumptions: the shift can start at 19:00, cross midnight, run twelve hours, and have breaks at 02:30. A calculator that mishandles any of those produces a number that is wrong in a way you cannot see.",
  },
];

export default function ShiftWorkerPage() {
  return (
    <ToolPage
      tool={tool}
      h1={
        <>
          A salary timer for
          <br />
          <span className="hl">shift workers</span>, not office hours.
        </>
      }
      lede="Nights that cross midnight. Twelve-hour shifts. Three on, three off. Breaks at 2:30am. Every other salary calculator assumes a 9-to-5 with lunch at noon — this one assumes your actual rota."
      faq={faq}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(toolSchemas(tool, faq)) }}
      />

      <section>
        <h2>Why standard calculators fail shift workers</h2>
        <p>
          Most salary tools make three assumptions without saying so: the day starts and ends on the
          same calendar date, a shift is eight hours, and a break sits in the middle of it. Shift
          work breaks all three.
        </p>
        <p>
          The midnight crossover is the one that quietly ruins the maths. A 22:00–06:00 shift is
          eight hours long, but a naive calculator subtracts 22:00 from 06:00 and gets negative
          four. Some tools clamp that to zero. Some produce a daily rate of nothing. Either way, the
          number is wrong and nothing warns you.
        </p>
        <p>
          This calculator detects the crossover from the times themselves: if the end is earlier
          than the start, the window wraps past midnight. Breaks get the same treatment, so a 02:00
          lunch break is placed at hour four of the shift rather than at hour minus twenty.
        </p>
      </section>

      <section>
        <h2>The maths of a 12-hour rota</h2>
        <p>
          Take a typical 3-on-3-off pattern: twelve-hour shifts, three days on, three days off,
          which averages 3.5 shifts a week. With a 30-minute unpaid break each shift, that is 11.5
          paid hours per shift.
        </p>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Pattern</th>
                <th>Paid hours / shift</th>
                <th>Shifts / week</th>
                <th>Hours / year</th>
                <th>Rate at $60,000</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>5 days · 8h paid</td>
                <td>8.0</td>
                <td>5.0</td>
                <td>2,080</td>
                <td>$28.85</td>
              </tr>
              <tr>
                <td>3-on-3-off · 12h shift</td>
                <td>11.5</td>
                <td>3.5</td>
                <td>2,093</td>
                <td>$28.67</td>
              </tr>
              <tr>
                <td>4-on-4-off · 12h shift</td>
                <td>11.5</td>
                <td>3.5</td>
                <td>2,093</td>
                <td>$28.67</td>
              </tr>
              <tr>
                <td>5 days · 12h shift</td>
                <td>11.5</td>
                <td>5.0</td>
                <td>2,990</td>
                <td>$20.07</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p>
          The last row is the one that matters. A 12-hour shift five days a week is 57.5 paid hours —
          a $60,000 salary on that schedule is $20.07 an hour, not $28.85. Same money, 30% less per
          hour of your life. If you are on that pattern, you are almost certainly underpaid relative
          to a standard contract, and the number proves it in a way an annual salary never can.
        </p>
      </section>

      <section>
        <h2>Getting a rota right</h2>
        <ul className="checks">
          <li>
            <b>Enter the shift as it runs, not as it is rostered.</b> If you regularly stay 40 minutes
            for handover and it is unpaid, that is part of the picture — but it is unpaid, so it
            belongs in your head, not in the paid-hours total. Keep the timer honest.
          </li>
          <li>
            <b>Add every unpaid break.</b> Shift work tends to have several short ones rather than one
            long one. Two 15-minute breaks and a 30-minute meal break is an hour of unpaid time per
            shift — 3.5 hours a week on a 3.5-shift rota.
          </li>
          <li>
            <b>Turn on overtime for night differentials.</b> If your contract pays a premium after
            a certain hour, the overtime multiplier is the closest available approximation. For an
            exact figure, set your blended rate instead.
          </li>
          <li>
            <b>Update the working days when the rota flips.</b> This is the one field that changes the
            answer most, because it changes your annual hours.
          </li>
        </ul>
      </section>

      <section>
        <h2>What to watch on a long shift</h2>
        <p>
          On a twelve-hour shift the counter is not a novelty, it is a progress bar for the day. Two
          useful moments: halfway, which on an 11.5-hour paid shift arrives around hour six, and the
          last paid hour, which is when the finish line becomes visible and the temptation to stay
          late gets a price.
        </p>
        <p>
          If you are comparing two rotas — say 3-on-3-off against a 5-day week at the same salary —
          run both through the{" "}
          <Link href="/hourly-rate-calculator">hourly rate calculator</Link> before deciding. For the
          written overview, see the{" "}
          <Link href="/learn/salary-timer-for-shift-workers">shift work guide</Link>, or start from
          the <Link href="/">live salary timer</Link>.
        </p>
      </section>
    </ToolPage>
  );
}
