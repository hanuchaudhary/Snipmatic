import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router";

import { zodResolver } from "@hookform/resolvers/zod";
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
import { requestPasswordReset } from "@/lib/auth/auth.client";

import { AuthLayout } from "./layout";
import { PlasticButton } from "@/components/ui/plastic-button";

const forgotPasswordSchema = z.object({
  email: z.email(),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword() {
  const [isLoading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setLoading(true);
    try {
      const { error } = await requestPasswordReset({
        email: data.email,
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast.error(error.message || "Failed to send reset email");
      } else {
        setEmailSent(true);
        toast.success("Password reset link sent to your email!");
      }
    } catch (error) {
      console.error(error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Account recovery"
      title="Forgot your"
      subtitle="password?"
      description="Enter the email on your account and we'll send a secure link to reset it."
      points={[
        "Reset links expire for your security",
        "We never email your current password",
        "Your clips stay safe while you reset",
      ]}
    >
      <div className="flex w-full flex-col gap-6">
        {!emailSent ? (
          <>
            <div>
              <p className="text-2xl font-light tracking-tight">
                Reset password
              </p>
              <p className="mt-2 subheading text-[1.05rem]!">
                We'll send a reset link to your inbox.
              </p>
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-3 w-full"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <LabelInput
                          autoFocus
                          label="Email address"
                          type="email"
                          autoComplete="email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <PlasticButton
                  variant="primary"
                  className="w-full rounded-full py-3"
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? "Sending..." : "Send reset link"}
                </PlasticButton>
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
            <div>
              <p className="text-2xl font-light tracking-tight">
                Check your email
              </p>
              <p className="mt-2 subheading text-[1.05rem]!">
                If an account exists with{" "}
                <span className="text-foreground">
                  {form.getValues("email")}
                </span>
                , you will receive a password reset link shortly.
              </p>
            </div>

            <div className="flex w-full flex-col gap-3">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setEmailSent(false)}
              >
                Try another email
              </Button>
              <Button className="w-full" variant={"rounded"} asChild>
                <Link to="/login">Back to sign in</Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </AuthLayout>
  );
}
