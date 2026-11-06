"use client";

import { Link } from "@/components/SmartLink";
import { useHref, useI18n } from "@/lib/i18n";
import { CLUSTERS, TOOLS, entryArticle, getLearn } from "@/lib/site";

import { HOME_FAQ, type FaqItem } from "@/lib/home-faq";

// Re-exported so the existing `import type { FaqItem } from "@/components/sections"`
// in the landing pages keeps working.
export { HOME_FAQ, HOME_FAQ_ZH } from "@/lib/home-faq";
export type { FaqItem } from "@/lib/home-faq";

export function PainPoints() {
  const { t, lang } = useI18n();
  const href = useHref();
  const items = [
    { icon: "📅", tone: "i-peach", n: 1 },
    { icon: "😴", tone: "i-butter", n: 2 },
    { icon: "💬", tone: "i-lilac", n: 3 },
    { icon: "⏳", tone: "i-mint", n: 4 },
    { icon: "🎯", tone: "i-pink", n: 5 },
    { icon: "🔍", tone: "i-butter", n: 6 },
  ];

  return (
    <section className="section" id="pain">
      <div className="wrap">
        <div className="eyebrow">{t("pain.eyebrow")}</div>
        <h2>{t("pain.h2")}</h2>
        <p className="sec-lede">
          {lang === "zh" ? (
            <>
              你每月工作 160 小时，却只感受到其中 4 个。
              <Link href={href("/#timer")}>薪资计时器</Link>
              之所以存在，是因为月薪制让你看不到日常时间与金钱的交换。以下是这种看不见的代价——以及为什么看着数字跳动会改变一天的感受。
            </>
          ) : (
            <>
              You work 160 hours a month and feel about four of them. A{" "}
              <Link href={href("/#timer")}>salary timer</Link> exists because a monthly salary hides
              the hourly trade you make all day. Here&apos;s what that costs you — and why watching a
              live counter changes how a working day feels.
            </>
          )}
        </p>
        <div className="cards-3">
          {items.map((item) => (
            <div className="pcard" key={item.n}>
              <div className={`ico ${item.tone}`}>{item.icon}</div>
              <h3>{t(`pain.${item.n}.title`)}</h3>
              <p>{t(`pain.${item.n}.body`)}</p>
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
  const { t, lang } = useI18n();
  const href = useHref();
  const rows = [
    {
      n: 1,
      art: (
        <Mock label={t("feat.mock.earnedToday")}>
          <div className="n" style={{ color: "var(--mint-deep)" }}>
            $127.43
          </div>
          <div className="r">
            <span>{t("tick.perMinute")}</span>
            <b>$0.58</b>
          </div>
          <div className="r">
            <span>{t("tick.perHour")}</span>
            <b>$34.62</b>
          </div>
          <div className="r">
            <span>{t("tick.perSecond")}</span>
            <b>$0.0096</b>
          </div>
        </Mock>
      ),
    },
    {
      n: 2,
      art: (
        <Mock label={t("feat.mock.yourWeek")}>
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
            <span>{t("feat.mock.shift")}</span>
            <b>09:00 – 17:30</b>
          </div>
          <div className="r">
            <span>{t("feat.mock.unpaidBreak")}</span>
            <b>30 min</b>
          </div>
        </Mock>
      ),
    },
    {
      n: 3,
      art: (
        <Mock label={t("feat.mock.today")}>
          <div className="r">
            <span>12:30 – 13:00 · Lunch</span>
            <b>{t("feat.mock.paused")}</b>
          </div>
          <div className="r">
            <span>15:10 – 15:20 · Coffee</span>
            <b>{t("feat.mock.paused")}</b>
          </div>
          <div className="r">
            <span>{t("feat.mock.paidTime")}</span>
            <b>6h 40m</b>
          </div>
        </Mock>
      ),
    },
    {
      n: 4,
      art: (
        <Mock label={t("feat.mock.overtime")}>
          <div className="n" style={{ fontSize: 28 }}>
            +$41.20
          </div>
          <div className="r">
            <span>1.5× for 48 min</span>
            <b>✓</b>
          </div>
          <div className="r">
            <span>{t("feat.mock.tips")}</span>
            <b>$18.00</b>
          </div>
        </Mock>
      ),
    },
    {
      n: 5,
      art: (
        <Mock label={t("feat.mock.paydayIn")}>
          <div className="n" style={{ fontSize: 30 }}>
            {t("tick.daysLeft", { n: 9 })}
          </div>
          <div className="r">
            <span>{t("feat.mock.jar")}</span>
            <b>$184 / $2,000</b>
          </div>
          <div className="r">
            <span>{t("feat.mock.thisWeek")}</span>
            <b>$312.40</b>
          </div>
        </Mock>
      ),
    },
    {
      n: 6,
      art: (
        <Mock label={t("feat.mock.wishlist")}>
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
      n: 7,
      art: (
        <Mock label={t("feat.mock.earnedToday")}>
          <div className="n" style={{ filter: "blur(9px)", color: "var(--mint-deep)" }}>
            $127.43
          </div>
          <div className="r">
            <span>{t("tick.perHour")}</span>
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
        <div className="eyebrow">{t("feat.eyebrow")}</div>
        <h2>{t("feat.h2")}</h2>
        <p className="sec-lede">
          {lang === "zh" ? (
            <>
              大多数薪资计算器假设一个标准的朝九晚五。真正的工作有
              <Link href="/learn/are-lunch-breaks-paid">无薪午休</Link>
              、轮班制、假期安排、小费、加班和那些你宁愿忘掉的日子。这个免费的
              <Link href={href("/#timer")}>薪资计时器</Link>全都能处理——还可以了解
              <Link href="/learn/how-salary-timers-work">计时器的工作原理</Link>。
            </>
          ) : (
            <>
              Most salary calculators assume a tidy 9-to-5. Real jobs have{" "}
              <Link href="/learn/are-lunch-breaks-paid">unpaid lunch breaks</Link>, rotating shifts,
              holiday schedules, tips, overtime and days you&apos;d rather forget. This free{" "}
              <Link href={href("/#timer")}>salary timer</Link> handles all of it — see also{" "}
              <Link href="/learn/how-salary-timers-work">how salary timers work</Link>.
            </>
          )}
        </p>
        {rows.map((row) => (
          <div className="feature" key={row.n}>
            <div className="txt">
              <h3>{t(`feat.${row.n}.title`)}</h3>
              <p>{t(`feat.${row.n}.body`)}</p>
            </div>
            <div className="art">{row.art}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Personas() {
  const { t, lang } = useI18n();
  const people = [
    ["🏥", 1],
    ["🛒", 2],
    ["💻", 3],
    ["🧑‍💻", 4],
    ["🏠", 5],
    ["🎓", 6],
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
        <div className="eyebrow">{t("persona.eyebrow")}</div>
        <h2>{t("persona.h2")}</h2>
        <p className="sec-lede">
          {lang === "zh" ? (
            <>
              为所有时间有价格的人而做。如果你按小时拿钱——任何小时，任何形式——这就是为你做的。轮班工作者可以直接用
              <Link href="/shift-worker-salary-timer">轮班薪资计时器</Link>，或者先读
              <Link href="/learn/salary-timer-for-shift-workers">轮班工作指南</Link>。
            </>
          ) : (
            <>
              Built for anyone whose time has a price. If you&apos;re paid for hours — any hours, in
              any arrangement — this was made for you. Shift workers can jump to the{" "}
              <Link href="/shift-worker-salary-timer">shift worker salary timer</Link>, or read the{" "}
              <Link href="/learn/salary-timer-for-shift-workers">shift work guide</Link> first.
            </>
          )}
        </p>
        <div className="cards-3">
          {people.map(([emoji, n]) => (
            <div className="persona" key={n}>
              <div className="em">{emoji}</div>
              <div>
                <h4>{t(`persona.${n}.title`)}</h4>
                <p>{t(`persona.${n}.body`)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Scenarios() {
  const { t, lang } = useI18n();
  const href = useHref();
  const cards = [
    { icon: "🕒", tone: "i-peach", n: 1 },
    { icon: "🤔", tone: "i-mint", n: 2 },
    { icon: "🏝️", tone: "i-lilac", n: 3 },
    { icon: "⚖️", tone: "i-butter", n: 4 },
  ];

  return (
    <section className="section" id="scenarios">
      <div className="wrap">
        <div className="eyebrow">{t("scn.eyebrow")}</div>
        <h2>{t("scn.h2")}</h2>
        <p className="sec-lede">
          {lang === "zh" ? (
            <>
              四个看到数字就改变决定的场景。每个都是你只有在还有机会拒绝时才能定价的选择——而定价正是
              <Link href={href("/#timer")}>薪资计时器</Link>做的事。
            </>
          ) : (
            <>
              Four situations where seeing the number changes what you decide. Each one is a choice
              you can only price while you still have the option to turn it down — and pricing it is
              what the <Link href={href("/#timer")}>salary timer</Link> does.
            </>
          )}
        </p>
        <div className="cards-2">
          {cards.map((c) => (
            <div className="pcard" key={c.n}>
              <div className={`ico ${c.tone}`}>{c.icon}</div>
              <h3>{t(`scn.${c.n}.title`)}</h3>
              <p>{t(`scn.${c.n}.body`)}</p>
            </div>
          ))}
        </div>
        <div className="quote" style={{ marginTop: 26 }}>
          <p>{t("scn.quote")}</p>
          <div className="who">{t("scn.quoteWho")}</div>
        </div>
      </div>
    </section>
  );
}

export function HowItWorks() {
  const { t } = useI18n();
  const steps = [1, 2, 3];

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
        <div className="eyebrow">{t("how.eyebrow")}</div>
        <h2>{t("how.h2")}</h2>
        <p className="sec-lede">{t("how.lede")}</p>
        <div className="steps" style={{ marginTop: 30 }}>
          {steps.map((n, i) => (
            <div className="step" key={n}>
              <div className="num">{i + 1}</div>
              <h3>{t(`how.${n}.title`)}</h3>
              <p>{t(`how.${n}.body`)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Faq({
  items = HOME_FAQ,
  title = "Salary timer FAQ",
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
  const { t } = useI18n();
  const href = useHref();
  return (
    <section className="section tight">
      <div className="wrap">
        <div className="cta-band">
          <h2>{t("cta.h2")}</h2>
          <p>{t("cta.body")}</p>
          <Link className="btn btn-mint" href={href("/#timer")}>
            {t("cta.btn")}
          </Link>
        </div>
      </div>
    </section>
  );
}

/**
 * Homepage Learn block.
 *
 * Deliberately points at the three *topics*, not at eleven individual articles.
 * The homepage's job is to state the entity and hand off to the topic map; the
 * hubs then distribute authority to their own nodes. Listing every article here
 * would flatten the hierarchy and cost the homepage 11 outbound links it cannot
 * afford.
 *
 * The three cards keep their English labels: they are doorways into the English
 * /learn/* hub pages, which are not translated.
 */
export function LearnLinks() {
  const { t, lang } = useI18n();
  const entry = entryArticle();

  return (
    <section className="section tight" id="learn">
      <div className="wrap">
        <div className="eyebrow">{t("learn.eyebrow")}</div>
        <h2 style={{ fontSize: "clamp(24px, 3vw, 32px)" }}>{t("learn.h2")}</h2>
        <p className="sec-lede">
          {lang === "zh" ? (
            <>
              本站解释的一切都属于三个问题之一：一小时值多少钱、什么算计薪时间、钱什么时候到。从
              <Link href="/learn">完整话题地图</Link>开始——或者选最短的路进去。
            </>
          ) : (
            <>
              Everything this site explains belongs to one of three questions: what an hour is
              worth, what counts as paid time, and when the money arrives. Start at the{" "}
              <Link href="/learn">full topic map</Link> — or take the shortest route in.
            </>
          )}
        </p>
        <div className="cards-3">
          {CLUSTERS.map((cluster) => (
            <Link className="pcard" href={cluster.href} key={cluster.id}>
              <div className="ico i-mint">{cluster.emoji}</div>
              <h3>{cluster.label}</h3>
              <p>{cluster.definition}</p>
            </Link>
          ))}
        </div>
        {entry ? (
          <p className="learn-related">
            {lang === "zh" ? (
              <>
                第一次接触？<Link href={entry.href}>How salary timers work</Link>{" "}
                用一篇文章解释了全部，在细节之前。
              </>
            ) : (
              <>
                New to the idea?{" "}
                <Link href={entry.href}>How salary timers work</Link> explains the whole thing in
                one read, before the detail.
              </>
            )}
          </p>
        ) : null}
      </div>
    </section>
  );
}

/** Cross-links between landing pages — the internal-link mesh Google needs. */
export function ToolLinks({ current }: { current?: string }) {
  const { t, lang } = useI18n();
  const others = TOOLS.filter((tool) => tool.href !== current);
  const relatedLearn =
    current && current !== "/"
      ? TOOLS.find((tool) => tool.href === current)?.relatedLearnHref
      : undefined;
  const relatedArticle = relatedLearn ? getLearn(relatedLearn) : null;

  return (
    <section className="section tight">
      <div className="wrap">
        <div className="eyebrow">{t("tools.eyebrow")}</div>
        <h2 style={{ fontSize: "clamp(24px, 3vw, 32px)" }}>{t("tools.h2")}</h2>
        {relatedArticle ? (
          <p className="sec-lede" style={{ marginBottom: 8 }}>
            {lang === "zh" ? (
              <>
                想先看指南？读 <Link href={relatedArticle.href}>{relatedArticle.label}</Link>
                ，然后回到计算器。
              </>
            ) : (
              <>
                Prefer a walkthrough first? Read{" "}
                <Link href={relatedArticle.href}>{relatedArticle.label}</Link>, then come back to
                the calculator.
              </>
            )}
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
