import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router";

import { zodResolver } from "@hookform/resolvers/zod";
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
import { requestPasswordReset } from "@/lib/auth/auth.client";
import { AuthLayout } from "./layout";
import { Input } from "@/components/ui/input";

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
    <AuthLayout rightMessage="Forgot your password?|We'll send you a reset link.">
      {!emailSent ? (
        <>
          <div className="relative h-full w-full flex flex-col justify-center items-center">
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
                          className="border shadow-none ring-0 focus-visible:ring-0 aria-invalid:ring-0 dark:bg-transparent h-10 px-4 text-[1rem]! font-light"
                          placeholder="kushchaudharyog@gmail.com"
                          type="email"
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
                  {isLoading ? "Sending..." : "Send reset link"}
                </Button>
              </form>
            </Form>

            <div className="text-center text-sm text-muted-foreground mt-6">
              <Link
                to="/login"
                className="underline underline-offset-4 hover:text-primary"
              >
                Back to sign in
              </Link>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-col space-y-2">
            <Link aria-label="Home" to="/" className="w-fit">
              <Logo />
            </Link>
            <div className="space-y-2">
              <h1 className="heading">
                Check your email
              </h1>
              <p className="subheading">
                If an account exists with{" "}
                <span className="font-medium text-foreground">
                  {form.getValues("email")}
                </span>
                , you will receive a password reset link shortly.
              </p>
            </div>
          </div>

          <div className="relative my-8 flex w-full flex-col gap-3 py-8">
            <Button
              variant="outline"
              onClick={() => setEmailSent(false)}
              className="w-full"
            >
              Try another email
            </Button>
            <Button className="w-full" variant={"rounded"}>
              <Link to="/login">Back to sign in</Link>
            </Button>
          </div>
        </>
      )}
    </AuthLayout>
  );
}
