import { motion } from "motion/react";

import { type ClipMode } from "@snipmatic/utils";
import { cn } from "@/lib/utils";

const clipModeOptions = [
  { key: "AI" as const, label: "AI Clipping" },
  { key: "MANUAL" as const, label: "Manual" },
];

export const ClipModeSwitch = ({
  clipMode,
  onClipModeChange,
}: {
  clipMode: ClipMode;
  onClipModeChange: (value: ClipMode) => void;
}) => {
  return (
    <div className="relative flex h-10 rounded-full bg-secondary p-1 ring-1 ring-border md:h-11 w-fit">
      {clipModeOptions.map(({ key, label }) => {
        const isActive = clipMode === key;

        return (
          <button
            type="button"
            key={key}
            onClick={() => onClipModeChange(key)}
            className="relative flex-1 rounded-full"
          >
            {isActive && (
              <motion.div
                layoutId="activeClipMode"
                className="absolute inset-0 rounded-full bg-primary dark:shadow-[inset_0_0_5px_rgba(0,0,0,.5)] shadow-[inset_0_0_5px_rgba(255,255,255,1)]"
                transition={{ type: "spring", duration: 0.5 }}
              />
            )}
            <span
              className={cn(
                "relative block px-4 py-1.5 text-xs md:text-sm text-nowrap",
                isActive ? "text-primary-foreground" : "text-muted-foreground"
              )}
            >
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
};
