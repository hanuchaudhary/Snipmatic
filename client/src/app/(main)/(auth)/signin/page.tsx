import React from "react";
import SigninForm from "@/components/Auth/SigninForm";
import { Metadata } from "next";

export const metadata : Metadata = {
  title: "Sign In - Snipmatic",
  description: "Sign in to your Snipmatic account",
};

export default function SigninPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <SigninForm />
    </div>
  );
}
