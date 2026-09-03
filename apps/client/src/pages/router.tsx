import { Navigate, Outlet, Route, Routes } from "react-router"

import { AdminProtectedRoute } from "@/components/admin-protected-route"
import { ProtectedRoute } from "@/components/protected-route"
import { useSession } from "@/lib/auth/auth.client"
import { SessionPageLoader } from "@/components/ui/session-page-loader"

import ForgotPassword from "./auth/forgot"
import { LoginPage } from "./auth/login"
import ResetPassword from "./auth/reset"
import { SignupPage } from "./auth/signup"
import VerifyEmailPage from "./auth/verify-email"
import { DashboardLayout } from "@/layouts/dashboard-layout"

import { AdminPage } from "./admin"
import { ClipsPage } from "./clips"
import { Dashboard } from "./dashboard"
import { Home } from "./home"
import {
    PricingCancelPage,
    PricingPage,
    PricingSuccessPage,
} from "./pricing"

function GuestRoute() {
    const { data, isPending } = useSession()

    if (isPending) {
        return <SessionPageLoader message="Checking your session..." />
    }

    if (data?.user) {
        return <Navigate to="/dashboard" replace />
    }

    return <Outlet />
}

export const Router = () => {
    return (
        <Routes>
            <Route path="/" element={<Home />} />

            <Route element={<GuestRoute />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/verify-email" element={<VerifyEmailPage />} />
            </Route>

            <Route element={<ProtectedRoute />}>
                <Route element={<DashboardLayout />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/clips" element={<ClipsPage />} />
                    <Route path="/pricing" element={<PricingPage />} />
                    <Route path="/pricing/success" element={<PricingSuccessPage />} />
                    <Route path="/pricing/cancel" element={<PricingCancelPage />} />
                    <Route element={<AdminProtectedRoute />}>
                        <Route path="/admin" element={<AdminPage />} />
                    </Route>
                </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    )
}
