import { create } from "zustand";
import { MAIN_SERVER_URL } from "../../config";
import axios from "axios";
import { Task, JobStatus } from "@/types/task";

export interface VideoInfo {
  url: string;
  duration: number;
  title: string;
  thumbnail?: string;
  message?: string;
}

interface SnipStore {
  fetchVideoInfo: (url: string) => Promise<void>;
  videoInfo: VideoInfo;
  isFetching?: boolean;

  credits: number;
  fetchCredits: () => Promise<void>;

  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  pollActiveTasks: () => Promise<void>;
  startPolling: () => void;
  stopPolling: () => void;
  isPolling: boolean;
  pollingInterval?: NodeJS.Timeout;
}

export const useSnipStore = create<SnipStore>((set, get) => ({
  videoInfo: {
    url: "",
    duration: 0,
    title: "",
    thumbnail: "",
    message: "",
  },
  isFetching: false,
  fetchVideoInfo: async (url) => {
    set({ isFetching: true });
    if (url.trim() === get().videoInfo.url) {
      console.log("Video info already fetched for this URL.");
      set({ isFetching: false });
      return;
    }

    try {
      // Use local API route instead of backend server
      const response = await axios.get(
        `/api/video-info?url=${encodeURIComponent(url)}`
      );
      const data = response.data;

      console.log("Fetched video info:", data);

      set({
        videoInfo: {
          url: data.url,
          duration: data.duration,
          title: data.title,
          thumbnail: data.thumbnail,
          message: data.message,
        },
      });
    } catch (error) {
      console.error("Error fetching video info:", error);
      
      // Handle API errors gracefully
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error || "Failed to fetch video info";
        set({
          videoInfo: {
            url: "",
            duration: 0,
            title: "",
            thumbnail: "",
            message: errorMessage,
          },
        });
      }
    } finally {
      set({ isFetching: false });
    }
  },

  tasks: [],
  setTasks: (tasks) => {
    set({ tasks });
  },

  isPolling: false,
  pollingInterval: undefined,

  pollActiveTasks: async () => {
    try {
      const response = await axios.get("/api/task/active");

      if (response.data.success) {
        const activeTasks = response.data.tasks;
        const currentTasks = get().tasks;
        let hasTasksCompleted = false;

        const updatedTasks = currentTasks.map((task) => {
          const activeTask = activeTasks.find(
            (at: Task) => at.taskId === task.taskId
          );

          if (activeTask) {
            // Task is still active, update with latest info
            return { ...task, ...activeTask };
          } else if (
            !["COMPLETED", "FAILED"].includes(task.status.toUpperCase())
          ) {
            hasTasksCompleted = true;
            return {
              ...task,
              status: "COMPLETED" as JobStatus,
              progress: 100,
              completedAt: new Date().toISOString(),
              statusMessage: "Task completed",
            };
          } else {
            return task;
          }
        });

        activeTasks.forEach((activeTask: Task) => {
          if (!updatedTasks.find((task) => task.taskId === activeTask.taskId)) {
            updatedTasks.push(activeTask);
          }
        });

        set({ tasks: updatedTasks });

        console.log(
          `Polled ${activeTasks.length} active tasks${
            hasTasksCompleted ? ", some tasks completed" : ""
          }`
        );
      }
    } catch (error) {
      console.error("Error polling active tasks:", error);
    }
  },

  startPolling: () => {
    const { isPolling, pollingInterval } = get();

    if (isPolling) {
      console.log("Polling already started");
      return;
    }

    console.log("Starting task polling...");
    set({ isPolling: true });
    get().pollActiveTasks();

    const interval = setInterval(() => {
      get().pollActiveTasks();
    }, 4000);

    set({ pollingInterval: interval });
  },

  stopPolling: () => {
    const { pollingInterval } = get();

    if (pollingInterval) {
      clearInterval(pollingInterval);
      set({ pollingInterval: undefined });
    }

    set({ isPolling: false });
    console.log("Stopped task polling");
  },

  credits: 0,
  fetchCredits: async () => {
    try {
      const response = await axios.get("/api/credits");
      set({ credits: response.data.credits || 0 });
    } catch (error) {
      console.error("Error fetching credits:", error);
    }
  },
}));
