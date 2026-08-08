import { Toaster } from "sonner";

import { ThemeProvider } from "./theme-provider";

export const Provider = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="theme">
      {children}
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
