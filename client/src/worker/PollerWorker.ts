import { connection } from "@/lib/redis";
import { Worker } from "bullmq";
import { prisma } from "@/lib/prisma";
import { BACKEND_URL } from "../../config";

new Worker(
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

        await prisma.task.update({
          where: { taskId, userId },
          data: {
            status: data.status,
            progress: data.progress,
            statusMessage: data.statusMessage,
            errorMessage: data.errorMessage || null,
            clipURL: data.clipURL || null,
            completedAt: ["COMPLETED", "FAILED"].includes(data.status)
              ? new Date(data.completedAt || new Date())
              : null,
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
  { connection }
);
