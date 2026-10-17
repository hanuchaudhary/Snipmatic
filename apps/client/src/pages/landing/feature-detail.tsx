import { Link, Navigate, useParams } from "react-router";

import {
  IconArrowLeft,
  IconArrowRight,
  IconCheckFilled,
} from "@tabler/icons-react";

import { FEATURES, getFeature } from "@/lib/features";

import { Footer } from "./footer";
import { Navbar } from "./navbar";

export function FeatureDetailPage() {
  const { slug } = useParams();
  const feature = getFeature(slug);

  if (!feature) {
    return <Navigate to="/features" replace />;
  }

  const others = FEATURES.filter((item) => item.slug !== feature.slug);

  return (
    <div className="relative z-20 w-full">
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 md:px-0 pt-40 pb-20">
        <Link
          to="/features"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <IconArrowLeft className="size-4" />
          All features
        </Link>

        <div className="mt-16 max-w-3xl">
          <span className="inline-flex items-center gap-2 text-sm text-primary!">
            <feature.icon className="size-4" />
            {feature.eyebrow}
          </span>
          <h1 className="heading mt-6">
            {feature.heading}
            <br />
            <span className="text-muted-foreground">
              {feature.headingMuted}
            </span>
          </h1>
          <p className="mt-8 subheading">{feature.description}</p>
        </div>

        <div className="relative mt-16 flex items-center justify-center overflow-hidden border bg-secondary/20 md:h-100 h-56">
          <feature.icon className="md:size-40 size-24 text-primary/80" />
        </div>

        <div className="md:grid grid-cols-2 gap-16 md:mt-30 mt-20">
          <div className="space-y-6">
            {feature.body.map((paragraph) => (
              <p key={paragraph} className="subheading text-[1.2rem]!">
                {paragraph}
              </p>
            ))}
          </div>

          <ul className="space-y-4 md:mt-0 mt-12">
            {feature.highlights.map((highlight) => (
              <li key={highlight} className="flex items-start gap-3">
                <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-emerald-800/30">
                  <IconCheckFilled className="size-4 text-emerald-500!" />
                </span>
                <span className="subheading text-[1.2rem]! text-primary!">
                  {highlight}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <section className="mt-30">
          <p className="heading">How it works</p>
          <div className="grid md:grid-cols-3 grid-cols-1 md:gap-4 gap-2 mt-14">
            {feature.steps.map((step, index) => (
              <div
                key={step.title}
                className="relative border bg-secondary/20 p-10"
              >
                <span className="subheading text-[1.2rem]! text-muted-foreground!">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="subheading text-primary! mt-14">{step.title}</h3>
                <p className="subheading text-[1.2rem]! mt-4">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-30">
          <div className="border bg-secondary/20 p-10 md:p-14 flex flex-col md:flex-row md:items-center gap-8 md:justify-between">
            <div>
              <p className="heading">
                Ready to try{" "}
                <span className="text-muted-foreground">
                  {feature.title.toLowerCase()}?
                </span>
              </p>
              <p className="subheading md:text-[1.2rem]! mt-4">
                Paste a YouTube link and get clips you can post today.
              </p>
            </div>
            <Link
              to="/signup"
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-primary px-8 py-4 text-primary-foreground"
            >
              Get started
              <IconArrowRight className="size-4" />
            </Link>
          </div>
        </section>

        <section className="mt-30">
          <p className="heading">More features</p>
          <div className="grid md:grid-cols-3 grid-cols-1 md:gap-4 gap-2 mt-14">
            {others.slice(0, 3).map((item) => (
              <Link
                key={item.slug}
                to={`/features/${item.slug}`}
                className="group border bg-secondary/20 hover:bg-secondary/40 transition-all duration-300 p-10"
              >
                <span className="flex size-12 items-center justify-center rounded-full bg-secondary/60 text-foreground">
                  <item.icon className="size-6" />
                </span>
                <h3 className="subheading text-primary! mt-10">{item.title}</h3>
                <p className="subheading text-[1.2rem]! mt-4">{item.tagline}</p>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
