"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, formatDuration, formatTimestamp } from "@/lib/utils";
import { Task, isManualTask, isAITask, hasViralMoments } from "@/types/task";

interface TaskDetailsPopupProps {
  task: Task;
  children?: React.ReactNode;
}

export const TaskDetailsPopup: React.FC<TaskDetailsPopupProps> = ({
  task,
  children,
}) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children || (
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            Details
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="min-w-4xl rounded-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {" "}
            Task Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">{task.title}</h3>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Quality:</span>
                  <Badge variant="secondary">{task.quality}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Aspect Ratio:</span>
                  <Badge variant="secondary">{task.aspectRatio}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="font-mono">
                    {formatDuration(task.duration)}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Created:</span>
                  <span className="text-sm">
                    {formatTimestamp(task.createdAt)}
                  </span>
                </div>
                {task.completedAt && (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Completed:</span>
                    <span className="text-sm">
                      {formatTimestamp(task.completedAt)}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge
                    variant={
                      task.status === "COMPLETED"
                        ? "default"
                        : task.status === "PROCESSING"
                        ? "secondary"
                        : "destructive"
                    }
                  >
                    {task.status}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* YouTube URL */}
          <div className="space-y-2">
            <h4 className="font-medium">Source Video</h4>
            <a
              href={task.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline break-all text-sm"
            >
              {task.youtubeUrl}
            </a>
          </div>

          {/* Task Type Specific Details */}
          {isManualTask(task) ? (
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                Manual Clip Configuration
              </h4>

              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="space-y-1">
                  <span className="text-muted-foreground block">
                    Start Time
                  </span>
                  <span className="font-mono text-lg">
                    {formatDuration(task.startTime)}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground block">End Time</span>
                  <span className="font-mono text-lg">
                    {formatDuration(task.endTime)}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground block">
                    Clip Duration
                  </span>
                  <span className="font-mono text-lg font-semibold">
                    {formatDuration(task.endTime - task.startTime)}
                  </span>
                </div>
              </div>

              <div className="mt-4 p-3 rounded border">
                <div className="text-sm">
                  <strong>Clip Range:</strong> This manual clip will extract
                  content from{" "}
                  <span className="font-mono">
                    {formatDuration(task.startTime)}
                  </span>{" "}
                  to{" "}
                  <span className="font-mono">
                    {formatDuration(task.endTime)}
                  </span>{" "}
                  of the source video.
                </div>
              </div>
            </div>
          ) : isAITask(task) ? (
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                AI Clip Configuration
              </h4>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground">Multiple Clips:</span>
                  <Badge
                    variant={task.multipleClips ? "default" : "secondary"}
                  >
                    {task.multipleClips ? "Enabled" : "Disabled"}
                  </Badge>
                </div>

                {task.multipleClips && (
                  <div className="p-3 rounded border text-sm">
                    <strong>Multiple Clips Mode:</strong> AI will analyze the
                    video and create multiple viral moments as separate clips.
                  </div>
                )}
              </div>

              {/* Viral Moments Details */}
              {hasViralMoments(task) && (
                <div className="mt-6 space-y-4">
                  <h5 className="font-medium flex items-center gap-2">
                    Discovered Viral Moments ({task.viralMoments.length})
                  </h5>

                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {task.viralMoments.map((moment, index) => (
                      <div
                        key={index}
                        className="border rounded-lg p-3 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              Moment {index + 1}
                            </Badge>
                            <span className="text-sm font-mono">
                              {formatDuration(moment.start_time)} -{" "}
                              {formatDuration(moment.end_time)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              Confidence:
                            </span>
                            <Badge
                              variant={
                                moment.confidence_score >= 0.8
                                  ? "default"
                                  : moment.confidence_score >= 0.6
                                  ? "secondary"
                                  : "outline"
                              }
                            >
                              {(moment.confidence_score * 100).toFixed(0)}%
                            </Badge>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div>
                            <span className="text-xs text-muted-foreground uppercase tracking-wide">
                              Content Preview
                            </span>
                            <p className="text-sm p-2 rounded border bg-muted">
                              "{moment.content}"
                            </p>
                          </div>

                          <div>
                            <span className="text-xs text-muted-foreground uppercase tracking-wide">
                              Why This Moment is Viral
                            </span>
                            <p className="text-sm italic">
                              {moment.reason}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDetailsPopup;
