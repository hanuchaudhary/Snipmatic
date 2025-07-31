"use client";

import React from "react";
import { TaskCard } from "./TaskCard";
import { Task } from "../../types/task";

// Sample data for testing
const sampleTasks: Task[] = [
  // Manual clip task
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
        reason: "Strong hook with promise of explanation, perfect for retention",
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
];

export const TaskCardExamples: React.FC = () => {
  return (
    <div className="space-y-6 p-6">
      <h2 className="text-2xl font-bold mb-4">Task Cards Examples</h2>
      <div className="space-y-4">
        {sampleTasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
};

export default TaskCardExamples;
