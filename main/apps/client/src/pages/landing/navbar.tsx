import { useState } from "react";
import { Link, useLocation } from "react-router";

import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { ThemeSwitch } from "@/components/theme-switch";
import { useSession } from "@/lib/auth/auth.client";
import { ProfileDropdown } from "@/components/ui/profile-dropdown";

export function Navbar() {
  const { data: session } = useSession();
  const pathname = useLocation().pathname;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      <header
        className="absolute w-full left-1/2 -translate-x-1/2 md:my-4 top-0 z-60 max-w-7xl mx-auto md:backdrop-blur-none backdrop-blur-sm"
      >
        <div className="md:px-8 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {pathname === "/" ||
              (!session?.user && (
                <Link
                  className="flex items-center justify-center"
                  to={session?.user ? "/dashboard" : "/"}
                >
                  <img src="/logo.png" className="h-12" alt="Snipmatic Logo" />
                  <span className="md:text-xl text-lg font-jost">
                    Snipmatic
                  </span>
                </Link>
              ))}
          </div>

          <div className="hidden md:flex items-center gap-2">
            <ThemeSwitch />
            {session?.user ? pathname == "/" ? (
              <Link to="/dashboard" className="px-4 text-xs">
                Dashboard
              </Link>
            ) : null : (
              <Link
                to="/login"
                className="rounded-md px-3 py-1.5 text-smtext-muted-foreground transition-colors hover:text-primary font-jost"
              >
                Sign in
              </Link>
            )}
            <ProfileDropdown />
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
      </header>

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
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 w-[76vw] rounded-l-3xl h-full bg-background border-l shadow-xl z-50 md:hidden"
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-4 border-b">
                  <Link
                    className="flex items-center gap-2"
                    to="/"
                    onClick={closeMobileMenu}
                  >
                    <img src="/logo.png" className="h-8" alt="Snipmatic Logo" />
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

                <nav className="flex-1 p-4">
                  <div className="space-y-2 mt-4">
                    {session?.user ? (
                      <Link
                        to="/dashboard"
                        onClick={closeMobileMenu}
                        className="block rounded-md bg-primary px-3 py-2 text-sm text-background text-center"
                      >
                        Dashboard
                      </Link>
                    ) : (
                      <>
                        <Link
                          to="/login"
                          onClick={closeMobileMenu}
                          className="block rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-primary"
                        >
                          Sign in
                        </Link>
                        <Link
                          to="/signup"
                          onClick={closeMobileMenu}
                          className="block rounded-md bg-primary px-3 py-2 text-center text-sm font-bold text-background"
                        >
                          Start free
                        </Link>
                      </>
                    )}
                  </div>
                </nav>

                <div className="p-4 flex items-center justify-between border-t border-border">
                  <ThemeSwitch />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
