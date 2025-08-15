"use client";

import React, { useEffect, useRef, useCallback } from "react";

interface RgbColor {
  r: number;
  g: number;
  b: number;
}

interface DynamicArrowProps {
  targetRef: React.RefObject<HTMLElement | null>;
  className?: string;
}

const parseRgbColor = (colorString: string): RgbColor | null => {
  if (!colorString) return null;
  const match = colorString.match(
    /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/
  );
  if (match) {
    return {
      r: parseInt(match[1], 10),
      g: parseInt(match[2], 10),
      b: parseInt(match[3], 10),
    };
  }
  return null;
};

export const DynamicArrow: React.FC<DynamicArrowProps> = ({
  targetRef,
  className = "",
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mousePosRef = useRef<{ x: number | null; y: number | null }>({
    x: null,
    y: null,
  });
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);

  const resolvedCanvasColorsRef = useRef<{
    strokeStyle: RgbColor;
  }>({
    strokeStyle: { r: 128, g: 128, b: 128 }, // Default mid-gray
  });

  useEffect(() => {
    const tempElement = document.createElement("div");
    tempElement.style.display = "none";
    document.body.appendChild(tempElement);

    const updateResolvedColors = () => {
      tempElement.style.color = "var(--foreground)";
      const computedFgColor = getComputedStyle(tempElement).color;
      const parsedFgColor = parseRgbColor(computedFgColor);
      if (parsedFgColor) {
        resolvedCanvasColorsRef.current.strokeStyle = parsedFgColor;
      } else {
        console.warn(
          "DynamicArrow: Could not parse --foreground for canvas arrow. Using fallback."
        );
        const isDarkMode = document.documentElement.classList.contains("dark");
        resolvedCanvasColorsRef.current.strokeStyle = isDarkMode
          ? { r: 250, g: 250, b: 250 }
          : { r: 10, g: 10, b: 10 }; // Brighter fallback
      }
    };
    updateResolvedColors();
    const observer = new MutationObserver((mutationsList) => {
      for (const mutation of mutationsList) {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "class" &&
          mutation.target === document.documentElement
        ) {
          updateResolvedColors();
          break;
        }
      }
    });
    observer.observe(document.documentElement, { attributes: true });
    return () => {
      observer.disconnect();
      if (tempElement.parentNode) {
        tempElement.parentNode.removeChild(tempElement);
      }
    };
  }, []);

  const drawArrow = useCallback(() => {
    if (!canvasRef.current || !targetRef.current || !ctxRef.current) return;

    const targetEl = targetRef.current;
    const ctx = ctxRef.current;
    const mouse = mousePosRef.current;

    const x0 = mouse.x;
    const y0 = mouse.y;

    if (x0 === null || y0 === null) return;

    const rect = targetEl.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    const a = Math.atan2(cy - y0, cx - x0);
    const x1 = cx - Math.cos(a) * (rect.width / 2 + 12);
    const y1 = cy - Math.sin(a) * (rect.height / 2 + 12);

    const midX = (x0 + x1) / 2;
    const midY = (y0 + y1) / 2;
    const offset = Math.min(200, Math.hypot(x1 - x0, y1 - y0) * 0.5);
    const t = Math.max(-1, Math.min(1, (y0 - y1) / 200));
    const controlX = midX;
    const controlY = midY + offset * t;

    const r = Math.sqrt((x1 - x0) ** 2 + (y1 - y0) ** 2);
    // Increase max opacity to 1 (fully opaque) and adjust divisor for quicker ramp-up
    const opacity = Math.min(
      1.0,
      (r - Math.max(rect.width, rect.height) / 2) / 500
    );

    const arrowColor = resolvedCanvasColorsRef.current.strokeStyle;
    ctx.strokeStyle = `rgba(${arrowColor.r}, ${arrowColor.g}, ${arrowColor.b}, ${opacity})`;
    // Increase line width for more visibility
    ctx.lineWidth = 2; // Changed from 1.5 to 2

    // Draw curve
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.quadraticCurveTo(controlX, controlY, x1, y1);
    // Adjust dash pattern for thicker line: longer dashes, similar gap
    ctx.setLineDash([10, 5]); // e.g., 10px dash, 5px gap
    ctx.stroke();
    ctx.restore();

    // Draw arrowhead
    const angle = Math.atan2(y1 - controlY, x1 - controlX);
    // Scale arrowhead with line width, base size 10 for lineWidth 1.5
    const headLength = 10 * (ctx.lineWidth / 1.5);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(
      x1 - headLength * Math.cos(angle - Math.PI / 6),
      y1 - headLength * Math.sin(angle - Math.PI / 6)
    );
    ctx.moveTo(x1, y1);
    ctx.lineTo(
      x1 - headLength * Math.cos(angle + Math.PI / 6),
      y1 - headLength * Math.sin(angle + Math.PI / 6)
    );
    ctx.stroke();
  }, [targetRef]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !targetRef.current) return;

    ctxRef.current = canvas.getContext("2d");
    const ctx = ctxRef.current;

    const updateCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener("resize", updateCanvasSize);
    window.addEventListener("mousemove", handleMouseMove);
    updateCanvasSize();

    const animateLoop = () => {
      if (ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawArrow();
      }
      animationFrameIdRef.current = requestAnimationFrame(animateLoop);
    };

    animateLoop();

    return () => {
      window.removeEventListener("resize", updateCanvasSize);
      window.removeEventListener("mousemove", handleMouseMove);
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [drawArrow]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-10 ${className}`}
    />
  );
};
