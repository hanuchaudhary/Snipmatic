import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { Link2 } from "lucide-react";
import { toast } from "sonner";
import { sanitizeYoutubeUrl, youtubeUrlSchema } from "@snipmatic/utils";

import { useTheme } from "@/components/provider/theme-provider";
import { useSession } from "@/lib/auth/auth.client";
import { setPendingYoutubeUrl } from "@/lib/pending-clip-url";
import { useClipStore } from "@/store/clip.store";

import { BorderBeam } from "./border-beam-input";
import Aurora from "./aurora";

function ClipLinkBar() {
  const navigate = useNavigate();
  const { data: session } = useSession();
  const { theme } = useTheme();
  const setUrl = useClipStore((s) => s.setUrl);
  const [value, setValue] = useState("");

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parsed = youtubeUrlSchema.safeParse(value);
    if (!parsed.success) {
      toast.error(
        parsed.error.issues[0]?.message ?? "Please enter a YouTube URL"
      );
      return;
    }

    const sanitized = sanitizeYoutubeUrl(parsed.data);
    setPendingYoutubeUrl(sanitized);
    setUrl(sanitized);
    navigate(session?.user ? "/dashboard" : "/login");
  };

  return (
    <form
      onSubmit={onSubmit}
      className="pointer-events-auto relative z-20 flex items-center gap-2.5"
    >
      <BorderBeam
        size="sm"
        colorVariant="colorful"
        duration={5.1}
        borderRadius={64}
        theme={theme === "light" ? "light" : "dark"}
        className="w-full"
      >
        <div className="relative flex h-18 w-full items-center gap-2.5 overflow-hidden rounded-full bg-background/80 px-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08),inset_0_0_50px_0_rgba(255,255,255,0.02)] backdrop-blur-md dark:bg-[#1d1d1d]">
          <Link2
            className="size-7 shrink-0 -rotate-45 text-muted-foreground/50"
            aria-hidden
          />
          <input
            type="text"
            inputMode="url"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Paste a YouTube link"
            autoComplete="off"
            className="min-w-0 flex-1 bg-transparent text-[24px] leading-[18px] text-foreground outline-none placeholder:text-muted-foreground/55"
          />
        </div>
      </BorderBeam>
      <button
        type="submit"
        className="h-18 shrink-0 cursor-pointer rounded-full border border-secondary-foreground/10 bg-secondary px-6 text-lg text-secondary-foreground"
      >
        Get clips
      </button>
    </form>
  );
}

export function HeroSection() {
  const { theme } = useTheme();
  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  return (
    <div className="relative h-screen w-full bg-background">
      <div className="absolute z-0 rotate-180 inset-0 top-40 rounded-t-4xl mask-b-from-0 overflow-hidden h-full w-full">
        <Aurora lightMode={!isDark} amplitude={1.1} blend={0.55} speed={1} colorStops={["#EF4444", "#F43F5E", "#EAB308"]} />
      </div>
      <div className="pointer-events-none absolute inset-0 z-10 flex flex-col">
        <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center px-6 pt-28 text-center md:pt-42 pb-25">
          <h1 className="text-5xl leading-none text-foreground">
            Paste a YouTube link.
            <br className="hidden sm:block" /> Get clips you can post today.
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-[1.05rem]">
            Snipmatic finds the highlights, crops them for TikTok, Reels, and
            Shorts, and burns in captions. No editor. No timeline.
          </p>
          <div className="mt-8 w-full">
            <ClipLinkBar />
          </div>
        </div>

        <div className="pointer-events-none flex items-end justify-center gap-3 px-4 pb-6 md:gap-5 md:pb-8">
          <div className="aspect-video w-[min(72vw,48rem)] overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
            <video
              src="/video/landscape.mp4"
              className="size-full object-cover"
              muted
              loop
              autoPlay
              playsInline
              preload="auto"
            />
          </div>
          <div className="aspect-[9/16] h-[min(48vh,32rem)] overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
            <video
              src="/video/potrait.mp4"
              className="size-full object-cover"
              muted
              loop
              autoPlay
              playsInline
              preload="auto"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
