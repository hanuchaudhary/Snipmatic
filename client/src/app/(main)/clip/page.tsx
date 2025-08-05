import { CreateClipPage } from "@/components/ClipComponent/CreateClip";
import { Dashboard } from "@/components/ClipComponent/Dashboard";
import React from "react";

export default function Page() {
  return (
    <main>
      <CreateClipPage />
      <div className="h-[calc(100vh-8rem)] relative">
        <div className="absolute md:-top-10 w-full">
          <Dashboard />
        </div>
      </div>
    </main>
  );
}
