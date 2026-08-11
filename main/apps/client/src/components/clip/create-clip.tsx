import React from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  type ClipModel,
  type PaymentModel,
  calculateClipCredits,
  hasEnoughCredits,
  sanitizeYoutubeUrl,
  youtubeUrlSchema,
} from "@snipmatic/utils";
import { IconLoader2, IconUpload, IconX } from "@tabler/icons-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import z from "zod";

import { useVideoUpload } from "@/hooks/use-video-upload";
import { ClipApi } from "@/lib/api";
import { PaymentApi } from "@/lib/api/payment";
import { cn } from "@/lib/utils";
import type { ClipsPageState } from "@/types/clip-navigation";

import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { VideoInfo } from "./video-info";

const formSchema = z.object({
  url: youtubeUrlSchema,
});

type FormValues = z.infer<typeof formSchema>;

export const CreateClip = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const isClipsPage = location.pathname === "/clips";
  const pageState = location.state as ClipsPageState | null;

  const { upload, progress, isUploading, abort, reset } = useVideoUpload();

  const [isGettingInfo, setIsGettingInfo] = React.useState(false);
  const [videoInfo, setVideoInfo] = React.useState<
    ClipModel["previewResponse"] | null
  >(isClipsPage ? (pageState?.videoInfo ?? null) : null);
  const [previewUrl, setPreviewUrl] = React.useState<string | undefined>(
    pageState?.previewUrl
  );
  const [sourceKey, setSourceKey] = React.useState<string | undefined>(
    pageState?.sourceKey
  );
  const [isCreatingClip, setIsCreatingClip] = React.useState(false);
  const [clipRange, setClipRange] = React.useState<[number, number]>(
    pageState?.clipRange ?? [0, 1]
  );
  const [subtitles, setSubtitles] = React.useState(
    pageState?.subtitles ?? false
  );
  const [credits, setCredits] = React.useState<
    PaymentModel["creditsResponse"] | null
  >(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: pageState?.url ?? "",
    },
  });

  React.useEffect(() => {
    PaymentApi.getCredits()
      .then(setCredits)
      .catch(() => undefined);
  }, []);

  React.useEffect(() => {
    if (!isClipsPage || !pageState?.videoInfo) {
      return;
    }

    setVideoInfo(pageState.videoInfo);
    setClipRange(pageState.clipRange);
    setSubtitles(pageState.subtitles);
    setPreviewUrl(pageState.previewUrl);
    setSourceKey(pageState.sourceKey);

    if (pageState.url) {
      form.setValue("url", pageState.url);
    }
  }, [form, isClipsPage, pageState]);

  React.useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const estimatedCredits = React.useMemo(() => {
    if (!videoInfo) {
      return 0;
    }

    return calculateClipCredits({
      durationSeconds: clipRange[1] - clipRange[0],
      subtitles,
    });
  }, [clipRange, subtitles, videoInfo]);

  const onGetVideoInfo = async (values: FormValues) => {
    if (isGettingInfo || isUploading) {
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

      const duration = Math.floor(info.duration);
      const nextState: ClipsPageState = {
        source: "youtube",
        url: sanitizedUrl,
        videoInfo: info,
        clipRange: [0, Math.max(1, duration)],
        subtitles: false,
      };

      if (isClipsPage) {
        setVideoInfo(info);
        setClipRange(nextState.clipRange);
        setSubtitles(false);
        setPreviewUrl(undefined);
        setSourceKey(undefined);
        navigate("/clips", { state: nextState, replace: true });
      } else {
        navigate("/clips", { state: nextState });
      }
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

  const onUploadClick = () => {
    if (showVideoDetails || isUploading) {
      return;
    }

    fileInputRef.current?.click();
  };

  const onFileSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    try {
      const result = await upload(file);
      const nextState: ClipsPageState = {
        source: "upload",
        sourceKey: result.key,
        previewUrl: result.previewUrl,
        videoInfo: {
          title: result.filename.replace(/\.[^/.]+$/, ""),
          duration: result.duration,
          thumbnail: "",
        },
        clipRange: [0, Math.max(1, result.duration)],
        subtitles: false,
      };

      setVideoInfo(nextState.videoInfo);
      setClipRange(nextState.clipRange);
      setSubtitles(false);
      setPreviewUrl(result.previewUrl);
      setSourceKey(result.key);
      form.reset({ url: "" });
      navigate("/clips", { state: nextState, replace: isClipsPage });
      toast.success("Video uploaded successfully.");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      toast.error(
        error instanceof Error ? error.message : "Unable to upload video."
      );
    }
  };

  const onResetVideo = () => {
    if (isUploading) {
      abort();
    }

    reset();

    if (previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    setVideoInfo(null);
    setPreviewUrl(undefined);
    setSourceKey(undefined);
    setClipRange([0, 1]);
    setSubtitles(false);

    form.reset({
      url: "",
    });

    if (isClipsPage) {
      navigate("/dashboard", { replace: true });
    }
  };

  const onCreateClip = async () => {
    if (!videoInfo) {
      return;
    }

    if (clipRange[1] <= clipRange[0]) {
      toast.error("Please select a valid clip duration.");
      return;
    }

    const requiredCredits = calculateClipCredits({
      durationSeconds: clipRange[1] - clipRange[0],
      subtitles,
    });

    let balance = credits?.balance ?? 0;

    if (!credits) {
      try {
        const latestCredits = await PaymentApi.getCredits();
        setCredits(latestCredits);
        balance = latestCredits.balance;
      } catch {
        toast.error("Unable to verify credits. Please try again.");
        return;
      }
    }

    if (!hasEnoughCredits(balance, requiredCredits)) {
      toast.error("Not enough credits for this clip.", {
        action: {
          label: "Upgrade",
          onClick: () => navigate("/pricing"),
        },
      });
      return;
    }

    setIsCreatingClip(true);

    try {
      const payload = {
        source: sourceKey ? "upload" : "youtube",
        url: form.getValues("url") || undefined,
        sourceKey,
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

  const showVideoDetails = isClipsPage && videoInfo;
  const isBusy = isGettingInfo || isUploading;

  return (
    <motion.div
      className={cn(
        "min-h-[30vh] pt-16 transition-transform relative"
      )}
    >
      <div className={cn("absolute md:-bottom-55 -bottom-45 left-1/2 -translate-x-1/2 text-muted-foreground/20 md:text-[12rem] text-[10rem] mask-b-from-0% z-0 select-none pointer-events-none", isClipsPage && "hidden")}>
        <p>
          Snipmatic
        </p>
      </div>
      <div className="w-full hidden md:flex items-center justify-center pb-16">
        <div className="flex items-center justify-center gap-2 border rounded-[20px] w-fit pl-4 pr-1 py-1 font-sans md:text-sm">
          <p>
            {credits
              ? `${credits.balance} credits remaining on ${credits.planTier} plan${showVideoDetails ? ` · estimated cost ${estimatedCredits} credits` : ""}`
              : "Loading credits..."}
          </p>
          <Button className="font-normal" variant="secondary" asChild>
            <Link to="/pricing">Upgrade</Link>
          </Button>
        </div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={onFileSelected}
      />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onGetVideoInfo)} className="relative z-20">
          <FormField
            control={form.control}
            name="url"
            render={({ field }) => (
              <FormItem>
                <h2 className="md:text-2xl">Snipmatic</h2>
                <div className="relative">
                  <img
                    src="/youtube-icon.png"
                    alt="YouTube Icon"
                    className="absolute top-1/2 -translate-y-1/2 left-0 md:w-8 w-5"
                  />
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      disabled={Boolean(showVideoDetails) || isBusy}
                      placeholder="Paste a YouTube link or upload a video"
                      autoFocus
                      className="w-full border-0 rounded-none focus-visible:ring-0 focus:ring-0 focus-visible:outline-0 bg-transparent! md:text-[1.4rem]! text-lg mask-r-from-80% font-light md:pl-10! pl-6! border-b md:py-6! py-4"
                    />
                  </FormControl>

                  {showVideoDetails ? (
                    <Button
                      type="button"
                      variant="secondary"
                      className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full md:flex hidden"
                      size="icon"
                      onClick={onResetVideo}
                    >
                      <IconX />
                    </Button>
                  ) : (
                    <Button
                      className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full md:flex hidden"
                      type="submit"
                      disabled={isBusy}
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
      {isUploading && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Uploading video...</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={abort}>
            Cancel upload
          </Button>
        </div>
      )}
      <div className="flex md:mt-4 mt-3 relative z-20">
        <Button
          type="button"
          disabled={Boolean(showVideoDetails) || isBusy}
          variant="ghost"
          className="flex items-center md:gap-2 text-muted-foreground hover:text-primary cursor-pointer text-xs md:text-base"
          onClick={onUploadClick}
        >
          <IconUpload className="md:size-5 size-4" /> Upload
        </Button>
        <Button
          disabled={Boolean(showVideoDetails) || isBusy}
          variant="ghost"
          className="flex items-center md:gap-2 text-muted-foreground hover:text-primary cursor-pointer md:text-base text-xs"
        >
          <img src="/gdrive-icon.png" alt="Gdrive Icon" className="md:w-5 w-4" />
          Google Drive
        </Button>
        <Button
          className="md:hidden block"
          type="submit"
          disabled={isBusy}
          onClick={form.handleSubmit(onGetVideoInfo)}
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
      </div>

      {showVideoDetails && (
        <>
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
              `Get Clips in 1 Click · ${estimatedCredits} credits`
            )}
          </Button>

          <VideoInfo
            videoInfo={videoInfo}
            clipRange={clipRange}
            onClipRangeChange={setClipRange}
            subtitles={subtitles}
            onSubtitlesChange={setSubtitles}
            previewUrl={previewUrl}
          />
        </>
      )}
    </motion.div>
  );
};
