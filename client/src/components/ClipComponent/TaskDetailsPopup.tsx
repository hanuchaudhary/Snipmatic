"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ITask } from "@/lib/types";

interface TaskDetailsPopupProps {
  task: ITask;
  children?: React.ReactNode;
}

export const TaskDetailsPopup: React.FC<TaskDetailsPopupProps> = ({
  task,
  children,
}) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children || (
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            Details
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="min-w-4xl rounded-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {" "}
            Task Details
          </DialogTitle>
        </DialogHeader>

      </DialogContent>
    </Dialog>
  );
};

export default TaskDetailsPopup;
