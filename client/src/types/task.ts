export interface Task {
  taskId: string;
  userId?: string;
  youtubeUrl: string;
  title: string;
  status: string;
  progress: number;
  thumbnailUrl?: string;
  statusMessage: string;
  errorMessage?: string;
  clipURL?: string;
  clipsData?: any;
  result?: {
    viral_moments?: any[];
    s3_urls?: string[];
    clip_paths?: string[];
    zip_s3_url?: string;
  };
  createdAt: string | Date;
  updatedAt: string | Date;
  completedAt?: string | Date | null;
  // Additional fields that might be in the database
  clipType?: string;
  duration?: number;
  multipleClips?: boolean;
  subtitle?: boolean;
  aspectRatio?: string;
  quality?: string;
  // For compatibility with ITask
  user?: {
    id: string;
    email: string;
    name?: string;
    subscription: string;
  };
}
