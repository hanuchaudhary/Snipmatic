import type { Job } from "@snipmatic/db";
import { Inngest } from "inngest";

import { modal } from "../config/modal";

export const inngest = new Inngest({ id: "snipmatic" });

const processVideo = inngest.createFunction(
  { id: "process-video", triggers: [{ event: "process-video" }] },
  async ({ event }) => {
    const job = event.data.job as Job;

    const fn = await modal.functions.fromName("processor", "process_video");
    const res = await fn.remote([{ ...job }]);

    return { message: `Processing video ${job.id}!`, job, modalResult: res };
  }
);

export const functions = [processVideo];
