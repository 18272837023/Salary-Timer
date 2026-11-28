import type { Metadata } from "next";
import Image from "next/image";
import { Link } from "@/components/SmartLink";
import { ToolPage } from "@/components/ToolPage";
import { ToolExample } from "@/components/ToolExample";
import { SalaryStopwatch } from "@/components/SalaryStopwatch";
import type { FaqItem } from "@/lib/home-faq";
import { toolSchemas } from "@/lib/tool-schema";
import { OG_DEFAULTS, getTool } from "@/lib/site";

const tool = getTool("/salary-stopwatch");

export const metadata: Metadata = {
  title: { absolute: tool.title },
  description: tool.description,
  alternates: { canonical: tool.href },
  // Spread the defaults first: a page-level openGraph replaces the layout's
  // object wholesale, so setting only title/url here would drop the share image.
  openGraph: {
    ...OG_DEFAULTS,
    title: tool.title,
    description: tool.description,
    url: tool.href,
  },
};

const faq: FaqItem[] = [
  {
    q: "How does a salary stopwatch work?",
    a: "Enter your hourly rate, press Start when you begin working and Pause when you stop. The screen shows paid time and estimated gross earnings. A session of 47 minutes and 12 seconds at $25 an hour comes to $19.67.",
  },
  {
    q: "What is the difference between Pause and the break button?",
    a: "Both pause earnings. The salary stopwatch records unpaid time when you use the break button. At $25 an hour, a 15-minute break is $6.25 excluded from the session total. Use Pause when you need to freeze the display without adding to the break timer.",
  },
  {
    q: "Does the salary stopwatch save my sessions?",
    a: "No. The session and the log of finished sessions live in the page for as long as it is open, and reloading clears both. Nothing is written to storage and nothing is sent anywhere, so if you need a record for an invoice, note the figure down before you close the tab.",
  },
  {
    q: "How do I convert 00:47:12 into decimal hours?",
    a: "Divide the paid time on the salary stopwatch by 3,600 after converting it to seconds. 47 minutes and 12 seconds is 2,832 seconds, or about 0.787 hours. At $25 an hour that is $19.67 before any timesheet rounding.",
  },
  {
    q: "Can I leave it running all day?",
    a: "Yes. The salary stopwatch keeps counting while it is running. Pause or start an unpaid break when you step away. For a counter that follows a fixed work schedule, use the timer on the homepage.",
  },
];

