import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, Navigate, useNavigate } from "react-router";

import { zodResolver } from "@hookform/resolvers/zod";
import { AtSignIcon, LockIcon } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { FullWidthDivider } from "@/components/full-width-divider";
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
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { SessionPageLoader } from "@/components/ui/session-page-loader";
import { SocialAuth } from "@/components/ui/social-auth";
import { signIn, useSession } from "@/lib/auth/auth.client";

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
    <div className="relative w-full overflow-hidden font-geist px-4 md:h-screen">
      <div className="relative mx-auto flex min-h-screen w-full max-w-sm flex-col justify-center border-x *:px-6">
        <div className="flex flex-col space-y-2">
          <Link aria-label="Home" to="/" className="w-fit -ml-2">
            <Logo />
          </Link>
          <div className="space-y-1">
            <h1 className="font-heading text-2xl tracking-wide">
              Hey, welcome!
            </h1>
            <p className="text-base text-muted-foreground">
              Log in to your StillUp account.
            </p>
          </div>
        </div>

        <div className="relative my-6 flex size-full flex-col gap-4 py-8">
          <FullWidthDivider position="top" />

          <SocialAuth mode="signin" />

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
              or
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <InputGroup>
                        <InputGroupInput
                          aria-label="Email address"
                          placeholder="your.email@example.com"
                          type="email"
                          {...field}
                        />
                        <InputGroupAddon align="inline-start">
                          <AtSignIcon />
                        </InputGroupAddon>
                      </InputGroup>
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
                      <InputGroup>
                        <InputGroupInput
                          aria-label="Password"
                          placeholder="Enter your password"
                          type="password"
                          {...field}
                        />
                        <InputGroupAddon align="inline-start">
                          <LockIcon />
                        </InputGroupAddon>
                      </InputGroup>
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
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </Form>

          <FullWidthDivider position="bottom" />
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
      </div>
    </div>
  );
}
