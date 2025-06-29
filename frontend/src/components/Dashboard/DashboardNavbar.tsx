import React from "react";
import { Logo } from "../Logo";
import Link from "next/link";

export function DashboardNavbar() {
  return (
    <div className="w-full flex items-center justify-between py-4 px-6">
      <Link
        href={"/"}
        className="relative flex  items-center justify-center gap-1.5"
      >
        <Logo />
        <h1 className="text-xl font-semibold leading-none relative z-20">
          Lumora.
        </h1>
      </Link>
      <div className="flex items-center gap-2">
        <button className="border flex px-7 py-3 rounded-full transition-colors font-semibold bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer border-primary">
          User <span className="md:block hidden">{" "}profile goes here...</span>
        </button>
        <Logo />
      </div>
    </div>
  );
}
