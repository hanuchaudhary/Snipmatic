import { cn } from "@/lib/utils";


export function Logo({ className }: { className?: string }) {
  return (
    <img src="/logo.png" alt="Logo" className={cn("w-10 h-10", className)} />
  );
}
