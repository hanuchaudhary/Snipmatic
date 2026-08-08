import { useState } from "react";

import { CreateClip } from "@/components/clip/create-clip";

import { TaskTypeSwitch } from "../components/clip/dasboard-tab";
import TaskCard from "../components/clip/task-card";
import { dummyTasks as tasks } from "../lib/dummy";
import { Navbar } from "./landing/navbar";

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<"COMPLETED" | "PROCESSING">(
    "PROCESSING"
  );

  const [isLoading, setIsLoading] = useState(false);

  const processingTasks = tasks.filter(
    (task) => !["COMPLETED", "FAILED"].includes(task.status.toUpperCase())
  );

  const completedTasks = tasks.filter((task) =>
    ["COMPLETED", "FAILED"].includes(task.status.toUpperCase())
  );

  const getEmptyMessage = () => {
    if (activeTab === "PROCESSING") {
      return "No tasks are currently being processed.";
    }
    return "No completed tasks found.";
  };

  return (
    <div className="min-h-screen font-jost">
      <Navbar />
      <div className="mt-20 max-w-7xl mx-auto px-8">
        <CreateClip />
        <div className="py-20">
          <div className="flex items-center justify-between mb-2">
            <TaskTypeSwitch taskType={activeTab} setTaskType={setActiveTab} />
            <span className="text-sm">
              {activeTab === "PROCESSING"
                ? `${processingTasks.length} processing`
                : `${completedTasks.length} completed`}
            </span>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <div className="text-muted-foreground">Loading tasks...</div>
            </div>
          ) : activeTab === "PROCESSING" ? (
            processingTasks.length <= 0 ? (
              <div className="text-center text-muted-foreground py-12">
                {getEmptyMessage()}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 md:gap-4 gap-2">
                {processingTasks.map((task) => (
                  <TaskCard task={task} key={task.taskId} />
                ))}
              </div>
            )
          ) : (
            <div
              key="completed"
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 md:gap-4 gap-2"
            >
              {completedTasks.length > 0 ? (
                completedTasks.map((task) => (
                  <TaskCard task={task} key={task.taskId} />
                ))
              ) : (
                <div className="col-span-full text-center text-muted-foreground py-12">
                  {getEmptyMessage()}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
