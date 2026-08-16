import React from "react";

import {
  MOCK_ATTACH_CLIPS,
  VIDEO_LAYOUT_TEMPLATES,
  getAttachClipById,
} from "@snipmatic/utils";
import { cn } from "@/lib/utils";

import { Button } from "../ui/button";

type AttachClipSectionProps = {
  mainPreviewUrl?: string;
  mainThumbnail?: string;
  videoTemplateId?: string;
  attachedClipId?: string;
  onVideoTemplateChange: (value: string) => void;
  onAttachedClipChange: (value: string) => void;
  onClear: () => void;
};

const SplitPreview = ({
  layoutId,
  mainPreviewUrl,
  mainThumbnail,
  attachedPreviewUrl,
}: {
  layoutId?: string;
  mainPreviewUrl?: string;
  mainThumbnail?: string;
  attachedPreviewUrl?: string;
}) => {
  const mainSrc = mainPreviewUrl || mainThumbnail;
  const attachSrc = attachedPreviewUrl || "/placeholder.png";

  const MainPanel = (
    <div className="relative flex-1 overflow-hidden bg-muted">
      {mainSrc ? (
        <img src={mainSrc} alt="Main clip" className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full items-center justify-center text-[10px] text-muted-foreground">
          Main
        </div>
      )}
    </div>
  );

  const AttachPanel = (
    <div className="relative flex-1 overflow-hidden bg-muted-foreground/20">
      <img src={attachSrc} alt="Attached clip" className="h-full w-full object-cover" />
    </div>
  );

  return (
    <div className="mx-auto aspect-[9/16] w-full max-w-[140px] overflow-hidden rounded-xl border bg-muted">
      <div className="flex h-full flex-col">
        {layoutId === "video-attach-top" && (
          <>
            {MainPanel}
            <div className="border-t border-background/30">{AttachPanel}</div>
          </>
        )}
        {layoutId === "video-attach-bottom" && (
          <>
            {AttachPanel}
            <div className="border-t border-background/30">{MainPanel}</div>
          </>
        )}
        {!layoutId && (
          <div className="flex h-full items-center justify-center text-[10px] text-muted-foreground">
            9:16
          </div>
        )}
      </div>
    </div>
  );
};

export const AttachClipSection = ({
  mainPreviewUrl,
  mainThumbnail,
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

  if (!isOpen) {
    return (
      <div className="space-y-3">
        <h4 className="text-sm text-muted-foreground">Attach Clips</h4>
        <Button
          type="button"
          variant="secondary"
          className="w-full rounded-full"
          onClick={() => setIsOpen(true)}
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

      <SplitPreview
        layoutId={videoTemplateId}
        mainPreviewUrl={mainPreviewUrl}
        mainThumbnail={mainThumbnail}
        attachedPreviewUrl={attachedClip?.previewUrl}
      />

      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">Layout</p>
        <div className="grid grid-cols-2 gap-2">
          {VIDEO_LAYOUT_TEMPLATES.map((template) => {
            const isSelected = videoTemplateId === template.id;

            return (
              <button
                key={template.id}
                type="button"
                onClick={() => onVideoTemplateChange(template.id)}
                className={cn(
                  "rounded-xl border p-3 text-left transition-colors",
                  isSelected
                    ? "border-foreground bg-muted"
                    : "border-border hover:bg-muted/40"
                )}
              >
                <p className="text-sm font-medium">{template.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {template.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">Choose clip</p>
        <div className="grid grid-cols-2 gap-2">
          {MOCK_ATTACH_CLIPS.map((clip) => {
            const isSelected = attachedClipId === clip.id;

            return (
              <button
                key={clip.id}
                type="button"
                onClick={() => onAttachedClipChange(clip.id)}
                className={cn(
                  "overflow-hidden rounded-xl border text-left transition-colors",
                  isSelected
                    ? "border-foreground bg-muted"
                    : "border-border hover:bg-muted/40"
                )}
              >
                <div className="aspect-video bg-muted">
                  <img
                    src={clip.previewUrl}
                    alt={clip.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <p className="p-2 text-xs font-medium">{clip.name}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
