"use client";

import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

interface AnimatedThemeToggleProps {
  className?: string;
}

export const ThemeToggle = ({ className = "" }: AnimatedThemeToggleProps) => {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <button
      type="button"
      className={cn(
        "rounded-full scale-90 cursor-pointer transition-all duration-300 active:scale-95 p-2",
        isDark ? "bg-black text-white" : "bg-white text-black border border-neutral-200",
        className
      )}
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        fill="currentColor"
        viewBox="0 0 32 32"
        className="w-5 h-5"
      >
        <clipPath id="theme-toggle-clip">
          <motion.path
            animate={{ y: isDark ? 5 : 0, x: isDark ? -20 : 0 }}
            transition={{ ease: "easeInOut", duration: 0.35 }}
            d="M0-5h55v37h-55zm32 12a1 1 0 0025 0 1 1 0 00-25 0"
          />
        </clipPath>
        <g clipPath="url(#theme-toggle-clip)">
          <circle cx="16" cy="16" r="15" />
        </g>
      </svg>
    </button>
  );
};
