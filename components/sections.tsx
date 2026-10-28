import { Link } from "@/components/SmartLink";
import { LEARN, TOOLS, getLearn } from "@/lib/site";

export interface FaqItem {
  q: string;
  a: string;
}

export const HOME_FAQ: FaqItem[] = [
  {
    q: "What exactly is a salary timer?",
    a: "A salary timer is a live counter that converts your working time into money as it passes. Instead of calculating what you earned at the end of a month, it shows the number moving in real time — so you can see the value of an hour, a meeting, or an extra shift while it's happening.",
  },
  {
    q: "How does it calculate my salary per second?",
    a: "It takes your pay, converts it to an hourly rate using your real schedule (paid hours per day × working days × 52), then divides by 3,600. That per-second figure is added only while you're inside a paid window of your shift — never during breaks, before you start, or after you clock out (unless you've turned on overtime).",
  },
  {
    q: "How do I work out my hourly rate from an annual salary?",
    a: "The common shortcut is salary ÷ 2,080, which assumes 40 hours a week, 52 weeks a year. It's wrong for almost everyone. This site does the honest version: your actual paid hours per day, minus unpaid breaks, times the number of days you actually work, times 52. Work a 4-day week and your hourly rate jumps; work 50-hour weeks and it drops.",
  },
  {
    q: "Does it count my lunch break as paid time?",
    a: "No — and that's deliberate. Any break you add is treated as unpaid, and the counter freezes while you're on it. If your lunch is genuinely paid, just don't add it as a break and the timer will keep running through it.",
  },
  {
    q: "Can I use it if I'm paid hourly instead of a salary?",
    a: "Yes, and it's the most accurate mode. Switch the pay type to hourly and the timer uses your rate directly — no annual-hours estimation involved. It's ideal for retail, hospitality, warehouse, agency and gig work.",
  },
  {
    q: "Does it handle overtime and shift work?",
    a: "Yes. Turn on overtime and the timer keeps counting after your shift ends at 1.25×, 1.5× or 2×, whichever matches your contract. Shifts that cross midnight are supported, so night shifts work correctly. Rotating patterns are handled by changing your working days.",
  },
  {
    q: "Is my salary data private?",
    a: "Your pay figures never leave your device. Everything is calculated in your browser and saved to your own device's local storage — there's no account and no server holding your numbers. We do count page views with Google Analytics so we know which pages are worth keeping, but that records the page you visited, never what you earn. Privacy mode blurs the figures on screen when someone's looking over your shoulder.",
  },
  {
    q: "Do I need to install an app or create an account?",
    a: "No. It's a website — open it, use it, close the tab. Your settings stay saved on that device for next time. It works on phones, tablets and desktops, and it keeps working offline once loaded.",
  },
  {
    q: "Is a salary timer accurate enough to rely on?",
    a: "For tracking and motivation, yes. It's a gross-pay estimate: it doesn't model tax, pension contributions, deductions or pay-period rounding, so treat it as \"what I earned before deductions\" rather than \"what will hit my bank\". Many people find the pre-tax number more motivating anyway.",
  },
  {
    q: "Can freelancers use it for billing?",
    a: "Yes — set an hourly rate and use the timer as a live session tracker. It won't produce invoices, but it will show you what a task is really worth, including the unpaid admin around it. Many freelancers use it to sanity-check quotes before sending them.",
  },
  {
    q: "Why does watching money tick up actually help?",
    a: "Because abstract rewards don't motivate behaviour; visible ones do. A salary arrives once a month, far from the effort that produced it. A counter that moves every second shortens that gap — which is why people report leaving on time more often, saying no to unpaid extras, and negotiating harder after a week of watching.",
  },
];

