import type { Metadata } from "next";
import { HomeContent } from "@/components/HomeContent";
import { SITE_DESCRIPTION, SITE_TITLE, SOCIAL_IMAGE } from "@/lib/site";

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
  twitter: { card: "summary_large_image", title: SITE_TITLE, description: SITE_DESCRIPTION, images: [SOCIAL_IMAGE.url] },
  openGraph: {
    images: [SOCIAL_IMAGE],
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: "/",
  },
};

export default function HomePage() {
  return <HomeContent lang="en" />;
}
