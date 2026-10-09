import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, Navigate, useNavigate } from "react-router";

import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";

import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { SessionPageLoader } from "@/components/ui/session-page-loader";
import { SocialAuth } from "@/components/ui/social-auth";
import { signIn, useSession } from "@/lib/auth/auth.client";
import { AuthLayout } from "./layout";
import { Input } from "@/components/ui/input";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
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
    <AuthLayout rightMessage="Join the waitlist|and be the first to know when we launch">
      <div className="flex flex-col space-y-2">
        <Link aria-label="Home" to="/" className="w-fit">
          <Logo />
        </Link>
        <div className="space-y-2">
          <h1 className="heading">
            Hey, welcome!
          </h1>
          <p className="subheading">
            Log in to your account
          </p>
        </div>
      </div>

      <div className="relative my-8 flex w-full flex-col gap-4 py-8">
        <SocialAuth mode="signin" />

        <div className="flex items-center gap-3 justify-center">
          <span className="subheading text-[1.2rem]! text-muted-foreground!">
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
                    <Input
                      autoFocus
                      aria-label="Email address"
                      placeholder="kushchaudharyog@gmail.com"
                      className="border shadow-none ring-0 focus-visible:ring-0 aria-invalid:ring-0 dark:bg-transparent h-10 px-4 text-[1rem]! font-light"
                      type="email"
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
                    <Input
                      aria-label="Password"
                      placeholder="********"
                      className="border shadow-none ring-0 focus-visible:ring-0 aria-invalid:ring-0 dark:bg-transparent h-10 px-4 text-[1rem]! font-light"
                      type="password"
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

            <Button
              className="w-full"
              type="submit"
              size={"lg"}
              variant={"rounded"}
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </Form>
      </div>

      <div className="text-center text-sm text-muted-foreground">
        Don't have an account?{" "}
        <Link
          to="/signup"
          className="underline underline-offset-4 hover:text-primary"
        >
          Create one
        </Link>
      </div>

    </AuthLayout>
  );
}
