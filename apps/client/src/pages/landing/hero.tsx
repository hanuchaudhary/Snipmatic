import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { Link2 } from "lucide-react";
import { toast } from "sonner";
import { sanitizeYoutubeUrl, youtubeUrlSchema } from "@snipmatic/utils";

import { useTheme } from "@/components/provider/theme-provider";
import { useSession } from "@/lib/auth/auth.client";
import { setPendingYoutubeUrl } from "@/lib/pending-clip-url";
import { useClipStore } from "@/store/clip.store";

import { BorderBeam } from "../../components/landing/border-beam-input";
import { FerrisWheel } from "../../components/landing/ferris-wheel";
import { Button } from "@/components/ui/button";

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
            className="min-w-0 flex-1 bg-transparent text-[20px] leading-[18px] text-foreground outline-none placeholder:text-muted-foreground/55"
          />
        </div>
      </BorderBeam>
      <Button
        type="submit"
        className="h-15 shrink-0 cursor-pointer rounded-full border border-secondary-foreground/10 bg-primary text-primary-foreground px-6 text-lg absolute right-2"
      >
        Get clips
      </Button>
    </form>
  );
}

export function HeroSection() {
  return (
    <main className="relative overflow-hidden">
      <div className="relative flex min-h-svh w-full items-center px-6 md:px-20">
        <div className="relative z-10 w-full max-w-xl">
          <h1 className="text-[clamp(1.5rem,2.5vw,2.25rem)] leading-tight tracking-tight text-balance">
            Paste a YouTube link.
            <br /> <span className="text-muted-foreground">

              Get clips you can post today.
            </span>
          </h1>
          <p className="mt-8 text-muted-foreground text-base text-pretty max-w-2xl">
            Snipmatic finds the highlights, crops them for TikTok, Reels, and
            Shorts, and burns in captions. No editor. No timeline.
          </p>
          <div className="mt-8 w-full max-w-3xl">
            <ClipLinkBar />
          </div>
        </div>
        <FerrisWheel />
      </div>
    </main>
  );
}
