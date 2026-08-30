import { useLayoutEffect, useRef, useState } from "react";
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [pill, setPill] = useState({ x: 0, width: 0 });

  useLayoutEffect(() => {
    const container = containerRef.current;
    const active = container?.querySelector<HTMLElement>(
      `[data-clip-mode="${clipMode}"]`
    );

    if (!container || !active) {
      return;
    }

    setPill({
      x: active.offsetLeft,
      width: active.offsetWidth,
    });
  }, [clipMode]);

  return (
    <div
      ref={containerRef}
      className="relative flex h-10 w-fit rounded-full bg-secondary p-1 ring-1 ring-border md:h-11"
    >
      {pill.width > 0 && (
        <motion.div
          aria-hidden
          className="absolute top-1 bottom-1 left-0 rounded-full bg-primary shadow-[inset_0_0_5px_rgba(255,255,255,1)] dark:shadow-[inset_0_0_5px_rgba(0,0,0,.5)]"
          initial={false}
          animate={{ x: pill.x, width: pill.width }}
          transition={{ type: "spring", bounce: 0.15, duration: 0.45 }}
        />
      )}
      {clipModeOptions.map(({ key, label }) => {
        const isActive = clipMode === key;

        return (
          <button
            type="button"
            key={key}
            data-clip-mode={key}
            onClick={() => onClipModeChange(key)}
            className="relative z-10 flex-1 rounded-full"
          >
            <span
              className={cn(
                "relative block px-4 py-1.5 text-xs text-nowrap md:text-sm",
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
