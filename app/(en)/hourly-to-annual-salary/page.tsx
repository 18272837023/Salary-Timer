import type { Metadata } from "next";
import { Link } from "@/components/SmartLink";
import { ToolPage } from "@/components/ToolPage";
import { HourlyToSalary } from "@/components/HourlyToSalary";
import type { FaqItem } from "@/lib/home-faq";
import { toolSchemas } from "@/lib/tool-schema";
import { OG_DEFAULTS, getTool } from "@/lib/site";

const tool = getTool("/hourly-to-annual-salary");

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
    q: "How do I convert an hourly wage to a yearly salary?",
    a: "Multiply the hourly wage by your paid hours per week, then by your paid weeks per year. $25 an hour at 40 hours a week and 52 weeks is 25 × 40 × 52 = $52,000. If two of those weeks go unpaid it is $50,000, which is the same hourly wage and a different year.",
  },
  {
    q: "What is $20 an hour in a year?",
    a: "At 40 hours a week and 52 paid weeks, $20 an hour is $41,600 a year, $3,466.67 a month and $800 a week. With two unpaid weeks it is $40,000. That range is why an advert quoting an hourly rate is not a salary figure until you know the paid weeks.",
  },
  {
    q: "What is $25 an hour annually?",
    a: "At 40 hours a week and 52 paid weeks, $25 an hour is $52,000 a year. Monthly that is $4,333.33, weekly $1,000 and biweekly $2,000. Over 50 paid weeks the annual figure drops to $50,000 — 3.8% less for identical hours per week.",
  },
  {
    q: "Should I use 50 or 52 weeks?",
    a: "52 if you are paid for holiday and take no unpaid leave. 50 if two weeks a year go unpaid, which is common for contractors, seasonal work and anyone on a zero-hours arrangement. The difference is 3.8% of the annual figure, and it is the same 3.8% whether you earn $12 an hour or $40.",
  },
  {
    q: "Does this include overtime or tax?",
    a: "Neither. The converter multiplies your base hourly wage, so overtime premium, tips, bonuses and commission are all outside it, and the result is gross pay before tax. For overtime, add the premium to the weekly figure first: five hours a week at time-and-a-half on $25 is an extra 5 × $12.50 = $62.50 a week, or $3,250 a year at 52 weeks.",
  },
];

