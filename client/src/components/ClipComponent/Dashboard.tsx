"use client";

import React, { useState } from "react";
import { TaskTypeSwitch } from "./DasboardTabSwitch";
import { AnimatePresence, motion } from "motion/react";
import { Task } from "@/types/task";
import TaskCard from "./TaskCard";

const sampleTasks: Task[] = [
  {
    id: "1",
    title: "How to Build a React App - Complete Tutorial",
    youtubeUrl: "https://www.youtube.com/watch?v=SqcY0GlETPk",
    duration: 3600, // 1 hour
    quality: "1080p",
    createdAt: "2025-01-15T10:30:00Z",
    completedAt: "2025-01-15T10:45:00Z",
    status: "COMPLETED" as const,
    clipType: "MANUAL" as const,
    startTime: 300, // 5 minutes
    endTime: 360, // 6 minutes
    aspectRatio: "16:9",
  },
  // AI clip task with multiple clips
  {
    id: "2",
    title: "The Future of AI in Web Development - Amazing Insights",
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    duration: 2400, // 40 minutes
    quality: "720p",
    createdAt: "2025-01-15T09:00:00Z",
    completedAt: "2025-01-15T09:30:00Z",
    status: "COMPLETED" as const,
    clipType: "AI" as const,
    multipleClips: true,
    aspectRatio: "9:16",
    viralMoments: [
      {
        start_time: 120.5,
        end_time: 165.0,
        content: "This blew my mind! I never thought AI could do this...",
        reason: "Shows genuine surprise and excitement that hooks viewers",
        confidence_score: 0.92,
      },
      {
        start_time: 890.0,
        end_time: 925.5,
        content: "Wait, that's actually insane. Let me show you why...",
        reason:
          "Strong hook with promise of explanation, perfect for retention",
        confidence_score: 0.87,
      },
      {
        start_time: 1450.2,
        end_time: 1485.8,
        content: "And that's when everything clicked for me",
        reason: "Emotional moment with personal revelation, highly relatable",
        confidence_score: 0.84,
      },
    ],
  },
  // Processing AI task
  {
    id: "3",
    title: "Building Microservices with Docker and Kubernetes",
    youtubeUrl: "https://www.youtube.com/watch?v=abc123def456",
    duration: 5400, // 1.5 hours
    quality: "4K",
    createdAt: "2025-01-15T11:00:00Z",
    status: "PROCESSING" as const,
    clipType: "AI" as const,
    multipleClips: false,
    aspectRatio: "16:9",
  },
  // Failed manual task
  {
    id: "4",
    title: "Quick JavaScript Tips",
    youtubeUrl: "https://www.youtube.com/watch?v=invalid-url",
    duration: 600, // 10 minutes
    quality: "1080p",
    createdAt: "2025-01-15T08:30:00Z",
    status: "FAILED" as const,
    clipType: "MANUAL" as const,
    startTime: 60,
    endTime: 120,
    aspectRatio: "1:1",
  },
];

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<"COMPLETED" | "PROCESSING">(
    "PROCESSING"
  );
  
  return (
    <div className="min-h-[87vh] font-jost">
      <div className="max-w-7xl mx-auto border-2 border-muted/30 bg-secondary/40 backdrop-blur-sm rounded-[42px] h-full min-h-[80vh] p-2.5">
        <div className="max-w-7xl mx-auto border-4 rounded-4xl h-full min-h-[80vh] p-6 bg-card">
          <div className="inline-flex items-center justify-between mb-4">
            <TaskTypeSwitch taskType={activeTab} setTaskType={setActiveTab} />
          </div>

          <AnimatePresence>
            {activeTab === "PROCESSING" ? (
              <motion.div
                initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                {sampleTasks
                  .filter((task) => task.status === "PROCESSING")
                  .map((task) => (
                    <TaskCard task={task} key={task.id} className="mb-4" />
                  ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="flex flex-col gap-4"
              >
                {sampleTasks
                  .filter((task) => task.status === "COMPLETED")
                  .map((task) => (
                    <TaskCard task={task} key={task.id} className="mb-4" />
                  ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
