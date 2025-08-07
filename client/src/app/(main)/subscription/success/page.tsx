"use client";

import { Confetti } from "@/components/ui/confetti";
import confetti from "canvas-confetti";
import Link from "next/link";
import React, { useEffect } from "react";

export default function page() {
  useEffect(() => {
    const end = Date.now() + 3 * 1000; // 3 seconds
    const colors = ["#ff6600", "#ff8c00", "#ffa500", "#ffd700"];

    const frame = () => {
      if (Date.now() > end) return;

      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        startVelocity: 60,
        origin: { x: 0, y: 0.5 },
        colors: colors,
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        startVelocity: 60,
        origin: { x: 1, y: 0.5 },
        colors: colors,
      });

      requestAnimationFrame(frame);
    };

    frame();
  }, []);
  return (
    <div className="min-h-screen relative flex px-2 items-center justify-center">
      <div className="border border-muted/20 rounded-[40px] p-2 bg-muted/30 max-w-md w-full text-center">
        <div className="bg-secondary rounded-4xl p-6 space-y-4">
          <h2 className="text-2xl font-instrumental">
            Payment <span className="text-orange-400">Successful</span>
          </h2>
          <p className="text-muted-foreground font-jost">
            Thank you for your purchase! Your subscription is now active.
          </p>
          <Link href="/clip" className="text-orange-400 text-xs underline">
            Enjoy creating clips
          </Link>
        </div>
      </div>
    </div>
  );
}
