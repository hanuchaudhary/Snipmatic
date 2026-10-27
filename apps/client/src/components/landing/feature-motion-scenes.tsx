import { useEffect, useState } from "react";

import {
  IconBrandFacebookFilled,
  IconBrandInstagram,
  IconBrandLinkedinFilled,
  IconBrandTiktokFilled,
  IconBrandYoutubeFilled,
} from "@tabler/icons-react";
import { Check, Send } from "lucide-react";
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
      <div className="flex h-12 w-full items-center gap-2 rounded-lg border border-foreground/15 bg-muted px-2 shadow-lg">
        <span className="w-11 shrink-0 font-mono text-[10px] text-foreground/60">
          {moment.time}
        </span>
        <span className="min-w-0 flex-1 truncate text-[11px] font-medium text-foreground">
          {moment.title}
        </span>
        <span className="rounded-md border border-foreground/25 bg-foreground/10 px-1.5 py-1 font-mono text-[10px] text-foreground">
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
    <div className="relative grid h-full place-items-center overflow-hidden bg-[radial-gradient(circle_at_50%_45%,color-mix(in_oklab,var(--foreground)_8%,transparent),transparent_58%)]">
      <div className="absolute left-5 top-4 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.2em] text-foreground/50">
        <motion.span
          className="size-1.5 rounded-full bg-emerald-500"
          animate={active ? { opacity: [0.35, 1, 0.35] } : { opacity: 0.6 }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        />
        Reading transcript
      </div>
      <div className="absolute right-5 top-4 rounded-full border border-foreground/10 bg-background/70 px-2.5 py-1 font-mono text-[9px] text-foreground/55 backdrop-blur">
        18:42 source
      </div>
      <div className="relative h-64 w-full max-w-96 overflow-hidden px-2 [mask-image:linear-gradient(to_bottom,transparent,black_22%,black_78%,transparent)]">
        <motion.div style={{ y: offset }}>
          {Array.from({ length: moments.length * 2 }, (_, index) => (
            <MomentRow key={index} index={index} offset={offset} />
          ))}
        </motion.div>
      </div>
      <div className="pointer-events-none absolute top-1/2 h-14 w-[calc(100%-1.5rem)] -translate-y-1/2 rounded-xl border border-foreground/35 bg-background/35 shadow-[0_0_35px_color-mix(in_oklab,var(--foreground)_12%,transparent)] backdrop-blur-[2px]" />
      <motion.div
        className="pointer-events-none absolute left-4 right-4 h-px bg-foreground/45 shadow-[0_0_12px_var(--foreground)]"
        animate={active ? { top: ["24%", "76%", "24%"] } : { top: "50%" }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
      />
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
  93, 46, 70, 39, 55, 25, 43, 72, 42, 85, 52, 32, 77, 98, 54, 40, 72, 31, 58,
  38, 86, 49, 28, 65, 93, 46, 70, 39, 55,
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
      className="relative h-14 overflow-hidden rounded-md border border-foreground/30 bg-foreground/20 px-2 py-1.5"
    >
      <span className="font-mono text-[9px] tracking-wider text-foreground">
        {title}
      </span>
      <div className="absolute bottom-2 left-2 right-2 flex h-4 items-end gap-0.5">
        {waveform.slice(index * 6, index * 6 + 8).map((height, bar) => (
          <span
            key={bar}
            className="w-full rounded-sm bg-foreground/65"
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
    <div className="relative flex h-full flex-col justify-center overflow-hidden bg-[radial-gradient(circle_at_75%_30%,color-mix(in_oklab,var(--foreground)_8%,transparent),transparent_45%)] px-5">
      <div className="mx-auto w-full max-w-84">
        <div className="flex items-center justify-between text-[10px] text-foreground/55">
          <span>AI EDITOR · SEQUENCE 01</span>
          <span>00:42</span>
        </div>
        <div className="relative mt-5">
          <div className="mb-1 flex justify-between font-mono text-[9px] text-foreground/45">
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
          <div className="mt-2 flex h-10 items-center gap-0.5 overflow-hidden rounded-md border border-foreground/20 bg-foreground/5 px-2">
            {waveform.map((height, index) => (
              <span
                key={index}
                className="w-full rounded-sm bg-foreground/50"
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
          <span className="absolute bottom-0 top-4 left-[27%] border-l border-dashed border-foreground/25" />
          <span className="absolute bottom-0 top-4 left-[70%] border-l border-dashed border-foreground/25" />
          <motion.div
            style={{ left: cursorLeft }}
            className="absolute -bottom-1 top-3 z-10 w-px -translate-x-1/2 bg-foreground shadow-[0_0_10px_var(--foreground)]"
          >
            <span className="absolute -top-1 left-1/2 size-2 -translate-x-1/2 rotate-45 bg-foreground" />
          </motion.div>
        </div>
        <div className="mt-5 flex items-center justify-between rounded-lg border border-foreground/10 bg-background/60 px-3 py-2 text-[9px] text-foreground/55 backdrop-blur">
          <span>3 clean cuts · filler removed</span>
          <motion.span
            className="rounded-full bg-foreground px-2 py-1 font-medium text-background"
            animate={active ? { scale: [1, 1.04, 1] } : { scale: 1 }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          >
            Edit ready
          </motion.span>
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
    <div className="relative flex h-full items-center justify-center gap-5 overflow-hidden bg-[radial-gradient(circle_at_35%_45%,color-mix(in_oklab,var(--foreground)_9%,transparent),transparent_42%)] px-4">
      {captionFrames.map((lines, frameIndex) => (
        <div
          key={frameIndex}
          className="relative aspect-9/16 h-[82%] overflow-hidden rounded-xl border-2 border-foreground/25 shadow-2xl"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_36%,#ffffff25,transparent_45%)]" />
          <div className="absolute left-1/2 top-9 size-8 -translate-x-1/2 rounded-full bg-foreground/30" />
          <div className="absolute left-1/2 top-16 h-18 w-16 -translate-x-1/2 rounded-t-full bg-foreground/20" />
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
                              backgroundColor: "var(--foreground)",
                              color: "var(--background)",
                              scale: 1.08,
                            }
                          : {
                              backgroundColor: "#00000000",
                              color: "var(--foreground)",
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
      <div className="hidden w-32 space-y-3 sm:block">
        <div>
          <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-foreground/45">
            Caption style
          </p>
          <div className="mt-2 space-y-1.5">
            {["Clean", "Pop", "Minimal"].map((style, index) => (
              <motion.div
                key={style}
                className={`rounded-lg border px-2.5 py-2 text-[10px] ${index === 1 ? "border-foreground/40 bg-foreground text-background" : "border-foreground/10 bg-background/45 text-foreground/55"}`}
                animate={active && index === 1 ? { x: [0, 3, 0] } : { x: 0 }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              >
                {style}
              </motion.div>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-foreground/10 bg-background/50 p-2.5">
          <div className="flex h-7 items-end gap-0.5">
            {[35, 70, 48, 90, 55, 76, 42, 64, 30, 82].map((height, index) => (
              <motion.span
                key={index}
                className="w-full rounded-full bg-foreground/45"
                animate={active ? { height: [`${height * 0.55}%`, `${height}%`, `${height * 0.55}%`] } : { height: `${height * 0.7}%` }}
                transition={{ duration: 1.2, delay: index * 0.06, repeat: Infinity, ease: "easeInOut" }}
              />
            ))}
          </div>
          <p className="mt-2 text-[8px] text-foreground/45">Word-perfect timing</p>
        </div>
      </div>
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
      <span className="size-6 rounded-full border border-foreground/40 bg-foreground/50" />
      <span className="mt-0.5 h-9 w-7 rounded-t-full bg-foreground/30" />
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
    <div className="grid h-full place-items-center bg-background text-foreground">
      <div className="relative aspect-[9/16] h-52 overflow-hidden rounded-xl border-2 border-foreground/35 bg-gradient-to-b from-muted to-background shadow-2xl">
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
            className="absolute top-14 h-17 w-8 rounded-md border border-foreground/25"
            style={{ left: 5 + index * 39 }}
          />
        ))}
        {[0, 1, 2].map((index) => (
          <Face key={index} index={index} focus={focus} />
        ))}
        <motion.div
          style={{ x: boxX }}
          className="absolute left-[5px] top-14 h-17 w-8 rounded-md border-2 border-foreground shadow-[0_0_14px_#ffffff70]"
        >
          <span className="absolute -top-5 left-0 whitespace-nowrap rounded bg-foreground px-1 py-0.5 font-mono text-[7px] font-bold text-background">
            TRACKING
          </span>
        </motion.div>
        <span className="absolute bottom-3 left-3 font-mono text-[9px] tracking-widest text-foreground/70">
          AUTO FOCUS
        </span>
      </div>
    </div>
  );
}

const publishDestinations = [
  { name: "YouTube", Icon: IconBrandYoutubeFilled, color: "text-red-500" },
  { name: "Instagram", Icon: IconBrandInstagram, color: "text-pink-500" },
  { name: "TikTok", Icon: IconBrandTiktokFilled, color: "text-foreground" },
  { name: "Facebook", Icon: IconBrandFacebookFilled, color: "text-blue-500" },
  { name: "LinkedIn", Icon: IconBrandLinkedinFilled, color: "text-sky-600" },
];

export function MultiPlatformScene({ active }: { active: boolean }) {
  return (
    <div className="relative flex h-full items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_32%_48%,#2563eb20,transparent_42%)] px-4 py-5 text-foreground sm:px-7">
      <div className="absolute inset-0 opacity-[0.045] [background-image:linear-gradient(currentColor_1px,transparent_1px),linear-gradient(90deg,currentColor_1px,transparent_1px)] [background-size:28px_28px]" />
      <div className="relative grid w-full max-w-lg grid-cols-[0.72fr_1.28fr] items-center gap-5 sm:gap-8">
        <div className="relative mx-auto aspect-9/16 h-48 overflow-hidden rounded-xl border border-foreground/20 bg-[#172033] shadow-2xl sm:h-56">
          <div className="absolute inset-x-0 top-0 h-2/3 bg-[radial-gradient(circle_at_50%_36%,#dbeafe55,transparent_33%)]" />
          <motion.div
            className="absolute left-1/2 top-9 size-10 -translate-x-1/2 rounded-full bg-slate-300/65"
            animate={active ? { y: [0, -2, 0] } : { y: 0 }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="absolute left-1/2 top-18 h-19 w-20 -translate-x-1/2 rounded-t-[2rem] bg-slate-400/45" />
          <div className="absolute inset-x-2 bottom-8 space-y-1 text-center text-[8px] font-semibold uppercase leading-tight text-white">
            <p><span className="bg-white px-1 text-black">Turn one idea</span></p>
            <p><span className="bg-blue-500 px-1">into five posts</span></p>
          </div>
          <div className="absolute inset-x-2 bottom-2 flex items-center justify-between text-[7px] text-white/55">
            <span>00:28</span><span>9:16</span>
          </div>
        </div>

        <div className="min-w-0">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium">Publish queue</p>
              <p className="mt-0.5 text-[9px] text-foreground/45">One clip · five channels</p>
            </div>
            <motion.span
              className="grid size-7 place-items-center rounded-full bg-foreground text-background"
              animate={active ? { rotate: [0, -8, 0] } : { rotate: 0 }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Send size={12} />
            </motion.span>
          </div>
          <div className="space-y-1.5">
            {publishDestinations.map(({ name, Icon, color }, index) => (
              <motion.div
                key={name}
                className="flex items-center gap-2 rounded-lg border border-foreground/10 bg-background/70 px-2.5 py-2 backdrop-blur"
                initial={false}
                animate={active ? { opacity: [0.55, 1, 1], x: [6, 0, 0] } : { opacity: 0.75, x: 0 }}
                transition={{ duration: 3.8, delay: index * 0.1, repeat: Infinity, repeatDelay: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <Icon className={`size-3.5 shrink-0 ${color}`} />
                <span className="min-w-0 flex-1 text-[9px] font-medium">{name}</span>
                <div className="h-1 w-10 overflow-hidden rounded-full bg-foreground/10">
                  <motion.div
                    className="h-full origin-left rounded-full bg-foreground"
                    animate={active ? { scaleX: [0, 1, 1] } : { scaleX: 0.35 }}
                    transition={{ duration: 3.5, delay: index * 0.12, repeat: Infinity, repeatDelay: 0.8, ease: "easeInOut" }}
                  />
                </div>
                <motion.span
                  animate={active ? { opacity: [0, 0, 1] } : { opacity: 0.35 }}
                  transition={{ duration: 3.5, delay: index * 0.12, repeat: Infinity, repeatDelay: 0.8 }}
                >
                  <Check className="size-3 text-emerald-500" />
                </motion.span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
