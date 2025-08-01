import { connection } from "@/lib/redis";
import { Worker } from "bullmq";
import { prisma } from "@/lib/prisma";
import { BACKEND_URL } from "../../config";

const taskStatusWorker = new Worker(
  "task-status",
  async (job) => {
    const { taskId, userId } = job.data;

    const poll = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/status/${taskId}`);
        if (!response.ok) { 
          throw new Error(
            `Failed to fetch task status: ${response.statusText}`
          );
        }

        const data = await response.json();

        console.log(
          `Polling task status for taskId: ${taskId} progress: ${data.progress} status: ${data.status}`
        );

        await prisma.task.update({
          where: { taskId, userId },
          data: {
            status: data.status,
            progress: data.progress,
            statusMessage: data.statusMessage,
            errorMessage: data.errorMessage || "",
            clipURL: data.result.s3_urls[0] || "",
            completedAt: ["COMPLETED", "FAILED"].includes(data.status)
              ? new Date(data.completedAt || new Date())
              : null,
            clipsData: data.result.viral_moments || null,
          },
        });

        if (["COMPLETED", "FAILED"].includes(data.status)) {
          clearInterval(interval);
          await job.remove();
          console.log(`Job ${job.id} for task ${taskId} finished.`);
        }
      } catch (error) {
        console.error("Error polling task status:", error);
      }
    };

    const interval = setInterval(poll, 4000);
    await poll();
  },
  { connection, concurrency: 1, autorun: true }
);

taskStatusWorker.on("completed", (job) => {
  console.log(`Job ${job.id} completed successfully.`);
});

taskStatusWorker.on("failed", (job, err) => {
  console.error(`Job ${job?.data} failed with error: ${err.message}`);
});

taskStatusWorker.on("error", (err) => {
  console.error("Worker encountered an error:", err);
});

taskStatusWorker.on("active", (job) => {
  console.log(`Job ${job.id} is now active.`);
});
