import React, { useEffect, useState } from "react";

import type { ProjectModel } from "@snipmatic/utils";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type Project = ProjectModel["listResponse"]["projects"][number];

interface TaskCardProps {
  task: Project;
  className?: string;
}

const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.round(seconds % 60);
  return minutes > 0 ? `${minutes}m ${remainder}s` : `${remainder}s`;
};

export const TaskCard: React.FC<TaskCardProps> = ({ task, className }) => {
  const [open, setOpen] = useState(false);
  const isProcessing = !["COMPLETED", "FAILED"].includes(task.status);
  const [displayProgress, setDisplayProgress] = useState(task.progress);

  useEffect(() => {
    const timeout = window.setTimeout(
      () => setDisplayProgress(task.progress),
      0
    );
    return () => window.clearTimeout(timeout);
  }, [task.progress]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger>
        <div
          className={cn(
            "cursor-pointer w-full max-w-xs rounded-3xl transition",
            className
          )}
        >
          <div className="relative w-full aspect-video">
            <img
              src={task.metadata.thumbnailUrl || "/placeholder.png"}
              alt={task.title || "Video project"}
              className={cn(
                "object-cover rounded-3xl ring w-full h-full",
                isProcessing && "opacity-30"
              )}
              onError={(event) => {
                event.currentTarget.src = "/placeholder.png";
              }}
            />
            {isProcessing && (
              <div
                style={{ width: `${Math.max(0, Math.min(100, displayProgress))}%` }}
                className="absolute inset-y-0 left-0 flex items-center justify-center rounded-3xl bg-orange-400/30 text-xl font-semibold transition-all duration-500"
              >
                <span>{Math.round(displayProgress)}%</span>
              </div>
            )}
          </div>
          <div className="py-3 pl-1">
            <div className="text-sm text-left line-clamp-1">
              {task.title || "Untitled project"}
            </div>
            <div className="text-xs text-muted-foreground text-left">
              {task.config.processingType === "AI" ? "AI Generated" : "Manual Clip"}
              {` · ${task.status.toLowerCase().replaceAll("_", " ")}`}
            </div>
          </div>
        </div>
      </SheetTrigger>

      <SheetContent
        side="bottom"
        className="max-w-4xl mx-auto p-2 border overflow-hidden font-jost rounded-t-4xl"
      >
        <div className="p-6 max-h-[80vh] border border-muted bg-secondary dark:bg-secondary/50 overflow-y-auto space-y-6 hide-scrollbar rounded-t-3xl">
          <div>
            <h2 className="text-xl font-semibold mb-2">
              {task.title || "Untitled project"}
            </h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="secondary">{task.status}</Badge>
              <span>•</span>
              <span>{task.config.processingType}</span>
              <span>•</span>
              <span>{task.config.aspectRatio}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-muted/50 p-3 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Created</p>
              <p className="text-sm font-medium">
                {new Date(task.createdAt).toLocaleString()}
              </p>
            </div>
            <div className="bg-white dark:bg-muted/50 p-3 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Selected range</p>
              <p className="text-sm font-medium">
                {formatDuration(task.config.duration)}
              </p>
            </div>
            <div className="bg-white dark:bg-muted/50 p-3 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Progress</p>
              <p className="text-sm font-medium">{task.progress}%</p>
            </div>
          </div>

          {task.error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              <p className="font-medium mb-1">Processing failed</p>
              <p>{task.error}</p>
            </div>
          )}

          {task.status === "COMPLETED" && task.clips.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Processing completed, but no clips matched this video.
            </p>
          )}

          {task.clips.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {task.clips.map((clip) => (
                <article key={clip.id} className="overflow-hidden rounded-xl border bg-background">
                  {clip.thumbnailUrl && (
                    <img
                      src={clip.thumbnailUrl}
                      alt={clip.title || "Generated clip"}
                      className="w-full aspect-video object-cover"
                    />
                  )}
                  <div className="space-y-3 p-4">
                    <div>
                      <h3 className="font-medium">{clip.title || "Generated clip"}</h3>
                      <p className="text-sm text-muted-foreground">
                        {formatDuration(clip.duration)}
                        {clip.score == null ? "" : ` · ${Math.round(clip.score * 100)}% score`}
                      </p>
                    </div>
                    {clip.outputUrl && (
                      <div className="flex gap-3 text-sm">
                        <a
                          className="text-primary underline underline-offset-4"
                          href={clip.outputUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          View clip
                        </a>
                        <a
                          className="text-primary underline underline-offset-4"
                          href={clip.outputUrl}
                          download={`${clip.title || "clip"}.mp4`}
                        >
                          Download
                        </a>
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default TaskCard;
