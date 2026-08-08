import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router";

import { zodResolver } from "@hookform/resolvers/zod";
import { IconCircleCheckFilled, IconRefreshAlert } from "@tabler/icons-react";
import { LockIcon } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { FullWidthDivider } from "@/components/full-width-divider";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { resetPassword } from "@/lib/auth/auth.client";

const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(6, { message: "Password must be at least 6 characters" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPassword() {
  const [isLoading, setLoading] = React.useState(false);
  const [passwordReset, setPasswordReset] = React.useState(false);
  const [tokenError, setTokenError] = React.useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams?.get("token") || null;
  const error = searchParams?.get("error") || null;

  useEffect(() => {
    if (error === "INVALID_TOKEN") {
      setTokenError(true);
      toast.error("Invalid or expired reset link");
    }
  }, [error]);

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ResetPasswordFormValues) => {
    if (!token) {
      toast.error("Reset token is missing");
      return;
    }

    setLoading(true);
    try {
      const { error } = await resetPassword({
        newPassword: data.newPassword,
        token,
      });

      if (error) {
        toast.error(error.message || "Failed to reset password");
      } else {
        setPasswordReset(true);
        toast.success("Password reset successfully!");
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      }
    } catch (error) {
      console.error(error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (tokenError) {
    return (
      <div className="relative w-full overflow-hidden px-4 md:h-screen">
        <div className="relative mx-auto flex min-h-screen w-full max-w-sm flex-col justify-center border-x *:px-6">
          <div className="flex flex-col space-y-6">
            <Link aria-label="Home" to="/" className="w-fit">
              <Logo className="h-5" />
            </Link>
            <div className="space-y-1">
              <h1 className="font-semibold text-xl tracking-wide text-destructive">
                Invalid reset link
              </h1>
              <p className="text-base text-muted-foreground">
                This password reset link is invalid or has expired.
              </p>
            </div>
          </div>

          <div className="relative my-6 flex size-full flex-col gap-3 py-8">
            <FullWidthDivider position="top" />
            <Button onClick={() => navigate("/forgot-password")} className="w-full" size="sm">
              <IconRefreshAlert data-icon="inline-start" />
              Request a new reset link
            </Button>
            <Button variant="outline" className="w-full" size="sm">
              <Link to="/login">Back to sign in</Link>
            </Button>
            <FullWidthDivider position="bottom" />
          </div>

          <p className="text-center text-muted-foreground text-sm">
            This site is protected by reCAPTCHA and the Google{" "}
            <Link className="underline underline-offset-4 hover:text-primary" to="/privacy">
              Privacy Policy
            </Link>{" "}
            and{" "}
            <Link className="underline underline-offset-4 hover:text-primary" to="/terms">
              Terms of Service
            </Link>{" "}
            apply.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden px-4 md:h-screen">
      <div className="relative mx-auto flex min-h-screen w-full max-w-sm flex-col justify-center border-x *:px-6">
        {!passwordReset ? (
          <>
            <div className="flex flex-col space-y-6">
              <Link aria-label="Home" to="/" className="w-fit">
                <Logo className="h-5" />
              </Link>
              <div className="space-y-1">
                <h1 className="font-semibold text-xl tracking-wide">Reset password</h1>
                <p className="text-base text-muted-foreground">
                  Enter your new password below.
                </p>
              </div>
            </div>

            <div className="relative my-6 flex size-full flex-col gap-4 py-8">
              <FullWidthDivider position="top" />

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                  <FormField
                    control={form.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <InputGroup>
                            <InputGroupInput
                              aria-label="New password"
                              placeholder="Enter new password"
                              type="password"
                              {...field}
                            />
                            <InputGroupAddon align="inline-start">
                              <LockIcon />
                            </InputGroupAddon>
                          </InputGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <InputGroup>
                            <InputGroupInput
                              aria-label="Confirm password"
                              placeholder="Confirm new password"
                              type="password"
                              {...field}
                            />
                            <InputGroupAddon align="inline-start">
                              <LockIcon />
                            </InputGroupAddon>
                          </InputGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full"
                    size="sm"
                    disabled={isLoading || !token}
                  >
                    {isLoading ? "Resetting..." : "Reset password"}
                  </Button>
                </form>
              </Form>

              <div className="text-center text-sm text-muted-foreground">
                <Link to="/login" className="underline underline-offset-4 hover:text-primary">
                  Back to sign in
                </Link>
              </div>

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
                <h1 className="font-semibold text-xl tracking-wide">
                  Password reset successful
                </h1>
                <p className="text-base text-muted-foreground">
                  You will be redirected to sign in in a few seconds.
                </p>
              </div>
            </div>

            <div className="relative my-6 flex size-full flex-col gap-3 py-8">
              <FullWidthDivider position="top" />
              <Button onClick={() => navigate("/login")} className="w-full" size="sm">
                Go to sign in
              </Button>
              <FullWidthDivider position="bottom" />
            </div>
          </>
        )}

        <p className="text-center text-muted-foreground text-sm">
          This site is protected by reCAPTCHA and the Google{" "}
          <Link className="underline underline-offset-4 hover:text-primary" to="/privacy">
            Privacy Policy
          </Link>{" "}
          and{" "}
          <Link className="underline underline-offset-4 hover:text-primary" to="/terms">
            Terms of Service
          </Link>{" "}
          apply.
        </p>
      </div>
    </div>
  );
}