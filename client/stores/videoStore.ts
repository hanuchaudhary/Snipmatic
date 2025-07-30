import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export type VideoJobStatus =
  | "PENDING"
  | "QUEUED"
  | "DOWNLOADING"
  | "TRANSCRIBING"
  | "CREATING_CLIPS"
  | "COMPLETED"
  | "FAILED";

export interface VideoJob {
  id: string;
  userId: string;
  taskId?: string;
  youtubeUrl: string;
  title?: string;
  s3Key?: string;
  status: VideoJobStatus;
  progress: number;
  statusMessage?: string;
  errorMessage?: string;
  clipsData?: any;
  s3Urls?: string[];
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

interface VideoJobStore {
  jobs: VideoJob[];
  activePollingJobs: Set<string>;
  isPolling: boolean;

  addJob: (job: VideoJob) => void;
  updateJob: (id: string, updates: Partial<VideoJob>) => void;
  removeJob: (id: string) => void;
}

export const useVideoJobStore = create<VideoJobStore>()(
  subscribeWithSelector((set, get) => ({
    jobs: [],
    activePollingJobs: new Set(),
    isPolling: false,

    addJob: (job) => {
      set((state) => ({
        jobs: [job, ...state.jobs],
      }));
    },

    updateJob: (id, updates) => {
      set((state) => ({
        jobs: state.jobs.map((job) =>
          job.id === id ? { ...job, ...updates, updatedAt: new Date() } : job
        ),
      }));
    },

    removeJob: (id) => {
      set((state) => ({
        jobs: state.jobs.filter((job) => job.id !== id),
      }));
    },
  }))
);

export const getStatusColor = (status: VideoJobStatus): string => {
  switch (status) {
    case "PENDING":
    case "QUEUED":
      return "bg-gray-500";
    case "DOWNLOADING":
    case "TRANSCRIBING":
    case "CREATING_CLIPS":
      return "bg-blue-500";
    case "COMPLETED":
      return "bg-green-500";
    case "FAILED":
      return "bg-red-500";
    default:
      return "bg-gray-500";
  }
};

// Helper function to get status display text
export const getStatusText = (status: VideoJobStatus): string => {
  switch (status) {
    case "PENDING":
      return "Pending";
    case "QUEUED":
      return "Queued";
    case "DOWNLOADING":
      return "Downloading";
    case "TRANSCRIBING":
      return "Transcribing";
    case "CREATING_CLIPS":
      return "Creating Clips";
    case "COMPLETED":
      return "Completed";
    case "FAILED":
      return "Failed";
    default:
      return "Unknown";
  }
};
