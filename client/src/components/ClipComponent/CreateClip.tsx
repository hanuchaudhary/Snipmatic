"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { ClipTypeSwitch } from "./ClipType";
import { AnimatePresence, motion } from "framer-motion";
import {
  IconArrowUpRight,
  IconCircleXFilled,
  IconLoader2,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { formSchema } from "@/lib/validation";
import { useSnipStore } from "@/lib/snipStore";
import { EMAIL_SERVER_URL } from "@/config/config";
import { calculateCreditsRequired } from "@/lib/creditMiddleware";

type FormValues = z.infer<typeof formSchema>;

export function CreateClipPage() {
  const { data: session } = useSession();
  const store = useSnipStore();

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
  const { totalCreditsRequired } = calculateCreditsRequired(
    watchClipType as "MANUAL" | "AI",
    watchMultiple,
    watch("subtitles")
  );
  const [isProcessing, setIsProcessing] = React.useState<boolean>(false);

  React.useEffect(() => {
    let isValidUrl = watchUrl?.match(
      /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/(watch\?v=)?([a-zA-Z0-9_-]{11})/
    );
    if (!isValidUrl && watchUrl !== "") {
      setValue("url", "");
      toast.error("Please enter a valid YouTube URL");
      return;
    }

    if (watchUrl && !store.isFetching) {
      store.fetchVideoInfo(watchUrl);
    }
  }, [watchUrl]);

  const onSubmit = async (data: FormValues) => {
    if (!session?.user?.id) {
      toast.error("Please sign in to create clips");
      return;
    }

    try {
      setIsProcessing(true);

      if (!watchUrl) {
        toast.error("Please enter a valid YouTube URL");
        setIsProcessing(false);
        return;
      }

      if (watchClipType === "MANUAL" && !watch("startTime")) {
        toast.error("Please enter a valid start time");
        setIsProcessing(false);
        return;
      }

      if (watchClipType === "MANUAL" && !watch("endTime")) {
        toast.error("Please enter a valid end time");
        setIsProcessing(false);
        return;
      }

      if (watchClipType === "MANUAL") {
        if (
          watch("startTime") === "00:00:00" &&
          watch("endTime") === "00:00:00"
        ) {
          toast.error("Please enter a valid start and end time");
          setIsProcessing(false);
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
          setIsProcessing(false);
          return;
        }
        if (watchMultiple) {
          setValue("multipleClips", false);
        }

        if (store.videoInfo.duration < endSeconds) {
          console.log(
            "Video duration:",
            store.videoInfo.duration,
            "End time:",
            endSeconds,
            "start time:",
            startSeconds
          );

          toast.error("End time exceeds video duration");
          setIsProcessing(false);
          return;
        }
      } else if (watchClipType === "AI") {
        if (
          !watchUrl ||
          !watchUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)/)
        ) {
          toast.error("Please enter a valid YouTube URL for AI processing");
          setIsProcessing(false);
          return;
        }
      }

      const response = await axios.post("/api/task", {
        url: data.url,
        startTime: data.startTime,
        endTime: data.endTime,
        aspectRatio: data.aspectRatio,
        subtitles: data.subtitles,
        clipType: data.clipType,
        multipleClips: data.multipleClips,
        duration: store.videoInfo.duration,
        title: store.videoInfo.title,
        thumbnail: store.videoInfo.thumbnail,
      });

      if (!response.data.success) {
        toast.error("Failed to create clip. Please try again.");
        setIsProcessing(false);
        return;
      }

      store.fetchCredits();
      store.startPollingOnNewTask();
      store.setVideoInfo({
        url: "",
        duration: 0,
        title: "",
        thumbnail: "",
      });
      reset();
      setIsProcessing(false);

      toast.dismiss();
      toast.success(
        "Video processing started! Scroll down to check your dashboard for progress."
      );
    } catch (error: any) {
      toast.dismiss();
      setIsProcessing(false);

      if (error.response?.status === 403) {
        const errorData = error.response.data;
        toast.error(
          `Insufficient credits. You need ${errorData.creditsRequired} credits but only have ${errorData.currentCredits}.`
        );
        return;
      }

      toast.error(
        `An error occurred: ${
          error.response?.data?.error || error.message || "Unknown error"
        }`
      );
    }
  };

  return (
    <div className="relative min-h-screen md:pt-10 pt-26 p-4 flex items-center justify-center">
      <div className="max-w-2xl container relative group mx-auto space-y-4 ">
        <AnimatePresence mode="wait">
          {store.isFetching ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="text-center text-2xl font-instrumental font-thin md:mt-10"
            >
              Fetching{" "}
              <span className="dark:text-orange-500 text-orange-600">
                video
              </span>{" "}
              info...
            </motion.div>
          ) : store.videoInfo.thumbnail ? (
            <motion.div
              key="thumbnail"
              initial={{ opacity: 0, filter: "blur(20px)", y: 20 }}
              animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
              exit={{ opacity: 0, filter: "blur(20px)", y: -10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="relative md:h-50 h-42 md:mt-10 bg-muted/30 rounded-3xl w-full overflow-hidden border-2 shadow backdrop-blur-sm"
            >
              <div
                onClick={() => {
                  setValue("url", "");
                  store.videoInfo.thumbnail = "";
                }}
                className="absolute z-[99] top-3 right-3"
              >
                <IconCircleXFilled className="h-7 w-7 shadow opacity-80 hover:opacity-100 hover:scale-105 transition-transform cursor-pointer text-orange-200" />
              </div>
              <img
                src={store.videoInfo.thumbnail}
                alt="YouTube Thumbnail"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 right-2 rounded-[16px] backdrop-blur-sm bg-primary-foreground/30 border dark:border-border border-border/30 text-white p-2 font-jost font-semibold">
                <p className="text-sm">{store.videoInfo.title}</p>
                <p className="text-xs">
                  {Math.floor(store.videoInfo.duration / 60)}:
                  {String(store.videoInfo.duration % 60).padStart(2, "0")}{" "}
                  minutes
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="title"
              initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="text-center md:text-2xl text-xl md:mb-8 mb-6 font-instrumental font-thin"
            >
              Ready to Snip Something{" "}
              <span className="dark:text-orange-500 text-orange-600">
                Viral?
              </span>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="md:p-2.5 bg-muted/20 md:rounded-[42px] p-1 rounded-[36px] backdrop-blur-sm border">
          <Card className="border-muted/30 border-none">
            <CardContent className="font-jost p-4 md:py-0">
              <form
                className="md:space-y-6 space-y-4"
                onSubmit={handleSubmit(onSubmit)}
              >
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
                  <ClipTypeSwitch
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
                            onCheckedChange={(checked) =>
                              field.onChange(checked)
                            }
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
                      {watch("startTime") && watch("endTime") && (
                        <p className="text-sm text-muted-foreground">
                          Duration:{" "}
                          {watch("startTime") && watch("endTime")
                            ? `${watch("startTime")}s - ${watch("endTime")}s`
                            : "00:00:00 - 00:00:00"}
                        </p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-2">
                  <Controller
                    control={control}
                    name="aspectRatio"
                    render={({ field }) => (
                      <div className="flex flex-wrap gap-2 border p-2 rounded-[22px] bg-secondary/50">
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
                          const isActive =
                            option.value === watch("aspectRatio");

                          return (
                            <button
                              onClick={() => field.onChange(option.value)}
                              key={option.value}
                              type="button"
                              className={cn(
                                "flex-1 relative border bg-secondary justify-center md:h-15 text-sm md:text-base cursor-pointer rounded-xl"
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
                    disabled={isProcessing || watchClipType === "MANUAL"}
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
                  <Button
                    size={"sm"}
                    type="submit"
                    disabled={!watchUrl || isProcessing || store.isFetching}
                  >
                    {isProcessing ? (
                      <span className="flex items-center gap-2">
                        Processing
                        <IconLoader2 className="animate-spin h-4 w-4" />
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Process Video({totalCreditsRequired})
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

      <AnimatePresence>
        {isProcessing && (
          <motion.div
            key="processing"
            initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="absolute bottom-6 text-muted-foreground font-instrumental left-1/2 transform -translate-x-1/2"
          >
            Scroll down to see your{" "}
            <span className="text-orange-400">clips</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
