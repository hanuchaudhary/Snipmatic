import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, Navigate, useNavigate } from "react-router";

import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { LabelInput } from "@/components/ui/label-input";
import { SessionPageLoader } from "@/components/ui/session-page-loader";
import { SocialAuth } from "@/components/ui/social-auth";
import { signIn, useSession } from "@/lib/auth/auth.client";

import { AuthLayout } from "./layout";
import { PlasticButton } from "@/components/ui/plastic-button";

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const { data, isPending } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  if (isPending) {
    return <SessionPageLoader message="Checking your session..." />;
  }

  if (data?.user) {
    return <Navigate to="/dashboard" replace />;
  }

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await signIn.email({
        email: data.email,
        password: data.password,
        // callbackURL: "/dashboard",
        fetchOptions: {
          onSuccess: () => {
            toast.success("Logged in successfully");
            navigate("/dashboard");
          },
          onError: (error) => {
            const msg = error.error.message ?? "";
            if (error.error.status === 403) {
              toast.error("Please verify your email before logging in.");
              return;
            }
            if (
              msg.toLowerCase().includes("credential") ||
              msg.toLowerCase().includes("provider") ||
              msg.toLowerCase().includes("social")
            ) {
              toast.error(
                "This account uses Google or GitHub sign-in. Use the buttons above."
              );
              return;
            }
            toast.error(msg || "Invalid credentials");
          },
        },
        rememberMe: true,
      });
    } catch {
      toast.error("An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Welcome back"
      title="Sign in to"
      subtitle="your clip studio."
      description="Pick up where you left off and turn long videos into ready-to-post shorts."
    >
      <div className="flex w-full flex-col gap-6">
        <div>
          <p className="text-2xl font-light tracking-tight">Sign in</p>
          <p className="mt-2 subheading text-[1.05rem]!">
            Use your email or continue with Google.
          </p>
        </div>

        <SocialAuth mode="signin" />

        <div className="flex items-center gap-3 justify-center">
          <span className="subheading text-[1.1rem]! text-muted-foreground!">
            or
          </span>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
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

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <LabelInput
                      label="Password"
                      type="password"
                      autoComplete="current-password"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="pt-1 text-right text-xs">
                    <Link
                      to="/forgot-password"
                      className="underline underline-offset-4 hover:text-primary"
                    >
                      Forgot password?
                    </Link>
                  </FormDescription>
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
              {isLoading ? "Signing in..." : "Sign in"}
            </PlasticButton>
          </form>
        </Form>

        <div className="text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="underline underline-offset-4 hover:text-primary"
          >
            Create one
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
