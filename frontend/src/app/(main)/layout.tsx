import { Navbar } from "@/components/Landing/Navbar";
import { GradientBackground } from "@/components/ui/noisy-gradient-backgrounds";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Snipmatic | Create Clip",
  description: "Create and manage your content clips with Snipmatic - the ultimate clipping tool for creators, developers, and everyone",
};

export default function ClipLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <div className={`dark:bg-black/10 bg-white/30 w-full`}>
        <Navbar />
        <div className="max-w-5xl mx-auto px-4">{children}</div>
          <div className="fixed inset-0 z-[-1]">
            <GradientBackground
              gradientOrigin="bottom-middle"
              noiseIntensity={0.3}
              noisePatternSize={90}
              noisePatternRefreshInterval={6}
            />
          </div>
      </div>
  );
}