export function PainPoints() {
  const items = [
    {
      icon: "📅",
      tone: "i-peach",
      title: "Payday amnesia",
      body: "Thirty days of effort arrive as one number in your bank app, already spoken for by rent. The work itself never feels like it added up to anything.",
    },
    {
      icon: "😴",
      tone: "i-butter",
      title: "The 3pm slump",
      body: "Three hours left and no way to feel progress. The clock moves, the counter doesn't — so the afternoon just feels like a long grey nothing.",
    },
    {
      icon: "💬",
      tone: "i-lilac",
      title: "\u201cCan we grab 15 minutes?\u201d",
      body: "Meetings are free at the moment you accept them. You only find out what that half hour cost when the month is over and nothing moved.",
    },
    {
      icon: "⏳",
      tone: "i-mint",
      title: "Overtime that vanishes",
      body: "Four extra evenings, one slightly bigger payslip, zero sense of which hours produced it. Extra effort disappears into the average.",
    },
    {
      icon: "🎯",
      tone: "i-pink",
      title: "Savings are abstract",
      body: "\u201cSave $2,000\u201d is a number with no weight. \u201c74 hours of my life\u201d is something you can actually decide about.",
    },
    {
      icon: "🔍",
      tone: "i-butter",
      title: "You don't know your real rate",
      body: "Salary ÷ 2,080 is not your hourly rate if you work 47 hours a week and answer Slack on Sundays. Most people are paid less per hour than they think.",
    },
  ];

  return (
    <section className="section" id="pain">
      <div className="wrap">
        <div className="eyebrow">The problem</div>
        <h2>
          You work 160 hours a month.
          <br />
          You feel about four of them.
        </h2>
        <p className="sec-lede">
          A <Link href="/#timer">salary timer</Link> exists because money and time are the two
          things we&apos;re worst at feeling. Here&apos;s what that costs you — and why watching a
          live counter changes how a working day feels.
        </p>
        <div className="cards-3">
          {items.map((item) => (
            <div className="pcard" key={item.title}>
              <div className={`ico ${item.tone}`}>{item.icon}</div>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Mock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mock">
      <div className="l">{label}</div>
      {children}
    </div>
  );
}

export function Features() {
  const rows = [
    {
      title: "A live counter, down to the second",
      body: "Your salary per second is calculated from your actual schedule — not a generic 2,080-hour year. The number updates continuously while you're on paid time, so a two-hour meeting has a visible price and the last hour of a shift has a visible finish line.",
      art: (
        <Mock label="Earned today">
          <div className="n" style={{ color: "var(--mint-deep)" }}>
            $127.43
          </div>
          <div className="r">
            <span>Per minute</span>
            <b>$0.58</b>
          </div>
          <div className="r">
            <span>Per hour</span>
            <b>$34.62</b>
          </div>
          <div className="r">
            <span>Per second</span>
            <b>$0.0096</b>
          </div>
        </Mock>
      ),
    },
    {
      title: "Schedules for real jobs, not brochures",
      body: "Five-day week, four-day week, six-day week, or pick your own days. Add public holidays and one-off days off. If you work nights, set a shift that crosses midnight — the timer follows it. Your hourly rate is recalculated the moment your schedule changes, because a 4-day week pays a very different hourly rate than a 5-day one.",
      art: (
        <Mock label="Your week">
          <div style={{ display: "flex", gap: 5, margin: "10px 0 14px" }}>
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <span
                key={i}
                style={{
                  flex: 1,
                  height: 34,
                  borderRadius: 10,
                  background: i < 5 ? "var(--mint)" : "var(--line)",
                }}
              />
            ))}
          </div>
          <div className="r">
            <span>Shift</span>
            <b>09:00 – 17:30</b>
          </div>
          <div className="r">
            <span>Unpaid break</span>
            <b>30 min</b>
          </div>
        </Mock>
      ),
    },
    {
      title: "Unpaid breaks, handled honestly",
      body: "Add as many breaks as your day really has: lunch, the school run, the gym, the 20 minutes you spend making coffee. The counter freezes during them. No fake numbers, no pretending your lunch break is billable.",
      art: (
        <Mock label="Today">
          <div className="r">
            <span>12:30 – 13:00 · Lunch</span>
            <b>paused</b>
          </div>
          <div className="r">
            <span>15:10 – 15:20 · Coffee</span>
            <b>paused</b>
          </div>
          <div className="r">
            <span>Paid time</span>
            <b>6h 40m</b>
          </div>
        </Mock>
      ),
    },
    {
      title: "Overtime, tips and bonuses",
      body: "After clock-out the timer can keep running at 1.25×, 1.5× or 2×, so late evenings are worth something visible. Tips, commission and one-off bonuses can be added in a tap and roll straight into your month total.",
      art: (
        <Mock label="Overtime">
          <div className="n" style={{ fontSize: 28 }}>
            +$41.20
          </div>
          <div className="r">
            <span>1.5× for 48 min</span>
            <b>✓</b>
          </div>
          <div className="r">
            <span>Tips added</span>
            <b>$18.00</b>
          </div>
        </Mock>
      ),
    },
    {
      title: "Payday countdown & a savings jar",
      body: "Set your payday and the site tells you how many days, hours and shifts are left. Then pick a savings rate and watch a little jar fill with every paid second — the only savings account that fills while you're sitting in a meeting.",
      art: (
        <Mock label="Payday in">
          <div className="n" style={{ fontSize: 30 }}>
            9 days
          </div>
          <div className="r">
            <span>Jar</span>
            <b>$184 / $2,000</b>
          </div>
          <div className="r">
            <span>This week</span>
            <b>$312.40</b>
          </div>
        </Mock>
      ),
    },
    {
      title: "A wishlist priced in hours",
      body: "Add the things you're actually saving for. Every item shows its price in hours of your life, and a progress bar fills as you earn. \u201c$120 concert ticket\u201d becomes \u201c3.5 hours\u201d — which is a completely different decision.",
      art: (
        <Mock label="Wishlist">
          <div className="r">
            <span>🎧 Headphones</span>
            <b>5.2 h</b>
          </div>
          <div className="r">
            <span>🎫 Concert</span>
            <b>3.5 h</b>
          </div>
          <div className="r">
            <span>🏝️ Weekend away</span>
            <b>15.0 h</b>
          </div>
        </Mock>
      ),
    },
    {
      title: "Privacy mode for open offices",
      body: "One tap blurs every number on screen. Handy when you're on a train, in a shared desk, or showing a colleague the timer without showing them your salary.",
      art: (
        <Mock label="Earned today">
          <div className="n" style={{ filter: "blur(9px)", color: "var(--mint-deep)" }}>
            $127.43
          </div>
          <div className="r">
            <span>Per hour</span>
            <b style={{ filter: "blur(7px)" }}>$34.62</b>
          </div>
          <div className="r">
            <span>🙈 Hidden</span>
            <b>tap to reveal</b>
          </div>
        </Mock>
      ),
    },
  ];

  return (
    <section className="section" id="features">
      <div className="wrap">
        <div className="eyebrow">What&apos;s inside</div>
        <h2>A salary timer that knows how work actually works</h2>
        <p className="sec-lede">
          Most salary calculators assume a tidy 9-to-5. Real jobs have{" "}
          <Link href="/learn/are-lunch-breaks-paid">unpaid lunch breaks</Link>, rotating shifts,
          holiday schedules, tips, overtime and days you&apos;d rather forget. This free{" "}
          <Link href="/#timer">salary timer</Link> handles all of it — see also{" "}
          <Link href="/learn/how-salary-timers-work">how salary timers work</Link>.
        </p>
        {rows.map((row) => (
          <div className="feature" key={row.title}>
            <div className="txt">
              <h3>{row.title}</h3>
              <p>{row.body}</p>
            </div>
            <div className="art">{row.art}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Personas() {
  const people = [
    ["🏥", "Nurses & shift workers", "Twelve-hour shifts, rotating patterns, night differentials. Set the shift once and the timer follows your rota."],
    ["🛒", "Retail & hospitality", "Variable hours, tips, split shifts. Watch a Sunday shift turn into a number you can actually plan with."],
    ["💻", "Salaried 9-to-5ers", "The classic case: a fixed salary, a fixed schedule, and no idea what an hour of your life is worth."],
    ["🧑‍💻", "Freelancers & contractors", "Know your true hourly rate before you quote. Add unpaid admin time and the real number gets honest fast."],
    ["🏠", "Remote & hybrid workers", "When work and home blur, a visible counter draws the line back at 5:30."],
    ["🎓", "Students & part-timers", "Four hours after class, one visible total. Suddenly a shift is worth more than \u201ca bit of cash\u201d."],
  ] as const;

  return (
    <section
      className="section"
      id="who"
      style={{
        background: "var(--cream)",
        borderTop: "2px solid var(--line)",
        borderBottom: "2px solid var(--line)",
      }}
    >
      <div className="wrap">
        <div className="eyebrow">Who it&apos;s for</div>
        <h2>Built for anyone whose time has a price</h2>
        <p className="sec-lede">
          If you&apos;re paid for hours — any hours, in any arrangement — this was made for you.
          Shift workers can jump to the{" "}
          <Link href="/shift-worker-salary-timer">shift worker salary timer</Link>, or read the{" "}
          <Link href="/learn/salary-timer-for-shift-workers">shift work guide</Link> first.
        </p>
        <div className="cards-3">
          {people.map(([emoji, title, body]) => (
            <div className="persona" key={title}>
              <div className="em">{emoji}</div>
              <div>
                <h4>{title}</h4>
                <p>{body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Scenarios() {
  const cards = [
    {
      icon: "🕒",
      tone: "i-peach",
      title: "2:47pm, the meeting has no end",
      body: "You glance at the tab: $96.20 earned, 42% of the shift gone. The meeting isn't more bearable — but it's finally measurable. You leave on time, because you can see what staying costs.",
    },
    {
      icon: "🤔",
      tone: "i-mint",
      title: "\u201cCan you cover Saturday?\u201d",
      body: "Instead of guessing, you check the real rate: an eight-hour Saturday at 1.5× is worth $415. Now it's a decision about a weekend, not a vague favour.",
    },
    {
      icon: "🏝️",
      tone: "i-lilac",
      title: "The $1,800 trip",
      body: "The wishlist turns it into 52 hours. Four working days. Somehow that's easier to commit to than a number on a savings app — and the jar fills every single shift.",
    },
    {
      icon: "⚖️",
      tone: "i-butter",
      title: "Two job offers",
      body: "$62k with a 45-minute commute versus $58k from your spare room. Run both through the timer with real hours. The higher salary is often the lower rate.",
    },
  ];

  return (
    <section className="section" id="scenarios">
      <div className="wrap">
        <div className="eyebrow">In real life</div>
        <h2>Four moments where the number changes your mind</h2>
        <p className="sec-lede">
          A <Link href="/#timer">salary timer</Link> isn&apos;t really about money. It&apos;s about
          seeing the trade you&apos;re making while you&apos;re still allowed to make it.
        </p>
        <div className="cards-2">
          {cards.map((c) => (
            <div className="pcard" key={c.title}>
              <div className={`ico ${c.tone}`}>{c.icon}</div>
              <h3>{c.title}</h3>
              <p>{c.body}</p>
            </div>
          ))}
        </div>
        <div className="quote" style={{ marginTop: 26 }}>
          <p>
            &ldquo;I used to think my salary was fine. Then I worked out it was $19.40 an hour after
            the commute, the unpaid lunch and the 47-hour weeks. I asked for a raise two weeks
            later.&rdquo;
          </p>
          <div className="who">— the moment most people have around day three</div>
        </div>
      </div>
    </section>
  );
}

export function HowItWorks() {
  const steps = [
    ["Tell it what you earn", "Yearly, monthly or hourly — whichever you actually know. Pick your currency. That's the only number it needs."],
    ["Tell it when you work", "Working days, start and finish times, unpaid breaks, holidays. Add overtime rules if you get them."],
    ["Watch, and go back to work", "The counter runs only during paid time. Leave the tab open, or check in at lunch — it's always mid-sentence."],
  ] as const;

  return (
    <section
      className="section tight"
      id="how"
      style={{
        background: "var(--cream)",
        borderTop: "2px solid var(--line)",
        borderBottom: "2px solid var(--line)",
      }}
    >
      <div className="wrap">
        <div className="eyebrow">How it works</div>
        <h2>Twenty seconds to set up. Then it just runs.</h2>
        <div className="steps" style={{ marginTop: 30 }}>
          {steps.map(([title, body], i) => (
            <div className="step" key={title}>
              <div className="num">{i + 1}</div>
              <h3>{title}</h3>
              <p>{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Faq({
  items = HOME_FAQ,
  title = "Everything people ask before they start",
  lede = "Short answers, no small print.",
  eyebrow = "Questions",
  id = "faq",
}: {
  items?: FaqItem[];
  title?: string;
  lede?: string;
  eyebrow?: string;
  id?: string;
}) {
  return (
    <section className="section" id={id}>
      <div className="wrap">
        <div className="eyebrow">{eyebrow}</div>
        <h2>{title}</h2>
        <p className="sec-lede">{lede}</p>
        {items.map((item, i) => (
          <details className="faq" key={item.q} open={i === 0}>
            <summary>{item.q}</summary>
            <div className="a">{item.a}</div>
          </details>
        ))}
      </div>
    </section>
  );
}

export function CtaBand() {
  return (
    <section className="section tight">
      <div className="wrap">
        <div className="cta-band">
          <h2>Your next hour is already worth something.</h2>
          <p>
            Set it up once and watch it. It takes twenty seconds, costs nothing, and you&apos;ll
            never look at 4:45pm the same way.
          </p>
          <Link className="btn btn-mint" href="/#timer">
            Start my salary timer
          </Link>
        </div>
      </div>
    </section>
  );
}

/**
 * Homepage Learn cluster — pushes equity into /learn/* with keyword-rich
 * anchors, and gives Google a clear topical hub under the main salary timer page.
 */
export function LearnLinks() {
  return (
    <section className="section tight" id="learn">
      <div className="wrap">
        <div className="eyebrow">Learn</div>
        <h2 style={{ fontSize: "clamp(24px, 3vw, 32px)" }}>
          Guides that make the salary timer clearer
        </h2>
        <p className="sec-lede">
          Short reads on the math behind a live salary timer — then jump back to the free tool
          above when you&apos;re ready to start the clock.
        </p>
        <ul className="learn-index" style={{ marginTop: 8 }}>
          {LEARN.map((article) => (
            <li key={article.href}>
              <Link href={article.href}>
                <strong>{article.label}</strong>
                <span>{article.blurb}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** Cross-links between landing pages — the internal-link mesh Google needs. */
export function ToolLinks({ current }: { current?: string }) {
  const others = TOOLS.filter((t) => t.href !== current);
  const relatedLearn =
    current && current !== "/"
      ? TOOLS.find((t) => t.href === current)?.relatedLearnHref
      : undefined;
  const relatedArticle = relatedLearn ? getLearn(relatedLearn) : null;

  return (
    <section className="section tight">
      <div className="wrap">
        <div className="eyebrow">Keep going</div>
        <h2 style={{ fontSize: "clamp(24px, 3vw, 32px)" }}>The rest of the toolbox</h2>
        {relatedArticle ? (
          <p className="sec-lede" style={{ marginBottom: 8 }}>
            Prefer a walkthrough first? Read{" "}
            <Link href={relatedArticle.href}>{relatedArticle.label}</Link>, then come back to the
            calculator.
          </p>
        ) : null}
        <div className="cards-3" style={{ marginTop: 22 }}>
          {others.map((tool) => (
            <Link className="tool-link" href={tool.href} key={tool.href}>
              <span className="te">{tool.emoji}</span>
              <b>{tool.label}</b>
              <small>{tool.blurb}</small>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
