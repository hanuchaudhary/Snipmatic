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
            borderRadius: "100%",
          },
        }}
      />
    </ThemeProvider>
  );
};
