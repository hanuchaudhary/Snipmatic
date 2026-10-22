import { useEffect, useRef, useState } from "react";
import { Link, NavLink } from "react-router";

import { IconArrowRight, IconMenu2, IconX } from "@tabler/icons-react";
import { AnimatePresence, motion } from "motion/react";

import { ProfileDropdown } from "@/components/ui/profile-dropdown";
import { useSession } from "@/lib/auth/auth.client";
import { FEATURES } from "@/lib/features";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isFeaturesOpen, setIsFeaturesOpen] = useState(false);
  const closeTimeout = useRef<number | null>(null);

  const links = [{ label: "Pricing", href: "/pricing" }];

  const cancelClose = () => {
    if (closeTimeout.current) {
      window.clearTimeout(closeTimeout.current);
      closeTimeout.current = null;
    }
  };

  const openFeatures = () => {
    cancelClose();
    setIsFeaturesOpen(true);
  };

  const selectFeature = () => {
    cancelClose();
    setIsFeaturesOpen(false);
    setIsMobileMenuOpen(false);
  };

  const closeFeatures = () => {
    cancelClose();
    closeTimeout.current = window.setTimeout(
      () => setIsFeaturesOpen(false),
      150
    );
  };

  useEffect(() => () => cancelClose(), []);

  return (
    <>
      <header
        className={cn(
          "fixed left-0 right-0 top-0 z-50 bg-background pt-6",
          isFeaturesOpen && "border-b"
        )}
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="overflow-hidden"
            initial={false}
            animate={{
              height: isFeaturesOpen ? "auto" : 64,
            }}
            transition={{
              duration: 0.25,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <div className="flex items-center justify-between px-6 md:px-0">
              <div className="flex items-center justify-center gap-16">
                <Link
                  to={session?.user ? "/dashboard" : "/"}
                  className="flex items-center"
                >
                  <img src="/logo.png" className="h-9" alt="Snipmatic Logo" />
                </Link>

                <nav className="hidden items-center gap-7 md:flex">
                  <Link
                    onMouseEnter={openFeatures}
                    onMouseLeave={closeFeatures}
                    to="/#features"
                    onClick={selectFeature}
                    className={cn(
                      "subheading transition-colors hover:text-foreground! text-base!"
                    )}
                  >
                    Features
                  </Link>

                  {links.map((link) => (
                    <NavLink
                      key={link.href}
                      to={link.href}
                      className={({ isActive }) =>
                        cn(
                          "subheading transition-colors hover:text-foreground! text-base!",
                          isActive && "text-primary"
                        )
                      }
                    >
                      {link.label}
                    </NavLink>
                  ))}
                </nav>
              </div>

              <div className="hidden items-center gap-3 md:flex">
                {session?.user ? (
                  <><Link to="/dashboard" className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground">Dashboard</Link><ProfileDropdown /></>
                ) : (
                  <NavLink
                    to="/login"
                    className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-background"
                  >
                    Sign in
                  </NavLink>
                )}
              </div>

              <button
                type="button"
                onClick={() => setIsMobileMenuOpen((open) => !open)}
                className="rounded-md p-2 hover:bg-accent md:hidden"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <IconX className="size-5" />
                ) : (
                  <IconMenu2 className="size-5" />
                )}
              </button>
            </div>

            <AnimatePresence initial={false}>
              {isFeaturesOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  onMouseEnter={cancelClose}
                  onMouseLeave={closeFeatures}
                  className="hidden md:block"
                >
                  <div className="px-8 py-10">
                    <div className="mb-8 flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        From source video to published post
                      </p>
                      <Link
                        to="/#features"
                        onClick={selectFeature}
                        className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        See the full workflow
                        <IconArrowRight className="size-4" />
                      </Link>
                    </div>

                    <div className="grid grid-cols-2 gap-x-16 gap-y-8">
                      {FEATURES.map((feature) => (
                        <Link
                          key={feature.slug}
                          to={`/#feature-${feature.slug}`}
                          onClick={selectFeature}
                          className="group flex items-start gap-4"
                        >
                          <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary/50 text-foreground transition-colors group-hover:bg-secondary">
                            <feature.icon className="size-5" />
                          </span>
                          <span className="block">
                            <span className="block text-2xl tracking-tight transition-colors group-hover:text-muted-foreground">
                              {feature.title}
                            </span>
                            <span className="mt-1 block text-sm text-muted-foreground">
                              {feature.tagline}
                            </span>
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </header>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-background pt-16 md:hidden">
          <div className="flex h-full flex-col border-t">
            <nav className="flex flex-1 flex-col overflow-y-auto p-6">
              <Link
                to="/#features"
                onClick={() => setIsMobileMenuOpen(false)}
                className="border-b py-4 text-lg"
              >
                Features
              </Link>

              {FEATURES.map((feature) => (
                <Link
                  key={feature.slug}
                  to={`/#feature-${feature.slug}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="border-b py-4 pl-4 text-base text-muted-foreground"
                >
                  {feature.title}
                </Link>
              ))}

              {links.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="border-b py-4 text-lg"
                >
                  {link.label}
                </Link>
              ))}

              <div className="mt-auto pt-6">
                {session?.user ? (
                  <Link
                    to="/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block rounded-full bg-primary px-4 py-3 text-center text-sm font-medium text-background"
                  >
                    Dashboard
                  </Link>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block rounded-full bg-primary px-4 py-3 text-center text-sm font-medium text-background"
                  >
                    Sign in
                  </Link>
                )}
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
