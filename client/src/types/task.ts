export interface Task {
  taskId: string;
  userId: string;
  youtubeUrl: string;
  title?: string;
  clipType?: string;
  thumbnailUrl?: string;
  multipleClips: boolean;
  subtitle: boolean;
  duration?: number;
  clipURL?: string;
  status: JobStatus;
  progress: number;
  statusMessage?: string;
  errorMessage?: string;
  clipsData?: any;
  createdAt: string | Date;
  updatedAt: string | Date;
  completedAt?: string | Date | null;

  // Result format for compatibility with existing UI
  result?: {
    viral_moments?: any[];
    s3_urls?: string[];
    clip_paths?: string[];
    zip_s3_url?: string;
  };
}

export type JobStatus =
  | "QUEUED"
  | "DOWNLOADING"
  | "DOWNLOADED"
  | "EXTRACTING_AUDIO"
  | "TRANSCRIBING"
  | "ANALYZING"
  | "CREATING_CLIPS"
  | "COMPLETED"
  | "FAILED";

  
export type POST_STATUS = "PENDING" | "FAILED" | "SUCCESS"
export interface IPost {
  id: string;
  userId: string
  text: string
  url?: string
  mediaKey: string
  status: POST_STATUS
  createdAt: string
  updatedAt: string
}