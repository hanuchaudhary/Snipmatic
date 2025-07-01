"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { set, z } from "zod";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { CliptypeSwitch } from "./ClipType";
import { AnimatePresence, motion } from "framer-motion";
import {
  IconArrowUpRight,
  IconCircleXFilled,
  IconLoader2,
} from "@tabler/icons-react";
import { cn, downloadFile } from "@/lib/utils";
import { BACKEND_URL } from "../../../config";

const formSchema = z.object({
  url: z
    .string()
    .url("Please enter a valid video URL")
    .min(1, "URL is required"),
  startTime: z.string().regex(/^\d{2}:\d{2}:\d{2}$/, "Invalid time format"),
  endTime: z.string().regex(/^\d{2}:\d{2}:\d{2}$/, "Invalid time format"),
  aspectRatio: z.enum(["original", "vertical", "square"]),
  subtitles: z.boolean(),
  clipType: z.enum(["AI", "MANUAL"]).optional(),
  multipleClips: z.boolean().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function CreateClipPage() {
  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<FormValues>({
    defaultValues: {
      url: "",
      startTime: "00:00:00",
      endTime: "00:00:00",
      aspectRatio: "original",
      subtitles: false,
      clipType: "MANUAL",
      multipleClips: false,
    },
    resolver: zodResolver(formSchema),
  });

  const watchUrl = watch("url");
  const watchMultiple = watch("multipleClips");
  const watchClipType = watch("clipType");
  const [isProcessing, setIsProcessing] = React.useState<boolean>(false);
  const [thumbnail, setThumbnail] = React.useState<string | null>(null);

  React.useEffect(() => {
    const extractYouTubeVideoId = (url: string): string | null => {
      const match = url.match(
        /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/
      );
      return match ? match[1] : null;
    };

    const id = extractYouTubeVideoId(watchUrl);
    if (id) {
      setThumbnail(`https://img.youtube.com/vi/${id}/hqdefault.jpg`);
    } else {
      setThumbnail(null);
    }
  }, [watchUrl]);

  const onSubmit = async (data: FormValues) => {
    try {
      setIsProcessing(true);
      
      if (!watchUrl) {
        toast.error("Please enter a valid YouTube URL");
        return;
      }
      
      if (watchClipType === "MANUAL" && !watch("startTime")) {
        toast.error("Please enter a valid start time");
        return;
      }
      
      if (watchClipType === "MANUAL" && !watch("endTime")) {
        toast.error("Please enter a valid end time");
        return;
      }
      
      if (watchClipType === "MANUAL") {
        if (
          watch("startTime") === "00:00:00" &&
          watch("endTime") === "00:00:00"
        ) {
          toast.error("Please enter a valid start and end time");
          return;
        }
        
        function timeToSeconds(timeStr: string): number {
          const [hours, minutes, seconds] = timeStr.split(":").map(Number);
          return hours * 3600 + minutes * 60 + seconds;
        }
        
        const startTime = watch("startTime");
        const endTime = watch("endTime");
        const startSeconds = timeToSeconds(startTime);
        const endSeconds = timeToSeconds(endTime);
        
        if (startSeconds >= endSeconds) {
          toast.error("Start time must be before end time");
          return;
        }
        
        if (watchMultiple) {
          setValue("multipleClips", false);
        }
      } else if (watchClipType === "AI") {
        if (
          !watchUrl ||
          !watchUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)/)
        ) {
          toast.error("Please enter a valid YouTube URL for AI processing");
          return;
        }
      }
      
      toast.success("Processing your video...");
      
      const response = await axios.post(
        `${BACKEND_URL}/clip`,
        {
          url: data.url,
          startTime: data.startTime,
          endTime: data.endTime,
          aspectRatio: data.aspectRatio,
          subtitles: data.subtitles,
          clipType: data.clipType,
          multipleClips: data.multipleClips,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const resData = response.data;
      if (resData.clip_url) {
        toast.dismiss();
        toast.success("Video processed successfully!");

        toast.loading("Downloading your clip...");
        await downloadFile(resData.clip_url, `Snipmatic_Clip_${Date.now()}.mp4`);
        toast.dismiss();
        toast.success("Clip downloaded successfully!");
      } else {
        toast.error("Failed to process video. Please try again.");
      }
    } catch (error) {
      toast.error(
        `An error occurred: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen md:pt-0 pt-16 p-4 flex items-center justify-center">
      <div className="container max-w-2xl mx-auto space-y-4">
        <AnimatePresence mode="wait">
          {thumbnail ? (
            <motion.div
              key="thumbnail"
              initial={{ opacity: 0, filter: "blur(20px)", y: 20 }}
              animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
              exit={{ opacity: 0, filter: "blur(20px)", y: -10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="relative h-60 mt-10 bg-secondary/50 rounded-xl w-full overflow-hidden border-2 shadow"
            >
              <div
                onClick={() => {
                  setValue("url", "");
                }}
                className="absolute z-[99] top-3 right-3"
              >
                <IconCircleXFilled className="h-7 w-7 shadow opacity-80 hover:opacity-100 hover:scale-105 transition-transform cursor-pointer" />
              </div>
              <img
                src={thumbnail}
                alt="YouTube Thumbnail"
                className="w-full h-full object-cover"
              />
            </motion.div>
          ) : (
            <motion.div
              key="title"
              initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="text-center md:text-4xl text-2xl md:mb-8 mb-6 font-instrumental font-thin"
            >
              Ready to Snip Something{" "}
              <span className="dark:text-orange-500 text-orange-600">
                Viral?
              </span>
            </motion.div>
          )}
        </AnimatePresence>
        <Card>
          <CardContent className="font-jost">
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-2">
                <Controller
                  control={control}
                  name="url"
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="url"
                      type="url"
                      placeholder="Paste any YouTube link..."
                      className="border-none focus-visible:ring-0 shadow-none"
                    />
                  )}
                />
                {errors.url && (
                  <p className="text-sm text-destructive">
                    {errors.url.message}
                  </p>
                )}
              </div>

              <div className="inline-block">
                <CliptypeSwitch
                  clipType={watchClipType || "MANUAL"}
                  setClipType={() => {
                    const currentType = watchClipType;
                    setValue(
                      "clipType",
                      currentType === "AI" ? "MANUAL" : "AI"
                    );
                  }}
                />
              </div>

              <AnimatePresence>
                {watchClipType === "AI" && (
                  <motion.div className="flex items-center justify-between py-2.5">
                    <Label htmlFor="multipleClips" className="">
                      Generate Multiple Clips with AI
                    </Label>
                    <Controller
                      control={control}
                      name="multipleClips"
                      render={({ field }) => (
                        <Switch
                          id="multipleClips"
                          checked={field.value}
                          disabled={watchClipType !== "AI"}
                          onCheckedChange={(checked) => field.onChange(checked)}
                        />
                      )}
                    />
                  </motion.div>
                )}
                {watchClipType === "MANUAL" && (
                  <motion.div className="space-y-2">
                    <div className="flex items-center gap-4">
                      <Controller
                        control={control}
                        name="startTime"
                        render={({ field }) => (
                          <Input
                            {...field}
                            placeholder="Start - 00:00:00"
                            className="flex-1 font-mono"
                          />
                        )}
                      />
                      <span className="text-muted-foreground">-</span>
                      <Controller
                        control={control}
                        name="endTime"
                        render={({ field }) => (
                          <Input
                            {...field}
                            placeholder="End - 00:00:00"
                            className="flex-1 font-mono"
                          />
                        )}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2">
                <Controller
                  control={control}
                  name="aspectRatio"
                  render={({ field }) => (
                    <div className="flex flex-wrap gap-2 border p-2 rounded-2xl bg-secondary/50">
                      {[
                        {
                          value: "original",
                          label: "Original",
                        },
                        {
                          value: "vertical",
                          label: "Vertical (9:16)",
                        },
                        {
                          value: "square",
                          label: "Square (1:1)",
                        },
                      ].map((option) => {
                        const isActive = option.value === watch("aspectRatio");

                        return (
                          <button
                            onClick={() => field.onChange(option.value)}
                            key={option.value}
                            type="button"
                            className={cn(
                              "flex-1 relative border bg-secondary justify-center md:h-15 md:text-base cursor-pointer rounded-xl"
                            )}
                          >
                            {isActive && (
                              <motion.div
                                layoutId={"active"}
                                className={`absolute inset-0 z-20 rounded-xl bg-primary`}
                                transition={{ duration: 0.3, type: "spring" }}
                              />
                            )}
                            {
                              <span
                                className={cn(
                                  "relative m-auto px-4 z-30 font-[500]",
                                  isActive
                                    ? "text-primary-foreground"
                                    : "text-muted-foreground"
                                )}
                              >
                                {option.label}
                              </span>
                            }
                          </button>
                        );
                      })}
                    </div>
                  )}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="subtitles">Subtitles</Label>
                <Controller
                  control={control}
                  name="subtitles"
                  render={({ field }) => (
                    <div className="flex items-center space-x-2 pt-2">
                      <Switch
                        id="subtitles"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <Label htmlFor="subtitles" className="text-sm">
                        English only
                      </Label>
                    </div>
                  )}
                />
              </div>

              <div className="w-full flex items-center justify-end mt-4">
                <Button type="submit" disabled={!watchUrl || isProcessing}>
                  {isProcessing ? (
                    <span className="flex items-center gap-2">
                      Processing
                      <IconLoader2 className="animate-spin h-4 w-4" />
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Process Video
                      <IconArrowUpRight />
                    </span>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
