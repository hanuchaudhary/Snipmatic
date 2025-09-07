import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Instrument_Serif,
  Jost,
  VT323,
} from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { SessionProvider } from "next-auth/react";
import { Footer } from "@/components/Landing/Footer";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const vt323 = VT323({
  variable: "--font-vt323",
  subsets: ["latin"],
  weight: "400",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://snipmatic.online"),
  title: {
    default: "Snipmatic – Get Famous with Snipmatic",
    template: "%s | Snipmatic",
  },
  description:
    "Get famous with Snipmatic — transform any YouTube video into viral-ready shorts with AI-powered precision. Create engaging clips for TikTok, Instagram Reels, and YouTube Shorts in seconds.",
  keywords: [
    "YouTube shorts generator",
    "AI video clipper",
    "viral video maker",
    "shorts editor",
    "social media content tool",
    "AI video editing",
    "YouTube video cutter",
    "content creation tool",
    "video clipping software",
    "social media automation",
    "TikTok video maker",
    "Instagram Reels generator",
  ],
  authors: [
    { name: "Kush Chaudhary", url: "https://kushchaudhary.com" },
    { name: "Kushagra Singhal", url: "https://x.com/kuahxD" },
  ],
  creator: "Kush Chaudhary & Kushagra Singhal",
  publisher: "Snipmatic",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://snipmatic.online",
    siteName: "Snipmatic",
    title: "Snipmatic – Get Famous with Snipmatic",
    description:
      "Get famous with Snipmatic — transform any YouTube video into viral-ready shorts with AI-powered precision. Create engaging clips for TikTok, Instagram Reels, and YouTube Shorts in seconds.",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Snipmatic - Get Famous with Snipmatic",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Snipmatic – Get Famous with Snipmatic",
    description:
      "Get famous with Snipmatic — transform any YouTube video into viral-ready shorts with AI-powered precision. Create engaging clips for TikTok, Instagram Reels, and YouTube Shorts in seconds.",
    images: ["/opengraph-image.png"],
    creator: "@kuahxD",
    site: "@snipmatic",
  },
  icons: {
    icon: [
      { url: "/icon.png", sizes: "32x32", type: "image/png" },
      { url: "/icon.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/icon.png", sizes: "180x180", type: "image/png" }],
    other: [
      {
        rel: "apple-touch-icon-precomposed",
        url: "/icon.png",
      },
    ],
  },
  manifest: "/manifest.json",
  category: "technology",
  classification: "AI Video Editing Tool",
  referrer: "origin-when-cross-origin",
  alternates: {
    canonical: "https://snipmatic.online",
  },
};

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrumental",
  subsets: ["latin"],
  weight: "400",
});

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  weight: "400",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} ${jost.variable} relative antialiased`}
      >
        <SessionProvider>
          <ThemeProvider attribute="class" defaultTheme="dark">
            <main>{children}</main>
            <Footer />
            <Toaster
              position="top-center"
              className="border-none"
              toastOptions={{
                style: {
                  fontFamily: "var(--font-jost)",
                  border: "1px solid var(--border-orange-400)",
                  color: "orange",
                },
              }}
            />
            <SpeedInsights />
            <Analytics />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
