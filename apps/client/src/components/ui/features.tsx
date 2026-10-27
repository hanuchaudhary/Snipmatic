import {
  IconBadgeCcFilled,
  IconBubbleTextFilled,
  IconCameraFilled,
  IconCropPortraitFilled,
  IconFileDownloadFilled,
  IconFlameFilled,
  IconPlayerPlayFilled,
  IconSparklesFilled,
  IconZoomScanFilled,
} from "@tabler/icons-react";

const features = [
  {
    title: "Highlights",
    icon: IconFlameFilled,
    color: "text-orange-500",
    background: "bg-orange-500/10",
    description: "Find compelling moments automatically.",
  },
  {
    title: "AI editing",
    icon: IconSparklesFilled,
    color: "text-violet-500",
    background: "bg-violet-500/10",
    description: "Turn moments into finished short clips.",
  },
  {
    title: "Captions",
    icon: IconBubbleTextFilled,
    color: "text-amber-500",
    background: "bg-amber-500/10",
    description: "Word level captions for every clip.",
  },
  {
    title: "Face tracking",
    icon: IconCameraFilled,
    color: "text-emerald-500",
    background: "bg-emerald-500/10",
    description: "Keep the speaker in view.",
  },
  {
    title: "Reframing",
    icon: IconCropPortraitFilled,
    color: "text-sky-500",
    background: "bg-sky-500/10",
    description: "Fit wide footage to vertical feeds.",
  },
  {
    title: "Subtitles",
    icon: IconBadgeCcFilled,
    color: "text-pink-500",
    background: "bg-pink-500/10",
    description: "Choose a readable subtitle style.",
  },
  {
    title: "Clip review",
    icon: IconPlayerPlayFilled,
    color: "text-indigo-500",
    background: "bg-indigo-500/10",
    description: "Preview before exporting.",
  },
  {
    title: "Smart crop",
    icon: IconZoomScanFilled,
    color: "text-teal-500",
    background: "bg-teal-500/10",
    description: "Focus on what matters in frame.",
  },
  {
    title: "Share ready",
    icon: IconFileDownloadFilled,
    color: "text-rose-500",
    background: "bg-rose-500/10",
    description: "Download clips for your channels.",
  },
];

export function Features() {
  return (
    <section
      aria-label="Clip features"
      className="mt-12 grid grid-cols-3 gap-3 pb-10 sm:grid-cols-5 lg:grid-cols-9"
    >
      {features.map(({ title, icon: Icon, color, background, description }) => (
        <div
          key={title}
          title={description}
          className="group flex min-w-0 flex-col items-center gap-2 text-center"
        >
          <span
            className={`grid size-13 place-items-center rounded-2xl transition-transform group-hover:-translate-y-1 ${background} ${color}`}
          >
            <Icon className="size-6" />
          </span>
          <span className="text-xs leading-tight text-muted-foreground">
            {title}
          </span>
        </div>
      ))}
    </section>
  );
}
