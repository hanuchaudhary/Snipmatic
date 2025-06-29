import React from "react";
import { CpuArchitecture } from "../ui/cpu-architecture";
import { MultipleUploadDiagram } from "./MultipleUploadDiagram";
import {
  IconAi,
  IconCpu,
  IconMessageFilled,
  IconPlayerPlayFilled,
  IconWorldUpload,
} from "@tabler/icons-react";
import ShinyText from "../ui/ShinyText";

export function FeaturesSection() {
  return (
    <section className="min-h-[calc(100vh-10rem)] border-b">
      <div className="w-full border-b">
        <div className="md:py-24 py-14 px-4 max-w-xl mx-auto">
          <h2 className="text-xl md:text-3xl font-bold text-center mb-4">
            Everything You Need to Create Viral Reels & Shorts
          </h2>
        </div>
      </div>
      <div className="">
        <div className="grid md:grid-cols-2 grid-cols-1 md:gap-8 gap-4 h-full">
          <div className="md:border-r h-full md:p-10 p-5">
            <p className="flex items-center gap-2 text-muted-foreground">
              <IconAi />
              <span className=" ">AI Editing</span>
            </p>
            <p className="font-semibold md:text-2xl text-xl mt-4">
              Our AI automatically identifies the best clips and creates
              engaging edits.
            </p>
          </div>
          <div className="h-full md:p-10 p-5">
            <p className="flex items-center gap-2 text-muted-foreground">
              <IconMessageFilled className="w-5 h-5" />
              <span className="">Auto Captions</span>
            </p>
            <p className="font-semibold md:text-2xl text-xl mt-4">
              Generate accurate captions in seconds, making your content
              accessible to everyone.
            </p>
            <div className="pb-6 pt-14 w-full flex flex-col items-center justify-center">
              <div className="flex items-center justify-center w-20 h-20 rounded-full bg-secondary/30 text-primary">
                <IconPlayerPlayFilled className="h-10 w-10 animate-in" />
              </div>
              <ShinyText
                text='"Transform your moments into viral sensations in just seconds!"'
                disabled={false}
                speed={3}
                className="italic text-sm text-muted-foreground mt-4"
              />
            </div>
          </div>
        </div>
        <div className="grid md:grid-cols-2 grid-cols-1 md:gap-8 gap-4 h-full border-t">
          <div className="md:border-r border-b h-full md:p-10 p-5">
            <p className="flex items-center gap-2 text-muted-foreground">
              <IconWorldUpload className="w-5 h-5" />
              <span className=" ">One-Click Social Uploads</span>
            </p>
            <p className="font-semibold md:text-2xl text-xl mt-4">
              Upload directly to YouTube Shorts or Instagram Reels without
              leaving the app.
            </p>
            <MultipleUploadDiagram />
          </div>
          <div className="h-full md:p-10 p-5">
            <p className="flex items-center gap-2 text-muted-foreground">
              <IconCpu className="w-5 h-5" />
              <span className="">Fast & Scalable</span>
            </p>
            <p className="font-semibold md:text-2xl text-xl mt-4">
              Process videos in minutes with our cloud-based, high-speed
              pipeline.
            </p>
            <div className="md:pb-0">
              <CpuArchitecture />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
