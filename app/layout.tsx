import type { Metadata, Viewport } from "next";
import { Baloo_2, Nunito } from "next/font/google";
import { Analytics } from "@/components/Analytics";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { I18nProvider } from "@/lib/i18n";
import { SettingsProvider, ToastProvider } from "@/lib/store";
import { OG_IMAGE, ORGANIZATION_ID, SAME_AS, SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL } from "@/lib/site";
import "./globals.css";

// Fonts are downloaded at build time and served from our own domain — no
// render-blocking request to fonts.googleapis.com, and no font swap in regions
// where that host is slow.
const baloo = Baloo_2({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-baloo",
  display: "swap",
});

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${baloo.variable} ${nunito.variable}`}>
      <head>
        {/* Agentic Resource Discovery. Lighthouse resolves <link rel="ard">
            before probing /.well-known/ard.json, so advertising a non-hidden
            path is enough for discovery — and it survives `scp out/*`, which
            does not match dot-directories. The deploy step also mirrors this
            file into /.well-known/ for consumers that only check that path. */}
        <link rel="ard" href="/ard.json" />
      </head>
      <body>
        {/* RootLayout cannot see the pathname under `output: "export"`, so set
            the document language synchronously before hydration. The I18nProvider
            keeps it in sync from then on. Without this, /zh would ship an
            <html lang="en"> in its raw HTML and only correct it after React boots. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "if(location.pathname==='/zh'||location.pathname.indexOf('/zh/')===0)document.documentElement.lang='zh-CN'",
          }}
        />
        <script
          type="application/ld+json"
          // Structured data is generated from our own constants — no user input.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
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
