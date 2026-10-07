export function FeaturesSection() {
  const features = [
    {
      title: "AI-powered",
      description: "Snipmatic finds the highlights, crops them for TikTok, Reels, and Shorts, and burns in captions. No editor. No timeline.",
    },
    {
      title: "Video editing software",
      description: "Snipmatic finds the highlights, crops them for TikTok, Reels, and Shorts, and burns in captions. No editor. No timeline.",
    },
    {
      title: "Video editing software",
      description: "Snipmatic finds the highlights, crops them for TikTok, Reels, and Shorts, and burns in captions. No editor. No timeline.",
    },
    {
      title: "Video editing software",
      description: "Snipmatic finds the highlights, crops them for TikTok, Reels, and Shorts, and burns in captions. No editor. No timeline.",
    },
  ]
  return (
    <section className="my-30 max-w-7xl mx-auto">
      <div className="grid grid-cols-2">
        <h2 className="heading">Features</h2>
        <div >
          <p className="heading">
            <span>
              AI-powered
            </span>
            <br />
            <span className="text-muted-foreground">
              Video editing software
            </span>
          </p>
          <p className="subheading mt-14">
            Snipmatic finds the highlights, crops them for TikTok, Reels, and
            Shorts, and burns in captions. No editor. No timeline.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 mt-20">
        {
          features.slice(0, 3).map((feature) => (
            <FeatureCard key={feature.title} title={feature.title} description={feature.description} />
          ))
        }
      </div>
      <div className="mt-4">
        {
          features.slice(3).map((feature) => (
            <FeatureCard key={feature.title} title={feature.title} description={feature.description} />
          ))
        }
      </div>
    </section>
  )
}

const FeatureCard = ({ title, description }: { title: string, description: string }) => {
  return (
    <div className="relative bg-secondary/20 p-14 hover:bg-secondary/50 transition-all duration-300">
      <div className="h-70"></div>
      <h3 className="subheading text-primary!">{title}</h3>
      <p className="subheading text-[1.2rem]! mt-4">{description}</p>
    </div>
  )
}