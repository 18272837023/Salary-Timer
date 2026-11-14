import { HomeCalculation } from "@/components/HomeCalculation";
import { EntityLede } from "@/components/EntityLede";
import { Hero } from "@/components/Hero";
import { SalaryApp } from "@/components/SalaryApp";
import {
  CtaBand,
  Faq,
  Features,
  HowItWorks,
  LearnLinks,
  Personas,
  ToolLinks,
} from "@/components/sections";
import { HOME_FAQ, HOME_FAQ_ZH } from "@/lib/home-faq";
import type { Lang } from "@/lib/i18n";
import { ENTITY_DEFINITION, ZH_ENTITY_DEFINITION, ORGANIZATION_ID, SAME_AS, SITE_NAME, pageUrl } from "@/lib/site";
import { contentUpdated } from "@/lib/editorial";

/**
 * The homepage body, shared by / (English) and /zh (Chinese).
 *
 * `lang` is passed in from the route rather than read from a hook so the
 * structured data — which is emitted into the prerendered HTML — is in the
 * same language as the visible page. Everything else reads the locale from
 * I18nProvider, which derives it from the same URL.
 */

const ZH_NAME = "薪资计时器";

const FEATURES_EN = [
  "Live salary counter, updated every second",
  "Salary per second, minute and hour",
  "Custom working days and shift times",
  "Unpaid break handling",
  "Overtime multipliers",
  "Payday countdown",
  "Privacy mode",
  "Floating salary timer in supported desktop browsers",
];

const FEATURES_ZH = [
  "实时计薪，每秒更新",
  "每秒、每分钟、每小时收入",
  "自定义工作日与班次时间",
  "无薪休息处理",
  "加班倍率",
  "发薪日倒计时",
  "隐私模式",
  "支持的桌面浏览器可使用悬浮计薪",
];

export function HomeContent({ lang }: { lang: Lang }) {
  const zh = lang === "zh";
  const homeUrl = zh ? pageUrl("/zh") : pageUrl("/");
  const faqItems = zh ? HOME_FAQ_ZH : HOME_FAQ;

  const appSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: zh ? ZH_NAME : SITE_NAME,
    url: homeUrl,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Any — runs in the browser",
    browserRequirements: "Requires JavaScript",
    description: zh ? ZH_ENTITY_DEFINITION : ENTITY_DEFINITION,
    inLanguage: zh ? "zh-CN" : "en",
    dateModified: contentUpdated(zh ? "/zh" : "/"),
    isAccessibleForFree: true,
    // Reference the Organization node by @id instead of leaving it null — one
    // entity, described once, pointed at from every schema block.
    publisher: { "@id": ORGANIZATION_ID },
    sameAs: SAME_AS,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: zh ? FEATURES_ZH : FEATURES_EN,
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: zh ? "首页" : "Home", item: homeUrl },
    ],
  };

  return (
    <main id="top">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(appSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <Hero>
        <SalaryApp />
      </Hero>

      <section className="section tight" aria-label={zh ? "什么是薪资计时器" : "What Salary Timer is"}>
        <div className="wrap">
          <EntityLede />
        </div>
      </section>

      <HowItWorks />
      <HomeCalculation lang={lang} />
      <Features />
      <Personas />
      <Faq
        items={faqItems}
        title={zh ? "薪资计时器常见问题" : "Salary timer FAQ"}
        lede={zh ? "简短回答，没有废话。" : "Short answers, no small print."}
        eyebrow={zh ? "常见问题" : "Questions"}
      />
      <ToolLinks current="/" />
      <LearnLinks />
      <CtaBand />
    </main>
  );
}
