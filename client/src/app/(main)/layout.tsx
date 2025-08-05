import { Navbar } from "@/components/Landing/Navbar";
import { GradientBackground } from "@/components/ui/noisy-gradient-backgrounds";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Snipmatic | Create Clip",
  description:
    "Create and manage your content clips with Snipmatic - the ultimate clipping tool for creators, developers, and everyone",
};

export default function ClipLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div
      className={`dark:bg-black/10 bg-white/30 w-full`}
      suppressHydrationWarning
    >
      <Navbar />
      <div className="px-4">{children}</div>
      <div className="fixed left-1/2 top-[70%] -translate-x-1/2 -translate-y-1/2  z-[-1] h-screen">
        <h1 className="text-[44vh] font-instrumental text-white/60 font-black">Snipmatic</h1>
      </div>
      {/* <div className="fixed inset-0 z-[-1]">
            <GradientBackground
              gradientOrigin="bottom-middle"
              noiseIntensity={0.3}
              noisePatternSize={90}
              noisePatternRefreshInterval={6}
            />
          </div> */}
    </div>
  );
}
