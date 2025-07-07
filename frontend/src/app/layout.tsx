import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif, Jost } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Snipmatic – Instantly Create Viral Shorts from YouTube Videos",
  description:
    "Snipmatic is an AI-powered tool that turns YouTube videos into viral social media clips. Create 30–60s shorts with AI or manual selection. Perfect for TikTok, Reels, and YouTube Shorts.",
  keywords: [
    "YouTube shorts generator",
    "AI video clipper",
    "viral video maker",
    "shorts editor",
    "social media content tool",
    "ffmpeg clipping",
    "YouTube video cutter",
  ],
  authors: [{ name: "Kush Chaudhary", url: "https://kushchaudhary.com" }],
  creator: "Kush Chaudhary",
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
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <main>{children}</main>

          <Toaster position="top-center" className="border-none" />
        </ThemeProvider>
      </body>
    </html>
  );
}
