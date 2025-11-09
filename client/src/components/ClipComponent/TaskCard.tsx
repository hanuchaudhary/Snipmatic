"use client";

import React, { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
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
import { IconBrandXFilled } from "@tabler/icons-react";
import { toast } from "sonner";
import axios from "axios";

interface TaskCardProps {
  task: Task;
  className?: string;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, className }) => {
  const [open, setOpen] = useState(false);
  const isProcessing = !["COMPLETED", "FAILED"].includes(
    task.status.toUpperCase()
  );

  const [progress, setProgress] = useState(task.progress || 0);
  const [posting ,setPosting] = useState(false)
  const [displayProgress, setDisplayProgress] = useState(task.progress || 0);

  useEffect(() => {
    if (task.progress !== undefined) {
      const newProgress = Math.max(progress, task.progress);
      setProgress(newProgress);
    }
  }, [task.progress, progress]);

  useEffect(() => {
    const animationDuration = 1500;
    const steps = 60;
    const stepDuration = animationDuration / steps;
    const progressDiff = progress - displayProgress;
    const stepIncrement = progressDiff / steps;

    if (progressDiff > 0.1) {
      let currentStep = 0;
      const animationInterval = setInterval(() => {
        currentStep++;
        if (currentStep <= steps) {
          setDisplayProgress((prev) => {
            const newValue = prev + stepIncrement;
            return Math.max(prev, Math.min(100, newValue));
          });
        } else {
          setDisplayProgress(progress);
          clearInterval(animationInterval);
        }
      }, stepDuration);

      return () => clearInterval(animationInterval);
    } else if (progressDiff < -0.1) {
      setDisplayProgress(progress);
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
              src={
                task.thumbnailUrl ||
                (task.youtubeUrl
                  ? getYouTubeThumbnail(task.youtubeUrl)
                  : null) ||
                "/placeholder.jpg"
              }
              alt={task.title}
              className={`object-cover w-full h-full ${
                isProcessing ? "opacity-20" : ""
              }`}
              onError={(e) => {
                if (
                  task.youtubeUrl &&
                  e.currentTarget.src !== getYouTubeThumbnail(task.youtubeUrl)
                ) {
                  e.currentTarget.src = getYouTubeThumbnail(task.youtubeUrl);
                } else {
                  e.currentTarget.src = "/placeholder.jpg";
                }
              }}
            />
            <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
              1 days before expiring
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

      <DrawerContent className="max-w-4xl mx-auto p-2 border overflow-hidden font-jost mb-2">
        <div className="p-6 max-h-[80vh] rounded-4xl mask-b-from-[90%] border bg-secondary dark:bg-secondary/50 overflow-y-auto space-y-6 hide-scrollbar">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-2 max-w-[95%]">{task.title}</h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="secondary">{task.status}</Badge>
                <span>•</span>
                <span>{task.clipType}</span>
                <span>•</span>
                <span>{"1080p"}</span>
              </div>
            </div>
           <div className="flex items-center justify-center gap-4">
             {task.clipURL && (
              <WrapButton
                className=""
                href={task.clipURL}
                // onClick={() => {
                //   downloadFile(
                //     task.clipURL!,
                //     `${task.title?.slice(0, 10)}.mp4`
                //   );
                // }}
              >
                {/* <Globe className="animate-spin h-5 w-5" /> */}
                Download
              </WrapButton>
            )}
            {task.clipURL && (
              <button
              disabled={posting} onClick={async () =>{
                setPosting(true)
                const isZipt = task.clipURL?.endsWith(".zip");
                if (isZipt){
                  toast.error("Posting zip files is not supported yet!");
                  return;
                }

                try {
                  const res= await axios.post("/api/post",{
                    title: task.title,
                    url: task.clipURL,
                    mediaKey:"clips" + task.clipURL?.split("clips")[1]
                  })
                  if (res.status == 201){
                    toast.success("Posted on X successfully")
                  }
                } catch (error) {
                  toast.error("Failed to post on X")
                }
                finally{
                  setPosting(false)
                }
              }} className="flex items-center justify-center gap-2 border-2 px-4 py-2 rounded-full font-instrumental tracking-wider hover:scale-105 transition-transform cursor-pointer">
                <IconBrandXFilled className="size-4"/>
                {posting ? "Posting..." : "Post"}
              </button>
            )}
           </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="dark:bg-muted/50 bg-white p-3 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Created</p>
              <p className="text-sm font-medium">
                {formatTimestamp(task.createdAt as string)}
              </p>
            </div>
            {task.completedAt && (
              <div className="dark:bg-muted/50 bg-white p-3 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Completed</p>
                <p className="text-sm font-medium">
                  {formatTimestamp(task.completedAt as string)}
                </p>
              </div>
            )}
            <div className="dark:bg-muted/50 bg-white p-3 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Aspect Ratio</p>
              <p className="text-sm font-medium">{"original"}</p>
            </div>
            <div className="dark:bg-muted/50 bg-white p-3 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Duration</p>
              <p className="text-sm font-medium">
                {formatDuration(task.duration as number)}
              </p>
            </div>
          </div>

          {task.clipsData?.viral_moments &&
            task.clipsData.viral_moments.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {task.clipsData.viral_moments.map(
                  (
                    moment: {
                      reason: string;
                      content: string;
                      confidence_score: number;
                    },
                    index: number
                  ) => (
                    <MinimalCard key={index} className="relative">
                      <MinimalCardImage
                        src={
                          task.thumbnailUrl ||
                          getYouTubeThumbnail(task.youtubeUrl) ||
                          "/placeholder.jpg"
                        }
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
                  )
                )}
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
