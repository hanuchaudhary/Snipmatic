import { Inngest } from "inngest";

import { modal } from "../config/modal";

export const inngest = new Inngest({ id: "snipmatic" });

const processVideo = inngest.createFunction(
  { id: "process-video", triggers: [{ event: "process-video" }] },
  async ({ event, step }) => {
    const url = event.data.url as string;

    const result = await step.run("modal-process-video", async () => {
      const fn = await modal.functions.fromName("processor", "process_video");
      return await fn.remote([url]);
    });

    return { message: `Processing video ${url}!`, result };
  }
);

export const functions = [processVideo];
