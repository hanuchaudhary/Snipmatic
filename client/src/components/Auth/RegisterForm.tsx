"use client";

import React from "react";
import { useForm } from "react-hook-form";
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
import {
  Card,
  CardContent
} from "@/components/ui/card";
import {
  registerSchema,
  type RegisterFormData,
} from "@/validations/zodValidations";
import Link from "next/link";

export default function RegisterForm() {
  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      console.log("Register data:", data);
      // Use NextAuth signIn function for email authentication
      await signIn("resend", { 
        email: data.email,
        callbackUrl: "/" 
      });
    } catch (error) {
      console.error("Registration error:", error);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6 font-jost">
      <div>
        <h2 className="text-3xl font-normal text-center font-instrumental">
          Register
        </h2>
        <p className="text-center">Enter your email to receive a magic link</p>
      </div>
      <Card className="">
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
                        placeholder="Enter your email"
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
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          
          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/signin" className="underline hover:text-primary">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}