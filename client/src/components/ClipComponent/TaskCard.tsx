"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Info, Clock, CheckCircle, XCircle, Loader2 } from "lucide-react";
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

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "COMPLETED":
        return "bg-green-500";
      case "FAILED":
        return "bg-red-500";
      case "PROCESSING":
      case "QUEUED":
      case "PENDING":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case "COMPLETED":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "FAILED":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "PROCESSING":
        return <Loader2 className="w-4 h-4 text-yellow-500 animate-spin" />;
      case "QUEUED":
      case "PENDING":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const isProcessing = !["COMPLETED", "FAILED"].includes(task.status.toUpperCase());

  return (
    <div className={cn("overflow-hidden border-2 rounded-4xl", className)}>
      <div className="font-semibold px-8 py-2 flex items-center justify-between">
        <span>{task.title}</span>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            {getStatusIcon(task.status)}
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
          {/* Progress Bar for Processing Tasks */}
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

          {/* Error Message for Failed Tasks */}
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
              Created: {formatTimestamp(typeof task.createdAt === 'string' ? task.createdAt : task.createdAt.toISOString())}
            </span>
          </div>
          {task.completedAt && (
            <div className="flex items-center gap-2">
              <span className="truncate">
                Completed: {formatTimestamp(typeof task.completedAt === 'string' ? task.completedAt : task.completedAt.toISOString())}
              </span>
            </div>
          )}

          {/* Show clip results for completed tasks */}
          {task.status.toUpperCase() === "COMPLETED" && task.result?.viral_moments && (
            <div className="mt-2">
              <div className="text-xs font-medium text-foreground mb-1">
                Clips Generated: {task.result.viral_moments.length}
              </div>
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
                // For now, just show task details in console
                console.log("Task details:", task);
                // You can implement a modal or navigate to details page here
              }}
            >
              <Info className="w-4 h-4" />
              View Details
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
