export interface ITask {
  taskId: string;
  userId: string;
  youtubeUrl: string;
  title?: string;
  clipType?: string;
  multipleClips: boolean;
  subtitle: boolean;
  duration?: number;
  clipURL?: string;
  status: JobStatus;
  progress: number;
  statusMessage?: string;
  errorMessage?: string;
  clipsData?: any;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  user: User;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  credits: number;
  tasks: ITask[];
  createdAt: Date;
  updatedAt: Date;
}

export enum JobStatus {
  PENDING = "PENDING",
  QUEUED = "QUEUED",
  DOWNLOADING = "DOWNLOADING",
  TRANSCRIBING = "TRANSCRIBING",
  CREATING_CLIPS = "CREATING_CLIPS",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}
