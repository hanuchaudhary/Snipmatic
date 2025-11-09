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
import { Slider } from "@/components/ui/slider";
import { SlidingNumber } from "@/components/ui/sliding-number";
import { toast } from "sonner";
import { ClipTypeSwitch } from "./ClipType";
import { AnimatePresence, motion } from "framer-motion";
import {
  IconAirBalloonFilled,
  IconArrowUpRight,
  IconCircleXFilled,
  IconLoader2,
  IconRainbow,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { formSchema } from "@/lib/validation";
import { useSnipStore } from "@/lib/snipStore";
import { calculateCreditsRequired } from "@/lib/creditMiddleware";
import { AIPromptCard } from "./AIPromptCard";

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
      startTime: "0",
      endTime: "0",
      aspectRatio: "original",
      subtitles: false,
      clipType: "MANUAL",
      multipleClips: false,
      aiPrompt: "",
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

  React.useEffect(() => {
    if (store.videoInfo.duration > 0) {
      setValue("startTime", "0");
      setValue("endTime", String(store.videoInfo.duration));
    }
  }, [store.videoInfo.duration, setValue]);

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
        const startTime = watch("startTime");
        const endTime = watch("endTime");

        const parseTime = (time: string): number => {
          if (time.includes(':')) {
            const [hours, minutes, seconds] = time.split(":").map(Number);
            return hours * 3600 + minutes * 60 + seconds;
          }
          return Number(time);
        };

        const startSeconds = parseTime(startTime);
        const endSeconds = parseTime(endTime);

        if (endSeconds === 0) {
          toast.error("Please select a valid time range");
          setIsProcessing(false);
          return;
        }

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
        if (store.videoInfo.duration > 60 * 40) {
          toast.error(
            "AI clips are only available for videos under 60 minutes. Please select the MANUAL option."
          );
          setIsProcessing(false);
          return;
        }

        if (
          !watchUrl ||
          !watchUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)/)
        ) {
          toast.error("Please enter a valid YouTube URL for AI processing");
          setIsProcessing(false);
          return;
        }
      }

      // Convert seconds to HH:MM:SS format for API
      const formatTimeForAPI = (time: string): string => {
        if (time.includes(':')) return time; // Already in correct format
        const totalSeconds = Number(time);
        const hrs = Math.floor(totalSeconds / 3600);
        const mins = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;
        return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
      };

      const response = await axios.post("/api/task", {
        url: data.url,
        startTime: formatTimeForAPI(data.startTime),
        endTime: formatTimeForAPI(data.endTime),
        aspectRatio: data.aspectRatio,
        subtitles: data.subtitles,
        clipType: data.clipType,
        multipleClips: data.multipleClips,
        duration: store.videoInfo.duration,
        title: store.videoInfo.title,
        thumbnail: store.videoInfo.thumbnail,
        aiPrompt: data.aiPrompt || "",
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
      reset({
        url: "",
        startTime: "0",
        endTime: "0",
        aspectRatio: "original",
        subtitles: false,
        clipType: "MANUAL",
        multipleClips: false,
        aiPrompt: "",
      });
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
        `An error occurred: ${error.response?.data?.error || error.message || "Unknown error"
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
                    <motion.div className="space-y-4">
                      <div className="space-y-3">
                        <Label>Select Time Range</Label>
                        <Controller
                          control={control}
                          name="startTime"
                          render={({ field: startField }) => (
                            <Controller
                              control={control}
                              name="endTime"
                              render={({ field: endField }) => {
                                const parseTime = (time: string): number => {
                                  if (time.includes(':')) {
                                    const [hours, minutes, seconds] = time.split(":").map(Number);
                                    return hours * 3600 + minutes * 60 + seconds;
                                  }
                                  return Number(time) || 0;
                                };

                                const formatTime = (seconds: number): string => {
                                  const hrs = Math.floor(seconds / 3600);
                                  const mins = Math.floor((seconds % 3600) / 60);
                                  const secs = seconds % 60;
                                  return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
                                };

                                const startSeconds = parseTime(startField.value);
                                const endSeconds = parseTime(endField.value);
                                const maxDuration = store.videoInfo.duration || 3600;

                                // Calculate time components for animation
                                const getTimeComponents = (seconds: number) => {
                                  const hrs = Math.floor(seconds / 3600);
                                  const mins = Math.floor((seconds % 3600) / 60);
                                  const secs = seconds % 60;
                                  return { hrs, mins, secs };
                                };

                                const startTime = getTimeComponents(startSeconds);
                                const endTime = getTimeComponents(endSeconds);
                                const clipDuration = getTimeComponents(endSeconds - startSeconds);

                                // Show hours only if video is 1 hour or longer
                                const showHours = maxDuration >= 3600;

                                return (
                                  <div className="space-y-3">
                                    <Slider
                                      min={0}
                                      max={maxDuration}
                                      step={1}
                                      value={[startSeconds, endSeconds]}
                                      onValueChange={(values) => {
                                        startField.onChange(String(values[0]));
                                        endField.onChange(String(values[1]));
                                      }}
                                      className="w-full"
                                      disabled={!store.videoInfo.duration}
                                    />
                                    <div className="flex items-center justify-between text-sm">
                                      <div className="flex flex-col">

                                        <div className="font-mono text-xs flex items-center">
                                          {showHours && (
                                            <>
                                              <SlidingNumber
                                                from={0}
                                                to={startTime.hrs}
                                                duration={0.3}
                                                digitHeight={20}
                                                className=""
                                                startOnView={false}
                                              />
                                              <span>:</span>
                                            </>
                                          )}
                                          <SlidingNumber
                                            from={0}
                                            to={startTime.mins}
                                            duration={0.3}
                                            digitHeight={20}
                                            className=""
                                            startOnView={false}
                                          />
                                          <span>:</span>
                                          <SlidingNumber
                                            from={0}
                                            to={startTime.secs}
                                            duration={0.3}
                                            digitHeight={20}
                                            className=""
                                            startOnView={false}
                                          />
                                        </div>
                                        <span className="text-muted-foreground text-xs">Start Time</span>
                                      </div>
                                      <div className="flex flex-col items-center px-2">
                                        <div className="font-mono text-sm flex items-center gap-0.5 text-orange-400 font-medium">
                                          {showHours && (
                                            <>
                                              <SlidingNumber
                                                from={0}
                                                to={clipDuration.hrs}
                                                duration={0.3}
                                                digitHeight={20}
                                                className=""
                                                startOnView={false}
                                              />
                                              <span>:</span>
                                            </>
                                          )}
                                          <SlidingNumber
                                            from={0}
                                            to={clipDuration.mins}
                                            duration={0.3}
                                            digitHeight={20}
                                            className=""
                                            startOnView={false}
                                          />
                                          <span>:</span>
                                          <SlidingNumber
                                            from={0}
                                            to={clipDuration.secs}
                                            duration={0.3}
                                            digitHeight={20}
                                            className=""
                                            startOnView={false}
                                          />
                                        </div>

                                        <span className="text-muted-foreground text-xs">Duration</span>
                                      </div>
                                      <div className="flex flex-col items-end">

                                        <div className="font-mono text-xs flex items-center">
                                          {showHours && (
                                            <>
                                              <SlidingNumber
                                                from={0}
                                                to={endTime.hrs}
                                                duration={0.3}
                                                digitHeight={20}
                                                className=""
                                                startOnView={false}
                                              />
                                              <span>:</span>
                                            </>
                                          )}
                                          <SlidingNumber
                                            from={0}
                                            to={endTime.mins}
                                            duration={0.3}
                                            digitHeight={20}
                                            className=""
                                            startOnView={false}
                                          />
                                          <span>:</span>
                                          <SlidingNumber
                                            from={0}
                                            to={endTime.secs}
                                            duration={0.3}
                                            digitHeight={20}
                                            className=""
                                            startOnView={false}
                                          />
                                        </div>
                                        <span className="text-muted-foreground text-xs">End Time</span>
                                      </div>
                                    </div>

                                  </div>
                                );
                              }}
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
                                "flex-1 relative border bg-secondary flex justify-center items-center h-12 text-sm md:text-base cursor-pointer rounded-xl transition-all duration-200"
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
                                    "relative z-30 font-medium py-3 px-4",
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

                <div className="w-full flex items-center justify-end mt-4 gap-2">
                  <AIPromptCard
                    onPromptSubmit={(prompt) => setValue("aiPrompt", prompt)}
                    disabled={isProcessing || !watchUrl || watchClipType !== "AI"}
                  />
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
