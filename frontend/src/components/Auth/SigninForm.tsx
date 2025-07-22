"use client";

import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  signinSchema,
  type SigninFormData,
} from "@/validations/zodValidations";
import { OrContinue } from "./OrContinue";
import { GoogleSignin } from "./GoogleSignin";
import { useForm } from "react-hook-form";

export default function SigninForm() {
  const form = useForm<SigninFormData>({
    resolver: zodResolver(signinSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: SigninFormData) => {
    try {
      console.log("Signin data:", data);
      await signIn("resend", {
        email: data.email,
        callbackUrl: "/",
        redirectTo: "/clip",
      });
    } catch (error) {
      console.error("Signin error:", error);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6 font-jost">
      <div>
        <div className="text-4xl text-center font-instrumental font-normal">
          Sign In
        </div>
        <p className="text-center font-jost dark:text-neutral-200">
          Enter your email to receive a magic link
        </p>
      </div>
      <Card>
        <CardContent className="space-y-4 px-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder="email"
                        type="email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting
                  ? "Sending magic link..."
                  : "Send Magic Link"}
              </Button>
            </form>
          </Form>

          {/* <div className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="underline hover:text-primary">
              Register
            </Link>
          </div> */}
        </CardContent>
      </Card>
      <div className="relative">
        <OrContinue />
        <GoogleSignin />
      </div>
    </div>
  );
}
