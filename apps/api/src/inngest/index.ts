import type { Project } from "@snipmatic/db";
import { Inngest } from "inngest";

import { modal } from "../config/modal";

export const inngest = new Inngest({ id: "snipmatic" });

const processVideo = inngest.createFunction(
  { id: "process-video", triggers: [{ event: "process-video" }] },
  async ({ event }) => {
    const project = event.data.project as Project;

    const fn = await modal.functions.fromName("processor", "process_video");
    const res = await fn.remote([{ ...project, ...event.data }]);

    return {
      message: `Processing video ${project.id}!`,
      project,
      modalResult: res,
    };
  }
);

export const functions = [processVideo];
