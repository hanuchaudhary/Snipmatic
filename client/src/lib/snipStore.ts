import { create } from "zustand";
import { MAIN_SERVER_URL } from "../../config";
import axios from "axios";
import { Task } from "@/types/task";

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

  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
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
      const response = await axios.get(
        `${MAIN_SERVER_URL}/video-info?url=${encodeURIComponent(url)}`
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
    } finally {
      set({ isFetching: false });
    }
  },
  tasks: [],
  setTasks: (tasks) => {
    set({ tasks });
  },
}));
