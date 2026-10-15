import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { Bricolage_Grotesque, Instrument_Sans } from "next/font/google";
import "./globals.css";
import SiteChrome from "@/components/SiteChrome";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { SavedProvider } from "@/contexts/SavedContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import JsonLd from "@/components/JsonLd";
import {
  SITE_NAME,
  SITE_TAGLINE,
  absoluteUrl,
  getSiteUrl,
} from "@/lib/seo";

const display = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  display: "swap",
});

const body = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: `${SITE_NAME}: verified apartments in Nigeria`,
    template: `%s | ${SITE_NAME}`,
  },
icons: {
    icon: [{ url: "/icon.png", type: "image/png" }],
    apple: [{ url: "/apple-icon.png", type: "image/png" }],
  },
  description: SITE_TAGLINE,
  applicationName: SITE_NAME,
  keywords: [
    "apartments Nigeria",
    "short let Lagos",
    "book apartment Nigeria",
    "furnished apartment",
    "serviced apartment",
    "holiday apartment Nigeria",
    "apartments for rent Nigeria",
    "apartments",
    "accommodation",
    "Apatmentz",
    SITE_NAME,
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: absoluteUrl("/"),
    siteName: SITE_NAME,
    title: `${SITE_NAME}: verified apartments in Nigeria`,
    description: SITE_TAGLINE,
    images: [
      {
        url: "/icon.png",
        width: 512,
        height: 512,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME}: verified apartments in Nigeria`,
    description: SITE_TAGLINE,
    images: ["/apatmentz-logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  category: "travel",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f3f5f7" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0f17" },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jar = await cookies();
  const stored = jar.get("apartee_theme")?.value;
  const theme = stored === "dark" ? "dark" : "light";

  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: absoluteUrl("/"),
    logo: absoluteUrl("/apatmentz-logo.png"),
    description: SITE_TAGLINE,
    areaServed: {
      "@type": "Country",
      name: "Nigeria",
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      url: absoluteUrl("/contact"),
      availableLanguage: ["English"],
    },
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: absoluteUrl("/"),
    description: SITE_TAGLINE,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${absoluteUrl("/listings")}?location={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} h-full antialiased${
        theme === "dark" ? " dark" : ""
      }`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        <JsonLd data={[orgJsonLd, websiteJsonLd]} />
        <ThemeProvider initialTheme={theme}>
          <AuthProvider>
            <CurrencyProvider>
              <SavedProvider>
                <SiteChrome>{children}</SiteChrome>
              </SavedProvider>
            </CurrencyProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
