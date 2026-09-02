import { type ClipTemplate } from "@snipmatic/utils";

import { cn } from "@/lib/utils";

const VideoTemplatePreview = ({ templateId }: { templateId: string }) => {
  if (templateId === "video-split-gameplay") {
    return (
      <div className="flex h-full w-full flex-col overflow-hidden rounded-sm bg-muted">
        <div className="flex-[2] border-b border-background/40 bg-muted-foreground/25" />
        <div className="flex-1 bg-muted-foreground/45" />
      </div>
    );
  }

  if (templateId === "video-pip-gameplay") {
    return (
      <div className="relative h-full w-full overflow-hidden rounded-sm bg-muted-foreground/25">
        <div className="absolute bottom-1 right-1 h-4 w-6 rounded-sm bg-muted-foreground/60" />
      </div>
    );
  }

  if (templateId === "video-reaction") {
    return (
      <div className="flex h-full w-full gap-1 overflow-hidden rounded-sm">
        <div className="flex-[2] bg-muted-foreground/25" />
        <div className="flex-1 bg-muted-foreground/45" />
      </div>
    );
  }

  return <div className="h-full w-full rounded-sm bg-muted-foreground/30" />;
};

export const TemplateGrid = ({
  title,
  templates,
  selectedId,
  onSelect,
  columns = 2,
}: {
  title: string;
  templates: ClipTemplate[];
  selectedId?: string;
  onSelect: (id: string) => void;
  columns?: 2 | 4;
}) => {
  return (
    <div className="space-y-3">
      <h4 className="text-sm text-muted-foreground">{title}</h4>
      <div
        className={cn(
          "grid gap-2",
          columns === 4 ? "grid-cols-2 md:grid-cols-4" : "grid-cols-2"
        )}
      >
        {templates.map((template) => {
          const isSelected = selectedId === template.name;

          return (
            <button
              key={template.name}
              type="button"
              onClick={() => onSelect(template.name)}
              className={cn(
                "text-left transition-colors",
                isSelected
                  ? "border border-primary"
                  : "border-border"
              )}
            >
              <div className="aspect-[4/3] overflow-hidden bg-muted">
                {template.mediaType === "subtitle" ? (
                  <img
                    src={template.previewUrl}
                    alt={template.name}
                    className="h-full w-full object-cover"
                  />
                ) : template.mediaType === "video" ? (
                  <VideoTemplatePreview templateId={template.name} />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                    Audio
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
