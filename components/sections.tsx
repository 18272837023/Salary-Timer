"use client";

import { Link } from "@/components/SmartLink";
import { useHref, useI18n } from "@/lib/i18n";

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
        {items.map((item, i) => {
          const linkStart = item.link ? item.a.indexOf(item.link.text) : -1;
          return (
          <details className="faq" key={item.q} open={i === 0}>
            <summary>{item.q}</summary>
            <div className="a">{item.link && linkStart >= 0 ? <>
              {item.a.slice(0, linkStart)}
              <Link href={item.link.href}>{item.link.text}</Link>
              {item.a.slice(linkStart + item.link.text.length)}
            </> : item.a}</div>
          </details>
          );
        })}
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