export default function HourlyToAnnualSalaryPage() {
  return (
    <ToolPage
      tool={tool}
      hero={<HourlyToSalary />}
      h1={
        <>
          Hourly to annual salary:
          <br />
          what an hour <span className="hl">adds up to</span> in a year.
        </>
      }
      lede="Type an hourly wage and get the yearly figure back, plus the month, week and biweekly pay that go with it. Switch between 52 and 50 paid weeks and see what two unpaid weeks actually cost."
      faq={faq}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(toolSchemas(tool, faq)) }}
      />

      <section>
        <h2>One multiplication, three numbers</h2>
        <p>
          Converting an hourly wage into a salary is not a conversion at all. There is no exchange
          rate and nothing to look up — it is a multiplication, and the only question is what you
          multiply by.
        </p>
        <p className="formula">annual salary = hourly wage × paid hours per week × paid weeks per year</p>
        <p>
          Three numbers go in, one comes out, and two of the three are decisions rather than facts.
          The paid weeks are the one people get wrong, because a contract rarely states them: it
          states an hourly rate, and then holiday, unpaid leave and seasonal shutdowns quietly
          change the multiplier.
        </p>
        <p>
          The <Link href="/hourly-to-annual-salary">hourly to annual salary calculator</Link> above
          is exactly this formula with the paid-week count left to you, so the yearly figure moves
          when the assumption moves instead of hiding behind 2,080.
        </p>
      </section>

      <section>
        <h2>What common hourly wages come to</h2>
        <p>
          Every figure below is the hourly wage × 40 hours × 52 weeks — the standard full-time year,
          and the one an advert usually has in mind.
        </p>

        <div className="table-wrap fit">
          <table>
            <thead>
              <tr>
                <th>Hourly</th>
                <th>Per year</th>
                <th>Per month</th>
                <th>Per week</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>$12</td>
                <td>24,960</td>
                <td>2,080</td>
                <td>480</td>
              </tr>
              <tr>
                <td>$15</td>
                <td>31,200</td>
                <td>2,600</td>
                <td>600</td>
              </tr>
              <tr>
                <td>$20</td>
                <td>41,600</td>
                <td>3,466.67</td>
                <td>800</td>
              </tr>
              <tr>
                <td>$25</td>
                <td>52,000</td>
                <td>4,333.33</td>
                <td>1,000</td>
              </tr>
              <tr>
                <td>$30</td>
                <td>62,400</td>
                <td>5,200</td>
                <td>1,200</td>
              </tr>
              <tr>
                <td>$40</td>
                <td>83,200</td>
                <td>6,933.33</td>
                <td>1,600</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p>
          The weekly column is the one to sanity-check an offer against. If a job pays weekly and
          quotes an hourly rate, that column is your actual payslip before tax — and the annual
          figure is only real if the weeks are.
        </p>
      </section>

      <section>
        <h2>Why 52 weeks overstates some jobs</h2>
        <p>
          52 assumes you are paid for every week of the year. Plenty of people are not: a
          contractor between contracts, a seasonal worker, anyone whose holiday is unpaid. Two
          unpaid weeks is not a dramatic assumption — it is a normal year for a lot of hourly work.
        </p>

        <div className="table-wrap fit">
          <table>
            <thead>
              <tr>
                <th>Hourly</th>
                <th>52 paid weeks</th>
                <th>50 paid weeks</th>
                <th>Difference</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>$20</td>
                <td>41,600</td>
                <td>40,000</td>
                <td>1,600</td>
              </tr>
              <tr>
                <td>$25</td>
                <td>52,000</td>
                <td>50,000</td>
                <td>2,000</td>
              </tr>
              <tr>
                <td>$30</td>
                <td>62,400</td>
                <td>60,000</td>
                <td>2,400</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p>
          The percentage is the same at every wage — 3.8%, because 2 ÷ 52 does not care what you
          earn. What changes is the money. Two weeks off unpaid is $2,000 a year at $25 an hour, and
          that is the number worth putting next to a salaried offer before deciding which one is
          better paid.
        </p>
      </section>

      <section>
        <h2>The four-week month that never existed</h2>
        <p>
          The most common arithmetic mistake in this conversion is not the annual figure, it is the
          monthly one. People take the weekly pay and multiply by four. At $25 an hour that gives
          $4,000 a month.
        </p>
        <p>
          A month is not four weeks. It is 4.33 weeks on average — 52 weeks divided by 12 months.
          The real monthly figure is $52,000 ÷ 12 = $4,333.33. Over a year the four-week shortcut
          loses $4,000, which is close to an entire extra month of pay, and it is the reason a
          monthly budget built on &ldquo;weekly × 4&rdquo; always feels slightly short.
        </p>
        <p>
          Biweekly is the one case where doubling does work, because two weeks really is two weeks.
          $1,000 a week is $2,000 every second Friday, 26 times a year.
        </p>
      </section>

      <section>
        <h2>What this figure leaves out</h2>
        <ul className="checks">
          <li>
            <b>Tax and deductions.</b> Everything here is gross. Income tax, social insurance and
            pension contributions come off afterwards, and they do not scale linearly, so a 10%
            raise is rarely a 10% raise in the bank.
          </li>
          <li>
            <b>Overtime premium.</b> The converter multiplies your base rate. Time-and-a-half on
            five extra hours a week is a separate sum — add it to the weekly figure before you
            annualise, or you will understate the year by about $3,250 at $25 an hour.
          </li>
          <li>
            <b>Tips, bonuses and commission.</b> Variable pay has no fixed hourly equivalent. If it
            is a meaningful part of your income, annualise it separately and add the two figures
            rather than averaging it into the hourly rate.
          </li>
          <li>
            <b>Unpaid breaks.</b> A shift that runs 9:00–17:30 with a 30-minute unpaid lunch is 8
            paid hours, not 8.5. Put the paid figure in the hours field, or the year will be
            overstated by about 6%.
          </li>
        </ul>
      </section>

      <section>
        <h2>Where to go next</h2>
        <p>
          If you already know your yearly pay and want the rate behind it, the reverse direction is{" "}
          <Link href="/hourly-rate-calculator">converting a salary into an hourly rate</Link> — same
          hours, same paid weeks, divided instead of multiplied. That page is also the better start
          when you are comparing two salaried offers rather than two hourly ones.
        </p>
        <p>
          And if you would rather watch the money arrive than multiply it, the{" "}
          <Link href="/">live salary timer</Link> counts up from the same hourly wage and the same
          hours, so the number on the homepage and the number on this page can never disagree.
        </p>
      </section>
    </ToolPage>
  );
}
