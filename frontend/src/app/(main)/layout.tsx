import { DashboardNavbar } from "@/components/Dashboard/DashboardNavbar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Snipmatic. | Dashboard",
  description: "Dashboard for Snipmatic.",
};

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <div className={`dark:bg-black bg-white w-full`}>
        <DashboardNavbar />
        <div className="max-w-5xl mx-auto px-4">{children}</div>
      </div>
  );
}
