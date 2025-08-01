"use client";

import React, { useState } from "react";
import { TaskTypeSwitch } from "./DasboardTabSwitch";
import { AnimatePresence, motion } from "motion/react";
import { Task } from "@/types/task";
import TaskCard from "./TaskCard";
import axios from "axios";


export function Dashboard() {
  const [activeTab, setActiveTab] = useState<"COMPLETED" | "PROCESSING">(
    "PROCESSING"
  );

  const [tasks, setTasks] = useState<Task[]>([]);

  React.useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get(`/api/task`);
        const data = response.data.tasks as Task[] || [];
        console.log("Fetched tasks:", data);
        
        setTasks(data);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };
    fetchTasks();
  }, [activeTab]);

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
                {tasks
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
                {tasks
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
