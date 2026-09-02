import React from "react";
import { Eye, EyeOff } from "lucide-react";

import {
  BGM_RECOMMENDED_INTENSITY,
  BGM_TEMPLATES,
  SUBTITLE_STYLES,
} from "@snipmatic/utils";

import { useClipStore } from "@/store/clip.store";

import { AttachClipSection } from "./attach-clip-section";
import { AspectRatioPicker } from "./aspect-ratio-picker";
import { AudioPreview } from "./audio-preview";
import { ClipModeSwitch } from "./clip-mode-switch";
import { DurationController } from "./duration-controller";
import { TemplateGrid } from "./template-grid";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";
import { TooltipButton } from "../ui/tooltip-button";
import { GooeyInput } from "../ui/gooey-input";

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
  const bgMusic = useClipStore((state) => state.bgMusic);
  const setBgMusic = useClipStore((state) => state.setBgMusic);
  const previewUrl = useClipStore((state) => state.previewUrl);
  const clipMode = useClipStore((state) => state.clipMode);
  const setClipMode = useClipStore((state) => state.setClipMode);
  const aspectRatio = useClipStore((state) => state.aspectRatio);
  const setAspectRatio = useClipStore((state) => state.setAspectRatio);
  const subtitleTemplateId = useClipStore((state) => state.subtitleTemplateId);
  const setSubtitleTemplateId = useClipStore(
    (state) => state.setSubtitleTemplateId
  );
  const bgMusicTemplateId = useClipStore((state) => state.bgMusicTemplateId);
  const setBgMusicTemplateId = useClipStore(
    (state) => state.setBgMusicTemplateId
  );
  const bgMusicIntensity = useClipStore((state) => state.bgMusicIntensity);
  const setBgMusicIntensity = useClipStore((state) => state.setBgMusicIntensity);
  const videoTemplateId = useClipStore((state) => state.videoTemplateId);
  const setVideoTemplateId = useClipStore((state) => state.setVideoTemplateId);
  const attachedClipId = useClipStore((state) => state.attachedClipId);
  const setAttachedClipId = useClipStore((state) => state.setAttachedClipId);
  const clearAttachClip = useClipStore((state) => state.clearAttachClip);
  const url = useClipStore((state) => state.url);

  const [showThumbnail, setShowThumbnail] = React.useState(true);
  const [playingBgmId, setPlayingBgmId] = React.useState<string | null>(null);
  const [musicSearch, setMusicSearch] = React.useState("");
  const hasYoutubeLink = Boolean(url.trim());

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
        template.previewUrl.toLowerCase().includes(query)
    );
  }, [musicSearch]);

  if (!videoInfo) {
    return null;
  }

  const handleBgmEnabledChange = (enabled: boolean) => {
    setBgMusic(enabled);

    if (!enabled) {
      setPlayingBgmId(null);
    }
  };

  const handleBgmSelect = (templateId: string) => {
    setBgMusicTemplateId(templateId);

    if (bgMusicTemplateId !== templateId) {
      setPlayingBgmId(null);
    }
  };

  const handleBgmPlayToggle = (templateId: string) => {
    if (playingBgmId === templateId) {
      setPlayingBgmId(null);
      return;
    }

    setBgMusicTemplateId(templateId);
    setPlayingBgmId(templateId);
  };

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

      <div className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h4 className="">Background Music</h4>
              <p className="text-sm text-muted-foreground">
                Add background music to your clips
              </p>
            </div>
            <Switch
              checked={bgMusic}
              onCheckedChange={handleBgmEnabledChange}
            />
          </div>

          {bgMusic && (
            <>
              <div className="flex items-center justify-end">
                <GooeyInput
                  value={musicSearch}
                  onValueChange={(value) => setMusicSearch(value)}
                  placeholder="Search music"
                />
              </div>

              <div className="space-y-2">
                {filteredBgmTemplates.length > 0 ? (
                  filteredBgmTemplates.map((template) => (
                    <AudioPreview
                      key={template.name}
                      template={template}
                      isActive={bgMusicTemplateId === template.name}
                      isPlaying={playingBgmId === template.name}
                      intensity={
                        bgMusicTemplateId === template.name
                          ? bgMusicIntensity
                          : BGM_RECOMMENDED_INTENSITY
                      }
                      onSelect={() => handleBgmSelect(template.name)}
                      onPlayToggle={() => handleBgmPlayToggle(template.name)}
                      onIntensityChange={(value) => {
                        setBgMusicTemplateId(template.name);
                        setBgMusicIntensity(value);
                      }}
                    />
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No music found.</p>
                )}
              </div>
            </>
          )}
        </div>

        {clipMode === "MANUAL" && aspectRatio === "9:16" && (
          <AttachClipSection
            mainPreviewUrl={previewUrl}
            mainThumbnail={videoInfo.thumbnail}
            useThumbnail={hasYoutubeLink}
            videoTemplateId={videoTemplateId}
            attachedClipId={attachedClipId}
            onVideoTemplateChange={setVideoTemplateId}
            onAttachedClipChange={setAttachedClipId}
            onClear={clearAttachClip}
          />
        )}
      </div>
    </div>
  );
};
