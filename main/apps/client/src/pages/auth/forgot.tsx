import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router";

import { zodResolver } from "@hookform/resolvers/zod";
import { AtSignIcon } from "lucide-react";
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
import { requestPasswordReset } from "@/lib/auth/auth.client";

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
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
    <div className="relative w-full overflow-hidden font-geist px-4 md:h-screen">
      <div className="relative mx-auto flex min-h-screen w-full max-w-sm flex-col justify-center border-x *:px-6">
        {!emailSent ? (
          <>
            <div className="flex flex-col space-y-2">
              <Link aria-label="Home" to="/" className="w-fit -ml-2">
                <Logo />
              </Link>
              <div className="space-y-1">
                <h1 className="font-heading text-2xl tracking-wide">
                  Forgot password?
                </h1>
                <p className="text-base text-muted-foreground">
                  Enter your email and we will send a reset link.
                </p>
              </div>
            </div>

            <div className="relative my-6 flex size-full flex-col gap-4 py-8">
              <FullWidthDivider position="top" />

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

                  <Button
                    className="w-full"

                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? "Sending..." : "Send reset link"}
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

              <FullWidthDivider position="bottom" />
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col space-y-6">
              <Link aria-label="Home" to="/" className="w-fit">
                <Logo className="h-5" />
              </Link>
              <div className="space-y-1">
                <h1 className="font-semibold text-xl tracking-wide">
                  Check your email
                </h1>
                <p className="text-base text-muted-foreground">
                  If an account exists with{" "}
                  <span className="font-medium text-foreground">
                    {form.getValues("email")}
                  </span>
                  , you will receive a password reset link shortly.
                </p>
              </div>
            </div>

            <div className="relative my-6 flex size-full flex-col gap-3 py-8">
              <FullWidthDivider position="top" />
              <Button
                variant="outline"
                onClick={() => setEmailSent(false)}
                className="w-full"
              >
                Try another email
              </Button>
              <Button className="w-full">
                <Link to="/login">Back to sign in</Link>
              </Button>
              <FullWidthDivider position="bottom" />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
