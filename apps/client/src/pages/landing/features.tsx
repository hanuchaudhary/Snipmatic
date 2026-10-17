import { Link } from "react-router";

import { IconArrowRight } from "@tabler/icons-react";

import { FEATURES } from "@/lib/features";

import { Footer } from "./footer";
import { Navbar } from "./navbar";

export function FeaturesPage() {
  return (
    <div className="relative z-20 w-full">
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 md:px-0 pt-40 pb-20">
        <div className="md:grid grid-cols-2">
          <h2 className="heading md:text-primary! text-muted-foreground!">
            Features
          </h2>
          <div>
            <p className="heading">
              <span>Everything you need</span>
              <br />
              <span className="text-muted-foreground">
                to ship shorts, not timelines.
              </span>
            </p>
            <p className="subheading md:mt-14 mt-10">
              Snipmatic finds the highlights, crops them for TikTok, Reels, and
              Shorts, and burns in captions. No editor. No timeline.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 grid-cols-1 md:gap-4 gap-2 md:mt-20 mt-10">
          {FEATURES.map((feature) => (
            <Link
              key={feature.slug}
              to={`/features/${feature.slug}`}
              className="group relative flex flex-col bg-secondary/20 hover:bg-secondary/40 transition-all duration-300 border border-transparent hover:border-border p-10"
            >
              <span className="flex size-12 items-center justify-center rounded-full bg-secondary/60 text-foreground">
                <feature.icon className="size-6" />
              </span>

              <h3 className="subheading text-primary! mt-10">
                {feature.title}
              </h3>
              <p className="subheading text-[1.2rem]! mt-4">
                {feature.description}
              </p>

              <span className="mt-10 flex items-center gap-2 text-sm text-muted-foreground transition-colors group-hover:text-foreground">
                How it works
                <IconArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
