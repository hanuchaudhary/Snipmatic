import { Logo } from "@/components/logo";

interface SessionPageLoaderProps {
  message?: string;
}

export function SessionPageLoader({
  message = "Loading your session...",
}: SessionPageLoaderProps) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Logo
          className="animate-spin animation-duration-[1.8s]"
        />
        <p className="text-sm text-muted-foreground font-medium">{message}</p>
      </div>
    </div>
  );
}