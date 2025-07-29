"use client";

import React from "react";
import { TabSwitch } from "../ui/custom-tab";

const dashboardTypes = [
  { key: "PROCESSING", label: "Processing" },
  { key: "COMPLETED", label: "Completed" },
];

type tabType = "PROCESSING" | "COMPLETED";

interface DashboardTabSwitchProps {
  tabType: tabType;
  setTabType: React.Dispatch<React.SetStateAction<tabType>>;
  className?: string;
}

export const DashboardTabSwitch = ({
  tabType,
  setTabType,
  className,
}: DashboardTabSwitchProps) => {
  return (
    <TabSwitch
      tabs={dashboardTypes}
      activeTab={tabType}
      onTabChange={setTabType}
      className={className}
      layoutId="activeClipType"
    />
  );
};
