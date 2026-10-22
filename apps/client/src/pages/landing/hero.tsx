import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router";

import { sanitizeYoutubeUrl, youtubeUrlSchema } from "@snipmatic/utils";
import { Link2 } from "lucide-react";
import { toast } from "sonner";

import { useTheme } from "@/components/provider/theme-provider";
import { Button } from "@/components/ui/button";
import { VideoToShortsMarquee } from "@/components/landing/video-to-shorts-marquee";
import { useSession } from "@/lib/auth/auth.client";
import { setPendingYoutubeUrl } from "@/lib/pending-clip-url";
import { useClipStore } from "@/store/clip.store";

import { BorderBeam } from "../../components/landing/border-beam-input";
import GradientASCII from "@/components/landing/gradient-ascii";

const ASCII_COLORS_LIGHT = ["#5e6d9d", "#94a3b8", "#4182a9"];
const ASCII_COLORS_DARK = ["#2446a8", "#98a7ce", "#38bdf8"];

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
        <div className="relative flex md:h-18 h-12 w-full items-center gap-2.5 overflow-hidden rounded-full bg-background/80 md:px-6 px-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08),inset_0_0_50px_0_rgba(255,255,255,0.02)] backdrop-blur-md dark:bg-[#1d1d1d]">
          <Link2
            className="md:size-7 size-5 shrink-0 -rotate-45 text-muted-foreground/50"
            aria-hidden
          />
          <input
            type="text"
            inputMode="url"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Paste a YouTube video URL"
            aria-label="YouTube video link"
            autoComplete="off"
            className="min-w-0 flex-1 bg-transparent md:subheading text-[1rem]! text-foreground outline-none placeholder:text-muted-foreground/55"
          />
        </div>
      </BorderBeam>
      <Button
        type="submit"
        className="md:h-15 h-10 shrink-0 cursor-pointer rounded-full border border-secondary-foreground/10 bg-primary text-primary-foreground md:px-6 px-4 md:text-lg absolute right-1"
      >
        Make my clips
      </Button>
    </form>
  );
}

export function HeroSection() {
  const { theme } = useTheme();
  return (
    <main className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[65vh] md:h-[95vh]" aria-hidden="true">
        <GradientASCII
          className="h-full w-full opacity-70 mask-[linear-gradient(to_right,transparent,black_85%)]"
          colors={theme === "light" ? ASCII_COLORS_LIGHT : ASCII_COLORS_DARK}
          shape="pinch"
          characters=" =+xX0S8#@"
          cellSize={18}
          density={0.8}
          glyphOpacity={0.85}
          glow={0.2}
          depthOfField={0}
          flicker={0.2}
          softness={0.5}
          scale={1}
          flow={0.5}
          speed={1}
          gradientOpacity={0.9}
          grain={0.08}
          variation={0}
          mouseInteraction
          scrambleRadius={0.1}
          clickEffect="wave"
          intro
          lightMode={theme === "light"}
        />
      </div>
      <div className="relative flex min-h-[65vh] w-full items-center px-6 py-24 md:min-h-[75vh] md:p-0 max-w-7xl mx-auto">
        <div className="relative z-10 w-full max-w-xl">
          <h1 className="heading">
            One long video.
            <br />{" "}
            <span className="text-muted-foreground">
              A feed full of standout clips.
            </span>
          </h1>
          <p className="mt-8 subheading">
            Drop in a YouTube link. Snipmatic finds the strongest moments,
            reframes them, adds timed captions, and prepares every clip to post.
          </p>
          <div className="mt-8 w-full max-w-3xl">
            <ClipLinkBar />
          </div>
        </div>
      </div>
      <VideoToShortsMarquee />
    </main>
  );
}
