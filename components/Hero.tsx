"use client";

import { useI18n } from "@/lib/i18n";

export function Hero({ children }: { children?: React.ReactNode }) {
  const { t } = useI18n();
  return (
    <section className="hero">
      <div className="blob m" />
      <div className="blob p" />
      <div className="wrap">
        <div className="hero-inner">
          <div className="hero-copy">
            <h1>
              {t("hero.h1.line1")}
              <span className="hl">{t("hero.h1.hl")}</span>
              <br />
              {t("hero.h1.line2")}
            </h1>
            <p className="lede">
              {t("hero.lede")}
            </p>
          </div>

          <div className="hero-stickers" aria-hidden="true">
            <div className="sticker">
              <span>🪙</span>
              <div>
                <b>{t("hero.sticker1.title")}</b>
                <small>{t("hero.sticker1.sub")}</small>
              </div>
            </div>
            <div className="sticker">
              <span>☕</span>
              <div>
                <b>{t("hero.sticker2.title")}</b>
                <small>{t("hero.sticker2.sub")}</small>
              </div>
            </div>
            <div className="sticker">
              <span>🎯</span>
              <div>
                <b>{t("hero.sticker3.title")}</b>
                <small>{t("hero.sticker3.sub")}</small>
              </div>
            </div>
          </div>
        </div>
        {children}
      </div>
    </section>
  );
}
