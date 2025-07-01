"use client";

import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import React from "react";
import { IconAi, IconSettingsBolt } from "@tabler/icons-react";
const clipTypes = [
  { key: "MANUAL", icon: IconSettingsBolt, label: "Manual Clip" },
  { key: "AI", icon: IconAi, label: "Magic Clip" },
];

export const CliptypeSwitch = ({
  clipType,
  setClipType,
}: {
  clipType: "AI" | "MANUAL";
  setClipType: React.Dispatch<React.SetStateAction<"AI" | "MANUAL">>;
}) => {
  return (
    <div
      onClick={() => setClipType(clipType === "AI" ? "MANUAL" : "AI")}
      className={cn(
        "cursor-pointer relative flex h-12 rounded-full bg-secondary p-1 font-jost ring-1 ring-border"
      )}
    >
      {clipTypes.map(({ key, icon: Icon, label }) => {
        const isActive = clipType === key;
        return (
          <button
            type="button"
            key={key}
            className="relative rounded-full cursor-pointer"
            aria-label={label}
          >
            {isActive && (
              <motion.div
                layoutId="activeClipType"
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
