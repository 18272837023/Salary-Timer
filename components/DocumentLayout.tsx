import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Analytics } from "@/components/Analytics";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { I18nProvider } from "@/lib/i18n";
import { SettingsProvider, ToastProvider } from "@/lib/store";
import { OG_IMAGE, ORGANIZATION_ID, SAME_AS, SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL } from "@/lib/site";
import "@/app/globals.css";

// Reuse the shipped Latin variable fonts. Builds and page loads need no Google
// Fonts connection; original OFL licenses are included beside the font files.
const baloo = localFont({
  src: "../public/fonts/baloo2/latin.woff2",
  weight: "400 800",
  variable: "--font-baloo",
  display: "swap",
});

const nunito = localFont({
  src: "../public/fonts/nunito/latin.woff2",
  weight: "200 1000",
  variable: "--font-nunito",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  // Canonicals are declared per-page — a root `canonical: "/"` would be a
  // footgun if it ever leaked onto child routes.
  applicationName: SITE_NAME,
  category: "finance",
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_US",
    url: SITE_URL,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: `${SITE_NAME} — a live earnings counter` }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE],
  },
  icons: {
    icon: [{ url: "/icon-192.png", sizes: "192x192", type: "image/png" }],
    apple: [{ url: "/icon-192.png", sizes: "192x192" }],
  },
  manifest: "/manifest.webmanifest",
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  inLanguage: "en",
  // The Organization is declared once here, with a stable @id, so every other
  // schema block on the site can point at the same entity instead of restating
  // it in slightly different words.
  publisher: {
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: SITE_NAME,
    url: SITE_URL,
    sameAs: SAME_AS,
  },
};

export function DocumentLayout({ children, lang }: { children: React.ReactNode; lang: "en" | "zh-CN" }) {
  const localizedWebsiteSchema = { ...websiteSchema, inLanguage: lang };
  return (
    <html lang={lang} className={`${baloo.variable} ${nunito.variable}`}>
      <head>
        {/* Agentic Resource Discovery. Lighthouse resolves <link rel="ard">
            before probing /.well-known/ard.json, so advertising a non-hidden
            path is enough for discovery — and it survives `scp out/*`, which
            does not match dot-directories. The deploy step also mirrors this
            file into /.well-known/ for consumers that only check that path. */}
        <link rel="ard" href="/ard.json" />
      </head>
      <body>
        <script
          type="application/ld+json"
          // Structured data is generated from our own constants — no user input.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localizedWebsiteSchema) }}
        />
        <I18nProvider>
          <SettingsProvider>
            <ToastProvider>
              <SiteHeader />
              {children}
              <SiteFooter />
            </ToastProvider>
          </SettingsProvider>
        </I18nProvider>
        <Analytics />
      </body>
    </html>
  );
}
