"use client";

import React, { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Download, Play, Clock, Globe } from "lucide-react";
import { Task } from "@/types/task";
import {
  cn,
  formatDuration,
  formatTimestamp,
  getYouTubeThumbnail,
} from "@/lib/utils";
import WrapButton from "../ui/wrap-button";
import MinimalCard, {
  MinimalCardDescription,
  MinimalCardImage,
  MinimalCardTitle,
} from "../ui/minimal-card";

interface TaskCardProps {
  task: Task;
  className?: string;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, className }) => {
  const [open, setOpen] = useState(false);
  const thumbnailUrl = getYouTubeThumbnail(task.youtubeUrl);

  const isProcessing = !["COMPLETED", "FAILED"].includes(
    task.status.toUpperCase()
  );

  const handleDownload = () => {
    if (task.clipURL) {
      const link = document.createElement("a");
      link.href = task.clipURL;
      link.download = `${task.title}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const [progress, setProgress] = useState(task.progress || 0);
  const [displayProgress, setDisplayProgress] = useState(task.progress || 0);

  useEffect(() => {
    if (task.progress !== undefined) {
      const randomOffset = Math.floor(Math.random() * 7) - 3; // -3 to +3
      const newProgress = Math.max(
        0,
        Math.min(100, task.progress + randomOffset)
      );
      setProgress(newProgress);
    }
  }, [task.progress]);

  useEffect(() => {
    const animationDuration = 1500;
    const steps = 60;
    const stepDuration = animationDuration / steps;
    const progressDiff = progress - displayProgress;
    const stepIncrement = progressDiff / steps;

    if (Math.abs(progressDiff) > 0.1) {
      let currentStep = 0;
      const animationInterval = setInterval(() => {
        currentStep++;
        if (currentStep <= steps) {
          setDisplayProgress((prev) => {
            const newValue = prev + stepIncrement;
            const microOffset = Math.random() - 0.5;
            return Math.max(0, Math.min(100, newValue + microOffset));
          });
        } else {
          setDisplayProgress(progress);
          clearInterval(animationInterval);
        }
      }, stepDuration);

      return () => clearInterval(animationInterval);
    }
  }, [progress, displayProgress]);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <div
          className={cn(
            "cursor-pointer w-full max-w-xs rounded-3xl overflow-hidden shadow-lg border bg-muted hover:shadow-xl transition",
            className
          )}
        >
          <div className="relative w-full aspect-[16/9]">
            <img
              src={thumbnailUrl || "/placeholder.svg"}
              alt={task.title}
              className={`object-cover w-full h-full ${
                isProcessing ? "opacity-20" : ""
              }`}
              onError={(e) => {
                e.currentTarget.src = "/placeholder-thumbnail.jpg";
              }}
            />
            <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
              0 days before expiring
            </div>
            {isProcessing && (
              <div
                style={{
                  width: Math.round(displayProgress) + "%",
                }}
                className="absolute flex items-center transition-all duration-300 ease-out justify-center inset-0 right-2 bg-orange-400/30 h-full w-full text-xl font-semibold px-2 py-1"
              >
                <span className="">{Math.round(displayProgress)}%</span>
              </div>
            )}
          </div>
          <div className="p-3">
            <div className="text-sm font-semibold line-clamp-1">
              {task.title}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {task.clipType === "AI" ? "AI Generated" : "Manual Clip"}
            </div>
          </div>
        </div>
      </DrawerTrigger>

      <DrawerContent className="max-w-4xl mx-auto p-2 border overflow-hidden font-jost">
        <div className="p-6 max-h-[80vh] rounded-4xl mask-b-from-[90%] border bg-secondary dark:bg-secondary/50 overflow-y-auto space-y-6 hide-scrollbar">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-2">{task.title}</h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="secondary">{task.status}</Badge>
                <span>•</span>
                <span>{task.clipType}</span>
                <span>•</span>
                <span>{task.quality}</span>
              </div>
            </div>
            {task.clipURL && (
              <WrapButton className="font-jost" href={task.clipURL}>
                <Globe className="animate-spin h-5 w-5" />
                Download
              </WrapButton>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-muted/50 p-3 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Created</p>
              <p className="text-sm font-medium">
                {formatTimestamp(task.createdAt as string)}
              </p>
            </div>
            {task.completedAt && (
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Completed</p>
                <p className="text-sm font-medium">
                  {formatTimestamp(task.completedAt as string)}
                </p>
              </div>
            )}
            <div className="bg-muted/50 p-3 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Aspect Ratio</p>
              <p className="text-sm font-medium">
                {task.aspectRatio || "original"}
              </p>
            </div>
            <div className="bg-muted/50 p-3 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Duration</p>
              <p className="text-sm font-medium">
                {formatDuration(task.duration as number)}
              </p>
            </div>
          </div>

          {task.result?.viral_moments &&
            task.result.viral_moments.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {task.result.viral_moments.map((moment, index) => (
                  <MinimalCard key={index} className="relative">
                    <MinimalCardImage
                      src={thumbnailUrl || "/placeholder.svg"}
                      alt={`Viral moment thumbnail`}
                    />
                    <MinimalCardTitle className="line-clamp-2">
                      {moment.reason}
                    </MinimalCardTitle>
                    <MinimalCardDescription className="line-clamp-3 mask-b-from-0%">
                      {moment.content}
                    </MinimalCardDescription>
                    <div className="absolute top-2 right-2 font-semibold bg-secondary text-primary m-1 text-xs px-2 py-1 rounded-full border">
                      Clip Score{" "}
                      <span className="text-orange-500">
                        {moment.confidence_score * 100}%
                      </span>
                    </div>
                  </MinimalCard>
                ))}
              </div>
            )}

          {task.status.toUpperCase() === "FAILED" && task.errorMessage && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              <p className="font-medium mb-1">Error</p>
              <p>{task.errorMessage}</p>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default TaskCard;
