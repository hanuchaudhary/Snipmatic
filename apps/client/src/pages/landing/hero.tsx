import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router";

import { sanitizeYoutubeUrl, youtubeUrlSchema } from "@snipmatic/utils";
import { Link2 } from "lucide-react";
import { toast } from "sonner";

import { useTheme } from "@/components/provider/theme-provider";
import { Button } from "@/components/ui/button";
import MarqueeAlongSvgPath from "@/components/ui/marquee-along-svg-path";
import { useSession } from "@/lib/auth/auth.client";
import { setPendingYoutubeUrl } from "@/lib/pending-clip-url";
import { useClipStore } from "@/store/clip.store";

import { BorderBeam } from "../../components/landing/border-beam-input";

const MARQUEE_PATH =
  "M1 209.434C58.5872 255.935 387.926 325.938 482.583 209.434C600.905 63.8051 525.516 -43.2211 427.332 19.9613C329.149 83.1436 352.902 242.723 515.041 267.302C644.752 286.966 943.56 181.94 995 156.5";

const MARQUEE_IMAGES = [
  {
    src: "https://cdn.cosmos.so/b9909337-7a53-48bc-9672-33fbd0f040a1?format=jpeg",
    link: "https://www.instagram.com/p/DCOl6YTS85e/?igsh=MXNvdHhyczl1djJ6ZA%3D%3D",
  },
  {
    src: "https://cdn.cosmos.so/ecdc9dd7-2862-4c28-abb1-dcc0947390f3?format=jpeg",
    link: "https://www.instagram.com/p/C4RTJvVpP4R/?igsh=MWZwOTNlYTVodGszMw%3D%3D",
  },
  {
    src: "https://cdn.cosmos.so/79de41ec-baa4-4ac0-a9a4-c090005ca640?format=jpeg",
    link: "https://pangrampangram.com/products/mori",
  },
  {
    src: "https://cdn.cosmos.so/1a18b312-21cd-4484-bce5-9fb7ed1c5e01?format=jpeg",
    link: "https://www.sergidelgado.com/selected-work/ampersand",
  },
  {
    src: "https://cdn.cosmos.so/d765f64f-7a66-462f-8b2d-3d7bc8d7db55?format=jpeg",
    link: "https://www.instagram.com/p/C40XmANsoe_/?igsh=MXFlZGx4cmw3ZW1qYw%3D%3D",
  },
  {
    src: "https://cdn.cosmos.so/6b9f08ea-f0c5-471f-a620-71221ff1fb65?format=jpeg",
    link: "https://abduzeedo.com/super-stylish-type-explorations",
  },
  {
    src: "https://cdn.cosmos.so/40a09525-4b00-4666-86f0-3c45f5d77605?format=jpeg",
    link: "https://www.instagram.com/p/CrhdrGjr9yK/?igshid=MTc4MmM1YmI2Ng%3D%3D",
  },
  {
    src: "https://cdn.cosmos.so/14f05ab6-b4d0-4605-9007-8a2190a249d0?format=jpeg",
    link: "https://www.instagram.com/julian.stiber/p/By5RBApiDzE/?img_index=1",
  },
  {
    src: "https://cdn.cosmos.so/d05009a2-a2f8-4a4c-a0de-e1b0379dddb8?format=jpeg",
    link: "https://www.instagram.com/p/CeT3COysRNN/?img_index=2",
  },
  {
    src: "https://cdn.cosmos.so/ba646e35-efc2-494a-961b-b40f597e6fc9?format=jpeg",
    link: "https://www.instagram.com/godfreydadich/",
  },
  {
    src: "https://cdn.cosmos.so/e899f9c3-ed48-4899-8c16-fbd5a60705da?format=jpeg",
    link: "https://www.instagram.com/p/Bty1U6BhTOW/?img_index=5",
  },
  {
    src: "https://cdn.cosmos.so/24e83c11-c607-45cd-88fb-5059960b56a0?format=jpeg",
    link: "https://www.instagram.com/p/C48dxn1LqhC/?igsh=dmV5ZWR0Z2Y3Zzlt&img_index=3",
  },
  {
    src: "https://cdn.cosmos.so/cd346bce-f415-4ea7-8060-99c5f7c1741a?format=jpeg",
    link: "https://www.instagram.com/p/C08ZDVyyRhK/?img_index=2&igsh=bHAyZjcxYW1jZDNu",
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
            placeholder="Paste a YouTube link"
            autoComplete="off"
            className="min-w-0 flex-1 bg-transparent md:subheading text-[1rem]! text-foreground outline-none placeholder:text-muted-foreground/55"
          />
        </div>
      </BorderBeam>
      <Button
        type="submit"
        className="md:h-15 h-10 shrink-0 cursor-pointer rounded-full border border-secondary-foreground/10 bg-primary text-primary-foreground md:px-6 px-4 md:text-lg absolute right-1"
      >
        Get clips
      </Button>
    </form>
  );
}

export function HeroSection() {
  return (
    <main className="relative overflow-hidden">
      <div className="relative flex min-h-screen w-full items-center px-6 md:p-0 max-w-7xl mx-auto">
        <div className="relative z-10 w-full max-w-xl">
          <h1 className="heading">
            Paste a YouTube link.
            <br />{" "}
            <span className="text-muted-foreground">
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
      <div className="max-w-7xl mx-auto py-10 absolute -bottom-30 left-90">
        <div className="h-[70vh] min-h-100 w-full">
          <MarqueeAlongSvgPath
            path={MARQUEE_PATH}
            viewBox="0 0 996 330"
            baseVelocity={8}
            slowdownOnHover
            draggable
            repeat={2}
            dragSensitivity={0.1}
            className="w-full h-full scale-160"
            responsive
            grabCursor
          >
            {MARQUEE_IMAGES.map((img, i) => (
              <div
                key={i}
                className="w-14 h-full hover:scale-150 duration-300 ease-in-out"
              >
                <img
                  src={img.src}
                  alt={`Example ${i}`}
                  className="w-full h-full object-cover"
                  draggable={false}
                />
              </div>
            ))}
          </MarqueeAlongSvgPath>
        </div>
      </div>
    </main>
  );
}
