import React from "react";
import { Logo } from "../Logo";
import Link from "next/link";
import { ThemeSwitcher } from "../ThemeToggle";

export function DashboardNavbar() {
  return (
    <div className="w-full flex items-center justify-between py-4 px-6 fixed top-0 left-1/2 -translate-x-1/2 max-w-7xl">
      <Link
        href={"/"}
        className="relative flex  items-center justify-center gap-1.5"
      >
        <Logo />
        <h1 className="text-xl font-semibold leading-none relative z-20">
          Snipmatic.
        </h1>
      </Link>
      <div className="flex items-center gap-2">
        <ThemeSwitcher />
        <Logo />
      </div>
    </div>
  );
}
