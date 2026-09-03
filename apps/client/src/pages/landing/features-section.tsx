import { Captions, Clapperboard, ScanFace, Share2, Sparkles } from "lucide-react"
import { motion } from "motion/react"

const HOOK_BARS = [
  18, 28, 22, 46, 34, 62, 40, 88, 70, 52, 30, 24, 36, 58, 44, 26, 20, 32, 48, 38,
  72, 54, 28, 22, 16, 24, 42, 64, 50, 28, 18,
]

const CAPTION_WORDS = ["wait", "that's", "the", "hook"]

const JOBS = [
  { label: "Hook at 12:41", state: "Ready", tone: "ready" },
  { label: "Crop 9:16 · face track", state: "Burning", tone: "busy" },
  { label: "Captions · word timing", state: "Queued", tone: "wait" },
]

export function FeaturesSection() {
  return (
    <section className="px-20 pb-20">
      <div className="mx-auto grid border border-border md:grid-cols-2">
        <div className="flex min-h-0 flex-col">
          <div className="p-6 sm:p-12">
            <span className="text-muted-foreground flex items-center gap-2">
              <Sparkles className="size-4" />
              Viral detection
            </span>
            <p className="mt-8 text-2xl font-semibold text-balance">
              Drop a long YouTube. We mark the moments that actually hook.
            </p>
          </div>

          <div aria-hidden className="relative mt-auto">
            <div className="absolute inset-0 z-10 m-auto size-fit">
              <div className="relative z-[1] flex w-fit items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium shadow-md shadow-black/20 dark:bg-muted">
                <span className="size-1.5 rounded-full bg-orange-400" />
                Hook at 12:41 · 0:27 clip
              </div>
              <div className="absolute inset-2 -bottom-2 -z-0 mx-auto rounded-md border border-border bg-background dark:bg-zinc-900" />
            </div>
            <Waveform />
          </div>
        </div>

        <div className="overflow-hidden border-t border-border bg-zinc-50 p-6 sm:p-12 md:border-0 md:border-l dark:bg-transparent">
          <div className="relative z-10">
            <span className="text-muted-foreground flex items-center gap-2">
              <Captions className="size-4" />
              Burned-in captions
            </span>
            <p className="my-8 text-2xl font-semibold text-balance">
              Word-level timing, already on the clip. No caption app after.
            </p>
          </div>
          <CaptionStack />
        </div>

        <div className="col-span-full border-y border-border px-6 py-12 sm:px-12">
          <p className="text-center text-4xl font-semibold tracking-tight lg:text-7xl">
            Paste. Wait. Post.
          </p>
          <p className="mx-auto mt-4 max-w-xl text-center text-muted-foreground">
            No editor. No timeline. TikTok, Reels, and Shorts from one pass.
          </p>
        </div>

        <div className="relative col-span-full overflow-hidden">
          <div className="absolute z-10 max-w-lg px-6 pt-6 pr-12 md:px-12 md:pt-12">
            <span className="text-muted-foreground flex items-center gap-2">
              <Share2 className="size-4" />
              Exports & tracking
            </span>
            <p className="my-8 text-2xl font-semibold text-balance">
              Keep faces in frame.{" "}
              <span className="text-muted-foreground">
                Crop 9:16, 1:1, 16:9 without sitting in a timeline.
              </span>
            </p>
          </div>
          <ExportStage />
        </div>
      </div>
    </section>
  )
}

function Waveform() {
  return (
    <div className="relative overflow-hidden px-6 pb-8 pt-16">
      <div className="to-background absolute inset-0 z-1 bg-[radial-gradient(var(--tw-gradient-stops))] from-transparent to-75%" />
      <div className="flex h-36 items-end justify-between gap-px">
        {HOOK_BARS.map((h, i) => {
          const hot = i >= 7 && i <= 10
          return (
            <div
              key={i}
              className={
                hot
                  ? "w-full rounded-sm bg-orange-400/90"
                  : "w-full rounded-sm bg-foreground/20"
              }
              style={{ height: `${h}%` }}
            />
          )
        })}
      </div>
      <div className="pointer-events-none absolute top-12 right-[28%] bottom-8 w-px bg-orange-400/80" />
    </div>
  )
}

function CaptionStack() {
  return (
    <div aria-hidden className="flex flex-col gap-8">
      <div>
        <div className="flex items-center gap-2">
          <span className="flex size-5 items-center justify-center rounded-full border border-border">
            <span className="size-3 rounded-full bg-primary" />
          </span>
          <span className="text-muted-foreground text-xs">00:12.41</span>
        </div>
        <div className="mt-1.5 w-4/5 rounded-md border border-border bg-background p-3 text-xs">
          <span className="flex flex-wrap gap-1 font-medium tracking-wide">
            {CAPTION_WORDS.map((word, i) => (
              <motion.span
                key={word}
                className="rounded-sm px-1 py-0.5"
                animate={{
                  backgroundColor:
                    i === 2 ? "var(--color-primary)" : "transparent",
                  color:
                    i === 2
                      ? "var(--color-primary-foreground)"
                      : "var(--color-foreground)",
                }}
                transition={{ duration: 0.35 }}
              >
                {word}
              </motion.span>
            ))}
          </span>
        </div>
      </div>

      <div>
        <div className="mb-1 ml-auto w-3/5 rounded-md bg-primary p-3 text-xs text-primary-foreground">
          Captions burned. Ready for Shorts.
        </div>
        <span className="text-muted-foreground block text-right text-xs">
          now
        </span>
      </div>
    </div>
  )
}

function ExportStage() {
  return (
    <div className="relative min-h-80 pt-40 md:min-h-96 md:pt-28">
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 flex h-56 items-end justify-end gap-3 overflow-hidden pr-6 md:h-72 md:pr-16"
      >
        <Frame label="16:9" className="h-28 w-48" />
        <Frame label="1:1" className="h-36 w-36" />
        <Frame label="9:16" className="h-52 w-28 ring-1 ring-orange-400/40" featured />
      </div>

      <ul className="relative z-10 mx-6 mb-8 max-w-sm space-y-3 md:mx-12">
        {JOBS.map((job) => (
          <li
            key={job.label}
            className="flex items-center justify-between gap-4 rounded-md border border-border bg-background/80 px-3 py-2 text-xs backdrop-blur-sm"
          >
            <span className="flex items-center gap-2">
              {job.tone === "busy" ? (
                <ScanFace className="size-3.5 text-orange-400" />
              ) : (
                <Clapperboard className="size-3.5 text-muted-foreground" />
              )}
              {job.label}
            </span>
            <span
              className={
                job.tone === "ready"
                  ? "text-orange-400"
                  : "text-muted-foreground"
              }
            >
              {job.state}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Frame({
  label,
  className,
  featured = false,
}: {
  label: string
  className: string
  featured?: boolean
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-md border border-border bg-zinc-900/80 ${className}`}
    >
      <div className="absolute inset-0 bg-[linear-gradient(160deg,rgba(255,255,255,0.08),transparent_42%,rgba(251,146,60,0.18))]" />
      <div className="absolute inset-x-2 bottom-2">
        <div
          className={`rounded-sm px-1.5 py-0.5 text-[10px] font-medium ${
            featured
              ? "bg-orange-400 text-black"
              : "bg-background/80 text-foreground"
          }`}
        >
          {label}
        </div>
      </div>
    </div>
  )
}
