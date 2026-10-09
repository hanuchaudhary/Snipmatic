import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";

import { IconCircleCheckFilled, IconRefreshAlert } from "@tabler/icons-react";
import { toast } from "sonner";

import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { verifyEmail } from "@/lib/auth/auth.client";

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
    <div className="relative flex min-h-screen w-full items-center justify-center">
      <div className="relative mx-auto flex w-full max-w-lg flex-col justify-center px-6">
        {!isVerified ? (
          <>
            <div className="flex flex-col space-y-2">
              <Link aria-label="Home" to="/" className="w-fit">
                <Logo />
              </Link>
              <div className="space-y-2">
                <h1 className="heading">
                  Verify your email
                </h1>
                <p className="subheading">
                  Confirm your email to activate your account.
                </p>
              </div>
            </div>

            <div className="relative my-8 flex w-full flex-col gap-3 py-8">
              <Button
                className="w-full"
                onClick={handleVerify}
                disabled={isLoading || isTokenMissing}
              >
                {isLoading ? "Verifying..." : "Verify email"}
              </Button>
              {isTokenMissing ? (
                <Button variant="outline" className="w-full">
                  <Link to="/signup">
                    <IconRefreshAlert data-icon="inline-start" />
                    Sign up again
                  </Link>
                </Button>
              ) : null}
              <Button variant="outline" className="w-full">
                <Link to="/login">Back to sign in</Link>
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col space-y-2">
              <Link aria-label="Home" to="/" className="w-fit">
                <Logo />
              </Link>
              <div className="space-y-2 text-center">
                <IconCircleCheckFilled className="mx-auto h-12 w-12 text-emerald-500" />
                <h1 className="heading">
                  Email verified
                </h1>
                <p className="subheading">
                  Redirecting you to your dashboard.
                </p>
              </div>
            </div>

            <div className="relative my-8 flex w-full flex-col gap-3 py-8">
              <Button onClick={() => navigate("/dashboard")} className="w-full">
                Continue to dashboard
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
