import { Toaster } from "sonner";

import { TooltipProvider } from "../ui/tooltip";
import { ThemeProvider } from "./theme-provider";
import { SidebarProvider } from "../ui/sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: true,
    },
  },
});

export const Provider = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="theme">
        <TooltipProvider>
          <SidebarProvider defaultOpen={false}>{children}</SidebarProvider>
        </TooltipProvider>
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
    </QueryClientProvider>
  );
};
