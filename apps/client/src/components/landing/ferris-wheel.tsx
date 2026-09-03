import type { CSSProperties } from "react";

const CLIP_STILLS = [
  { src: "/image.png", alt: "Clip still" },
  { src: "/opengraph-image.png", alt: "Clip still" },
  { src: "/placeholder.png", alt: "Clip still" },
  { src: "/subtitle/subtitle1.png", alt: "Clip still" },
  {
    src: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=800&q=80",
    alt: "Podcast recording",
  },
  {
    src: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=800&q=80",
    alt: "Studio microphone",
  },
  {
    src: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=800&q=80",
    alt: "Music studio",
  },
  {
    src: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=800&q=80",
    alt: "Singer at a microphone",
  },
  {
    src: "https://images.unsplash.com/photo-1551817958-d24d99e23e4d?auto=format&fit=crop&w=800&q=80",
    alt: "Live performance",
  },
  {
    src: "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?auto=format&fit=crop&w=800&q=80",
    alt: "DJ mixer",
  },
  {
    src: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=800&q=80",
    alt: "Film camera",
  },
  {
    src: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=800&q=80",
    alt: "Concert lights",
  },
  {
    src: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80",
    alt: "Headphones on a mixer",
  },
  {
    src: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=800&q=80",
    alt: "Keyboard and synth",
  },
  {
    src: "https://images.unsplash.com/photo-1464375117522-1311d6a5b81f?auto=format&fit=crop&w=800&q=80",
    alt: "Stage lights",
  },
  {
    src: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80",
    alt: "Crowd at a show",
  },
];

export function FerrisWheel() {
  const count = CLIP_STILLS.length;

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden max-md:opacity-40 mask-[linear-gradient(to_bottom,transparent,black_12%,black_88%,transparent)]"
      aria-hidden
    >
      <div
        className="absolute top-1/2 left-[calc(100%+12vw)] size-(--wheel) -translate-x-1/2 -translate-y-1/2 max-md:left-[calc(100%+18vw)]"
        style={{ "--wheel": "min(185vh, 96rem)" } as CSSProperties}
      >
        <div className="ferris-spin relative size-full">
          {CLIP_STILLS.map((still, index) => {
            const angle = (360 / count) * index;
            return (
              <div
                key={`${still.src}-${index}`}
                className="absolute top-1/2 left-1/2"
                style={{
                  transform: `rotate(${angle}deg) translateX(calc(var(--wheel) * 0.47))`,
                }}
              >
                <div className="absolute top-0 left-0 w-[min(32vw,24rem)] aspect-video -translate-x-1/2 -translate-y-1/2 overflow-hidden border border-primary bg-background max-md:w-[min(46vw,14rem)]">
                  <img
                    src={still.src}
                    alt={still.alt}
                    className="size-full object-cover rotate-180"
                    draggable={false}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
