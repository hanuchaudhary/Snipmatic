import { create } from "zustand";
import {
  BGM_RECOMMENDED_INTENSITY,
  BGM_TEMPLATES,
  DEFAULT_CLIP_CONFIGURATION,
  SUBTITLE_STYLES,
  calculateClipCredits,
  type AspectRatioId,
  type ClipMode,
  type ClipModel,
} from "@snipmatic/utils";

import { ClipApi } from "@/lib/api";
import type { ClipsPageState } from "@/types/clip-navigation";

type ClipSource = "youtube" | "upload" | null;

type ClipState = {
  source: ClipSource;
  url: string;
  sourceKey?: string;
  previewUrl?: string;
  videoInfo: ClipModel["previewResponse"] | null;
  clipRange: [number, number];
  subtitles: boolean;
  bgMusic: boolean;
  clipMode: ClipMode;
  aspectRatio: AspectRatioId;
  subtitleTemplateId?: string;
  bgMusicTemplateId?: string;
  bgMusicIntensity: number;
  videoTemplateId?: string;
  attachedClipId?: string;
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
  setBgMusic: (enabled: boolean) => void;
  setBgMusicTemplateId: (id: string | undefined) => void;
  setBgMusicIntensity: (value: number) => void;
  setVideoTemplateId: (id: string | undefined) => void;
  setAttachedClipId: (id: string | undefined) => void;
  clearAttachClip: () => void;
  hydrateFromPageState: (state: ClipsPageState) => void;
  setYoutubePreview: (payload: {
    url: string;
    videoInfo: ClipModel["previewResponse"];
  }) => void;
  setUploadPreview: (payload: {
    sourceKey: string;
    previewUrl: string;
    videoInfo: ClipModel["previewResponse"];
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
  bgMusic: false,
  subtitleTemplateId: undefined as string | undefined,
  bgMusicTemplateId: undefined as string | undefined,
  bgMusicIntensity: BGM_RECOMMENDED_INTENSITY,
  videoTemplateId: undefined as string | undefined,
  attachedClipId: undefined as string | undefined,
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

  setClipMode: (clipMode) =>
    set(
      clipMode !== "MANUAL"
        ? {
            clipMode,
            videoTemplateId: undefined,
            attachedClipId: undefined,
          }
        : { clipMode }
    ),

  setAspectRatio: (aspectRatio) =>
    set(
      aspectRatio !== "9:16"
        ? {
            aspectRatio,
            videoTemplateId: undefined,
            attachedClipId: undefined,
          }
        : { aspectRatio }
    ),

  setSubtitles: (enabled) =>
    set((state) => ({
      subtitles: enabled,
      subtitleTemplateId:
        enabled && !state.subtitleTemplateId
          ? SUBTITLE_STYLES[0]?.name
          : state.subtitleTemplateId,
    })),

  setSubtitleTemplateId: (subtitleTemplateId) => set({ subtitleTemplateId }),

  setBgMusic: (enabled) =>
    set((state) => ({
      bgMusic: enabled,
      bgMusicTemplateId: enabled
        ? state.bgMusicTemplateId ?? BGM_TEMPLATES[0]?.name
        : undefined,
    })),

  setBgMusicTemplateId: (bgMusicTemplateId) => set({ bgMusicTemplateId }),

  setBgMusicIntensity: (bgMusicIntensity) => set({ bgMusicIntensity }),

  setVideoTemplateId: (videoTemplateId) => set({ videoTemplateId }),

  setAttachedClipId: (attachedClipId) => set({ attachedClipId }),

  clearAttachClip: () =>
    set({ videoTemplateId: undefined, attachedClipId: undefined }),

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
      bgMusic: pageState.bgMusic ?? false,
      clipMode: pageState.clipMode ?? DEFAULT_CLIP_CONFIGURATION.clipMode,
      aspectRatio: pageState.aspectRatio ?? DEFAULT_CLIP_CONFIGURATION.aspectRatio,
      subtitleTemplateId: pageState.subtitleTemplateId,
      bgMusicTemplateId: pageState.bgMusicTemplateId,
      bgMusicIntensity: pageState.bgMusicIntensity ?? BGM_RECOMMENDED_INTENSITY,
      videoTemplateId: pageState.videoTemplateId,
      attachedClipId: pageState.attachedClipId,
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
    const { videoInfo, clipMode, subtitles, videoTemplateId } = get();

    if (!videoInfo) {
      return 0;
    }

    return calculateClipCredits({
      durationSeconds: get().getProcessingDuration(),
      subtitles: clipMode === "AI" ? subtitles : false,
      templateId: clipMode === "AI" ? videoTemplateId : undefined,
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
      const isManualLayout =
        state.clipMode === "MANUAL" &&
        state.aspectRatio === "9:16" &&
        Boolean(state.attachedClipId);

      const payload: ClipModel["processClipBody"] = {
        thumbnail: state.videoInfo.thumbnail || undefined,
        title: state.videoInfo.title,
        source: state.sourceKey ? "UPLOAD" : "YOUTUBE",
        sourceKey: state.sourceKey ?? state.url,
        from: state.clipRange[0],
        to: state.clipRange[1],
        duration,
        clipMode: state.clipMode,
        subtitles: state.clipMode === "AI" ? state.subtitles : false,
        subtitleStyle:
          state.clipMode === "AI" && state.subtitles
            ? state.subtitleTemplateId
            : undefined,
        aspectRatio: state.aspectRatio,
        bgMusic: state.bgMusic,
        bgMusicKey: state.bgMusic ? state.bgMusicTemplateId : undefined,
        bgMusicIntensity: state.bgMusicIntensity,
        videoLayout: isManualLayout,
        videoLayoutKey: isManualLayout ? state.attachedClipId : undefined,
      };

      await ClipApi.process(payload);
    } finally {
      set({ isCreatingClip: false });
    }
  },
}));
