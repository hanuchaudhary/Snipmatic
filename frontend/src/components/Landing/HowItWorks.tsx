import type React from "react";
import PlusIcon from "./PlusIcon";

export function HowItWorks() {
  return (
    <section className="relative bg-secondary/30 border-b py-16 px-6 md:px-16">
      <div className="absolute -top-4 -left-4">
        <PlusIcon />
      </div>
      <div className="absolute -bottom-4 -right-4">
        <PlusIcon />
      </div>

      <div className="grid md:grid-cols-3 gap-12 items-center">
        <div className="md:col-span-2 space-y-6">
          <h2 className="text-3xl md:text-4xl font-semibold">
            <span className="">How it works?</span>{" "}
            <span className="text-muted-foreground">
              Let AI do the heavy lifting.
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Just <span className="text-blue-400 font-medium">upload</span> a
            video, let our{" "}
            <span className="text-purple-400 font-medium">AI edit</span> it, and{" "}
            <span className="text-green-400 font-medium">share</span> your
            perfect reel.
          </p>
          <div className="flex flex-wrap gap-4">
            <button className="dark:bg-white bg-neutral-200 text-black md:px-6 px-4 md:py-3 py-1.5 md:text-base text-sm rounded-full font-medium hover:bg-neutral-200 transition cursor-pointer">
              Get Started
            </button>
            <button className="bg-neutral-900 text-white md:px-6 md:py-3 px-4 py-1.5 md:text-base text-sm rounded-full border border-neutral-800 hover:bg-neutral-800 transition cursor-pointer">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
