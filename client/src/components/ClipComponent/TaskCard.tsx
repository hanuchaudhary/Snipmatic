"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  cn,
  formatDuration,
  formatTimestamp,
  getYouTubeThumbnail,
} from "@/lib/utils";
import { Task } from "@/types/task";

interface TaskCardProps {
  task: Task;
  className?: string;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, className }) => {
  const thumbnailUrl = getYouTubeThumbnail(task.youtubeUrl);

  const isProcessing = !["COMPLETED", "FAILED"].includes(
    task.status.toUpperCase()
  );

  return (
    <div className={cn("overflow-hidden border-2 rounded-4xl", className)}>
      <div className="font-semibold px-8 py-2 flex items-center justify-between">
        <span>{task.title}</span>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            {task.status}
          </Badge>
          <span>{task.clipType === "AI" ? "AI" : "Manual"}</span>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row border rounded-4xl overflow-hidden bg-secondary">
        <div className="relative w-full sm:w-48 flex-shrink-0">
          <img
            src={thumbnailUrl}
            alt={task.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = "/placeholder-thumbnail.jpg";
            }}
          />
          <div className="absolute bottom-1 right-1 bg-black/70 text-xs px-1.5 py-0.5 rounded">
            {formatDuration(task.duration || 0)}
          </div>
        </div>

        <div className="gap-1 text-sm text-muted-foreground p-4 flex flex-col flex-1">
          {isProcessing && (
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">Progress</span>
                <span className="text-sm">{task.progress}%</span>
              </div>
              <Progress value={task.progress} className="h-2" />
              <div className="text-xs text-muted-foreground mt-1">
                {task.statusMessage || "Processing..."}
              </div>
            </div>
          )}

          {task.status.toUpperCase() === "FAILED" && task.errorMessage && (
            <div className="mb-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
              <div className="text-xs text-red-600 dark:text-red-400">
                {task.errorMessage}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <span>Quality: {task.quality || "HD"}</span>
          </div>
          <div className="flex items-center gap-2">
            <span>Aspect: {task.aspectRatio || "original"}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="truncate">
              Created:{" "}
              {formatTimestamp(
                typeof task.createdAt === "string"
                  ? task.createdAt
                  : task.createdAt.toISOString()
              )}
            </span>
          </div>
          {task.completedAt && (
            <div className="flex items-center gap-2">
              <span className="truncate">
                Completed:{" "}
                {formatTimestamp(
                  typeof task.completedAt === "string"
                    ? task.completedAt
                    : task.completedAt.toISOString()
                )}
              </span>
            </div>
          )}

          {task.status.toUpperCase() === "COMPLETED" &&
            task.result?.viral_moments && (
              <div className="mt-2">
                {task.result.s3_urls && task.result.s3_urls.length > 0 && (
                  <div className="text-xs">
                    <a
                      href={task.result.s3_urls[0]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-700 underline"
                    >
                      View Clip
                    </a>
                  </div>
                )}
              </div>
            )}

          <div className="mt-auto">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              onClick={() => {
                console.log(`Viewing details for task ${task}`);
              }}
            >
              View Details
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
