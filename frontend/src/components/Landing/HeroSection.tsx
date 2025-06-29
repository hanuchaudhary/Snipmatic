import React from "react";
import AnimatedGradientBackground from "../ui/animated-gradient-background";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden flex items-center justify-center border-b h-[calc(100vh-10rem)]">
      <div className="flex-1 max-w-2xl z-10 relative">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-center leading-none">
          Turn Your Videos into Viral Reels & Shorts in Minutes!
        </h1>
        <p className="text-lg text-muted-foreground my-8 text-center">
          Transform YouTube videos or uploads into engaging, AI-edited reels
          with captions, cropping, and direct uploads to YouTube Shorts or
          Instagram Reels.
        </p>
        <div className="flex flex-wrap gap-2 items-center justify-center">
          <Link href="/dashboard">
            <button className="border px-7 py-3 rounded-full transition-colors font-semibold bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer border-primary">
              Start Creating Now
            </button>
          </Link>
          <button className="border px-7 py-3 rounded-full transition-colors font-semibold dark:hover:bg-secondary cursor-pointer bg-secondary dark:bg-transparent">
            Try for Free
          </button>
        </div>
      </div>
      <AnimatedGradientBackground />
    </section>
  );
}
