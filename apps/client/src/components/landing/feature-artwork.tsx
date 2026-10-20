import { useRef } from "react";

import { IconBrandInstagram, IconBrandYoutube } from "@tabler/icons-react";
import { CirclePlay, Download } from "lucide-react";
import { motion, useInView, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

import {
  AIEditingScene,
  FaceTrackingScene,
  SmartCaptionsScene,
  ViralDetectionScene,
} from "./feature-motion-scenes";

function ArtworkContent({ slug, active }: { slug: string; active: boolean }) {
  switch (slug) {
    case "viral-detection":
      return <ViralDetectionScene active={active} />;
    case "ai-editing":
      return <AIEditingScene active={active} />;
    case "smart-captions":
      return <SmartCaptionsScene active={active} />;
    case "face-tracking":
      return <FaceTrackingScene active={active} />;
    case "auto-reframe":
      return (
        <div className="relative flex h-full items-center justify-center gap-4 bg-[#14202b] text-sky-200">
          <div className="flex h-28 w-44 items-center justify-center rounded-lg border-2 border-sky-300/40 bg-sky-300/10">
            <div className="h-20 w-13 rounded-t-full bg-sky-200/35" />
          </div>
          <motion.div
            className="text-2xl text-sky-300"
            animate={active ? { x: [0, 7, 0] } : { x: 0 }}
            transition={
              active
                ? { duration: 1.8, repeat: Infinity, ease: "easeInOut" }
                : { duration: 0 }
            }
          >
            →
          </motion.div>
          <motion.div
            className="flex h-40 w-24 items-center justify-center rounded-xl border-2 border-sky-300 bg-sky-300/15 shadow-[0_0_40px_#38bdf844]"
            animate={
              active
                ? { x: [0, 5, 0], scale: [1, 1.04, 1] }
                : { x: 0, scale: 1 }
            }
            transition={
              active
                ? { duration: 3, repeat: Infinity, ease: "easeInOut" }
                : { duration: 0 }
            }
          >
            <div className="h-20 w-13 rounded-t-full bg-sky-200/60" />
          </motion.div>
          <span className="absolute bottom-4 left-5 font-mono text-[10px] uppercase tracking-widest">
            16:9 to 9:16
          </span>
        </div>
      );
    default:
      return (
        <div className="relative grid h-full place-items-center bg-[#241b27] text-rose-200">
          <div className="absolute size-48 rounded-full bg-rose-400/15 blur-3xl" />
          <div className="relative flex items-center gap-3">
            <motion.div
              className="grid h-32 w-19 place-items-center rounded-xl border border-rose-200/25 bg-[#37263d]"
              animate={
                active
                  ? { x: [0, -9, 0], rotate: [-12, -17, -12] }
                  : { x: 0, rotate: -12 }
              }
              transition={
                active
                  ? { duration: 3.5, repeat: Infinity, ease: "easeInOut" }
                  : { duration: 0 }
              }
            >
              <IconBrandYoutube size={28} />
            </motion.div>
            <motion.div
              className="z-10 grid h-40 w-24 place-items-center rounded-xl border border-rose-200/60 bg-[#53304a] shadow-xl"
              animate={active ? { y: [0, -7, 0] } : { y: 0 }}
              transition={
                active
                  ? { duration: 3.5, repeat: Infinity, ease: "easeInOut" }
                  : { duration: 0 }
              }
            >
              <CirclePlay size={34} />
            </motion.div>
            <motion.div
              className="grid h-32 w-19 place-items-center rounded-xl border border-rose-200/25 bg-[#37263d]"
              animate={
                active
                  ? { x: [0, 9, 0], rotate: [12, 17, 12] }
                  : { x: 0, rotate: 12 }
              }
              transition={
                active
                  ? { duration: 3.5, repeat: Infinity, ease: "easeInOut" }
                  : { duration: 0 }
              }
            >
              <IconBrandInstagram size={28} />
            </motion.div>
          </div>
          <span className="absolute bottom-4 right-5 flex items-center gap-1 text-[10px] font-semibold">
            <Download size={13} /> EXPORT READY
          </span>
        </div>
      );
  }
}

export function FeatureArtwork({
  slug,
  className,
}: {
  slug: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.2 });
  const reducedMotion = useReducedMotion();
  const active = inView && !reducedMotion;

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn(
        "relative h-56 min-h-44 overflow-hidden rounded-2xl",
        className
      )}
    >
      <ArtworkContent slug={slug} active={active} />
    </div>
  );
}
