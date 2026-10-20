import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router";

import { zodResolver } from "@hookform/resolvers/zod";
import { IconCircleCheckFilled, IconRefreshAlert } from "@tabler/icons-react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { LabelInput } from "@/components/ui/label-input";
import { resetPassword } from "@/lib/auth/auth.client";

import { AuthLayout } from "./layout";

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
      <AuthLayout
        eyebrow="Account recovery"
        title="Invalid or expired"
        subtitle="reset link."
        description="This password reset link is no longer valid. Request a new one to continue."
        points={[]}
      >
        <div className="flex w-full flex-col gap-6">
          <div>
            <p className="text-2xl font-light tracking-tight text-destructive">
              Link expired
            </p>
            <p className="mt-2 subheading text-[1.05rem]!">
              This password reset link is invalid or has expired.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              onClick={() => navigate("/forgot-password")}
              className="w-full"
              variant={"rounded"}
            >
              <IconRefreshAlert data-icon="inline-start" />
              Request a new reset link
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link to="/login">Back to sign in</Link>
            </Button>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      eyebrow="Account recovery"
      title={passwordReset ? "Password reset" : "Set a new"}
      subtitle={passwordReset ? "successful." : "password."}
      description={
        passwordReset
          ? "Your password has been updated. You can sign in with your new password now."
          : "Choose a strong password you have not used before to secure your account."
      }
      points={
        passwordReset
          ? []
          : [
              "At least 6 characters long",
              "Mix letters, numbers and symbols",
              "Never reuse a password",
            ]
      }
    >
      <div className="flex w-full flex-col gap-6">
        {!passwordReset ? (
          <>
            <div>
              <p className="text-2xl font-light tracking-tight">
                Reset password
              </p>
              <p className="mt-2 subheading text-[1.05rem]!">
                Enter your new password below.
              </p>
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-3"
              >
                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <LabelInput label="New password" type="password" autoComplete="new-password" {...field} />
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
                        <LabelInput label="Confirm password" type="password" autoComplete="new-password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  size={"lg"}
                  variant={"rounded"}
                  className="w-full"
                  disabled={isLoading || !token}
                >
                  {isLoading ? "Resetting..." : "Reset password"}
                </Button>
              </form>
            </Form>

            <div className="text-center text-sm text-muted-foreground">
              <Link
                to="/login"
                className="underline underline-offset-4 hover:text-primary"
              >
                Back to sign in
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col items-center gap-4 text-center">
              <IconCircleCheckFilled className="h-12 w-12 text-emerald-500" />
              <div>
                <p className="text-2xl font-light tracking-tight">
                  You're all set
                </p>
                <p className="mt-2 subheading text-[1.05rem]!">
                  You will be redirected to sign in in a few seconds.
                </p>
              </div>
            </div>

            <Button
              onClick={() => navigate("/login")}
              className="w-full"
              variant={"rounded"}
              size={"lg"}
            >
              Go to sign in
            </Button>
          </>
        )}

        <p className="text-center text-muted-foreground text-xs">
          This site is protected by reCAPTCHA and the Google{" "}
          <Link
            className="underline underline-offset-4 hover:text-primary"
            to="/privacy"
          >
            Privacy Policy
          </Link>{" "}
          and{" "}
          <Link
            className="underline underline-offset-4 hover:text-primary"
            to="/terms"
          >
            Terms of Service
          </Link>{" "}
          apply.
        </p>
      </div>
    </AuthLayout>
  );
}
