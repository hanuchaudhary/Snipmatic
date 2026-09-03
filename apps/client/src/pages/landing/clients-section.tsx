import { HeroCarousel, type HeroCarouselItem } from "@/components/ui/hero-crousal"

const VIDEOS = [
  "/video/landscape.mp4",
  "/video/potrait.mp4",
  "/video/video.mp4",
] as const

const CLIENTS: HeroCarouselItem[] = [
  {
    title: "Night Shift\nPodcast",
    image:
      "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=600&q=80",
    video: VIDEOS[0],
    accent: "#7b61ff",
  },
  {
    title: "Studio\nNorth",
    image:
      "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=600&q=80",
    video: VIDEOS[1],
    accent: "#ff4114",
  },
  {
    title: "Velvet\nCuts",
    image:
      "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=600&q=80",
    video: VIDEOS[2],
    accent: "#00c8ff",
  },
  {
    title: "Frame\nLab",
    image:
      "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=600&q=80",
    video: VIDEOS[0],
    accent: "#e5231b",
  },
  {
    title: "Signal\nRoom",
    image:
      "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?auto=format&fit=crop&w=600&q=80",
    video: VIDEOS[1],
    accent: "#2f7bff",
  },
  {
    title: "After\nHours",
    image:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=600&q=80",
    video: VIDEOS[2],
    accent: "#ff2f9c",
  },
  {
    title: "Cold\nOpen",
    image:
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80",
    video: VIDEOS[0],
    accent: "#4356c8",
  },
  {
    title: "Take\nThree",
    image:
      "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=600&q=80",
    video: VIDEOS[1],
    accent: "#14307a",
  },
  {
    title: "Clip\nHouse",
    image:
      "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=600&q=80",
    video: VIDEOS[2],
    accent: "#ff3b6b",
  },
]

export function ClientsSection() {
  return (
    <section className="relative h-[min(88svh,52rem)] px-20">
      <HeroCarousel items={CLIENTS} defaultIndex={0} autoplay autoplayDelay={4500} />
    </section>
  )
}
