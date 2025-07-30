"use client";

import React from "react";
import { TaskCard } from "./TaskCard";
import { Task } from "../../types/task";

// Demo component showing both manual and AI tasks
export const TaskCardDemo: React.FC = () => {
  const demoTasks: Task[] = [
    // Manual Task
    {
      id: "demo-manual",
      title: "JavaScript Fundamentals - Variables and Functions",
      youtubeUrl: "https://www.youtube.com/watch?v=W6NZfCO5SIk",
      duration: 1800, // 30 minutes
      quality: "1080p",
      createdAt: "2025-01-29T10:00:00Z",
      completedAt: "2025-01-29T10:05:00Z",
      status: "COMPLETED",
      clipType: "MANUAL",
      startTime: 600, // Start at 10 minutes
      endTime: 780, // End at 13 minutes
      aspectRatio: "16:9",
    },
    // AI Task with Viral Moments
    {
      id: "demo-ai",
      title: "Building a Full-Stack App in 2025 - Mind-Blowing Tips!",
      youtubeUrl: "https://www.youtube.com/watch?v=PkZNo7MFNFg",
      duration: 3600, // 1 hour
      quality: "4K",
      createdAt: "2025-01-29T09:00:00Z",
      completedAt: "2025-01-29T09:45:00Z",
      status: "COMPLETED",
      clipType: "AI",
      multipleClips: true,
      aspectRatio: "9:16",
      viralMoments: [
        {
          start_time: 245.5,
          end_time: 280.0,
          content: "Wait, this changes everything I thought I knew about React!",
          reason: "Shows genuine surprise and discovery moment that creates strong engagement",
          confidence_score: 0.94,
        },
        {
          start_time: 1820.0,
          end_time: 1865.5,
          content: "Here's the secret that senior developers don't want you to know",
          reason: "Creates curiosity gap with authority positioning, perfect for viral content",
          confidence_score: 0.89,
        },
        {
          start_time: 2950.2,
          end_time: 2985.8,
          content: "This one line of code saved me 3 hours of debugging",
          reason: "Practical value proposition with clear benefit, highly shareable",
          confidence_score: 0.87,
        },
      ],
    },
    // Processing Task
    {
      id: "demo-processing",
      title: "Advanced TypeScript Patterns You Need to Know",
      youtubeUrl: "https://www.youtube.com/watch?v=VGu1vDAzGkY",
      duration: 2700, // 45 minutes
      quality: "1080p",
      createdAt: "2025-01-29T11:30:00Z",
      status: "PROCESSING",
      clipType: "AI",
      multipleClips: false,
      aspectRatio: "16:9",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Task Cards Demo</h1>
        <p className="text-muted-foreground">
          Interactive task cards with detailed popups for manual and AI clip processing
        </p>
      </div>
      
      <div className="space-y-4">
        {demoTasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>

      <div className="mt-8 p-4 bg-muted/30 rounded-lg">
        <h3 className="font-semibold mb-2">Features Demonstrated:</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• YouTube thumbnail extraction and display</li>
          <li>• Manual clip timing information (start/end times)</li>
          <li>• AI-generated viral moments with confidence scores</li>
          <li>• Detailed popup views for complete task information</li>
          <li>• Responsive design for mobile and desktop</li>
          <li>• Status indicators and clip type badges</li>
        </ul>
      </div>
    </div>
  );
};

export default TaskCardDemo;
