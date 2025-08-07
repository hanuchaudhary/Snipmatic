import { CreateClipPage } from "@/components/ClipComponent/CreateClip";
import { Dashboard } from "@/components/ClipComponent/Dashboard";
import React from "react";

export default function Page() {
  return (
    <main>
      <CreateClipPage />
      <Dashboard />
    </main>
  );
}
