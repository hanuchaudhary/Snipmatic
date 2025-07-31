import { useCallback, useEffect, useRef } from "react";
import { useVideoJobStore } from "../../stores/videoStore";
import axios from "axios";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
const POLLING_INTERVAL = 3000;

interface TaskStatus {
  task_id: string;
  status: string;
  progress: number;
  message?: string;
  result?: {
    viral_moments?: any[];
    clip_paths?: string[];
    s3_urls?: string[];
    zip_path?: string;
    zip_s3_url?: string;
  };
  created_at?: string;
  updated_at?: string;
}

export const useVideoJobPolling = () => {
  const { jobs, updateJob, activePollingJobs } = useVideoJobStore();

  const fetchJobStatus = useCallback(
    async (taskId: string) => {
      try {
        const response = await axios.get<TaskStatus>(
          `${BACKEND_URL}/api/video-jobs/${taskId}`
        );
        const { task_id, status, progress, message, result } = response.data;
        updateJob(task_id, {
          status: status as any, // Cast to the appropriate type, or map if needed
          progress,
          statusMessage: message,
          clipsData: result?.viral_moments || [],
          s3Urls: result?.s3_urls || [],
          completedAt: result?.zip_path ? new Date() : undefined,
        });
      } catch (error) {
        console.error(`Error fetching status for task ${taskId}:`, error);
        updateJob(taskId, {
          status: "FAILED",
          errorMessage: "Failed to fetch job status. Please try again later.",
        });
      }
    },
    [updateJob]
  );

  useEffect(() => {
    const interval = setInterval(() => {
      activePollingJobs.forEach((job) => {
        fetchJobStatus(job);
      });
    }, POLLING_INTERVAL);

    return () => clearInterval(interval);
  }, [activePollingJobs, fetchJobStatus]);
};
