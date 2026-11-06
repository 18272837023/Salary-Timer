import type { Metadata } from "next";
import { HomeContent } from "@/components/HomeContent";

const ZH_TITLE = "薪资计时器 — 免费实时查看你每秒赚多少钱";
const ZH_DESCRIPTION =
  "免费的薪资计时器，实时显示你每秒、每分钟、每小时赚多少钱。按真实排班、无薪休息和加班倍率计算，适合时薪、轮班和固定薪资工作者。";

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
