import React from "react";
import { AnimatePresence, motion } from "motion/react";
import { Eye, EyeOff, Search } from "lucide-react";

import {
  BGM_RECOMMENDED_INTENSITY,
  BGM_TEMPLATES,
  SUBTITLE_TEMPLATES,
  type AspectRatioId,
  type ClipMode,
  type ClipModel,
} from "@snipmatic/utils";

import { AttachClipSection } from "./attach-clip-section";
import { AspectRatioPicker } from "./aspect-ratio-picker";
import { AudioPreview } from "./audio-preview";
import { ClipModeSwitch } from "./clip-mode-switch";
import { DurationController } from "./duration-controller";
import { TemplateGrid } from "./template-grid";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Switch } from "../ui/switch";
import { TooltipButton } from "../ui/tooltip-button";

type VideoInfoProps = {
  videoInfo: ClipModel["previewResponse"];
  clipRange: [number, number];
  onClipRangeChange: (value: [number, number]) => void;
  subtitles: boolean;
  onSubtitlesChange: (value: boolean) => void;
  previewUrl?: string;
  clipMode: ClipMode;
  onClipModeChange: (value: ClipMode) => void;
  aspectRatio: AspectRatioId;
  onAspectRatioChange: (value: AspectRatioId) => void;
  subtitleTemplateId?: string;
  onSubtitleTemplateChange: (value: string) => void;
  bgMusicTemplateId?: string;
  onBgMusicTemplateChange: (value: string | undefined) => void;
  bgMusicIntensity: number;
  onBgMusicIntensityChange: (value: number) => void;
  videoTemplateId?: string;
  onVideoTemplateChange: (value: string) => void;
  attachedClipId?: string;
  onAttachedClipChange: (value: string) => void;
  onAttachClipClear: () => void;
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
  previewUrl,
  clipMode,
  onClipModeChange,
  aspectRatio,
  onAspectRatioChange,
  subtitleTemplateId,
  onSubtitleTemplateChange,
  bgMusicTemplateId,
  onBgMusicTemplateChange,
  bgMusicIntensity,
  onBgMusicIntensityChange,
  videoTemplateId,
  onVideoTemplateChange,
  attachedClipId,
  onAttachedClipChange,
  onAttachClipClear,
}: VideoInfoProps) => {
  const [showThumbnail, setShowThumbnail] = React.useState<boolean>(true);
  const [playingBgmId, setPlayingBgmId] = React.useState<string | null>(null);
  const [musicSearchOpen, setMusicSearchOpen] = React.useState(false);
  const [musicSearch, setMusicSearch] = React.useState("");

  React.useEffect(() => {
    return () => setPlayingBgmId(null);
  }, []);

  const filteredBgmTemplates = React.useMemo(() => {
    const query = musicSearch.trim().toLowerCase();

    if (!query) {
      return BGM_TEMPLATES;
    }

    return BGM_TEMPLATES.filter(
      (template) =>
        template.name.toLowerCase().includes(query) ||
        template.description?.toLowerCase().includes(query)
    );
  }, [musicSearch]);

  const handleBgmSelect = (templateId: string) => {
    onBgMusicTemplateChange(templateId);

    if (bgMusicTemplateId !== templateId) {
      setPlayingBgmId(null);
    }
  };

  const handleBgmPlayToggle = (templateId: string) => {
    if (playingBgmId === templateId) {
      setPlayingBgmId(null);
      return;
    }

    onBgMusicTemplateChange(templateId);
    setPlayingBgmId(templateId);
  };

  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-start gap-4">
        {showThumbnail && (
          <div className="relative aspect-video w-98 shrink-0 overflow-hidden rounded-xl bg-muted">
            {previewUrl ? (
              <video
                src={previewUrl}
                className="h-full w-full object-cover"
                controls
                preload="metadata"
              />
            ) : (
              <img
                src={videoInfo.thumbnail}
                alt={videoInfo.title}
                className="h-full w-full object-cover"
              />
            )}
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
        <ClipModeSwitch clipMode={clipMode} onClipModeChange={onClipModeChange} />
      </div>

      <DurationController
        duration={videoInfo.duration}
        clipRange={clipRange}
        onClipRangeChange={onClipRangeChange}
      />

      <AspectRatioPicker value={aspectRatio} onChange={onAspectRatioChange} />


      {clipMode === "ai" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Subtitles</h4>
              <p className="text-sm text-muted-foreground">
                Automatically generate subtitles for your clips
              </p>
            </div>
            <Switch checked={subtitles} onCheckedChange={onSubtitlesChange} />
          </div>

          {subtitles && (
            <TemplateGrid
              title="Subtitle Style"
              templates={SUBTITLE_TEMPLATES}
              selectedId={subtitleTemplateId}
              onSelect={onSubtitleTemplateChange}
              columns={4}
            />
          )}

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h4 className="text-sm text-muted-foreground">Background Music</h4>
              <div className="flex items-center">
                <AnimatePresence initial={false}>
                  {musicSearchOpen ? (
                    <motion.div
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: 180, opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <Input
                        value={musicSearch}
                        onChange={(event) => setMusicSearch(event.target.value)}
                        placeholder="Search music"
                        className="h-8 rounded-full px-4 text-xs focus-visible:ring-0"
                        autoFocus
                      />
                    </motion.div>
                  ) : null}
                </AnimatePresence>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 shrink-0 rounded-full"
                  onClick={() => {
                    setMusicSearchOpen((open) => !open);
                    if (musicSearchOpen) {
                      setMusicSearch("");
                    }
                  }}
                >
                  <Search className="size-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              {filteredBgmTemplates.length > 0 ? (
                filteredBgmTemplates.map((template) => (
                  <AudioPreview
                    key={template.id}
                    template={template}
                    isActive={bgMusicTemplateId === template.id}
                    isPlaying={playingBgmId === template.id}
                    intensity={
                      bgMusicTemplateId === template.id
                        ? bgMusicIntensity
                        : BGM_RECOMMENDED_INTENSITY
                    }
                    onSelect={() => handleBgmSelect(template.id)}
                    onPlayToggle={() => handleBgmPlayToggle(template.id)}
                    onIntensityChange={(value) => {
                      onBgMusicTemplateChange(template.id);
                      onBgMusicIntensityChange(value);
                    }}
                  />
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No music found.</p>
              )}
            </div>
          </div>

          {aspectRatio === "9:16" && (
            <AttachClipSection
              mainPreviewUrl={previewUrl}
              mainThumbnail={videoInfo.thumbnail}
              videoTemplateId={videoTemplateId}
              attachedClipId={attachedClipId}
              onVideoTemplateChange={onVideoTemplateChange}
              onAttachedClipChange={onAttachedClipChange}
              onClear={onAttachClipClear}
            />
          )}
        </div>
      )}
    </div>
  );
};
