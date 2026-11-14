"use client";

import { Link } from "@/components/SmartLink";
import { useHref, useI18n } from "@/lib/i18n";
import { TOOLS, getLearn } from "@/lib/site";

import { HOME_FAQ, type FaqItem } from "@/lib/home-faq";

// Re-exported so the existing `import type { FaqItem } from "@/components/sections"`
// in the landing pages keeps working.
export { HOME_FAQ, HOME_FAQ_ZH } from "@/lib/home-faq";
export type { FaqItem } from "@/lib/home-faq";

function Mock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mock">
      <div className="l">{label}</div>
      {children}
    </div>
  );
}

export function Features() {
  const { t } = useI18n();
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
            <span>{t("feat.mock.thisWeek")}</span>
            <b>$312.40</b>
          </div>
          <div className="r">
            <span>{t("feat.mock.earnedToday")}</span>
            <b>$127.43</b>
          </div>
        </Mock>
      ),
    },
    {
      n: 6,
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
        <p className="sec-lede">{t("feat.lede")}</p>
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
  const { t } = useI18n();
  const people = [
    ["🏥", 1],
    ["💻", 3],
    ["🧑‍💻", 4],
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
        <p className="sec-lede">{t("persona.lede")}</p>
        <div className="cards-3">
          {people.map(([emoji, n]) => (
            <div className="persona" key={n}>
              <div className="em">{emoji}</div>
              <div>
                <h3>{t(`persona.${n}.title`)}</h3>
                <p>{t(`persona.${n}.body`)}</p>
              </div>
            </div>
          ))}
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

/** Further reading for questions raised by the live timer. */
export function LearnLinks() {
  const { lang } = useI18n();
  const zh = lang === "zh";
  const guides = [
    { href: "/learn/how-salary-timers-work/", en: "How a salary timer works", zh: "实时计薪的工作原理", detail: "How your settings turn scheduled working time into estimated earnings.", detailZh: "了解薪资与排班如何换算成实时收入估算。" },
    { href: "/learn/hourly-rate-from-annual-salary/", en: "Convert annual salary to an hourly rate", zh: "年薪如何换算成时薪", detail: "Choose the paid-hours divisor that matches your weekly schedule.", detailZh: "按每周计薪工时选择合适的年化除数。" },
    { href: "/learn/are-lunch-breaks-paid/", en: "Paid and unpaid lunch breaks", zh: "带薪与无薪午休", detail: "Understand which breaks to enter in your timer settings.", detailZh: "了解哪些休息时段应填入计薪器设置。" },
  ];
  return <section className="section tight" id="learn">
    <div className="wrap">
      <h2>{zh ? "计薪方法与使用指南" : "Understand your earnings calculation"}</h2>
      <p className="sec-lede">{zh ? "这些英文指南解释计薪器采用的计算方法和假设。" : "These guides explain the methods and assumptions behind the timer."}</p>
      <div className="cards-3">
        {guides.map((guide) => <Link className="pcard" href={guide.href} key={guide.href}>
          <h3>{zh ? guide.zh : guide.en}</h3>
          <p>{zh ? guide.detailZh : guide.detail}</p>
        </Link>)}
      </div>
      <p className="learn-related"><Link href="/learn/">{zh ? "浏览全部工资计算指南（英文）" : "Browse all pay calculation guides"}</Link></p>
    </div>
  </section>;
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
