import { ASPECT_RATIOS, type AspectRatioId } from "@snipmatic/utils";

import { cn } from "@/lib/utils";

export const AspectRatioPicker = ({
  value,
  onChange,
}: {
  value: AspectRatioId;
  onChange: (value: AspectRatioId) => void;
}) => {
  return (
    <div className="space-y-1">
      <div>
        <h4 className="text-sm text-muted-foreground">Aspect Ratio</h4>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {ASPECT_RATIOS.map((ratio) => {
          const isSelected = value === ratio.id;

          return (
            <button
              key={ratio.id}
              type="button"
              onClick={() => onChange(ratio.id)}
              className={cn(
                "rounded-sm bg-muted-foreground/30",
                ratio.id === "16:9" && "h-30 w-50",
                ratio.id === "9:16" && "h-full aspect-auto",
                ratio.id === "1:1" && "h-full w-full aspect-square",
                ratio.id === "4:5" && "h-full w-full",
                isSelected ? "border border-primary" : "border-border"
              )
              }
            >
              <span className="text-xs font-medium">{ratio.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
