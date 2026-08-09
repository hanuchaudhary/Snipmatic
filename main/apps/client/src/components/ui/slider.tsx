import { Slider as SliderPrimitive } from "@base-ui/react/slider";
import { cn } from "@/lib/utils";

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props
}: SliderPrimitive.Root.Props) {
  const _values = Array.isArray(value)
    ? value
    : Array.isArray(defaultValue)
      ? defaultValue
      : [min];

  return (
    <SliderPrimitive.Root
      className={cn(
        "data-horizontal:w-full data-vertical:h-full",
        className
      )}
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      thumbAlignment="edge"
      {...props}
    >
      <SliderPrimitive.Control
        className="
          relative flex w-full touch-none items-center select-none
          data-disabled:opacity-50
          data-vertical:h-full
          data-vertical:min-h-40
          data-vertical:w-auto
          data-vertical:flex-col
        "
      >
        <SliderPrimitive.Track
          data-slot="slider-track"
          className="
            relative grow overflow-hidden rounded-[10px] select-none
            bg-[#242424]
            data-horizontal:h-10
            data-horizontal:w-full
            data-vertical:h-full
            data-vertical:w-1

            before:absolute
            before:inset-0
            before:pointer-events-none
            before:bg-[radial-gradient(circle,rgba(255,255,255,0.25)_0_3px,transparent_3px)]
            before:bg-[length:37px_100%]
            before:bg-position-[center_center]
          "
        >
          <SliderPrimitive.Indicator
            data-slot="slider-range"
            className="
              absolute
              bg-[#4a4a4a]
              opacity-55
              select-none
              before:absolute
              before:inset-0
              before:pointer-events-none
              data-horizontal:h-full
              data-vertical:w-full
            "
          />
        </SliderPrimitive.Track>

        {Array.from({ length: _values.length }, (_, index) => (
          <SliderPrimitive.Thumb
            data-slot="slider-thumb"
            key={index}
            className="
              relative z-10
              block
              h-6
              w-[5px]
              shrink-0
              rounded-[6px]
              bg-white

              cursor-grab
              select-none

              transition-[color,box-shadow,transform]

              hover:ring-0
              focus-visible:ring-0
              focus-visible:outline-hidden

              active:scale-110

              disabled:pointer-events-none
              disabled:opacity-50

              after:absolute
              after:-inset-2
            "
          />
        ))}
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  );
}

export { Slider };