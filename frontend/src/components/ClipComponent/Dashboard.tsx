"use client";

import React, { useState } from "react";
import { DashboardTabSwitch } from "./DasboardTabSwitch";
import { AnimatePresence, motion } from "motion/react";

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<"COMPLETED" | "PROCESSING">(
    "PROCESSING"
  );
  return (
    <div className="min-h-[87vh] font-jost">
      <div className="max-w-7xl mx-auto border-2 border-muted/30 bg-secondary/40 backdrop-blur-sm rounded-[42px] h-full min-h-[80vh] p-2.5">
        <div className="max-w-7xl mx-auto border-4 rounded-4xl h-full min-h-[80vh] p-6 bg-card">
          <DashboardTabSwitch
            className="inline-flex mb-4"
            tabType={activeTab}
            setTabType={setActiveTab}
          />

          <AnimatePresence>
            {activeTab === "PROCESSING" ? (
              <motion.div
                initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                Processing Clips Content
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                Completed Clips Content
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
