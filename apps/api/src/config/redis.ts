import { createBunRedisClient, Queue } from "bullmq";
import { RedisClient } from "bun";
import type { JobsOptions } from "bullmq";

export const PROCESS_QUEUE_NAME = "process-queue";

const REDIS_URL = process.env.REDIS_URL;
if (!REDIS_URL) {
  throw new Error("REDIS_URL is not set");
}

const rawClient = new RedisClient(REDIS_URL);
export const connection = createBunRedisClient(rawClient);

export const processQueue = new Queue(PROCESS_QUEUE_NAME, {
  connection,
});

export const PROCESS_JOB_OPTIONS = {
  attempts: 3,
  backoff: {
    type: "exponential",
    delay: 5_000,
  },
  removeOnComplete: 100,
  removeOnFail: 500,
} satisfies JobsOptions;
