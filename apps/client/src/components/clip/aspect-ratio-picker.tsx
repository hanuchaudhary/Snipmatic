import { useRef } from "react";

import { motion, useReducedMotion } from "motion/react";

import { ASPECT_RATIOS, type AspectRatioId } from "@snipmatic/utils";

const RATIO_META: Record<
  AspectRatioId,
  { name: string; iconWidth: number; iconHeight: number }
> = {
  "16:9": { name: "Landscape", iconWidth: 24, iconHeight: 13.5 },
  "9:16": { name: "Portrait", iconWidth: 13.5, iconHeight: 24 },
  "1:1": { name: "Square", iconWidth: 18, iconHeight: 18 },
  "4:5": { name: "Social", iconWidth: 16, iconHeight: 20 },
};

function FilledRatioIcon({ ratio }: { ratio: AspectRatioId }) {
  const { iconWidth, iconHeight } = RATIO_META[ratio];

  return (
    <span className="grid size-7 shrink-0 place-items-center" aria-hidden="true">
      <span
        className="block rounded-[3px] bg-current shadow-[inset_0_0_0_1px_rgba(255,255,255,0.18)]"
        style={{ width: iconWidth, height: iconHeight }}
      />
    </span>
  );
}

export const AspectRatioPicker = ({
  value,
  onChange,
}: {
  value: AspectRatioId;
  onChange: (value: AspectRatioId) => void;
}) => {
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const reducedMotion = useReducedMotion();
  const selectedIndex = ASPECT_RATIOS.findIndex((ratio) => ratio.id === value);

  const select = (index: number, focus = false) => {
    const ratio = ASPECT_RATIOS[index];
    if (!ratio) return;
    onChange(ratio.id);
    if (focus) tabs.current[index]?.focus();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const direction =
      event.key === "ArrowRight" || event.key === "ArrowDown"
        ? 1
        : event.key === "ArrowLeft" || event.key === "ArrowUp"
          ? -1
          : 0;
    if (!direction) return;

    event.preventDefault();
    select(
      (selectedIndex + direction + ASPECT_RATIOS.length) %
      ASPECT_RATIOS.length,
      true
    );
  };

  return (
    <fieldset className="flex items-center gap-2 space-y-2.5 justify-between">
      <div className="">Aspect Ratio</div>
      <div
        className="relative grid grid-cols-2 gap-1 rounded-2xl bg-secondary/70 p-1 sm:grid-cols-4 sm:gap-0"
        role="radiogroup"
        aria-label="Clip aspect ratio"
        onKeyDown={handleKeyDown}
      >
        <motion.span
          aria-hidden="true"
          className="absolute left-1 top-1 hidden h-[calc(100%-0.5rem)] w-[calc((100%-0.5rem)/4)] rounded-xl bg-background shadow-sm ring-1 ring-foreground/6 sm:block"
          animate={{ x: `${selectedIndex * 100}%` }}
          transition={
            reducedMotion
              ? { duration: 0 }
              : { duration: 0.28, ease: [0.22, 1, 0.36, 1] }
          }
        />

        {ASPECT_RATIOS.map((ratio, index) => {
          const selected = value === ratio.id;
          return (
            <button
              key={ratio.id}
              ref={(element) => {
                tabs.current[index] = element;
              }}
              type="button"
              role="radio"
              aria-checked={selected}
              tabIndex={selected ? 0 : -1}
              onClick={() => select(index)}
              className={`relative z-10 flex cursor-pointer items-center justify-center gap-2 rounded-xl px-1.5 py-1 text-left transition-[color,background-color,transform] duration-200 active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:bg-transparent ${selected
                  ? "bg-background text-foreground ring-1 ring-foreground/6 sm:ring-0"
                  : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <FilledRatioIcon ratio={ratio.id} />
              <span className="min-w-0">
                <span className="block text-[10px] leading-none text-muted-foreground/70">
                  {ratio.label}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
};
