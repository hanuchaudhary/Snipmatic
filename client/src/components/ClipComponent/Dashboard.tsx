"use client";

import React, { useState, useEffect } from "react";
import { TaskTypeSwitch } from "./DasboardTabSwitch";
import { AnimatePresence, motion } from "motion/react";
import { Task } from "@/types/task";
import TaskCard from "./TaskCard";
import axios from "axios";
import { useSnipStore } from "@/lib/snipStore";

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<"COMPLETED" | "PROCESSING">(
    "PROCESSING"
  );

  const [isLoading, setIsLoading] = useState(false);
  const { tasks, setTasks } = useSnipStore();

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`/api/task`);
      const data = (response.data.tasks as Task[]) || [];
      setTasks(data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchTasks();
  }, [activeTab]);

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
    <div className="min-h-[87vh] px-2 font-jost">
      <div className="max-w-7xl mx-auto border-2 border-muted/30 bg-secondary/40 backdrop-blur-sm md:rounded-[42px] h-full min-h-[80vh] md:p-2.5 p-1 rounded-[36px]">
        <div className="max-w-7xl mx-auto md:border-4 rounded-4xl h-full min-h-[80vh] p-6 bg-card">
          <div className="flex items-center justify-between mb-6">
            <TaskTypeSwitch taskType={activeTab} setTaskType={setActiveTab} />

            <div className="md:flex hidden items-center gap-4 text-sm text-muted-foreground">
              {activeTab === "PROCESSING" && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Live updates</span>
                </div>
              )}
              <span>
                {activeTab === "PROCESSING"
                  ? `${processingTasks.length} processing`
                  : `${completedTasks.length} completed`}
              </span>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center h-40"
              >
                <div className="text-muted-foreground">Loading tasks...</div>
              </motion.div>
            ) : activeTab === "PROCESSING" ? (
              <motion.div
                key="processing"
                initial={{ opacity: 0, filter: "blur(10px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, filter: "blur(10px)" }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="space-y-4"
              >
                {processingTasks.length > 0 ? (
                  processingTasks.map((task) => (
                    <TaskCard task={task} key={task.taskId} />
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-12">
                    {getEmptyMessage()}
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="completed"
                initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="space-y-4"
              >
                {completedTasks.length > 0 ? (
                  completedTasks.map((task) => (
                    <TaskCard task={task} key={task.taskId} />
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-12">
                    {getEmptyMessage()}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
