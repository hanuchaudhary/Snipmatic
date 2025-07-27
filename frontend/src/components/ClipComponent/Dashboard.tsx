"use client";

import React, { useState } from "react";
import { VideoJobCard } from "./VideoJobCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  RefreshCwIcon,
  TrashIcon,
  VideoIcon,
  ClockIcon,
  CheckCircleIcon,
  AlertCircleIcon,
} from "lucide-react";
import axios from "axios";

// Mock data for jobs
type JobStatus = "processing" | "completed" | "failed";
type Job = {
  id: string;
  title: string;
  status: JobStatus;
  createdAt: string;
  updatedAt: string;
  userId: string;
  youtubeUrl: string;
  progress: number;
};

const mockJobs: Job[] = [
  {
    id: "1",
    title: "Video 1",
    status: "processing",
    createdAt: "2024-06-01T10:00:00Z",
    updatedAt: "2024-06-01T10:05:00Z",
    userId: "user1",
    youtubeUrl: "https://youtube.com/watch?v=video1",
    progress: 40,
  },
  {
    id: "2",
    title: "Video 2",
    status: "completed",
    createdAt: "2024-06-01T09:00:00Z",
    updatedAt: "2024-06-01T09:30:00Z",
    userId: "user2",
    youtubeUrl: "https://youtube.com/watch?v=video2",
    progress: 100,
  },
  {
    id: "3",
    title: "Video 3",
    status: "failed",
    createdAt: "2024-06-01T08:00:00Z",
    updatedAt: "2024-06-01T08:10:00Z",
    userId: "user3",
    youtubeUrl: "https://youtube.com/watch?v=video3",
    progress: 60,
  },
  {
    id: "4",
    title: "Video 4",
    status: "processing",
    createdAt: "2024-06-01T07:00:00Z",
    updatedAt: "2024-06-01T07:20:00Z",
    userId: "user4",
    youtubeUrl: "https://youtube.com/watch?v=video4",
    progress: 20,
  },
  {
    id: "5",
    title: "Video 5",
    status: "completed",
    createdAt: "2024-06-01T06:00:00Z",
    updatedAt: "2024-06-01T06:45:00Z",
    userId: "user5",
    youtubeUrl: "https://youtube.com/watch?v=video5",
    progress: 100,
  },
];

export function Dashboard() {
  const [activeTab, setActiveTab] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [jobs, setJobs] = useState<Job[]>(mockJobs);

  // Derived job lists
  const activeJobs = jobs.filter((job) => job.status === "processing");
  const completedJobs = jobs.filter((job) => job.status === "completed");
  const failedJobs = jobs.filter((job) => job.status === "failed");

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate refresh delay
    await new Promise((res) => setTimeout(res, 500));
    setIsRefreshing(false);
  };

  const clearCompletedJobs = () => {
    setJobs(jobs.filter((job) => job.status !== "completed"));
  };

  // Helper to render job cards or empty state
  const renderJobsList = (list: Job[], emptyText: string) =>
    list.length > 0 ? (
      <div className="grid gap-4">
        {list.map((job) => (
          <VideoJobCard
            key={job.id}
            job={{
              ...job,
              status: "COMPLETED", // Mocking status for demo
              createdAt: new Date(job.createdAt),
              updatedAt: new Date(job.updatedAt),
            }}
            onDownload={() => {
              /* TODO: implement download logic */
            }}
            onRetry={() => {
              /* TODO: implement retry logic */
            }}
            onDelete={() => {
              /* TODO: implement delete logic */
            }}
          />
        ))}
      </div>
    ) : (
      <div className="text-center text-muted-foreground">{emptyText}</div>
    );

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto border-2 border-muted bg-secondary rounded-[34px] h-full min-h-[80vh] p-2.5">
        <div className="max-w-7xl mx-auto border-4 rounded-3xl h-full min-h-[80vh] p-6 bg-card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Video Jobs Dashboard</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCwIcon
                  className={`h-4 w-4 mr-2 ${
                    isRefreshing ? "animate-spin" : ""
                  }`}
                />
                Refresh
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-muted rounded-lg p-4">
              <div className="flex items-center gap-2">
                <VideoIcon className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium">Total Jobs</span>
              </div>
              <p className="text-2xl font-bold mt-1">{jobs.length}</p>
            </div>
            <div className="bg-muted rounded-lg p-4">
              <div className="flex items-center gap-2">
                <ClockIcon className="h-5 w-5 text-orange-600" />
                <span className="text-sm font-medium">Processing</span>
              </div>
              <p className="text-2xl font-bold mt-1">{activeJobs.length}</p>
            </div>
            <div className="bg-muted rounded-lg p-4">
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium">Completed</span>
              </div>
              <p className="text-2xl font-bold mt-1">{completedJobs.length}</p>
            </div>
            <div className="bg-muted rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertCircleIcon className="h-5 w-5 text-red-600" />
                <span className="text-sm font-medium">Failed</span>
              </div>
              <p className="text-2xl font-bold mt-1">{failedJobs.length}</p>
            </div>
          </div>

          {/* Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all" className="flex items-center gap-2">
                All Jobs
                <Badge variant="secondary">{jobs.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="active" className="flex items-center gap-2">
                Processing
                <Badge variant="secondary">{activeJobs.length}</Badge>
              </TabsTrigger>
              <TabsTrigger
                value="completed"
                className="flex items-center gap-2"
              >
                Completed
                <Badge variant="secondary">{completedJobs.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="failed" className="flex items-center gap-2">
                Failed
                <Badge variant="secondary">{failedJobs.length}</Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              {renderJobsList(jobs, "No video jobs found")}
            </TabsContent>

            <TabsContent value="active" className="mt-6">
              {renderJobsList(activeJobs, "No active jobs")}
            </TabsContent>

            <TabsContent value="completed" className="mt-6">
              {renderJobsList(completedJobs, "No completed jobs")}
            </TabsContent>

            <TabsContent value="failed" className="mt-6">
              {renderJobsList(failedJobs, "No failed jobs")}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
