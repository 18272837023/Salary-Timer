import type { Metadata } from "next";
import { HomeContent } from "@/components/HomeContent";

const ZH_TITLE = "薪资计时器 — 免费实时计薪与收入计算";
const ZH_DESCRIPTION =
  "免费实时计薪器，按薪资、排班与无薪休息估算今日税前收入，显示每秒、每分钟和每小时的收入，支持在兼容的桌面浏览器中打开悬浮计薪。";

export const metadata: Metadata = {
  title: { absolute: ZH_TITLE },
  description: ZH_DESCRIPTION,
  alternates: {
    canonical: "/zh/",
    languages: { en: "/", "zh-CN": "/zh/", "x-default": "/" },
  },
  openGraph: {
    title: ZH_TITLE,
    description: ZH_DESCRIPTION,
    url: "/zh/",
    locale: "zh_CN",
  },
};

/** Chinese homepage — a separate prerendered route, not a client-side toggle. */
export default function ZhHomePage() {
  return <HomeContent lang="zh" />;
}
