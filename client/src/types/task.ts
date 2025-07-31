// Task-related type definitions

export interface ViralMoment {
  start_time: number;
  end_time: number;
  content: string;
  reason: string;
  confidence_score: number;
}

export type TaskStatus = "PROCESSING" | "COMPLETED" | "FAILED";
export type ClipType = "MANUAL" | "AI";
export type AspectRatio = "16:9" | "9:16" | "1:1" | "4:3";
export type VideoQuality = "720p" | "1080p" | "4K" | "480p";

export interface BaseTask {
  id: string;
  title: string;
  youtubeUrl: string;
  duration: number; // in seconds
  quality: VideoQuality;
  createdAt: string; // ISO date string
  completedAt?: string; // ISO date string
  status: TaskStatus;
  aspectRatio: AspectRatio;
}

export interface ManualTask extends BaseTask {
  clipType: "MANUAL";
  startTime: number; // in seconds
  endTime: number; // in seconds
}

export interface AITask extends BaseTask {
  clipType: "AI";
  multipleClips: boolean;
  viralMoments?: ViralMoment[]; // Only available when status is COMPLETED
}

export type Task = ManualTask | AITask;

// Type guards to help with type checking

export const isManualTask = (task: Task): task is ManualTask => {
  return task.clipType === "MANUAL";
};

export const isAITask = (task: Task): task is AITask => {
  return task.clipType === "AI";
};

export const isCompletedTask = (task: Task): boolean => {
  return task.status === "COMPLETED";
};

export const hasViralMoments = (task: Task): task is AITask & { viralMoments: ViralMoment[] } => {
  return isAITask(task) && task.viralMoments !== undefined && task.viralMoments.length > 0;
};
