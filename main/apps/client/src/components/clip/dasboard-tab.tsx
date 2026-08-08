"use client";

import React from "react";

import { motion } from "motion/react";

import { cn } from "@/lib/utils";

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
      onClick={() =>
        setTaskType(taskType === "COMPLETED" ? "PROCESSING" : "COMPLETED")
      }
      className={cn(
        "cursor-pointer relative flex md:h-11 h-10 rounded-full bg-secondary p-1 font-jost ring-1 ring-border"
      )}
    >
      {taskTypes.map(({ key, label }) => {
        const isActive = taskType === key;
        return (
          <button
            type="button"
            key={key}
            className={cn(
              "relative rounded-full cursor-pointer"
            )}
            aria-label={label}
          >
            {isActive && (
              <motion.div
                layoutId="activeTaskType"
                className="absolute inset-0 rounded-full bg-primary shadow-[inset_0_0_3px_rgba(255,255,255,1)]"
                transition={{ type: "spring", duration: 0.5 }}
              />
            )}
            {
              <span
                className={cn(
                  "relative m-auto md:px-4 px-2 md:text-sm text-xs",
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
