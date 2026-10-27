import { Worker } from "bullmq";
import Redis from "ioredis";
import { ProjectModel } from "@snipmatic/utils/types";

import {
  MODAL_APP_NAME,
  MODAL_ENVIRONMENT,
  MODAL_FUNCTION_NAME,
  modal,
} from "./config/modal";
import { connection, PROCESS_QUEUE_NAME } from "./config/redis";
import { ClipService } from "./modules/clip/service";

type ProcessJobData = { projectId: string };
const EVENT_CHANNEL = "snipmatic:project-events";
const subscriber = new Redis(process.env.REDIS_URL!, { maxRetriesPerRequest: null });
const publisher = new Redis(process.env.REDIS_URL!, { maxRetriesPerRequest: null });    

await subscriber.subscribe(EVENT_CHANNEL);
subscriber.on("message", async (_channel, raw) => {
  let acknowledgement: string | undefined;
  try {
    const event = JSON.parse(raw) as {
      kind: "update" | "complete";
      projectId: string;
      data: unknown;
      acknowledgement: string;
    };
    console.log("Project event", event);
    acknowledgement = event.acknowledgement;
    if (!/^snipmatic:project-ack:[0-9a-f-]{36}$/.test(acknowledgement)) {
      throw new Error("Invalid acknowledgement channel");
    }
    if (event.kind === "update") {
      await ClipService.updateProject(
        event.projectId,
        ProjectModel.updateBody.parse(event.data)
      );
    } else if (event.kind === "complete") {
      await ClipService.completeProject(
        event.projectId,
        ProjectModel.completeBody.parse(event.data)
      );
    } else {
      throw new Error("Unknown project event");
    }
    await publisher.publish(acknowledgement, JSON.stringify({ ok: true }));
  } catch (error) {
    console.error("Project event failed", error);
    if (acknowledgement) {
      await publisher.publish(
        acknowledgement,
        JSON.stringify({ ok: false, error: String(error) })
      );
    }
  }
});

const concurrency = Math.max(
  1,
  Number.parseInt(process.env.PROCESS_WORKER_CONCURRENCY ?? "4", 10) || 4
);

const processWorker = new Worker(
  PROCESS_QUEUE_NAME,
  async (job) => {
    const { projectId } = job.data as ProcessJobData;
    const payload = await ClipService.getProcessorPayload(projectId);
    const modalFunction = await modal.functions.fromName(
      MODAL_APP_NAME,
      MODAL_FUNCTION_NAME,
      MODAL_ENVIRONMENT ? { environment: MODAL_ENVIRONMENT } : undefined
    );

    console.log(`Dispatching project ${projectId} to Modal`);
    return modalFunction.remote([payload]);
  },
  {
    concurrency,
    connection: connection,
  }
);

processWorker.on("ready", () => {
  console.log("Worker Started");
});

processWorker.on("completed", (job) => {
  console.log(`Job ${job.id} completed`);
});

processWorker.on("failed", async (job, error) => {
  console.error(`Job ${job?.id} failed: ${error.message}`);
  if (!job || job.attemptsMade < (job.opts.attempts ?? 1)) return;

  const { projectId } = job.data as ProcessJobData;
  try {
    await ClipService.failProjectAndRefund(
      projectId,
      "Clip processing failed after several attempts. Please try again."
    );
  } catch (refundError) {
    console.error(`Could not finalize failed project ${projectId}`, refundError);
  }
});

processWorker.on("error", (error) => {
  console.log(`Error: ${error}`);
});
