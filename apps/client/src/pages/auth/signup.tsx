import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "motion/react";
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
import {
  SocialAuth
} from "@/components/ui/social-auth";
import { signUp } from "@/lib/auth/auth.client";
import { AuthLayout } from "./layout";
import { Input } from "@/components/ui/input";

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
    <AuthLayout rightMessage="Join the waitlist|and be the first to know when we launch">
      <div className="relative h-full w-full flex flex-col justify-center items-center">
        <AnimatePresence mode="wait" initial={false}>
          {verificationEmail ? (
            <motion.div
              key="verify-email-state"
              className="space-y-4 w-full"
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
                <Button className="w-full" variant={"rounded"} size={"lg"} onClick={() => navigate("/login")}>
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
              className="space-y-3 w-full"
            >
              <SocialAuth mode="signup" />

              <div className="flex items-center gap-3 justify-center">
                <span className="subheading text-[1.2rem]! text-muted-foreground!">
                  or
                </span>
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
                    {isLoading ? "Creating account..." : "Sign up"}
                  </Button>
                </form>
              </Form>
            </motion.div>
          )}
        </AnimatePresence>
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
    </AuthLayout>
  );
}
