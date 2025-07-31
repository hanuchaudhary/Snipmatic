"use client";

import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import React from "react";

const taskTypes = [
  { key: "PROCESSING", label: "Processing" },
  { key: "COMPLETED", label: "Completed" },
];

export const TaskTypeSwitch = ({
  taskType,
  setTaskType,
}: {
  taskType: "COMPLETED" | "PROCESSING";
  setTaskType: React.Dispatch<React.SetStateAction<"COMPLETED" | "PROCESSING">>;
}) => {
  return (
    <div
      onClick={() => setTaskType(taskType === "COMPLETED" ? "PROCESSING" : "COMPLETED")}
      className={cn(
        "cursor-pointer relative flex h-12 rounded-full bg-secondary p-1 font-jost ring-1 ring-border"
      )}
    >
      {taskTypes.map(({ key, label }) => {
        const isActive = taskType === key;
        return (
          <button
            type="button"
            key={key}
            className="relative rounded-full cursor-pointer"
            aria-label={label}
          >
            {isActive && (
              <motion.div
                layoutId="activeTaskType"
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
