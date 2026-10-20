import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { CreateClip } from "@/components/clip/create-clip";
import { TaskTypeSwitch } from "@/components/clip/dasboard-tab";
import TaskCard from "@/components/clip/task-card";
import { ClipApi } from "@/lib/api";
import { Features } from "@/components/ui/features";

const PROCESSING_STATUSES = new Set([
  "QUEUED",
  "DOWNLOADING",
  "PREPROCESSING",
  "TRANSCRIBING",
  "DIARIZING",
  "DETECTING_FACES",
  "TRACKING",
  "ANALYZING",
  "FINDING_CLIPS",
]);

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<"COMPLETED" | "PROCESSING">(
    "PROCESSING"
  );
  const status = activeTab;
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["clips", status],
    queryFn: () => ClipApi.list(status),
    refetchInterval: (query) => {
      const projects = query.state.data?.projects ?? [];
      return status === "PROCESSING" && projects.some((project) =>
        PROCESSING_STATUSES.has(project.status)
      )
        ? 3_000
        : false;
    },
  });

  const projects = data?.projects ?? [];

  return (
    <div className="w-full px-8 overflow-hidden">
      <CreateClip />
      <Features />
      <div className="md:py-20">
        <div className="flex items-center justify-between mb-2">
          <TaskTypeSwitch taskType={activeTab} setTaskType={setActiveTab} />
          <span className="text-sm">
            {activeTab === "PROCESSING"
              ? `${projects.length} processing`
              : `${projects.length} completed`}
          </span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="text-muted-foreground">Loading tasks...</div>
          </div>
        ) : isError ? (
          <div className="text-center text-destructive py-12">
            {error instanceof Error ? error.message : "Could not load projects."}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">
            {activeTab === "PROCESSING"
              ? "No tasks are currently being processed."
              : "No completed tasks found."}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 md:gap-4 gap-2">
            {projects.map((project) => (
              <TaskCard task={project} key={project.id} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
