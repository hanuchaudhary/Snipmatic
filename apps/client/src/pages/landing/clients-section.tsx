import { HeroCarousel, type HeroCarouselItem } from "@/components/ui/hero-crousal"

const VIDEOS = [
  "/video/landscape.mp4",
  "/video/potrait.mp4",
  "/video/video.mp4",
] as const

const CLIENTS: HeroCarouselItem[] = [
  {
    title: "Podcast\nconversation",
    image:
      "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=600&q=80",
    video: VIDEOS[0],
    accent: "#7b61ff",
  },
  {
    title: "Studio\ninterview",
    image:
      "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=600&q=80",
    video: VIDEOS[1],
    accent: "#ff4114",
  },
  {
    title: "Short\nscene",
    image:
      "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=600&q=80",
    video: VIDEOS[2],
    accent: "#00c8ff",
  },
  {
    title: "Wide\nshot",
    image:
      "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=600&q=80",
    video: VIDEOS[0],
    accent: "#e5231b",
  },
  {
    title: "Vertical\nvideo",
    image:
      "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?auto=format&fit=crop&w=600&q=80",
    video: VIDEOS[1],
    accent: "#2f7bff",
  },
  {
    title: "Music\nmoment",
    image:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=600&q=80",
    video: VIDEOS[2],
    accent: "#ff2f9c",
  },
  {
    title: "Opening\nscene",
    image:
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80",
    video: VIDEOS[0],
    accent: "#4356c8",
  },
  {
    title: "Portrait\nclip",
    image:
      "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=600&q=80",
    video: VIDEOS[1],
    accent: "#14307a",
  },
  {
    title: "Video\nexcerpt",
    image:
      "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=600&q=80",
    video: VIDEOS[2],
    accent: "#ff3b6b",
  },
]

export function ClientsSection() {
  return (
    <section className="relative md:py-20 py-10 md:px-0 px-4 max-w-7xl mx-auto">
      <div className="grid grid-cols-2">
        <h2 className="heading">
          Made for more than podcasts
        </h2>
        <div>
          <div className="heading">
            <span>
              Any long-form story
            </span>
            <br />
            <span className="text-muted-foreground">
              can become a short worth sharing.
            </span>
          </div>
          <p className="subheading text-[1.2rem]! mt-4">
            Interviews, lessons, conversations, performances, and studio footage
            all fit the same simple workflow.
          </p>
        </div>
      </div>
      <HeroCarousel className="mt-20" items={CLIENTS} defaultIndex={0} autoplay autoplayDelay={4500} />
    </section>
  )
}
