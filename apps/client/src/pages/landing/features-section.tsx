import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router";

import { Pause, Play } from "lucide-react";
import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
} from "motion/react";

import { FeatureArtwork } from "@/components/landing/feature-artwork";
import { FEATURES } from "@/lib/features";

const FEATURE_DURATION = 5200;

export function FeaturesSection() {
  const location = useLocation();
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { amount: 0.1 });
  const reducedMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const feature = FEATURES[activeIndex]!;
  const playing = inView && !paused && !reducedMotion;

  useEffect(() => {
    const index = FEATURES.findIndex(
      (item) => location.hash === `#feature-${item.slug}`
    );
    if (index >= 0) {
      setActiveIndex(index);
      setPaused(false);
    }
    if (index >= 0 || location.hash === "#features") {
      sectionRef.current?.scrollIntoView({
        behavior: reducedMotion ? "instant" : "smooth",
        block: "start",
      });
    }
  }, [location.hash, location.key, reducedMotion]);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setTimeout(() => {
      setActiveIndex((index) => (index + 1) % FEATURES.length);
    }, FEATURE_DURATION);
    return () => window.clearTimeout(timer);
  }, [activeIndex, playing]);

  return (
    <section
      id="features"
      ref={sectionRef}
      className="scroll-mt-28 mx-auto my-24 max-w-7xl px-4 md:my-36 md:px-0"
      aria-labelledby="features-heading"
    >
      <div className="mx-auto mb-12 md:mb-16 flex flex-col md:flex-row items-center justify-between">
        <div>
          <h2 id="features-heading" className="heading">
            Turn the best parts of one video
            <br />
            <span className="text-muted-foreground">
              into posts for every feed.
            </span>
          </h2>
          <p className="subheading mt-5">
            Snipmatic finds the moments worth sharing, shapes each edit, and
            carries it all the way from a long recording to a published post.
          </p>
        </div>
        {!reducedMotion && (
          <button
            type="button"
            onClick={() => setPaused((value) => !value)}
            aria-label={
              paused ? "Resume feature rotation" : "Pause feature rotation"
            }
            className="relative grid size-12 shrink-0 cursor-pointer place-items-center rounded-full text-foreground transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
          >
            <svg
              className="absolute inset-0 size-full -rotate-90"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <circle
                cx="24"
                cy="24"
                r="21"
                fill="none"
                stroke="currentColor"
                strokeOpacity="0.14"
                strokeWidth="1.5"
              />
              <circle
                key={activeIndex}
                cx="24"
                cy="24"
                r="21"
                pathLength="1"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                className="feature-progress-ring"
                style={{
                  animationDuration: `${FEATURE_DURATION}ms`,
                  animationPlayState: playing ? "running" : "paused",
                }}
              />
            </svg>
            {paused ? <Play size={14} fill="currentColor" /> : <Pause size={14} fill="currentColor" />}
          </button>
        )}
      </div>

      <div className="grid overflow-hidden md:grid-cols-5">
        <div
          className="flex min-w-0 flex-col col-span-2"
          role="group"
          aria-label="Choose a feature"
        >
          {FEATURES.map((item, index) => {
            const selected = activeIndex === index;
            return (
              <button
                type="button"
                key={item.slug}
                id={`feature-selector-${item.slug}`}
                aria-pressed={selected}
                aria-controls="active-feature-detail"
                onClick={() => {
                  setActiveIndex(index);
                  setPaused(false);
                }}
                className={`group relative flex w-full cursor-pointer items-center gap-3 py-4 text-left transition-colors ${selected ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                <span className={`flex-1 subheading ${selected ? "text-foreground! underline" : "font-normal"}`}>
                  {item.title}
                </span>
              </button>
            );
          })}
        </div>

        <div
          className="min-w-0 overflow-hidden dark:bg-secondary/15 bg-secondary/50 p-10 col-span-3"
          id="active-feature-detail"
          role="region"
          aria-labelledby={`feature-selector-${feature.slug}`}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={feature.slug}
              initial={
                reducedMotion
                  ? false
                  : { opacity: 0, y: 12, filter: "blur(16px)" }
              }
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={
                reducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, y: -10, filter: "blur(14px)" }
              }
              transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
              className="flex h-full flex-col justify-between"
            >
              <FeatureArtwork
                slug={feature.slug}
                playing={playing}
                className="h-72 w-full md:h-96"
              />
              <div className="px-1 pb-2 pt-7 md:gap-8">
                <h3 className="heading max-w-sm text-[1.7rem]! leading-tight!">
                  {feature.tagline}
                </h3>
                <p className="subheading text-[1.1rem]! mt-3 max-w-md! text-pretty!">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
