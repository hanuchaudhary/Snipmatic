import { IconCheckFilled } from "@tabler/icons-react";

import { Navbar } from "../landing/navbar";

interface AuthLayoutProps {
  children: React.ReactNode;
  /** Small label shown above the left panel heading. */
  eyebrow?: string;
  /** First (emphasised) line of the left panel heading. */
  title: string;
  /** Second (muted) line of the left panel heading. */
  subtitle: string;
  /** Supporting paragraph under the heading. */
  description?: string;
  /** Optional capability bullets shown at the bottom of the left panel. */
  points?: string[];
}

const DEFAULT_POINTS = [
  "Find the highlights automatically",
  "Crop for Shorts, Reels and TikTok",
  "Captions burned in, ready to post",
];

export function AuthLayout({
  children,
  eyebrow = "Snipmatic",
  title,
  subtitle,
  description,
  points = DEFAULT_POINTS,
}: AuthLayoutProps) {
  return (
    <div className="relative min-h-svh w-full">
      <Navbar />

      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-2 px-6 py-32 md:grid-cols-2 md:px-0 md:py-40">
        <div className="relative flex min-h-[26rem] flex-col justify-between border border-secondary/20 bg-secondary/20 p-10 md:p-14">
          <div>
            <span className="subheading text-[1.2rem]! text-primary!">
              {eyebrow}
            </span>
            <p className="heading mt-6">
              <span>{title}</span>
              <br />
              <span className="text-muted-foreground">{subtitle}</span>
            </p>
            {description ? (
              <p className="subheading mt-8">{description}</p>
            ) : null}
          </div>

          {points.length > 0 ? (
            <ul className="mt-12 space-y-4">
              {points.map((point) => (
                <li key={point} className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-emerald-800/30">
                    <IconCheckFilled className="size-4 text-emerald-500!" />
                  </span>
                  <span className="subheading text-[1.2rem]! text-primary!">
                    {point}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div className="relative flex flex-col justify-center border p-10 md:p-14">
          <div className="mx-auto w-full max-w-sm">{children}</div>
        </div>
      </div>
    </div>
  );
}
