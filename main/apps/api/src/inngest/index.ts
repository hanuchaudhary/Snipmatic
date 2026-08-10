import { Inngest } from "inngest";

export const inngest = new Inngest({ id: "snipmatic" });

const processVideo = inngest.createFunction(
  { id: "process-video", triggers: [{ event: "process-video" }] },
  async ({ event, step }) => {
    return { message: `Processing video ${event.data.url}!` };
  }
);

export const functions = [processVideo];
