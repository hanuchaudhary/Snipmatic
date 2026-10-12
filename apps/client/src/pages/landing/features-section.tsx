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
    <section className="md:my-30 my-20 max-w-7xl mx-auto md:px-0 px-4">
      <div className="md:grid grid-cols-2">
        <h2 className="heading md:text-primary! text-muted-foreground!">Features</h2>
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
          <p className="subheading md:mt-14 mt-10">
            Snipmatic finds the highlights, crops them for TikTok, Reels, and
            Shorts, and burns in captions. No editor. No timeline.
          </p>
        </div>
      </div>
      <div className="grid md:grid-cols-3 grid-cols-1 md:gap-4 gap-2 mt-20">
        {
          features.slice(0, 3).map((feature) => (
            <FeatureCard key={feature.title} title={feature.title} description={feature.description} />
          ))
        }
      </div>
      <div className="md:mt-4 mt-2">
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