import { createBunRedisClient, Queue } from "bullmq";
import { RedisClient } from "bun";

export const PROCESS_QUEUE_NAME = "process:queue";

const REDIS_URL = process.env.REDIS_URL;
if (!REDIS_URL) {
  throw new Error("REDIS_URL is not set");
}

const rawClient = new RedisClient(REDIS_URL);
export const connection = createBunRedisClient(rawClient);

export const processQueue = new Queue(PROCESS_QUEUE_NAME, {
  connection,
});
