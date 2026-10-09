import { Slider } from "../ui/slider";

const formatDuration = (seconds: number) => {
  const totalSeconds = Math.max(0, Math.floor(seconds));

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const remainingSeconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  }

  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

export const DurationController = ({
  duration,
  clipRange,
  onClipRangeChange,
}: {
  duration: number;
  clipRange: [number, number];
  onClipRangeChange: (value: [number, number]) => void;
}) => {
  const clipDuration = clipRange[1] - clipRange[0];

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <h4 className="text-sm text-muted-foreground">Processing Timeframe</h4>
        <div className="rounded-md bg-muted px-3 py-1.5 text-sm font-medium">
          {formatDuration(clipDuration)}
        </div>
      </div>

      <Slider
        min={0}
        max={Math.max(1, Math.floor(duration))}
        step={1}
        value={clipRange}
        onValueChange={(value) => {
          if (Array.isArray(value) && value.length === 2) {
            onClipRangeChange(value as [number, number]);
          }
        }}
        minStepsBetweenValues={2}
      />

      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{formatDuration(clipRange[0])}</span>
        <span>{formatDuration(clipRange[1])}</span>
      </div>
    </div>
  );
};
