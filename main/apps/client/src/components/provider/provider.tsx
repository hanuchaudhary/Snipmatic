import { Toaster } from "sonner";

import { TooltipProvider } from "../ui/tooltip";
import { ThemeProvider } from "./theme-provider";

export const Provider = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="theme">
      <TooltipProvider>{children}</TooltipProvider>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            borderRadius: "200px",
            fontFamily: "var(--font-geist)",
            boxShadow: "inset 0 0 6px rgba(255,255,255,1)]",
          },
        }}
        invert
      />
    </ThemeProvider>
  );
};
