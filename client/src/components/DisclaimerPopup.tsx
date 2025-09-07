"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";

const DISCLAIMER_STORAGE_KEY = "snipmatic-disclaimer-shown";

export function DisclaimerPopup() {
  const [open, setOpen] = useState(false);
  const { data, status } = useSession();

  useEffect(() => {
    if (status === "authenticated" && data?.user) {
      const hasSeenDisclaimer = localStorage.getItem(DISCLAIMER_STORAGE_KEY);
      if (!hasSeenDisclaimer) {
        setOpen(true);
      }
    }
  }, [status, data]);

  const handleClose = () => {
    setOpen(false);
    localStorage.setItem(DISCLAIMER_STORAGE_KEY, "true");
  };

  if (status !== "authenticated" || !data?.user) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-[800px] font-mono md:p-2 p-1 md:rounded-[40px] rounded-[28px] overflow-hidden"
      >
        <div className="border md:p-2 md:rounded-4xl rounded-3xl">
          <DialogHeader className="md:px-6 px-2 pt-8 pb-4">
            <DialogTitle className="md:text-xl text-center">
              Welcome{" "}
              <span className="text-orange-400 font-instrumental tracking-wider">
                {data?.user.name
                  ? data.user.name
                  : data?.user.email?.split("@")[0]}{" "}
              </span>
              to Snipmatic Version 0.9!
            </DialogTitle>
          </DialogHeader>

          <div className="md:px-6 px-3 pb-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-center text-orange-700 dark:text-orange-300 mb-1">
                  Beta Version Notice
                </h3>
                <p className="md:text-sm text-xs text-muted-foreground">
                  This is the beta version of Snipmatic. Some features are still
                  being refined and you may encounter occasional bugs.
                </p>
              </div>

              <div>
                <h3 className="font-semibold">-- Subtitle Availability</h3>
                <p className="md:text-sm text-xs text-muted-foreground">
                  Subtitles are currently only available for AI-generated clips.
                  Manual clips do not include subtitles yet.
                </p>
              </div>
              <div>
                <h3 className="font-semibold">-- Credit Costs</h3>
                <div className="space-y-1 md:text-sm text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>• AI Clips:</span>
                    <span className="font-medium">10 credits</span>
                  </div>
                  <div className="flex justify-between">
                    <span>• Manual Clips:</span>
                    <span className="font-medium">5 credits</span>
                  </div>
                  <div className="flex justify-between">
                    <span>• Multiple Clips:</span>
                    <span className="font-medium">5 credits</span>
                  </div>
                  <div className="flex justify-between">
                    <span>• Subtitles:</span>
                    <span className="font-medium">5 credits</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold">-- Free Credits</h3>
                <p className="md:text-sm text-xs text-muted-foreground">
                  You've already received{" "}
                  <span className="font-bold text-orange-400">
                    20 free credits
                  </span>{" "}
                  to get started! Use them to explore all the features.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <Button onClick={handleClose} className="px-8">
                Got it, let's start creating!
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
