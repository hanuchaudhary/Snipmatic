import { useLayoutEffect, useRef, useState } from "react";

import {
  motion,
  type SpringOptions,
  useAnimationFrame,
  useMotionValue,
  useSpring,
} from "motion/react";

import { cn } from "@/lib/utils";

import MarqueeAlongSvgPath, {
  type MarqueeAlongSvgPathProps,
} from "./marquee-along-svg-path";

const wrap = (min: number, max: number, value: number): number => {
  const range = max - min;
  return ((((value - min) % range) + range) % range) + min;
};

export interface MarqueeBaseProps {
  children: React.ReactNode;
  className?: string;

  // Marquee properties
  baseVelocity?: number;
  direction?: "normal" | "reverse";
  slowdownOnHover?: boolean;
  slowDownFactor?: number;
  slowDownSpringConfig?: SpringOptions;

  // Item repetition
  repeat?: number;

  // Drag properties
  draggable?: boolean;
  grabCursor?: boolean;
}

export interface LinearMarqueeProps extends MarqueeBaseProps {
  variant: "linear";

  /** Extra spacing between items, in pixels. */
  gap?: number;
  /** Pause on hover instead of slowing down. */
  pauseOnHover?: boolean;
  /** How quickly a drag slows back down (0 - 1). */
  dragVelocityDecay?: number;
}

export type CurveMarqueeProps = MarqueeAlongSvgPathProps & { variant: "curve" };

export type MarqueeProps = CurveMarqueeProps | LinearMarqueeProps;

/**
 * Linear marquee — items travel straight along the horizontal axis.
 */
const MarqueeLinear = ({
  children,
  className,

  // Marquee defaults
  baseVelocity = 60,
  direction = "normal",
  slowdownOnHover = false,
  pauseOnHover = false,
  slowDownFactor = 0.3,
  slowDownSpringConfig = { damping: 50, stiffness: 400 },

  // Items repetition
  repeat = 3,

  // Drag defaults
  draggable = false,
  grabCursor = false,
  dragVelocityDecay = 0.96,

  // Layout
  gap = 0,
}: LinearMarqueeProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const unitRef = useRef<HTMLDivElement>(null);

  const [unitWidth, setUnitWidth] = useState(0);
  const [copies, setCopies] = useState(Math.max(2, repeat));

  const x = useMotionValue(0);

  // Hover and drag state tracking
  const isHovered = useRef(false);
  const isDragging = useRef(false);
  const dragVelocity = useRef(0);

  // Normal moves the track left (content scrolls left), reverse moves it right.
  const directionFactor = useRef(direction === "normal" ? -1 : 1);

  const hoverFactorValue = useMotionValue(1);
  const smoothHoverFactor = useSpring(hoverFactorValue, slowDownSpringConfig);

  // Measure one repetition so we can loop seamlessly and fill the viewport.
  useLayoutEffect(() => {
    const container = containerRef.current;
    const unit = unitRef.current;
    if (!container || !unit) return;

    const read = () => {
      const width = unit.scrollWidth + gap;
      setUnitWidth(width);
      if (width > 0) {
        setCopies(
          Math.max(repeat, Math.ceil((container.clientWidth + gap) / width) + 1)
        );
      }
    };

    read();
    const ro = new ResizeObserver(read);
    ro.observe(container);
    ro.observe(unit);
    return () => ro.disconnect();
  }, [gap, repeat]);

  useLayoutEffect(() => {
    x.set(direction === "normal" ? 0 : -unitWidth);
  }, [direction, unitWidth, x]);

  useAnimationFrame((_, delta) => {
    // Dragging takes over the position entirely.
    if (isDragging.current && draggable) {
      x.set(wrap(-unitWidth, 0, x.get() + dragVelocity.current));

      dragVelocity.current *= 0.9;
      if (Math.abs(dragVelocity.current) < 0.01) {
        dragVelocity.current = 0;
      }
      return;
    }

    if (unitWidth === 0) return;

    // Update hover factor
    if (isHovered.current) {
      hoverFactorValue.set(
        pauseOnHover ? 0 : slowdownOnHover ? slowDownFactor : 1
      );
    } else {
      hoverFactorValue.set(1);
    }

    let moveBy =
      directionFactor.current *
      baseVelocity *
      (delta / 1000) *
      smoothHoverFactor.get();

    if (draggable) {
      moveBy += dragVelocity.current;

      if (!isDragging.current && Math.abs(dragVelocity.current) > 0.01) {
        dragVelocity.current *= dragVelocityDecay;
      } else if (!isDragging.current) {
        dragVelocity.current = 0;
      }
    }

    x.set(wrap(-unitWidth, 0, x.get() + moveBy));
  });

  const lastPointerX = useRef(0);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!draggable) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);

    if (grabCursor) {
      (e.currentTarget as HTMLElement).style.cursor = "grabbing";
    }

    isDragging.current = true;
    lastPointerX.current = e.clientX;
    dragVelocity.current = 0;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggable || !isDragging.current) return;

    const deltaX = e.clientX - lastPointerX.current;
    lastPointerX.current = e.clientX;
    dragVelocity.current = deltaX * 0.8;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!draggable) return;
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    isDragging.current = false;

    if (grabCursor) {
      (e.currentTarget as HTMLElement).style.cursor = "grab";
    }
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onMouseEnter={() => (isHovered.current = true)}
      onMouseLeave={() => (isHovered.current = false)}
      className={cn(
        "relative w-full overflow-hidden",
        draggable && grabCursor && "cursor-grab",
        className
      )}
    >
      <motion.div className="flex w-max" style={{ x, gap }}>
        {Array.from({ length: copies }).map((_, index) => (
          <div
            key={index}
            ref={index === 0 ? unitRef : undefined}
            aria-hidden={index > 0}
            className="flex shrink-0"
            style={{ gap }}
          >
            {children}
          </div>
        ))}
      </motion.div>
    </div>
  );
};

/**
 * Marquee with two variants:
 * - `curve`: items travel along an SVG path (see `MarqueeAlongSvgPath`).
 * - `linear`: items travel straight along the horizontal axis.
 *
 * @example
 * <Marquee variant="curve" path={path} viewBox="0 0 996 330" responsive>
 *   ...
 * </Marquee>
 *
 * <Marquee variant="linear" baseVelocity={60} slowdownOnHover>
 *   ...
 * </Marquee>
 */
export function Marquee(props: MarqueeProps) {
  if (props.variant === "curve") {
    return <MarqueeAlongSvgPath {...props} />;
  }

  return <MarqueeLinear {...props} />;
}

export { MarqueeAlongSvgPath, MarqueeLinear };
export default Marquee;