export default function SalaryStopwatchPage() {
  return (
    <ToolPage
      tool={tool}
      hero={<SalaryStopwatch />}
      h1={
        <>
          Manual salary stopwatch
          <br />
          <span className="hl">Track one work session.</span>
        </>
      }
      lede="Set an hourly rate, then start, pause or resume the stopwatch to track paid time and estimated gross earnings for one work session. Reset to log the session and begin another."
      faq={faq}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(toolSchemas(tool, faq)) }}
      />

      <section>
        <h2>When to use a manual salary stopwatch</h2>
        <p>
          Manual timing works well for tasks with an unpredictable start and finish. It gives you
          the gross value of one work session, independent of any schedule saved elsewhere.
        </p>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>&nbsp;</th>
                <th>The homepage timer</th>
                <th>The salary stopwatch</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">Starts counting</th>
                <td>by itself, at your saved shift start</td>
                <td>when you press Start</td>
              </tr>
              <tr>
                <th scope="row">Stops</th>
                <td>at shift end, and during breaks you scheduled</td>
                <td>when you press Pause or take a break</td>
              </tr>
              <tr>
                <th scope="row">Good for</th>
                <td>a fixed rota you work every week</td>
                <td>sessions you start and stop by hand</td>
              </tr>
              <tr>
                <th scope="row">Keeps</th>
                <td>today&rsquo;s total for that schedule</td>
                <td>this visit only</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p>
          For irregular work such as a client call or a weekend task, start the salary stopwatch when
          the paid session begins and pause it when you stop.
        </p>
        <p>
          The other case is a fixed shift, and for that the{" "}
          <Link href="/">live salary timer</Link> on the homepage is better: it already knows when
          you clock in, pauses for your unpaid lunch and carries the day&rsquo;s total. Starting a
          stopwatch by hand every morning only adds a step you could forget.
        </p>
      </section>

      <section>
        <h2>How to time one paid work session</h2>
        <ToolExample title="Salary stopwatch example at $25 an hour">
          <Image
            src="/salary-stopwatch-session.webp"
            width={820}
            height={394}
            loading="lazy"
            alt="The paused Salary Stopwatch shows 45 minutes of paid time, $18.75 in gross earnings, and a 15-minute unpaid break."
          />
          <p>
            Start the session, work 30 minutes, and use Unpaid break for a 15-minute break.
            Resume for 15 minutes, then Pause. The stopwatch shows 45 minutes of paid time
            and $18.75 gross. Press Reset to add the session to the log.
          </p>
        </ToolExample>
        <p>
          The salary stopwatch keeps all four main controls in place. A disabled button
          indicates that the action is unavailable in the current session state.
        </p>
        <ul className="checks">
          <li>
            <b>Start.</b> Begins the session from zero. It is the only control that works while the
            watch is idle, which is why it looks different from the rest.
          </li>
          <li>
            <b>Pause.</b> Stops the clock and keeps the total. Everything accumulated so far stays on
            screen; nothing is added while it is paused.
          </li>
          <li>
            <b>Resume.</b> Carries on from the paused total rather than restarting. A session can be
            paused and resumed as many times as the work demands.
          </li>
          <li>
            <b>Reset.</b> Ends the session and clears the clock. The salary stopwatch logs
            sessions of at least one second when you have entered a positive hourly rate.
          </li>
        </ul>
        <p>
          The dashed button underneath is the unpaid break. It stops the clock like Pause does, but
          records the time as break so the card can tell you what the break cost.
        </p>
      </section>

      <section>
        <h2>When to use Pause or Unpaid break</h2>
        <p>
          Use Pause to hold the paid total. Use Unpaid break when you also want the salary
          stopwatch to show how long you were on break. Both modes stop earnings immediately.
        </p>
        <p>
          At $25 an hour, a 15-minute unpaid break excludes $6.25 from gross earnings. To report
          a full hour of elapsed time with that break, use the result of 45 paid
          minutes and record the break separately.
        </p>
        <p>
          For anyone billing a client, the distinction is not cosmetic either: an unpaid break inside
          a session is time you cannot invoice, and it is the first thing a client will query if the
          hours look long.
        </p>
      </section>

      <section>
        <h2>How to convert stopwatch time to decimal hours</h2>
        <p>
          If your timesheet expects decimal hours, convert the paid duration from the salary
          stopwatch before copying it. <b>0.1 of an hour is 6 minutes.</b> One hour and ten
          minutes is about 1.17 decimal hours.
        </p>

        <div className="table-wrap fit">
          <table>
            <thead>
              <tr>
                <th>Minutes</th>
                <th>Decimal hours</th>
                <th>At $25/hour</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>6</td>
                <td>0.10</td>
                <td>$2.50</td>
              </tr>
              <tr>
                <td>12</td>
                <td>0.20</td>
                <td>$5.00</td>
              </tr>
              <tr>
                <td>15</td>
                <td>0.25</td>
                <td>$6.25</td>
              </tr>
              <tr>
                <td>18</td>
                <td>0.30</td>
                <td>$7.50</td>
              </tr>
              <tr>
                <td>24</td>
                <td>0.40</td>
                <td>$10.00</td>
              </tr>
              <tr>
                <td>30</td>
                <td>0.50</td>
                <td>$12.50</td>
              </tr>
              <tr>
                <td>45</td>
                <td>0.75</td>
                <td>$18.75</td>
              </tr>
              <tr>
                <td>60</td>
                <td>1.00</td>
                <td>$25.00</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p>
          Divide seconds by 3,600. The stopwatch displays the clock reading and estimates
          earnings from the paid duration. For 2,832 seconds at $25 an hour, writing 0.8 hours
          instead of using the unrounded duration would increase the estimate by about 33 cents.
        </p>
      </section>

      <section>
        <h2>Where to go next</h2>
        <p>
          The salary stopwatch needs one number to work: your hourly rate. If you only know your salary,
          the <Link href="/hourly-rate-calculator">hourly rate calculator</Link> turns annual,
          monthly or weekly pay into the rate behind it, using the hours you actually work rather
          than the 2,080-hour standard.
        </p>
        <p>
          If what you need is not one session but a week of them — seven rows of clock-in and
          clock-out, a break on each, and a total that splits regular hours from overtime — the{" "}
          <Link href="/time-card-calculator">time card calculator</Link> is the instrument for that.
          Use the weekly card when you need an itemized record of multiple shifts.
        </p>
        <p>
          And if the session you are timing is one of many across a fixed week, the live salary timer
          on the homepage will carry the running total for you instead of asking you to press
          anything.
        </p>
      </section>
    </ToolPage>
  );
}
