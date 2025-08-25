import { BgWrapper } from "@/components/BgWrapper";
import { Navbar } from "@/components/Landing/Navbar";
import { DisclaimerPopup } from "@/components/DisclaimerPopup";
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
      className={`dark:bg-black/10 bg-secondary/30 w-full relative`}
      suppressHydrationWarning
    >
      <Navbar />
      <div>{children}</div>
      <DisclaimerPopup />
      <div className="fixed flex items-center justify-center inset-0 z-[-1] w-screen h-screen">
        <BgWrapper />
      </div>
    </div>
  );
}
