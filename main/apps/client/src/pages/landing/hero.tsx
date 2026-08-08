import { Link, NavLink } from "react-router";
import { ArrowRightIcon } from "lucide-react";

import AnimatedGradientBackground from "@/components/animated-gradient-bg";
import { STATS } from "./data";

export function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 pt-20 border-b">
      <AnimatedGradientBackground />

      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <span className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
          Live multiplayer quiz platform
        </span>
        <h1 className="text-3xl md:text-5xl lg:text-7xl font-bold text-center leading-none">
          PROVE WHAT YOU KNOW.
        </h1>

        <p className="md:text-lg text-sm max-w-xs md:max-w-full text-muted-foreground my-8 text-center">
        Create quizzes, challenge your friends, compete in real time. The knowledge arena where every question is a chance to shine.
        </p>

        <div
          className="flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Link
            to="/signup"
            className="group flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-background transition-all hover:bg-primary/90 active:scale-95"
          >
            Start for free
            <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <NavLink to="#how-it-works" 
            className="rounded-xl border border-muted-foreground/10 bg-muted-foreground/5 px-6 py-3 text-sm font-medium text-muted-foreground transition-all hover:bg-muted-foreground/10 hover:text-primary"
          >
            See how it works
          </NavLink>
        </div>

        <div
          className="mt-16 flex items-center justify-center gap-8"
        >
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-xl font-black tracking-tight text-white md:text-2xl">{stat.value}</div>
              <div className="text-xs tracking-wide text-white/40 uppercase">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
