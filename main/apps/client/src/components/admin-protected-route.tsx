import { Navigate, Outlet, useLocation } from "react-router";

import { useSession } from "@/lib/auth/auth.client";
import { SessionPageLoader } from "@/components/ui/session-page-loader";

export function AdminProtectedRoute() {
  const { data, isPending } = useSession();
  const location = useLocation();

  if (isPending) {
    return <SessionPageLoader message="Checking your session..." />;
  }

  if (!data?.user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (data.user.role !== "ADMIN") {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
