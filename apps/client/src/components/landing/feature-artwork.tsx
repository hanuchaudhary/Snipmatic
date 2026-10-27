import { useRef } from "react";

import { ScanFace } from "lucide-react";
import { motion, useInView, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

import {
  AIEditingScene,
  FaceTrackingScene,
  MultiPlatformScene,
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
        <div className="relative flex h-full items-center justify-center gap-4 overflow-hidden bg-[#101b28] px-4 text-sky-100">
          <div className="absolute inset-0 opacity-10 [background-image:linear-gradient(#bae6fd_1px,transparent_1px),linear-gradient(90deg,#bae6fd_1px,transparent_1px)] [background-size:26px_26px]" />
          <div className="absolute left-4 top-4 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.18em] text-sky-200/55">
            <ScanFace size={12} /> Active speaker locked
          </div>
          <div className="relative flex h-30 w-46 items-center justify-center overflow-hidden rounded-lg border border-sky-300/30 bg-sky-300/8">
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-sky-950/70" />
            <motion.div
              className="relative h-20 w-13 rounded-t-full bg-sky-200/35"
              animate={active ? { x: [-12, 12, -12] } : { x: 0 }}
              transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute h-22 w-16 rounded-md border border-sky-300"
              animate={active ? { x: [-12, 12, -12] } : { x: 0 }}
              transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
            />
            <span className="absolute bottom-2 left-2 font-mono text-[8px] text-sky-200/55">16:9 SOURCE</span>
          </div>
          <motion.div
            className="text-xl text-sky-300/80"
            animate={active ? { x: [0, 5, 0], opacity: [0.4, 1, 0.4] } : { x: 0, opacity: 0.6 }}
            transition={
              active
                ? { duration: 1.8, repeat: Infinity, ease: "easeInOut" }
                : { duration: 0 }
            }
          >
            →
          </motion.div>
          <motion.div
            className="relative flex h-48 w-27 items-center justify-center overflow-hidden rounded-xl border-2 border-sky-300 bg-sky-300/12 shadow-[0_0_50px_#38bdf833]"
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
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-sky-950/70" />
            <motion.div
              className="relative h-23 w-15 rounded-t-full bg-sky-200/60"
              animate={active ? { x: [-3, 3, -3] } : { x: 0 }}
              transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
            />
            <div className="absolute inset-2 rounded-lg border border-dashed border-sky-200/30" />
            <span className="absolute bottom-2 font-mono text-[8px] text-sky-100/65">9:16 READY</span>
          </motion.div>
          <span className="absolute bottom-4 right-5 rounded-full bg-sky-300/10 px-2.5 py-1 font-mono text-[8px] uppercase tracking-widest text-sky-200/70">
            Face tracking · on
          </span>
        </div>
      );
    case "multi-platform":
      return <MultiPlatformScene active={active} />;
    default:
      return null;
  }
}

export function FeatureArtwork({
  slug,
  className,
  playing = true,
}: {
  slug: string;
  className?: string;
  playing?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.2 });
  const reducedMotion = useReducedMotion();
  const active = playing && inView && !reducedMotion;

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn(
        "relative h-56 min-h-44 overflow-hidden rounded-2xl bg-background text-foreground",
        className
      )}
    >
      <ArtworkContent slug={slug} active={active} />
    </div>
  );
}
