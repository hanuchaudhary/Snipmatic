"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ThemeSwitcher } from "../ThemeToggle";
import { CreditButton } from "../ui/CreditButton";
import { useSession } from "next-auth/react";
import { Button } from "../ui/button";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Signout } from "./Signout";

export function Navbar() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="fixed w-full left-1/2 -translate-x-1/2 md:my-4 top-0 z-50 max-w-7xl mx-auto md:backdrop-blur-none backdrop-blur-sm"
      >
        <div className="md:px-8 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              className="flex items-center justify-center"
              href={session?.user.id ? "/clip" : "/"}
            >
              <img
                src="/icon.png"
                className="h-12 md:h-16"
                alt="Snipmatic Logo"
              />
              <span className="md:text-xl text-lg font-semibold font-jost">
                Snipmatic
              </span>
            </Link>
            <div className="md:block hidden">
              <CreditButton />
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2">
            <ThemeSwitcher />
            {session ? (
              <Signout />
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  size={"sm"}
                  variant="outline"
                  onClick={() => router.push("/signin")}
                >
                  Sign In
                </Button>
                <Button size={"sm"} onClick={() => router.push("/signup")}>
                  Sign Up
                </Button>
              </div>
            )}
          </div>

          <div className="md:hidden">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={toggleMobileMenu}
              className="p-2 hover:bg-accent rounded-lg transition-colors"
              aria-label="Toggle mobile menu"
            >
              <AnimatePresence mode="wait">
                {isMobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X size={24} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu size={24} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
              onClick={closeMobileMenu}
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
              }}
              className="fixed top-0 right-0 w-[76vw] rounded-l-3xl h-full bg-background border-l shadow-xl z-50 md:hidden"
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-6 border-b">
                  <Link
                    className="flex items-center gap-2"
                    href="/"
                    onClick={closeMobileMenu}
                  >
                    <img src="/icon.png" className="h-8" alt="Snipmatic Logo" />
                    <span className="text-lg font-semibold font-jost">
                      Snipmatic
                    </span>
                  </Link>
                  <button
                    onClick={closeMobileMenu}
                    className="p-2 hover:bg-accent rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <nav className="flex-1 p-6">
                  <div className="space-y-4">
                    <CreditButton />
                    <div className="flex items-center justify-between">
                      <ThemeSwitcher />
                    </div>
                  </div>
                </nav>
                {session && <Signout closeMobileMenu={closeMobileMenu} />}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
