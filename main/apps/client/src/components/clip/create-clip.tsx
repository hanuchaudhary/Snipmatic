import React from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  type PaymentModel,
  sanitizeYoutubeUrl,
  youtubeUrlSchema,
} from "@snipmatic/utils";
import { IconLoader2, IconUpload, IconX } from "@tabler/icons-react";
import { toast } from "sonner";
import z from "zod";

import { useVideoUpload } from "@/hooks/use-video-upload";
import { PaymentApi } from "@/lib/api/payment";
import { consumePendingYoutubeUrl } from "@/lib/pending-clip-url";
import { cn } from "@/lib/utils";
import { useClipStore } from "@/store/clip.store";
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
import { TooltipButton } from "../ui/tooltip-button";
import BorderBeam from "border-beam";
import { useTheme } from "../provider/theme-provider";

const formSchema = z.object({
  url: youtubeUrlSchema,
});

type FormValues = z.infer<typeof formSchema>;

export const CreateClip = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const isClipsPage = location.pathname === "/clips";
  const pageState = location.state as ClipsPageState | null;

  const { upload, progress, isUploading, abort, reset: resetUpload } =
    useVideoUpload();

  const { url, videoInfo, clipRange, clipMode, subtitles, bgMusic, aspectRatio, attachedClipId, isGettingInfo, isCreatingClip, setUrl, hydrateFromPageState, setUploadPreview, reset, fetchVideoInfo, processClip, getEstimatedCredits } = useClipStore();

  const [credits, setCredits] = React.useState<
    PaymentModel["creditsResponse"] | null
  >(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: url || pageState?.url || "",
    },
  });

  React.useEffect(() => {
    PaymentApi.getCredits()
      .then(setCredits)
      .catch(() => undefined);
  }, []);

  React.useEffect(() => {
    const pending = consumePendingYoutubeUrl();
    if (!pending) {
      return;
    }

    setUrl(pending);
    form.setValue("url", pending);
  }, [form, setUrl]);

  React.useEffect(() => {
    if (!isClipsPage || !pageState?.videoInfo) {
      return;
    }

    hydrateFromPageState(pageState);

    if (pageState.url) {
      form.setValue("url", pageState.url);
    }
  }, [form, hydrateFromPageState, isClipsPage, pageState]);

  const estimatedCredits = React.useMemo(
    () => getEstimatedCredits(),
    [
      aspectRatio,
      attachedClipId,
      bgMusic,
      clipMode,
      clipRange,
      getEstimatedCredits,
      subtitles,
      videoInfo,
    ]
  );
  const showVideoDetails = isClipsPage && Boolean(videoInfo);
  const isBusy = isGettingInfo || isUploading;

  const onGetVideoInfo = async (values: FormValues) => {
    if (isGettingInfo || isUploading) {
      return;
    }

    try {
      const sanitizedUrl = sanitizeYoutubeUrl(values.url);

      form.setValue("url", sanitizedUrl);
      setUrl(sanitizedUrl);

      await fetchVideoInfo(sanitizedUrl);

      const state = useClipStore.getState();

      if (!state.videoInfo) {
        throw new Error(
          "Unable to fetch video information. Please check the URL and try again."
        );
      }

      const nextState: ClipsPageState = {
        source: "youtube",
        url: sanitizedUrl,
        videoInfo: state.videoInfo,
        clipRange: state.clipRange,
        subtitles: state.subtitles,
        bgMusic: state.bgMusic,
        clipMode: state.clipMode,
        aspectRatio: state.aspectRatio,
        subtitleTemplateId: state.subtitleTemplateId,
        bgMusicTemplateId: state.bgMusicTemplateId,
        bgMusicIntensity: state.bgMusicIntensity,
        videoTemplateId: state.videoTemplateId,
        attachedClipId: state.attachedClipId,
      };

      navigate("/clips", { state: nextState, replace: isClipsPage });
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong while fetching the video."
      );
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
      const videoInfoPayload = {
        title: result.filename.replace(/\.[^/.]+$/, ""),
        duration: result.duration,
        thumbnail: "",
      };

      setUploadPreview({
        sourceKey: result.key,
        previewUrl: result.previewUrl,
        videoInfo: videoInfoPayload,
      });

      const state = useClipStore.getState();
      const nextState: ClipsPageState = {
        source: "upload",
        sourceKey: result.key,
        previewUrl: result.previewUrl,
        videoInfo: videoInfoPayload,
        clipRange: state.clipRange,
        subtitles: state.subtitles,
        bgMusic: state.bgMusic,
        clipMode: state.clipMode,
        aspectRatio: state.aspectRatio,
        subtitleTemplateId: state.subtitleTemplateId,
        bgMusicTemplateId: state.bgMusicTemplateId,
        bgMusicIntensity: state.bgMusicIntensity,
        videoTemplateId: state.videoTemplateId,
        attachedClipId: state.attachedClipId,
      };

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
    resetUpload();
    form.reset({ url: "" });

    if (isClipsPage) {
      navigate("/dashboard", { replace: true });
    }
  };

  const onCreateClip = async () => {
    try {
      const estimatedCredits = getEstimatedCredits();
      const userCredits = credits?.balance;

      if (estimatedCredits > userCredits!) {
        toast.error("Insufficient credits.");
        return;
      }

      await processClip();
      toast.success("Clip processing started.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to create clips. Please try again."
      );
    }
  };

  return (
    <div className={cn("min-h-[30vh] pt-16 pb-10 relative")}>
      <div
        className={cn(
          "absolute md:-bottom-55 -bottom-45 left-1/2 -translate-x-1/2 text-muted-foreground/15 md:text-[12rem] text-[10rem] mask-b-from-0 z-0 select-none pointer-events-none",
          isClipsPage && "hidden"
        )}
      >
        <p>Snipmatic</p>
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
        <form
          onSubmit={form.handleSubmit(onGetVideoInfo)}
          className="relative z-20"
        >
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
                    <BorderBeam
                      size="line"
                      colorVariant="colorful"
                      duration={3.1}
                      active={
                        isGettingInfo || isUploading || isCreatingClip
                      }
                      borderRadius={0}
                      theme={theme === "light" ? "light" : "dark"}
                      className="w-full"
                    >
                      <Input
                        {...field}
                        value={field.value}
                        onChange={(e) => {
                          field.onChange(e.target.value);
                          setUrl(e.target.value);
                        }}
                        disabled={Boolean(showVideoDetails) || isBusy}
                        placeholder="Paste a YouTube link or upload a video"
                        autoFocus
                        className="w-full border-0 rounded-none focus-visible:ring-0 focus:ring-0 focus-visible:outline-0 bg-transparent! md:text-[1.4rem]! text-lg mask-r-from-80% font-light md:pl-10! pl-6! border-b md:py-6! py-4"
                      />
                    </BorderBeam>
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
        <TooltipButton tooltipText="Upload raw video">
          <Button
            type="button"
            disabled={Boolean(showVideoDetails) || isBusy}
            variant="ghost"
            className="flex items-center md:gap-2 text-muted-foreground hover:text-primary cursor-pointer text-xs md:text-base"
            onClick={onUploadClick}
          >
            <IconUpload className="md:size-5 size-4" /> Upload
          </Button>
        </TooltipButton>
        <TooltipButton tooltipText="Comming Soon">
          <Button
            disabled
            variant="ghost"
            className="flex items-center md:gap-2 text-muted-foreground hover:text-primary cursor-pointer md:text-base text-xs"
          >
            <img
              src="/gdrive-icon.png"
              alt="Gdrive Icon"
              className="md:w-5 w-4"
            />
            Google Drive
          </Button>
        </TooltipButton>
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
          <div className="sticky top-0 z-50 -mx-6 mt-6 bg-background/95 px-6 py-3 backdrop-blur-sm">
            <Button
              type="button"
              className="w-full rounded-full py-6"
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
          </div>

          <VideoInfo />
        </>
      )}
    </div>
  );
};
