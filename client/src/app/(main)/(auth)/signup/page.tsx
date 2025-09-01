import React from "react";
import RegisterForm from "@/components/Auth/RegisterForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up - Snipmatic",
  description: "Create your Snipmatic account",
};

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <RegisterForm />
    </div>
  );
}
