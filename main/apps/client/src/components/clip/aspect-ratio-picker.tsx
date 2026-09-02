import {
  RectangleHorizontal,
  RectangleVertical,
  Smartphone,
  Square,
} from "lucide-react";

import { ASPECT_RATIOS, type AspectRatioId } from "@snipmatic/utils";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const RATIO_ICONS: Record<AspectRatioId, typeof Square> = {
  "16:9": RectangleHorizontal,
  "9:16": Smartphone,
  "1:1": Square,
  "4:5": RectangleVertical,
};

export const AspectRatioPicker = ({
  value,
  onChange,
}: {
  value: AspectRatioId;
  onChange: (value: AspectRatioId) => void;
}) => {
  const SelectedIcon = RATIO_ICONS[value];

  return (
    <div className="space-y-1 flex justify-center">
      <h4 className="text-sm text-muted-foreground flex-1">Aspect Ratio</h4>
      <Select
        value={value}
        onValueChange={(next) => {
          if (typeof next === "string") {
            onChange(next as AspectRatioId);
          }
        }}
      >
        <SelectTrigger className="h-10 min-w-0 px-3 text-sm w-fit">
          <SelectValue>
            <span className="flex items-center gap-2">
              <SelectedIcon className="size-4" />
              {value}
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent align="start" alignItemWithTrigger={false} className="min-w-[var(--anchor-width)]">
          {ASPECT_RATIOS.map((ratio) => {
            const Icon = RATIO_ICONS[ratio.id];

            return (
              <SelectItem key={ratio.id} value={ratio.id} className="min-h-9 text-sm">
                <Icon className="size-4" />
                {ratio.label}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
};
