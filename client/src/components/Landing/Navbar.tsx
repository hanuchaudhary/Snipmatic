"use client";

import React from "react";
import Link from "next/link";
import { Logo } from "../Logo";
import { ThemeSwitcher } from "../ThemeToggle";
import { signOut, useSession } from "next-auth/react";
import { Button } from "../ui/button";
import axios from "axios";

export function Navbar() {
  const { data: session } = useSession();
  return (
    <header
      className={`fixed w-full left-1/2 -translate-x-1/2 my-4 rounded-3xl top-0 z-50  max-w-7xl mx-auto`}
    >
      <div className="md:px-8 px-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link className="flex items-center justify-center" href={"/"}>
            <img src="/icon.png" className="h-16" alt="Snipmatic Logo" />
            <span className="md:text-2xl text-lg font-semibold font-jost">
              Snipmatic
            </span>
          </Link>
          <Button variant="default" asChild>
            <Link href="/subscription">Upgrade</Link>
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <ThemeSwitcher />
          <div
            onClick={async () => {
              await fetch("http://localhost:8080/set_task", {
                credentials: "include",
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  email: session?.user?.email,
                  task_id: "test-task-id", // Replace with actual task ID
                }),
              }).catch((error) => {
                console.error("Error notifying email server:", error);
              });
            }}
          >
            <Logo />
          </div>
          {session && (
            <>
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
            </>
          )}
        </div>
      </div>
    </header>
  );
}
