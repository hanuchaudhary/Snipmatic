"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Logo } from "../Logo";
import { ThemeSwitcher } from "../ThemeToggle";
import { signOut, useSession } from "next-auth/react";
import { Button } from "../ui/button";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

export function Navbar() {
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
        className="fixed w-full left-1/2 -translate-x-1/2 my-4 top-0 z-50 max-w-7xl mx-auto"
      >
        <div className="md:px-8 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link className="flex items-center justify-center" href={"/"}>
              <img
                src="/icon.png"
                className="h-12 md:h-16"
                alt="Snipmatic Logo"
              />
              <span className="md:text-xl text-lg font-semibold font-jost">
                Snipmatic
              </span>
            </Link>

            <div className="hidden md:block">
              <Button variant="default" size={"sm"} asChild>
                <Link href="/subscription">Upgrade</Link>
              </Button>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2">
            <ThemeSwitcher />
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={async () => {
                await axios.post("/api/task/010101");
              }}
            >
              <Logo />
            </motion.div>
            {session && (
              <Button
                size={"sm"}
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

          {/* Mobile Menu Button */}
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

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
              onClick={closeMobileMenu}
            />

            {/* Sidebar */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
              }}
              className="fixed top-0 right-0 h-full w-80 max-w-[80vw] bg-background border-l shadow-xl z-50 md:hidden"
            >
              <div className="flex flex-col h-full">
                {/* Header */}
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

                {/* Navigation Items */}
                <nav className="flex-1 p-6">
                  <div className="space-y-4">
                    {/* Upgrade Button */}
                    <motion.div whileTap={{ scale: 0.95 }} className="w-full">
                      <Button variant="default" asChild className="w-full">
                        <Link href="/subscription" onClick={closeMobileMenu}>
                          Upgrade
                        </Link>
                      </Button>
                    </motion.div>

                    {/* Divider */}
                    <div className="border-t my-4" />

                    {/* Theme Switcher */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Theme</span>
                      <ThemeSwitcher />
                    </div>

                    {/* Logo Action */}
                    <motion.div
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center justify-between cursor-pointer p-3 hover:bg-accent rounded-lg transition-colors"
                      onClick={async () => {
                        await axios.post("/api/task/010101");
                        closeMobileMenu();
                      }}
                    >
                      <span className="text-sm font-medium">Quick Action</span>
                      <Logo />
                    </motion.div>
                  </div>
                </nav>

                {/* Footer */}
                {session && (
                  <div className="p-6 border-t">
                    <Button
                      variant="outline"
                      className="w-full"
                      size={"sm"}
                      onClick={() => {
                        signOut({
                          redirectTo: "/",
                        });
                        closeMobileMenu();
                      }}
                    >
                      Sign Out
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
