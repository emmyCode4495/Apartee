import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Instrument_Sans } from "next/font/google";
import "./globals.css";
import SiteChrome from "@/components/SiteChrome";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { SavedProvider } from "@/contexts/SavedContext";
import { AuthProvider } from "@/contexts/AuthContext";

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
  title: {
    default: "Apartee: modern apartments, booked in minutes",
    template: "%s | Apartee",
  },
  description:
    "Book verified, furnished apartments with the full price shown up front. Pick your dates, reserve in two steps, and settle in.",
};

export const viewport: Viewport = {
  themeColor: "#0e1726",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <AuthProvider>
          <CurrencyProvider>
            <SavedProvider>
              <SiteChrome>{children}</SiteChrome>
            </SavedProvider>
          </CurrencyProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
