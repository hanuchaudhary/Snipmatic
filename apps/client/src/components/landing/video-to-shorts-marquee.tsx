import { useEffect, useRef, useState } from "react";

import {
  IconBrandFacebookFilled,
  IconBrandInstagram,
  IconBrandLinkedinFilled,
  IconBrandTiktokFilled,
  IconBrandYoutubeFilled,
} from "@tabler/icons-react";
import { motion, type Transition, useReducedMotion } from "motion/react";

const CYCLE = 3.6;
const thumbnails: Record<string, string[]> = {
  "/marquee/thumb1.png": [
    "/marquee/thumb1-s1.png",
    "/marquee/thumb1-s2.png",
    "/marquee/thumb1-s3.png",
    "/marquee/thumb1-s4.png",
    "/marquee/thumb1-s5.png",
  ],
};
const videos = Object.entries(thumbnails);
const randomScores = (count: number) =>
  Array.from({ length: count }, () => 80 + Math.floor(Math.random() * 20));
const sourceTransition: Transition = {
  duration: CYCLE,
  times: [0, 0.18 / CYCLE, 0.68 / CYCLE, 0.8 / CYCLE, 1],
  ease: [[0.16, 1, 0.3, 1], "linear", [0.7, 0, 0.84, 0], "linear"],
  repeat: Infinity,
};
const outputTransition: Transition = {
  duration: CYCLE,
  times: [0, 0.8 / CYCLE, 0.98 / CYCLE, 1.48 / CYCLE, 1.64 / CYCLE, 1],
  ease: ["linear", [0.16, 1, 0.3, 1], "linear", [0.7, 0, 0.84, 0], "linear"],
  repeat: Infinity,
};

const destinations = [
  { Icon: "/youtube-icon.svg" },
  { Icon: "/instagram-icon.svg" },
  { Icon: "/tiktok-icon.svg" },
  { Icon: "/x-icon.svg" },
  { Icon: "/linkedin-icon.svg" },
];

function QueueBatch({
  width,
  batch,
  still,
}: {
  width: number;
  batch: number;
  still: boolean;
}) {
  const [expanded, setExpanded] = useState(still);
  const [iteration, setIteration] = useState(0);
  const [scores, setScores] = useState(() => randomScores(5));
  const [thumbnail, shorts] = videos[(batch + iteration * 2) % videos.length]!;
  const delay = (batch * CYCLE) / 2;

  useEffect(() => {
    if (still) return;
    let interval: ReturnType<typeof setInterval> | undefined;
    const advance = () => {
      setIteration((value) => value + 1);
      setScores(randomScores(5));
    };
    const timeout = setTimeout(
      () => {
        advance();
        interval = setInterval(advance, CYCLE * 1000);
      },
      (delay + CYCLE) * 1000
    );
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [delay, still]);

  return (
    <>
      <div className="absolute inset-0 [clip-path:inset(0_50%_0_0)]">
        <motion.div
          className="absolute left-0 top-1/2 aspect-video w-[36%] overflow-hidden rounded-lg bg-[#20301d] shadow-xl"
          style={{ y: "-50%", originX: 1, originY: 0.5 }}
          initial={
            still ? false : { x: -width * 0.36, opacity: 0, scale: 0.85 }
          }
          animate={
            still
              ? { x: width * 0.08, opacity: 1, scale: 1 }
              : {
                x: [
                  -width * 0.36,
                  width * 0.08,
                  width * 0.08,
                  width * 0.14,
                  width * 0.14,
                ],
                opacity: [0, 1, 1, 0, 0],
                scale: [0.85, 1, 1, 0.04, 0.04],
              }
          }
          transition={still ? { duration: 0 } : { ...sourceTransition, delay }}
        >
          <img
            className="block size-full object-cover"
            src={thumbnail}
            alt=""
          />
          <span className="absolute left-2 top-2 grid size-7 place-items-center bg-black/70 text-[#ff4545]">
            <IconBrandYoutubeFilled size={20} />
          </span>
        </motion.div>
      </div>
      <div className="absolute inset-0 [clip-path:inset(0_0_0_50%)]">
        <motion.div
          className="absolute left-0 top-1/2 w-[32%]"
          onUpdate={(latest) => {
            const visible = Number(latest.opacity) > 0.01;
            if (!still && visible !== expanded) setExpanded(visible);
          }}
          style={{ y: "-50%", originX: 0, originY: 0.5 }}
          initial={still ? false : { x: width * 0.5, opacity: 0, scale: 0.08 }}
          animate={
            still
              ? { x: width * 0.59, opacity: 1, scale: 1 }
              : {
                x: [
                  width * 0.5,
                  width * 0.5,
                  width * 0.59,
                  width * 0.59,
                  width * 1.05,
                  width * 1.05,
                ],
                opacity: [0, 0, 1, 1, 0, 0],
                scale: [0.08, 0.08, 1, 1, 0.12, 0.12],
              }
          }
          transition={still ? { duration: 0 } : { ...outputTransition, delay }}
        >
          <motion.div
            layout
            className="grid grid-cols-6 gap-2 md:gap-3"
            transition={{
              layout: { type: "spring", stiffness: 550, damping: 28 },
            }}
          >
            {shorts.map((src, index) => {
              const { Icon } =
                destinations[index % destinations.length]!;
              return (
                <motion.div
                  layout
                  key={src}
                  className={`relative aspect-[9/16] overflow-hidden rounded-md bg-[#20301d] shadow-xl ${expanded ? "col-span-2" : "col-span-1"}`}
                  style={
                    expanded && index === 3 ? { gridColumnStart: 2 } : undefined
                  }
                  transition={{
                    layout: still
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 550, damping: 28 },
                  }}
                >
                  <img
                    className="block size-full object-cover"
                    src={src}
                    alt=""
                  />
                  <span
                    className="absolute left-1 top-1 grid size-5 place-items-center rounded-md md:left-2 md:top-2 md:size-7"
                  >
                    <img src={Icon} alt="" className="size-full object-contain" />
                  </span>
                  <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent px-1 pb-1 pt-5 text-white md:px-2 md:pb-2">
                    <span className="font-mono text-[10px] font-bold text-lime-300 md:text-sm">
                      {scores[index % scores.length]}
                    </span>
                    <span className="ml-1 text-[7px] font-medium md:text-[9px]">
                      / 100
                    </span>
                  </span>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>
      </div>
    </>
  );
}

export function VideoToShortsMarquee() {
  const reducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setWidth(entry.contentRect.width);
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      className="relative z-1 mx-auto w-full max-w-7xl p-8 md:px-0 bg-background/80 rounded-3xl"
      aria-label="A continuous queue of videos becomes five social clips arranged in two rows"
    >
      <div
        ref={containerRef}
        className="relative h-60 md:h-120 overflow-hidden mask-[linear-gradient(to_right,transparent,black_3%,black_97%,transparent)]"
        aria-hidden="true"
      >
        {width > 0 &&
          (reducedMotion ? [0] : [0, 1]).map((batch) => (
            <QueueBatch
              key={`${batch}-${!!reducedMotion}-${width}`}
              width={width}
              batch={batch}
              still={!!reducedMotion}
            />
          ))}
        <div className="absolute left-1/2 top-1/2 z-2 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center">
          <img
            src="/logo.png"
            alt=""
            className="size-16 object-contain"
          />
        </div>
      </div>
    </section>
  );
}
