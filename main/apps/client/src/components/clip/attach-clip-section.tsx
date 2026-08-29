import React from "react";

import {
  MOCK_ATTACH_CLIPS,
  getAttachClipById,
} from "@snipmatic/utils";
import { cn } from "@/lib/utils";

import { Button } from "../ui/button";

type AttachClipSectionProps = {
  mainPreviewUrl?: string;
  mainThumbnail?: string;
  useThumbnail?: boolean;
  videoTemplateId?: string;
  attachedClipId?: string;
  onVideoTemplateChange: (value: string) => void;
  onAttachedClipChange: (value: string) => void;
  onClear: () => void;
};

const MediaPanel = ({
  src,
  isVideo,
  alt,
  fallback,
}: {
  src?: string;
  isVideo?: boolean;
  alt: string;
  fallback: string;
}) => {
  if (!src) {
    return (
      <div className="flex h-full items-center justify-center text-[10px] text-muted-foreground">
        {fallback}
      </div>
    );
  }

  if (isVideo) {
    return (
      <video
        src={src}
        className="h-full w-full object-contain"
        muted
        playsInline
        preload="metadata"
      />
    );
  }

  return <img src={src} alt={alt} className="h-full w-full object-contain" />;
};

const SplitPreview = ({
  mainPreviewUrl,
  mainThumbnail,
  useThumbnail,
  attachedPreviewUrl,
}: {
  mainPreviewUrl?: string;
  mainThumbnail?: string;
  useThumbnail?: boolean;
  attachedPreviewUrl?: string;
}) => {
  const mainIsVideo = !useThumbnail && Boolean(mainPreviewUrl);
  const mainSrc = useThumbnail
    ? mainThumbnail || mainPreviewUrl
    : mainPreviewUrl || mainThumbnail;
  const attachSrc = attachedPreviewUrl || "/placeholder.png";

  const MainPanel = (
    <div className="relative flex-1 overflow-hidden bg-muted">
      <MediaPanel
        src={mainSrc}
        isVideo={mainIsVideo}
        alt="Main clip"
        fallback="Main"
      />
    </div>
  );

  const AttachPanel = (
    <div className="relative flex-1 overflow-hidden bg-muted-foreground/20">
      <MediaPanel
        src={attachSrc}
        isVideo={false}
        alt="Attached clip"
        fallback="Clip"
      />
    </div>
  );

  return (
    <div className="mx-auto aspect-9/16 w-full overflow-hidden rounded-xl border bg-muted">
      <div className="flex flex-col h-full">
        <div className="h-1/2 flex items-center justify-center">
          {MainPanel}
        </div>
        <div className="h-1/2 border-t border-background/30">{AttachPanel}</div>
      </div>
    </div>
  );
};

export const AttachClipSection = ({
  mainPreviewUrl,
  mainThumbnail,
  useThumbnail,
  videoTemplateId,
  attachedClipId,
  onVideoTemplateChange,
  onAttachedClipChange,
  onClear,
}: AttachClipSectionProps) => {
  const [isOpen, setIsOpen] = React.useState(
    Boolean(videoTemplateId || attachedClipId)
  );

  const attachedClip = getAttachClipById(attachedClipId);
  const openSection = () => {
    setIsOpen(true);

    if (!videoTemplateId) {
      onVideoTemplateChange(MOCK_ATTACH_CLIPS[0]?.key);
    }
  };

  if (!isOpen) {
    return (
      <div className="space-y-3">
        <h4 className="text-sm text-muted-foreground">Attach Clips</h4>
        <Button
          type="button"
          variant="secondary"
          className="w-full rounded-full"
          onClick={openSection}
        >
          Attach clips
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm text-muted-foreground">Attach Clips</h4>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 text-xs"
          onClick={() => {
            setIsOpen(false);
            onClear();
          }}
        >
          Remove
        </Button>
      </div>
      <div className="grid grid-cols-5 gap-4">
        <div className="col-span-3 space-y-2">
          <p className="text-xs text-muted-foreground">Choose clip</p>
          <div className="grid grid-cols-2 gap-2">
            {MOCK_ATTACH_CLIPS.map((clip) => {
              const isSelected = attachedClipId === clip.key;
              return (
                <button
                  key={clip.key}
                  type="button"
                  onClick={() => {
                    if (!videoTemplateId) {
                      onVideoTemplateChange(MOCK_ATTACH_CLIPS[0]?.key);
                    }
                    onAttachedClipChange(clip.key);
                  }}
                  className={cn(
                    "overflow-hidden text-left transition-colors",
                    isSelected
                      ? "border-foreground"
                      : "border-border hover:bg-muted/40"
                  )}
                >
                  <div className={cn("aspect-video", isSelected && "border-foreground border")}>
                    <img
                      src={clip.previewUrl}
                      alt={clip.key}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <p className="p-2 text-xs font-medium">{clip.name}</p>
                </button>
              );
            })}
          </div>
        </div>
        <div className="col-span-2 space-y-2">
          <h5 className="text-xs text-muted-foreground">Preview</h5>
          <SplitPreview
            mainPreviewUrl={mainPreviewUrl}
            mainThumbnail={mainThumbnail}
            useThumbnail={useThumbnail}
            attachedPreviewUrl={attachedClip?.previewUrl}
          />
        </div>
      </div>
    </div>
  );
};
