import { useEffect, useState } from "react";

import {
  animate,
  motion,
  type MotionValue,
  useMotionValue,
  useTransform,
} from "motion/react";

const moments = [
  { time: "01:24", title: "The unexpected answer", score: 96 },
  { time: "04:18", title: "A story worth sharing", score: 91 },
  { time: "07:52", title: "The turning point", score: 88 },
  { time: "11:06", title: "A surprising takeaway", score: 94 },
  { time: "15:33", title: "The closing thought", score: 86 },
];

const MOMENT_HEIGHT = 56;
const MOMENT_CYCLE = moments.length * MOMENT_HEIGHT;

function MomentRow({
  index,
  offset,
}: {
  index: number;
  offset: MotionValue<number>;
}) {
  const moment = moments[index % moments.length];
  const scale = useTransform(offset, (position) => {
    const distance = Math.abs(
      position + index * MOMENT_HEIGHT + MOMENT_HEIGHT / 2 - 112
    );
    return 1 + Math.max(0, 1 - distance / 90) * 0.08;
  });
  const opacity = useTransform(offset, (position) => {
    const distance = Math.abs(
      position + index * MOMENT_HEIGHT + MOMENT_HEIGHT / 2 - 112
    );
    return 0.48 + Math.max(0, 1 - distance / 110) * 0.52;
  });

  return (
    <motion.div
      style={{ scale, opacity, height: MOMENT_HEIGHT }}
      className="flex items-center px-1"
    >
      <div className="flex h-12 w-full items-center gap-2 rounded-lg border border-white/15 bg-[#292929] px-2 shadow-lg">
        <span className="w-11 shrink-0 font-mono text-[10px] text-white/60">
          {moment.time}
        </span>
        <span className="min-w-0 flex-1 truncate text-[11px] font-medium text-white">
          {moment.title}
        </span>
        <span className="rounded-md border border-white/25 bg-white/10 px-1.5 py-1 font-mono text-[10px] text-white">
          {moment.score}
        </span>
      </div>
    </motion.div>
  );
}

export function ViralDetectionScene({ active }: { active: boolean }) {
  const offset = useMotionValue(-MOMENT_CYCLE);

  useEffect(() => {
    if (!active) return;
    const controls = animate(offset, [-MOMENT_CYCLE, 0], {
      duration: 12,
      ease: "linear",
      repeat: Infinity,
      repeatType: "loop",
    });
    return () => controls.stop();
  }, [active, offset]);

  return (
    <div className="relative grid h-full place-items-center">
      <div className="relative h-56 w-full max-w-80 px-2 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_22%,black_78%,transparent)]">
        <motion.div style={{ y: offset }}>
          {Array.from({ length: moments.length * 2 }, (_, index) => (
            <MomentRow key={index} index={index} offset={offset} />
          ))}
        </motion.div>
      </div>
      <div className="pointer-events-none absolute top-1/2 h-14 -translate-y-1/2 rounded-lg border border-white/35 bg-white/5 shadow-[0_0_30px_#ffffff12] w-full" />
    </div>
  );
}

const clipParts = [
  { title: "HOOK", width: "27%" },
  { title: "STORY", width: "43%" },
  { title: "PAYOFF", width: "30%" },
];
const waveform = [
  25, 43, 72, 42, 85, 52, 32, 77, 98, 54, 40, 72, 31, 58, 38, 86, 49, 28, 65,
  93, 46, 70, 39, 55,
  25, 43, 72, 42, 85, 52, 32, 77, 98, 54, 40, 72, 31, 58, 38, 86, 49, 28, 65,
  93, 46, 70, 39, 55,
];

function TimelineClip({
  index,
  progress,
  title,
  width,
}: {
  index: number;
  progress: MotionValue<number>;
  title: string;
  width: string;
}) {
  const centers = [0.135, 0.485, 0.85];
  const opacity = useTransform(
    progress,
    (position) =>
      0.35 + Math.max(0, 1 - Math.abs(position - centers[index]) / 0.28) * 0.65
  );
  return (
    <motion.div
      style={{ width, opacity }}
      className="relative h-14 overflow-hidden rounded-md border border-white/30 bg-white/20 px-2 py-1.5"
    >
      <span className="font-mono text-[9px] tracking-wider text-white">
        {title}
      </span>
      <div className="absolute bottom-2 left-2 right-2 flex h-4 items-end gap-0.5">
        {waveform.slice(index * 6, index * 6 + 8).map((height, bar) => (
          <span
            key={bar}
            className="w-full rounded-sm bg-white/65"
            style={{ height: `${height}%` }}
          />
        ))}
      </div>
    </motion.div>
  );
}

