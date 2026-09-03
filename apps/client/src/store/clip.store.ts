import { create } from "zustand";
import {
  DEFAULT_CLIP_CONFIGURATION,
  SUBTITLE_STYLES,
  calculateClipCredits,
  type AspectRatioId,
  type ClipMode,
  type PreviewModel,
  type ProcessModel,
} from "@snipmatic/utils";

import { ClipApi } from "@/lib/api";
import type { ClipsPageState } from "@/types/clip-navigation";

type ClipSource = "youtube" | "upload" | null;

type ClipState = {
  source: ClipSource;
  url: string;
  sourceKey?: string;
  previewUrl?: string;
  videoInfo: PreviewModel["response"] | null;
  clipRange: [number, number];
  subtitles: boolean;
  clipMode: ClipMode;
  aspectRatio: AspectRatioId;
  subtitleTemplateId?: string;
  isGettingInfo: boolean;
  isCreatingClip: boolean;
};

type ClipActions = {
  setUrl: (url: string) => void;
  setClipRange: (range: [number, number]) => void;
  setClipMode: (mode: ClipMode) => void;
  setAspectRatio: (ratio: AspectRatioId) => void;
  setSubtitles: (enabled: boolean) => void;
  setSubtitleTemplateId: (id: string | undefined) => void;
  hydrateFromPageState: (state: ClipsPageState) => void;
  setYoutubePreview: (payload: {
    url: string;
    videoInfo: PreviewModel["response"];
  }) => void;
  setUploadPreview: (payload: {
    sourceKey: string;
    previewUrl: string;
    videoInfo: PreviewModel["response"];
  }) => void;
  reset: () => void;
  fetchVideoInfo: (url: string) => Promise<void>;
  processClip: () => Promise<void>;
  getProcessingDuration: () => number;
  getEstimatedCredits: () => number;
};

const defaultConfig = {
  clipMode: DEFAULT_CLIP_CONFIGURATION.clipMode,
  aspectRatio: DEFAULT_CLIP_CONFIGURATION.aspectRatio,
  subtitles: false,
  subtitleTemplateId: undefined as string | undefined,
};

const initialState: ClipState = {
  source: null,
  url: "",
  sourceKey: undefined,
  previewUrl: undefined,
  videoInfo: null,
  clipRange: [0, 1],
  isGettingInfo: false,
  isCreatingClip: false,
  ...defaultConfig,
};

export const useClipStore = create<ClipState & ClipActions>((set, get) => ({
  ...initialState,

  setUrl: (url) => set({ url }),

  setClipRange: (clipRange) => set({ clipRange }),

  setClipMode: (clipMode) => set({ clipMode }),

  setAspectRatio: (aspectRatio) => set({ aspectRatio }),

  setSubtitles: (enabled) =>
    set((state) => ({
      subtitles: enabled,
      subtitleTemplateId:
        enabled && !state.subtitleTemplateId
          ? SUBTITLE_STYLES[0]?.name
          : state.subtitleTemplateId,
    })),

  setSubtitleTemplateId: (subtitleTemplateId) => set({ subtitleTemplateId }),

  hydrateFromPageState: (pageState) => {
    const prevPreviewUrl = get().previewUrl;

    if (prevPreviewUrl?.startsWith("blob:") && prevPreviewUrl !== pageState.previewUrl) {
      URL.revokeObjectURL(prevPreviewUrl);
    }

    set({
      source: pageState.source,
      url: pageState.url ?? "",
      sourceKey: pageState.sourceKey,
      previewUrl: pageState.previewUrl,
      videoInfo: pageState.videoInfo,
      clipRange: pageState.clipRange,
      subtitles: pageState.subtitles,
      clipMode: pageState.clipMode ?? DEFAULT_CLIP_CONFIGURATION.clipMode,
      aspectRatio: pageState.aspectRatio ?? DEFAULT_CLIP_CONFIGURATION.aspectRatio,
      subtitleTemplateId: pageState.subtitleTemplateId,
    });
  },

  setYoutubePreview: ({ url, videoInfo }) => {
    const prevPreviewUrl = get().previewUrl;

    if (prevPreviewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(prevPreviewUrl);
    }

    const duration = Math.floor(videoInfo.duration);

    set({
      source: "youtube",
      url,
      sourceKey: undefined,
      previewUrl: undefined,
      videoInfo,
      clipRange: [0, Math.max(1, duration)],
      ...defaultConfig,
    });
  },

  setUploadPreview: ({ sourceKey, previewUrl, videoInfo }) => {
    const prevPreviewUrl = get().previewUrl;

    if (prevPreviewUrl?.startsWith("blob:") && prevPreviewUrl !== previewUrl) {
      URL.revokeObjectURL(prevPreviewUrl);
    }

    set({
      source: "upload",
      url: "",
      sourceKey,
      previewUrl,
      videoInfo,
      clipRange: [0, Math.max(1, videoInfo.duration)],
      ...defaultConfig,
    });
  },

  reset: () => {
    const previewUrl = get().previewUrl;

    if (previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    set({ ...initialState });
  },

  getProcessingDuration: () => {
    const { videoInfo, clipRange } = get();

    if (!videoInfo) {
      return 0;
    }

    return clipRange[1] - clipRange[0];
  },

  getEstimatedCredits: () => {
    const { videoInfo, clipMode, subtitles } = get();

    if (!videoInfo) {
      return 0;
    }

    return calculateClipCredits({
      durationSeconds: get().getProcessingDuration(),
      subtitles: clipMode === "AI" ? subtitles : false,
    });
  },

  fetchVideoInfo: async (rawUrl) => {
    if (get().isGettingInfo) {
      return;
    }

    set({ isGettingInfo: true });

    try {
      const info = await ClipApi.preview({ url: rawUrl });

      if (!info) {
        throw new Error(
          "Unable to fetch video information. Please check the URL and try again."
        );
      }

      get().setYoutubePreview({ url: rawUrl, videoInfo: info });
    } finally {
      set({ isGettingInfo: false });
    }
  },

  processClip: async () => {
    const state = get();

    if (!state.videoInfo) {
      throw new Error("No video selected.");
    }

    if (state.clipRange[1] <= state.clipRange[0]) {
      throw new Error("Please select a valid clip duration.");
    }

    if (state.isCreatingClip) {
      return;
    }

    set({ isCreatingClip: true });

    try {
      const duration = state.getProcessingDuration();

      const payload: ProcessModel["body"] = {
        thumbnail: state.videoInfo.thumbnail || undefined,
        title: state.videoInfo.title,
        source: state.sourceKey ? "UPLOAD" : "YOUTUBE",
        sourceKey: state.sourceKey ?? state.url,
        searchFrom: state.clipRange[0],
        searchTo: state.clipRange[1],
        duration,
        clipType: state.clipMode,
        subtitleStyleKey:
          state.clipMode === "AI" && state.subtitles
            ? state.subtitleTemplateId
            : undefined,
        aspectRatio: state.aspectRatio,
      };

      await ClipApi.process(payload);
    } finally {
      set({ isCreatingClip: false });
    }
  },
}));
