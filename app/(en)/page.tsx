import type { Metadata } from "next";
import { HomeContent } from "@/components/HomeContent";
import { SITE_DESCRIPTION, SITE_TITLE } from "@/lib/site";

export const metadata: Metadata = {
  // Absolute: do not append the layout “· Salary Timer” template on the homepage.
  title: { absolute: SITE_TITLE },
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: "/",
    // The Chinese homepage is a real, separate URL — declare the pair so the
    // two pages are understood as translations, not duplicates.
    languages: { en: "/", "zh-CN": "/zh/", "x-default": "/" },
  },
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: "/",
  },
};

export default function HomePage() {
  return <HomeContent lang="en" />;
}
