import type { Metadata } from "next";
import { Link } from "@/components/SmartLink";
import { ToolPage } from "@/components/ToolPage";
import { SalaryStopwatch } from "@/components/SalaryStopwatch";
import type { FaqItem } from "@/lib/home-faq";
import { toolSchemas } from "@/lib/tool-schema";
import { OG_DEFAULTS, getTool } from "@/lib/site";

const tool = getTool("/salary-stopwatch");

export const metadata: Metadata = {
  title: tool.title,
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
    a: "Enter your hourly rate, press Start when you begin working and Pause when you stop. The stopwatch multiplies the paid time between those two moments by your rate, so a 47-minute session at $25 an hour reads $19.67. Nothing else is involved: no schedule, no shift, no assumption about when you were supposed to be working.",
  },
  {
    q: "What is the difference between Pause and the break button?",
    a: "Both stop the money. Pause just stops the watch, while a break is recorded as unpaid time so you can see what it cost — a 15-minute break at $25 an hour is $6.25 that does not appear in the session total. Use the break button when the time off is part of the job rather than the end of it.",
  },
  {
    q: "Does the stopwatch save my sessions?",
    a: "No. The session and the log of finished sessions live in the page for as long as it is open, and reloading clears both. Nothing is written to storage and nothing is sent anywhere, so if you need a record for an invoice, note the figure down before you close the tab.",
  },
  {
    q: "How do I convert 00:47:12 into decimal hours?",
    a: "Divide the seconds by 3,600. 47 minutes and 12 seconds is 2,832 seconds, which is 0.787 hours — so at $25 an hour the session is $19.67. Most timesheets want that decimal rather than the clock reading, and rounding it to 0.8 would hand over an extra 20 cents.",
  },
  {
    q: "Can I leave it running all day?",
    a: "You can, but it will bill every second between Start and Pause, including the ones you spent away from the desk. A stopwatch measures elapsed time, not effort, so the honest pattern is to start it when you start and stop it when you stop. If you want a counter that follows a fixed rota instead, use the timer on the homepage.",
  },
];

export default function SalaryStopwatchPage() {
  return (
    <ToolPage
      tool={tool}
      hero={<SalaryStopwatch />}
      h1={
        <>
          Salary stopwatch:
          <br />
          press start, and <span className="hl">time becomes money.</span>
        </>
      }
      lede="The timer on the homepage follows the schedule you saved. This one follows you: press Start when you begin, Pause when you stop, and read the paid time and the earnings for that one session. Reset to log it and start the next."
      faq={faq}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(toolSchemas(tool, faq)) }}
      />

      <section>
        <h2>A stopwatch, not a schedule</h2>
        <p>
          There are two honest ways to price working time, and they answer different questions. One
          asks &ldquo;what is my workday worth&rdquo; and needs a rota to answer it. The other asks
          &ldquo;what was that session worth&rdquo; and needs nothing but a start and a stop.
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
          If your hours are irregular — a client call, a Saturday of invoicing, an on-call window
          that may or may not turn into work — a schedule cannot describe them and a{" "}
          <Link href="/salary-stopwatch">salary stopwatch</Link> can. That is the whole case for this
          page.
        </p>
        <p>
          The other case is a fixed shift, and for that the{" "}
          <Link href="/">live salary timer</Link> on the homepage is better: it already knows when
          you clock in, pauses for your unpaid lunch and carries the day&rsquo;s total. Starting a
          stopwatch by hand every morning only adds a step you could forget.
        </p>
      </section>

      <section>
        <h2>What the four buttons do</h2>
        <p>
          Four controls, no hidden state. The button that does nothing is greyed out rather than
          removed, so the layout never shifts under your finger mid-session.
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
            <b>Reset.</b> Ends the session, adds it to the log below the card and clears the clock.
            The total is kept on purpose — resetting is how you close a session, not how you throw
            one away.
          </li>
        </ul>
        <p>
          The dashed button underneath is the unpaid break. It stops the clock like Pause does, but
          records the time as break so the card can tell you what the break cost.
        </p>
      </section>

      <section>
        <h2>Pause and break are not the same button</h2>
        <p>
          Pause means &ldquo;I have stopped looking&rdquo;. A break means &ldquo;I am not working and
          I am not being paid&rdquo;. Both stop the money, and the difference only matters when you
          want to know where the time went.
        </p>
        <p>
          The cost is larger than it feels. At $25 an hour a 15-minute break is $6.25, a 45-minute
          lunch is $18.75, and that lunch five days a week is $4,875 a year — very close to a
          month&rsquo;s pay, spent standing in a kitchen. Seeing it accumulate in the break line is
          the point of keeping the two buttons apart.
        </p>
        <p>
          For anyone billing a client, the distinction is not cosmetic either: an unpaid break inside
          a session is time you cannot invoice, and it is the first thing a client will query if the
          hours look long.
        </p>
      </section>

      <section>
        <h2>The decimal-hour trap</h2>
        <p>
          Timesheets rarely want 00:47:12. They want a decimal, and the conversion is where money
          quietly goes missing, because <b>0.1 of an hour is 6 minutes, not 10</b>. One hour ten
          minutes is 1.17, not 1.1.
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
          The rule is seconds ÷ 3,600. Every minute is 0.0167 of an hour, so a session of 2,832
          seconds is 0.787 hours, and rounding that up to 0.8 hands over 33 cents. Do it twice a day
          for a year and it is a day&rsquo;s pay — which is why the stopwatch shows the clock reading
          and leaves the rounding to you, rather than picking a convention on your behalf.
        </p>
      </section>

      <section>
        <h2>Where to go next</h2>
        <p>
          The stopwatch needs one number to work: your hourly rate. If you only know your salary,
          the <Link href="/hourly-rate-calculator">salary to hourly calculator</Link> turns annual,
          monthly or weekly pay into the rate behind it, using the hours you actually work rather
          than the 2,080-hour standard.
        </p>
        <p>
          If what you need is not one session but a week of them — seven rows of clock-in and
          clock-out, a break on each, and a total that splits regular hours from overtime — the{" "}
          <Link href="/time-card-calculator">time card calculator</Link> is the instrument for that.
          A stopwatch prices a moment; a time card prices a pay period.
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
