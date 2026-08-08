import { useNavigate } from "react-router";
import { SparklesIcon } from "lucide-react";
import { toast } from "sonner";

import { signOut, useSession } from "@/lib/auth/auth.client";
import { Button } from "@/components/ui/button";

export function DashboardPage() {
  const { data } = useSession();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          toast.success("Signed out");
          navigate("/login");
        },
      },
    });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
        <SparklesIcon className="size-5" />
      </div>
      <div className="text-center">
        <h1 className="text-2xl font-black tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Welcome back, {data?.user?.name ?? data?.user?.email}
        </p>
      </div>
      <Button variant="outline" size="sm" onClick={handleSignOut}>
        Sign out
      </Button>
    </div>
  );
}
