import { useEffect, useRef } from "react";

type GradientASCIIProps = {
  colors?: string[];
  characters?: string;
  cellSize?: number;
  speed?: number;
  lightMode?: boolean;
  className?: string;
};

export default function GradientASCII({
  colors = ["#1e3fd8", "#a5d8ff", "#38bdf8"],
  characters = " =+xX0S8#@",
  cellSize = 18,
  speed = 1,
  lightMode = false,
  className = "",
}: GradientASCIIProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !wrapper || !context) return;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    let width = 1;
    let height = 1;
    let frame = 0;
    let visible = true;
    let animation = 0;
    const pointer = { x: -999, y: -999, strength: 0 };
    const palette = colors.length ? colors : ["#38bdf8"];
    const glyphs = characters || " =+xX0S8#@";

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, wrapper.clientWidth);
      height = Math.max(1, wrapper.clientHeight);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      draw();
    };

    const draw = () => {
      context.clearRect(0, 0, width, height);
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.font = `${Math.max(9, cellSize * 0.72)}px ui-monospace, SFMono-Regular, monospace`;
      const time = reducedMotion ? 0 : frame * 0.013 * speed;
      const columns = Math.ceil(width / cellSize);
      const rows = Math.ceil(height / cellSize);
      for (let row = 0; row < rows; row++) {
        for (let column = 0; column < columns; column++) {
          const x = column * cellSize + cellSize / 2;
          const y = row * cellSize + cellSize / 2;
          const nx = x / width - 0.5;
          const ny = y / height - 0.52;
          const horizon =
            Math.sin(nx * 4 + time * 0.45) * 0.08 +
            Math.sin(nx * 9 - time * 0.2) * 0.025;
          const glow =
            Math.exp(-Math.pow((ny - horizon) * 3.2, 2)) *
            (1 - Math.abs(nx) * 0.55);
          const distance = Math.hypot(x - pointer.x, y - pointer.y);
          const interaction =
            Math.max(0, 1 - distance / 130) * pointer.strength;
          const noise = (Math.sin(column * 43.19 + row * 91.7) + 1) / 2;
          const intensity = Math.min(
            1,
            Math.max(0, glow * 0.82 + interaction * 0.65 + noise * 0.12 - 0.08)
          );
          if (intensity < 0.14 || noise > intensity + 0.22) continue;
          const glyph =
            glyphs[
              Math.min(glyphs.length - 1, Math.floor(intensity * glyphs.length))
            ];
          context.globalAlpha = Math.min(
            0.52,
            intensity * (lightMode ? 0.42 : 0.57)
          );
          context.fillStyle =
            palette[
              Math.min(
                palette.length - 1,
                Math.floor(intensity * palette.length)
              )
            ];
          context.fillText(glyph, x, y);
        }
      }
      context.globalAlpha = 1;
    };

    const tick = () => {
      if (visible && !document.hidden) {
        frame++;
        pointer.strength *= 0.96;
        draw();
      }
      animation = requestAnimationFrame(tick);
    };
    const move = (event: PointerEvent) => {
      const bounds = wrapper.getBoundingClientRect();
      pointer.x = event.clientX - bounds.left;
      pointer.y = event.clientY - bounds.top;
      pointer.strength =
        pointer.x >= 0 &&
        pointer.x <= bounds.width &&
        pointer.y >= 0 &&
        pointer.y <= bounds.height
          ? 1
          : 0;
      if (reducedMotion) draw();
    };
    const click = (event: PointerEvent) => {
      move(event);
      if (pointer.strength > 0) pointer.strength = 2;
    };
    const observer = new ResizeObserver(resize);
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    observer.observe(wrapper);
    intersection.observe(wrapper);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", click, { passive: true });
    resize();
    if (!reducedMotion) animation = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(animation);
      observer.disconnect();
      intersection.disconnect();
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", click);
    };
  }, [colors, characters, cellSize, speed, lightMode]);

  return (
    <div
      ref={wrapperRef}
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}
