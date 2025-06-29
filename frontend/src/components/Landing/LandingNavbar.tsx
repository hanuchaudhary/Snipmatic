import React from "react";
import { Button } from "../ui/button";
import Link from "next/link";
import { Logo } from "../Logo";

export default function LandingNavbar() {
  return (
    <header className="fixed w-full left-1/2 -translate-x-1/2 my-4 rounded-3xl top-0 z-50 dark:bg-neutral-950/30 max-w-7xl mx-auto backdrop-blur-xl bg-white/80">
      <div className="md:px-8 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link className="flex items-center justify-center gap-1.5" href={"/"}>
            <Logo />
            <span className="md:text-xl text-lg font-semibold">Snipmatic.</span>
          </Link>
        </div>
        <div className="flex gap-2">
          <button
            style={{
              boxShadow: "rgba(255, 255, 255, 0.16) 0px 2px 6px -2px inset",
            }}
            className="border hover:scale-105 transition-transform px-5 py-2 rounded-xl font-semibold bg-neutral-900 text-muted-foreground cursor-pointer flex items-center gap-2"
          >
            Join
          </button>
        </div>
      </div>
    </header>
  );
}
