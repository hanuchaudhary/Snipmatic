import { Navigate, Outlet, Route, Routes, useParams } from "react-router";

import { AdminProtectedRoute } from "@/components/admin-protected-route";
import { ProtectedRoute } from "@/components/protected-route";
import { SessionPageLoader } from "@/components/ui/session-page-loader";
import { DashboardLayout } from "@/layouts/dashboard-layout";
import { useSession } from "@/lib/auth/auth.client";

import { AdminPage } from "./admin";
import ForgotPassword from "./auth/forgot";
import ResetPassword from "./auth/reset";
import { LoginPage } from "./auth/signin";
import { SignupPage } from "./auth/signup";
import VerifyEmailPage from "./auth/verify-email";
import { ClipsPage } from "./clips";
import { Dashboard } from "./dashboard";
import { Home } from "./home";
import { getFeature } from "@/lib/features";
import {
  PricingCancelPage,
  PricingErrorPage,
  PricingPage,
  PricingSuccessPage,
} from "./pricing";
import { SettingsPage } from "./settings";

function FeatureRedirect() {
  const { slug } = useParams();
  const feature = getFeature(slug);
  return <Navigate to={feature ? `/#feature-${feature.slug}` : "/#features"} replace />;
}

function GuestRoute() {
  const { data, isPending } = useSession();

  if (isPending) {
    return <SessionPageLoader message="Checking your session..." />;
  }

  if (data?.user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

function PricingRoute() {
  const { data, isPending } = useSession();

  if (isPending) {
    return <SessionPageLoader message="Loading pricing..." />;
  }

  if (data?.user) {
    return (
      <DashboardLayout>
        <PricingPage embedded />
      </DashboardLayout>
    );
  }

  return <PricingPage />;
}

export const Router = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/features" element={<Navigate to="/#features" replace />} />
      <Route path="/features/:slug" element={<FeatureRedirect />} />
      <Route path="/pricing" element={<PricingRoute />} />

      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/pricing/success" element={<PricingSuccessPage />} />
        <Route path="/pricing/cancel" element={<PricingCancelPage />} />
        <Route path="/pricing/error" element={<PricingErrorPage />} />
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/clips" element={<ClipsPage />} />
          <Route path="/settings" element={<Navigate to="/settings/account" replace />} />
          <Route path="/settings/account" element={<SettingsPage section="account" />} />
          <Route path="/settings/billing" element={<SettingsPage section="billing" />} />
          <Route element={<AdminProtectedRoute />}>
            <Route path="/admin" element={<AdminPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
