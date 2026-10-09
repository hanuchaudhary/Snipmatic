import type React from "react";

import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

export const TooltipButton = ({
  children,
  tooltipText,
}: {
  children: React.ReactNode;
  tooltipText: string;
}) => {
  return (
    <Tooltip>
      <TooltipTrigger>{children}</TooltipTrigger>
      <TooltipContent>{tooltipText}</TooltipContent>
    </Tooltip>
  );
};
