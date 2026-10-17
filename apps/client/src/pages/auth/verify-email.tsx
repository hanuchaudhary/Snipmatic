import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";

import { IconCircleCheckFilled, IconRefreshAlert } from "@tabler/icons-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { verifyEmail } from "@/lib/auth/auth.client";

import { AuthLayout } from "./layout";

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const handleVerify = async () => {
    if (!token) {
      toast.error("Verification token is missing");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await verifyEmail({
        query: {
          token,
        },
      });

      if (error) {
        toast.error(error.message || "Verification link is invalid or expired");
        return;
      }

      setIsVerified(true);
      toast.success("Email verified successfully");
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const isTokenMissing = !token;

  return (
    <AuthLayout
      eyebrow="Almost there"
      title={isVerified ? "Email verified," : "Verify your"}
      subtitle={isVerified ? "you're ready to go." : "email address."}
      description={
        isVerified
          ? "Your account is active. We're taking you to your dashboard."
          : "Confirm your email address to activate your account and start creating clips."
      }
      points={
        isVerified
          ? []
          : [
              "Verification keeps your account secure",
              "You can resend the email any time",
              "Verify once and you're in",
            ]
      }
    >
      <div className="flex w-full flex-col gap-6">
        {!isVerified ? (
          <>
            <div>
              <p className="text-2xl font-light tracking-tight">Verify email</p>
              <p className="mt-2 subheading text-[1.05rem]!">
                Confirm your email to activate your account.
              </p>
            </div>

            <div className="flex w-full flex-col gap-3">
              <Button
                className="w-full"
                variant={"rounded"}
                size={"lg"}
                onClick={handleVerify}
                disabled={isLoading || isTokenMissing}
              >
                {isLoading ? "Verifying..." : "Verify email"}
              </Button>

              {isTokenMissing ? (
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/signup">
                    <IconRefreshAlert data-icon="inline-start" />
                    Sign up again
                  </Link>
                </Button>
              ) : null}

              <Button variant="outline" className="w-full" asChild>
                <Link to="/login">Back to sign in</Link>
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col items-center gap-4 text-center">
              <IconCircleCheckFilled className="h-12 w-12 text-emerald-500" />
              <div>
                <p className="text-2xl font-light tracking-tight">
                  Email verified
                </p>
                <p className="mt-2 subheading text-[1.05rem]!">
                  Redirecting you to your dashboard.
                </p>
              </div>
            </div>

            <Button
              onClick={() => navigate("/dashboard")}
              className="w-full"
              variant={"rounded"}
              size={"lg"}
            >
              Continue to dashboard
            </Button>
          </>
        )}
      </div>
    </AuthLayout>
  );
}
