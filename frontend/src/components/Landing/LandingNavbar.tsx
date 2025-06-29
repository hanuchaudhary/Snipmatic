import React from "react";
import { Button } from "../ui/button";
import Link from "next/link";
import { Logo } from "../Logo";

export default function LandingNavbar() {
  return (
    <header className="fixed w-full left-0 top-0 z-50 dark:bg-black/80 backdrop-blur-xl bg-white/80">
      <div className="md:px-8 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link className="flex items-center justify-center gap-1.5" href={"/"}>
            <Logo />
            <span className="md:text-xl text-lg font-semibold">Lumora.</span>
          </Link>
        </div>
        <div className="flex gap-2">
          <Button variant={"outline"} size={"sm"}>
            Login
          </Button>
          <Button variant="default" size={"sm"}>
            Sign Up
          </Button>
        </div>
      </div>
    </header>
  );
}
