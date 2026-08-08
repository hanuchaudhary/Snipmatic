import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";

import { IconCircleCheckFilled, IconRefreshAlert } from "@tabler/icons-react";
import { toast } from "sonner";

import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { FullWidthDivider } from "@/components/full-width-divider";
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
    <div className="relative w-full overflow-hidden font-geist px-4 md:h-screen">
      <div className="relative mx-auto flex min-h-screen w-full max-w-sm flex-col justify-center border-x *:px-6">
        {!isVerified ? (
          <>
            <div className="flex flex-col space-y-6">
              <Link aria-label="Home" to="/" className="w-fit">
                <Logo className="h-5" />
              </Link>
              <div className="space-y-1">
                <h1 className="font-heading text-2xl tracking-wide">
                  Verify your email
                </h1>
                <p className="text-base text-muted-foreground">
                  Confirm your email to activate your account.
                </p>
              </div>
            </div>

            <div className="relative my-6 flex size-full flex-col gap-3 py-8">
              <FullWidthDivider position="top" />
              <Button
                className="w-full"
                size="sm"
                onClick={handleVerify}
                disabled={isLoading || isTokenMissing}
              >
                {isLoading ? "Verifying..." : "Verify email"}
              </Button>
              {isTokenMissing ? (
                <Button variant="outline" className="w-full" size="sm">
                  <Link to="/signup">
                    <IconRefreshAlert data-icon="inline-start" />
                    Sign up again
                  </Link>
                </Button>
              ) : null}
              <Button variant="outline" className="w-full" size="sm">
                <Link to="/login">Back to sign in</Link>
              </Button>
              <FullWidthDivider position="bottom" />
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col space-y-6">
              <Link aria-label="Home" to="/" className="w-fit">
                <Logo className="h-5" />
              </Link>
              <div className="space-y-1 text-center">
                <IconCircleCheckFilled className="mx-auto h-12 w-12 text-emerald-500" />
                <h1 className="font-heading text-2xl tracking-wide">
                  Email verified
                </h1>
                <p className="text-base text-muted-foreground">
                  Redirecting you to your dashboard.
                </p>
              </div>
            </div>

            <div className="relative my-6 flex size-full flex-col gap-3 py-8">
              <FullWidthDivider position="top" />
              <Button
                onClick={() => navigate("/dashboard")}
                className="w-full"
                size="sm"
              >
                Continue to dashboard
              </Button>
              <FullWidthDivider position="bottom" />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
