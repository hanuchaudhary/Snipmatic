const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export function CreditUsageBars({
  value,
  bars = 36,
}: {
  value: number;
  bars?: number;
}) {
  const count = Math.round(clamp(bars, 12, 64));
  const percentage = Math.round(clamp(value, 0, 100));
  const lit = Math.round((percentage / 100) * count);

  return (
    <div
      className="wks"
      role="progressbar"
      aria-label="Credits used"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percentage}
    >
      <div className="wks-track" aria-hidden="true">
        {Array.from({ length: count }, (_, index) => (
          <span
            key={index}
            className="wks-bar"
            data-on={index < lit || undefined}
          />
        ))}
      </div>
      <span className="wks-value">{percentage}%</span>
    </div>
  );
}
