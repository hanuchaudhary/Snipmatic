"use client";

import React from "react";
import Link from "next/link";
import { Logo } from "../Logo";
import { ThemeSwitcher } from "../ThemeToggle";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Button } from "../ui/button";

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  return (
    <header
      className={`fixed w-full left-1/2 -translate-x-1/2 my-4 rounded-3xl top-0 -z-[0] ${
        pathname === "/"
          ? "dark:bg-neutral-950/30 bg-white/80 backdrop-blur-xl"
          : "bg-none"
      } max-w-7xl mx-auto`}
    >
      <div className="md:px-8 px-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link className="flex items-center justify-center" href={"/"}>
            <img src="/icon.png" className="h-16" alt="Snipmatic Logo" />
            <span className="md:text-2xl text-lg font-semibold font-jost">
              Snipmatic
            </span>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <ThemeSwitcher />
          <Logo />
          {session && (
            <Button
              variant="outline"
              onClick={() =>
                signOut({
                  redirectTo: "/",
                })
              }
            >
              Sign Out
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
