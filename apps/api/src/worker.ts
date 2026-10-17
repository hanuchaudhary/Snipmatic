import { Worker } from "bullmq";

import { connection, PROCESS_QUEUE_NAME } from "./config/redis";

const processWorker = new Worker(
  PROCESS_QUEUE_NAME,
  async (job) => {
    console.log(job.data);
    return "done";
  },
  {
    concurrency: 100,
    connection: connection,
  }
);

processWorker.on("ready", () => {
  console.log("Worker Started");
});

processWorker.on("completed", (job) => {
  console.log(`Job ${job.id} completed`);
});

processWorker.on("failed", (job, error) => {
  console.log(`Job ${job?.id} failed: ${error}`);
});

processWorker.on("error", (error) => {
  console.log(`Error: ${error}`);
});
