"use client";

import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import React from "react";

interface TabOption {
  key: string;
  label: string;
}

interface TabSwitchProps<T extends string> {
  tabs: TabOption[];
  activeTab: T;
  onTabChange: (tab: T) => void;
  className?: string;
  layoutId?: string;
}

export const TabSwitch = <T extends string>({
  tabs,
  activeTab,
  onTabChange,
  className,
  layoutId = "activeTab",
}: TabSwitchProps<T>) => {
  return (
    <div
      className={cn(
        "cursor-pointer relative flex h-12 rounded-full bg-secondary p-1 font-jost ring-1 ring-border",
        className
      )}
    >
      {tabs.map(({ key, label }) => {
        const isActive = activeTab === key;
        return (
          <button
            type="button"
            key={key}
            onClick={() => onTabChange(key as T)}
            className="relative rounded-full cursor-pointer"
            aria-label={label}
          >
            {isActive && (
              <motion.div
                layoutId={layoutId}
                className="absolute inset-0 rounded-full bg-primary"
                transition={{ type: "spring", duration: 0.5 }}
              />
            )}
            {
              <span
                className={cn(
                  "relative m-auto px-4 font-[500]",
                  isActive ? "text-primary-foreground" : "text-muted-foreground"
                )}
              >
                {label}
              </span>
            }
          </button>
        );
      })}
    </div>
  );
};
