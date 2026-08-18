import React from "react";
import { AnimatePresence, motion } from "motion/react";

import {
  BGM_RECOMMENDED_INTENSITY,
  type ClipTemplate,
} from "@snipmatic/utils";
import { cn } from "@/lib/utils";

import { RangeSlider } from "../ui/custom-slider";
import { IconPlayerPauseFilled, IconPlayerPlayFilled } from "@tabler/icons-react";

type AudioPreviewProps = {
  template: ClipTemplate;
  isActive: boolean;
  isPlaying: boolean;
  intensity: number;
  onSelect: () => void;
  onPlayToggle: () => void;
  onIntensityChange: (value: number) => void;
};

export function AudioPreview({
  template,
  isActive,
  isPlaying,
  intensity,
  onSelect,
  onPlayToggle,
  className,
  onIntensityChange,
}: AudioPreviewProps & React.ComponentProps<"div">) {
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  React.useEffect(() => {
    const audio = new Audio(template.previewUrl);
    audioRef.current = audio;

    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, [template.previewUrl]);

  React.useEffect(() => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    audio.volume = Math.min(1, Math.max(0, intensity / 100));
  }, [intensity]);

  React.useEffect(() => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    if (isPlaying && isActive) {
      audio.play().catch(() => undefined);
      return;
    }

    audio.pause();
  }, [isActive, isPlaying]);

  return (
    <div className="space-y-2">
      <div
        className={cn(
          "rounded-full border p-2 transition-colors flex gap-2",
          isActive ? "border-red-400 bg-muted/40" : "border-border",
          className
        )}
      >
        <motion.div
          className="flex cursor-pointer items-center justify-center rounded-full border p-2"
          layout
          transition={{ layout: { duration: 0.4 } }}
          onClick={(event) => {
            event.stopPropagation();
            onSelect();
            onPlayToggle();
          }}
        >
          <div className="flex h-6 w-6 items-center justify-center">
            {isPlaying && isActive ? (
              <motion.div className="flex size-6 items-center justify-center rounded-full bg-primary">
                <IconPlayerPauseFilled className="size-3 text-primary-foreground" />
              </motion.div>
            ) : (
              <IconPlayerPlayFilled className="size-4" />
            )}
          </div>

          <AnimatePresence mode="wait">
            {isPlaying && isActive && (
              <motion.div
                initial={{ opacity: 0, width: 0, marginLeft: 0 }}
                animate={{ opacity: 1, width: "auto", marginLeft: 8 }}
                exit={{ opacity: 0, width: 0, marginLeft: 0 }}
                transition={{ duration: 0.4 }}
                className="flex items-center justify-center gap-0.5 overflow-hidden"
              >
                {[...Array(30)].map((_, index) => (
                  <motion.div
                    key={index}
                    className="w-0.5 rounded-full bg-primary"
                    initial={{ height: 2 }}
                    animate={{
                      height: [2, 3 + Math.random() * 10, 3 + Math.random() * 5, 2],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Number.POSITIVE_INFINITY,
                      delay: index * 0.05,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        <div className="flex items-center justify-between gap-3 w-full">
          <button
            type="button"
            onClick={onSelect}
            className="min-w-0 flex-1 text-left"
          >
            <p className="text-sm font-medium">{template.name}</p>
            {template.description && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                {template.description}
              </p>
            )}
          </button>
        </div>
      </div>

      {isActive && (
        <div className="space-y-2 px-1 pb-1">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">Intensity</span>
              <p className="text-xs text-primary">
                (Recommended {BGM_RECOMMENDED_INTENSITY}%)
              </p>
            </div>
            <span className="font-medium">{intensity}%</span>
          </div>
          <RangeSlider
            min={0}
            max={100}
            step={1}
            showTicks={false}
            value={intensity}
            aria-label="Background music intensity"
            onValueChange={onIntensityChange}
          />
        </div>
      )}
    </div>
  );
};
