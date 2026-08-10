import React from "react";

import { type ClipModel } from "@snipmatic/utils";
import { Eye, EyeOff } from "lucide-react";

import { Button } from "../ui/button";
import { Slider } from "../ui/slider";
import { Switch } from "../ui/switch";
import { TooltipButton } from "../ui/tooltip-button";

type VideoInfoProps = {
  videoInfo: ClipModel["previewResponse"];
  clipRange: [number, number];
  onClipRangeChange: (value: [number, number]) => void;
  subtitles: boolean;
  onSubtitlesChange: (value: boolean) => void;
};

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

export const VideoInfo = ({
  videoInfo,
  clipRange,
  onClipRangeChange,
  subtitles,
  onSubtitlesChange,
}: VideoInfoProps) => {
  const clipDuration = clipRange[1] - clipRange[0];
  const [showThumbnail, setShowThumbnail] = React.useState<boolean>(true);

  return (
    <div className="mt-6 space-y-6">
      <div className="flex items-start gap-4">
        {showThumbnail && (
          <div className="relative aspect-video w-98 shrink-0 overflow-hidden rounded-xl bg-muted">
            <img
              src={videoInfo.thumbnail}
              alt={videoInfo.title}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h3 className="line-clamp-2 text-lg">{videoInfo.title}</h3>
              {
                showThumbnail && (
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
                className="text-xs rounded-full px-4"
                variant="secondary"
                size={"sm"}
                onClick={() => setShowThumbnail((prev) => !prev)}
                aria-label="Remove video"
              >
                {showThumbnail ? <EyeOff /> : <Eye />}
              </Button>
            </TooltipButton>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm text-muted-foreground">
              Processing Timeframe
            </h4>
          </div>
          <div className="rounded-md bg-muted px-3 py-1.5 text-sm font-medium">
            {formatDuration(clipDuration)}
          </div>
        </div>

        <Slider
          min={0}
          max={Math.max(1, Math.floor(videoInfo.duration))}
          step={1}
          value={clipRange}
          onValueChange={(value) => {
            if (Array.isArray(value) && value.length === 2) {
              onClipRangeChange(value as [number, number]);
            }
          }}
          minStepsBetweenValues={2}
        />

        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{formatDuration(clipRange[0])}</span>
          <span>{formatDuration(clipRange[1])}</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium">Subtitles</h4>
          <p className="text-sm text-muted-foreground">
            Automatically generate subtitles for your clips
          </p>
        </div>

        <Switch checked={subtitles} onCheckedChange={onSubtitlesChange} />
      </div>
    </div>
  );
};