export function AIEditingScene({ active }: { active: boolean }) {
  const progress = useMotionValue(0);
  const cursorLeft = useTransform(progress, [0, 1], ["2%", "98%"]);

  useEffect(() => {
    if (!active) return;
    const controls = animate(progress, [0, 1, 0], {
      duration: 7,
      times: [0, 0.78, 1],
      ease: "easeInOut",
      repeat: Infinity,
      repeatType: "loop",
    });
    return () => controls.stop();
  }, [active, progress]);

  return (
    <div className="flex h-full flex-col justify-center">
      <div className="mx-auto w-full max-w-84">
        <div className="flex items-center justify-between text-[10px] text-white/55">
          <span>AI EDITOR · SEQUENCE 01</span>
          <span>00:42</span>
        </div>
        <div className="relative mt-5">
          <div className="mb-1 flex justify-between font-mono text-[9px] text-white/45">
            <span>00:00</span>
            <span>00:15</span>
            <span>00:30</span>
            <span>00:45</span>
          </div>
          <div className="relative flex gap-1">
            {clipParts.map((part, index) => (
              <TimelineClip
                key={part.title}
                index={index}
                progress={progress}
                {...part}
              />
            ))}
          </div>
          <div className="mt-2 flex h-10 items-center gap-0.5 overflow-hidden rounded-md border border-white/20 bg-white/5 px-2">
            {waveform.map((height, index) => (
              <span
                key={index}
                className="w-full rounded-sm bg-white/50"
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
          <span className="absolute bottom-0 top-4 left-[27%] border-l border-dashed border-white/25" />
          <span className="absolute bottom-0 top-4 left-[70%] border-l border-dashed border-white/25" />
          <motion.div
            style={{ left: cursorLeft }}
            className="absolute -bottom-1 top-3 z-10 w-px -translate-x-1/2 bg-white shadow-[0_0_10px_#fff]"
          >
            <span className="absolute -top-1 left-1/2 size-2 -translate-x-1/2 rotate-45 bg-white" />
          </motion.div>
        </div>
      </div>
    </div>
  );
}

const captionFrames = [
  ["One small moment", "changed everything", "for our team"],
];
const captionWords = captionFrames.flat(2).join(" ").split(" ");

export function SmartCaptionsScene({ active }: { active: boolean }) {
  const [activeWord, setActiveWord] = useState(0);
  useEffect(() => {
    if (!active) return;
    const timer = window.setInterval(
      () => setActiveWord((current) => (current + 1) % captionWords.length),
      430
    );
    return () => window.clearInterval(timer);
  }, [active]);

  let wordIndex = 0;
  return (
    <div className="flex h-full items-center justify-center gap-3">
      {captionFrames.map((lines, frameIndex) => (
        <div
          key={frameIndex}
          className="relative aspect-9/16 h-[90%] overflow-hidden rounded-xl border-2 border-white/25"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_36%,#ffffff25,transparent_45%)]" />
          <div className="absolute left-1/2 top-9 size-8 -translate-x-1/2 rounded-full bg-white/30" />
          <div className="absolute left-1/2 top-16 h-18 w-16 -translate-x-1/2 rounded-t-full bg-white/20" />
          <div className="absolute bottom-3 left-1 right-1 space-y-1 text-center">
            {lines.map((line, lineIndex) => (
              <div
                key={lineIndex}
                className="flex flex-wrap justify-center gap-x-0.5 text-[9px] leading-none"
              >
                {line.split(" ").map((word) => {
                  const currentIndex = wordIndex++;
                  return (
                    <motion.span
                      key={`${frameIndex}-${lineIndex}-${currentIndex}`}
                      animate={
                        activeWord === currentIndex
                          ? {
                            backgroundColor: "#f5f5f5",
                            color: "#171717",
                            scale: 1.08,
                          }
                          : {
                            backgroundColor: "#00000000",
                            color: "#f5f5f5",
                            scale: 1,
                          }
                      }
                      transition={{ duration: 0.2 }}
                      className="inline-block rounded px-0.5"
                    >
                      {word}
                    </motion.span>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function Face({ index, focus }: { index: number; focus: MotionValue<number> }) {
  const scale = useTransform(
    focus,
    (position) => 1 + Math.max(0, 1 - Math.abs(position - index)) * 0.1
  );
  const opacity = useTransform(
    focus,
    (position) => 0.55 + Math.max(0, 1 - Math.abs(position - index)) * 0.45
  );
  return (
    <motion.div
      style={{ scale, opacity, left: 7 + index * 39 }}
      className="absolute top-16 flex w-7 flex-col items-center"
    >
      <span className="size-6 rounded-full border border-white/40 bg-white/50" />
      <span className="mt-0.5 h-9 w-7 rounded-t-full bg-white/30" />
    </motion.div>
  );
}

export function FaceTrackingScene({ active }: { active: boolean }) {
  const focus = useMotionValue(0);
  const boxX = useTransform(focus, (position) => position * 39);

  useEffect(() => {
    if (!active) return;
    const controls = animate(focus, [0, 1, 2, 1, 0], {
      duration: 8,
      times: [0, 0.25, 0.5, 0.75, 1],
      ease: "easeInOut",
      repeat: Infinity,
      repeatType: "loop",
    });
    return () => controls.stop();
  }, [active, focus]);

  return (
    <div className="grid h-full place-items-center bg-[#171717] text-white">
      <div className="relative aspect-[9/16] h-52 overflow-hidden rounded-xl border-2 border-white/35 bg-gradient-to-b from-[#4b4b4b] to-[#202020] shadow-2xl">
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)",
            backgroundSize: "18px 18px",
          }}
        />
        {[0, 1, 2].map((index) => (
          <div
            key={`box-${index}`}
            className="absolute top-14 h-17 w-8 rounded-md border border-white/25"
            style={{ left: 5 + index * 39 }}
          />
        ))}
        {[0, 1, 2].map((index) => (
          <Face key={index} index={index} focus={focus} />
        ))}
        <motion.div
          style={{ x: boxX }}
          className="absolute left-[5px] top-14 h-17 w-8 rounded-md border-2 border-white shadow-[0_0_14px_#ffffff70]"
        >
          <span className="absolute -top-5 left-0 whitespace-nowrap rounded bg-white px-1 py-0.5 font-mono text-[7px] font-bold text-black">
            TRACKING
          </span>
        </motion.div>
        <span className="absolute bottom-3 left-3 font-mono text-[9px] tracking-widest text-white/70">
          AUTO FOCUS
        </span>
      </div>
    </div>
  );
}
