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
import { Button } from "@/components/ui/button";
const FEATURED_VIDEOS = [
  {
    id: "1",
    title: "The billing stack for intelligence era",
    url: "https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExZjBuMG0xZGw2bTZkYWkybjl3M3g0bnRlN3poNm9mZjRwNnlwcGI4OCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/xUA7aZDG3JgiJV5oKQ/giphy.gif",
  },

  {
    id: "2",
    title: "The billing stack for intelligence era",
    url: "https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHpjaWlyZHl1NjJ1Y2NicjFldXZkeWZ3bHRkNDJpYjVqZXBxbmIybCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/PhnJmUaxgZJWKLGZmW/giphy.gif"
  },

  {
    id: "3",
    title: "The billing stack for intelligence era",
    url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMjJkeWppNjZldHEyNjl4OXh6b3R5cmdwNmx0enB3YjBndDh1aHRwcCZlcD12MV9naWZzX3JlbGF0ZWQmY3Q9Zw/26vIdt7XgRFb9rejm/giphy.gif"
  },
  {
    id: "3",
    title: "The billing stack for intelligence era",
    url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdHE5dG44OHNzdGRxY2Vvb2lta2FoZ3l6YmgyanoyMnNpaGZycWwxbSZlcD12MV9naWZzX3JlbGF0ZWQmY3Q9Zw/451shsqh5nJ9UqDElR/giphy.gif"
  },
  {
    id: "3",
    title: "The billing stack for intelligence era",
    url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdHE5dG44OHNzdGRxY2Vvb2lta2FoZ3l6YmgyanoyMnNpaGZycWwxbSZlcD12MV9naWZzX3JlbGF0ZWQmY3Q9Zw/4aCi2Ov0wtYpG/giphy.gif"
  },
];

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
            className="min-w-0 flex-1 bg-transparent subheading text-foreground outline-none placeholder:text-muted-foreground/55"
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
      <div className="relative flex min-h-[calc(100vh-16rem)] w-full items-center px-6 md:p-0 max-w-7xl mx-auto">
        <div className="relative z-10 w-full max-w-xl">
          <h1 className="heading">
            Paste a YouTube link.
            <br /> <span className="text-muted-foreground">
              Get clips you can post today.
            </span>
          </h1>
          <p className="mt-8 subheading">
            Snipmatic finds the highlights, crops them for TikTok, Reels, and
            Shorts, and burns in captions. No editor. No timeline.
          </p>
          <div className="mt-8 w-full max-w-3xl">
            <ClipLinkBar />
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-hidden relative py-10">
        <div
          className="absolute h-3 top-0 left-0 w-full"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, transparent 0, transparent 26px, #555 26px, #555 27px)",
            backgroundPosition: "61px 0",
            backgroundSize: "27.5px 100%",
          }}
        />
        <div
          className="absolute h-3 bottom-0 left-0 w-full"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, transparent 0, transparent 26px, #555 26px, #555 27px)",
            backgroundPosition: "61px 0",
            backgroundSize: "27.5px 100%",
          }}
        />
        {
          FEATURED_VIDEOS.map((video) => (
            <div key={video.id} className="h-130 aspect-9/16 border">
              <img src={video.url} alt={video.title} width={100} height={100} className="w-full h-full object-cover" />
            </div>
          ))
        }
      </div>
    </main >
  );
}
