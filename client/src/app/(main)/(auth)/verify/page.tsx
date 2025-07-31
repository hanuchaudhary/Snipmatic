import { VerifyPage } from "@/components/Auth/VerifyPage";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Verify Email - Snipmatic",
  description: "Verify your email address to complete the registration process.",
};

export default function page() {
  return <VerifyPage />;
}
