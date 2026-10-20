import { Link } from "react-router";

import { FeatureArtwork } from "@/components/landing/feature-artwork";
import { FEATURES } from "@/lib/features";

export function FeaturesSection() {
  return (
    <section className="md:my-30 my-20 max-w-7xl mx-auto md:px-0 px-4">
      <div className="md:grid grid-cols-2">
        <h2 className="heading md:text-primary! text-muted-foreground!">
          Features
        </h2>
        <div>
          <p className="heading">
            <span>AI-powered</span>
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
        {FEATURES.slice(0, 3).map((feature) => (
          <FeatureCard key={feature.slug} feature={feature} />
        ))}
      </div>
      <div className="md:mt-4 mt-2">
        <FeatureCard feature={FEATURES[3]} wide />
      </div>
    </section>
  );
}

function FeatureCard({
  feature,
  wide = false,
}: {
  feature: (typeof FEATURES)[number];
  wide?: boolean;
}) {
  return (
    <Link
      to={`/features/${feature.slug}`}
      className="group relative block bg-secondary/20 p-14 transition-all duration-300 hover:bg-secondary/50"
    >
      <div className="h-70">
        <FeatureArtwork
          slug={feature.slug}
          className={`h-full grayscale ${wide ? "w-full" : ""}`}
        />
      </div>
      <h3 className="subheading text-primary! mt-10">{feature.title}</h3>
      <p className="subheading text-[1.2rem]! mt-4">{feature.description}</p>
    </Link>
  );
}
