import React from "react";
import { Eye, EyeOff } from "lucide-react";

import { SUBTITLE_STYLES } from "@snipmatic/utils";

import { useClipStore } from "@/store/clip.store";

import { AspectRatioPicker } from "./aspect-ratio-picker";
import { ClipModeSwitch } from "./clip-mode-switch";
import { DurationController } from "./duration-controller";
import { TemplateGrid } from "./template-grid";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";
import { TooltipButton } from "../ui/tooltip-button";

const formatDuration = (seconds: number) => {
  const totalSeconds = Math.max(0, Math.floor(seconds));

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const remainingSeconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  }

  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

export const VideoInfo = () => {
  const videoInfo = useClipStore((state) => state.videoInfo);
  const clipRange = useClipStore((state) => state.clipRange);
  const setClipRange = useClipStore((state) => state.setClipRange);
  const subtitles = useClipStore((state) => state.subtitles);
  const setSubtitles = useClipStore((state) => state.setSubtitles);
  const previewUrl = useClipStore((state) => state.previewUrl);
  const clipMode = useClipStore((state) => state.clipMode);
  const setClipMode = useClipStore((state) => state.setClipMode);
  const aspectRatio = useClipStore((state) => state.aspectRatio);
  const setAspectRatio = useClipStore((state) => state.setAspectRatio);
  const subtitleTemplateId = useClipStore((state) => state.subtitleTemplateId);
  const setSubtitleTemplateId = useClipStore(
    (state) => state.setSubtitleTemplateId
  );
  const url = useClipStore((state) => state.url);

  const [showThumbnail, setShowThumbnail] = React.useState(true);
  const hasYoutubeLink = Boolean(url.trim());

  if (!videoInfo) {
    return null;
  }

  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-start gap-4">
        {showThumbnail && (
          <div className="relative aspect-video w-98 shrink-0 overflow-hidden rounded-xl bg-muted">
            {hasYoutubeLink && videoInfo.thumbnail ? (
              <img
                src={videoInfo.thumbnail}
                alt={videoInfo.title}
                className="h-full w-full object-cover"
              />
            ) : previewUrl ? (
              <video
                src={previewUrl}
                className="h-full w-full object-cover"
                controls
                preload="metadata"
              />
            ) : videoInfo.thumbnail ? (
              <img
                src={videoInfo.thumbnail}
                alt={videoInfo.title}
                className="h-full w-full object-cover"
              />
            ) : null}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h3 className="line-clamp-2 text-lg">{videoInfo.title}</h3>
              {showThumbnail && (
                <p className="mt-2 text-sm text-muted-foreground">
                  {formatDuration(videoInfo.duration)}
                </p>
              )}
            </div>
            <TooltipButton
              tooltipText={showThumbnail ? "Hide thumbnail" : "Show Thumbnail"}
            >
              <Button
                type="button"
                className="rounded-full px-4 text-xs"
                variant="secondary"
                size="sm"
                onClick={() => setShowThumbnail((prev) => !prev)}
                aria-label="Toggle thumbnail"
              >
                {showThumbnail ? <EyeOff /> : <Eye />}
              </Button>
            </TooltipButton>
          </div>
        </div>
      </div>

      <div className="space-y-1">
        <h4 className="text-sm text-muted-foreground">Clip Mode</h4>
        <ClipModeSwitch clipMode={clipMode} onClipModeChange={setClipMode} />
      </div>

      <DurationController
        duration={videoInfo.duration}
        clipRange={clipRange}
        onClipRangeChange={setClipRange}
      />

      <AspectRatioPicker value={aspectRatio} onChange={setAspectRatio} />

      {clipMode === "AI" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="">Subtitles</h4>
              <p className="text-sm text-muted-foreground">
                Automatically generate subtitles for your clips
              </p>
            </div>
            <Switch checked={subtitles} onCheckedChange={setSubtitles} />
          </div>

          {subtitles && (
            <TemplateGrid
              title="Subtitle Style"
              templates={SUBTITLE_STYLES}
              selectedId={subtitleTemplateId}
              onSelect={(id) => setSubtitleTemplateId(id)}
              columns={4}
            />
          )}
        </div>
      )}
    </div>
  );
};
