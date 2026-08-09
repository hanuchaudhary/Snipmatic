import React from "react";
import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { type ClipModel, youtubeUrlSchema } from "@snipmatic/utils";
import { sanitizeYoutubeUrl } from "@snipmatic/utils";
import { IconLoader2, IconUpload, IconX } from "@tabler/icons-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import z from "zod";

import { ClipApi } from "@/lib/api";
import { cn } from "@/lib/utils";

import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Slider } from "../ui/slider";
import { Switch } from "../ui/switch";
import { VideoInfo } from "./video-info";

const formatDuration = (seconds: number) => {
  const totalSeconds = Math.floor(seconds);

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const remainingSeconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  }

  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

const formSchema = z.object({
  url: youtubeUrlSchema,
});

type FormValues = z.infer<typeof formSchema>;

export const CreateClip = () => {
  const [isGettingInfo, setIsGettingInfo] = React.useState<boolean>(false);

  const [videoInfo, setVideoInfo] = React.useState<
    ClipModel["previewResponse"] | null
  >(null);

  const [isCreatingClip, setIsCreatingClip] = React.useState(false);

  const [clipRange, setClipRange] = React.useState<[number, number]>([0, 1]);

  const [subtitles, setSubtitles] = React.useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: "",
    },
  });
  const onGetVideoInfo = async (values: FormValues) => {
    if (isGettingInfo) {
      return;
    }

    setIsGettingInfo(true);

    try {
      const sanitizedUrl = sanitizeYoutubeUrl(values.url);

      form.setValue("url", sanitizedUrl);

      const info = await ClipApi.preview({
        url: sanitizedUrl,
      });

      if (!info) {
        throw new Error(
          "Unable to fetch video information. Please check the URL and try again."
        );
      }

      setVideoInfo(info);

      const duration = Math.floor(info.duration);

      setClipRange([0, Math.max(1, duration)]);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong while fetching the video."
      );
    } finally {
      setIsGettingInfo(false);
    }
  };

  const onResetVideo = () => {
    setVideoInfo(null);
    setClipRange([0, 1]);
    setSubtitles(false);

    form.reset({
      url: "",
    });
  };

  const onCreateClip = async () => {
    if (!videoInfo) {
      return;
    }

    if (clipRange[1] <= clipRange[0]) {
      toast.error("Please select a valid clip duration.");
      return;
    }

    setIsCreatingClip(true);

    try {
      const payload = {
        url: form.getValues("url"),
        from: clipRange[0],
        to: clipRange[1],
        subtitles,
      };

      console.log(payload);

      toast.success("Clip processing started.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to create clips. Please try again."
      );
    } finally {
      setIsCreatingClip(false);
    }
  };

  return (
    <motion.div
      className={cn(
        "min-h-[30vh] pt-16 transition-transform",
        videoInfo ? "mx-30" : "mx-20"
      )}
    >
      <div className="w-full flex items-center justify-center pb-16">
        <div className="flex items-center justify-center gap-2 border rounded-[20px] w-fit pl-4 pr-1 py-1 font-sans text-sm">
          <p>
            You are using the Free Plan of OpusClip with watermark and limited
            features.
          </p>
          <Button className="font-normal" variant={"secondary"}>
            Upgrade
          </Button>
        </div>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onGetVideoInfo)}>
          <FormField
            control={form.control}
            name="url"
            render={({ field }) => (
              <FormItem>
                <h2 className="text-2xl">Snipmatic</h2>
                <div className="relative">
                  <img
                    src="/youtube-icon.png"
                    alt="YouTube Icon"
                    className="absolute top-1/2 -translate-y-1/2 left-0 w-10"
                  />
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      disabled={Boolean(videoInfo)}
                      placeholder="Paste a YouTube link or upload a video"
                      autoFocus
                      className="w-full border-0 rounded-none focus-visible:ring-0 focus:ring-0 focus-visible:outline-0 bg-transparent! text-[1.4rem]! mask-r-from-80% font-light pl-12! border-b py-6!"
                    />
                  </FormControl>

                  {videoInfo ? (
                    <Button
                      type="button"
                      variant={"secondary"}
                      className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full"
                      size="icon"
                      onClick={onResetVideo}
                    >
                      <IconX />
                    </Button>
                  ) : (
                    <Button
                      className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full"
                      type="submit"
                      disabled={isGettingInfo}
                    >
                      {isGettingInfo ? (
                        <>
                          <IconLoader2 className="animate-spin" />
                          Getting Clips
                        </>
                      ) : (
                        "Get Clips"
                      )}
                    </Button>
                  )}
                </div>

                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
      <div className="flex mt-4">
        <Button
          disabled={videoInfo ? true : false}
          variant={"ghost"}
          className="flex items-center gap-2 text-muted-foreground hover:text-primary cursor-pointer"
        >
          <IconUpload className="size-5" /> Upload
        </Button>
        <Button
          disabled={videoInfo ? true : false}
          variant={"ghost"}
          className="flex items-center gap-2 text-muted-foreground hover:text-primary cursor-pointer"
        >
          <img src="/gdrive-icon.png" alt="Gdrive Icon" className="w-5" />
          Google Drive
        </Button>
      </div>
      {videoInfo && (
        <Button
          type="button"
          className="w-full py-6 rounded-full mt-4"
          onClick={onCreateClip}
          disabled={isCreatingClip || clipRange[1] <= clipRange[0]}
        >
          {isCreatingClip ? (
            <>
              <IconLoader2 className="animate-spin" />
              Creating Clips
            </>
          ) : (
            "Get Clips in 1 Click"
          )}
        </Button>
      )}
      {videoInfo && (
        <>
          <VideoInfo
            videoInfo={videoInfo}
            clipRange={clipRange}
            onClipRangeChange={setClipRange}
            subtitles={subtitles}
            onSubtitlesChange={setSubtitles}
          />
        </>
      )}
    </motion.div>
  );
};
