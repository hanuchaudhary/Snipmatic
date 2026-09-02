export interface Task {
  taskId: string;
  title: string;
  status: "COMPLETED" | "PROCESSING" | "FAILED";
  clipType: "AI" | "Manual";
  progress?: number;
  youtubeUrl: string;
  thumbnailUrl?: string;
  createdAt: string;
  completedAt?: string;
  duration: number; // Duration in seconds
  clipsData?: {
    viral_moments?: Array<{
      reason: string;
      content: string;
      confidence_score: number; // Confidence score between 0 and 1
    }>;
    [key: string]: any; // Allow for additional properties
  };
  errorMessage?: string; // Optional error message for failed tasks
  clipURL: string; // URL to the generated clip

}

export const dummyTasks: Task[] = [
  {
    taskId: "task-1",
    title: "The Ultimate Guide to React in 2024",
    status: "COMPLETED",
    clipType: "AI",
    progress: 100,
    youtubeUrl: "/placeholder.png",
    thumbnailUrl: "/placeholder.png",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    completedAt: new Date().toISOString(),
    duration: 120,
    clipsData: {
      viral_moments: [
        {
          reason: "Mind-blowing explanation of Hooks",
          content: "The speaker perfectly explains how useEffect works under the hood with a great analogy.",
          confidence_score: 0.98
        },
        {
          reason: "Hilarious bug moment",
          content: "Live coding goes wrong in the funniest way possible.",
          confidence_score: 0.85
        }
      ]
    }
  },
  {
    taskId: "task-2",
    title: "Top 10 AI Tools You Must Try",
    status: "PROCESSING",
    clipType: "AI",
    progress: 65,
    youtubeUrl: "/placeholder.png",
    createdAt: new Date().toISOString(),
    duration: 300
  },
  {
    taskId: "task-3",
    title: "Failed Processing Example",
    status: "FAILED",
    clipType: "Manual",
    progress: 30,
    youtubeUrl: "/placeholder.png",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    duration: 180,
    errorMessage: "Could not download the video due to an unexpected error."
  }
] as any; // Cast as any just in case the type has additional required fields
