import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";

import { zodResolver } from "@hookform/resolvers/zod";
import { AtSignIcon, LockIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import { z } from "zod";

import { FullWidthDivider } from "@/components/full-width-divider";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { SocialAuth } from "@/components/ui/social-auth";
import { signUp } from "@/lib/auth/auth.client";

const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type SignupFormData = z.infer<typeof signupSchema>;

export function SignupPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState<string | null>(
    null
  );

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    try {
      const result = await signUp.email({
        email: data.email,
        password: data.password,
        name: data.email.split("@")[0],
      });

      if (result.error) {
        const msg = result.error.message ?? "";
        if (
          result.error.status === 422 ||
          msg.toLowerCase().includes("already") ||
          msg.toLowerCase().includes("exists")
        ) {
          toast.error(
            "An account with this email already exists. Try signing in instead."
          );
        } else {
          toast.error(msg || "Failed to create account");
        }
        return;
      }

      if (!result.data?.token) {
        toast.info(
          "Account already exists. Check your email for a verification link, or sign in."
        );
        setVerificationEmail(data.email);
        return;
      }

      setVerificationEmail(data.email);
    } catch {
      toast.error("An error occurred during signup");
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
              {verificationEmail ? "Verify your email" : "Create your account"}
            </h1>
            <p className="text-base text-muted-foreground">
              {verificationEmail
                ? "A verification email has been sent to your inbox. Please check your email and click the verification link to complete your signup."
                : "Sign up with your email address to get started."}
            </p>
          </div>
        </div>

        <div className="relative my-6 flex size-full flex-col gap-4 py-8">
          <FullWidthDivider position="top" />

          <AnimatePresence mode="wait" initial={false}>
            {verificationEmail ? (
              <motion.div
                key="verify-email-state"
                className="space-y-4"
                initial={{ opacity: 0, filter: "blur(10px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, filter: "blur(10px)" }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <p className="text-sm text-muted-foreground">
                  Verify email sent to{" "}
                  <span className="text-foreground">{verificationEmail}</span>.
                </p>
                <div className="flex flex-col gap-2">
                  <Button className="w-full" onClick={() => navigate("/login")}>
                    Go to login
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() =>
                      window.open(
                        "https://mail.google.com",
                        "_blank",
                        "noopener,noreferrer"
                      )
                    }
                  >
                    Open Gmail
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="signup-form-state"
                initial={{ opacity: 0, filter: "blur(10px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, filter: "blur(10px)" }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="space-y-3"
              >
                <SocialAuth mode="signup" />

                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
                    or
                  </span>
                  <div className="h-px flex-1 bg-border" />
                </div>

                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-3"
                  >
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
                                placeholder="Create a password"
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
                      className="w-full"

                      type="submit"
                      disabled={isLoading}
                    >
                      {isLoading ? "Creating account..." : "Sign up"}
                    </Button>
                  </form>
                </Form>
              </motion.div>
            )}
          </AnimatePresence>

          <FullWidthDivider position="bottom" />
        </div>

        {!verificationEmail && (
          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              to="/login"
              className="underline underline-offset-4 hover:text-primary"
            >
              Sign in
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
