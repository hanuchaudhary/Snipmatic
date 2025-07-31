"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import {
  cn,
  formatDuration,
  formatTimestamp,
  getYouTubeThumbnail,
} from "@/lib/utils";
import { Task } from "@/types/task";
import { TaskDetailsPopup } from "./TaskDetailsPopup";

interface TaskCardProps {
  task: Task;
  className?: string;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, className }) => {
  const thumbnailUrl = getYouTubeThumbnail(task.youtubeUrl);

  return (
    <div className={cn("overflow-hidden border-2 rounded-4xl")}>
      <div className="font-semibold px-8 py-2 flex items-center justify-between">
        <span>{task.title}</span>
        <span>{task.clipType === "AI" ? "AI" : "Manual"}</span>
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
            {formatDuration(task.duration)}
          </div>
        </div>

        <div className="gap-1 text-sm text-muted-foreground p-4 flex flex-col">
          <div className="flex items-center gap-2">
            <span>Quality: {task.quality}</span>
          </div>
          <div className="flex items-center gap-2">
            <span>Aspect: {task.aspectRatio}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="truncate">
              Created: {formatTimestamp(task.createdAt)}
            </span>
          </div>
          {task.completedAt && (
            <div className="flex items-center gap-2">
              <span className="truncate">
                Completed: {formatTimestamp(task.completedAt)}
              </span>
            </div>
          )}
          <div className="">
            <TaskDetailsPopup task={task}>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Info className="w-4 h-4" />
                View Details
              </Button>
            </TaskDetailsPopup>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
